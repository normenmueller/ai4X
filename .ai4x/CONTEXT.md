# ai4X Context

Start with [BEHAVIOR.md](BEHAVIOR.md). Then load only what the task needs:

- [context/architecture.md](context/architecture.md) for structure and authority boundaries;
- [context/domain-language.md](context/domain-language.md) for core terminology;
- [operation/session-continuity.md](operation/session-continuity.md) when a
  fresh session begins with only a continuation greeting, including discovery
  of the preferred working checkout from another registered worktree;
- [STATE.md](STATE.md) for the branch-bound return pointer when it applies;
- [governance/work-authority.md](governance/work-authority.md) for risk,
  execution authority, effect bounds, identity, and gate separation;
- [context/need-to-capability.md](context/need-to-capability.md) only for the
  Need-to-Capability architecture and #103;
- [context/curation.md](context/curation.md) only for the canonical Curation
  algebra and type-state flow;
- the owning GitHub Issue for requirements and live status when the work has one;
- the affected source, tests, and nearby documentation for implementation work.

GitHub Issues and the project board own work state. Repository files must not duplicate mutable status, approval, priority, or scheduling facts.
