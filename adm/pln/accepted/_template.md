# Accepted Task Template

Use this file as the canonical template when a proposal is approved and moved from `adm/pln/assessed/` to `adm/pln/accepted/`.

This template is intentionally stored inside `adm/pln/accepted/` as the one allowed helper artifact in that folder.
Do not treat `_template.md` as an active `Task`.

```yaml
---
title: <task title>
status: open
kind: Task
area: <Planning|Docs|Software|GenAI|Operations>
priority: <high|medium|low>
owner: none
created: YYYY-MM-DD
dateModified: YYYY-MM-DD
tags:
  - task
---
```

# Content

<short execution intent in target-state wording>

## Plan

```text
/plan Build a professional implementation plan for <task title>. Target state: <target state>. Scope: <in-scope work only>. Affected modules/interfaces: <only when relevant>. Acceptance/verification: <relevant gates or acceptance criteria>.
```
