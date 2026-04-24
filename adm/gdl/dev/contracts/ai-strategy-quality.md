# AI Strategy Quality Contract

## Purpose

This contract defines the mandatory quality bar for generative and agentic AI strategy decisions in the ai4X CLI.
It applies whenever model/tool boundaries, fallback behavior, uncertainty handling, or prompt-context policies are defined or changed.

## Scope

Apply this contract to all AI strategy work routed through `ai4x-ai-strategy`.

---

## Output Contract (MUST)

Every non-trivial AI strategy deliverable must contain the following sections:

1. **Task-model fit** — Assessment of whether the task is suitable for the proposed model/tool.
2. **Tooling boundaries** — Explicit limits of what the model/tool can and cannot do.
3. **Failure and fallback strategy** — Defined behavior when the model/tool fails or produces unreliable output.
4. **Prompt-context controls** — Policies governing prompt construction, context window management, and auditability.
5. **Risks and safeguards** — Known risks with concrete mitigation measures.
6. **Rejected alternative and rationale** — At least one rejected approach with concrete rejection reasoning.

## Quality and Challenge Rules (MUST)

- No claims without operational evidence.
- No hidden prompt behavior assumptions.
- Escalate when model limits materially impact reliability.
- Block progression when fallback or uncertainty handling is undefined.
- Challenge at least one optimistic reliability assumption with a concrete failure scenario.
