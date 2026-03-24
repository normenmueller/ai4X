# Approval Transition Protocol

Trigger example:
`Please apply the approval-transition protocol for <artifact>.`

## Purpose

Control transitions between planning states and prevent silent roadmap/task drift.

## Scope

This protocol governs transitions involving:

- `adm/pln/assessed/`
- `adm/pln/accepted/`
- `adm/pln/rejected/`
- `adm/pln/realized/`
- `adm/pln/rdmp.md`

## Rules

1. No transition into `accepted/` without explicit approval.
2. No roadmap change without explicit approval.
3. Rejection and realization must be explicit target states, not silent deletion.
4. Status and tags must match folder semantics.
5. `dateModified` must be updated for changed planning artifacts outside `inbox/`.
6. Every future transition from `adm/pln/assessed/` to `adm/pln/accepted/` must add a `## Plan` section to the accepted task.
7. The `## Plan` section must contain exactly one fenced text block with one directly copy-pasteable Codex CLI planning prompt that starts with `/plan `.
8. The `/plan` prompt must be derived from the assessed proposal content, especially the intended target state, in-scope work, affected modules or interfaces, and acceptance or verification expectations.
9. The `/plan` prompt must stay short, direct, and execution-preparatory; approval prose, prioritization prose, and low-value narrative repetition are forbidden in that prompt.

## Mandatory Checks

- folder/status alignment
- title/prefix alignment
- roadmap slot/status consistency
- existence of decision proposal before transition
- explicit approval trace for accepted-roadmap changes
- for future `assessed -> accepted` transitions:
  - accepted artifact includes `# Content`
  - accepted artifact includes `## Plan`
  - `## Plan` contains one fenced text block
  - the fenced text block contains one directly copy-pasteable `/plan ...` prompt

## Completion Rule

A transition is valid only when folder, status, roadmap slot, and approval evidence all align.
For future `assessed -> accepted` transitions, the accepted task is additionally invalid unless the required `## Plan` section and copy-pasteable `/plan ...` prompt are present.
