import type { CleanArgs, InstallArgs } from "../model/types.ts";
import { runCommand } from "../runtime/shell.ts";
import { logLine } from "../shared/log.ts";
import type { ModulePaths } from "./config.ts";
import { resolveModulePaths } from "./config.ts";
import { runClean } from "./clean.ts";

type CommandSpec = {
  id: string;
  command: string;
  args: string[];
};

export type InstallPlan = {
  commands: CommandSpec[];
};

type InstallStepResult = {
  id: string;
  phase: "clean" | "install";
  status: "ok" | "fail";
  command: string;
  error?: string;
};

type InstallReport = {
  result: "ok" | "fail";
  dryRun: boolean;
  cleanFirst: boolean;
  cleanStatus: "skipped" | "ok" | "fail";
  planned: number;
  executed: number;
  failed: number;
  durationMs: number;
  steps: InstallStepResult[];
};

function printableCommand(command: string, args: string[]): string {
  const toToken = (value: string): string => (/^[a-zA-Z0-9_./:-]+$/.test(value) ? value : JSON.stringify(value));
  return [command, ...args].map(toToken).join(" ");
}

function printInstallReport(report: InstallReport): void {
  const statusText = report.result === "ok" ? "OK" : "FAIL";
  const lines = [
    "+====================================================================+",
    "|                          ai4X INSTALL REPORT                       |",
    "+====================================================================+",
    `| result      : ${statusText}`,
    `| dry_run     : ${report.dryRun ? "yes" : "no"}`,
    `| clean_first : ${report.cleanFirst ? "yes" : "no"} (${report.cleanStatus})`,
    `| planned     : ${report.planned}`,
    `| executed    : ${report.executed}`,
    `| failed      : ${report.failed}`,
    `| duration_ms : ${report.durationMs}`,
    "+--------------------------------------------------------------------+",
  ];
  if (report.steps.length === 0) {
    lines.push("| steps       : none");
  } else {
    lines.push("| steps:");
    for (const step of report.steps) {
      const marker = step.status === "ok" ? "OK" : "FAIL";
      lines.push(`|   [${marker}] ${step.phase}.${step.id}`);
      lines.push(`|       ${step.command}`);
      if (step.error) {
        lines.push(`|       error: ${step.error}`);
      }
    }
  }
  lines.push("+====================================================================+");
  for (const line of lines) {
    process.stdout.write(`${logLine("INFO", line)}\n`);
  }
}

export function buildInstallPlan(
  modules: ModulePaths,
  args: Pick<InstallArgs, "prefix" | "admin">,
): InstallPlan {
  const askConfigMode = modules.configModes.ask;

  const commands: CommandSpec[] = [
    {
      id: "ask.npm.ci",
      command: "npm",
      args: ["--prefix", modules.askSrcDir, "ci"],
    },
    {
      id: "ask.npm.test",
      command: "npm",
      args: ["--prefix", modules.askSrcDir, "test"],
    },
    {
      id: "ask.npm.verify",
      command: "npm",
      args: ["--prefix", modules.askSrcDir, "run", "verify"],
    },
    {
      id: "ask.make.install",
      command: "make",
      args: ["-C", modules.askDir, `PREFIX=${args.prefix}`, `CONFIG_MODE=${askConfigMode}`, "install"],
    },
  ];

  if (args.admin) {
    commands.push({
      id: "ask.make.install-system-config",
      command: "sudo",
      args: ["make", "-C", modules.askDir, `CONFIG_MODE=${askConfigMode}`, "install-system-config"],
    });
  }

  commands.push(
    {
      id: "kob.npm.ci",
      command: "npm",
      args: ["--prefix", modules.kobUtlSrcDir, "ci"],
    },
    {
      id: "kob.npm.test",
      command: "npm",
      args: ["--prefix", modules.kobUtlSrcDir, "test"],
    },
    {
      id: "kob.npm.verify",
      command: "npm",
      args: ["--prefix", modules.kobUtlSrcDir, "run", "verify"],
    },
    {
      id: "kob.make.install",
      command: "make",
      args: ["-C", modules.kobUtlDir, `PREFIX=${args.prefix}`, "install"],
    },
  );

  return { commands };
}

export function runInstall(args: InstallArgs): void {
  const modules = resolveModulePaths();
  const startedAt = Date.now();
  const stepResults: InstallStepResult[] = [];
  let cleanStatus: InstallReport["cleanStatus"] = args.cleanFirst ? "ok" : "skipped";

  if (args.cleanFirst) {
    const cleanArgs: CleanArgs = {
      command: "clean",
      prefix: args.prefix,
      dryRun: args.dryRun,
    };
    try {
      runClean(cleanArgs);
      stepResults.push({
        id: "phase.clean",
        phase: "clean",
        status: "ok",
        command: `ai4x clean --prefix ${args.prefix}${args.dryRun ? " --dry-run" : ""}`,
      });
    } catch (error: unknown) {
      cleanStatus = "fail";
      const message = error instanceof Error ? error.message : String(error);
      stepResults.push({
        id: "phase.clean",
        phase: "clean",
        status: "fail",
        command: `ai4x clean --prefix ${args.prefix}${args.dryRun ? " --dry-run" : ""}`,
        error: message,
      });
      const report: InstallReport = {
        result: "fail",
        dryRun: args.dryRun,
        cleanFirst: args.cleanFirst,
        cleanStatus,
        planned: stepResults.length + buildInstallPlan(modules, args).commands.length,
        executed: stepResults.length,
        failed: 1,
        durationMs: Date.now() - startedAt,
        steps: stepResults,
      };
      printInstallReport(report);
      throw new Error(`clean phase failed: ${message}`);
    }
  }

  const plan = buildInstallPlan(modules, args);
  for (const commandSpec of plan.commands) {
    try {
      runCommand(commandSpec.command, commandSpec.args, { dryRun: args.dryRun });
      stepResults.push({
        id: commandSpec.id,
        phase: "install",
        status: "ok",
        command: printableCommand(commandSpec.command, commandSpec.args),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      stepResults.push({
        id: commandSpec.id,
        phase: "install",
        status: "fail",
        command: printableCommand(commandSpec.command, commandSpec.args),
        error: message,
      });
      const failed = stepResults.filter((entry) => entry.status === "fail").length;
      const report: InstallReport = {
        result: "fail",
        dryRun: args.dryRun,
        cleanFirst: args.cleanFirst,
        cleanStatus,
        planned: plan.commands.length + (args.cleanFirst ? 1 : 0),
        executed: stepResults.length,
        failed,
        durationMs: Date.now() - startedAt,
        steps: stepResults,
      };
      printInstallReport(report);
      throw new Error(`install phase failed at ${commandSpec.id}: ${message}`);
    }
  }

  const report: InstallReport = {
    result: "ok",
    dryRun: args.dryRun,
    cleanFirst: args.cleanFirst,
    cleanStatus,
    planned: plan.commands.length + (args.cleanFirst ? 1 : 0),
    executed: stepResults.length,
    failed: 0,
    durationMs: Date.now() - startedAt,
    steps: stepResults,
  };
  printInstallReport(report);
  process.stdout.write(`${logLine("INFO", "Installation completed. If needed: hash -r")}\n`);
}
