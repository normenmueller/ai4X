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

export interface CliUsageError {
  readonly kind: 'usage-error';
  readonly message: string;
  readonly exitCode: number;
}

export type ParseResult =
  | { readonly ok: true; readonly command: CliCommand }
  | { readonly ok: false; readonly error: CliUsageError };
