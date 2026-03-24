import os from "node:os";
import path from "node:path";
import { usageText } from "./output.ts";
import type { CleanArgs, DoctorArgs, HelpTopic, InstallArgs, ParsedArgs } from "../model/types.ts";

const VERSION = "0.1.0";
const VERSION_TEXT = `ai4x, v${VERSION}, © 2026 nemron`;

export class CliUsageError extends Error {
  readonly exitCode = 2;
}

function expandPath(input: string): string {
  const home = os.homedir();
  const replaced = input
    .replace(/^~(?=$|\/)/, home)
    .replaceAll("$HOME", home)
    .replaceAll("${HOME}", home);
  return path.resolve(replaced);
}

const HELP_TOPICS: ReadonlySet<string> = new Set(["global", "clean", "install", "doctor"]);

function parseHelpTopic(raw: string): HelpTopic {
  if (!HELP_TOPICS.has(raw)) {
    throw new CliUsageError(`unknown help topic: ${raw}\n\n${usageText("ai4x", "global")}`);
  }
  return raw as HelpTopic;
}

function fail(message: string, topic: HelpTopic = "global"): never {
  throw new CliUsageError(`${message}\n\n${usageText("ai4x", topic)}`);
}

export function formatUsage(topic: HelpTopic = "global"): string {
  return usageText("ai4x", topic);
}

export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0 || argv[0] === "-h" || argv[0] === "--help") {
    return { mode: "help", topic: "global" };
  }
  if (argv[0] === "--version") {
    return { mode: "version" };
  }
  if (argv[0] === "help") {
    if (argv.length === 1) {
      return { mode: "help", topic: "global" };
    }
    if (argv.length > 2) {
      fail("help does not take extra arguments");
    }
    return { mode: "help", topic: parseHelpTopic(argv[1]) };
  }

  const command = argv[0];
  const rest = argv.slice(1);
  if (command !== "clean" && command !== "install" && command !== "doctor") {
    fail(`unknown command: ${command}`);
  }
  if (rest.length > 0 && (rest[0] === "-h" || rest[0] === "--help")) {
    if (rest.length > 1) {
      fail(`help for ${command} does not take extra arguments`, command);
    }
    return { mode: "help", topic: command };
  }

  if (command === "doctor") {
    let strict = false;
    let json = false;
    let verbose = false;
    for (const token of rest) {
      if (token === "--strict") {
        strict = true;
        continue;
      }
      if (token === "--json") {
        json = true;
        continue;
      }
      if (token === "--verbose") {
        verbose = true;
        continue;
      }
      fail(`unknown option: ${token}`, "doctor");
    }
    const args: DoctorArgs = {
      command,
      strict,
      json,
      verbose,
    };
    return { mode: "command", args };
  }

  const base = {
    prefix: expandPath(path.join(os.homedir(), ".local")),
    dryRun: false,
  };

  let admin = false;
  let cleanFirst = false;

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === "--prefix") {
      const value = rest[i + 1];
      if (!value) {
        fail("missing value for --prefix");
      }
      base.prefix = expandPath(value);
      i += 1;
      continue;
    }
    if (token === "--admin") {
      if (command !== "install") {
        fail("unknown option: --admin");
      }
      admin = true;
      continue;
    }
    if (token === "--dry-run") {
      base.dryRun = true;
      continue;
    }
    if (command === "install" && token === "--clean") {
      cleanFirst = true;
      continue;
    }

    fail(`unknown option: ${token}`, command);
  }

  if (command === "clean") {
    const args: CleanArgs = {
      command,
      ...base,
    };
    return { mode: "command", args };
  }
  if (command === "install") {
    const args: InstallArgs = {
      command,
      ...base,
      admin,
      cleanFirst,
    };
    return { mode: "command", args };
  }

  fail(`unknown command: ${command}`);
}

export const CLI_VERSION = VERSION;
export const CLI_VERSION_TEXT = VERSION_TEXT;
