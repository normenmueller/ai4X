# ai4X Review Protocol

This file is the binding development protocol for reviews in the ai4X context.

Trigger example: `Please run a review according to @adm/dev/protocols/review.md.`

## 1) Target State and Posture (MUST)

- Execute a neutral, objective, and highly professional review.
- Award 10/10 only when evidence robustly supports it.
- No findings for the sake of finding issues.
- Focus: correctness, robustness, maintainability, clarity, consistency, and practical usefulness.
- Review output is findings-first, scan-friendly, and decision-ready.
- Review output is concise and high-signal; avoid essay structure, filler, and decorative narration.
- The reader must see verdict, impact, and required next action immediately.

## 2) Review Scope (MUST)

- Software:
  - all TypeScript applications in the project landscape
  - architecture, module boundaries, error handling, side effects, logging, test depth, performance fit
  - decision quality on custom implementations vs. established libraries
- Gen AI:
  - `kob`, `ccp`, `tcp`, with special focus on reusable public capability contracts
  - wording quality, determinism, agent usability, structural usability for AI clients
- Documentation:
  - complete documentation tree in the project landscape (`doc/usr/*`, `doc/agn/*`, `adm/dev/*`, relevant module docs)
  - freshness, consistency, correctness, comprehensibility, low redundancy, referenceability
  - central routing accuracy in `doc/agn/source-map.md`
- Planning and governance:
  - `adm/dev/protocols/workflow.md`, `adm/pln/rdmp.md`, `adm/pln/inbox|assessed|accepted|rejected|realized`
  - compliance with assessment/approval contract (no transition to `accepted/` and no roadmap change without explicit approval)
  - consistency between roadmap slots and task status (`Working -> wip`, `Soonish -> open`, `Icebox -> none`)
- Operations:
  - `adm/ops/runbooks/UAT.md`, `adm/dev/protocols/handover.md`, `adm/ops/reports/handover.md`
  - operational usability, freshness, and reproducibility of procedures
  - mandatory handover live-context blocks:
    - git/submodule live state
    - roadmap focus and externalized/private task note
    - quality evidence snapshot
    - governance snapshot
    - external dependency register
  - optionally assess maintainer operations via GitHub CLI (`gh`) (PR/release/checks)
  - missing `gh` is not a runtime defect for `ask`/`kob`/`ai4x`
  - approved governance exception: owner-only emergency direct pushes to `trunk` are allowed when post-fact review evidence exists

Rating context:
- CI/CD pipelines are intentionally not part of the verdict.

## 3) Hard Guardrails (MUST)

- No workaround/retro language; target-state wording must be consistently fresh.
- No unnecessary duplication; prefer clear references.
- No information loss: ask explicitly before any deletion.
- Reviews are read-only by default:
  - no fixes/features/refactors without explicit user approval
- If implementation is approved later:
  - secure baseline first (commit/tag/push per user request)
  - then execute cleanly scoped, test-backed implementation
- After explicit approval (MUST):
  - update implementations, Cog/Tec capability specifications, and documentation consistently in the affected scope
  - fresh target-state wording is mandatory (no workarounds, no migration paths, no grafted add-ons, no retro language)
  - quality benchmark is binding `AGENTS.md` plus the active development protocols/contracts
- Language policy contract (MUST):
  - translate: documentation and TypeScript code documentation
  - do not translate: capability bundles under `mod/kob/agn/**/ccc/**`, `mod/cap/cog/cap/**`, `mod/cap/tec/cap/**`
  - `AGENTS.md` files are excluded from mandatory translation
  - outside `adm/pln/`, English is required for documentation by default
  - within `adm/pln/`, apply the language policy defined in `adm/dev/protocols/workflow.md`

## 4) Execution (MUST)

1. Baseline and context
- capture repo status, open changes, relevant artifacts, and contracts
- validate that the governing bootstrap chain was followed explicitly:
  - `AGENTS.md`
  - `adm/dev/protocols/workflow.md`
  - required task-specific protocol(s)
- validate submodule status and pointer consistency in integration repo
- capture runtime context (OS, shell, relevant tool/runtime versions)
- record explicit scope boundaries (what was reviewed and what was intentionally excluded)
- make rating assumptions transparent

2. Software review
- validate structural and design-pattern consistency across TypeScript CLIs
- validate entry point vs. domain-logic separation
- validate logging and error semantics consistency
- validate side effects and deterministic behavior
- validate ask config contract (`adapter/run/options`, optional `params`, param gates)
- validate provider-resume contract across supported CLI clients (including fallback for missing sessions and moved-workspace cases)
- validate test quality (unit/contract/runtime coverage, gate strictness)
- assess dependency decisions and custom implementation choices

3. Gen-AI review
- validate cognitive and technical capability docs for clear trigger, clear action, clear fallback
- validate clause quality for `Purpose`, `Trigger`, `Fallback`, and `Minimal Output Contract` beyond heading presence alone
- validate consistency, determinism, and agent agnosticism
- validate structure for runtime usability across clients
- validate that governed agent/capability text artifacts do not use emojis
- validate that capability `Trigger` wording stays semantic and does not collapse into slash commands, client commands, UI actions, or runtime-specific invocation syntax
- validate strategic evaluation artifacts for semantic precision and operational clarity
- validate portfolio quality for discoverability, non-redundancy, and low-coupling composition
- validate terminology consistency and semantic boundary clarity across neighboring capabilities
- validate for new or materially changed capabilities that nearest-neighbor comparison and primary semantic owner judgment were made explicitly before admission
- validate that `do_not_use_when` and `distinguish_from` are neither unjustifiably empty nor oversized substitutes for a sharper capability boundary
- validate capability selection surfaces for explicit applicability boundaries:
  - what the capability is for
  - when it should be used
  - when it should not be used
  - which requirements are true prerequisites
  - which exclusions are real conflicts
  - how nearby capabilities are distinguished
- validate that new capabilities solve a recurrent reasoning problem instead of rephrasing generic best practice
- if the review touches capability quality, capability placement, or governance boundaries between `ccp`, `tcp`, and governance, make that judgment explicitly through `adm/dev/contracts/capability-quality.md` and `adm/dev/protocols/capability-judgment.md`

4. Documentation review
- validate information architecture, reading flow, and link consistency
- validate language quality for freshness and timelessness
- validate that governed documentation artifacts do not use emojis
- validate documentation terminology and README box usage against `doc/agn/governance-model.md`
- validate central routing accuracy and freshness in `doc/agn/source-map.md`
  - newly introduced or reclassified canonical sources are represented where needed
  - stale, dead, or misleading routing entries are treated as documentation defects
- validate language-policy compliance:
  - translate scope: documentation and TypeScript code documentation
  - excluded scope: `AGENTS.md`, `mod/kob/agn/**/ccc/**`, `mod/cap/cog/cap/**`, `mod/cap/tec/cap/**`
  - planning docs under `adm/pln/` follow `adm/dev/protocols/workflow.md`
- identify orphan documents, duplicates, and unclear terms
- for central diagrams (for example in primer), validate Mermaid renderability
- validate planning contract:
  - `inbox` only `Proposal/draft`
  - `assessed` only `Proposal/assessed`
  - `accepted` only `Task/none|open|wip|blocked`
  - `rejected|realized` only `status: done` with correct `tags`
- validate accepted-task handoff completeness for future `assessed -> accepted` transitions:
  - accepted task contains `# Content`
  - accepted task contains `## Plan`
  - `## Plan` contains one fenced text block
  - the fenced text block contains one directly copy-pasteable `/plan ...` prompt
  - the `/plan` prompt is derived from the approved task content instead of restating only the title
- validate approval contract:
  - proposal assessment ends with decision proposal
  - no pre-approval transition
- validate realized-package history logging:
  - every realized implementation package has a matching `../HISTORY.md` entry for the current day
  - missing required `../HISTORY.md` updates are treated as incomplete delivery evidence
- validate handover contract completeness/freshness:
  - all mandatory live-context blocks are present in `adm/ops/reports/handover.md`
  - each live-context block includes point-in-time capture and re-check rule
  - no stale static claims without executable re-check command
  - the handover is cold-start capable for a fresh agent without prior ai4X context
  - the handover includes the current bootstrap, governance-model, and lifecycle entry sources

5. Security/supply-chain review
- scan for secret leakage in repo and docs
- validate dependency risks (especially production high/critical findings)
- validate license/compliance risks for new dependencies and external artifacts
- identify unsafe shell/file operations, path manipulation, and permission assumptions

6. Scoring and verdict
- provide separate ratings for software, gen AI, and documentation
- justify overall verdict transparently
- award 10/10 only when no substantial gaps remain

7. Update follow-up on approval
- if implementation was approved, explicitly verify and report whether code, capability specs, and documentation were all updated consistently
- report deviations as findings; do not treat as implicitly done

## 5) Minimum Evidence Standard (MUST)

A review is valid only if the following minimum evidence is provided per area:

- Software: at least 5 concrete evidences (`path:line`), including
  - at least 2 from runtime/orchestration logic
  - at least 2 from tests/gates
  - at least 1 from architecture/module boundaries
- Gen AI: at least 5 concrete evidences (`path:line`), including
  - at least 2 from `kob`
  - at least 2 from `tcp`
  - at least 1 from `ccp` (rule/structure consistency)
- Documentation: at least 5 concrete evidences (`path:line`), including
  - at least 2 from system-wide explanatory docs (`doc/usr/*` and `doc/agn/*`), including at least 1 from each subtree
  - at least 2 from module READMEs
  - at least 1 from module-specific deep documentation under `adm/dev/*` or module user docs
- Planning/governance: at least 3 concrete evidences (`path:line`), including
  - at least 1 from `adm/dev/protocols/workflow.md`
  - at least 1 from the governing task-specific protocol when protocol compliance is in scope
  - at least 1 from `adm/pln/rdmp.md`
  - at least 1 from `adm/pln/*` artifacts (`inbox|assessed|accepted|rejected|realized`)

If minimum evidence cannot be reached:
- explicitly state why
- mark result as `provisional`
- request missing evidence in `NEXT_STEP`

## 5a) Evidence Typing (MUST)

- Every substantial statement is labeled `observed` or `inferred`.
- `observed` means directly verifiable through artifacts, command output, or test/gate results.
- `inferred` means derived from observed facts and must include derivation basis.
- Unsupported assumptions are not allowed.

## 6) Finding Rules (MUST)

- Findings first, sorted by severity (high -> medium -> low).
- Language-policy violations outside the excluded scope are at least `medium` severity in area `docs`.
- Missing handover live-context blocks or missing freshness markers are at least `medium` severity in area `operations/docs`.
- Stale, missing, dead, or materially misleading entries in `doc/agn/source-map.md` are at least `medium` severity in area `docs`.
- A handover that cannot bootstrap a fresh agent into the current ai4X governance chain is at least `medium` severity in area `operations/docs`.
- Missing required `../HISTORY.md` entries for realized implementation packages are at least `medium` severity in area `docs/planning`.
- Owner-only emergency direct push to `trunk` is not a finding if explicitly approved and documented with post-fact review evidence.
- Every finding must include:
  - area (`software|gen-ai|docs|planning|security`)
  - severity (`high|medium|low`)
  - basis (`observed|inferred`)
  - evidence with file/line
  - risk/impact
  - reproducibility (at least one concrete check command or gate hint for `high|medium`)
  - concrete actionable recommendation
- If no findings:
  - explicitly state `no findings`
  - still list residual risks or test gaps

## 7) Scoring Rubric and Thresholds (MUST)

Use these thresholds deterministically:

- `verdict: pass`
  - `overall_score >= 9.5`
  - `software_score >= 9.0`
  - `gen_ai_score >= 9.0`
  - `docs_score >= 9.0`
  - no open `high` findings
- `verdict: conditional`
  - `overall_score >= 7.5` and `< 9.5`
  - or at least one area `< 9.0` without blockers
- `verdict: fail`
  - `overall_score < 7.5`
  - or blocker/`high` findings with production risk

Additional calibration rules:

- Dimension principle (MUST): a finding primarily affects its own area score.
  - A docs finding does not automatically reduce `software_score` or `gen_ai_score`.
  - A planning finding maps to `docs_score` by default unless explicit causal evidence affects software or gen AI.
  - Cross-dimension downgrades require explicit causal evidence.
- Delta rule (MUST): changes larger than `0.3` points per area compared to last full review require explicit evidence rationale in the report.
- 10.0 rule (MUST): `10.0` is allowed only when
  - no open findings remain
  - all relevant mandatory gates are green
  - no open markers/contract violations remain in rated artifacts
  - capability portfolios are semantically discoverable, materially useful, explicit about applicability boundaries, and free of unresolved overlap that would distort composition

`production_readiness`:
- `yes` only with `pass`
- `with-conditions` only with `conditional` and clearly bounded residual work
- `no` with `fail`

## 8) Normalized Output (MUST)

Use this exact output format:

```text
REVIEW_SUMMARY
overall_score: <0.0-10.0>
software_score: <0.0-10.0>
gen_ai_score: <0.0-10.0>
docs_score: <0.0-10.0>
verdict: <pass|conditional|fail>
production_readiness: <yes|no|with-conditions>
confidence: <high|medium|low>
confidence_rationale: <short evidence-based rationale>

ENV_CONTEXT
repo_root: <absolute path>
captured: <ISO-8601 with timezone>
os: <system>
shell: <shell>
runtime: <runtime versions>
tools: <relevant tool versions>
workspace_state: <clean|dirty|ahead|mixed with short note>
submodule_state: <clean|dirty|mixed with short note>
root_head: <short sha>
root_commit_subject: <subject>
root_ahead_behind: <ahead behind>
module_heads: <short list>
gates: <executed gate list with result>

SCOPE_BOUNDARY
in_scope: <short list>
out_of_scope: <short list>
notes: <rationale for out_of_scope and review assumptions>

FINDINGS
<N> findings
1) [<high|medium|low>] [<software|gen-ai|docs|planning|security>] <short title>
basis: <observed|inferred>
evidence: <path:line>
impact: <1-2 sentences>
repro: <concrete check step or gate>
recommendation: <concrete measure>

DECISION_PROPOSAL
status: <no-action|approval-required>
package_count: <N>
package_1:
title: <short package name>
scope: <affected modules/files>
type: <fix|refactor|feature|docs|security>
rationale: <why required>
risk: <low|medium|high>
effort: <S|M|L>
preconditions: <e.g. baseline tag/commit required>
tests: <which tests/gates must be green>

NEXT_STEP
<one clear next step; for no-action: "No mandatory scope remains.">
```

NEXT_STEP output rule (MUST):
- Formulate as a clear statement, not as a question.

Normalized report style rules (MUST):

- Put the highest-value information first: findings, then verdict, then decision proposal.
- Keep evidence dense and specific; do not wrap findings in long narrative prose.
- State `no findings` just as explicitly and compactly as concrete findings.
- Keep the report readable for both engineering execution and maintainer decision-making.

## 9) Report Artifact (MUST)

The review must be delivered as a file:

- path: `adm/ops/reports/review.md`
- YAML header is mandatory and must have exactly this form:
  ```yaml
  ---
  kind: Report
  status: released
  title: ai4X
  subtitle: Review
  aliases:
    - ai4X - Review Report
  dateCreated: <ISO-8601 with timezone>
  ---
  ```
