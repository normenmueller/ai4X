module R15.WorkManagement
  ( ItemKind (..)
  , LifecycleState (..)
  , TransitionGuard (..)
  , WorkItem (..)
  , Transition (..)
  , CompletionPolicy (..)
  , StageState (..)
  , Stage (..)
  , StageEvidence (..)
  , FailurePath (..)
  , WorkProfile (..)
  , validateWorkProfile
  , validateWorkAssignments
  , renderItemKind
  , renderLifecycleState
  , renderTransitionGuard
  , renderCompletionPolicy
  , renderStageState
  ) where

import Data.List (nub, sort)
import R15.Common

data ItemKind = Epic | Story | Issue | SubIssue
  deriving (Eq, Ord, Show)

data LifecycleState = Ready | InProgress | InReview | Done | Failed
  deriving (Eq, Ord, Show)

data TransitionGuard
  = ImplementationEvidenceComplete
  | AllowedDecisionAndAssuranceReceipt
  deriving (Eq, Ord, Show)

data WorkItem = WorkItem
  { workItemId :: StableId
  , workItemKind :: ItemKind
  , workItemParent :: Maybe Ref
  , workItemDependencies :: [Ref]
  }
  deriving (Eq, Show)

data Transition = Transition
  { transitionFrom :: LifecycleState
  , transitionTo :: LifecycleState
  , transitionAuthority :: Ref
  , transitionGuard :: Maybe TransitionGuard
  }
  deriving (Eq, Ord, Show)

data CompletionPolicy
  = AllEvidence
  | SemanticReview
  | JoinAll [Ref]
  deriving (Eq, Ord, Show)

-- StageState belongs to operational fixture evidence, not the authoritative stage
-- declaration. Product runtime state remains external to Project Memory.
data StageState = Pending | Complete | FailedStage
  deriving (Eq, Ord, Show)

data Stage = Stage
  { stageId :: StableId
  , stageAssignee :: Ref
  , stagePredecessors :: [Ref]
  , stageCompletionPolicy :: CompletionPolicy
  }
  deriving (Eq, Show)

data StageEvidence = StageEvidence
  { stageEvidenceStage :: Ref
  , stageEvidenceState :: StageState
  }
  deriving (Eq, Show)

data FailurePath = FailurePath
  { failurePathFlow :: Ref
  , failurePathPreventedStage :: Ref
  , failurePathOnRequiredPredecessorFailure :: Bool
  }
  deriving (Eq, Show)

data WorkProfile = WorkProfile
  { workProfileId :: StableId
  , workProfileVersion :: Version
  , workProfileSource :: Source
  , workProfileItems :: [WorkItem]
  , workProfileTransitions :: [Transition]
  , workProfileAttemptedTransition :: Transition
  , workProfileFlowId :: StableId
  , workProfileStages :: [Stage]
  , workProfileStageEvidence :: [StageEvidence]
  , workProfileFailurePath :: Maybe FailurePath
  }
  deriving (Eq, Show)

validateWorkProfile :: WorkProfile -> [ValidationError]
validateWorkProfile profile =
  concat
    [ hierarchyErrors
    , transitionErrors
    , dependencyErrors
    , dependencyCycleErrors
    , duplicateStageErrors
    , stageReferenceErrors
    , joinErrors
    , failurePathErrors
    , referenceVersionErrors
    ]
  where
    items = workProfileItems profile
    itemIds = map workItemId items
    stages = workProfileStages profile
    stageIds = map stageId stages
    evidence = workProfileStageEvidence profile

    hierarchyErrors = concatMap validateHierarchy items
    validateHierarchy item =
      case workItemKind item of
        Story -> requireParent StoryParentRequired Epic "Story" item
        SubIssue -> requireParent SubIssueParentRequired Issue "SubIssue" item
        _ -> []
    requireParent missingKind parentKind childLabel item = case workItemParent item of
      Nothing -> [workError missingKind (childLabel ++ " requires exactly one " ++ renderItemKind parentKind ++ " parent")]
      Just parentRef
        | refId parentRef `elem` [workItemId candidate | candidate <- items, workItemKind candidate == parentKind] -> []
        | otherwise -> [unresolved "Work Management" "workItem.parent" (unStableId (refId parentRef))]

    declared = workProfileTransitions profile
    attempted = workProfileAttemptedTransition profile
    expectedPolicies =
      [ (Ready, InProgress, "urn:ai4x:participant:tech-lead", Nothing)
      , (InProgress, InReview, "urn:ai4x:participant:tech-lead", Just ImplementationEvidenceComplete)
      , (InReview, Done, "urn:ai4x:participant:po", Just AllowedDecisionAndAssuranceReceipt)
      , (InProgress, Failed, "urn:ai4x:participant:tech-lead", Nothing)
      , (InReview, Failed, "urn:ai4x:participant:tech-lead", Nothing)
      ]
    expectedShape = [(fromState, toState) | (fromState, toState, _, _) <- expectedPolicies]
    transitionErrors =
      illegalShapeErrors ++ transitionAuthorityErrors ++ transitionGuardErrors ++ attemptedErrors
    illegalShapeErrors =
      [ workError IllegalTransition (renderLifecycleState (transitionFrom value) ++ " -> " ++ renderLifecycleState (transitionTo value))
      | value <- declared
      , transitionShape value `notElem` expectedShape
      ]
    transitionAuthorityErrors =
      [ workError UnauthorizedTransitionActor (renderLifecycleState fromState ++ " -> " ++ renderLifecycleState toState)
      | (fromState, toState, expectedActor, _) <- expectedPolicies
      , value <- declared
      , transitionShape value == (fromState, toState)
      , unStableId (refId (transitionAuthority value)) /= expectedActor
      ]
    transitionGuardErrors =
      [ workError TransitionGuardMismatch (renderLifecycleState fromState ++ " -> " ++ renderLifecycleState toState)
      | (fromState, toState, _, expectedGuard) <- expectedPolicies
      , value <- declared
      , transitionShape value == (fromState, toState)
      , transitionGuard value /= expectedGuard
      ]
    attemptedErrors
      | attempted `elem` declared = []
      | otherwise = [workError IllegalTransition (renderLifecycleState (transitionFrom attempted) ++ " -> " ++ renderLifecycleState (transitionTo attempted))]
    transitionShape value = (transitionFrom value, transitionTo value)

    dependencyErrors = concatMap validateDependencies items
    validateDependencies item =
      [ unresolved "Work Management" "workItem.dependency" (unStableId (refId dependency))
      | dependency <- workItemDependencies item
      , refId dependency `notElem` itemIds
      ]
    dependencyCycleErrors
      | hasDependencyCycle items = [workError DependencyCycle "Work item dependency graph contains a cycle"]
      | otherwise = []

    duplicateStageErrors
      | length stageIds == length (nub stageIds) = []
      | otherwise = [workError DuplicateStageId "Stage IDs must be unique within a flow"]

    stageReferenceErrors =
      [ unresolved "Work Management" "stage.predecessor" (unStableId (refId predecessor))
      | stage <- stages
      , predecessor <- stagePredecessors stage
      , refId predecessor `notElem` stageIds
      ]
        ++ [ unresolved "Work Management" "stageEvidence.stage" (unStableId (refId (stageEvidenceStage value)))
           | value <- evidence
           , refId (stageEvidenceStage value) `notElem` stageIds
           ]

    stateFor identifier =
      case [stageEvidenceState value | value <- evidence, refId (stageEvidenceStage value) == identifier] of
        [state] -> Just state
        _ -> Nothing
    joinErrors = concatMap validateJoin stages
    validateJoin stage = case stageCompletionPolicy stage of
      JoinAll required
        | stateFor (stageId stage) /= Just Complete -> []
        | all ((== Just Complete) . stateFor . refId) required -> []
        | otherwise -> [workError IncompleteJoinAll (unStableId (stageId stage))]
      _ -> []

    failurePathErrors = case workProfileFailurePath profile of
      Nothing -> []
      Just failure
        | refId (failurePathFlow failure) /= workProfileFlowId profile ->
            [unresolved "Work Management" "failurePath.flow" (unStableId (refId (failurePathFlow failure)))]
        | refId (failurePathPreventedStage failure) `notElem` stageIds ->
            [unresolved "Work Management" "failurePath.preventedStage" (unStableId (refId (failurePathPreventedStage failure)))]
        | failurePathOnRequiredPredecessorFailure failure -> []
        | otherwise -> [workError IncompleteJoinAll "Failure path must prevent acceptance after a required predecessor fails"]

    referenceVersionErrors =
      concat
        [ concatMap itemRefVersions items
        , concatMap transitionRefVersions declared
        , transitionRefVersions attempted
        , concatMap stageRefVersions stages
        , concatMap (validateRefVersion "Work Management" "stageEvidence.stage" . stageEvidenceStage) evidence
        , maybe [] failureRefVersions (workProfileFailurePath profile)
        ]
    itemRefVersions item =
      maybe [] (validateRefVersion "Work Management" "workItem.parent") (workItemParent item)
        ++ concatMap (validateRefVersion "Work Management" "workItem.dependency") (workItemDependencies item)
    transitionRefVersions value = validateRefVersion "Work Management" "transition.authority" (transitionAuthority value)
    stageRefVersions stage =
      validateRefVersion "Work Management" "stage.assignee" (stageAssignee stage)
        ++ concatMap (validateRefVersion "Work Management" "stage.predecessor") (stagePredecessors stage)
        ++ case stageCompletionPolicy stage of
          JoinAll refs -> concatMap (validateRefVersion "Work Management" "completion.joinAll") refs
          _ -> []
    failureRefVersions failure =
      validateRefVersion "Work Management" "failurePath.flow" (failurePathFlow failure)
        ++ validateRefVersion "Work Management" "failurePath.preventedStage" (failurePathPreventedStage failure)

hasDependencyCycle :: [WorkItem] -> Bool
hasDependencyCycle items = any startsCycle (map workItemId items)
  where
    edges identifier =
      [ refId dependency
      | item <- items
      , workItemId item == identifier
      , dependency <- workItemDependencies item
      ]
    startsCycle start = any (reaches start []) (edges start)
      where
        reaches target visited current
          | current == target = True
          | current `elem` visited = False
          | otherwise = any (reaches target (current : visited)) (edges current)

workError :: ErrorKind -> String -> ValidationError
workError kind detail = invalid kind "Work Management" detail

validateWorkAssignments :: [StableId] -> WorkProfile -> [ValidationError]
validateWorkAssignments participantIds profile =
  concat
    [ [ unresolved "Work Management" "stage.assignee" (unStableId (refId (stageAssignee stage)))
      | stage <- workProfileStages profile
      , refId (stageAssignee stage) `notElem` participantIds
      ]
    , concatMap (validateRefVersion "Work Management" "stage.assignee" . stageAssignee) (workProfileStages profile)
    ]

renderItemKind :: ItemKind -> String
renderItemKind kind = case kind of
  Epic -> "Epic"
  Story -> "Story"
  Issue -> "Issue"
  SubIssue -> "SubIssue"

renderLifecycleState :: LifecycleState -> String
renderLifecycleState state = case state of
  Ready -> "ready"
  InProgress -> "in-progress"
  InReview -> "in-review"
  Done -> "done"
  Failed -> "failed"

renderTransitionGuard :: TransitionGuard -> String
renderTransitionGuard value = case value of
  ImplementationEvidenceComplete -> "implementation-evidence-complete"
  AllowedDecisionAndAssuranceReceipt -> "allowed-decision-and-assurance-receipt"

renderCompletionPolicy :: CompletionPolicy -> String
renderCompletionPolicy value = case value of
  AllEvidence -> "all-evidence"
  SemanticReview -> "semantic-review"
  JoinAll refs -> "join-all(" ++ commaSeparated (map renderRef refs) ++ ")"

renderStageState :: StageState -> String
renderStageState state = case state of
  Pending -> "pending"
  Complete -> "complete"
  FailedStage -> "failed"

renderRef :: Ref -> String
renderRef value = unStableId (refId value) ++ "@" ++ unVersion (refVersion value)

commaSeparated :: [String] -> String
commaSeparated [] = ""
commaSeparated values = foldr1 (\left right -> left ++ "," ++ right) (sort values)
