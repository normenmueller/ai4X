import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(HERE, "..", "..", "..");
const read = (relative) => readFileSync(path.join(ROOT, relative), "utf8");

test("canonical agent governance references the policy exactly once without numeric duplication", () => {
  const agent = read(".github/agents/ai4x.agent.md");
  assert.equal(agent.match(/\.ai4x\/operations\/session-hygiene\.md/g)?.length, 1);
  assert.doesNotMatch(agent, /30 GiB|1 GiB|300 seconds|256 MiB|32,212,254,720|1,073,741,824|268,435,456/);
});

test("normative workflow declares required contract sections and stable rule identifiers", () => {
  const policy = read(".ai4x/operations/session-hygiene.md");
  for (const heading of [
    "Purpose", "Authority and precedence", "Scope", "Inputs and outputs", "Lifecycle triggers",
    "Invariants", "Stop and escalation conditions", "Evidence obligations", "Next actions",
    "Provenance and trust boundary",
  ]) assert.match(policy, new RegExp(`^## ${heading}$`, "m"));
  for (const id of ["SH-W01", "SH-W02", "SH-W03", "SH-W04", "SH-W05", "SH-W06", "SH-W07", "SH-W08"]) {
    assert.match(policy, new RegExp(`\\b${id}\\b`));
  }
  for (const classification of [
    "constitution-safety", "agents-roles", "delegation-collaboration",
    "governance-lifecycle-authority-routing-work-management", "host-bootstrap-configuration",
    "tracked-ai-host-facade", "capability-context-selection", "inert-documentation",
    "test-evidence-output", "generated-projection", "local-scratch",
  ]) assert.match(policy, new RegExp(`\\b${classification}\\b`));
  assert.match(policy, /fresh-without-resume/);
  assert.match(policy, /fullHistoryApproval = null/);
  assert.doesNotMatch(policy, /30 GiB|1 GiB|300 seconds|256 MiB|32,212,254,720|1,073,741,824|268,435,456/);
  assert.match(policy, /\.\/session-hygiene\.dhall/);
  assert.match(policy, /\.\.\/coordination\/collaboration\.dhall/);
});

test("project-owned ignore contract covers all local runtime state", () => {
  const ignore = read(".ai4x/.gitignore");
  assert.match(ignore, /^local\/$/m);
});

test("production session-hygiene utility exposes no destructive capability", () => {
  const production = ["evaluate.mjs", "projection.mjs", "measure-codex.mjs"]
    .map((name) => read(`util/repository/session-hygiene/${name}`))
    .join("\n");
  assert.doesNotMatch(production, /unlinkSync|rmSync|rmdirSync|renameSync|truncateSync|writeFileSync|appendFileSync|process\.kill|\barchiveSession\b|\bdeleteSession\b|\brepairSession\b/);

  const publisher = read("util/repository/session-hygiene/publish-projection.mjs");
  assert.doesNotMatch(publisher, /unlinkSync|rmSync|rmdirSync|truncateSync|appendFileSync|process\.kill/);
  assert.match(publisher, /session-hygiene-policy\.json/);
});

test("verification runs projection freshness and the complete focused test suite", () => {
  const makefile = read("Makefile");
  assert.match(makefile, /session-hygiene-check:/);
  assert.match(makefile, /session-hygiene-test:/);
  assert.match(makefile, /publish-projection\.mjs --check/);
  assert.match(makefile, /node --test util\/repository\/session-hygiene\/\*\.test\.mjs/);
  assert.match(makefile, /verify:.*session-hygiene-check.*session-hygiene-test/);
});
