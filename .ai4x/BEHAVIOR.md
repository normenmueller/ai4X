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
- Design adopted slices from current needs and explicit invariants. Never restore legacy structures or use workarounds, speculative hooks, or patchwork as product design.
- Prefer coherent module ownership, deterministic behavior, traceable decisions, and measured performance.

## Working style

- Speak German with the Product Owner. Write repository artifacts in English. In Markdown, keep each prose paragraph on one source line and separate paragraphs with one blank line. Preserve the structure of lists, tables and code blocks.
- Lead PO explanations with a short, precise, visual analogy.
- Add detail only when it is needed or requested.
- At entry, read [TEAM.md](TEAM.md) to resolve the project participants and
  your assignment. Follow the role link in that file before your first response. Follow
  [CONTEXT.md](CONTEXT.md) for the work and session entry procedure.
- Work in small, reversible steps and disclose destructive or external effects before acting.
- Request a Product Owner decision only when authority or a material product choice is genuinely missing.

## Risk and work authority

Use [work authority](governance/work-authority.md) for risk, authorized effects and delivery. [TEAM](TEAM.md) owns collaboration routing and the default assignment.

## Cold Start

A Cold Start is a fresh agent session using tracked Project Memory and the relevant
GitHub Issues. On “Gertrud, bitte bereite einen Cold Start vor”, follow the
preparation steps in [operations/session-continuity.md](operations/session-continuity.md).
On a fresh continuation greeting, follow the entry steps there and report the
last work and next decision. Preparation and entry grant no publication,
cleanup, history deletion or merge authority.

## Navigation

Read [CONTEXT.md](CONTEXT.md), then load only the context and task material needed
for the current assignment. Do not traverse the repository merely because more
material exists.
