# Capability Quality Contract

This contract defines the mandatory evaluation model for capability-related development work in the ai4X public suite.

## Purpose

Capability work must be judged against a stable, explicit quality model instead of implicit taste or convenience.
In ai4X, capability quality must move from formally correct artifacts to semantically robust reusable contracts.

## Mandatory Evaluation Criteria

Every capability under consideration must be judged against the same criteria:

1. `clarity`
- precise scope
- no blurred purpose
- clear problem solved

2. `strictness`
- deterministic trigger/action/fallback
- no vague advice
- no hidden assumptions
- `Purpose`, `Trigger`, `Fallback`, and `Minimal Output Contract` must be materially usable, not only present
- heading presence without decision- or runtime-relevant clause content is a quality defect
- `Trigger` must remain a semantic activation situation, not a slash command, UI action, client command, or runtime-specific invocation syntax

3. `composability`
- atomic enough to combine cleanly
- low hidden coupling
- no unnecessary bundle behavior
- trigger must be distinct enough that neighboring capabilities are not activated by the same practical situation without a clearly different compositional role

4. `agentic suitability`
- directly useful for agent behavior
- not merely human documentation guidance
- operationally reusable in curated agents

5. `semantic purity`
- clearly a cognitive rule when placed in `ccp`
- no spillover from tool implementation, process boilerplate, template ballast, or repository workflow

6. `discoverability`
- selection surface is explicit enough for correct agent choice
- positive applicability is visible through `Purpose` and `Trigger`
- negative applicability, prerequisites, exclusions, and relevant neighbor boundaries are explicit through canonical metadata
- a neighboring capability can be distinguished without hidden tribal knowledge

## Trigger Differentiation Rule

Each active capability must have a portfolio-distinct trigger or an explicitly justified complementary trigger role.

- a trigger collision without a clearly distinct compositional role is a quality defect
- trigger wording must describe a concrete activation situation, not only a thematic area
- acceptable overlap must be justified by different runtime contribution, output contract, or decision role

## Single Semantic Ownership Rule

Each semantic core must have one primary capability owner.

- neighboring capabilities may depend on, refine, or specialize that core
- they must not duplicate the same semantic center as their primary content
- unresolved semantic overlap is a quality defect, even when no real `conflicts` relation exists
- overlap is acceptable only when a deliberate split across clearly distinct semantic layers is explicitly justified

## New-Capability Admission Discipline

- every new or materially changed capability must identify its nearest semantic neighbors before admission
- the judgment must state why the candidate is not only a renamed, repackaged, or artifact-shaped restatement of an existing semantic core
- the judgment must name the primary semantic owner of the relevant core and explain why that ownership remains clear after admission
- if nearest-neighbor comparison or semantic ownership remains unclear, the correct action is `sharpen`, `split`, `move`, or `drop`, not silent admission

## Terminology and Boundary Consistency Rule

- neighboring capabilities must use terminology consistently enough that the same semantic core is not silently renamed across the portfolio
- if different terms describe the same primary semantic role without an explicit boundary reason, that is a quality defect
- if the same term is used for materially different semantic roles without an explicit distinction, that is a quality defect
- boundary clarification may require wording sharpen, `distinguish_from` sharpen, split, move, or merge

## Mandatory Placement Decision

For every capability, the evaluator must explicitly decide whether it belongs in:

- `ccp`
- `tcp`
- governance
- or a split between cognitive rule and technical contract

No capability-related decision is complete without this placement judgment.

## Mandatory Output Shape

A valid capability judgment must provide:

- concise purpose statement
- explicit discoverability/applicability judgment
- criterion-by-criterion judgment
- nearest-neighbor comparison for new or materially changed capabilities
- explicit placement decision
- explicit action decision (`keep|sharpen|split|move|drop`)
- evidence basis
- required follow-up

## Binding Rule

Capability changes are invalid unless this contract has been applied through the canonical capability-judgment protocol.
