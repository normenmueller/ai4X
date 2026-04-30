import type { ParseResult } from './types.ts';

const COMMANDS = new Set(['doctor', 'curate', 'spawn'] as const);
const HELP_FLAGS = new Set(['--help', '-h'] as const);

export function parseArgs(argv: readonly string[]): ParseResult {
  if (argv.length === 0) {
    return { ok: false, error: { kind: 'missing-command', exitCode: 2 } };
  }

  const first = argv[0];

  // Safe: .has() returns false for non-matching values; TS Set.has() requires element type
  if (HELP_FLAGS.has(first as '--help' | '-h')) {
    return { ok: true, command: { kind: 'help' } };
  }

  if (first === '--version') {
    return { ok: true, command: { kind: 'version' } };
  }

  // Safe: .has() returns false for non-matching values; TS Set.has() requires element type
  if (COMMANDS.has(first as 'doctor' | 'curate' | 'spawn')) {
    if (argv.length > 1) {
      return { ok: false, error: { kind: 'unexpected-args', args: argv.slice(1), exitCode: 2 } };
    }
    // Safe: guarded by COMMANDS.has() check above
    return { ok: true, command: { kind: first as 'doctor' | 'curate' | 'spawn' } };
  }

  return { ok: false, error: { kind: 'unknown-command', command: first, exitCode: 2 } };
}
