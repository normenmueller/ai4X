import { CLI_VERSION_TEXT, formatUsage, parseArgs } from "../cli/args.ts";
import { runClean, runDoctor, runInstall } from "../operations/actions.ts";

export async function run(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);

  if (parsed.mode === "help") {
    process.stdout.write(`${formatUsage(parsed.topic)}\n`);
    return 0;
  }
  if (parsed.mode === "version") {
    process.stdout.write(`${CLI_VERSION_TEXT}\n`);
    return 0;
  }

  if (parsed.args.command === "clean") {
    runClean(parsed.args);
    return 0;
  }
  if (parsed.args.command === "doctor") {
    return runDoctor(parsed.args);
  }
  runInstall(parsed.args);
  return 0;
}
