{-# LANGUAGE Safe #-}

-- Authoritative concrete project policy values. ClosedApi stands in for the versioned
-- constructors owned by separate product packages; this module cannot extend them.
module HybridPolicy
  ( policyLines, allowedTransitions, gateDeciders
  , retainedAccountability, joinRequirements
  ) where

import ClosedApi

type Identifier = String

collaborationPolicies :: [CollaborationPolicy]
collaborationPolicies =
  [ GrantsRight ProductOwnerRole AcceptWork
  , ImposesDuty ProductOwnerRole DecideWaiver
  , GrantsRight TechLeadRole AssignWork
  , GrantsRight TechLeadRole DecideDesignGate
  , ImposesDuty TechLeadRole RemainAccountableForDelegation
  , ImposesProhibition TechLeadRole SelfReviewImplementation
  , GrantsRight ImplementerRole ProduceChange
  , ImposesDuty ImplementerRole ProvideEvidence
  , GrantsRight ReviewerRole ReviewChange
  , ImposesDuty ReviewerRole EscalateBlocker
  , DelegationRetainsAccountability TechLead
  ]

workPolicies :: [WorkPolicy]
workPolicies =
  [ ExactlyOneParent "Story" "Epic"
  , AcyclicDependency "Story" "Story"
  , AllowsTransition Ready InProgress TechLead []
  , AllowsTransition InProgress InReview TechLead [CompleteImplementationEvidence]
  , AllowsTransition InReview Done ProductOwner [AllowedDecisionAndReceipt]
  , AllowsTransition InProgress Failed TechLead []
  , AllowsTransition InReview Failed TechLead []
  , CompletesStage "urn:ai4x:stage:accept" (JoinAll ["urn:ai4x:stage:test", "urn:ai4x:stage:review"])
  , FailedRequiredPredecessorTakesFailurePath "accept"
  ]

governancePolicies :: [GovernancePolicy]
governancePolicies =
  [ AuthorizesDecision "urn:ai4x:authority:design" DesignGate TechLead
  , AuthorizesDecision "urn:ai4x:authority:acceptance" AcceptanceGate ProductOwner
  , AuthorizesWaiver "urn:ai4x:authority:acceptance" AcceptanceGate ProductOwner
  ]

policyLines :: [String]
policyLines =
  [ "haskell.segment.version=1.0.0"
  , "haskell.segment.expected-reference-version=1.0.0"
  , "haskell.segment.provenance-digest=sha256:fixture-positive-v1"
  , "haskell.segment.source-digest-token=sha256:source-fixture-v1"
  ]
    ++ map renderCollaborationPolicy collaborationPolicies
    ++ map renderWorkPolicy workPolicies
    ++ map renderGovernancePolicy governancePolicies

allowedTransitions :: [(String, String, Identifier)]
allowedTransitions =
  [ (renderState Ready, renderState InProgress, actorId TechLead)
  , (renderState InProgress, renderState InReview, actorId TechLead)
  , (renderState InReview, renderState Done, actorId ProductOwner)
  , (renderState InProgress, renderState Failed, actorId TechLead)
  , (renderState InReview, renderState Failed, actorId TechLead)
  ]

gateDeciders :: [(Identifier, Identifier)]
gateDeciders =
  [ (gateId DesignGate, actorId TechLead)
  , (gateId AcceptanceGate, actorId ProductOwner)
  ]

retainedAccountability :: (Identifier, Identifier)
retainedAccountability = (actorId TechLead, actorId TechLead)

joinRequirements :: (Identifier, [Identifier])
joinRequirements =
  ("urn:ai4x:stage:accept", ["urn:ai4x:stage:test", "urn:ai4x:stage:review"])
