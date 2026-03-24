import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export type ModuleKey = "ask" | "kob" | "ccp" | "tcp";
export type ConfigMode = "keep" | "backup" | "force";

export type ModulePaths = {
  askDir: string;
  kobDir: string;
  ccpDir: string;
  tcpDir: string;
  askSrcDir: string;
  kobUtlDir: string;
  kobUtlSrcDir: string;
  configModes: Record<ModuleKey, ConfigMode>;
};

export const MODULE_KEYS: ModuleKey[] = ["ask", "kob", "ccp", "tcp"];
export const CONFIG_VERSION = "0.1.0";

const UTILITY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
export const DEFAULT_CONFIG_FILE = path.join(
  process.env.XDG_CONFIG_HOME ? path.resolve(process.env.XDG_CONFIG_HOME) : path.join(os.homedir(), ".config"),
  "ai4x",
  "config.yaml",
);
export const CONFIG_TEMPLATE_FILE = path.join(UTILITY_ROOT, "config.tpl.yaml");

export function expandPath(input: string, baseDir: string): string {
  const home = os.homedir();
  const replaced = input
    .replace(/^~(?=$|\/)/, home)
    .replaceAll("$HOME", home)
    .replaceAll("${HOME}", home);
  if (path.isAbsolute(replaced)) {
    return path.resolve(replaced);
  }
  return path.resolve(baseDir, replaced);
}

export function directoryExists(dir: string): boolean {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function requireDirectory(dir: string): void {
  if (!directoryExists(dir)) {
    throw new Error(`required directory not found: ${dir}`);
  }
}

function requireModulePath(modules: Record<string, unknown>, key: ModuleKey, configFile: string): string {
  const raw = modules[key];
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error(`invalid config: missing modules.${key} in ${configFile}`);
  }
  const resolved = expandPath(raw.trim(), path.dirname(configFile));
  requireDirectory(resolved);
  return resolved;
}

export function isMapping(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseConfigMode(value: unknown, location: string): ConfigMode {
  if (value === "keep" || value === "backup" || value === "force") {
    return value;
  }
  throw new Error(`invalid config: ${location} must be keep|backup|force`);
}

export function resolveConfigModes(root: Record<string, unknown>, configFile: string): Record<ModuleKey, ConfigMode> {
  const modes: Record<ModuleKey, ConfigMode> = {
    ask: "keep",
    kob: "keep",
    ccp: "keep",
    tcp: "keep",
  };

  const installRaw = root.install;
  if (installRaw === undefined) {
    return modes;
  }
  if (!isMapping(installRaw)) {
    throw new Error(`invalid config: install must be a mapping (${configFile})`);
  }

  const configModeRaw = installRaw.config_mode;
  if (configModeRaw === undefined) {
    return modes;
  }
  if (!isMapping(configModeRaw)) {
    throw new Error(`invalid config: install.config_mode must be a mapping (${configFile})`);
  }

  for (const key of Object.keys(configModeRaw)) {
    if (!MODULE_KEYS.includes(key as ModuleKey)) {
      throw new Error(
        `invalid config: unknown install.config_mode.${key} in ${configFile} (expected ask|kob|ccp|tcp)`,
      );
    }
  }

  for (const key of MODULE_KEYS) {
    if (configModeRaw[key] === undefined) {
      continue;
    }
    modes[key] = parseConfigMode(configModeRaw[key], `install.config_mode.${key}`);
  }

  return modes;
}

export function resolveModulePathsFromConfigFile(configFile: string): ModulePaths {
  if (!fs.existsSync(configFile)) {
    throw new Error(
      `config file not found: ${configFile}\n` +
      `Create ${configFile} with modules.ask/modules.kob/modules.ccp/modules.tcp.\n` +
      `Template: ${CONFIG_TEMPLATE_FILE}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = parse(fs.readFileSync(configFile, "utf8"));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`failed to parse config (${configFile}): ${message}`);
  }

  if (!isMapping(parsed)) {
    throw new Error(`invalid config: root must be a mapping (${configFile})`);
  }
  const root = parsed;
  if (root.version !== CONFIG_VERSION) {
    throw new Error(`invalid config: version must be ${CONFIG_VERSION} (${configFile})`);
  }
  if (!isMapping(root.modules)) {
    throw new Error(`invalid config: missing 'modules' mapping (${configFile})`);
  }
  const modules = root.modules;
  const configModes = resolveConfigModes(root, configFile);

  const askDir = requireModulePath(modules, "ask", configFile);
  const kobDir = requireModulePath(modules, "kob", configFile);
  const ccpDir = requireModulePath(modules, "ccp", configFile);
  const tcpDir = requireModulePath(modules, "tcp", configFile);

  const askSrcDir = path.join(askDir, "src");
  const kobUtlDir = path.join(kobDir, "utl", "kob");
  const kobUtlSrcDir = path.join(kobUtlDir, "src");

  requireDirectory(askSrcDir);
  requireDirectory(kobUtlDir);
  requireDirectory(kobUtlSrcDir);

  return {
    askDir,
    kobDir,
    ccpDir,
    tcpDir,
    askSrcDir,
    kobUtlDir,
    kobUtlSrcDir,
    configModes,
  };
}

export function resolveModulePaths(): ModulePaths {
  return resolveModulePathsFromConfigFile(DEFAULT_CONFIG_FILE);
}

export function packageRequiresNodeModules(packageJsonPath: string): boolean {
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as Record<string, unknown>;
    const dependencies = parsed.dependencies;
    if (
      typeof dependencies === "object" &&
      dependencies !== null &&
      Object.keys(dependencies as Record<string, unknown>).length > 0
    ) {
      return true;
    }
    const devDependencies = parsed.devDependencies;
    if (
      typeof devDependencies === "object" &&
      devDependencies !== null &&
      Object.keys(devDependencies as Record<string, unknown>).length > 0
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
