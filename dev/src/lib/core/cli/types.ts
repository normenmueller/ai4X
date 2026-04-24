export interface HelpCommand {
  readonly kind: 'help';
}

export interface VersionCommand {
  readonly kind: 'version';
}

export interface DoctorCommand {
  readonly kind: 'doctor';
}

export interface CurateCommand {
  readonly kind: 'curate';
}

export interface SpawnCommand {
  readonly kind: 'spawn';
}

export type CliCommand =
  | HelpCommand
  | VersionCommand
  | DoctorCommand
  | CurateCommand
  | SpawnCommand;

export interface MissingCommandError {
  readonly kind: 'missing-command';
  readonly exitCode: 2;
}

export interface UnknownCommandError {
  readonly kind: 'unknown-command';
  readonly command: string;
  readonly exitCode: 2;
}

export interface UnexpectedArgsError {
  readonly kind: 'unexpected-args';
  readonly args: readonly string[];
  readonly exitCode: 2;
}

export type CliUsageError =
  | MissingCommandError
  | UnknownCommandError
  | UnexpectedArgsError;

export type ParseResult =
  | { readonly ok: true; readonly command: CliCommand }
  | { readonly ok: false; readonly error: CliUsageError };
