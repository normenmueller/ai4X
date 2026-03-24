import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { DoctorArgs } from "../model/types.ts";
import { logLine } from "../shared/log.ts";
import {
  CONFIG_VERSION,
  DEFAULT_CONFIG_FILE,
  MODULE_KEYS,
  directoryExists,
  expandPath,
  isMapping,
  packageRequiresNodeModules,
  resolveConfigModes,
} from "./config.ts";

type DoctorLevel = "required" | "advisory";
type DoctorStatus = "ok" | "fail";

export type DoctorCheck = {
  id: string;
  level: DoctorLevel;
  status: DoctorStatus;
  message: string;
  path?: string;
};

export type DoctorSummary = {
  required: {
    ok: number;
    fail: number;
  };
  advisory: {
    ok: number;
    fail: number;
  };
  overall: "ok" | "fail";
};

export type DoctorReport = {
  configFile: string;
  strict: boolean;
  checks: DoctorCheck[];
  summary: DoctorSummary;
};

function addDoctorCheck(
  checks: DoctorCheck[],
  id: string,
  level: DoctorLevel,
  status: DoctorStatus,
  message: string,
  checkPath?: string,
): void {
  checks.push({
    id,
    level,
    status,
    message,
    path: checkPath,
  });
}

function commandExists(commandName: string): boolean {
  const pathEnv = process.env.PATH ?? "";
  if (pathEnv.trim() === "") {
    return false;
  }
  const extensions = process.platform === "win32" ? ["", ".exe", ".cmd", ".bat"] : [""];
  const searchDirs = pathEnv.split(path.delimiter).filter((entry) => entry !== "");
  for (const dir of searchDirs) {
    for (const extension of extensions) {
      const candidate = path.join(dir, `${commandName}${extension}`);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        const stat = fs.statSync(candidate);
        if (stat.isFile()) {
          return true;
        }
      } catch {
        // continue search
      }
    }
  }
  return false;
}

export function summarizeDoctorChecks(checks: DoctorCheck[]): DoctorSummary {
  const requiredOk = checks.filter((entry) => entry.level === "required" && entry.status === "ok").length;
  const requiredFail = checks.filter((entry) => entry.level === "required" && entry.status === "fail").length;
  const advisoryOk = checks.filter((entry) => entry.level === "advisory" && entry.status === "ok").length;
  const advisoryFail = checks.filter((entry) => entry.level === "advisory" && entry.status === "fail").length;

  return {
    required: {
      ok: requiredOk,
      fail: requiredFail,
    },
    advisory: {
      ok: advisoryOk,
      fail: advisoryFail,
    },
    overall: requiredFail > 0 ? "fail" : "ok",
  };
}

export function buildDoctorReport(strict: boolean, configFile = DEFAULT_CONFIG_FILE): DoctorReport {
  const checks: DoctorCheck[] = [];
  const resolvedModules: Partial<Record<(typeof MODULE_KEYS)[number], string>> = {};
  const configBaseDir = path.dirname(configFile);

  let parsedConfig: unknown = null;
  let parsedRoot: Record<string, unknown> | null = null;
  let parsedModules: Record<string, unknown> | null = null;

  if (!fs.existsSync(configFile)) {
    addDoctorCheck(checks, "config.file", "required", "fail", "config file not found", configFile);
  } else {
    addDoctorCheck(checks, "config.file", "required", "ok", "config file found", configFile);
    try {
      parsedConfig = parse(fs.readFileSync(configFile, "utf8"));
      addDoctorCheck(checks, "config.parse", "required", "ok", "config parsed");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      addDoctorCheck(checks, "config.parse", "required", "fail", `failed to parse config: ${message}`, configFile);
    }
  }

  if (parsedConfig !== null) {
    if (typeof parsedConfig !== "object" || parsedConfig === null) {
      addDoctorCheck(checks, "config.root", "required", "fail", "root must be a mapping");
    } else {
      parsedRoot = parsedConfig as Record<string, unknown>;
      addDoctorCheck(checks, "config.root", "required", "ok", "root mapping is valid");
    }
  }

  if (parsedRoot) {
    if (parsedRoot.version === CONFIG_VERSION) {
      addDoctorCheck(checks, "config.version", "required", "ok", `version is ${CONFIG_VERSION}`);
    } else {
      addDoctorCheck(checks, "config.version", "required", "fail", `version must be ${CONFIG_VERSION}`);
    }

    const modules = parsedRoot.modules;
    if (typeof modules !== "object" || modules === null || Array.isArray(modules)) {
      addDoctorCheck(checks, "config.modules", "required", "fail", "missing modules mapping");
    } else {
      parsedModules = modules as Record<string, unknown>;
      addDoctorCheck(checks, "config.modules", "required", "ok", "modules mapping is valid");
    }
  }

  if (parsedModules) {
    for (const key of MODULE_KEYS) {
      const rawValue = parsedModules[key];
      if (typeof rawValue !== "string" || rawValue.trim() === "") {
        addDoctorCheck(checks, `modules.${key}`, "required", "fail", `missing modules.${key}`);
        continue;
      }
      const resolved = expandPath(rawValue.trim(), configBaseDir);
      if (!directoryExists(resolved)) {
        addDoctorCheck(checks, `modules.${key}`, "required", "fail", "directory not found", resolved);
        continue;
      }
      resolvedModules[key] = resolved;
      addDoctorCheck(checks, `modules.${key}`, "required", "ok", "directory found", resolved);
    }
  }

  if (parsedRoot) {
    try {
      const resolvedModes = resolveConfigModes(parsedRoot, configFile);
      let rawConfigModes: Record<string, unknown> = {};
      if (isMapping(parsedRoot.install) && isMapping(parsedRoot.install.config_mode)) {
        rawConfigModes = parsedRoot.install.config_mode;
      }

      for (const key of MODULE_KEYS) {
        if (rawConfigModes[key] === undefined) {
          addDoctorCheck(
            checks,
            `config.install.config_mode.${key}`,
            "required",
            "ok",
            `not set, fallback ${resolvedModes[key]}`,
          );
          continue;
        }
        addDoctorCheck(
          checks,
          `config.install.config_mode.${key}`,
          "required",
          "ok",
          `configured: ${resolvedModes[key]}`,
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      addDoctorCheck(checks, "config.install.config_mode", "required", "fail", message);
    }
  }

  const askSrcDir = resolvedModules.ask ? path.join(resolvedModules.ask, "src") : null;
  const kobUtlDir = resolvedModules.kob ? path.join(resolvedModules.kob, "utl", "kob") : null;
  const kobUtlSrcDir = kobUtlDir ? path.join(kobUtlDir, "src") : null;

  if (askSrcDir) {
    addDoctorCheck(
      checks,
      "layout.ask.src",
      "required",
      directoryExists(askSrcDir) ? "ok" : "fail",
      directoryExists(askSrcDir) ? "directory found" : "directory not found",
      askSrcDir,
    );
  }
  if (kobUtlDir) {
    addDoctorCheck(
      checks,
      "layout.kob.utl",
      "required",
      directoryExists(kobUtlDir) ? "ok" : "fail",
      directoryExists(kobUtlDir) ? "directory found" : "directory not found",
      kobUtlDir,
    );
  }
  if (kobUtlSrcDir) {
    addDoctorCheck(
      checks,
      "layout.kob.utl.src",
      "required",
      directoryExists(kobUtlSrcDir) ? "ok" : "fail",
      directoryExists(kobUtlSrcDir) ? "directory found" : "directory not found",
      kobUtlSrcDir,
    );
  }
  addDoctorCheck(
    checks,
    "runtime.ask.command",
    "advisory",
    commandExists("ask") ? "ok" : "fail",
    commandExists("ask") ? "ask command found in PATH" : "ask command not found in PATH",
  );
  addDoctorCheck(
    checks,
    "runtime.kob.command",
    "advisory",
    commandExists("kob") ? "ok" : "fail",
    commandExists("kob") ? "kob command found in PATH" : "kob command not found in PATH",
  );
  if (askSrcDir) {
    const askNodeModules = path.join(askSrcDir, "node_modules");
    const askPackageJson = path.join(askSrcDir, "package.json");
    if (packageRequiresNodeModules(askPackageJson)) {
      addDoctorCheck(
        checks,
        "deps.ask.node_modules",
        "advisory",
        directoryExists(askNodeModules) ? "ok" : "fail",
        directoryExists(askNodeModules) ? "node_modules found" : "node_modules not found",
        askNodeModules,
      );
    } else {
      addDoctorCheck(
        checks,
        "deps.ask.node_modules",
        "advisory",
        "ok",
        "no external dependencies declared",
        askPackageJson,
      );
    }
  }
  if (kobUtlSrcDir) {
    const kobNodeModules = path.join(kobUtlSrcDir, "node_modules");
    const kobPackageJson = path.join(kobUtlSrcDir, "package.json");
    if (packageRequiresNodeModules(kobPackageJson)) {
      addDoctorCheck(
        checks,
        "deps.kob.node_modules",
        "advisory",
        directoryExists(kobNodeModules) ? "ok" : "fail",
        directoryExists(kobNodeModules) ? "node_modules found" : "node_modules not found",
        kobNodeModules,
      );
    } else {
      addDoctorCheck(
        checks,
        "deps.kob.node_modules",
        "advisory",
        "ok",
        "no external dependencies declared",
        kobPackageJson,
      );
    }
  }
  const summary = summarizeDoctorChecks(checks);

  return {
    configFile,
    strict,
    checks,
    summary,
  };
}

export function printDoctorReport(report: DoctorReport, json: boolean, verbose: boolean): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${logLine("INFO", `config: ${report.configFile}`)}\n`);
  for (const check of report.checks) {
    if (!verbose && check.status !== "fail") {
      continue;
    }
    const statusText = check.status === "ok" ? "OK" : "FAIL";
    const detailPrefix = verbose ? `${check.id}: ` : "";
    process.stdout.write(
      `${logLine("INFO", `[${statusText}][${check.level}] ${detailPrefix}${check.message}`)}\n`,
    );
    if (check.path) {
      process.stdout.write(`${logLine("INFO", `  path: ${check.path}`)}\n`);
    }
  }
  process.stdout.write(
    `${logLine("INFO", `summary: required ok=${report.summary.required.ok}, required fail=${report.summary.required.fail}, advisory ok=${report.summary.advisory.ok}, advisory fail=${report.summary.advisory.fail}`)}\n`,
  );
  process.stdout.write(`${logLine("INFO", `result: ${report.summary.overall}`)}\n`);
}

export function runDoctor(args: DoctorArgs): number {
  const report = buildDoctorReport(args.strict);
  printDoctorReport(report, args.json, args.verbose);
  if (args.strict && report.summary.required.fail > 0) {
    return 1;
  }
  return 0;
}
