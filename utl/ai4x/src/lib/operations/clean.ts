import fs from "node:fs";
import path from "node:path";
import type { CleanArgs } from "../model/types.ts";
import { runCommand } from "../runtime/shell.ts";
import { logLine } from "../shared/log.ts";
import type { ModulePaths } from "./config.ts";
import { resolveModulePaths } from "./config.ts";

type CommandSpec = {
  command: string;
  args: string[];
};

export type CleanPlan = {
  commands: CommandSpec[];
  nodeModulesDirs: string[];
};

function removeDirIfExists(target: string): void {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

export function buildCleanPlan(
  modules: ModulePaths,
  args: Pick<CleanArgs, "prefix">,
): CleanPlan {
  const commands: CommandSpec[] = [
    {
      command: "make",
      args: ["-C", modules.askDir, `PREFIX=${args.prefix}`, "uninstall"],
    },
    {
      command: "make",
      args: ["-C", modules.kobUtlDir, `PREFIX=${args.prefix}`, "uninstall"],
    },
  ];

  const nodeModulesDirs = [modules.askSrcDir, modules.kobUtlSrcDir].map((dir) => path.join(dir, "node_modules"));

  return {
    commands,
    nodeModulesDirs,
  };
}

export function runClean(args: CleanArgs): void {
  const modules = resolveModulePaths();
  const plan = buildCleanPlan(modules, args);

  for (const commandSpec of plan.commands) {
    runCommand(commandSpec.command, commandSpec.args, { dryRun: args.dryRun });
  }

  for (const nodeModulesDir of plan.nodeModulesDirs) {
    if (args.dryRun) {
      process.stdout.write(`${logLine("INFO", `[dry-run] rm -rf ${nodeModulesDir}`)}\n`);
      continue;
    }
    removeDirIfExists(nodeModulesDir);
  }
}
