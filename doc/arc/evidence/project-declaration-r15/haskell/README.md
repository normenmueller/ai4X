# R-15 Haskell-only authoring prototype

This bounded prototype tests project-owned Haskell declarations against the common
semantic fixture in `../fixture/contract.md`. It uses GHC 9.6.7, `base`, and the GHC boot
package `directory` for same-directory publication by rename.

## Boundary

`R15.Fixture` stands in for project-authored source. Loading it is arbitrary Haskell code
execution and therefore occurs only behind the explicit `update` command. The resulting
line-oriented semantic artifact is inert, sorted, fact-source-mapped, derived, and
non-authoritative. `validate-artifact` reads and semantically checks that artifact without
evaluating declaration source. Fact mappings name a real source file and a logical
declaration anchor; the prototype does not claim line or column spans.

Stage declarations and operational Stage evidence are distinct artifact contexts.
Evidence is marked `authoritative-declaration=false`; live status and backlog ordering
remain external and are not Project Memory authority.

The prototype modules demonstrate ownership boundaries; they do not propose a single
product package. The intended package correspondence remains:

- `R15.Common`: only the shared ID, version, digest, reference, provenance, and error
  vocabulary expected from `ai4x-core`;
- `R15.Collaboration`: `ai4x-collaboration` model and validator ownership;
- `R15.WorkManagement`: `ai4x-work-management` model and validator ownership;
- `R15.ProjectIntent`: `ai4x-intent` model and validator ownership;
- `R15.Capabilities`: `ai4x-curation` capability and trace ownership;
- `R15.Governance`: the fixture's bounded governance/assurance slice, not a proposal to
  centralize product rules;
- `R15.Validate`: composition over published IDs, analogous to an assurance executor;
- `R15.Integration`: Project Bundle and Project Entry selection and binding only;
- `R15.Artifact`: deterministic transport encoding only.

In the product package design, domain rules remain with their owners and
`ai4x-assurance` executes checks over published contracts. The common representation must
not become a domain authority.

## Commands

From the repository root:

```sh
mkdir -p /tmp/ai4x-r15-haskell-build
ghc -fforce-recomp -Wall -Werror \
  -outputdir /tmp/ai4x-r15-haskell-build \
  -ixxx/r15-declaration-comparison/haskell/src \
  xxx/r15-declaration-comparison/haskell/Main.hs \
  -o /tmp/ai4x-r15-haskell

/tmp/ai4x-r15-haskell check-source
/tmp/ai4x-r15-haskell check-invalid
/tmp/ai4x-r15-haskell check-invariants
/tmp/ai4x-r15-haskell check-tamper
/tmp/ai4x-r15-haskell update /tmp/r15-haskell-1.semantic
/tmp/ai4x-r15-haskell update /tmp/r15-haskell-2.semantic
cmp /tmp/r15-haskell-1.semantic /tmp/r15-haskell-2.semantic
/tmp/ai4x-r15-haskell validate-artifact /tmp/r15-haskell-1.semantic
```

`check-source`, `check-invalid`, `check-invariants`, and `check-tamper` are
prototype/build-time evidence commands and load project-authored declarations to create
their fixtures. They are not ordinary runtime validation commands. `validate-artifact`
checks only the supplied inert artifact.

`update` writes a same-directory staged file, re-reads and semantically validates it,
renames it over the target, and re-reads the published artifact. The rename demonstrates
an atomic publication boundary on the tested filesystem. It is not a cross-platform
transaction protocol and does not make compilation of project Haskell safe.

## Observed result

On 2026-08-08 with GHC 9.6.7:

- compilation passed with `-Wall -Werror`;
- the positive fixture passed;
- all seven required invalid fixtures produced their expected typed error kind and owner;
- dependency-cycle, duplicate-stage-ID, exact Governance/Assurance reference-version,
  receipt-coherence, transition-authority, and transition-guard checks passed;
- four inert tamper regressions were rejected: forged acceptance authority, incomplete
  join-all, removed acceptance decision, and forged source digest;
- two independent `update` invocations produced byte-identical artifacts;
- staged and published artifact re-read validation passed;
- inert semantic artifact validation passed without declaration evaluation;
- the artifact contained 85 lines;
- its observed SHA-256 was
  `b632c03168ea316202e0fea82db8cbba2dc82b33701a585421b71fc76f233898`.

The source digest in the fixture is deliberately labelled as a fixture token rather than
a computed cryptographic digest. A production updater must calculate the digest from the
complete declared source closure. This prototype does not compute or pin the transitive
module closure, GHC binary identity, package database, or boot-package versions; recording
only GHC 9.6.7 is not a reproducible toolchain lock.
