import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const authorityPath = "crp/gov/qlt/ai-strategy-quality.md";
const authority = read(authorityPath);

test("keeps one current AI-suitability authority and one gated target transfer", () => {
  assert.match(authority, /sole current authority for AI-impact classification/u);
  assert.match(authority, /\.ai4x\/governance\/quality\/ai-strategy\.md/u);
  assert.match(authority, /materialized by #104/u);
  assert.match(authority, /Two\s+simultaneously normative copies are prohibited/u);

  const target = read(".ai4x/planning/target-architecture/target-structure.yaml");
  assert.match(target, /path: "\.ai4x\/governance\/quality\/ai-strategy\.md"[\s\S]*?contentIssue: 104/u);
  assert.equal(existsSync(".ai4x/governance/quality/ai-strategy.md"), false);
});

test("defines a closed Tech Lead-owned classification with all minimum triggers", () => {
  assert.match(authority, /Tech Lead classifies every change as exactly one of/u);
  assert.match(authority, /`ai-impacting`/u);
  assert.match(authority, /`not-ai-impacting`/u);
  for (const id of ["AI-T01", "AI-T02", "AI-T03", "AI-T04", "AI-T05", "AI-T06"]) {
    assert.match(authority, new RegExp(`\\b${id}\\b`, "u"));
  }
  assert.match(authority, /changed\s+scope invalidates the record/u);
  assert.match(authority, /treated as `ai-impacting` pending specialist review/u);
});

test("requires named qualified evidence and preserves human authority", () => {
  for (const pattern of [
    /specialist identity and qualification basis/u,
    /reviewed scope and immutable candidate or planning-artifact identity/u,
    /applicable suitability perspectives and evidence examined/u,
    /findings and required remediations/u,
    /gate result `pass` or `blocked`/u,
    /Missing identity, qualification, scope binding/u,
    /cannot grant PO-owned priority/u,
    /does not replace or weaken Tech\s+Lead orchestration/u,
    /security, privacy, testing, Haskell/u,
  ]) assert.match(authority, pattern);
});

test("covers AI-impacting and deterministic non-AI examples without automatic classification", () => {
  assert.match(authority, /Changing delegation limits, prompt\/context assembly/u);
  assert.match(authority, /Correcting a license identifier or deterministic CI path/u);
  assert.match(authority, /must never infer semantic impact, qualification, or\s+suitability/u);
});

test("keeps every planning, workflow, conformance, and agent consumer on the sole authority", () => {
  const consumers = [
    "adm/gdl/index.yaml",
    "adm/gdl/planning-workflow.md",
    "adm/gdl/planning-conformance.md",
    "crp/gov/prc/workflow.md",
    "crp/gov/prc/development-conformance.md",
    ".github/agents/ai4x.agent.md",
    ".github/agents/ai4x-ai-strategy.agent.md",
    ".github/agents/ai4x-critical-reviewer.agent.md",
  ];
  for (const path of consumers) {
    const content = read(path);
    assert.match(content, /crp\/gov\/qlt\/ai-strategy-quality\.md/u, `${path} lacks the canonical reference`);
    assert.doesNotMatch(content, /\bAI-T0[1-6]\b/u, `${path} copies canonical trigger identifiers`);
  }

  const workflow = read("crp/gov/prc/workflow.md");
  assert.doesNotMatch(workflow, /Story does not involve AI\/LLM behavior/u);
  assert.match(workflow, /required exactly when the Stage-1 classification is `ai-impacting`/u);
});

test("makes missing or stale evidence visible in both conformance surfaces", () => {
  const contract = read("crp/gov/prc/development-conformance.md");
  const template = read("crp/gov/prc/development-conformance-template.md");
  const planning = read("adm/gdl/planning-conformance.md");

  assert.match(contract, /Missing, ambiguous, stale, scope-mismatched, or blocked mandatory evidence blocks conformance/u);
  assert.match(template, /AI-impact classification: ai-impacting \| not-ai-impacting \| missing/u);
  assert.match(template, /AI-suitability specialist evidence: pass \| blocked \| n\/a for not-ai-impacting \| missing/u);
  assert.match(planning, /Missing, stale, ambiguous, scope-mismatched, or blocked AI-suitability evidence/u);
});

test("runs the focused policy suite from the repository verification boundary", () => {
  const makefile = read("Makefile");
  assert.match(makefile, /^verify: .*ai-suitability-policy-test/mu);
  assert.match(makefile, /node --test util\/repository\/ai-suitability\/policy\.test\.mjs/u);
});
