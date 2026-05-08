---
version: 1.0.0
last_updated: 2026-05-06
---

# Requirements Quality Contract

## Purpose

This contract defines the mandatory quality bar for requirements engineering in the ai4X CLI.
It applies whenever Ideas are refined into Epics or when Story-level acceptance criteria are produced.

## Scope

Apply this contract to all requirements work routed through `ai4x-requirements`.

---

## Output Contract (MUST)

Every non-trivial requirements deliverable must contain the following sections:

1. **Problem statement** — Clear description of the problem being solved.
2. **In-scope and out-of-scope** — Explicit boundaries of what is and is not included.
3. **Constraints and assumptions** — Known constraints with sources; assumptions with risk-if-wrong.
4. **Acceptance criteria** — Testable criteria in EARS format (see below).
5. **Rejected alternatives and rationale** — At least one rejected approach with concrete rejection reasoning.
6. **Risks and unresolved decisions** — Known risks and any decisions that remain open.

## EARS Format (MUST)

All acceptance criteria must use [EARS (Easy Approach to Requirements Syntax)](https://alistairmavin.com/ears/) patterns:

- **Ubiquitous:** `The [system] shall [action].`
- **Event-driven:** `When [event], the [system] shall [action].`
- **State-driven:** `While [state], the [system] shall [action].`
- **Optional:** `Where [condition], the [system] shall [action].`
- **Unwanted behavior:** `If [condition], then the [system] shall [action].`

Do not produce acceptance criteria in free-form prose. Every criterion must match one of these patterns.

## Quality and Challenge Rules (MUST)

- Do not accept vague requirements.
- Reject hidden defaults and implicit behavior.
- Escalate contradictions as concrete decision questions.
- Block progression if acceptance criteria are not objectively testable.
- Reject acceptance criteria that do not follow EARS syntax.
- Challenge at least one key assumption explicitly in every non-trivial requirements pass.
