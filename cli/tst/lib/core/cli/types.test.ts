import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type {
  CliCommand,
  CliUsageError,
  MissingCommandError,
  UnknownCommandError,
  UnexpectedArgsError,
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
      error: { kind: "missing-command", exitCode: 2 },
    };

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.kind, "missing-command");
      assert.equal(result.error.exitCode, 2);
    }
  });
});

describe("CliUsageError structure", () => {
  it("each variant has a distinct kind value", () => {
    const missing: MissingCommandError = { kind: "missing-command", exitCode: 2 };
    const unknown: UnknownCommandError = { kind: "unknown-command", command: "x", exitCode: 2 };
    const unexpected: UnexpectedArgsError = { kind: "unexpected-args", args: ["a"], exitCode: 2 };

    const kinds = new Set([missing.kind, unknown.kind, unexpected.kind]);
    assert.equal(kinds.size, 3, "all 3 kind values must be distinct");
  });

  it("MissingCommandError has kind missing-command and exitCode 2", () => {
    const err: MissingCommandError = { kind: "missing-command", exitCode: 2 };
    assert.equal(err.kind, "missing-command");
    assert.equal(err.exitCode, 2);
  });

  it("UnknownCommandError carries a command string", () => {
    const err: UnknownCommandError = { kind: "unknown-command", command: "frobnicate", exitCode: 2 };
    assert.equal(err.kind, "unknown-command");
    assert.equal(err.command, "frobnicate");
    assert.equal(err.exitCode, 2);
  });

  it("UnexpectedArgsError carries an args array", () => {
    const err: UnexpectedArgsError = { kind: "unexpected-args", args: ["extra", "stuff"], exitCode: 2 };
    assert.equal(err.kind, "unexpected-args");
    assert.deepEqual(err.args, ["extra", "stuff"]);
    assert.equal(err.exitCode, 2);
  });

  it("all variants have exitCode 2", () => {
    const errors: CliUsageError[] = [
      { kind: "missing-command", exitCode: 2 },
      { kind: "unknown-command", command: "x", exitCode: 2 },
      { kind: "unexpected-args", args: [], exitCode: 2 },
    ];
    for (const err of errors) {
      assert.equal(err.exitCode, 2);
    }
  });

  it("none are Error instances", () => {
    const errors: CliUsageError[] = [
      { kind: "missing-command", exitCode: 2 },
      { kind: "unknown-command", command: "x", exitCode: 2 },
      { kind: "unexpected-args", args: [], exitCode: 2 },
    ];
    for (const err of errors) {
      assert.equal(err instanceof Error, false);
    }
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
