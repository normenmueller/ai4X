# Proposal Assessment Protocol

Trigger example:
`Please assess proposal adm/pln/inbox/<slug>.md according to @adm/dev/protocols/proposal-assessment.md.`

## Purpose

Turn a raw proposal into a professional, decision-ready artifact without information loss.

## Required Inputs

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. relevant proposal under `adm/pln/inbox/`
4. relevant module READMEs / contracts if the proposal touches concrete modules

Proposal assessment is governance-valid only after this bootstrap chain was followed explicitly:
`AGENTS.md` -> `adm/dev/protocols/workflow.md` -> this protocol.

## Procedure

1. Validate that the source artifact is a proposal in `adm/pln/inbox/` with `kind: Proposal` and `status: draft`.
2. Sharpen the proposal materially; do not just move the file.
3. Resolve discoverable facts from the repo before asking questions.
4. If high-impact ambiguity remains, ask before finalizing the assessed proposal.
5. Produce a decision-ready artifact with clear scope, value, risks, interfaces, and verification impact.
6. End with an explicit decision proposal.

## Mandatory Output

The assessed proposal must contain:

1. context
2. target state
3. target users and value
4. scope
5. affected modules and interfaces
6. risks and open questions
7. acceptance criteria and verification
8. prioritization proposal
9. decision proposal
10. expert assessment

## Completion Rule

`status: assessed` is valid only when all mandatory chapters are complete and an explicit decision proposal is present.
