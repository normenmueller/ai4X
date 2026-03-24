import { spawnSync } from "node:child_process";
import { logLine } from "../shared/log.ts";

type RunOptions = {
  cwd?: string;
  dryRun: boolean;
};

function quote(arg: string): string {
  if (/^[a-zA-Z0-9_./:-]+$/.test(arg)) {
    return arg;
  }
  return JSON.stringify(arg);
}

export function runCommand(command: string, args: string[], options: RunOptions): void {
  const printable = [command, ...args].map(quote).join(" ");
  if (options.cwd) {
    process.stdout.write(`${logLine("INFO", `$ (cd ${options.cwd} && ${printable})`)}\n`);
  } else {
    process.stdout.write(`${logLine("INFO", `$ ${printable}`)}\n`);
  }

  if (options.dryRun) {
    return;
  }

  const child = spawnSync(command, args, {
    cwd: options.cwd,
    stdio: "inherit",
    env: process.env,
  });

  if (child.error) {
    throw child.error;
  }

  if ((child.status ?? 1) !== 0) {
    throw new Error(`command failed with exit code ${child.status}: ${printable}`);
  }
}
