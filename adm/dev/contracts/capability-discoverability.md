# Capability Discoverability Contract

This contract defines the mandatory capability selection surface for reusable capabilities in the ai4X suite.

## Purpose

Capability portfolios must be selectable and composable from explicit, reproducible signals instead of naming intuition, tribal knowledge, or hidden overlap.

## Selection Surface (MUST)

Every active capability must expose a canonical selection surface across capability text and metadata:

- capability text:
  - `## Purpose`
  - `## Trigger`
- metadata:
  - `do_not_use_when`
  - `requires`
  - `conflicts`
  - `distinguish_from`

This surface is the canonical basis for agent-facing discoverability, applicability judgment, and portfolio index generation.

## Mandatory Meaning (MUST)

1. `Purpose`
- states what the capability is for
- defines the primary job it contributes

2. `Trigger`
- states when the capability should be used
- describes a concrete activation situation, not only a topic area

3. `do_not_use_when`
- states explicit negative applicability boundaries when they matter materially
- may be `[]` only when no additional negative boundary is needed beyond the capability's `Purpose` and `Trigger` and wrong selection is not materially likely

4. `requires`
- lists only true prerequisites
- must not encode preference, convenience, sequencing habit, or loose complementarity

5. `conflicts`
- lists only real mutual exclusion
- must not be used to hide overlap, uncertainty, or taxonomy untidiness

6. `distinguish_from`
- names nearby capabilities that are plausibly confused with this capability and states the boundary
- may be `[]` only when no meaningful confusion risk exists, plausible neighbor confusion is not materially likely, or the distinction is already fully clear from `Purpose` and `Trigger`

## Interpretation Rules (MUST)

- `requires` and `conflicts` are not substitutes for applicability wording.
- Negative applicability must not be left implicit when wrong selection would materially distort composition.
- Empty `do_not_use_when` or `distinguish_from` values are a quality defect when material misselection or confusion risk still exists.
- If two neighboring capabilities cannot be distinguished from their selection surfaces, the portfolio is semantically incomplete.
- If a capability needs broad caveats or broad neighbor explanation to stay valid, that is evidence for `sharpen`, `split`, `move`, or `drop`.
- If `do_not_use_when` or `distinguish_from` grows into a long caveat list that compensates for an unclear semantic boundary, that is evidence for `sharpen`, `split`, `move`, or `drop`.

## Indexing Rule (MUST)

- Portfolio indexes that support composition must expose the canonical selection surface clearly enough for agent selection.
- Indexes are derived aids, not the source of truth.
- If index content and canonical capability content diverge, the capability text and metadata win.

## Binding Rule

Capability-related development work is invalid unless discoverability and applicability were judged through this contract together with the capability-quality contract and the active capability protocols.
