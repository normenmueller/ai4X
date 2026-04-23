import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type {
  CliCommand,
  CliUsageError,
  ParseResult,
  HelpCommand,
  VersionCommand,
  DoctorCommand,
  CurateCommand,
  SpawnCommand,
} from "../../../../src/lib/core/cli/types.ts";

// Compile-time exhaustiveness helper: if a branch is missed, `cmd` won't be `never`.
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

describe("ParseResult narrowing", () => {
  it("grants access to command when ok is true", () => {
    const result: ParseResult = {
      ok: true,
      command: { kind: "help" },
    };

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.command.kind, "help");
    }
  });

  it("grants access to error when ok is false", () => {
    const result: ParseResult = {
      ok: false,
      error: { kind: "usage-error", message: "unknown flag", exitCode: 1 },
    };

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.kind, "usage-error");
      assert.equal(result.error.message, "unknown flag");
      assert.equal(result.error.exitCode, 1);
    }
  });
});

describe("CliUsageError structure", () => {
  it("has kind equal to usage-error", () => {
    const err: CliUsageError = {
      kind: "usage-error",
      message: "bad input",
      exitCode: 2,
    };
    assert.equal(err.kind, "usage-error");
  });

  it("carries message and exitCode", () => {
    const err: CliUsageError = {
      kind: "usage-error",
      message: "missing argument",
      exitCode: 1,
    };
    assert.equal(err.message, "missing argument");
    assert.equal(err.exitCode, 1);
  });

  it("is a plain data record, not an Error instance", () => {
    const err: CliUsageError = {
      kind: "usage-error",
      message: "test",
      exitCode: 1,
    };
    assert.equal(err instanceof Error, false);
  });
});

describe("CliCommand exhaustiveness", () => {
  const allVariants: CliCommand[] = [
    { kind: "help" },
    { kind: "version" },
    { kind: "doctor" },
    { kind: "curate" },
    { kind: "spawn" },
  ];

  it("covers all 5 command variants via switch with never-default", () => {
    const seen: string[] = [];

    for (const cmd of allVariants) {
      switch (cmd.kind) {
        case "help":
          seen.push("help");
          break;
        case "version":
          seen.push("version");
          break;
        case "doctor":
          seen.push("doctor");
          break;
        case "curate":
          seen.push("curate");
          break;
        case "spawn":
          seen.push("spawn");
          break;
        default:
          assertNever(cmd);
      }
    }

    assert.deepEqual(seen, ["help", "version", "doctor", "curate", "spawn"]);
  });
});

describe("CliCommand discriminator", () => {
  it("each variant has a unique kind value", () => {
    const help: HelpCommand = { kind: "help" };
    const version: VersionCommand = { kind: "version" };
    const doctor: DoctorCommand = { kind: "doctor" };
    const curate: CurateCommand = { kind: "curate" };
    const spawn: SpawnCommand = { kind: "spawn" };

    const kinds = [help.kind, version.kind, doctor.kind, curate.kind, spawn.kind];
    const unique = new Set(kinds);

    assert.equal(unique.size, 5, "all 5 kind values must be distinct");
  });

  it("contains exactly the 5 expected kind values", () => {
    const expected = new Set(["help", "version", "doctor", "curate", "spawn"]);

    const help: HelpCommand = { kind: "help" };
    const version: VersionCommand = { kind: "version" };
    const doctor: DoctorCommand = { kind: "doctor" };
    const curate: CurateCommand = { kind: "curate" };
    const spawn: SpawnCommand = { kind: "spawn" };

    const actual = new Set([help.kind, version.kind, doctor.kind, curate.kind, spawn.kind]);
    assert.deepEqual(actual, expected);
  });
});
