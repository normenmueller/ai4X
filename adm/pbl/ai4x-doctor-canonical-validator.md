# Doctor as Canonical Validation Interface

## Context

Corpus-Validierung braucht drei Konsumenten:

1. **Entwickler/PO**: `ai4x doctor` — "Ist mein Corpus gesund?"
2. **Agents**: `ai4x-capability-governance` validiert nach Authoring — braucht Feedback.
3. **CI/Make**: Gate-Enforcement vor Merge.

## Vision

`ai4x doctor` ist die kanonische Validierungsschnittstelle. Alle Konsumenten rufen doctor auf:

- Mensch: `ai4x doctor`
- Agent: `ai4x doctor` via Terminal
- Make: `node ai4x.ts doctor`

Das bedeutet: Die Validierungslogik lebt in `cli/src/lib/doctor/` als TypeScript. Die eigenständigen JS-Scripts in `_scaffold/` werden langfristig obsolet — doctor ersetzt sie, nicht ergänzt sie.

## Migration

Für S4 (#41) konkret: Doctor implementiert Metadata-Validierung (AC-12). Die anderen Checks (indexes, shape, agent-neutrality, layout-neutrality) werden in späteren Stories migriert:

- #76 — Doctor: Port indexes check to TypeScript
- #77 — Doctor: Port shape check to TypeScript
- #78 — Doctor: Port agent-neutral check to TypeScript
- #79 — Doctor: Port layout-neutral check to TypeScript

Sobald alle Checks in doctor leben, verschwindet `_scaffold/`.

## Current State

Die Validierungslogik ist **temporär geparkt** unter `cli/src/lib/doctor/_scaffold/`. Diese Scripts sind das Referenz-Scaffold für die TypeScript-Portierung. Sie werden Story für Story durch TypeScript-Pendants in `cli/src/lib/doctor/checks/` ersetzt und danach gelöscht.

## Architectural Invariants

- Validierungslogik ist host-unabhängig und surface-unabhängig.
- Jeder Check ist eine pure Funktion: `(corpusRoot: string) => DiagnosticResult[]`.
- `crp/` enthält null ausführbares Tooling — nur Corpus-Inhalt.
- Doctor ist die einzige Einstiegsstelle für Validierung.

## Related

- [ai4x-agentic-validation-surface.md](ai4x-agentic-validation-surface.md) — Architektur für Agent-optimierte Validierungsoberfläche (MCP Tool, structured JSON).
