import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  readFileSync,
  statSync,
  existsSync,
  rmSync,
  accessSync,
  constants,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "../../..");
const makefileContent = readFileSync(resolve(repoRoot, "Makefile"), "utf-8");

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

function cleanup(destdir: string): void {
  if (existsSync(destdir)) {
    rmSync(destdir, { recursive: true, force: true });
  }
}

describe("Makefile install/uninstall (Story #11)", () => {
  // ── Variable Defaults (static analysis) ──────────────────────────

  describe("variable defaults", () => {
    it("AC-16: PREFIX defaults to /usr/local", () => {
      assert.match(makefileContent, /^PREFIX\s+\?=\s+\/usr\/local$/m);
    });

    it("AC-17: DESTDIR defaults to empty", () => {
      assert.match(makefileContent, /^DESTDIR\s+\?=\s*$/m);
    });

    it("AC-18: BINDIR defaults to $(PREFIX)/bin", () => {
      assert.match(makefileContent, /^BINDIR\s+\?=\s+\$\(PREFIX\)\/bin$/m);
    });

    it("AC-19: completion directory defaults follow XDG conventions", () => {
      assert.match(
        makefileContent,
        /^BASH_COMPLETION_DIR\s+\?=\s+\$\(PREFIX\)\/share\/bash-completion\/completions$/m,
      );
      assert.match(
        makefileContent,
        /^ZSH_COMPLETION_DIR\s+\?=\s+\$\(PREFIX\)\/share\/zsh\/site-functions$/m,
      );
      assert.match(
        makefileContent,
        /^FISH_COMPLETION_DIR\s+\?=\s+\$\(PREFIX\)\/share\/fish\/vendor_completions\.d$/m,
      );
    });
  });

  // ── Install Target ───────────────────────────────────────────────

  describe("install target", () => {
    const destdir = `/tmp/ai4x-test-install-${process.pid}`;
    const configDir = `/tmp/ai4x-test-install-config-${process.pid}`;
    const bindir = `${destdir}/usr/local/bin`;
    const bashDir = `${destdir}/usr/local/share/bash-completion/completions`;
    const zshDir = `${destdir}/usr/local/share/zsh/site-functions`;
    const fishDir = `${destdir}/usr/local/share/fish/vendor_completions.d`;

    before(() => {
      cleanup(destdir);
      cleanup(configDir);
      const result = runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: configDir });
      assert.equal(result.exitCode, 0, `make install failed: ${result.stderr}`);
    });

    after(() => {
      cleanup(destdir);
      cleanup(configDir);
    });

    describe("launcher", () => {
      it("AC-01: launcher file is created", () => {
        assert.ok(existsSync(`${bindir}/ai4x`), "launcher must exist");
      });

      it("AC-02: launcher has 2 lines — shebang and exec node with absolute path", () => {
        const content = readFileSync(`${bindir}/ai4x`, "utf-8");
        const lines = content.split("\n").filter((l) => l.length > 0);
        assert.equal(
          lines.length,
          2,
          `launcher must have exactly 2 non-empty lines, got: ${JSON.stringify(lines)}`,
        );
        assert.equal(lines[0], "#!/usr/bin/env bash", "line 1 must be bash shebang");
        assert.match(
          lines[1]!,
          /^exec node ".+\/cli\/src\/app\/ai4x\.ts" "\$@"$/,
          "line 2 must exec node with absolute path to ai4x.ts",
        );
        const pathMatch = lines[1]!.match(/exec node "(.+?)\/cli\/src\/app\/ai4x\.ts"/);
        assert.ok(pathMatch, "must contain path to ai4x.ts");
        assert.ok(pathMatch![1]!.startsWith("/"), "path must be absolute");
      });

      it("AC-03: launcher has permissions 0755", () => {
        const mode = statSync(`${bindir}/ai4x`).mode & 0o777;
        assert.equal(mode, 0o755, `expected 0755, got 0${mode.toString(8)}`);
      });

      it("AC-04: launcher passes through arguments via $@", () => {
        const content = readFileSync(`${bindir}/ai4x`, "utf-8");
        assert.ok(
          content.includes('"$@"'),
          'launcher must contain "$@" for argument passthrough',
        );
      });
    });

    describe("completions", () => {
      it("AC-05: bash completion installed at correct path with 0644", () => {
        const p = `${bashDir}/ai4x`;
        assert.ok(existsSync(p), "bash completion must exist");
        const mode = statSync(p).mode & 0o777;
        assert.equal(mode, 0o644, `expected 0644, got 0${mode.toString(8)}`);
      });

      it("AC-06: zsh completion installed at correct path with 0644", () => {
        const p = `${zshDir}/_ai4x`;
        assert.ok(existsSync(p), "zsh completion must exist");
        const mode = statSync(p).mode & 0o777;
        assert.equal(mode, 0o644, `expected 0644, got 0${mode.toString(8)}`);
      });

      it("AC-07: fish completion installed at correct path with 0644", () => {
        const p = `${fishDir}/ai4x.fish`;
        assert.ok(existsSync(p), "fish completion must exist");
        const mode = statSync(p).mode & 0o777;
        assert.equal(mode, 0o644, `expected 0644, got 0${mode.toString(8)}`);
      });
    });
  });

  // ── Uninstall Target ─────────────────────────────────────────────

  describe("uninstall target", () => {
    const destdir = `/tmp/ai4x-test-uninstall-${process.pid}`;
    const configDir = `/tmp/ai4x-test-uninstall-config-${process.pid}`;

    before(() => {
      cleanup(destdir);
      cleanup(configDir);
      const install = runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: configDir });
      assert.equal(install.exitCode, 0, `setup install failed: ${install.stderr}`);
      const uninstall = runMake("uninstall", { DESTDIR: destdir });
      assert.equal(uninstall.exitCode, 0, `make uninstall failed: ${uninstall.stderr}`);
    });

    after(() => {
      cleanup(destdir);
      cleanup(configDir);
    });

    it("AC-13: launcher is removed", () => {
      assert.ok(
        !existsSync(`${destdir}/usr/local/bin/ai4x`),
        "launcher must be removed after uninstall",
      );
    });

    it("AC-14: all completion files are removed", () => {
      assert.ok(
        !existsSync(`${destdir}/usr/local/share/bash-completion/completions/ai4x`),
        "bash completion must be removed",
      );
      assert.ok(
        !existsSync(`${destdir}/usr/local/share/zsh/site-functions/_ai4x`),
        "zsh completion must be removed",
      );
      assert.ok(
        !existsSync(`${destdir}/usr/local/share/fish/vendor_completions.d/ai4x.fish`),
        "fish completion must be removed",
      );
    });
  });

  // ── Variable Overrides ───────────────────────────────────────────

  describe("variable overrides", () => {
    const destdir = `/tmp/ai4x-test-override-${process.pid}`;
    const configDir = `/tmp/ai4x-test-override-config-${process.pid}`;

    after(() => {
      cleanup(destdir);
      cleanup(configDir);
    });

    it("custom PREFIX changes all default paths", () => {
      cleanup(destdir);
      cleanup(configDir);
      const result = runMake("install", { DESTDIR: destdir, PREFIX: "/opt/ai4x" }, { XDG_CONFIG_HOME: configDir });
      assert.equal(result.exitCode, 0, `make install failed: ${result.stderr}`);
      assert.ok(existsSync(`${destdir}/opt/ai4x/bin/ai4x`), "launcher at custom PREFIX");
      assert.ok(
        existsSync(`${destdir}/opt/ai4x/share/bash-completion/completions/ai4x`),
        "bash completion at custom PREFIX",
      );
      assert.ok(
        existsSync(`${destdir}/opt/ai4x/share/zsh/site-functions/_ai4x`),
        "zsh completion at custom PREFIX",
      );
      assert.ok(
        existsSync(`${destdir}/opt/ai4x/share/fish/vendor_completions.d/ai4x.fish`),
        "fish completion at custom PREFIX",
      );
    });

    it("custom BINDIR overrides PREFIX/bin", () => {
      cleanup(destdir);
      cleanup(configDir);
      const result = runMake("install", { DESTDIR: destdir, BINDIR: "/custom/bin" }, { XDG_CONFIG_HOME: configDir });
      assert.equal(result.exitCode, 0, `make install failed: ${result.stderr}`);
      assert.ok(existsSync(`${destdir}/custom/bin/ai4x`), "launcher at custom BINDIR");
    });

    it("custom completion dirs override defaults", () => {
      cleanup(destdir);
      cleanup(configDir);
      const result = runMake("install", {
        DESTDIR: destdir,
        BASH_COMPLETION_DIR: "/etc/bash_completion.d",
        ZSH_COMPLETION_DIR: "/etc/zsh/completions",
        FISH_COMPLETION_DIR: "/etc/fish/completions",
      }, { XDG_CONFIG_HOME: configDir });
      assert.equal(result.exitCode, 0, `make install failed: ${result.stderr}`);
      assert.ok(existsSync(`${destdir}/etc/bash_completion.d/ai4x`), "bash at custom dir");
      assert.ok(existsSync(`${destdir}/etc/zsh/completions/_ai4x`), "zsh at custom dir");
      assert.ok(existsSync(`${destdir}/etc/fish/completions/ai4x.fish`), "fish at custom dir");
    });
  });

  // ── Guards ───────────────────────────────────────────────────────

  describe("guards", () => {
    it("AC-20: node missing in PATH → error exit with diagnostic", () => {
      // Build a PATH that excludes every directory containing a node executable.
      const pathDirs = (process.env["PATH"] ?? "").split(":");
      const filtered = pathDirs
        .filter((d) => {
          try {
            accessSync(resolve(d, "node"), constants.X_OK);
            return false;
          } catch {
            return true;
          }
        })
        .join(":");

      const result = runMake(
        "install",
        { DESTDIR: "/tmp/ai4x-guard-test" },
        { PATH: filtered, XDG_CONFIG_HOME: `/tmp/ai4x-test-guard-config-${process.pid}` },
      );
      assert.notEqual(result.exitCode, 0, "make install must fail when node is missing");
      assert.ok(
        result.stderr.includes("node is required"),
        `stderr must contain 'node is required', got: ${result.stderr}`,
      );
    });

    it("AC-21: version guard logic is present in Makefile", () => {
      assert.ok(
        makefileContent.includes("23, 6, 0"),
        "Makefile must contain version threshold [23, 6, 0]",
      );
      assert.ok(
        makefileContent.includes("Node.js >= 23.6.0 required"),
        "Makefile must contain version-check error message",
      );
    });
  });

  // ── Coexistence ──────────────────────────────────────────────────

  describe("coexistence (AC-24)", () => {
    it("make clean runs without error", () => {
      const result = runMake("clean");
      assert.equal(result.exitCode, 0, `make clean failed: ${result.stderr}`);
    });

    it("make verify runs without error", () => {
      const result = runMake("verify");
      assert.equal(result.exitCode, 0, `make verify failed: ${result.stderr}`);
    });
  });

  // ── No install.sh Delegation ─────────────────────────────────────

  describe("no install.sh delegation (AC-25)", () => {
    it("install target does not reference install.sh", () => {
      const lines = makefileContent.split("\n");
      let inInstall = false;
      const installLines: string[] = [];
      for (const line of lines) {
        if (/^install:/.test(line)) {
          inInstall = true;
          installLines.push(line);
        } else if (inInstall && /^\t/.test(line)) {
          installLines.push(line);
        } else if (inInstall && line.length > 0 && !/^\t/.test(line)) {
          break;
        }
      }
      assert.ok(installLines.length > 1, "install target must have recipe lines");
      const installBlock = installLines.join("\n");
      assert.ok(
        !installBlock.includes("install.sh"),
        "install target must not delegate to install.sh",
      );
    });

    it("install target contains inline launcher generation (adversarial: not empty)", () => {
      assert.ok(
        makefileContent.includes('printf') && makefileContent.includes('exec node'),
        "install target must contain inline printf+exec-node launcher generation",
      );
    });
  });

  // ── Idempotency and Adversarial (#16) ────────────────────────────

  describe("idempotency and adversarial (#16)", () => {
    it("install twice in succession succeeds", () => {
      const destdir = `/tmp/ai4x-test-idempotent-${process.pid}`;
      const configDir = `/tmp/ai4x-test-idempotent-config-${process.pid}`;
      cleanup(destdir);
      cleanup(configDir);
      try {
        const first = runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: configDir });
        assert.equal(first.exitCode, 0, `first install failed: ${first.stderr}`);
        const second = runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: configDir });
        assert.equal(second.exitCode, 0, `second install failed: ${second.stderr}`);
        assert.ok(existsSync(`${destdir}/usr/local/bin/ai4x`), "launcher must exist after double install");
      } finally {
        cleanup(destdir);
        cleanup(configDir);
      }
    });

    it("uninstall when nothing is installed succeeds", () => {
      const destdir = `/tmp/ai4x-test-noop-uninstall-${process.pid}`;
      cleanup(destdir);
      try {
        const result = runMake("uninstall", { DESTDIR: destdir });
        assert.equal(result.exitCode, 0, `uninstall on empty DESTDIR failed: ${result.stderr}`);
      } finally {
        cleanup(destdir);
      }
    });

    it("DESTDIR with spaces works correctly", () => {
      const destdir = `/tmp/ai4x test spaces ${process.pid}`;
      const configDir = `/tmp/ai4x-test-spaces-config-${process.pid}`;
      cleanup(destdir);
      cleanup(configDir);
      try {
        const install = runMake("install", { DESTDIR: destdir }, { XDG_CONFIG_HOME: configDir });
        assert.equal(install.exitCode, 0, `install with spaces failed: ${install.stderr}`);
        assert.ok(existsSync(`${destdir}/usr/local/bin/ai4x`), "launcher must exist at spaced path");
        const uninstall = runMake("uninstall", { DESTDIR: destdir });
        assert.equal(uninstall.exitCode, 0, `uninstall with spaces failed: ${uninstall.stderr}`);
        assert.ok(!existsSync(`${destdir}/usr/local/bin/ai4x`), "launcher must be removed");
      } finally {
        cleanup(destdir);
        cleanup(configDir);
      }
    });
  });
});
