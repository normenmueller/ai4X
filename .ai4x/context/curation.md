# Curation Context

This file is the single normative owner of the current Curation semantic
algebra for the Need-to-Capability architecture. It fixes essential states,
ownership, transitions, and invariants without authorizing implementation or
prematurely choosing a concrete Haskell encoding.

## Reading convention

- `A × B` means both values are required.
- `A | B` means exactly one outcome.
- `Either E A` means deterministic failure or success.
- `<Phase>` denotes a distinct closed domain state.
- Phase-changing constructors are opaque and owned by their transition.
- Cognitive and human contracts use function notation without claiming
  deterministic library execution.

## Canonical values

```text
CandidateDecisions<Complete>
├─ source CapabilityCandidates<Identified>
├─ exactly one disposition for every source Candidate
├─ rationale reference for every disposition
└─ every required Cognitive Job covered or recorded as an explicit gap

CurationRationale<Authored>
├─ authoritative selection and non-selection rationale entries
├─ supporting source references
└─ explicit uncertainty

CurationProposal<Draft>
├─ source ProjectIntent<Validated>
├─ source CapabilityCandidates<Identified>
├─ CandidateDecisions<Complete>
├─ AgenticConstellation<Draft>
└─ CurationRationale<Authored>

AgenticConstellation<Draft>
├─ selected cognitive Capabilities
├─ Cognitive Agent Team
└─ Operating Model
   ├─ Collaboration Model
   ├─ Work Management Model
   └─ Governance Model

CurationTrace
├─ exact CurationProposal<Draft> binding
├─ exact checked CapabilityCorpus<Released> binding
├─ released-Corpus membership and exact Capability references
├─ complete disposition and rationale-link evidence
├─ closed dependency and conflict graph
└─ canonical ordering

VerifiedCuration
├─ CurationProposal<Draft>
└─ CurationTrace

CurationProposal<Reviewable>
├─ VerifiedCuration
└─ ReviewExplanation<Authored>

AcceptedCuration
├─ accepted CurationProposal<Reviewable>
├─ unchanged AgenticConstellation<Curated>
└─ HumanAcceptance<Recorded>
```

`ReviewExplanation<Authored>` presents rationale, evidence, gaps, uncertainty,
and review questions. It may clarify existing semantics but cannot change them.

## Functional contracts and ownership

```text
AI Host + ai4X Cognition
curateAgenticConstellation :
  ProjectIntent<Validated>
  × CapabilityCandidates<Identified>
  -> Drafted CurationProposal<Draft>
   | CurationBlocked (NonEmpty CurationGap)

ai4X Library / CLI
verifyCuration :
  CapabilityCorpus<Released>
  × CurationProposal<Draft>
  -> Either (NonEmpty CurationDefect) VerifiedCuration

AI Host + ai4X Cognition
explainCuration :
  VerifiedCuration
  -> CurationProposal<Reviewable>

Human Authority
decideOnCurationProposal :
  CurationProposal<Reviewable>
  -> Accept AcceptedCuration
   | RequestRevision CurationRevisionRequest
   | Reject CurationRejection

ai4X Library / CLI
persistCuration :
  AcceptedCuration
  -> Either (NonEmpty PersistenceDefect)
            ProjectConfiguration<Persisted>
```

## Non-negotiable invariants

1. Every source Candidate is exactly once `Selected` or `NotSelected`.
2. Every disposition refers to one entry in the authoritative authored
   rationale.
3. Selected decisions correspond exactly to the selected cognitive
   Capabilities in the Draft Constellation.
4. Every required Cognitive Job is covered or visible as an explicit gap.
5. Rationale owns cognitive judgment; `CurationTrace` owns deterministic
   verification facts. Neither duplicates the other.
6. Only `verifyCuration` constructs opaque `VerifiedCuration`, binding the exact
   Draft, Trace, and checked released Corpus.
7. `ReviewExplanation<Authored>` cannot silently change domain semantics. A
   material change creates a revised Draft and requires renewed verification.
8. Human acceptance binds the exact Reviewable Proposal.
9. `Draft -> Curated` changes phase only; the Constellation payload is unchanged.
10. `AcceptedCuration` is no longer a Proposal.
11. Persistence preserves the accepted semantic and evidence boundary but does
    not activate the Constellation.

## Essential diagram projection

The lean architecture diagram shows only these trees and success states:

```text
CurationProposal<Draft>
├─ AgenticConstellation<Draft>
└─ CurationRationale<Authored>

VerifiedCuration
├─ CurationProposal<Draft>
└─ CurationTrace

CurationProposal<Reviewable>
├─ VerifiedCuration
└─ ReviewExplanation<Authored>

AcceptedCuration
└─ AgenticConstellation<Curated>
```

```text
CurationProposal<Draft>
-> VerifiedCuration
-> CurationProposal<Reviewable>
-> AcceptedCuration
-> ProjectConfiguration<Persisted>
```

## Deliberately deferred

- concrete GADT, phantom-type, type-family, newtype, or module encoding;
- identity, revision, reference, and digest representation;
- Dhall declarations, codecs, and canonical serialization;
- persistence schema and embedded-versus-referenced evidence;
- internal reason, source, gap, uncertainty, and defect structures;
- whether selected Capabilities must be non-empty;
- whether `NotSelected` later separates rejected, deferred, or other outcomes;
- Portfolio versus project-local origin of Team and Operating Model values.

Any later implementation may choose among these representations only while
preserving the invariants and constructor ownership above.
