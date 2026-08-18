import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadMetadata } from "./repo-metadata.mjs";
import {
  LABEL_AXES,
  diffLabelRecords,
  labelRecordsFromConfig,
  planLabelReconciliation,
} from "./repo-labels.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const TARGET = "normenmueller/ai4X";

const FAKE_GH = `#!/usr/bin/env node
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

const fixture = JSON.parse(readFileSync(process.env.FAKE_GH_FIXTURE, "utf8"));
const args = process.argv.slice(2);
if (args[0] === "auth" && args[1] === "status") process.exit(0);
if (args[0] === "repo") {
  process.stderr.write("unbound repo lookup is forbidden\\n");
  process.exit(70);
}
if (args[0] !== "api") process.exit(71);

const methodIndex = args.indexOf("-X");
const method = methodIndex === -1 ? "GET" : args[methodIndex + 1];
const endpoint = args.find((arg) => arg.startsWith("repos/"));
if (!endpoint) process.exit(72);
const write = method !== "GET";
appendFileSync(process.env.FAKE_GH_LOG, JSON.stringify({ cwd: process.cwd(), method, endpoint, args, write }) + "\\n");

if (write) {
  const counterPath = process.env.FAKE_GH_COUNTER;
  const count = Number(readFileSync(counterPath, "utf8")) + 1;
  writeFileSync(counterPath, String(count));
  if (fixture.failWriteAt === count) {
    process.stderr.write("synthetic write failure\\n");
    process.exit(73);
  }
  process.stdout.write("{}\\n");
  process.exit(0);
}

if (endpoint === \`repos/\${fixture.target}\`) {
  process.stdout.write(fixture.about + "\\n");
  process.exit(0);
}
if (endpoint === \`repos/\${fixture.target}/topics\`) {
  process.stdout.write(fixture.topics.join("\\n") + "\\n");
  process.exit(0);
}
if (endpoint === \`repos/\${fixture.target}/labels?per_page=100\`) {
  if (fixture.labelReadFailure) {
    process.stderr.write("synthetic label read failure\\n");
    process.exit(74);
  }
  process.stdout.write(fixture.malformedLabels ? "not-json" : JSON.stringify(fixture.labelPages));
  process.exit(0);
}
process.stderr.write(\`unexpected endpoint: \${endpoint}\\n\`);
process.exit(75);
`;

function withFakeProvider(overrides, assertion) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ai4x-repo-metadata-"));
  const bin = path.join(root, "bin");
  const foreignCwd = path.join(root, "foreign");
  const fixturePath = path.join(root, "fixture.json");
  const logPath = path.join(root, "calls.jsonl");
  const counterPath = path.join(root, "counter");
  mkdirSync(bin);
  mkdirSync(foreignCwd);
  const ghPath = path.join(bin, "gh");
  writeFileSync(ghPath, FAKE_GH);
  chmodSync(ghPath, 0o755);
  writeFileSync(logPath, "");
  writeFileSync(counterPath, "0");

  const metadata = loadMetadata();
  const labels = metadata.labels.map((label) => ({ ...label }));
  const fixture = {
    target: TARGET,
    about: metadata.about,
    topics: metadata.topics,
    labelPages: [labels],
    malformedLabels: false,
    labelReadFailure: false,
    failWriteAt: null,
    ...overrides,
  };
  writeFileSync(fixturePath, JSON.stringify(fixture));

  try {
    const run = (mode) => spawnSync("node", [path.join(HERE, "repo-metadata.mjs"), mode], {
      cwd: foreignCwd,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        GH_REPO: "attacker/ai4X",
        FAKE_GH_FIXTURE: fixturePath,
        FAKE_GH_LOG: logPath,
        FAKE_GH_COUNTER: counterPath,
      },
    });
    const calls = () => readFileSync(logPath, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assertion({ run, calls, metadata, labels, foreignCwd });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function config() {
  return Object.fromEntries(LABEL_AXES.map((axis, index) => [
    axis,
    {
      color: ["D8C7F0", "B9DCF2", "BFE3D0", "F4D0AE", "EDB8C4"][index],
      values: { sample: `${axis} description` },
    },
  ]));
}

test("loads the checked-in repository metadata contract", () => {
  const result = spawnSync("node", [path.join(HERE, "repo-metadata.mjs"), "--check-local"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local metadata contract: ok/);
});

test("remote check fails closed when GitHub authentication is unavailable", () => {
  const ghConfig = mkdtempSync(path.join(os.tmpdir(), "ai4x-gh-auth-"));
  try {
    const result = spawnSync("node", [path.join(HERE, "repo-metadata.mjs"), "--check"], {
      encoding: "utf8",
      env: { ...process.env, GH_CONFIG_DIR: ghConfig, GH_TOKEN: "", GITHUB_TOKEN: "" },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /gh auth is required for remote drift check/);
    assert.doesNotMatch(result.stdout, /remote metadata check: ok/);
  } finally {
    rmSync(ghConfig, { recursive: true, force: true });
  }
});

test("expands one color per closed taxonomy axis", () => {
  const records = labelRecordsFromConfig(config());
  assert.deepEqual(records.map(({ name }) => name), [
    "aspect:sample",
    "kind:sample",
    "level:sample",
    "signal:sample",
    "topic:sample",
  ]);
  for (const record of records) {
    const axis = record.name.split(":", 1)[0];
    assert.equal(record.color, config()[axis].color);
  }
});

test("applies an explicit per-label color override without changing its axis peers", () => {
  const overridden = config();
  overridden.kind.values.bug = "bug description";
  overridden.kind.overrides = { bug: "E85D68" };
  const records = labelRecordsFromConfig(overridden);

  assert.equal(records.find(({ name }) => name === "kind:bug").color, "E85D68");
  assert.equal(records.find(({ name }) => name === "kind:sample").color, "B9DCF2");
});

test("rejects open, incomplete, and malformed label contracts", () => {
  const missing = config();
  delete missing.signal;
  assert.throws(() => labelRecordsFromConfig(missing), /label axes keys must be exactly/);

  const extra = config();
  extra.other = { color: "ABCDEF", values: { sample: "other description" } };
  assert.throws(() => labelRecordsFromConfig(extra), /label axes keys must be exactly/);

  const lowercase = config();
  lowercase.kind.color = "b9dcf2";
  assert.throws(() => labelRecordsFromConfig(lowercase), /uppercase hexadecimal/);

  const unknownEntryKey = config();
  unknownEntryKey.kind.exception = "E85D68";
  assert.throws(() => labelRecordsFromConfig(unknownEntryKey), /keys must be color, values, and optional overrides/);

  const unknownOverride = config();
  unknownOverride.kind.overrides = { bug: "E85D68" };
  assert.throws(() => labelRecordsFromConfig(unknownOverride), /overrides unknown value/);

  const lowercaseOverride = config();
  lowercaseOverride.kind.overrides = { sample: "e85d68" };
  assert.throws(() => labelRecordsFromConfig(lowercaseOverride), /override must be six uppercase hexadecimal/);

  const redundantOverride = config();
  redundantOverride.kind.overrides = { sample: redundantOverride.kind.color };
  assert.throws(() => labelRecordsFromConfig(redundantOverride), /override must differ/);

  const invalidSlug = config();
  invalidSlug.topic.values["Not Valid"] = "description";
  assert.throws(() => labelRecordsFromConfig(invalidSlug), /invalid value/);

  const paddedDescription = config();
  paddedDescription.aspect.values.sample = " padded ";
  assert.throws(() => labelRecordsFromConfig(paddedDescription), /non-empty, trimmed description/);

  const longDescription = config();
  longDescription.level.values.sample = "x".repeat(101);
  assert.throws(() => labelRecordsFromConfig(longDescription), /exceeds 100/);
});

test("detects missing, undeclared, and mismatched remote labels", () => {
  const expected = labelRecordsFromConfig(config());
  const observed = expected.slice(1).map((record) => ({ ...record, color: record.color.toLowerCase() }));
  observed[0] = { ...observed[0], description: "changed" };
  observed.push({ name: "legacy:label", color: "ABCDEF", description: null });

  assert.deepEqual(diffLabelRecords(expected, observed), {
    missing: [expected[0].name],
    extra: ["legacy:label"],
    mismatched: [{ name: observed[0].name, fields: ["description"] }],
  });
});

test("refuses undeclared labels without producing deletion operations", () => {
  const expected = labelRecordsFromConfig(config());
  const observed = [...expected, { name: "legacy:label", color: "ABCDEF", description: "legacy" }];
  const plan = planLabelReconciliation(expected, observed);

  assert.equal(plan.ok, false);
  assert.equal(plan.reason, "undeclared-labels");
  assert.deepEqual(plan.operations, []);
});

test("plans only deterministic create and update operations", () => {
  const expected = labelRecordsFromConfig(config());
  const observed = expected.slice(1).map((record, index) => index === 0
    ? { ...record, color: "ABCDEF" }
    : record);
  const plan = planLabelReconciliation(expected, observed);

  assert.equal(plan.ok, true);
  assert.deepEqual(plan.operations.map(({ action, label }) => [action, label.name]), [
    ["create", expected[0].name],
    ["update", observed[0].name],
  ]);
  assert.ok(plan.operations.every(({ action }) => action === "create" || action === "update"));
});

test("remote check binds every provider call to origin despite foreign cwd and GH_REPO", () => {
  withFakeProvider({}, ({ run, calls, foreignCwd }) => {
    const result = run("--check");
    assert.equal(result.status, 0, result.stderr);
    assert.notEqual(foreignCwd, REPO_ROOT);
    assert.ok(calls().length >= 3);
    assert.ok(calls().every((call) => call.cwd === REPO_ROOT));
    assert.ok(calls().every((call) => call.endpoint.startsWith(`repos/${TARGET}`)));
    assert.doesNotMatch(result.stderr, /unbound repo lookup/);
  });
});

test("remote check consumes complete multi-page label evidence", () => {
  const metadata = loadMetadata();
  const labels = metadata.labels.map((label) => ({ ...label }));
  withFakeProvider({ labelPages: [labels.slice(0, 7), labels.slice(7, 14), labels.slice(14)] }, ({ run }) => {
    const result = run("--check");
    assert.equal(result.status, 0, result.stderr);
  });
});

test("remote check reports every label drift class without mutation", () => {
  const metadata = loadMetadata();
  const labels = metadata.labels.map((label) => ({ ...label }));
  const cases = [
    ["missing", labels.slice(1), /remote labels missing/],
    ["extra", [...labels, { name: "legacy:label", color: "ABCDEF", description: "legacy" }], /undeclared remote labels/],
    ["name", [{ ...labels[0], name: "renamed:label" }, ...labels.slice(1)], /remote labels missing.*undeclared remote labels/s],
    ["color", [{ ...labels[0], color: "ABCDEF" }, ...labels.slice(1)], /metadata mismatch.*color/],
    ["description", [{ ...labels[0], description: "changed" }, ...labels.slice(1)], /metadata mismatch.*description/],
  ];

  for (const [name, remoteLabels, diagnostic] of cases) {
    withFakeProvider({ labelPages: [remoteLabels] }, ({ run, calls }) => {
      const result = run("--check");
      assert.equal(result.status, 1, `${name}: ${result.stderr}`);
      assert.match(result.stderr, diagnostic, name);
      assert.equal(calls().filter(({ write }) => write).length, 0, name);
    });
  }
});

test("remote check fails closed on malformed and inaccessible label evidence", () => {
  for (const [overrides, diagnostic] of [
    [{ malformedLabels: true }, /failed to parse labels/],
    [{ labelReadFailure: true }, /failed to read labels.*synthetic label read failure/],
  ]) {
    withFakeProvider(overrides, ({ run, calls }) => {
      const result = run("--check");
      assert.equal(result.status, 1);
      assert.match(result.stderr, diagnostic);
      assert.equal(calls().filter(({ write }) => write).length, 0);
    });
  }
});

test("apply performs no writes when any undeclared label exists", () => {
  const metadata = loadMetadata();
  const labels = [
    ...metadata.labels.map((label) => ({ ...label })),
    { name: "legacy:label", color: "ABCDEF", description: "legacy" },
  ];
  withFakeProvider({ labelPages: [labels], about: "also changed", topics: ["also-changed"] }, ({ run, calls }) => {
    const result = run("--apply");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /refusing to delete undeclared remote labels/);
    assert.equal(calls().filter(({ write }) => write).length, 0);
  });
});

test("apply emits only required PATCH, PUT, and POST operations against the bound target", () => {
  const metadata = loadMetadata();
  const labels = metadata.labels.map((label) => ({ ...label }));
  const changed = labels.slice(1);
  changed[0] = { ...changed[0], color: "ABCDEF" };
  withFakeProvider({ labelPages: [changed], about: "changed", topics: ["changed"] }, ({ run, calls }) => {
    const result = run("--apply");
    assert.equal(result.status, 0, result.stderr);
    const writes = calls().filter(({ write }) => write);
    assert.deepEqual(writes.map(({ method, endpoint }) => [method, endpoint]), [
      ["PATCH", `repos/${TARGET}`],
      ["PUT", `repos/${TARGET}/topics`],
      ["POST", `repos/${TARGET}/labels`],
      ["PATCH", `repos/${TARGET}/labels/${encodeURIComponent(labels[1].name)}`],
    ]);
    assert.ok(writes.every(({ method }) => method !== "DELETE"));
    assert.ok(writes.every(({ cwd }) => cwd === REPO_ROOT));
  });
});

test("apply avoids no-op writes when provider metadata already matches", () => {
  withFakeProvider({}, ({ run, calls }) => {
    const result = run("--apply");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /applied normenmueller\/ai4X \(0 metadata changes\)/);
    assert.equal(calls().filter(({ write }) => write).length, 0);
  });
});

test("apply halts after provider failure and reports completed operations", () => {
  const metadata = loadMetadata();
  const labels = metadata.labels.map((label) => ({ ...label }));
  const changed = labels.slice(1);
  changed[0] = { ...changed[0], color: "ABCDEF" };
  changed[1] = { ...changed[1], description: "changed" };
  withFakeProvider({ labelPages: [changed], failWriteAt: 2 }, ({ run, calls }) => {
    const result = run("--apply");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /synthetic write failure/);
    assert.match(result.stderr, new RegExp(`completed: label:create:${labels[0].name}`));
    assert.match(result.stderr, /rerun --check before recovery/);
    const writes = calls().filter(({ write }) => write);
    assert.equal(writes.length, 2);
    assert.equal(writes[0].method, "POST");
    assert.equal(writes[1].method, "PATCH");
    assert.ok(writes.every(({ method }) => method !== "DELETE"));
  });
});
