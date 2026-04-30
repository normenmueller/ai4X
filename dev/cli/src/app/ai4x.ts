import { parseArgs } from '../lib/core/cli/args.ts';
import { usageText, versionText, errorText } from '../lib/core/cli/output.ts';
import { logLine } from '../lib/shared/log.ts';

const argv = process.argv.slice(2);

const result = parseArgs(argv);

if (!result.ok) {
  process.stderr.write(logLine('error', errorText(result.error)) + '\n');
  if (result.error.kind === 'missing-command') {
    process.stderr.write(usageText() + '\n');
  }
  process.exitCode = result.error.exitCode;
} else {
  switch (result.command.kind) {
    case 'help':
      process.stdout.write(usageText() + '\n');
      break;
    case 'version':
      process.stdout.write(versionText() + '\n');
      break;
    case 'doctor':
    case 'curate':
    case 'spawn':
      process.stderr.write(logLine('warn', `not yet implemented: ${result.command.kind}`) + '\n');
      process.exitCode = 1;
      break;
    default: {
      const _exhaustive: never = result.command;
      throw new Error(`unhandled command: ${(_exhaustive as { kind: string }).kind}`);
    }
  }
}
