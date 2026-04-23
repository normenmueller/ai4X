import { VERSION, COPYRIGHT_YEAR, AUTHOR } from '../../shared/constants.ts';

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
