---
kind: Guide
status: active
title: ai4X
subtitle: UAT
aliases:
  - ai4X UAT
dateCreated: 2026-03-09T00:10:00.000+01:00
---

# ai4x

## Goal

This guide defines a reproducible UAT run for the ai4X suite with clear expected outcomes and verifiable evidence.

## Scope

- System run through `ai4x` (preflight, install, postflight)
- Functional acceptance of `ask` across central runtime combinations
- Baseline acceptance of `kob` curation and doctor paths

## Baseline Run

1. Preflight:

```bash
ai4x doctor --strict
```

2. Clean install:

```bash
ai4x install --clean
```

3. Postflight:

```bash
ai4x doctor --strict
```

4. Machine-readable doctor gate:

```bash
ai4x doctor --json > /tmp/ai4x-doctor.json
node -e 'const fs=require("node:fs"); const r=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if (r.summary.required.fail !== 0 || r.summary.advisory.fail !== 0) process.exit(1)' /tmp/ai4x-doctor.json
```

## Expected Outcome

- `ai4x doctor --strict` is green before and after install
- `ai4x install --clean` ends with `ai4X INSTALL REPORT` and `result: OK`
- JSON gate confirms `required.fail=0` and `advisory.fail=0`

---

# ask

## Goal

This chapter covers full UAT for `ask`: normal runs, resume paths, workspace drift, user links, overrides, init, and doctor.

## Test Principle

- Every test case includes: `ID`, `command`, `checkpoints`, `expected outcome`.
- Every test runs in a fresh workspace.
- Core paths are tested for both Codex and Copilot.

## UAT Profiles (reference)

Recommended minimal profiles for UAT:

- `codex-naked` (`adapter: codex/cli`, `agent: none`, `skills: []`)
- `codex-sigrid` (`adapter: codex/cli`, `agent: sigrid`, optional skills)
- `copilot-sigrid` (`adapter: copilot/cli`, `agent: sigrid`, optional skills)
- `vscode-copilot-sigrid` (`adapter: copilot/vscode`, `agent: sigrid`, optional skills)

## Combination Matrix (MUST)

The following matrix defines required coverage combinations:

| Dimension | Values |
| --- | --- |
| Client adapter | `codex/cli`, `copilot/cli`, `copilot/vscode` |
| Agent | `none`, `sigrid` |
| Skills | `[]`, `[fit-eval]` |
| Start mode | `ask <profile>`, `ask <profile> --no-resume`, `ask resume` |
| Session state | `provider`, `workspace`, `none`, `provider missing` |
| Workspace state | unchanged, moved |
| Overrides | none, `--set profile.params.*`, `.ask.yaml -> contexts.<active>.profile.overrides.params` |
| User links | none, with `contexts.<active>.links.user` in `.ask.yaml` |

Minimum UAT coverage:

1. Each adapter at least once with `agent: none` and once with `agent: sigrid`.
2. `ask resume` for Codex and Copilot CLI with `provider` and `provider missing`.
3. Move scenario (`workspace moved`) for Codex and Copilot CLI.
4. Runtime links and cleanup for all adapters.
5. Precedence check (`CLI > workspace > profile`) at least once per CLI adapter.

## Deterministic Evidence for Client Args (Codex and Copilot)

When validating whether the client receives the exact options, use local wrappers:

```bash
mkdir -p /tmp/uat-bin
```

Codex wrapper:

```bash
cat >/tmp/uat-bin/codex <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$@" >/tmp/uat-codex.args
exit 0
SH
chmod +x /tmp/uat-bin/codex
```

Copilot wrapper:

```bash
cat >/tmp/uat-bin/copilot <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$@" >/tmp/uat-copilot.args
exit 0
SH
chmod +x /tmp/uat-bin/copilot
```

For test runs:

```bash
PATH="/tmp/uat-bin:$PATH" ask <profile>
```

Then inspect:

```bash
cat /tmp/uat-codex.args
cat /tmp/uat-copilot.args
```

This gives hard evidence for arguments such as `--model`, `--resume=...`, `--agent`, and `--add-dir`.

## Link Target Model per Adapter

### codex/cli

For `agent != none` during active run:

- `AGENTS.md -> <agent-root>/AGENTS.md`
- `.<agent> -> <agent-root>/ccc`

### copilot/cli

For `agent != none` during active run:

- `.<agent> -> <agent-root>/ccc`
- `.github/agents/<agent>.agent.md -> <agent-root>/AGENTS.md`
- `.github/agents/.<agent> -> <agent-root>/ccc`
- `.github/skills/<skill> -> <skill-root>` (only when skills are active)

Additionally:

- Copilot receives `--add-dir` for workspace/link paths and link targets.

## Test Cases

### ASK-UAT-01: Smoke and base commands

Command:

```bash
ask --help
ask --version
ask --list-profiles
ask doctor
ask status
```

Checkpoints:

- Exit code `0` for each command (except intentionally negative setups)
- `ask status` without `.ask.yaml` shows `workspace state: missing`

Expected outcome:

- CLI is usable and baseline diagnostics work.

### ASK-UAT-02: Normal run without resume (`codex-naked`)

Command:

```bash
mkdir -p /tmp/uat-ask-02 && cd /tmp/uat-ask-02
ask codex-naked --no-resume
```

Checkpoints:

- `.ask.yaml` is written
- `contexts.<active>.profile.client.session.resume_capability` is set (`provider` or `workspace`, depending on client behavior)

Expected outcome:

- New run without resume prompt, stable workspace state.

### ASK-UAT-03: Normal run with agent (`codex-sigrid`)

Command:

```bash
mkdir -p /tmp/uat-ask-03 && cd /tmp/uat-ask-03
ask codex-sigrid --no-resume
```

Checkpoints (while run is active, second terminal):

```bash
test -L AGENTS.md
test -L .sigrid
readlink AGENTS.md
readlink .sigrid
```

Expected outcome:

- Codex link layout is active.
- Runtime links are removed after run ends.

### ASK-UAT-04: Normal run with agent (`copilot-sigrid`)

Command:

```bash
mkdir -p /tmp/uat-ask-04 && cd /tmp/uat-ask-04
ask copilot-sigrid --no-resume
```

Checkpoints (while run is active, second terminal):

```bash
test -L .sigrid
test -L .github/agents/sigrid.agent.md
test -L .github/agents/.sigrid
readlink .sigrid
readlink .github/agents/sigrid.agent.md
readlink .github/agents/.sigrid
```

Expected outcome:

- Canonical path `./.sigrid` and Copilot projection under `.github/agents` are both active.
- Copilot startup shows the selected agent.

### ASK-UAT-05: Resume (provider)

Command:

```bash
cd /tmp/uat-ask-04
ask resume
```

Checkpoints:

- If provider session exists: provider resume path is used.
- If session is missing: deterministic WARN + workspace fallback.

Expected outcome:

- No silent failure; clear fallback path.

### ASK-UAT-06: Resume after moved workspace

Command:

```bash
mv /tmp/uat-ask-04 /tmp/uat-ask-04-moved
cd /tmp/uat-ask-04-moved
ask resume
```

Checkpoints:

- Resume still works, or deterministically falls back to workspace resume.
- No inconsistent `.ask.yaml` state.

Expected outcome:

- Move scenario is robust and traceable.

### ASK-UAT-07: User-specified links (`.ask.yaml`)

Setup in `.ask.yaml`:

```yaml
active: codex-sigrid@codex
contexts:
  codex-sigrid@codex:
    links:
      user:
        acc: ./shared-acc
        docs: ../shared-docs
```

Command:

```bash
ask codex-sigrid --no-resume
```

Checkpoints:

- User links are created during run.
- Collision with reserved runtime link names causes hard fail.

Expected outcome:

- User links are deterministic and collision-safe.

### ASK-UAT-08: Parameter override via CLI

Command:

```bash
ask codex-sigrid --no-resume --set profile.params.model=gpt-5.4
ask status --effective --profile codex-sigrid --set profile.params.model=gpt-5.4
```

Checkpoints:

- Effective value source is `cli-override`.
- Precedence: CLI > workspace > profile.

Expected outcome:

- Override contract is visible and reproducible.

### ASK-UAT-09: `ask init` in empty workspace

Command:

```bash
mkdir -p /tmp/uat-ask-09 && cd /tmp/uat-ask-09
ask init --profile local --client copilot --agent none
```

Checkpoints:

- `.ask.yaml` is created.
- No client process is started.

Expected outcome:

- Workspace is prepared without runtime startup.

### ASK-UAT-10: `ask init` with agent scaffold

Command:

```bash
mkdir -p /tmp/uat-ask-10 && cd /tmp/uat-ask-10
ask init --profile foo --client copilot --agent foo --scaffold-agent --force
```

Checkpoints:

- `agn/local/foo/AGENTS.md` and `agn/local/foo/ccc/.gitkeep` exist.

Expected outcome:

- Local agent scaffold is complete.

### ASK-UAT-11: `ask doctor` semantic gates

Command:

```bash
ask doctor
```

Checkpoints:

- agent/skill layout, client prerequisites, profiles, overrides
- classification into `required` and `advisory`

Expected outcome:

- deterministic summary and exit code.

### ASK-UAT-12: Negative case unresolved placeholder

Setup: profile with missing required parameter.

Command:

```bash
ask <affected-profile>
```

Checkpoints:

- hard fail with explicit error message

Expected outcome:

- no silent defaults on required-parameter violations.

### ASK-UAT-13: VS Code + Copilot Chat run (`copilot/vscode`)

Command:

```bash
mkdir -p /tmp/uat-ask-13 && cd /tmp/uat-ask-13
ask vscode-copilot-sigrid
```

Checkpoints:

- `code --version` is resolvable.
- `ask doctor` has no `required` failure for `github.copilot-chat`.
- During session, symlinks exist:
  - `.sigrid`
  - `.github/agents/sigrid.agent.md`
  - `.github/agents/.sigrid`
  - optional `.github/skills/<skill>` (if a skill is active)
- After session ends, runtime links are removed.
- `.ask.yaml` contains `contexts.<active>.profile.client.session.resume_capability: workspace` without `session.id`/`session.path`.

Expected outcome:

- IDE run is reproducible and cleans up runtime links reliably.

### ASK-UAT-14: Resume decision with existing `.ask.yaml`

Setup:

- existing `.ask.yaml` with `contexts.<active>.profile.client.session.resume_capability: provider`.

Command:

```bash
ask <profile>
```

Checkpoints:

- Interactive (TTY): deterministic choice `new|resume`.
- Non-TTY: deterministic error hint to `ask resume` or `--no-resume`.

Expected outcome:

- No implicit, non-traceable resume decision.

### ASK-UAT-15: `--add-dir` injection for Copilot CLI

Setup:

- profile with `adapter: copilot/cli`.
- optional additional `contexts.<active>.links.user` in `.ask.yaml`.

Command:

```bash
ask copilot-sigrid --no-resume
ask resume
```

Checkpoints:

- client args contain `--add-dir` for:
  - current workspace
  - link paths
  - link targets
- explicit `--add-dir` args are not duplicated.

Expected outcome:

- Copilot receives consistent access paths for run and resume.

## Acceptance Criteria for `ask`

`ask` is UAT-green if:

1. All ASK-UAT-01 to ASK-UAT-15 pass without open `required` failures.
2. Resume and move scenarios work traceably for Codex and Copilot.
3. Runtime link model is correct for `codex/cli`, `copilot/cli`, and `copilot/vscode`, and links are removed cleanly after each run.
4. Effective parameter resolution (`ask status --effective`) shows expected precedence path.

---

# kob

## Goal

`kob` delivers deterministic and verifiable cognitive capability composition.

## Baseline UAT

1. Structure and metadata validation:

```bash
kob cap doctor --kob-root /absolute/path/to/kob --cog-cap ai4x-ccp=/absolute/path/to/ccp/cap
```

2. Local composition consistency:

```bash
kob cap curate
kob cap doctor --kob-root /absolute/path/to/kob --cog-cap ai4x-ccp=/absolute/path/to/ccp/cap
```

3. Sync to new `ccp` state:

```bash
kob cap update --source <compose-source-key> --ref <ccp-commit-or-tag>
kob cap doctor --kob-root /absolute/path/to/kob --cog-cap ai4x-ccp=/absolute/path/to/ccp/cap
```

## Expected Outcome

- `cap.compose.yaml` is consistent with materialized `ccc` bundle.
- metadata contract (`.meta.yaml`) is complete and semantically valid.
- `requires`/`conflicts`/approval fields pass doctor checks.
