import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "../../../..");
const install = readFileSync(resolve(repoRoot, "INSTALL"), "utf-8");

// ── AC-22a: System Prerequisites ───────────────────────────────────

describe("DoD-1: system prerequisites (AC-22a)", () => {
  it("documents Node.js >= 23.6.0 requirement", () => {
    assert.match(install, /Node\.js\s*>=?\s*23\.6\.0/i);
  });

  it("documents bash requirement", () => {
    assert.match(install, /bash/i);
  });

  it("documents make requirement", () => {
    assert.match(install, /\bmake\b/i);
  });
});

// ── AC-22b: Installation Sequence ──────────────────────────────────

describe("DoD-2: installation sequence including npm ci (AC-22b)", () => {
  it("documents npm ci command", () => {
    assert.match(install, /npm\s+ci/);
  });

  it("documents make install command", () => {
    assert.match(install, /make\s+install/);
  });

  it("install code block shows npm ci before make install", () => {
    // Match the fenced code block under ## Install that contains the command sequence
    const codeBlocks = [...install.matchAll(/```bash\n([\s\S]*?)```/g)];
    const installBlock = codeBlocks.find(
      (m) => m[1]!.includes("npm ci") && m[1]!.includes("make install"),
    );
    assert.ok(installBlock, "must have a code block containing both npm ci and make install");
    const block = installBlock![1]!;
    assert.ok(
      block.indexOf("npm ci") < block.indexOf("make install"),
      "npm ci must appear before make install in the install sequence",
    );
  });

  it("explicitly states npm ci is a prerequisite, not auto-run", () => {
    assert.match(install, /prerequisite/i);
  });
});

// ── AC-22c: Repository Must Stay in Place ──────────────────────────

describe("DoD-3: repository-must-stay-in-place constraint (AC-22c)", () => {
  it("documents the repo must stay in place", () => {
    assert.match(install, /must\s+stay\s+in\s+place/i);
  });

  it("explains the absolute path rationale", () => {
    assert.match(install, /absolute\s+path/i);
  });
});

// ── AC-22d: Customizable Variables ─────────────────────────────────

describe("DoD-4: customizable variables (AC-22d)", () => {
  it("documents PREFIX variable", () => {
    assert.match(install, /\bPREFIX\b/);
  });

  it("documents DESTDIR variable", () => {
    assert.match(install, /\bDESTDIR\b/);
  });

  it("documents BINDIR variable", () => {
    assert.match(install, /\bBINDIR\b/);
  });

  it("documents CONFIG_MODE variable", () => {
    assert.match(install, /\bCONFIG_MODE\b/);
  });

  it("documents XDG_CONFIG_HOME variable", () => {
    assert.match(install, /\bXDG_CONFIG_HOME\b/);
  });
});

// ── AC-22e: Uninstall Instructions ─────────────────────────────────

describe("DoD-5: uninstall instructions (AC-22e)", () => {
  it("documents make uninstall command", () => {
    assert.match(install, /make\s+uninstall/);
  });

  it("documents config preservation on uninstall", () => {
    assert.match(install, /config.*preserv|preserv.*config/i);
  });
});

// ── AC-22f: Shell Completion Activation ────────────────────────────

describe("DoD-6: shell completion activation hints (AC-22f)", () => {
  it("documents bash completion activation", () => {
    assert.match(install, /bash/i);
    assert.match(install, /source.*ai4x|bash.completion/i);
  });

  it("documents zsh completion activation", () => {
    assert.match(install, /zsh/i);
    assert.match(install, /compinit|fpath/i);
  });

  it("documents fish completion activation", () => {
    assert.match(install, /fish/i);
    assert.match(install, /source.*ai4x\.fish|vendor.completions/i);
  });
});

// ── Falsification: absence detection ───────────────────────────────

describe("falsification: file must not be empty or trivially short", () => {
  it("INSTALL has substantial content (>50 lines)", () => {
    const lines = install.split("\n").length;
    assert.ok(lines > 50, `INSTALL should have >50 lines, got ${lines}`);
  });

  it("INSTALL contains a heading structure", () => {
    assert.match(install, /^#\s+/m);
  });
});
