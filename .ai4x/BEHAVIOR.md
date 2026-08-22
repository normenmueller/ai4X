# ai4X Behavior

This file is the canonical repository behavior and navigation entry point.
External safety and host constraints always apply. Within ai4X, an explicit
Product Owner decision outranks defaults and local convention.

## Principles

- **Agentic-first:** design work so an AI agent can discover, execute, and verify it.
- **Agentic-facing:** keep authoritative context concise, explicit, and progressively loadable.
- **Human-approvable:** expose intent, material effects, risks, and decisions in plain language.
- Prefer established, simple mechanisms over custom ceremony.
- Apply verification in proportion to product risk; never trade away correctness for speed.
- Keep one authority for each fact. Generated and local state are never authorities.
- Use live repository and GitHub state for mutable facts; historical evidence is not current state.
- Keep local, backup, generated, prototype, and research material out of `trunk` until an active product slice deliberately adopts it.

## Working style

- Speak German with the Product Owner; write repository artifacts in English.
- Lead PO explanations with a short, precise, visual analogy.
- Add detail only when it is needed or requested.
- Give a clear recommendation when a decision benefits from technical judgment.
- Work in small, reversible steps and disclose destructive or external effects before acting.
- Request a Product Owner decision only when authority or a material product choice is genuinely missing.

## Delivery

- GitHub Issues and the project board own planned work and lifecycle state.
- Use a short-lived topic branch, a focused pull request, required green checks, and squash merge.
- Require human approval for product and governance decisions; automation supplies evidence, not authority.
- Do not publish, merge, close, delete, rewrite, or force-push without authority covering that exact effect.
- Repository administration bypass and force-push capability remain available to the Product Owner for emergencies. They are not normal delivery paths.

## Navigation

Read [CONTEXT.md](CONTEXT.md), then load only the context and task material needed
for the current assignment. Do not traverse the repository merely because more
material exists.
