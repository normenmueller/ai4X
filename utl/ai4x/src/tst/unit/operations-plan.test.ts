import assert from "node:assert/strict";
import test from "node:test";

import { buildCleanPlan } from "../../lib/operations/clean.ts";
import type { ModulePaths } from "../../lib/operations/config.ts";
import { buildInstallPlan } from "../../lib/operations/install.ts";

function createModules(): ModulePaths {
  return {
    askDir: "/repos/ask",
    kobDir: "/repos/kob",
    ccpDir: "/repos/ccp",
    tcpDir: "/repos/tcp",
    askSrcDir: "/repos/ask/src",
    kobUtlDir: "/repos/kob/utl/kob",
    kobUtlSrcDir: "/repos/kob/utl/kob/src",
    configModes: {
      ask: "backup",
      kob: "keep",
      ccp: "keep",
      tcp: "keep",
    },
  };
}

test("buildCleanPlan builds deterministic command order", () => {
  const plan = buildCleanPlan(createModules(), { prefix: "/usr/local" });

  assert.equal(plan.commands.length, 2);
  assert.deepEqual(plan.commands[0], {
    command: "make",
    args: ["-C", "/repos/ask", "PREFIX=/usr/local", "uninstall"],
  });
  assert.deepEqual(plan.commands[1], {
    command: "make",
    args: ["-C", "/repos/kob/utl/kob", "PREFIX=/usr/local", "uninstall"],
  });
  assert.equal(plan.nodeModulesDirs.length, 2);
});

test("buildInstallPlan builds deterministic install command order", () => {
  const plan = buildInstallPlan(createModules(), {
    prefix: "/usr/local",
    admin: true,
  });

  assert.equal(plan.commands.length, 9);
  assert.deepEqual(plan.commands[0], {
    id: "ask.npm.ci",
    command: "npm",
    args: ["--prefix", "/repos/ask/src", "ci"],
  });
  assert.deepEqual(plan.commands[3], {
    id: "ask.make.install",
    command: "make",
    args: ["-C", "/repos/ask", "PREFIX=/usr/local", "CONFIG_MODE=backup", "install"],
  });
  assert.deepEqual(plan.commands[4], {
    id: "ask.make.install-system-config",
    command: "sudo",
    args: ["make", "-C", "/repos/ask", "CONFIG_MODE=backup", "install-system-config"],
  });
  assert.deepEqual(plan.commands[8], {
    id: "kob.make.install",
    command: "make",
    args: ["-C", "/repos/kob/utl/kob", "PREFIX=/usr/local", "install"],
  });
  assert.ok(plan.commands.some((entry) => entry.id === "ask.npm.test"));
  assert.ok(plan.commands.some((entry) => entry.id === "ask.npm.verify"));
  assert.ok(plan.commands.some((entry) => entry.id === "kob.npm.test"));
  assert.ok(plan.commands.some((entry) => entry.id === "kob.npm.verify"));
});
