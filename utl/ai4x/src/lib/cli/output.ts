import type { HelpTopic } from "../model/types.ts";

function globalUsageText(progName: string): string {
  return `Usage:
  ${progName} [--help] [--version]
  ${progName} help <clean|install|doctor>
  ${progName} clean [--prefix <path>] [--dry-run]
  ${progName} install [--clean] [--prefix <path>] [--admin] [--dry-run]
  ${progName} doctor [--strict] [--json] [--verbose]

Description:
  Operate the ai4x suite runtime lifecycle.

Options:
  -h, --help          Show help and exit
  --version           Show version and exit

Examples:
  ${progName} doctor --strict
  ${progName} install --clean
  ${progName} help install

Config:
  ~/.config/ai4x/config.yaml`;
}

function cleanUsageText(progName: string): string {
  return `Usage:
  ${progName} clean [--prefix <path>] [--dry-run]

Description:
  Remove installed ai4x binaries and generated runtime artifacts under the selected prefix.

Options:
  --prefix <path>  Install prefix for binaries (default: $HOME/.local)
  --dry-run        Print planned commands without executing
  -h, --help       Show this help and exit

Examples:
  ${progName} clean
  ${progName} clean --prefix ~/.local --dry-run`;
}

function installUsageText(progName: string): string {
  return `Usage:
  ${progName} install [--clean] [--prefix <path>] [--admin] [--dry-run]

Description:
  Install and verify the ai4x suite components.

Options:
  --clean          Run clean before install
  --prefix <path>  Install prefix for binaries (default: $HOME/.local)
  --admin          Include system-level /etc/ask operations via sudo
  --dry-run        Print planned commands without executing
  -h, --help       Show this help and exit

Examples:
  ${progName} install
  ${progName} install --clean --prefix ~/.local
  ${progName} install --admin --dry-run`;
}

function doctorUsageText(progName: string): string {
  return `Usage:
  ${progName} doctor [--strict] [--json] [--verbose]

Description:
  Evaluate runtime readiness and contract health across ai4x modules.

Options:
  --strict   Exit with code 1 if doctor finds required failures
  --json     Print doctor report as JSON
  --verbose  Print all doctor checks (default: only failures)
  -h, --help Show this help and exit

Examples:
  ${progName} doctor
  ${progName} doctor --strict
  ${progName} doctor --json --verbose`;
}

export function usageText(progName: string, topic: HelpTopic = "global"): string {
  if (topic === "clean") {
    return cleanUsageText(progName);
  }
  if (topic === "install") {
    return installUsageText(progName);
  }
  if (topic === "doctor") {
    return doctorUsageText(progName);
  }
  return globalUsageText(progName);
}

