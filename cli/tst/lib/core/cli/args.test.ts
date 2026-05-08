import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseArgs } from "../../../../src/lib/core/cli/args.ts";

describe("parseArgs", () => {
  describe("valid commands", () => {
    it("recognizes 'doctor' as a valid command", () => {
      const result = parseArgs(["doctor"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "doctor" } });
    });

    it("recognizes 'curate' as a valid command", () => {
      const result = parseArgs(["curate"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "curate" } });
    });

    it("recognizes 'spawn' as a valid command", () => {
      const result = parseArgs(["spawn"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "spawn" } });
    });
  });

  describe("global flags", () => {
    it("returns help command for --help", () => {
      const result = parseArgs(["--help"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "help" } });
    });

    it("returns help command for -h", () => {
      const result = parseArgs(["-h"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "help" } });
    });

    it("returns version command for --version", () => {
      const result = parseArgs(["--version"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "version" } });
    });

    it("--help takes priority over trailing command", () => {
      const result = parseArgs(["--help", "doctor"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "help" } });
    });
  });

  describe("error cases", () => {
    it("returns missing-command error for empty argv", () => {
      const result = parseArgs([]);
      assert.deepStrictEqual(result, {
        ok: false,
        error: { kind: "missing-command", exitCode: 2 },
      });
    });

    it("returns unknown-command error for unrecognized command", () => {
      const result = parseArgs(["frobnicate"]);
      assert.deepStrictEqual(result, {
        ok: false,
        error: { kind: "unknown-command", command: "frobnicate", exitCode: 2 },
      });
    });

    it("returns unknown-command error for unrecognized flag", () => {
      const result = parseArgs(["--unknown"]);
      assert.deepStrictEqual(result, {
        ok: false,
        error: { kind: "unknown-command", command: "--unknown", exitCode: 2 },
      });
    });

    it("returns unexpected-args error when command has trailing arguments", () => {
      const result = parseArgs(["doctor", "extra"]);
      assert.deepStrictEqual(result, {
        ok: false,
        error: { kind: "unexpected-args", args: ["extra"], exitCode: 2 },
      });
    });
  });

  describe("edge cases", () => {
    it("treats --help after a command as unexpected argument, not a flag", () => {
      const result = parseArgs(["doctor", "--help"]);
      assert.deepStrictEqual(result, {
        ok: false,
        error: { kind: "unexpected-args", args: ["--help"], exitCode: 2 },
      });
    });

    it("--version ignores trailing arguments", () => {
      const result = parseArgs(["--version", "doctor"]);
      assert.deepStrictEqual(result, { ok: true, command: { kind: "version" } });
    });

    it("all error results use exitCode 2", () => {
      const errorInputs: readonly string[][] = [
        [],
        ["frobnicate"],
        ["doctor", "extra"],
        ["--unknown"],
      ];
      for (const argv of errorInputs) {
        const result = parseArgs(argv);
        assert.equal(result.ok, false);
        if (!result.ok) {
          assert.equal(result.error.exitCode, 2, `exitCode for argv=${JSON.stringify(argv)}`);
        }
      }
    });
  });
});
