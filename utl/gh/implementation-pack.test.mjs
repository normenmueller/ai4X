import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  compareImplementationPacks,
  validateFindingTransition,
  validateImplementationPack,
} from "./implementation-pack.mjs";

const revision = "0123456789abcdef0123456789abcdef01234567";
const remediatedRevision = "1123456789abcdef0123456789abcdef01234567";

function openFinding(overrides = {}) {
  return {
    id: "R110-F03",
    severity: "high",
    obligation: "AC-08, AC-09, AC-10, AC-16",
    artifact: "utl/gh/implementation-pack.mjs",
    candidateRevision: revision,
    evidence: "review-b:R110-F03",
    remediation: null,
    verification: "node --test utl/gh/implementation-pack.test.mjs",
    remediationCount: 0,
    rereviewCount: 0,
    status: "open",
    ...overrides,
  };
}

function predecessorOf(finding) {
  return {
    candidateRevision: finding.candidateRevision,
    evidence: finding.evidence,
    verification: finding.verification,
  };
}

function remediatedFinding(open, overrides = {}) {
  return {
    ...open,
    candidateRevision: remediatedRevision,
    evidence: "remediation:R110-F03",
    remediation: "Validate each lifecycle state and bind the exact predecessor provenance.",
    verification: "node --test utl/gh/implementation-pack.test.mjs --test-name-pattern lifecycle",
    remediationCount: 1,
    status: "remediated",
    predecessor: predecessorOf(open),
    ...overrides,
  };
}

function terminalFinding(remediated, status, overrides = {}) {
  const terminal = {
    ...remediated,
    evidence: `re-review:R110-F03:${status}`,
    rereviewCount: 1,
    status,
    predecessor: predecessorOf(remediated),
    rereview: {
      reviewer: "independent-reviewer",
      findingId: remediated.id,
      evidence: "finding-bounded exact-candidate review",
      verification: "focused lifecycle regression passed",
    },
    ...overrides,
  };
  if (status === "escalation-required") {
    terminal.positions = [
      {
        provenance: "reviewer",
        position: "The obligation remains materially unsatisfied.",
        evidence: "review-b:R110-F03:re-review",
      },
      {
        provenance: "implementation-owner",
        position: "The remediation satisfies the obligation.",
        evidence: "remediation:R110-F03",
      },
    ];
    terminal.recommendation = "The Product Owner should decide whether the exact lifecycle proof is sufficient.";
  }
  return terminal;
}

function pack(overrides = {}) {
  const sections = {
    "Authority bindings": [
      "- Work item: `#110`",
      "- Requirements: `sha256:requirements`",
      "- Architecture: `n/a`",
      "- Review A: `sha256:review-a`",
      "- AI Strategy: `sha256:ai-strategy`",
      "- Capability Assessment: `n/a`",
    ],
    "Changed boundaries": ["- `crp/gov/qlt/implementation-quality.md`: revise contract"],
    "Decisions and failure behavior": ["- Reject malformed or oversized sections without repair."],
    "Acceptance evidence": ["- AC-01: `crp/gov/qlt/implementation-quality.md`; governance test P01."],
    "Verification and candidate": [
      `- Candidate identity: \`git:${revision}\``,
      "- Verification: `make verify` -- pass",
    ],
    "Residual risks and follow-ups": ["- `n/a`"],
    ...overrides,
  };

  const body = Object.entries(sections)
    .filter(([, lines]) => lines !== undefined)
    .map(([heading, lines]) => `### ${heading}\n${lines.join("\n")}`)
    .join("\n\n");

  return Buffer.from(`# Pull request\n\n## Summary\n\nBounded change.\n\n## Implementation Pack\n${body}\n\n## Checklist\n\n- [x] Verified\n`, "utf8");
}

function expectFailure(result, kind) {
  assert.equal(result.ok, false);
  assert.equal(result.error.kind, kind);
}

test("accepts the canonical six-section pack and reports raw measures", () => {
  const result = validateImplementationPack(pack());

  assert.equal(result.ok, true);
  assert.equal(result.value.sectionCount, 6);
  assert.equal(result.value.nonEmptyLines > 0, true);
  assert.equal(result.value.utf8Bytes > 0, true);
  assert.equal(result.value.lineLimit, 100);
  assert.equal(result.value.byteLimit, 12_000);
});

test("fails closed for missing, near-match, and duplicate canonical sections", () => {
  expectFailure(validateImplementationPack(Buffer.from("## Summary\nNothing\n")), "IMPLEMENTATION_PACK_MISSING");
  expectFailure(validateImplementationPack(Buffer.from("## implementation pack\nNothing\n")), "IMPLEMENTATION_PACK_MISSING");
  expectFailure(validateImplementationPack(Buffer.concat([pack(), pack()])), "IMPLEMENTATION_PACK_DUPLICATE");
});

test("fails closed for invalid UTF-8", () => {
  const invalid = Buffer.concat([pack(), Buffer.from([0xc3, 0x28])]);
  expectFailure(validateImplementationPack(invalid), "INVALID_UTF8");
});

test("requires the six canonical headings exactly once and in order", () => {
  expectFailure(validateImplementationPack(pack({ "Changed boundaries": undefined })), "PACK_STRUCTURE_INVALID");
  expectFailure(
    validateImplementationPack(pack({ "Changed boundaries": ["- `n/a`"], "Unexpected narrative": ["- prose"] })),
    "PACK_STRUCTURE_INVALID",
  );
});

test("requires concise content or an explicit n/a entry in every section", () => {
  expectFailure(
    validateImplementationPack(pack({ "Changed boundaries": [] })),
    "PACK_SECTION_EMPTY",
  );
});

test("rejects structurally identifiable competing specifications", () => {
  const candidate = pack({ Requirements: ["- The product shall restate upstream behavior here."] });
  expectFailure(validateImplementationPack(candidate), "STRUCTURAL_DUPLICATION");
});

test("requires machine-checkable authority, evidence, and candidate bindings", () => {
  expectFailure(
    validateImplementationPack(pack({ "Authority bindings": ["- Architecture: `n/a`"] })),
    "AUTHORITY_BINDING_MISSING",
  );
  expectFailure(
    validateImplementationPack(pack({ "Acceptance evidence": ["- `n/a`"] })),
    "ACCEPTANCE_EVIDENCE_MISSING",
  );
  expectFailure(
    validateImplementationPack(pack({ "Verification and candidate": ["- Verification: `make verify` -- pass"] })),
    "CANDIDATE_BINDING_MISSING",
  );
});

test("counts whitespace-only lines as empty and retains the terminal CR rule", () => {
  const candidate = Buffer.from(pack().toString("utf8").replace("## Checklist", "   \n\t\n\r\n## Checklist"));
  const base = validateImplementationPack(pack());
  const result = validateImplementationPack(candidate);

  assert.equal(base.ok, true);
  assert.equal(result.ok, true);
  assert.equal(result.value.nonEmptyLines, base.value.nonEmptyLines);
  assert.equal(result.value.utf8Bytes > base.value.utf8Bytes, true);
});

test("accepts exactly 100 non-empty lines and rejects 101", () => {
  const base = validateImplementationPack(pack());
  assert.equal(base.ok, true);
  const needed = 100 - base.value.nonEmptyLines;
  const fillers = Array.from({ length: needed }, (_, index) => `- evidence-${index}`);
  const atLimit = validateImplementationPack(pack({ "Changed boundaries": [
    "- `crp/gov/qlt/implementation-quality.md`: revise contract",
    ...fillers,
  ] }));
  assert.equal(atLimit.ok, true);
  assert.equal(atLimit.value.nonEmptyLines, 100);

  const overLimit = validateImplementationPack(pack({ "Changed boundaries": [
    "- `crp/gov/qlt/implementation-quality.md`: revise contract",
    ...fillers,
    "- one-too-many",
  ] }));
  expectFailure(overLimit, "PACK_TOO_LARGE");
  assert.equal(overLimit.error.nonEmptyLines, 101);
});

test("rejects an oversized prose-heavy duplicate map", () => {
  const repeatedNarrative = Array.from(
    { length: 100 },
    (_, index) => `- Narrative ${index}: repeats behavior already owned by Requirements and code.`,
  );
  const result = validateImplementationPack(pack({
    "Decisions and failure behavior": repeatedNarrative,
  }));
  expectFailure(result, "PACK_TOO_LARGE");
});

test("accepts exactly 12,000 raw UTF-8 bytes and rejects 12,001", () => {
  const baseBuffer = pack({ "Residual risks and follow-ups": ["- "] });
  const base = validateImplementationPack(baseBuffer);
  assert.equal(base.ok, true);
  const marker = "- \n\n## Checklist";
  const source = baseBuffer.toString("utf8");
  const exact = Buffer.from(source.replace(marker, `- ${"x".repeat(12_000 - base.value.utf8Bytes)}\n\n## Checklist`));
  const atLimit = validateImplementationPack(exact);
  assert.equal(atLimit.ok, true);
  assert.equal(atLimit.value.utf8Bytes, 12_000);

  const over = Buffer.from(exact.toString("utf8").replace("\n\n## Checklist", "x\n\n## Checklist"));
  const result = validateImplementationPack(over);
  expectFailure(result, "PACK_TOO_LARGE");
  assert.equal(result.error.utf8Bytes, 12_001);
});

test("compares canonical facts while tolerating only line-ending transport", () => {
  const before = pack();
  const transported = Buffer.from(before.toString("utf8").replaceAll("\n", "\r\n"));
  assert.equal(compareImplementationPacks(before, transported).ok, true);

  const changed = pack({ "Residual risks and follow-ups": ["- A new risk."] });
  expectFailure(compareImplementationPacks(before, changed), "PACK_FACTS_CHANGED");
});

test("accepts exactly one remediation followed by one bounded close or escalation", () => {
  const open = openFinding();
  const remediated = remediatedFinding(open);
  const closed = terminalFinding(remediated, "closed");
  const escalated = terminalFinding(remediated, "escalation-required");

  assert.equal(validateFindingTransition(open, remediated).ok, true);
  assert.equal(validateFindingTransition(remediated, closed).ok, true);
  assert.equal(validateFindingTransition(remediated, escalated).ok, true);
  expectFailure(validateFindingTransition(closed, closed), "FINDING_LOOP_EXHAUSTED");
  expectFailure(validateFindingTransition(escalated, escalated), "FINDING_LOOP_EXHAUSTED");
});

test("rejects unsupported states and state-invalid counters or evidence", () => {
  const open = openFinding();
  const remediated = remediatedFinding(open);
  const closed = terminalFinding(remediated, "closed");

  for (const forgedPrevious of [
    { ...open, status: "pending" },
    { ...open, remediationCount: -1 },
    { ...open, rereviewCount: 1 },
    { ...remediated, remediationCount: 99 },
    { ...remediated, rereviewCount: -5 },
    { ...remediated, rereviewCount: 99 },
    { ...remediated, remediation: undefined },
    { ...remediated, predecessor: undefined },
  ]) {
    expectFailure(validateFindingTransition(forgedPrevious, closed), "FINDING_RECORD_INVALID");
  }
  expectFailure(
    validateFindingTransition(
      { ...remediated, remediationCount: 99, rereviewCount: -5, remediation: undefined },
      closed,
    ),
    "FINDING_RECORD_INVALID",
  );

  for (const forgedTerminal of [
    { ...closed, rereviewCount: 0 },
    { ...closed, rereview: undefined },
    { ...closed, rereview: { ...closed.rereview, findingId: "R110-F99" } },
    { ...closed, remediationCount: 2 },
  ]) {
    expectFailure(validateFindingTransition(remediated, forgedTerminal), "FINDING_RECORD_INVALID");
  }
});

test("rejects skipped, reset, repeated, and identity-changing lifecycle transitions", () => {
  const open = openFinding();
  const remediated = remediatedFinding(open);
  const closed = terminalFinding(remediated, "closed");

  expectFailure(
    validateFindingTransition(open, closed),
    "FINDING_TRANSITION_INVALID",
  );
  expectFailure(
    validateFindingTransition(remediated, { ...open, predecessor: predecessorOf(remediated) }),
    "FINDING_RECORD_INVALID",
  );
  expectFailure(
    validateFindingTransition(remediated, { ...remediated, predecessor: predecessorOf(remediated) }),
    "FINDING_TRANSITION_INVALID",
  );
  expectFailure(
    validateFindingTransition(open, { ...remediated, id: "R110-F04" }),
    "FINDING_ID_CHANGED",
  );
  for (const mutation of [
    { severity: "low" },
    { obligation: "AC-04" },
    { artifact: "utl/gh/implementation-pack.test.mjs" },
  ]) {
    expectFailure(
      validateFindingTransition(open, { ...remediated, ...mutation }),
      "FINDING_IDENTITY_CHANGED",
    );
  }
  expectFailure(validateFindingTransition(closed, open), "FINDING_LOOP_EXHAUSTED");
});

test("requires exact predecessor provenance while allowing explicit evidence renewal", () => {
  const open = openFinding();
  const remediated = remediatedFinding(open);
  const closed = terminalFinding(remediated, "closed");

  assert.notEqual(open.candidateRevision, remediated.candidateRevision);
  assert.notEqual(open.evidence, remediated.evidence);
  assert.notEqual(open.verification, remediated.verification);
  assert.equal(validateFindingTransition(open, remediated).ok, true);
  assert.equal(validateFindingTransition(remediated, closed).ok, true);

  for (const field of ["candidateRevision", "evidence", "verification"]) {
    const forged = structuredClone(remediated);
    forged.predecessor[field] = `forged-${field}`;
    expectFailure(validateFindingTransition(open, forged), "FINDING_PROVENANCE_INVALID");
  }
});

test("requires exactly two evidence-backed escalation positions and a recommendation", () => {
  const open = openFinding();
  const remediated = remediatedFinding(open);
  const escalated = terminalFinding(remediated, "escalation-required");

  for (const mutation of [
    { positions: escalated.positions.slice(0, 1) },
    { positions: [...escalated.positions, escalated.positions[0]] },
    { positions: [{ ...escalated.positions[0], evidence: "" }, escalated.positions[1]] },
    { recommendation: "" },
  ]) {
    expectFailure(
      validateFindingTransition(remediated, { ...escalated, ...mutation }),
      "ESCALATION_EVIDENCE_MISSING",
    );
  }
});

test("exposes the same validator through the file-reading CLI boundary", () => {
  const directory = mkdtempSync(join(tmpdir(), "ai4x-implementation-pack-"));
  const bodyPath = join(directory, "pr-body.md");
  try {
    writeFileSync(bodyPath, pack());
    const result = spawnSync(process.execPath, ["utl/gh/implementation-pack.mjs", "validate", bodyPath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).ok, true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("keeps every direct governance producer and consumer on one authority model", () => {
  const expectations = new Map([
    ["crp/gov/qlt/implementation-quality.md", [
      /concise decision-and-evidence map/u,
      /100 non-empty lines/u,
      /12,000 raw UTF-8 bytes/u,
      /semantic authority, evidence fitness, and duplication review/u,
      /Executable Foundation Closure/u,
    ]],
    ["crp/gov/prc/workflow.md", [
      /transient concise Implementation Pack map/u,
      /exact candidate/u,
      /exactly one canonical `## Implementation Pack` section/u,
      /shapes agent planning, context, capability consumption, or review behavior/u,
    ]],
    [".github/agents/ai4x-implementation.agent.md", [
      /crp\/gov\/qlt\/implementation-quality\.md/u,
      /without restating the implementation/u,
    ]],
    [".github/agents/ai4x-testing-tdd.agent.md", [
      /navigation input, not behavior authority/u,
      /never infer behavior from Pack prose/u,
    ]],
    [".github/agents/ai4x-critical-reviewer.agent.md", [
      /inspect the exact candidate revision/u,
      /stable, bounded lifecycle/u,
    ]],
    ["crp/gov/qlt/review-quality.md", [
      /semantic authority, evidence fitness, and paraphrased duplication/u,
      /one-remediation\/one-independent-re-review lifecycle/u,
    ]],
    ["crp/gov/prc/development-conformance.md", [
      /bind the exact candidate/u,
      /Deterministic Pack validation proves only structure/u,
    ]],
  ]);

  for (const [path, patterns] of expectations) {
    const content = readFileSync(path, "utf8");
    for (const pattern of patterns) assert.match(content, pattern, `${path} lacks ${pattern}`);
  }
});
