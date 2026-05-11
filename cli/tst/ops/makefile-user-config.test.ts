import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  readFileSync,
  existsSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "../../..");
const makefileContent = readFileSync(resolve(repoRoot, "Makefile"), "utf-8");

const expectedConfigContent =
  "# ai4x user configuration\n# See: https://github.com/normenmueller/ai4x\n";

function runMake(
  target: string,
  vars: Record<string, string> = {},
  envOverrides: Record<string, string> = {},
): { stdout: string; stderr: string; exitCode: number } {
  const args = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  args.push(target);
  const result = spawnSync("make", args, {
    cwd: repoRoot,
    encoding: "utf-8",
    env: { ...process.env, ...envOverrides },
    timeout: 60_000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? 1,
  };
}

function cleanup(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("Makefile install-user-config (Story #12)", () => {
  // ── Static Analysis ──────────────────────────────────────────────

  describe("variable defaults (static)", () => {
    it("CONFIG_MODE defaults to keep", () => {
      assert.match(makefileContent, /^CONFIG_MODE\s+\?=\s+keep$/m);
    });
  });

  // ── AC-09: CONFIG_MODE=keep ──────────────────────────────────────

  describe("AC-09: CONFIG_MODE=keep", () => {
    const xdgDir = `/tmp/ai4x-test-config-keep-${process.pid}`;
    const configDir = `${xdgDir}/ai4x`;
    const configFile = `${configDir}/config.yaml`;

    after(() => {
      cleanup(xdgDir);
    });

    it("creates config when absent", () => {
      cleanup(xdgDir);
      const result = runMake(
        "install-user-config",
        { CONFIG_MODE: "keep" },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);
      assert.ok(existsSync(configFile), "config.yaml must be created");
      const content = readFileSync(configFile, "utf-8");
      assert.equal(content, expectedConfigContent, "config content must match template");
    });

    it("does not overwrite existing config", () => {
      cleanup(xdgDir);
      mkdirSync(configDir, { recursive: true });
      const sentinel = "# sentinel — do not overwrite\n";
      writeFileSync(configFile, sentinel);

      const result = runMake(
        "install-user-config",
        { CONFIG_MODE: "keep" },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);
      const content = readFileSync(configFile, "utf-8");
      assert.equal(content, sentinel, "existing config must be preserved under keep mode");
      assert.ok(
        result.stdout.includes("keeping"),
        `stdout must indicate keeping, got: ${result.stdout}`,
      );
    });
  });

  // ── AC-10: CONFIG_MODE=backup ────────────────────────────────────

  describe("AC-10: CONFIG_MODE=backup", () => {
    const xdgDir = `/tmp/ai4x-test-config-backup-${process.pid}`;
    const configDir = `${xdgDir}/ai4x`;
    const configFile = `${configDir}/config.yaml`;

    after(() => {
      cleanup(xdgDir);
    });

    it("creates timestamped backup and writes new config", () => {
      cleanup(xdgDir);
      mkdirSync(configDir, { recursive: true });
      const sentinel = "# sentinel — original config\n";
      writeFileSync(configFile, sentinel);

      const result = runMake(
        "install-user-config",
        { CONFIG_MODE: "backup" },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);

      // Verify backup file exists with timestamp pattern
      const files = readdirSync(configDir);
      const backupFiles = files.filter((f) =>
        /^config\.yaml\.backup\.\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(f),
      );
      assert.ok(
        backupFiles.length >= 1,
        `expected at least one backup file, found: ${JSON.stringify(files)}`,
      );

      // Verify backup contains original sentinel
      const backupContent = readFileSync(
        resolve(configDir, backupFiles[0]!),
        "utf-8",
      );
      assert.equal(backupContent, sentinel, "backup must contain original content");

      // Verify new config written
      assert.ok(existsSync(configFile), "new config.yaml must exist");
      const newContent = readFileSync(configFile, "utf-8");
      assert.equal(newContent, expectedConfigContent, "new config must match template");
    });

    it("creates config when absent (no backup needed)", () => {
      cleanup(xdgDir);

      const result = runMake(
        "install-user-config",
        { CONFIG_MODE: "backup" },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);
      assert.ok(existsSync(configFile), "config.yaml must be created");

      // No backup file should exist since there was nothing to back up
      const files = readdirSync(configDir);
      const backupFiles = files.filter((f) => f.includes(".backup."));
      assert.equal(
        backupFiles.length,
        0,
        `no backup file expected when absent, found: ${JSON.stringify(backupFiles)}`,
      );
    });
  });

  // ── AC-11: CONFIG_MODE=force ─────────────────────────────────────

  describe("AC-11: CONFIG_MODE=force", () => {
    const xdgDir = `/tmp/ai4x-test-config-force-${process.pid}`;
    const configDir = `${xdgDir}/ai4x`;
    const configFile = `${configDir}/config.yaml`;

    after(() => {
      cleanup(xdgDir);
    });

    it("overwrites existing without backup", () => {
      cleanup(xdgDir);
      mkdirSync(configDir, { recursive: true });
      const sentinel = "# sentinel — will be overwritten\n";
      writeFileSync(configFile, sentinel);

      const result = runMake(
        "install-user-config",
        { CONFIG_MODE: "force" },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);

      // Verify no backup file
      const files = readdirSync(configDir);
      const backupFiles = files.filter((f) => f.includes(".backup."));
      assert.equal(
        backupFiles.length,
        0,
        `no backup expected under force mode, found: ${JSON.stringify(backupFiles)}`,
      );

      // Verify config overwritten
      const content = readFileSync(configFile, "utf-8");
      assert.equal(content, expectedConfigContent, "config must be overwritten with template");
    });
  });

  // ── AC-12: Config directory resolution ───────────────────────────

  describe("AC-12: config directory", () => {
    it("defaults to $HOME/.config/ai4x when XDG_CONFIG_HOME is unset (static)", () => {
      assert.match(
        makefileContent,
        /\$\{XDG_CONFIG_HOME:-\$\$HOME\/\.config\}/,
        "Makefile must use XDG_CONFIG_HOME with $HOME/.config fallback",
      );
    });

    it("respects XDG_CONFIG_HOME override", () => {
      const xdgDir = `/tmp/ai4x-test-config-xdg-${process.pid}`;
      const configFile = `${xdgDir}/ai4x/config.yaml`;

      cleanup(xdgDir);
      try {
        const result = runMake(
          "install-user-config",
          { CONFIG_MODE: "keep" },
          { XDG_CONFIG_HOME: xdgDir },
        );
        assert.equal(result.exitCode, 0, `install-user-config failed: ${result.stderr}`);
        assert.ok(
          existsSync(configFile),
          `config must be created at XDG_CONFIG_HOME path: ${configFile}`,
        );
      } finally {
        cleanup(xdgDir);
      }
    });
  });

  // ── AC-15: Uninstall preserves config ────────────────────────────

  describe("AC-15: uninstall preserves config", () => {
    const destdir = `/tmp/ai4x-test-config-uninstall-${process.pid}`;
    const xdgDir = `/tmp/ai4x-test-config-uninstall-xdg-${process.pid}`;
    const configFile = `${xdgDir}/ai4x/config.yaml`;

    after(() => {
      cleanup(destdir);
      cleanup(xdgDir);
    });

    it("config survives uninstall", () => {
      cleanup(destdir);
      cleanup(xdgDir);

      // Install (including user config)
      const install = runMake(
        "install",
        { DESTDIR: destdir },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(install.exitCode, 0, `install failed: ${install.stderr}`);
      assert.ok(existsSync(configFile), "config must exist after install");

      // Uninstall
      const uninstall = runMake(
        "uninstall",
        { DESTDIR: destdir },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.equal(uninstall.exitCode, 0, `uninstall failed: ${uninstall.stderr}`);

      // Config must survive
      assert.ok(existsSync(configFile), "config must still exist after uninstall");
      const content = readFileSync(configFile, "utf-8");
      assert.equal(content, expectedConfigContent, "config content must be intact");
    });

    it("uninstall message confirms config preserved", () => {
      cleanup(destdir);
      cleanup(xdgDir);

      runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: xdgDir });
      const result = runMake(
        "uninstall",
        { DESTDIR: destdir },
        { XDG_CONFIG_HOME: xdgDir },
      );
      assert.ok(
        result.stdout.includes("config preserved"),
        `uninstall message must mention config preserved, got: ${result.stdout}`,
      );
    });
  });

  // ── Invalid CONFIG_MODE ──────────────────────────────────────────

  describe("invalid CONFIG_MODE", () => {
    it("rejects unknown value with error and non-zero exit", () => {
      const xdgDir = `/tmp/ai4x-test-config-invalid-${process.pid}`;
      cleanup(xdgDir);
      try {
        const result = runMake(
          "install-user-config",
          { CONFIG_MODE: "bogus" },
          { XDG_CONFIG_HOME: xdgDir },
        );
        assert.notEqual(result.exitCode, 0, "must fail with invalid CONFIG_MODE");
        assert.ok(
          result.stderr.includes("invalid CONFIG_MODE"),
          `stderr must mention invalid CONFIG_MODE, got: ${result.stderr}`,
        );
      } finally {
        cleanup(xdgDir);
      }
    });
  });

  // ── Config content validation ────────────────────────────────────

  describe("config content", () => {
    it("is a valid YAML placeholder with comment header", () => {
      const xdgDir = `/tmp/ai4x-test-config-content-${process.pid}`;
      const configFile = `${xdgDir}/ai4x/config.yaml`;

      cleanup(xdgDir);
      try {
        runMake(
          "install-user-config",
          { CONFIG_MODE: "force" },
          { XDG_CONFIG_HOME: xdgDir },
        );

        const content = readFileSync(configFile, "utf-8");
        const lines = content.split("\n").filter((l) => l.length > 0);
        assert.equal(lines.length, 2, `expected 2 non-empty lines, got ${lines.length}`);
        assert.ok(lines[0]!.startsWith("#"), "line 1 must be a YAML comment");
        assert.ok(lines[1]!.startsWith("#"), "line 2 must be a YAML comment");
        assert.ok(
          lines[0]!.includes("ai4x"),
          "line 1 must reference ai4x",
        );
      } finally {
        cleanup(xdgDir);
      }
    });
  });

  // ── Adversarial ──────────────────────────────────────────────────

  describe("adversarial", () => {
    it("CONFIG_MODE with shell metacharacters fails safely", () => {
      const xdgDir = `/tmp/ai4x-test-config-adversarial-${process.pid}`;
      cleanup(xdgDir);
      try {
        const result = runMake(
          "install-user-config",
          { CONFIG_MODE: "keep;echo pwned" },
          { XDG_CONFIG_HOME: xdgDir },
        );
        assert.notEqual(
          result.exitCode,
          0,
          "must fail with metacharacter-laden CONFIG_MODE",
        );

        // Must not have created a config file (command should have aborted)
        const configDir = `${xdgDir}/ai4x`;
        if (existsSync(configDir)) {
          const files = readdirSync(configDir);
          assert.equal(
            files.length,
            0,
            `config dir must be empty after rejected CONFIG_MODE, found: ${JSON.stringify(files)}`,
          );
        }
      } finally {
        cleanup(xdgDir);
      }
    });
  });
});
