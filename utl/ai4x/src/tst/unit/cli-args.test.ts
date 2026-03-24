import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { CliUsageError, parseArgs } from "../../lib/cli/args.ts";

function expectUsageError(fn: () => unknown, pattern: RegExp): void {
  assert.throws(
    fn,
    (error: unknown) => {
      assert.ok(error instanceof CliUsageError);
      assert.equal(error.exitCode, 2);
      assert.match(error.message, pattern);
      return true;
    },
  );
}

test("parseArgs returns help/version and topic help modes", () => {
  assert.deepEqual(parseArgs([]), { mode: "help", topic: "global" });
  assert.deepEqual(parseArgs(["--help"]), { mode: "help", topic: "global" });
  assert.deepEqual(parseArgs(["help"]), { mode: "help", topic: "global" });
  assert.deepEqual(parseArgs(["help", "install"]), { mode: "help", topic: "install" });
  assert.deepEqual(parseArgs(["clean", "--help"]), { mode: "help", topic: "clean" });
  assert.deepEqual(parseArgs(["doctor", "--help"]), { mode: "help", topic: "doctor" });
  assert.deepEqual(parseArgs(["--version"]), { mode: "version" });
});

test("parseArgs resolves clean defaults and path expansion", () => {
  const parsed = parseArgs(["clean", "--prefix", "$HOME/.tools", "--dry-run"]);
  assert.equal(parsed.mode, "command");
  assert.equal(parsed.args.command, "clean");
  assert.equal(parsed.args.prefix, path.resolve(os.homedir(), ".tools"));
  assert.equal(parsed.args.dryRun, true);
});

test("parseArgs resolves install flags", () => {
  const parsed = parseArgs([
    "install",
    "--prefix",
    "~/bin",
    "--clean",
    "--admin",
    "--dry-run",
  ]);
  assert.equal(parsed.mode, "command");
  assert.equal(parsed.args.command, "install");
  assert.equal(parsed.args.prefix, path.resolve(os.homedir(), "bin"));
  assert.equal(parsed.args.cleanFirst, true);
  assert.equal(parsed.args.admin, true);
  assert.equal(parsed.args.dryRun, true);
});

test("parseArgs resolves doctor flags", () => {
  const parsed = parseArgs(["doctor", "--strict", "--json", "--verbose"]);
  assert.equal(parsed.mode, "command");
  assert.equal(parsed.args.command, "doctor");
  assert.equal(parsed.args.strict, true);
  assert.equal(parsed.args.json, true);
  assert.equal(parsed.args.verbose, true);
});

test("parseArgs rejects unknown and invalid option combinations", () => {
  expectUsageError(() => parseArgs(["unknown"]), /unknown command: unknown/);
  expectUsageError(() => parseArgs(["help", "unknown"]), /unknown help topic: unknown/);
  expectUsageError(() => parseArgs(["help", "doctor", "extra"]), /help does not take extra arguments/);
  expectUsageError(() => parseArgs(["clean", "--help", "--dry-run"]), /help for clean does not take extra arguments/);
  expectUsageError(() => parseArgs(["clean", "--admin"]), /unknown option: --admin/);
  expectUsageError(() => parseArgs(["install", "--prefix"]), /missing value for --prefix/);
});
