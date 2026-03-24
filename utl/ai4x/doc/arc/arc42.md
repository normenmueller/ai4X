# ai4x Utility Architecture (arc42)

Source: arc42.org, template version 9.0-EN, as of July 2025.

Template reference: ../../../utl/tpl/arc42/arc42-template-EN.md.

## 1. Introduction and Goals

`ai4x` is the operations CLI for the ai4X suite.
The utility coordinates installation, cleanup, and diagnostics across module boundaries.

Problem statement:

1. reproducible operational state across `ask`, `kob`, `ccp`, `tcp`
2. deterministic diagnostics before productive runs
3. consistent module installation for `ask` and `kob`

Quality goals:

1. deterministic behavior of operations (`clean|install|doctor`)
2. clear failure signals via exit codes and structured findings
3. traceable suite state for UAT and release

Stakeholders:

1. operators and consumers who start and validate the suite
2. maintainers of individual modules
3. integration and release owners

## 2. Constraints

1. cross-module path configuration via `~/.config/ai4x/config.yaml`
2. operation without hard cross-repo paths in runtime code
3. structured diagnostics output (`human` + `json`)
4. local toolchain availability (`npm`, shell, module CLIs)

## 3. Context and Scope

Business context:

1. Input:
   - module paths
   - installation mode
   - diagnostics mode (`--strict`, `--json`)
2. Output:
   - installed suite state
   - diagnostics result with `required`/`advisory`

System boundary:

1. `ai4x` orchestrates operations, not agent-session runtime
2. agent runtime is in `ask`
3. cognitive capability curation is in `kob`

## 4. Solution Strategy

1. clear separation of operations:
   - `clean`
   - `install`
   - `doctor`
2. `doctor` as mandatory gate before UAT/productive runs
3. `install --clean` as standardized installation run
4. strict separation between:
   - operations orchestration (`ai4x`)
   - runtime orchestration (`ask`)
   - behavior curation (`kob`)
   - capability sources (`ccp`, `tcp`)

Architecture principles:

1. `ask` remains neutral and binds capabilities via configuration.
2. `ai4x` orchestrates operations, not session runtime.
3. cognitive capabilities are maintained in their own top-level (`ccp`).
4. `kob` can hold local specializations in the CCC bundle.
5. technical capabilities remain in `tcp`.

Structure representation:

- The structure is described consistently and formally in `arc.tex` and this document.

## 5. Building Block View

Primary building blocks:

1. CLI entry and argument parsing
2. configuration resolution
3. module actions (`clean|install`)
4. diagnostics and reporting

Key integration relations:

1. `ai4x install` installs productive CLIs (`ask`, `kob`)
2. `ai4x doctor` validates configuration and suite structure before start

Diagram source:

- [`./arc.tex`](./arc.tex)

Diagram order:

1. high-level system overview
2. context diagram (system boundary and environment)
3. operations diagram (`ai4x` utility)
4. component diagram
5. flow diagram (typical Sigrid run)
6. runtime overlay view (`CODEX_HOME`)
7. directory and link structure

## 6. Runtime View

Main flows:

1. `ai4x doctor [--strict|--json]`
2. `ai4x clean`
3. `ai4x install`
4. `ai4x install --clean`
5. `make install`

Typical operations flow:

1. `ai4x doctor --strict`
2. `ai4x install --clean`
3. `ask <profile>`

## 7. Deployment View

`ai4x` is a local CLI with shell completion.
The utility does not distribute runtime components; it orchestrates local module installations and gates.

## 8. Cross-cutting Concepts

1. diagnostics concept:
   - classification into `required` and `advisory`
   - deterministic exit code
2. reporting concept:
   - human-readable output
   - machine-readable JSON report
3. operations concept:
   - idempotent utility runs
   - reproducible bootstrap plus orchestrated suite run
4. capability semantics:
   - cognitive capabilities from `kob` (source of truth: `ccp`)
   - technical capabilities from `tcp`

Runtime overlay concept (`CODEX_HOME`):

1. `ask` starts clients against a temporary `CODEX_HOME` overlay.
2. Base is `CODEX_HOME` or default `~/.codex`.
3. All entries except `skills/` are mirrored into overlay.
4. `overlay/skills` combines base skills and profile-selected skills, with profile-skill precedence by name.
5. After session end, runtime links and overlay are removed deterministically.
6. Base state remains structurally unchanged.

Effect:

1. existing session/auth artifacts remain visible in standard user context.
2. resume remains possible when session storage exists.
3. profile skills override same-name base skills only in session context.

## 9. Architecture Decisions

### ADR-0001: YAML for Configuration, JSON for Machine Output

Status: accepted  
Date: 2026-02-21

Decision:

1. configuration as YAML (`~/.config/ai4x/config.yaml`)
2. machine output as JSON (`ai4x doctor --json`)
3. default output remains human-readable

Rationale:

1. YAML is directly maintainable by users.
2. JSON is deterministically parseable for CI and integrations.

Consequence:

1. clear separation between configuration and integration interface
2. separate tests for human and JSON output
3. optional YAML output is not part of v1 contract

### ADR-0002: Separation Between Agent and Technical Capabilities

Status: accepted  
Date: 2026-02-21

Decision:

1. `agent` represents behavior and cognitive capabilities
2. `skills` are selected explicitly per profile
3. missing skill references are hard-fail

Consequence:

1. composition remains visible and auditable
2. no implicit skill overlays
3. profile-based skill load order remains explicit and testable
4. semantic separation between selected agent profile and repository-wide baseline rules remains clear:
   - `AGENTS.md`/`.agent.md`: role profile for a concrete session
   - `.github/copilot-instructions.md`: global baseline rules for the repository

## 10. Quality Requirements

Prioritized quality requirements:

1. reproducible installation and diagnostics
2. robust suite validation across module boundaries
3. clear failure boundaries and exit codes
4. early error detection before agent startup

Use-case evidence:

1. Reproducible agent run for domain work
   - Flow: `ai4x doctor --strict` -> `ai4x install --clean` -> `ask sigrid`
   - Value: fewer setup errors, auditable profile context, consistent runtime links
2. Profile-based technical capability execution
   - Flow: `ask sigrid` -> selected technical capability -> produced artifacts
   - Value: reproducible capability execution with explicit profile context
3. Operations diagnostics before UAT/productive runs
   - Flow: `ai4x doctor --strict` -> `ask doctor`
   - Value: early error detection before session start
4. Controlled update of cognitive capabilities
   - Flow: `kob cap doctor` -> `kob cap update --source <key> --ref <ref>` -> `kob cap doctor`
   - Value: traceable origin of cognitive capabilities and reduced manual drift

## 11. Risks and Technical Debt

1. drift between module states if verification is incomplete
2. operational reliability depends on maintained diagnostics checks
3. suite quality depends on consistent cross-repo maintenance

Release perspective:

1. current state is RC-ready for broad user testing.
2. the following hardening remains relevant for production releases:
   - mandatory CI gates across all repositories
   - changelog automation
   - formalized cross-repo release process

## 12. Glossary

1. suite: interplay of `ask`, `kob`, `ccp`, `tcp`
2. doctor: diagnostics run for configuration and structure
3. fresh-run: standardized end-to-end operations flow
4. cognitive capabilities: domain-cognitive capabilities
5. technical capabilities: technical capabilities/tools
