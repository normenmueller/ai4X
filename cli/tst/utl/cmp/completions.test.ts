import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

// CWD-independent path resolution (same pattern as ai4x.test.ts)
const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "../../../../..");

const bashFile = resolve(repoRoot, "utl/cmp/ai4x.bash");
const zshFile = resolve(repoRoot, "utl/cmp/_ai4x");
const fishFile = resolve(repoRoot, "utl/cmp/ai4x.fish");

// Canonical sub-commands and global flags — source of truth: cli/src/lib/core/cli/args.ts
// (COMMANDS set and flag handling in parseArgs)
const EXPECTED_SUBCOMMANDS = ["curate", "spawn", "doctor"];
const EXPECTED_GLOBAL_FLAGS = ["--help", "-h", "--version"];

describe("shell completion files", () => {
  describe("file existence", () => {
    it("ai4x.bash exists and is readable", async () => {
      await access(bashFile, constants.R_OK);
    });

    it("_ai4x (zsh) exists and is readable", async () => {
      await access(zshFile, constants.R_OK);
    });

    it("ai4x.fish exists and is readable", async () => {
      await access(fishFile, constants.R_OK);
    });
  });

  describe("sub-command coverage", () => {
    it("ai4x.bash contains all sub-commands from CLI model", async () => {
      const content = await readFile(bashFile, "utf-8");
      for (const cmd of EXPECTED_SUBCOMMANDS) {
        assert.ok(content.includes(cmd), `bash completion must contain '${cmd}'`);
      }
    });

    it("_ai4x (zsh) contains all sub-commands from CLI model", async () => {
      const content = await readFile(zshFile, "utf-8");
      for (const cmd of EXPECTED_SUBCOMMANDS) {
        assert.ok(content.includes(cmd), `zsh completion must contain '${cmd}'`);
      }
    });

    it("ai4x.fish contains all sub-commands from CLI model", async () => {
      const content = await readFile(fishFile, "utf-8");
      for (const cmd of EXPECTED_SUBCOMMANDS) {
        assert.ok(content.includes(cmd), `fish completion must contain '${cmd}'`);
      }
    });
  });

  describe("global flag coverage", () => {
    it("ai4x.bash contains --help, -h, and --version", async () => {
      const content = await readFile(bashFile, "utf-8");
      for (const flag of EXPECTED_GLOBAL_FLAGS) {
        assert.ok(content.includes(flag), `bash completion must contain '${flag}'`);
      }
    });

    it("_ai4x (zsh) contains --help, -h, and --version", async () => {
      const content = await readFile(zshFile, "utf-8");
      for (const flag of EXPECTED_GLOBAL_FLAGS) {
        assert.ok(content.includes(flag), `zsh completion must contain '${flag}'`);
      }
    });

    it("ai4x.fish contains help, h (short), and version flags (fish syntax)", async () => {
      const content = await readFile(fishFile, "utf-8");
      assert.ok(content.includes("-s h"), "fish completion must contain '-s h' (short help flag)");
      assert.ok(content.includes("-l help"), "fish completion must contain '-l help'");
      assert.ok(content.includes("-l version"), "fish completion must contain '-l version'");
    });
  });

  describe("maintenance note", () => {
    it("ai4x.bash contains MAINTENANCE NOTE", async () => {
      const content = await readFile(bashFile, "utf-8");
      assert.ok(content.includes("MAINTENANCE NOTE"), "bash completion must contain 'MAINTENANCE NOTE'");
    });

    it("_ai4x (zsh) contains MAINTENANCE NOTE", async () => {
      const content = await readFile(zshFile, "utf-8");
      assert.ok(content.includes("MAINTENANCE NOTE"), "zsh completion must contain 'MAINTENANCE NOTE'");
    });

    it("ai4x.fish contains MAINTENANCE NOTE", async () => {
      const content = await readFile(fishFile, "utf-8");
      assert.ok(content.includes("MAINTENANCE NOTE"), "fish completion must contain 'MAINTENANCE NOTE'");
    });
  });

  describe("no unexpected sub-commands", () => {
    const KNOWN_ABSENT = "frobnicate";

    it("ai4x.bash does not contain unexpected sub-commands", async () => {
      const content = await readFile(bashFile, "utf-8");
      assert.ok(!content.includes(KNOWN_ABSENT), `bash completion must not contain '${KNOWN_ABSENT}'`);
    });

    it("_ai4x (zsh) does not contain unexpected sub-commands", async () => {
      const content = await readFile(zshFile, "utf-8");
      assert.ok(!content.includes(KNOWN_ABSENT), `zsh completion must not contain '${KNOWN_ABSENT}'`);
    });

    it("ai4x.fish does not contain unexpected sub-commands", async () => {
      const content = await readFile(fishFile, "utf-8");
      assert.ok(!content.includes(KNOWN_ABSENT), `fish completion must not contain '${KNOWN_ABSENT}'`);
    });
  });
});
