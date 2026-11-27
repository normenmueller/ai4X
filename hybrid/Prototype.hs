{-# LANGUAGE Safe #-}

-- Illustrative boundary test-double evidence only. This deliberately centralized
-- GraphSlice does not parse or link project.dhall, does not prove package ownership,
-- and is not authoritative-source validation.
module Main (main) where

import Data.List (intercalate, sort)
import HybridPolicy
  ( allowedTransitions
  , gateDeciders
  , joinRequirements
  , policyLines
  , retainedAccountability
  )
import System.Exit (exitFailure)

type Identifier = String

data ErrorCode
  = UnresolvedReference
  | IllegalTransition
  | DelegationAccountabilityConflict
  | UnauthorizedGateDecision
  | IncompleteJoinAll
  | CapabilityConflict
  | CapabilityCoverageGap
  deriving (Eq, Ord)

data Owner
  = Collaboration
  | WorkManagement
  | GovernanceAssurance
  | CurationCapabilities
  deriving (Eq, Ord, Show)

data Diagnostic = Diagnostic
  { errorCode :: ErrorCode
  , owner :: Owner
  , source :: FilePath
  , pointer :: String
  }
  deriving (Eq, Ord)

data GraphSlice = GraphSlice
  { participants :: [Identifier]
  , handoffReceiver :: Identifier
  , delegator :: Identifier
  , accountabilityHolder :: Identifier
  , attemptedTransition :: (String, String, Identifier)
  , gate :: Identifier
  , gateDecider :: Identifier
  , acceptComplete :: Bool
  , completedStages :: [Identifier]
  , selectedCapabilities :: [Identifier]
  , capabilityRequirements :: [(Identifier, [Identifier])]
  , capabilityConflicts :: [(Identifier, [Identifier])]
  , tracedCapabilities :: [Identifier]
  }
  deriving (Eq, Show)

positive :: GraphSlice
positive =
  GraphSlice
    { participants = [po, techLead, implementer, reviewer]
    , handoffReceiver = reviewer
    , delegator = techLead
    , accountabilityHolder = techLead
    , attemptedTransition = ("ready", "in-progress", techLead)
    , gate = acceptanceGate
    , gateDecider = po
    , acceptComplete = True
    , completedStages = [testStage, reviewStage]
    , selectedCapabilities = [validateModel, evaluateGate]
    , capabilityRequirements = [(evaluateGate, [validateModel])]
    , capabilityConflicts = [(evaluateGate, [unsafeApprove]), (unsafeApprove, [evaluateGate])]
    , tracedCapabilities = [validateModel, evaluateGate]
    }

validate :: GraphSlice -> [Diagnostic]
validate value =
  validateCollaboration value
    ++ validateWorkManagement value
    ++ validateGovernance value
    ++ validateCapabilities value

validateCollaboration :: GraphSlice -> [Diagnostic]
validateCollaboration value = unresolved ++ accountability
  where
    unresolved =
      [ diagnostic UnresolvedReference Collaboration "collaboration.handoff.receiver"
      | handoffReceiver value `notElem` participants value
      ]
    expected = snd retainedAccountability
    accountability =
      [ diagnostic DelegationAccountabilityConflict Collaboration "collaboration.delegation.accountabilityHolder"
      | delegator value == fst retainedAccountability
      , accountabilityHolder value /= expected
      ]

validateWorkManagement :: GraphSlice -> [Diagnostic]
validateWorkManagement value = transition ++ joinAll
  where
    transition =
      [ diagnostic IllegalTransition WorkManagement "workManagement.attemptedTransition"
      | attemptedTransition value `notElem` allowedTransitions
      ]
    (_, required) = joinRequirements
    joinAll =
      [ diagnostic IncompleteJoinAll WorkManagement "workManagement.flow.accept.completion"
      | acceptComplete value
      , any (`notElem` completedStages value) required
      ]

validateGovernance :: GraphSlice -> [Diagnostic]
validateGovernance value =
  [ diagnostic UnauthorizedGateDecision GovernanceAssurance "governance.decisions.accept-pass.decider"
  | lookup (gate value) gateDeciders /= Just (gateDecider value)
  ]

validateCapabilities :: GraphSlice -> [Diagnostic]
validateCapabilities value = conflict ++ coverage
  where
    selected = selectedCapabilities value
    conflict =
      [ diagnostic CapabilityConflict CurationCapabilities "capabilities.selected"
      | any (hasSelectedConflict selected) (capabilityConflicts value)
      ]
    required = concat [dependencies | (capability, dependencies) <- capabilityRequirements value, capability `elem` selected]
    missingRequired = any (`notElem` selected) required
    tracedButNotSelected = any (`notElem` selected) (tracedCapabilities value)
    coverage =
      [ diagnostic CapabilityCoverageGap CurationCapabilities "capabilities.trace.capabilities"
      | null selected || missingRequired || tracedButNotSelected
      ]

hasSelectedConflict :: [Identifier] -> (Identifier, [Identifier]) -> Bool
hasSelectedConflict selected (capability, conflicts) =
  capability `elem` selected && any (`elem` selected) conflicts

diagnostic :: ErrorCode -> Owner -> String -> Diagnostic
diagnostic code context field =
  Diagnostic
    { errorCode = code
    , owner = context
    , source = "hybrid/project.dhall"
    , pointer = field
    }

variants :: [(String, GraphSlice, ErrorCode, Owner)]
variants =
  [ ( "invalid-unresolved-reference"
    , positive {handoffReceiver = "urn:ai4x:participant:missing"}
    , UnresolvedReference
    , Collaboration
    )
  , ( "invalid-illegal-transition"
    , positive {attemptedTransition = ("ready", "done", techLead)}
    , IllegalTransition
    , WorkManagement
    )
  , ( "invalid-delegation-accountability"
    , positive {accountabilityHolder = implementer}
    , DelegationAccountabilityConflict
    , Collaboration
    )
  , ( "invalid-unauthorized-gate-decision"
    , positive {gateDecider = reviewer}
    , UnauthorizedGateDecision
    , GovernanceAssurance
    )
  , ( "invalid-incomplete-join-all"
    , positive {completedStages = [testStage]}
    , IncompleteJoinAll
    , WorkManagement
    )
  , ( "invalid-capability-conflict"
    , positive {selectedCapabilities = [validateModel, evaluateGate, unsafeApprove]}
    , CapabilityConflict
    , CurationCapabilities
    )
  , ( "invalid-capability-coverage-gap"
    , positive {selectedCapabilities = [evaluateGate]}
    , CapabilityCoverageGap
    , CurationCapabilities
    )
  ]

main :: IO ()
main = do
  putStrLn "EVIDENCE_SCOPE=ILLUSTRATIVE_BOUNDARY_TEST_DOUBLE_NOT_LINKED_SOURCE_VALIDATION"
  putStrLn "HYBRID_POLICY_SEGMENT_V1"
  mapM_ putStrLn (sort policyLines)
  putStrLn "SOURCE_MAP"
  putStrLn "haskell=hybrid/HybridPolicy.hs"
  putStrLn "dhall=hybrid/project.dhall"
  putStrLn "source-digest-token=sha256:source-fixture-v1 (fixture token, not a computed digest)"
  putStrLn "test-double.positive=PASS"
  let results = map checkVariant variants
  mapM_ (putStrLn . ("test-double." ++)) results
  if null (validate positive) && all (/= "FAIL") (map resultMarker results)
    then do
      putStrLn "illustrative-test-double-matrix=PASS"
      putStrLn "common-fixture-linked-authoritative-source-validation=NOT_EXECUTED"
    else exitFailure

checkVariant :: (String, GraphSlice, ErrorCode, Owner) -> String
checkVariant (name, value, expectedCode, expectedOwner) =
  let findings = validate value
      matched = any (\finding -> errorCode finding == expectedCode && owner finding == expectedOwner) findings
      rendered = if matched then renderErrorCode expectedCode ++ "@" ++ show expectedOwner else "FAIL"
  in name ++ "=" ++ rendered ++ sourcePointers findings

sourcePointers :: [Diagnostic] -> String
sourcePointers findings =
  ";diagnostics="
    ++ intercalate "," [source finding ++ ":" ++ pointer finding ++ relatedPolicy finding | finding <- findings]

relatedPolicy :: Diagnostic -> String
relatedPolicy finding = case errorCode finding of
  IllegalTransition -> "|hybrid/HybridPolicy.hs:work.transition"
  DelegationAccountabilityConflict -> "|hybrid/HybridPolicy.hs:collaboration.delegation.accountability"
  UnauthorizedGateDecision -> "|hybrid/HybridPolicy.hs:governance.authority"
  IncompleteJoinAll -> "|hybrid/HybridPolicy.hs:work.completion"
  _ -> ""

resultMarker :: String -> String
resultMarker line = if "=FAIL" `contains` line then "FAIL" else "PASS"

contains :: Eq a => [a] -> [a] -> Bool
contains needle haystack = any (needle `prefixOf`) (tails haystack)

prefixOf :: Eq a => [a] -> [a] -> Bool
prefixOf [] _ = True
prefixOf _ [] = False
prefixOf (x : xs) (y : ys) = x == y && prefixOf xs ys

tails :: [a] -> [[a]]
tails [] = [[]]
tails value@(_ : rest) = value : tails rest

renderErrorCode :: ErrorCode -> String
renderErrorCode code = case code of
  UnresolvedReference -> "UNRESOLVED_REFERENCE"
  IllegalTransition -> "ILLEGAL_TRANSITION"
  DelegationAccountabilityConflict -> "DELEGATION_ACCOUNTABILITY_CONFLICT"
  UnauthorizedGateDecision -> "UNAUTHORIZED_GATE_DECISION"
  IncompleteJoinAll -> "INCOMPLETE_JOIN_ALL"
  CapabilityConflict -> "CAPABILITY_CONFLICT"
  CapabilityCoverageGap -> "CAPABILITY_COVERAGE_GAP"

po, techLead, implementer, reviewer :: Identifier
po = "urn:ai4x:participant:po"
techLead = "urn:ai4x:participant:tech-lead"
implementer = "urn:ai4x:participant:implementer"
reviewer = "urn:ai4x:participant:reviewer"

acceptanceGate, testStage, reviewStage :: Identifier
acceptanceGate = "urn:ai4x:gate:acceptance"
testStage = "urn:ai4x:stage:test"
reviewStage = "urn:ai4x:stage:review"

validateModel, evaluateGate, unsafeApprove :: Identifier
validateModel = "urn:ai4x:capability:validate-model"
evaluateGate = "urn:ai4x:capability:evaluate-gate"
unsafeApprove = "urn:ai4x:capability:unsafe-auto-approve"
