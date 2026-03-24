import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveConfigModes, resolveModulePathsFromConfigFile } from "../../lib/operations/config.ts";

function mkdirp(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

test("resolveModulePathsFromConfigFile resolves relative module paths and config modes", () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "ai4x-config-"));
  try {
    mkdirp(path.join(sandbox, "ask", "src"));
    mkdirp(path.join(sandbox, "kob", "utl", "kob", "src"));
    mkdirp(path.join(sandbox, "ccp"));
    mkdirp(path.join(sandbox, "tcp"));

    const configFile = path.join(sandbox, "config.yaml");
    fs.writeFileSync(
      configFile,
      [
        "version: 0.1.0",
        "modules:",
        "  ask: ./ask",
        "  kob: ./kob",
        "  ccp: ./ccp",
        "  tcp: ./tcp",
        "install:",
        "  config_mode:",
        "    ask: force",
        "    tcp: backup",
      ].join("\n"),
      "utf8",
    );

    const resolved = resolveModulePathsFromConfigFile(configFile);
    assert.equal(resolved.askDir, path.join(sandbox, "ask"));
    assert.equal(resolved.kobDir, path.join(sandbox, "kob"));
    assert.equal(resolved.ccpDir, path.join(sandbox, "ccp"));
    assert.equal(resolved.tcpDir, path.join(sandbox, "tcp"));
    assert.equal(resolved.askSrcDir, path.join(sandbox, "ask", "src"));
    assert.equal(resolved.kobUtlDir, path.join(sandbox, "kob", "utl", "kob"));
    assert.equal(resolved.kobUtlSrcDir, path.join(sandbox, "kob", "utl", "kob", "src"));

    assert.equal(resolved.configModes.ask, "force");
    assert.equal(resolved.configModes.kob, "keep");
    assert.equal(resolved.configModes.ccp, "keep");
    assert.equal(resolved.configModes.tcp, "backup");
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

test("resolveConfigModes rejects unknown module keys", () => {
  const root = {
    install: {
      config_mode: {
        wrong: "keep",
      },
    },
  } as unknown as Record<string, unknown>;

  assert.throws(
    () => resolveConfigModes(root, "/tmp/config.yaml"),
    /unknown install\.config_mode\.wrong/,
  );
});
