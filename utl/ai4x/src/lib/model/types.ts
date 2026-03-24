export type Command = "clean" | "install" | "doctor";
export type HelpTopic = "global" | Command;

export type SharedOptions = {
  prefix: string;
  dryRun: boolean;
};

export type CleanArgs = SharedOptions & {
  command: "clean";
};

export type InstallArgs = SharedOptions & {
  command: "install";
  admin: boolean;
  cleanFirst: boolean;
};

export type DoctorArgs = {
  command: "doctor";
  strict: boolean;
  json: boolean;
  verbose: boolean;
};

export type ParsedArgs =
  | { mode: "help"; topic: HelpTopic }
  | { mode: "version" }
  | { mode: "command"; args: CleanArgs | InstallArgs | DoctorArgs };
