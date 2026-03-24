# ai4X Handover Report

## 1. Document Purpose

Use this document as the fresh-session live-state and continuity artifact for ai4X.
It is written for a new agent session without chat history.
It does not replace the canonical project onboarding and governance sources.

## 2. Onboarding vs. Continuity

Use the documentation chain for project onboarding:

1. `../../../AGENTS.md`
2. `../../../adm/dev/protocols/workflow.md`
3. `../../../doc/usr/primer.md`
4. `../../../doc/agn/user-onboarding.md`
5. `../../../doc/agn/maintainer-onboarding.md`
6. `../../../doc/agn/governance-model.md`
7. `../../../doc/agn/ai4x-flow.md`
8. `../../../doc/agn/source-map.md`

Use this handover artifact for fresh-session continuity:

- current repo and submodule state
- current roadmap focus
- current quality evidence
- current governance and delivery posture
- current risks, blockers, and next actions

## 3. 15-Minute Quickstart

Run from the root `ai4x/` worktree:

```bash
git submodule update --init --recursive
npm --prefix ./utl/ai4x/src ci
make PREFIX="$HOME/.local" install CONFIG_MODE=keep
hash -r
ai4x doctor --strict
ai4x install --clean
ask --list-profiles
```

Expected outcomes:

- submodules resolve without pointer drift
- `ai4x` installs successfully into the selected prefix
- `ai4x doctor --strict` returns green
- `ai4x install --clean` ends with `ai4X INSTALL REPORT` and `result      : OK`
- `ask --list-profiles` prints the available runtime profiles

Stop immediately if `doctor` fails with a config-version mismatch.
Use the fail-recovery runbook before continuing.

## 4. Operating Mode for Fresh Sessions (MUST)

1. Build context before implementation.
2. Treat root ai4X governance as binding for suite-context work.
3. Use canonical docs for onboarding and this handover only for live continuity.
4. Do not guess under ambiguity or contradiction.
5. Ask before destructive git or release actions.
6. Treat `doc/agn/*` as explanation and routing, not as governance replacement.

## 5. Reboot Sequence (MUST)

### Phase 1: Governance Bootstrap

Read in this order:

1. `../../../AGENTS.md`
2. `../../../adm/dev/protocols/workflow.md`
3. the task-specific protocol that actually governs the work

Phase outcome:

- bootstrap chain understood
- rule priority understood
- correct task routing identified

### Phase 2: Cold-Start Explanation Chain

Read in this order for orientation:

1. `../../../doc/usr/primer.md`
2. `../../../doc/agn/user-onboarding.md`
3. `../../../doc/agn/maintainer-onboarding.md`
4. `../../../doc/agn/governance-model.md`
5. `../../../doc/agn/ai4x-flow.md`
6. `../../../doc/agn/source-map.md`

Phase outcome:

- suite purpose understood
- module split understood
- governance taxonomy understood
- lifecycle and trigger map understood

### Phase 3: Architecture and Operations Surface

Read in this order:

1. `../../../README.md`
2. `../../../doc/arc/arc42.md`
3. `../../../utl/ai4x/README.md`
4. `../../../utl/ai4x/doc/arc/arc42.md`
5. `../runbooks/UAT.md`

Phase outcome:

- architecture boundaries understood
- install, doctor, and UAT flow understood
- suite operating invariants understood

### Phase 4: Module Map

Read in this order:

1. `../../../mod/ask/README.md`
2. `../../../mod/ask/doc/usr/primer.md`
3. `../../../mod/ask/doc/agn/user-onboarding.md`
4. `../../../mod/ask/doc/arc/arc42.md`
5. `../../../mod/ask/adm/dev/contracts/config.md`
6. `../../../mod/ask/adm/dev/contracts/cli.md`
7. `../../../mod/ask/adm/dev/contracts/agent-root-layout.md`
8. `../../../mod/kob/README.md`
9. `../../../mod/kob/doc/usr/primer.md`
10. `../../../mod/kob/doc/agn/user-onboarding.md`
11. `../../../mod/kob/doc/arc/arc42.md`
12. `../../../mod/cap/cog/README.md`
13. `../../../mod/cap/cog/doc/usr/primer.md`
14. `../../../mod/cap/cog/doc/agn/user-onboarding.md`
15. `../../../mod/cap/cog/doc/arc/arc42.md`
16. `../../../mod/cap/tec/README.md`
17. `../../../mod/cap/tec/doc/usr/primer.md`
18. `../../../mod/cap/tec/doc/agn/user-onboarding.md`
19. `../../../mod/cap/tec/doc/arc/arc42.md`

Phase outcome:

- runtime, behavior, cognitive, and technical module roles understood
- current module-specific onboarding quality understood
- current documentation risks visible before implementation starts

### Phase 5: Active Workstreams

Read in this order:

1. `../../../adm/pln/rdmp.md`
2. `../../../adm/pln/accepted/`
3. `../../../adm/pln/inbox/`
4. `../../../adm/pln/assessed/`
5. `../../../adm/pln/realized/`

Phase outcome:

- active slot focus understood
- acceptance and transition model understood
- current task landscape understood

## 6. Bootstrap Chain for Fresh Development Tasks (MUST)

The canonical chain is always:

1. `AGENTS.md`
2. `adm/dev/protocols/workflow.md`
3. the required task-specific protocol

Examples:

- review -> `adm/dev/protocols/review.md`
- handover / fresh-session continuity -> `adm/dev/protocols/handover.md`
- capability change -> `adm/dev/contracts/capability-quality.md` plus `adm/dev/contracts/capability-discoverability.md` plus `adm/dev/protocols/capability-judgment.md`
- planning transition -> `adm/dev/protocols/approval-transition.md`

Do not start governed work from README layout alone.

## 7. Cold-Start Explanation Chain for Fresh Orientation (MUST)

Use this chain when the task starts as explanation rather than immediate governed execution:

1. `doc/usr/primer.md`
2. `doc/agn/user-onboarding.md`
3. `doc/agn/maintainer-onboarding.md`
4. `doc/agn/governance-model.md`
5. `doc/agn/ai4x-flow.md`
6. `doc/agn/source-map.md`

Use this chain to answer:

- What is ai4X?
- What is it for?
- What can I do with it?
- Which source explains which part?
- Which protocol becomes binding when?

## 8. Post-Read Quick Check

Run these checks immediately after reading:

```bash
git status -sb
git -C mod/ask status -sb
git -C mod/kob status -sb
git -C mod/cap/cog status -sb
git -C mod/cap/tec status -sb
git submodule status
```

Interpretation:

- `clean` means no uncommitted worktree changes
- `M` means local tracked changes exist and must be classified before further work
- `ahead` means unpublished local commits exist
- submodule pointer drift in root requires explicit alignment before release or fresh-state publication

Integrated baseline snapshot at capture time:

- root `ai4x`: `96276e7` (`0 0`, dirty during the current documentation consistency cleanup package)
- `ask`: `51845c2` (`0 0`, dirty during the current documentation consistency cleanup package)
- `kob`: `c8f0793` (`0 0`, clean)
- `ccp`: `ee2e2a1` (`0 0`, clean)
- `tcp`: `a0d7675` (`0 0`, dirty during the current documentation consistency cleanup package)

## 9. Roadmap Focus and Externalized/Private Tasks (MUST)

Point-in-time capture: `2026-03-24T13:20:29+01:00`

Re-check commands:

```bash
date -Iseconds
sed -n '1,220p' adm/pln/rdmp.md
rg -n "^kind:|^status:|^title:" adm/pln/inbox adm/pln/assessed adm/pln/accepted adm/pln/rejected adm/pln/realized
```

Current interpretation:

- active phase: `eat-your-own-dog-food` (`#eyodf`)
- `Working`: `ai4X EYODF execution`, `ai4X UAT execution`, `ai4X Proofread Primer`
- `Soonish`: Copilot demos, Gertrud optimization, release-process finalization
- `Icebox`: broader follow-up backlog across root and modules

Externalized/private task rule:

- assume private notes or trackers may exist outside this repository
- do not recreate them in public planning without explicit approval
- ask explicitly when a user references private or externalized work

Re-check this block before implementation if the session is older than one workday.

## 10. Quality Evidence Snapshot (MUST)

Point-in-time capture: `2026-03-24T13:20:29+01:00`

Re-check commands:

```bash
date -Iseconds
sed -n '1,260p' adm/ops/reports/review.md
npm --prefix ./utl/ai4x/src run verify
npm --prefix ./mod/ask/src run verify
npm --prefix ./mod/kob/utl/kob/src run verify
make -C ./mod/cap/cog verify
make -C ./mod/cap/tec verify
bash ./utl/gh/repo-metadata.sh --check-local
ai4x doctor --strict
ask doctor
```

Current interpretation:

- all deterministic repository gates are green in this pass
- the latest review report records a `10.0/10.0` local suite verdict with no material findings in scope
- the latest review explicitly includes the current documentation-consistency cleanup, the canonical terminology/README-box policy codification, and the refreshed `tcp` public wording
- `bash ./utl/gh/repo-metadata.sh --check-local` is green
- local runtime integrity is not fully green on this machine right now:
  - `ai4x doctor --strict` fails because `~/.config/ai4x/config.yaml` still uses unsupported config version `1`
  - `ask doctor` fails because `~/.config/ask/config.yaml` still uses unsupported config version `1`
- treat these as local environment drift, not as a repository-code failure

Re-check this block before implementation or UAT if local config, installation, or integrated module heads changed.

## 11. Governance Snapshot (MUST)

Point-in-time capture: `2026-03-24T13:20:29+01:00`

Re-check commands:

```bash
date -Iseconds
git branch --show-current
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef,viewerPermission
gh api repos/normenmueller/ai4x/branches/trunk/protection
```

Current interpretation:

- active branch: `trunk`
- GitHub CLI authentication is available locally
- default branch, viewer permission, and branch-protection details must be re-checked live before push or release actions
- direct commits to `trunk` remain approval-gated by governance, even when technically possible

Re-check this block before any push, release, or branch-protection-sensitive action.

## 12. External Dependency Register (MUST)

Point-in-time capture: `2026-03-24T13:20:29+01:00`

Re-check commands:

```bash
date -Iseconds
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef,viewerPermission
```

Current register:

| Type | Owner | Impact | Validation method |
| --- | --- | --- | --- |
| `private-task-tracker` | repository owner | public planning may omit work that exists outside `adm/pln/*` | ask the user explicitly when a task seems referenced but not present in public planning |
| `private-capability-source` | repository owner | downstream curation or runtime context may depend on capability material outside public `mod/cap/*` | require explicit user confirmation before assuming non-public capability content |
| `hosted-repo-governance` | GitHub / repository owner | branch protection and required checks influence release and push behavior | re-run the governance snapshot commands |

Re-check this block before release, review publication, or when the user references non-public context.

## 13. Architecture and Behavior Invariants (MUST)

- root `ai4x` is the suite, integration, installation, and governance repository
- `ask` is the runtime launcher and must remain repository-neutral in production code
- `kob` is the behavior kit and curation layer, not the general capability source of truth
- `ccp` is the source of truth for reusable, agent-agnostic cognitive capabilities
- `tcp` is the source of truth for reusable technical capabilities and specifications
- root ai4X governance is binding when module work is performed in the ai4X suite context
- `doc/*` explains and references; `adm/*` governs, routes, checks, and operationalizes
- `doc/agn/*` explains governance but must never replace it
- cross-repo relative paths as a system prerequisite are forbidden in code and documentation
- capability changes must route through the capability-quality contract, the capability-discoverability contract, and the capability-judgment protocol

## 14. Source-of-Truth Matrix (MUST)

| Topic | Primary source | Secondary sources |
| --- | --- | --- |
| suite overview | `../../../doc/usr/primer.md` | `../../../README.md` |
| suite architecture | `../../../doc/arc/arc42.md` | `../../../utl/ai4x/doc/arc/arc42.md` |
| governance taxonomy | `../../../doc/agn/governance-model.md` | `../../../AGENTS.md`, `../../../adm/dev/protocols/workflow.md` |
| lifecycle and trigger map | `../../../doc/agn/ai4x-flow.md` | `../../../adm/dev/protocols/workflow.md` |
| capability discoverability and applicability | `../../../adm/dev/contracts/capability-discoverability.md` | `../../../adm/dev/contracts/capability-quality.md`, `../../../adm/dev/protocols/capability-judgment.md` |
| topic routing | `../../../doc/agn/source-map.md` | `../../../doc/agn/user-onboarding.md`, `../../../doc/agn/maintainer-onboarding.md` |
| install and doctor | `../../../utl/ai4x/README.md` | `../runbooks/UAT.md` |
| review execution | `../../../adm/dev/protocols/review.md` | `../reports/review.md` |
| handover / fresh-session continuity | `../../../adm/dev/protocols/handover.md` | this file |
| runtime launch and resume | `../../../mod/ask/README.md` | `../../../mod/ask/adm/dev/contracts/config.md`, `../../../mod/ask/adm/dev/contracts/cli.md` |
| behavior curation | `../../../mod/kob/README.md` | `../../../mod/kob/doc/usr/primer.md`, `../../../mod/kob/utl/kob/README.md` |
| cognitive capability portfolio | `../../../mod/cap/cog/README.md` | `../../../mod/cap/cog/cap/index.md` |
| technical capability portfolio | `../../../mod/cap/tec/README.md` | `../../../mod/cap/tec/doc/usr/primer.md` |
| planning and approval | `../../../adm/pln/rdmp.md` | `../../../adm/dev/protocols/proposal-assessment.md`, `../../../adm/dev/protocols/approval-transition.md` |

## 15. Tests, Gates, and Verification

Root and module gates:

```bash
npm --prefix ./utl/ai4x/src run verify
npm --prefix ./mod/ask/src run verify
npm --prefix ./mod/kob/utl/kob/src run verify
make -C ./mod/cap/cog verify
make -C ./mod/cap/tec verify
bash ./utl/gh/repo-metadata.sh --check-local
git diff --check
```

Runtime and operations checks:

```bash
ai4x doctor --strict
ask doctor
ai4x install --clean
```

UAT reference:

```bash
sed -n '1,260p' adm/ops/runbooks/UAT.md
```

Expected gate posture before commit or release:

- relevant `verify` gates green
- `git diff --check` green
- repo metadata check green when root metadata may be affected
- `doctor` green when local runtime integrity matters

## 16. Typical Risks and Mitigations

1. Local config drift outside repository control
   - Mitigation: run `ai4x doctor --strict` and `ask doctor` before productive use
2. Drift between live continuity notes and current published heads
   - Mitigation: re-run the live-state commands before implementation or release work
3. Drift between root and module docs
   - Mitigation: treat `doc/agn/source-map.md` as the routing control surface and refresh it when canonical paths change
4. Overstated public module positioning
   - Mitigation: verify that README, primer, and onboarding claims match the actually published portfolio contents
5. Submodule integration drift
   - Mitigation: always inspect root plus submodule status before implementation or publication

## 17. Fail-Recovery Mini-Runbook (MUST)

### Config-version mismatch in `doctor`

Symptoms:

- `ai4x doctor --strict` reports `version must be 0.1.0`
- `ask doctor` reports `unsupported config version ...: 1`

Recovery path:

```bash
cp ~/.config/ai4x/config.yaml ~/.config/ai4x/config.yaml.bak.$(date +%Y%m%d%H%M%S)
cp ~/.config/ask/config.yaml ~/.config/ask/config.yaml.bak.$(date +%Y%m%d%H%M%S)
make PREFIX="$HOME/.local" install CONFIG_MODE=backup
hash -r
ai4x doctor --strict
ask doctor
```

### Unexpected dirty root or submodule worktree

Recovery path:

```bash
git status -sb
git -C mod/ask status -sb
git -C mod/kob status -sb
git -C mod/cap/cog status -sb
git -C mod/cap/tec status -sb
```

Then:

- classify whether the changes are intentional local work
- do not discard anything without explicit user approval
- align root submodule pointers only after module intent is clear

### Verify failure in one module

Recovery path:

```bash
npm --prefix ./mod/ask/src run verify
npm --prefix ./mod/kob/utl/kob/src run verify
make -C ./mod/cap/cog verify
make -C ./mod/cap/tec verify
```

Then read the affected module README, module `doc/arc/arc42.md`, and relevant local contracts before changing anything.

### Runtime-link or symlink failure in `ask`

Recovery path:

```bash
ask doctor
npm --prefix ./mod/ask/src run verify
```

Then verify filesystem symlink support and current workspace permissions before retrying.

## 18. Do-Not-Touch / High-Risk Zones (MUST)

- do not move planning artifacts across `adm/pln/*` states without explicit approval
- do not change roadmap slots without explicit approval
- do not push directly to `trunk` without explicit approval, even though force pushes are technically allowed
- do not move or rewrite capabilities across `ccp`, `tcp`, and governance without the canonical quality/judgment path
- do not introduce cross-repo relative paths in code or documentation
- do not overwrite user config files without backup and explicit intent
- do not use destructive git cleanup as a default recovery suggestion

## 19. Planning and Approval Model (MUST)

Planning contract summary:

- `adm/pln/inbox/` -> `Proposal` with `status: draft`
- `adm/pln/assessed/` -> `Proposal` with `status: assessed`
- `adm/pln/accepted/` -> `Task` with `status: none|open|wip|blocked`
- `adm/pln/rejected/` and `adm/pln/realized/` -> `status: done` with matching tags

Approval contract summary:

- proposal assessment must end with an explicit decision proposal
- no transition to `accepted/` without explicit approval
- no roadmap change without explicit approval
- future `assessed -> accepted` transitions generate an accepted task with `# Content` plus `## Plan`
- `## Plan` contains one fenced block with one directly copy-pasteable `/plan ...` prompt
- roadmap slot/status mapping stays aligned:
  - `Working -> wip`
  - `Soonish -> open`
  - `Icebox -> none`

## 20. Decision Backlog (MUST)

| Topic | Owner | Impact | Next step |
| --- | --- | --- | --- |
| initial public `tcp` capability publication timing | `tcp` maintainer | public docs now describe the technical-capability boundary and specifications without promising published capability roots; the first public capability drop remains a portfolio decision | decide when the first public technical capability root should land under `cap/` |
| local config guidance for unsupported version `1` files | root ai4X maintainer | `doctor` can still fail on machines with user config files outside repository control that declare unsupported version `1` | decide whether to add a documented upgrade note or an automated conversion path |

## 21. Task Intake Protocol (MUST)

1. classify the request as explanation, development-governed work, capability-governed work, planning work, or operations work
2. if it is governed development work, follow the bootstrap chain first
3. inspect root and submodule git state before proposing changes
4. identify the smallest authoritative source from the source-of-truth matrix
5. explain directly first for newcomer questions; route second
6. do not implement before scope, protocol, and gate expectations are clear

## 22. Review Protocol

Use `../../../adm/dev/protocols/review.md` for any neutral quality verdict.
Use `../reports/review.md` as the latest review artifact.
Treat the review report as evidence, not as a replacement for the governing review protocol.

## 23. Definition of Ready

A task is ready when:

1. the goal and scope are explicit
2. the correct governance path is identified
3. the affected modules and canonical sources were read
4. the relevant test and gate set is known
5. approval status is explicit for risky or destructive steps

## 24. Definition of Done

A task is done when:

1. the implementation or documentation matches the governing contracts
2. relevant deterministic gates are green
3. review and handover evidence is refreshed when required
4. planning artifacts remain approval-compliant
5. root and submodule state are aligned for publication

## 25. Start Prompts by Goal Type

### `implement`

```text
Follow the canonical bootstrap chain for this task, confirm the current git and submodule state, identify the governing protocol, and then implement the requested change with relevant verify gates.
```

### `review`

```text
Follow the canonical bootstrap chain for this task, gather evidence across code, docs, governance, and operations as needed, run the relevant deterministic gates, and produce a findings-first review.
```

### `assessment`

```text
Follow the canonical bootstrap chain for this task, assess the proposal or planning artifact against the active planning and governance contracts, and end with an explicit decision proposal.
```

### `docs`

```text
Follow the canonical bootstrap chain for this task, identify the smallest authoritative source, update only the docs that materially need sync, and verify paths, links, and root gates before completion.
```
