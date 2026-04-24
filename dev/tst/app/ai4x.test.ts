import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const execFile = promisify(execFileCb);

// CWD-independent path resolution (CA-05)
const testDir = dirname(fileURLToPath(import.meta.url));
const entryPoint = resolve(testDir, "../../src/app/ai4x.ts");

async function run(
  ...args: string[]
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execFile(
      process.execPath,
      [entryPoint, ...args],
      { encoding: "utf-8" },
    );
    return { stdout, stderr, exitCode: 0 };
  } catch (err: unknown) {
    // execFile rejects on non-zero exit; error object carries stdout, stderr, code.
    // `as` justified: system boundary — child_process error shape is well-known but untyped.
    const e = err as { stdout: string; stderr: string; code: number };
    return { stdout: e.stdout, stderr: e.stderr, exitCode: e.code };
  }
}

describe("ai4x CLI (integration)", () => {
  describe("help flag", () => {
    it("--help prints usage and exits 0", async () => {
      const { stdout, stderr, exitCode } = await run("--help");
      assert.equal(exitCode, 0);
      assert.ok(stdout.includes("Usage: ai4x"), "stdout must contain 'Usage: ai4x'");
      assert.equal(stderr, "");
    });

    it("-h prints usage and exits 0", async () => {
      const { stdout, stderr, exitCode } = await run("-h");
      assert.equal(exitCode, 0);
      assert.ok(stdout.includes("Usage: ai4x"), "stdout must contain 'Usage: ai4x'");
      assert.equal(stderr, "");
    });
  });

  describe("version flag", () => {
    it("--version prints version and exits 0", async () => {
      const { stdout, stderr, exitCode } = await run("--version");
      assert.equal(exitCode, 0);
      assert.ok(stdout.includes("ai4X, v"), "stdout must contain 'ai4X, v'");
      assert.equal(stderr, "");
    });

    it("--version with trailing args exits 0", async () => {
      const { stdout, stderr, exitCode } = await run("--version", "extra");
      assert.equal(exitCode, 0);
      assert.ok(stdout.includes("ai4X, v"), "stdout must contain 'ai4X, v'");
      assert.equal(stderr, "");
    });
  });

  describe("sub-command stubs", () => {
    it("doctor prints stub warning and exits 1", async () => {
      const { stdout, stderr, exitCode } = await run("doctor");
      assert.equal(exitCode, 1);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|warn] not yet implemented: doctor"),
        "stderr must contain stub warning for doctor",
      );
    });

    it("curate prints stub warning and exits 1", async () => {
      const { stdout, stderr, exitCode } = await run("curate");
      assert.equal(exitCode, 1);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|warn] not yet implemented: curate"),
        "stderr must contain stub warning for curate",
      );
    });

    it("spawn prints stub warning and exits 1", async () => {
      const { stdout, stderr, exitCode } = await run("spawn");
      assert.equal(exitCode, 1);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|warn] not yet implemented: spawn"),
        "stderr must contain stub warning for spawn",
      );
    });
  });

  describe("error handling", () => {
    it("bare invocation prints error + usage and exits 2", async () => {
      const { stdout, stderr, exitCode } = await run();
      assert.equal(exitCode, 2);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|error] missing command"),
        "stderr must contain missing command error",
      );
      assert.ok(
        stderr.includes("Usage: ai4x"),
        "stderr must contain usage text on bare invocation",
      );
    });

    it("unknown command prints error and exits 2", async () => {
      const { stdout, stderr, exitCode } = await run("frobnicate");
      assert.equal(exitCode, 2);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|error] unknown command: frobnicate"),
        "stderr must contain unknown command error",
      );
    });

    it("unexpected arguments prints error and exits 2", async () => {
      const { stdout, stderr, exitCode } = await run("doctor", "extra");
      assert.equal(exitCode, 2);
      assert.equal(stdout, "");
      assert.ok(
        stderr.includes("[ai4x|error] unexpected arguments: extra"),
        "stderr must contain unexpected arguments error",
      );
    });
  });

  describe("stream routing", () => {
    it("help output goes to stdout, not stderr", async () => {
      const { stdout, stderr, exitCode } = await run("--help");
      assert.equal(exitCode, 0);
      assert.ok(stdout.length > 0, "stdout must be non-empty for help");
      assert.equal(stderr, "");
    });

    it("error output goes to stderr, not stdout", async () => {
      const { stdout, stderr, exitCode } = await run("frobnicate");
      assert.equal(exitCode, 2);
      assert.equal(stdout, "");
      assert.ok(stderr.length > 0, "stderr must be non-empty for errors");
    });
  });
});
