import { VERSION, COPYRIGHT_YEAR, AUTHOR } from '../../shared/constants.ts';
import type { CliUsageError } from './types.ts';

export function versionText(): string {
  return `ai4X, v${VERSION}, © ${COPYRIGHT_YEAR} ${AUTHOR}`;
}

export function usageText(): string {
  return [
    'Usage: ai4x <command> [options]',
    '',
    'Commands:',
    '  doctor    Run diagnostics',
    '  curate    Curate agent definitions',
    '  spawn     Spawn agent for target client',
    '',
    'Options:',
    '  --help, -h     Show this help',
    '  --version      Show version',
  ].join('\n');
}

export function errorText(error: CliUsageError): string {
  switch (error.kind) {
    case 'missing-command':
      return 'missing command';
    case 'unknown-command':
      return `unknown command: ${error.command}`;
    case 'unexpected-args':
      return `unexpected arguments: ${error.args.join(' ')}`;
    default: {
      const _exhaustive: never = error;
      throw new Error(`unhandled error: ${(_exhaustive as { kind: string }).kind}`);
    }
  }
}
