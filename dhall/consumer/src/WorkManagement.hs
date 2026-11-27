{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE DuplicateRecordFields #-}
{-# LANGUAGE OverloadedStrings #-}

module WorkManagement
  ( StateView (..), TransitionView (..), ProfileView (..), PolicyView (..), FailureView (..)
  , IterationView (..), FlowView (..), TransitionAttemptView (..)
  , StageRunView (..), JoinAttemptView (..), Input (..), validate
  ) where

import Prelude hiding (id)
import Common
import qualified Data.List as List
import Data.Text (Text)
import qualified Dhall
import GHC.Generics (Generic)
import Numeric.Natural (Natural)

data StateView = StateView { stateId :: Text, stateKind :: Text }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall StateView
data TransitionView = TransitionView
  { transitionId :: Text, declaredFromState :: Ref, declaredToState :: Ref
  , transitionActor :: Ref, guardKind :: Text }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall TransitionView
data ProfileView = ProfileView
  { profileId :: Text, profileVersion :: Text, states :: [StateView]
  , transitions :: [TransitionView] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall ProfileView
data PolicyView = PolicyView
  { policyStage :: Ref, predecessors :: [Ref], completionKind :: Text, joinAll :: [Ref] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall PolicyView
data FailureView = FailureView
  { failureId :: Text, triggeringStates :: [Ref], preventsStages :: [Ref] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall FailureView
data IterationView = IterationView
  { iterationId :: Text, fromStage :: Ref, toStage :: Ref, guard :: Ref
  , maxIterations :: Natural, onExhaustionStage :: Ref }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall IterationView
data FlowView = FlowView
  { flowId :: Text, flowVersion :: Text, stageIds :: [Text]
  , policies :: [PolicyView], failurePaths :: [FailureView], iterations :: [IterationView] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall FlowView
data TransitionAttemptView = TransitionAttemptView
  { profile :: Ref, transition :: Ref, attemptedFromState :: Ref
  , attemptedToState :: Ref, attemptedActor :: Ref }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall TransitionAttemptView
data StageRunView = StageRunView { runStage :: Ref, state :: Text }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall StageRunView
data JoinAttemptView = JoinAttemptView
  { flow :: Ref, requestedStage :: Ref, requestedState :: Text
  , stageRuns :: [StageRunView] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall JoinAttemptView

data Input = Input
  { published :: [PublishedEntity], localReferences :: [ReferencePort], entryProfile :: Ref
  , profiles :: [ProfileView], flows :: [FlowView]
  , transitionAttempts :: [TransitionAttemptView], joinAttempts :: [JoinAttemptView] }

validate :: Input -> ([Diagnostic], PublishedSummary)
validate input = (base <> transitionDiagnostics <> joinDiagnostics <> iterationDiagnostics, summary)
  where
    (base, summary) = validateIndex WorkManagementOwner "workManagement" (published input) (localReferences input)
    selected = List.find (\p -> profileId p == id (entryProfile input) && profileVersion p == version (entryProfile input)) (profiles input)
    transitionDiagnostics = case selected of
      Nothing -> [Diagnostic UnresolvedReference WorkManagementOwner "projectEntry.workProfile"]
      Just p ->
        [ Diagnostic IllegalTransition WorkManagementOwner "workManagement.profiles.transitions"
        | t <- transitions p, not (validTerminal p t) ]
        <> [ Diagnostic IllegalTransition WorkManagementOwner "validation.transitionAttempt"
           | a <- transitionAttempts input, profile a /= entryProfile input || not (attemptDeclared p a) ]
    joinDiagnostics =
      [ Diagnostic IncompleteJoinAll WorkManagementOwner "workManagement.flows.policies.joinAll"
      | f <- flows input, p <- policies f, completionKind p == "join-all", null (joinAll p) ]
      <> [ Diagnostic IncompleteJoinAll WorkManagementOwner "validation.joinAttempt"
         | a <- joinAttempts input, not (joinComplete input a) ]
    iterationDiagnostics =
      [ Diagnostic InvalidIterationPolicy WorkManagementOwner "workManagement.flows.iterations"
      | f <- flows input, i <- iterations f
      , maxIterations i == 0 || any (\r -> id r `notElem` stageIds f) [fromStage i, toStage i, onExhaustionStage i]
          || not (any (\entity -> stableId entity == id (guard i) && entityKind entity == ProcessGuard) (published input)) ]

validTerminal :: ProfileView -> TransitionView -> Bool
validTerminal p t = case stateKindOf p (declaredToState t) of
  Just "terminal-success" -> stateKindOf p (declaredFromState t) == Just "review" && guardKind t == "governance-receipt"
  _ -> True

stateKindOf :: ProfileView -> Ref -> Maybe Text
stateKindOf p r = stateKind <$> List.find ((== id r) . stateId) (states p)

attemptDeclared :: ProfileView -> TransitionAttemptView -> Bool
attemptDeclared p a = any matches (transitions p)
  where matches t = transitionId t == id (transition a) && declaredFromState t == attemptedFromState a
          && declaredToState t == attemptedToState a && transitionActor t == attemptedActor a && validTerminal p t

joinComplete :: Input -> JoinAttemptView -> Bool
joinComplete input a = case List.find (\f -> flowId f == id (flow a) && flowVersion f == version (flow a)) (flows input) of
  Nothing -> False
  Just f -> case List.find ((== requestedStage a) . policyStage) (policies f) of
    Nothing -> False
    Just p -> requestedState a /= "succeeded" || completionKind p /= "join-all"
      || (not (null (joinAll p)) && all predecessorSucceeded (joinAll p))
  where predecessorSucceeded predecessor = any (\r -> runStage r == predecessor && state r == "succeeded") (stageRuns a)
