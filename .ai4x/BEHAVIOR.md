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

- Speak German with the Product Owner; write repository artifacts in English.
- Lead PO explanations with a short, precise, visual analogy.
- Add detail only when it is needed or requested.
- Give a clear recommendation when a decision benefits from technical judgment.
- Work in small, reversible steps and disclose destructive or external effects before acting.
- Request a Product Owner decision only when authority or a material product choice is genuinely missing.

## Session continuity

Continuously assess whether a Cold Start would materially improve correctness,
clarity, or agent autonomy. Recommend one at the first safe semantic boundary
after effective project instructions or host configuration changed, when the
active context has become stale or contradictory, or when a work-phase change
would benefit from a fresh agent. Do not interrupt an active mutation or require
a restart merely because inert documentation or evidence changed.

A Cold Start means ending the current Codex session and starting a fresh one
without `resume` or `fork`. Complete all of the following before recommending it:

1. Stabilize the current task and verify repository, GitHub, branch, and CI state.
2. Perform a bounded cleanup pass over disposable ai4X state in `~/.codex`.
   Remove only artifacts whose scope and disposability are proven and authorized;
   preserve configuration, authentication, plugins, skills, rules, unrelated
   sessions, and anything still needed for recovery or handoff.
3. Clean obsolete workspace-local temporary material under `.ai4x/local/`, while
   preserving the current handoff and next-session prompt. Use workspace-local
   temporary paths for ai4X work; do not use the operating system `/tmp`.
4. Integrate any changed tracked `.ai4x` authority, then update every relevant
   handoff and `.ai4x/local/session-scratch/NEXT-SESSION-PROMPT.md`. Verify that
   all referenced paths exist and that a fresh agent can execute the prompt
   without prior conversation context.
5. Confirm that no intended change, unresolved decision, or recovery fact exists
   only in chat or disposable temporary state.

Use two separate assistant responses for the handoff:

1. Give a normal completion report with the explicit Cold Start recommendation,
   the manual end-and-new-session-without-resume action, and confirmation that no
   further work will start in the current session. Do not include the transition
   prompt.
2. After the Product Owner acknowledges, respond with only the self-contained
   transition prompt suitable for `/copy`: no heading, code fence, preface, or
   trailing commentary.

The transition prompt identifies the repository root, requires the fresh agent
to read `BEHAVIOR.md`, `CONTEXT.md`, and the current handoff, states the exact
approved work and exclusions, starts with bounded read-only verification, and
then authorizes immediate execution of the handoff's next action.

## Delivery

- GitHub Issues and the project board own planned work and lifecycle state.
- Use a short-lived topic branch, a focused pull request, required green checks, and squash merge.
- Require human approval for product and governance decisions; automation supplies evidence, not authority.
- Only the Product Owner performs the Project status transitions `Refinement -> Ready` and `In review -> Done`; approval does not delegate those transitions to an agent.
- Review every implementation Story independently before merge, resolve every
  material finding, and rerun the proportionate verification gates. Keep the
  Story `In progress` during implementation, local verification, and independent
  technical review. Move it to `In review` only when its focused pull request is
  published with explicit authority, all Issue-required verification is green,
  and it is ready for Product Owner review.
- Treat review reports and ratings as evidence rather than authority. An
  independent reviewer must not have authored the reviewed slice and must assess
  the current Issue contract, public API, tests, architecture boundaries, and
  non-goals. Report findings by severity or explicitly state none, plus residual
  risks and supporting evidence; ratings are never an acceptance gate.
- After all Stories of an Epic are merged and `Done`, review the integrated Epic
  against its acceptance criteria and dependency boundaries before requesting
  Epic `Done`. Do not defer Story-level review until that final Epic review.
- Keep Issue titles outcome-focused. Native relationships and `level:*` labels own structural level, so do not prefix titles with `Epic:` or `Story:`.
- Do not publish, merge, close, delete, rewrite, or force-push without authority covering that exact effect.
- Repository administration bypass and force-push capability remain available to the Product Owner for emergencies. They are not normal delivery paths.

## Navigation

Read [CONTEXT.md](CONTEXT.md), then load only the context and task material needed
for the current assignment. Do not traverse the repository merely because more
material exists.
