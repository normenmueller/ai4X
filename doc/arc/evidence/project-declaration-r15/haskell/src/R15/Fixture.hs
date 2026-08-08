module R15.Fixture
  ( Fixture (..)
  , InvalidFixture (..)
  , positiveFixture
  , invalidFixtures
  , additionalInvariantFixtures
  ) where

import R15.Capabilities
import R15.Collaboration
import R15.Common
import R15.Governance
import R15.Integration
import R15.ProjectIntent
import R15.WorkManagement

data Fixture = Fixture
  { fixtureCollaboration :: CollaborationModel
  , fixtureWorkManagement :: WorkProfile
  , fixtureOtherWorkProfiles :: [WorkProfile]
  , fixtureGovernance :: GovernanceModel
  , fixtureProjectIntent :: ProjectIntent
  , fixtureCapabilities :: CapabilityCatalogue
  , fixtureBundle :: ProjectBundle
  , fixtureProjectEntry :: ProjectEntry
  , fixtureMemory :: ProjectMemory
  }
  deriving (Eq, Show)

data InvalidFixture = InvalidFixture
  { invalidName :: String
  , invalidExpectedKind :: ErrorKind
  , invalidExpectedOwner :: String
  , invalidValue :: Fixture
  }

positiveFixture :: Fixture
positiveFixture =
  Fixture
    collaboration
    workManagement
    [issueSubIssueProfile]
    governance
    projectIntent
    capabilities
    bundle
    projectEntry
    projectMemory

invalidFixtures :: [InvalidFixture]
invalidFixtures =
  [ InvalidFixture
      "invalid-unresolved-reference"
      UnresolvedReference
      "Collaboration"
      positiveFixture
        { fixtureCollaboration =
            collaboration
              { collaborationHandoff =
                  (collaborationHandoff collaboration)
                    { handoffReceiver = ref "urn:ai4x:participant:missing" }
              }
        }
  , InvalidFixture
      "invalid-illegal-transition"
      IllegalTransition
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement
              { workProfileTransitions = illegalTransition : workProfileTransitions workManagement
              , workProfileAttemptedTransition = illegalTransition
              }
        }
  , InvalidFixture
      "invalid-delegation-accountability"
      DelegationAccountabilityConflict
      "Collaboration"
      positiveFixture
        { fixtureCollaboration =
            collaboration
              { collaborationDelegation =
                  (collaborationDelegation collaboration)
                    { delegationRetainsAccountability = False }
              }
        }
  , InvalidFixture
      "invalid-unauthorized-gate-decision"
      UnauthorizedGateDecision
      "Governance and Assurance"
      positiveFixture
        { fixtureGovernance =
            governance
              { governanceDecisions =
                  map replaceAcceptanceDecider (governanceDecisions governance)
              }
        }
  , InvalidFixture
      "invalid-incomplete-join-all"
      IncompleteJoinAll
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement
              { workProfileStageEvidence =
                  map makeReviewIncomplete (workProfileStageEvidence workManagement)
              }
        }
  , InvalidFixture
      "invalid-capability-conflict"
      CapabilityConflict
      "Curation and Capabilities"
      positiveFixture
        { fixtureCapabilities =
            capabilities
              { capabilityCatalogueSelected =
                  ref "urn:ai4x:capability:unsafe-auto-approve"
                    : capabilityCatalogueSelected capabilities
              }
        }
  , InvalidFixture
      "invalid-capability-coverage-gap"
      CapabilityCoverageGap
      "Curation and Capabilities"
      positiveFixture
        { fixtureCapabilities =
            capabilities
              { capabilityCatalogueSelected = [ref "urn:ai4x:capability:evaluate-gate"] }
        }
  ]

additionalInvariantFixtures :: [InvalidFixture]
additionalInvariantFixtures =
  [ InvalidFixture
      "invariant-dependency-cycle"
      DependencyCycle
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement {workProfileItems = map addSelfDependency (workProfileItems workManagement)}
        }
  , InvalidFixture
      "invariant-duplicate-stage-id"
      DuplicateStageId
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement {workProfileStages = map duplicateTestStageId (workProfileStages workManagement)}
        }
  , InvalidFixture
      "invariant-governance-reference-version"
      ReferenceVersionMismatch
      "Governance and Assurance"
      positiveFixture
        { fixtureGovernance =
            governance
              { governanceReceipt =
                  (governanceReceipt governance)
                    { receiptGate = Ref (sid "urn:ai4x:gate:acceptance") (Version "2.0.0") }
              }
        }
  , InvalidFixture
      "invariant-receipt-coherence"
      ReceiptIncoherent
      "Governance and Assurance"
      positiveFixture
        { fixtureGovernance =
            governance
              { governanceReceipt =
                  (governanceReceipt governance)
                    { receiptEvidenceDigests = [Digest "sha256:test-evidence-v1"] }
              }
        }
  , InvalidFixture
      "invariant-transition-authority"
      UnauthorizedTransitionActor
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement
              { workProfileTransitions = wrongActorTransition : tail legalTransitions
              , workProfileAttemptedTransition = wrongActorTransition
              }
        }
  , InvalidFixture
      "invariant-transition-guard"
      TransitionGuardMismatch
      "Work Management"
      positiveFixture
        { fixtureWorkManagement =
            workManagement {workProfileTransitions = map removeReviewGuard legalTransitions}
        }
  ]

collaboration :: CollaborationModel
collaboration =
  CollaborationModel
    (sid "urn:ai4x:collaboration:review-team")
    fixtureVersion
    (source "Collaboration" "src/R15/Fixture.hs#collaboration")
    [ Participant po "Product Owner"
    , Participant techLead "Tech Lead"
    , Participant implementer "Implementer"
    , Participant reviewer "Reviewer"
    ]
    [ Role (sid "urn:ai4x:role:po") ["accept-work"] ["decide-waiver"] []
    , Role
        (sid "urn:ai4x:role:tech-lead")
        ["assign-work", "decide-design-gate"]
        ["remain-accountable-for-delegation"]
        ["self-review-implementation"]
    , Role (sid "urn:ai4x:role:implementer") ["produce-change"] ["provide-evidence"] []
    , Role (sid "urn:ai4x:role:reviewer") ["review-change"] ["escalate-blocker"] []
    ]
    [ Assignment (refIdVersion po) (ref "urn:ai4x:role:po")
    , Assignment (refIdVersion techLead) (ref "urn:ai4x:role:tech-lead")
    , Assignment (refIdVersion implementer) (ref "urn:ai4x:role:implementer")
    , Assignment (refIdVersion reviewer) (ref "urn:ai4x:role:reviewer")
    ]
    (Delegation (refIdVersion techLead) (refIdVersion implementer) "produce-change" True)
    ( Handoff
        (sid "urn:ai4x:handoff:implementation-review")
        (refIdVersion implementer)
        (refIdVersion reviewer)
        ["change", "evidence"]
    )
    (Review (sid "urn:ai4x:review:implementation") (refIdVersion reviewer) (refIdVersion implementer))
    (Escalation (refIdVersion techLead) (refIdVersion po) 1)

workManagement :: WorkProfile
workManagement =
  WorkProfile
    (sid "urn:ai4x:work-profile:epic-story")
    fixtureVersion
    (source "Work Management" "src/R15/Fixture.hs#workManagement")
    [ WorkItem (sid "urn:ai4x:item:epic-r15") Epic Nothing []
    , WorkItem
        (sid "urn:ai4x:item:story-r15")
        Story
        (Just (ref "urn:ai4x:item:epic-r15"))
        []
    ]
    legalTransitions
    (head legalTransitions)
    (sid "urn:ai4x:flow:story-delivery")
    [ Stage (sid "urn:ai4x:stage:implement") (refIdVersion implementer) [] AllEvidence
    , Stage (sid "urn:ai4x:stage:test") (refIdVersion reviewer) [ref "urn:ai4x:stage:implement"] AllEvidence
    , Stage (sid "urn:ai4x:stage:review") (refIdVersion reviewer) [ref "urn:ai4x:stage:implement"] SemanticReview
    , Stage
        (sid "urn:ai4x:stage:accept")
        (refIdVersion po)
        [ref "urn:ai4x:stage:test", ref "urn:ai4x:stage:review"]
        (JoinAll [ref "urn:ai4x:stage:test", ref "urn:ai4x:stage:review"])
    ]
    [ StageEvidence (ref "urn:ai4x:stage:implement") Complete
    , StageEvidence (ref "urn:ai4x:stage:test") Complete
    , StageEvidence (ref "urn:ai4x:stage:review") Complete
    , StageEvidence (ref "urn:ai4x:stage:accept") Complete
    ]
    ( Just
        ( FailurePath
            (ref "urn:ai4x:flow:story-delivery")
            (ref "urn:ai4x:stage:accept")
            True
        )
    )

issueSubIssueProfile :: WorkProfile
issueSubIssueProfile =
  WorkProfile
    (sid "urn:ai4x:work-profile:issue-subissue")
    fixtureVersion
    (source "Work Management" "src/R15/Fixture.hs#issueSubIssueProfile")
    [ WorkItem (sid "urn:ai4x:item:issue-r15") Issue Nothing []
    , WorkItem
        (sid "urn:ai4x:item:subissue-r15")
        SubIssue
        (Just (ref "urn:ai4x:item:issue-r15"))
        []
    ]
    legalTransitions
    (head legalTransitions)
    (sid "urn:ai4x:flow:issue-subissue")
    []
    []
    Nothing

legalTransitions :: [Transition]
legalTransitions =
  [ Transition Ready InProgress (refIdVersion techLead) Nothing
  , Transition InProgress InReview (refIdVersion techLead) (Just ImplementationEvidenceComplete)
  , Transition InReview Done (refIdVersion po) (Just AllowedDecisionAndAssuranceReceipt)
  , Transition InProgress Failed (refIdVersion techLead) Nothing
  , Transition InReview Failed (refIdVersion techLead) Nothing
  ]

illegalTransition :: Transition
illegalTransition = Transition Ready Done (refIdVersion po) Nothing

governance :: GovernanceModel
governance =
  GovernanceModel
    (sid "urn:ai4x:governance:two-gate")
    fixtureVersion
    (source "Governance and Assurance" "src/R15/Fixture.hs#governance")
    [ Authority (sid "urn:ai4x:authority:design") (refIdVersion techLead) (ref "urn:ai4x:gate:design") False
    , Authority (sid "urn:ai4x:authority:acceptance") (refIdVersion po) (ref "urn:ai4x:gate:acceptance") True
    ]
    [ Gate (sid "urn:ai4x:gate:design") []
    , Gate
        (sid "urn:ai4x:gate:acceptance")
        [ref "urn:ai4x:evidence:test", ref "urn:ai4x:evidence:review"]
    ]
    [ Decision
        (sid "urn:ai4x:decision:design-pass")
        (ref "urn:ai4x:gate:design")
        (refIdVersion techLead)
        DecisionPass
    , Decision
        (sid "urn:ai4x:decision:accept-pass")
        (ref "urn:ai4x:gate:acceptance")
        (refIdVersion po)
        DecisionPass
    ]
    [ Evidence (sid "urn:ai4x:evidence:test") (Digest "sha256:test-evidence-v1")
    , Evidence (sid "urn:ai4x:evidence:review") (Digest "sha256:review-evidence-v1")
    ]
    []
    ( AssurancePack
        (sid "urn:ai4x:assurance:acceptance")
        (ref "urn:ai4x:gate:acceptance")
        [ref "urn:ai4x:evidence:test", ref "urn:ai4x:evidence:review"]
        [ref "urn:ai4x:decision:design-pass", ref "urn:ai4x:decision:accept-pass"]
    )
    ( Receipt
        (sid "urn:ai4x:receipt:acceptance")
        (ref "urn:ai4x:gate:acceptance")
        (ref "urn:ai4x:decision:accept-pass")
        [Digest "sha256:review-evidence-v1", Digest "sha256:test-evidence-v1"]
    )

projectIntent :: ProjectIntent
projectIntent =
  ProjectIntent
    (sid "urn:ai4x:intent:r15")
    fixtureVersion
    (source "Project Intent" "src/R15/Fixture.hs#projectIntent")
    [ Need
        (sid "urn:ai4x:need:auditable-delivery")
        "Project work needs deterministic, traceable delivery decisions across declared collaboration and work models."
    ]
    [ (sid "urn:ai4x:constraint:offline", "Declaration validation works offline.")
    , (sid "urn:ai4x:constraint:explicit-authority", "Authorities and profiles are explicit.")
    ]
    [ (sid "urn:ai4x:anti-requirement:no-live-backlog-copy", "Do not copy live backlog status or order into Project Memory.")
    , (sid "urn:ai4x:anti-requirement:no-implicit-build", "Ordinary commands do not compile or evaluate declarations.")
    ]
    [ CognitiveJob
        (sid "urn:ai4x:cognitive-job:evaluate-gate")
        "Assess whether declared evidence semantically satisfies a gate, preserving uncertainty and escalating unresolved contradictions."
        (ref "urn:ai4x:need:auditable-delivery")
    ]

capabilities :: CapabilityCatalogue
capabilities =
  CapabilityCatalogue
    (sid "urn:ai4x:capabilities:r15")
    fixtureVersion
    (source "Curation and Capabilities" "src/R15/Fixture.hs#capabilities")
    [ Capability (sid "urn:ai4x:capability:validate-model") "deterministic" [] []
    , Capability
        (sid "urn:ai4x:capability:evaluate-gate")
        "cognitive"
        [ref "urn:ai4x:capability:validate-model"]
        [ref "urn:ai4x:capability:unsafe-auto-approve"]
    , Capability
        (sid "urn:ai4x:capability:unsafe-auto-approve")
        "prohibited"
        []
        [ref "urn:ai4x:capability:evaluate-gate"]
    ]
    [ ref "urn:ai4x:capability:validate-model"
    , ref "urn:ai4x:capability:evaluate-gate"
    ]
    [ NeedTrace
        (sid "urn:ai4x:trace:auditable-delivery")
        (ref "urn:ai4x:need:auditable-delivery")
        [ ref "urn:ai4x:capability:validate-model"
        , ref "urn:ai4x:capability:evaluate-gate"
        ]
        "Deterministic model validation supports evidence-based cognitive gate evaluation."
    ]

bundle :: ProjectBundle
bundle =
  ProjectBundle
    (sid "urn:ai4x:bundle:comparison")
    fixtureVersion
    [ pin "Collaboration" "urn:ai4x:collaboration:review-team"
    , pin "Work Management" "urn:ai4x:work-profile:epic-story"
    , pin "Governance and Assurance" "urn:ai4x:governance:two-gate"
    , pin "Project Intent" "urn:ai4x:intent:r15"
    , pin "Curation and Capabilities" "urn:ai4x:capabilities:r15"
    ]

projectEntry :: ProjectEntry
projectEntry =
  ProjectEntry
    (sid "urn:ai4x:project:comparison")
    (ref "urn:ai4x:collaboration:review-team")
    (ref "urn:ai4x:work-profile:epic-story")
    (ref "urn:ai4x:governance:two-gate")
    (ref "urn:ai4x:intent:r15")
    (ref "urn:ai4x:capabilities:r15")
    (refIdVersion po)
    [ HostBinding "github-project" (sid "urn:github:project:3")
    , HostBinding "github-repository" (sid "urn:github:repo:normenmueller/ai4x")
    ]

projectMemory :: ProjectMemory
projectMemory =
  ProjectMemory
    [ ref "urn:ai4x:bundle:comparison"
    , ref "urn:ai4x:project:comparison"
    ]
    [sid "urn:github:project:3", sid "urn:github:repo:normenmueller/ai4x"]

po, techLead, implementer, reviewer :: StableId
po = sid "urn:ai4x:participant:po"
techLead = sid "urn:ai4x:participant:tech-lead"
implementer = sid "urn:ai4x:participant:implementer"
reviewer = sid "urn:ai4x:participant:reviewer"

sid :: String -> StableId
sid = StableId

ref :: String -> Ref
ref = mkRef

refIdVersion :: StableId -> Ref
refIdVersion value = Ref value fixtureVersion

source :: String -> FilePath -> Source
source context path = Source context path sourceDigest

pin :: String -> String -> Pin
pin context identifier = Pin context (ref identifier) fixtureDigest

replaceAcceptanceDecider :: Decision -> Decision
replaceAcceptanceDecider decision
  | decisionId decision == sid "urn:ai4x:decision:accept-pass" =
      decision {decisionDecider = refIdVersion reviewer}
  | otherwise = decision

makeReviewIncomplete :: StageEvidence -> StageEvidence
makeReviewIncomplete evidence
  | refId (stageEvidenceStage evidence) == sid "urn:ai4x:stage:review" =
      evidence {stageEvidenceState = Pending}
  | otherwise = evidence

addSelfDependency :: WorkItem -> WorkItem
addSelfDependency item
  | workItemKind item == Story = item {workItemDependencies = [Ref (workItemId item) fixtureVersion]}
  | otherwise = item

duplicateTestStageId :: Stage -> Stage
duplicateTestStageId stage
  | stageId stage == sid "urn:ai4x:stage:test" = stage {stageId = sid "urn:ai4x:stage:implement"}
  | otherwise = stage

wrongActorTransition :: Transition
wrongActorTransition = (head legalTransitions) {transitionAuthority = refIdVersion reviewer}

removeReviewGuard :: Transition -> Transition
removeReviewGuard transition
  | transitionFrom transition == InProgress && transitionTo transition == InReview =
      transition {transitionGuard = Nothing}
  | otherwise = transition
