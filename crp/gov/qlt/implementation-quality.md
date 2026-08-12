---
version: 1.1.0
last_updated: 2026-08-12
---

# Implementation Quality Contract

## Purpose

This contract defines the mandatory quality bar for production implementation deliverables in the ai4X CLI.
It supplements the engineering and TypeScript quality contracts with implementation-specific output and challenge requirements.

## Scope

Apply this contract to all implementation work routed through `ai4x-implementation`.

---

## Implementation Authority (MUST)

Accepted Requirements and Architecture own intent and design constraints. The exact topic-branch candidate owns implementation detail through code, public types and signatures, tests, API documentation, schemas, and generated artifacts. The Implementation Pack is a concise decision-and-evidence map into those authorities. It must not become a second Requirements Pack, Architecture Pack, API or schema specification, test specification, or implementation narrative.

Before PR creation, the map may exist transiently in the active session for Stage 8. The persisted authority is the exact candidate plus one canonical `## Implementation Pack` section in the PR description. A repository Pack document, attachment, or chained companion comment is prohibited.

## Canonical Template (MUST)

The canonical section contains exactly these level-three headings, once and in order:

```md
## Implementation Pack
### Authority bindings
### Changed boundaries
### Decisions and failure behavior
### Acceptance evidence
### Verification and candidate
### Residual risks and follow-ups
```

Each section records only its named information class. Facts already owned upstream or by executable artifacts are referenced, not restated. Every fact has one named authority. All six headings are retained; an inapplicable class contains exactly a concise `n/a` entry rather than filler prose. Authority bindings include the canonical Work Item and immutable Requirements binding. Acceptance evidence maps applicable AC identifiers to exact artifacts, tests, or evidence. Verification includes one exact reproducible candidate identity and exact commands or evidence. The identity may be a Git revision or a deterministic source-set identity when the candidate is still an uncommitted worktree; Review B must verify that it resolves to the exact bytes under review.

The template is language-neutral. Repository-relative paths, symbols, revisions, hashes, commands, schemas, and generated outputs are permitted; product-language-specific paths or framework assumptions are not part of this reusable contract.

## Executable Foundation Closure (MUST)

When accepted upstream authority intentionally leaves one exact implementation boundary open and dependent implementation cannot proceed, the workflow may close that boundary once through executable code, a public type/signature, schema, or generated contract. The foundation closure must remain inside accepted scope and receive an independent, boundary-bounded review before dependent work consumes it. Speculative prose signatures, a second design document, or an unreviewed hidden phase are prohibited.

## Deterministic Boundary (MUST)

The exact section is limited to both 100 non-empty lines and 12,000 raw UTF-8 bytes. Equality is valid; exceeding either limit is rejected. The deterministic validator at `utl/gh/implementation-pack.mjs` owns the executable boundary:

1. The section starts at the exact line `## Implementation Pack` and ends before the next level-two heading or at end of input.
2. The canonical heading and every byte through the section end count; the following heading does not.
3. Missing or repeated canonical headings, near matches, invalid UTF-8, and malformed canonical structure fail closed.
4. Bytes are counted from the raw section before line-ending or Unicode normalization.
5. Lines are split on raw LF bytes. A line is non-empty if it contains a byte other than ASCII space, horizontal tab, or one terminal carriage return.
6. The validator reports both observed measures and both limits. It never truncates, normalizes, repairs, summarizes, or generates replacement prose.
7. Publication compares the canonical facts of the transient map and PR section. Missing, contradictory, or changed facts block publication.

Deterministic verification may reject exact structural duplication, prohibited specification headings, missing bindings, invalid lifecycle transitions, and fixture-defined contradictions. It must never claim semantic completeness, correct implementation, or absence of paraphrased duplication. Independent Review B owns semantic authority, evidence fitness, and duplication review against the exact candidate.

## Material Finding Lifecycle (MUST)

Every material Review B finding records a stable identifier, severity, normative obligation, exact owning authority or artifact, candidate revision, concrete evidence, one minimal remediation, exact verification method, remediation count, re-review count, and status.

- The same finding permits at most one direct remediation and one independent finding-bounded re-review.
- Re-review examines only the stable finding, changed owning artifacts, and evidence-backed regression surface.
- If the obligation remains unsatisfied, stop the author/reviewer loop and escalate one decision to the PO with both evidence-backed positions and one concrete Tech Lead recommendation. Never auto-approve, silently downgrade, rename the same finding, or request another prose rewrite.
- A genuinely different material defect requires a new stable identifier, new concrete evidence, a distinct violated obligation or executable risk, and accepted-scope proof.
- Wording, formatting, style, and ungrounded hypotheticals without a violated obligation or material executable risk are non-blocking observations.

## Quality and Challenge Rules (MUST)

- Never implement implicit defaults.
- Reject requirement ambiguities before coding.
- Keep module boundaries clear across `cli/src/app` and `cli/src/lib`.
- Block progression if required upstream artifacts are missing.
- Keep the Pack within the canonical shape and size budget. Inability to fit requires factoring the Story, upstream authority, or executable foundation; companion prose and ad hoc budget increases are prohibited.
