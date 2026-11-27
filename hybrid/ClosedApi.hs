{-# LANGUAGE Safe #-}

-- Deliberately inadequate prototype stand-in. Its fixture-specific IDs and the central
-- GraphSlice harness do not demonstrate the accepted separately owned product packages.
module ClosedApi
  ( Actor (..), Role (..), Right (..), Duty (..), Prohibition (..)
  , State (..), Guard (..), Gate (..), CompletionPolicy (..)
  , CollaborationPolicy (..), WorkPolicy (..), GovernancePolicy (..)
  , actorId, gateId, renderState
  , renderCollaborationPolicy, renderWorkPolicy, renderGovernancePolicy
  ) where

import Data.List (intercalate)

data Actor = ProductOwner | TechLead | Implementer | Reviewer deriving (Eq, Ord, Show)
data Role = ProductOwnerRole | TechLeadRole | ImplementerRole | ReviewerRole deriving (Eq, Ord, Show)
data Right = AcceptWork | AssignWork | DecideDesignGate | ProduceChange | ReviewChange deriving (Eq, Ord, Show)
data Duty = DecideWaiver | RemainAccountableForDelegation | ProvideEvidence | EscalateBlocker deriving (Eq, Ord, Show)
data Prohibition = SelfReviewImplementation deriving (Eq, Ord, Show)
data State = Ready | InProgress | InReview | Done | Failed deriving (Eq, Ord, Show)
data Guard = CompleteImplementationEvidence | AllowedDecisionAndReceipt deriving (Eq, Ord, Show)
data Gate = DesignGate | AcceptanceGate deriving (Eq, Ord, Show)
data CompletionPolicy = JoinAll [String] deriving (Eq, Ord, Show)

data CollaborationPolicy
  = GrantsRight Role Right
  | ImposesDuty Role Duty
  | ImposesProhibition Role Prohibition
  | DelegationRetainsAccountability Actor
  deriving (Eq, Ord, Show)

data WorkPolicy
  = ExactlyOneParent String String
  | AcyclicDependency String String
  | AllowsTransition State State Actor [Guard]
  | CompletesStage String CompletionPolicy
  | FailedRequiredPredecessorTakesFailurePath String
  deriving (Eq, Ord, Show)

data GovernancePolicy
  = AuthorizesDecision String Gate Actor
  | AuthorizesWaiver String Gate Actor
  deriving (Eq, Ord, Show)

renderCollaborationPolicy :: CollaborationPolicy -> String
renderCollaborationPolicy value = case value of
  GrantsRight role right -> "collaboration.role:" ++ roleId role ++ ".right=" ++ rightName right
  ImposesDuty role duty -> "collaboration.role:" ++ roleId role ++ ".duty=" ++ dutyName duty
  ImposesProhibition role prohibition -> "collaboration.role:" ++ roleId role ++ ".prohibition=" ++ prohibitionName prohibition
  DelegationRetainsAccountability actor -> "collaboration.delegation.accountability=" ++ actorId actor

renderWorkPolicy :: WorkPolicy -> String
renderWorkPolicy value = case value of
  ExactlyOneParent child parent -> "work.hierarchy:" ++ child ++ ".parent=exactly-one:" ++ parent
  AcyclicDependency fromKind toKind -> "work.dependency:" ++ fromKind ++ "->" ++ toKind ++ "=acyclic"
  AllowsTransition fromState toState actor guards ->
    "work.transition:" ++ renderState fromState ++ "->" ++ renderState toState
      ++ ".actor=" ++ actorId actor ++ renderGuards guards
  CompletesStage stage (JoinAll predecessors) ->
    "work.completion:" ++ stage ++ "=join-all(" ++ intercalate "," predecessors ++ ")"
  FailedRequiredPredecessorTakesFailurePath stage ->
    "work.failure:failed-required-predecessor=prevent-" ++ stage ++ "-and-take-failure-path"

renderGovernancePolicy :: GovernancePolicy -> String
renderGovernancePolicy value = case value of
  AuthorizesDecision authority gate actor ->
    "governance.authority:" ++ authority ++ "=" ++ gateId gate ++ "@" ++ actorId actor
  AuthorizesWaiver authority gate actor ->
    "governance.waiver-authority:" ++ authority ++ "=" ++ gateId gate ++ "@" ++ actorId actor

renderState :: State -> String
renderState state = case state of
  Ready -> "ready"
  InProgress -> "in-progress"
  InReview -> "in-review"
  Done -> "done"
  Failed -> "failed"

actorId :: Actor -> String
actorId actor = case actor of
  ProductOwner -> "urn:ai4x:participant:po"
  TechLead -> "urn:ai4x:participant:tech-lead"
  Implementer -> "urn:ai4x:participant:implementer"
  Reviewer -> "urn:ai4x:participant:reviewer"

gateId :: Gate -> String
gateId gate = case gate of
  DesignGate -> "urn:ai4x:gate:design"
  AcceptanceGate -> "urn:ai4x:gate:acceptance"

roleId :: Role -> String
roleId role = case role of
  ProductOwnerRole -> "urn:ai4x:role:po"
  TechLeadRole -> "urn:ai4x:role:tech-lead"
  ImplementerRole -> "urn:ai4x:role:implementer"
  ReviewerRole -> "urn:ai4x:role:reviewer"

rightName :: Right -> String
rightName right = case right of
  AcceptWork -> "accept-work"
  AssignWork -> "assign-work"
  DecideDesignGate -> "decide-design-gate"
  ProduceChange -> "produce-change"
  ReviewChange -> "review-change"

dutyName :: Duty -> String
dutyName duty = case duty of
  DecideWaiver -> "decide-waiver"
  RemainAccountableForDelegation -> "remain-accountable-for-delegation"
  ProvideEvidence -> "provide-evidence"
  EscalateBlocker -> "escalate-blocker"

prohibitionName :: Prohibition -> String
prohibitionName SelfReviewImplementation = "self-review-implementation"

renderGuards :: [Guard] -> String
renderGuards [] = ""
renderGuards guards = ";guard=" ++ intercalate "+" (map guardName guards)

guardName :: Guard -> String
guardName guard = case guard of
  CompleteImplementationEvidence -> "complete-implementation-evidence"
  AllowedDecisionAndReceipt -> "allowed-governance-decision+assurance-receipt"
