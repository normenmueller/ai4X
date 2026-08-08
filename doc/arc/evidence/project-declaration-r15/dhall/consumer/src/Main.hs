{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE DuplicateRecordFields #-}
{-# LANGUAGE OverloadedStrings #-}

module Main (main) where

import Prelude hiding (id)
import qualified Collaboration
import Common
import qualified Composition
import qualified Curation
import qualified Data.List as List
import qualified Data.Set as Set
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Data.Text.IO as Text
import qualified Dhall
import GHC.Generics (Generic)
import qualified Governance
import qualified Intent
import Loader
import System.Environment (getArgs)
import System.Exit (exitFailure)
import System.FilePath ((</>))
import qualified WorkManagement as Work

data ConsumerCase = ConsumerCase
  { caseId :: Text
  , collaborationPublished :: [PublishedEntity], collaborationLocalReferences :: [ReferencePort]
  , workPublished :: [PublishedEntity], workLocalReferences :: [ReferencePort]
  , governancePublished :: [PublishedEntity], governanceLocalReferences :: [ReferencePort]
  , intentPublished :: [PublishedEntity], intentLocalReferences :: [ReferencePort]
  , curationPublished :: [PublishedEntity], curationLocalReferences :: [ReferencePort]
  , compositionPublished :: [PublishedEntity], compositionLocalReferences :: [ReferencePort]
  , crossContextReferences :: [ReferencePort]
  , entryWorkProfile :: Ref
  , delegations :: [Collaboration.DelegationView]
  , profiles :: [Work.ProfileView], flows :: [Work.FlowView]
  , authorities :: [Governance.AuthorityView], decisions :: [Governance.DecisionView]
  , capabilityContracts :: [Curation.CapabilityView]
  , selectedCapabilities :: [Ref], traces :: [Curation.TraceView]
  , transitionAttempts :: [Work.TransitionAttemptView], joinAttempts :: [Work.JoinAttemptView]
  } deriving stock (Generic)
instance Dhall.FromDhall ConsumerCase

data Expectation = Expectation FilePath (Set.Set (Owner, Code))

expectations :: [Expectation]
expectations =
  [ Expectation "positive" Set.empty
  , Expectation "invalid-unresolved-reference" (Set.singleton (CollaborationOwner, UnresolvedReference))
  , Expectation "invalid-wrong-entity-kind" (Set.singleton (CollaborationOwner, WrongEntityKind))
  , Expectation "invalid-wrong-version" (Set.singleton (CollaborationOwner, InvalidReferenceVersion))
  , Expectation "invalid-illegal-transition" (Set.singleton (WorkManagementOwner, IllegalTransition))
  , Expectation "invalid-delegation-accountability" (Set.singleton (CollaborationOwner, DelegationAccountabilityConflict))
  , Expectation "invalid-unauthorized-gate-decision" (Set.singleton (GovernanceOwner, UnauthorizedGateDecision))
  , Expectation "invalid-incomplete-join-all" (Set.singleton (WorkManagementOwner, IncompleteJoinAll))
  , Expectation "invalid-empty-join-all" (Set.singleton (WorkManagementOwner, IncompleteJoinAll))
  , Expectation "invalid-capability-conflict" (Set.singleton (CurationOwner, CapabilityConflict))
  , Expectation "invalid-capability-coverage-gap" (Set.singleton (CurationOwner, CapabilityCoverageGap))
  ]

validate :: ConsumerCase -> ([Diagnostic], Work.Input)
validate fixture = (localDiagnostics <> crossDiagnostics, workInput)
  where
    collabInput = Collaboration.Input (collaborationPublished fixture) (collaborationLocalReferences fixture) (delegations fixture)
    workInput = Work.Input (workPublished fixture) (workLocalReferences fixture) (entryWorkProfile fixture) (profiles fixture) (flows fixture) (transitionAttempts fixture) (joinAttempts fixture)
    govInput = Governance.Input (governancePublished fixture) (governanceLocalReferences fixture) (authorities fixture) (decisions fixture)
    intentInput = Intent.Input (intentPublished fixture) (intentLocalReferences fixture)
    curationInput = Curation.Input (curationPublished fixture) (curationLocalReferences fixture) (capabilityContracts fixture) (selectedCapabilities fixture) (traces fixture)
    compositionInput = Composition.Input (compositionPublished fixture) (compositionLocalReferences fixture) (crossContextReferences fixture)
    (collabDiagnostics, collabSummary) = Collaboration.validate collabInput
    (workDiagnostics, workSummary) = Work.validate workInput
    (govDiagnostics, govSummary) = Governance.validate govInput
    (intentDiagnostics, intentSummary) = Intent.validate intentInput
    (curationDiagnostics, curationSummary) = Curation.validate curationInput
    (crossDiagnostics, _) = Composition.validate [collabSummary, workSummary, govSummary, intentSummary, curationSummary] compositionInput
    localDiagnostics = collabDiagnostics <> workDiagnostics <> govDiagnostics <> intentDiagnostics <> curationDiagnostics

runFixture :: Int -> FilePath -> FilePath -> Expectation -> IO (Bool, Maybe Work.Input)
runFixture timeoutSeconds root viewsRoot (Expectation name expected) = do
  loaded <- loadClosed timeoutSeconds root (viewsRoot </> name <> ".dhall")
  case loaded of
    Left err -> print err >> pure (False, Nothing)
    Right fixture -> do
      let (diagnostics, workInput) = validate fixture
          actual = Set.fromList [(diagnosticOwner d, diagnosticCode d) | d <- diagnostics]
          passed = actual == expected
      Text.putStrLn ((if passed then "PASS " else "FAIL ") <> caseId fixture)
      mapM_ (Text.putStrLn . renderDiagnostic) (List.sort diagnostics)
      pure (passed, if name == "positive" then Just workInput else Nothing)

renderDiagnostic :: Diagnostic -> Text
renderDiagnostic d = Text.pack (show (diagnosticOwner d)) <> ":" <> Text.pack (show (diagnosticCode d)) <> " @ " <> diagnosticPath d

runLoaderCheck :: Int -> FilePath -> FilePath -> IO Bool
runLoaderCheck timeoutSeconds root name = do
  result <- loadClosed timeoutSeconds root (root </> "consumer" </> "adversarial" </> name) :: IO (Either LoaderError ConsumerCase)
  let passed = case result of Left (ImportPolicyError _) -> True; _ -> False
  putStrLn ((if passed then "PASS loader/" else "FAIL loader/") <> name)
  pure passed

renderMermaid :: Work.Input -> Text
renderMermaid input = Text.unlines ("%% derived, non-authoritative" : "flowchart LR" : concatMap renderFlow (List.sortOn Work.flowId (Work.flows input)))
  where
    renderFlow flow =
      map (\node -> "  " <> key node <> "[\"" <> nodeLabel flow node <> "\"]") (List.sort (Work.stageIds flow))
      <> ["  " <> key (id predecessor) <> " --> " <> key (id (Work.policyStage policy)) | policy <- Work.policies flow, predecessor <- Work.predecessors policy]
      <> ["  " <> key (id (Work.fromStage loop)) <> " -. \"guard=" <> short (id (Work.guard loop)) <> "; max=" <> Text.pack (show (Work.maxIterations loop)) <> "\" .-> " <> key (id (Work.toStage loop)) | loop <- Work.iterations flow]
      <> ["  " <> key (id (Work.fromStage loop)) <> " -. \"budget-exhausted\" .-> " <> key (id (Work.onExhaustionStage loop)) | loop <- Work.iterations flow]
      <> ["  failure((failed)) -. \"prevents\" .-> " <> key (id stage) | failure <- Work.failurePaths flow, stage <- Work.preventsStages failure]
    key = Text.map (\c -> if c == '-' || c == ':' then '_' else c) . short
    short = last . Text.splitOn ":"
    nodeLabel flow node = short node <> if any (\p -> id (Work.policyStage p) == node && Work.completionKind p == "join-all") (Work.policies flow) then " (join-all)" else ""

parseArgs :: [String] -> Maybe (FilePath, Int, FilePath)
parseArgs ["--project-root", root, "--eval-timeout", seconds, "--mermaid-output", output] = case reads seconds of [(n, "")] | n > 0 -> Just (root, n, output); _ -> Nothing
parseArgs _ = Nothing

main :: IO ()
main = do
  args <- getArgs
  (root, timeoutSeconds, mermaidOutput) <- maybe (putStrLn "usage: r15-dhall-consumer --project-root ROOT --eval-timeout SECONDS --mermaid-output FILE" >> exitFailure) pure (parseArgs args)
  results <- mapM (runFixture timeoutSeconds root (root </> "consumer" </> "views")) expectations
  loaderResults <- mapM (runLoaderCheck timeoutSeconds root) ["remote.dhall", "unfrozen-local.dhall"]
  case [work | (_, Just work) <- results] of
    [work] -> Text.writeFile mermaidOutput (renderMermaid work)
    _ -> exitFailure
  if all fst results && and loaderResults then pure () else exitFailure
