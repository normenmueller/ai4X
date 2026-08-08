module R15.Artifact
  ( ArtifactErrorKind (..)
  , ArtifactError (..)
  , emitArtifact
  , validateArtifact
  , renderArtifactErrorKind
  ) where

import Data.List (intercalate, isPrefixOf, nub, sort)
import Data.Maybe (mapMaybe)
import R15.Capabilities
import R15.Collaboration
import R15.Common
import R15.Fixture
import R15.Governance
import R15.Integration
import R15.ProjectIntent
import R15.WorkManagement

data ArtifactErrorKind
  = ArtifactHeaderInvalid
  | ArtifactNotCanonical
  | ArtifactDuplicateFact
  | ArtifactSourceMappingMissing
  | ArtifactSourceDigestInvalid
  | ArtifactFactSourceMissing
  | ArtifactReferenceVersionMismatch
  | ArtifactAcceptanceAuthorityInvalid
  | ArtifactAcceptanceDecisionMissing
  | ArtifactReceiptIncoherent
  | ArtifactIncompleteJoinAll
  | ArtifactTransitionPolicyInvalid
  | ArtifactFlowMissing
  | ArtifactFailurePathMissing
  | ArtifactEscalationMissing
  | ArtifactWaiverShapeMissing
  | ArtifactContainsLiveBacklog
  deriving (Eq, Ord, Show)

data ArtifactError = ArtifactError
  { artifactErrorKind :: ArtifactErrorKind
  , artifactErrorDetail :: String
  }
  deriving (Eq, Ord, Show)

data ParsedFact = ParsedFact
  { parsedContext :: String
  , parsedKind :: String
  , parsedId :: String
  , parsedFields :: [(String, String)]
  }
  deriving (Eq, Show)

emitArtifact :: Fixture -> String
emitArtifact fixture = unlines (artifactHeader : sort (artifactFacts fixture))

-- This validator consumes only inert rows. It does not evaluate or consult R15.Fixture
-- values; constants below are protocol-v1 constraints of the artifact boundary.
validateArtifact :: String -> [ArtifactError]
validateArtifact input =
  concat
    [ headerErrors
    , orderingErrors
    , duplicateErrors
    , sourceErrors
    , factSourceErrors
    , referenceVersionErrors
    , acceptanceAuthorityErrors
    , acceptanceDecisionErrors
    , receiptErrors
    , joinErrors
    , transitionErrors
    , requiredWorkFactErrors
    , escalationErrors
    , waiverShapeErrors
    , forbiddenLiveStateErrors
    ]
  where
    rows = lines input
    body = drop 1 rows
    facts = mapMaybe parseFact body

    headerErrors
      | take 1 rows == [artifactHeader] = []
      | otherwise = [artifactError ArtifactHeaderInvalid "Expected HybridEnvelope-compatible semantic fixture header"]
    orderingErrors
      | body == sort body = []
      | otherwise = [artifactError ArtifactNotCanonical "Artifact facts must be sorted"]
    duplicateErrors
      | length body == length (nub body) = []
      | otherwise = [artifactError ArtifactDuplicateFact "Artifact facts must be unique"]

    requiredSourceContexts =
      [ "Collaboration"
      , "Work Management"
      , "Governance and Assurance"
      , "Project Intent"
      , "Curation and Capabilities"
      ]
    sourceRows = [splitOn '|' row | row <- body, "source|" `isPrefixOf` row]
    sourceErrors =
      [ artifactError ArtifactSourceMappingMissing context
      | context <- requiredSourceContexts
      , not (any (isSourceFor context) sourceRows)
      ]
        ++ [ artifactError ArtifactSourceDigestInvalid (sourceRowLabel parts)
           | parts <- sourceRows
           , lookupPart "digest" parts /= Just "sha256:source-fixture-v1"
               || lookupPart "digest-kind" parts /= Just "fixture-token-not-computed"
           ]
    isSourceFor context parts = take 2 parts == ["source", context]
    sourceRowLabel parts = case drop 1 parts of
      value : _ -> value
      [] -> "unknown-source"

    factSourceErrors =
      [ artifactError ArtifactFactSourceMissing (parsedContext value ++ ":" ++ parsedKind value ++ ":" ++ parsedId value)
      | value <- facts
      , factField "source-path" value /= Just "src/R15/Fixture.hs"
          || factField "source-anchor" value == Nothing
      ]

    referenceFieldNames =
      [ "role", "performer", "producer", "initial", "repeated"
      , "parent", "dependencies", "assignee", "predecessors", "requires"
      , "authority", "gate", "decider", "evidence", "decisions", "decision"
      , "collaboration", "work-profile", "governance", "intent", "capabilities"
      , "contracts", "stage", "flow", "prevented-stage", "need", "model", "profile"
      , "conflicts", "grantor", "waived-evidence"
      ]
    referenceVersionErrors =
      [ artifactError ArtifactReferenceVersionMismatch (parsedId value ++ ":" ++ key ++ "=" ++ token)
      | value <- facts
      , (key, rawValue) <- parsedFields value
      , key `elem` referenceFieldNames || isContextReferenceField value key rawValue
      , token <- referenceTokens rawValue
      , token /= "none"
      , not ("@1.0.0" `isSuffixOf` token)
      ]
    isContextReferenceField value key rawValue =
      (parsedContext value == "Collaboration" && key `elem` ["from", "to"])
        || (parsedContext value == "Work Management" && key == "completion" && "join-all(" `isPrefixOf` rawValue)

    acceptanceAuthorityErrors = case findFact "Governance and Assurance" "authority" acceptanceAuthorityId facts of
      Just value
        | factField "decider" value == Just poRef
            && factField "gate" value == Just acceptanceGateRef
            && factField "may-waive" value == Just "true" -> []
      _ -> [artifactError ArtifactAcceptanceAuthorityInvalid acceptanceAuthorityId]

    acceptanceDecisionErrors = case findFact "Governance and Assurance" "decision" acceptanceDecisionId facts of
      Just value
        | factField "decider" value == Just poRef
            && factField "gate" value == Just acceptanceGateRef
            && factField "outcome" value == Just "pass" -> []
      _ -> [artifactError ArtifactAcceptanceDecisionMissing acceptanceDecisionId]

    receiptErrors = case findFact "Governance and Assurance" "receipt" acceptanceReceiptId facts of
      Just value
        | factField "gate" value == Just acceptanceGateRef
            && factField "decision" value == Just (acceptanceDecisionId ++ "@1.0.0")
            && sortedCsvField "evidence-digests" value == sort expectedEvidenceDigests -> []
      _ -> [artifactError ArtifactReceiptIncoherent acceptanceReceiptId]

    joinErrors =
      case (stageState "urn:ai4x:stage:accept", stageState "urn:ai4x:stage:test", stageState "urn:ai4x:stage:review") of
        (Just "complete", Just "complete", Just "complete") -> []
        (Just "complete", _, _) -> [artifactError ArtifactIncompleteJoinAll "accept requires complete test and review evidence"]
        _ -> []
    stageState identifier =
      findFact "Work Management Evidence" "stage-evidence" identifier facts >>= factField "state"

    transitionErrors =
      [ artifactError ArtifactTransitionPolicyInvalid identifier
      | (identifier, fromState, toState, actor, guard) <- expectedTransitions
      , case findFact "Work Management" "transition" identifier facts of
          Just value ->
            factField "from" value /= Just fromState
              || factField "to" value /= Just toState
              || factField "authority" value /= Just actor
              || factField "guard" value /= Just guard
          Nothing -> True
      ]

    requiredWorkFactErrors =
      [ artifactError ArtifactFlowMissing storyFlowId
      | findFact "Work Management" "flow" storyFlowId facts == Nothing
      ]
        ++ [ artifactError ArtifactFailurePathMissing storyFlowId
           | case findFact "Work Management" "failure-path" storyFlowId facts of
               Just value ->
                 factField "prevented-stage" value /= Just "urn:ai4x:stage:accept@1.0.0"
                   || factField "on-required-predecessor-failure" value /= Just "true"
               Nothing -> True
           ]

    escalationErrors = case findFact "Collaboration" "escalation" "urn:ai4x:escalation:review-blocker" facts of
      Just value
        | factField "initial" value == Just techLeadRef
            && factField "repeated" value == Just poRef
            && factField "after-remediation-cycles" value == Just "1" -> []
      _ -> [artifactError ArtifactEscalationMissing "review blocker escalation"]

    waiverShapeErrors = case findFact "Governance and Assurance" "waiver-shape" "urn:ai4x:schema:waiver-v1" facts of
      Just value
        | sortedCsvField "required-fields" value
            == sort ["authority", "expiry-condition", "gate", "grantor", "id", "rationale", "waived-evidence"] -> []
      _ -> [artifactError ArtifactWaiverShapeMissing "waiver-v1"]

    forbiddenLiveStateErrors
      | any ("live-backlog|" `isPrefixOf`) body = [artifactError ArtifactContainsLiveBacklog "Live backlog state is not declaration content"]
      | otherwise = []

artifactHeader :: String
artifactHeader =
  "ai4x-semantic-fixture|1|version=1.0.0|digest=sha256:fixture-positive-v1|derived=true|authoritative=false"

artifactFacts :: Fixture -> [String]
artifactFacts fixture =
  concat
    [ sourceFacts
    , collaborationFacts collaboration
    , workFacts True work
    , concatMap (workFacts False) (fixtureOtherWorkProfiles fixture)
    , governanceFacts governance
    , intentFacts intent
    , capabilityFacts capabilities
    , integrationFacts (fixtureBundle fixture) (fixtureProjectEntry fixture) (fixtureMemory fixture)
    ]
  where
    collaboration = fixtureCollaboration fixture
    work = fixtureWorkManagement fixture
    governance = fixtureGovernance fixture
    intent = fixtureProjectIntent fixture
    capabilities = fixtureCapabilities fixture
    sourceFacts =
      map
        renderSource
        ( [ collaborationSource collaboration
          , workProfileSource work
          , governanceSource governance
          , projectIntentSource intent
          , capabilityCatalogueSource capabilities
          ]
            ++ map workProfileSource (fixtureOtherWorkProfiles fixture)
        )

collaborationFacts :: CollaborationModel -> [String]
collaborationFacts model =
  [fact "Collaboration" "model" (collaborationId model) []]
    ++ [fact "Collaboration" "participant" (participantId participant) [("name", participantName participant)] | participant <- collaborationParticipants model]
    ++ [ fact "Collaboration" "role" (roleId role)
           [("rights", csv (roleRights role)), ("duties", csv (roleDuties role)), ("prohibitions", csv (roleProhibitions role))]
       | role <- collaborationRoles model
       ]
    ++ [ fact "Collaboration" "assignment" (refId (assignmentParticipant assignment)) [("role", renderRef (assignmentRole assignment))]
       | assignment <- collaborationAssignments model
       ]
    ++ [ fact "Collaboration" "delegation" (refId (delegationFrom delegation))
           [("to", renderRef (delegationTo delegation)), ("right", delegationRight delegation), ("accountability-retained", bool (delegationRetainsAccountability delegation))]
       , fact "Collaboration" "handoff" (handoffId handoff)
           [("from", renderRef (handoffSender handoff)), ("to", renderRef (handoffReceiver handoff)), ("payload", csv (handoffPayloadKinds handoff))]
       , fact "Collaboration" "review" (reviewId review)
           [("performer", renderRef (reviewPerformer review)), ("producer", renderRef (reviewSubjectProducer review))]
       , fact "Collaboration" "escalation" (StableId "urn:ai4x:escalation:review-blocker")
           [ ("initial", renderRef (escalationInitialTarget escalation))
           , ("repeated", renderRef (escalationRepeatedTarget escalation))
           , ("after-remediation-cycles", show (escalationAfterRemediationCycles escalation))
           ]
       ]
  where
    delegation = collaborationDelegation model
    handoff = collaborationHandoff model
    review = collaborationReview model
    escalation = collaborationEscalation model

workFacts :: Bool -> WorkProfile -> [String]
workFacts selected profile =
  [ fact "Work Management" "profile" (workProfileId profile) [("selected-explicitly", bool selected)]
  , fact "Work Management" "flow" (workProfileFlowId profile) [("profile", renderRef (Ref (workProfileId profile) (workProfileVersion profile)))]
  ]
    ++ [ fact "Work Management" "item" (workItemId item)
           [ ("kind", renderItemKind (workItemKind item)), ("parent", maybe "none" renderRef (workItemParent item)), ("dependencies", csv (map renderRef (workItemDependencies item)))]
       | item <- workProfileItems profile
       ]
    ++ [ fact "Work Management" "transition" (transitionIdentifier profile transition)
           [ ("from", renderLifecycleState (transitionFrom transition))
           , ("to", renderLifecycleState (transitionTo transition))
           , ("authority", renderRef (transitionAuthority transition))
           , ("guard", maybe "none" renderTransitionGuard (transitionGuard transition))
           ]
       | transition <- workProfileTransitions profile
       ]
    ++ [ fact "Work Management" "stage" (stageId stage)
           [ ("assignee", renderRef (stageAssignee stage))
           , ("predecessors", csv (map renderRef (stagePredecessors stage)))
           , ("completion", renderCompletionPolicy (stageCompletionPolicy stage))
           ]
       | stage <- workProfileStages profile
       ]
    ++ [ fact "Work Management Evidence" "stage-evidence" (refId (stageEvidenceStage value))
           [("stage", renderRef (stageEvidenceStage value)), ("state", renderStageState (stageEvidenceState value)), ("authoritative-declaration", "false")]
       | value <- workProfileStageEvidence profile
       ]
    ++ maybe [] failureFacts (workProfileFailurePath profile)
  where
    failureFacts failure =
      [ fact "Work Management" "failure-path" (refId (failurePathFlow failure))
          [ ("flow", renderRef (failurePathFlow failure))
          , ("prevented-stage", renderRef (failurePathPreventedStage failure))
          , ("on-required-predecessor-failure", bool (failurePathOnRequiredPredecessorFailure failure))
          ]
      ]

transitionIdentifier :: WorkProfile -> Transition -> StableId
transitionIdentifier profile transition =
  StableId
    ( unStableId (workProfileId profile)
        ++ ":transition:"
        ++ renderLifecycleState (transitionFrom transition)
        ++ ":"
        ++ renderLifecycleState (transitionTo transition)
    )

governanceFacts :: GovernanceModel -> [String]
governanceFacts model =
  [fact "Governance and Assurance" "model" (governanceId model) []]
    ++ [ fact "Governance and Assurance" "authority" (authorityId authority)
           [("decider", renderRef (authorityDecider authority)), ("gate", renderRef (authorityGate authority)), ("may-waive", bool (authorityMayWaive authority))]
       | authority <- governanceAuthorities model
       ]
    ++ [fact "Governance and Assurance" "gate" (gateId gate) [("evidence", csv (map renderRef (gateRequiredEvidence gate)))] | gate <- governanceGates model]
    ++ [ fact "Governance and Assurance" "decision" (decisionId decision)
           [("gate", renderRef (decisionGate decision)), ("decider", renderRef (decisionDecider decision)), ("outcome", renderDecisionOutcome (decisionOutcome decision))]
       | decision <- governanceDecisions model
       ]
    ++ [fact "Governance and Assurance" "evidence" (evidenceId value) [("digest", unDigest (evidenceDigest value))] | value <- governanceEvidence model]
    ++ [ fact "Governance and Assurance" "waiver" (waiverId waiver)
           [ ("gate", renderRef (waiverGate waiver)), ("authority", renderRef (waiverAuthority waiver)), ("grantor", renderRef (waiverGrantor waiver))
           , ("rationale", waiverRationale waiver), ("expiry-condition", waiverExpiryCondition waiver), ("waived-evidence", renderRef (waiverEvidenceRequirement waiver))]
       | waiver <- governanceWaivers model
       ]
    ++ [ fact "Governance and Assurance" "waiver-shape" (StableId "urn:ai4x:schema:waiver-v1")
           [("required-fields", csv ["id", "gate", "authority", "grantor", "rationale", "expiry-condition", "waived-evidence"])]
       , fact "Governance and Assurance" "assurance-pack" (assurancePackId pack)
           [("gate", renderRef (assurancePackGate pack)), ("evidence", csv (map renderRef (assurancePackEvidence pack))), ("decisions", csv (map renderRef (assurancePackDecisions pack))), ("replaces-semantic-review", "false")]
       , fact "Governance and Assurance" "receipt" (receiptId receipt)
           [("gate", renderRef (receiptGate receipt)), ("decision", renderRef (receiptDecision receipt)), ("evidence-digests", csv (map unDigest (receiptEvidenceDigests receipt)))]
       ]
  where
    pack = governanceAssurancePack model
    receipt = governanceReceipt model

intentFacts :: ProjectIntent -> [String]
intentFacts intent =
  [fact "Project Intent" "model" (projectIntentId intent) []]
    ++ [fact "Project Intent" "need" (needId value) [("statement", needStatement value)] | value <- projectIntentNeeds intent]
    ++ [fact "Project Intent" "constraint" identifier [("statement", statement)] | (identifier, statement) <- projectIntentConstraints intent]
    ++ [fact "Project Intent" "anti-requirement" identifier [("statement", statement)] | (identifier, statement) <- projectIntentAntiRequirements intent]
    ++ [fact "Project Intent" "cognitive-job" (cognitiveJobId value) [("statement", cognitiveJobStatement value), ("need", renderRef (cognitiveJobSupportsNeed value))] | value <- projectIntentCognitiveJobs intent]

capabilityFacts :: CapabilityCatalogue -> [String]
capabilityFacts catalogue =
  [fact "Curation and Capabilities" "catalogue" (capabilityCatalogueId catalogue) []]
    ++ [ fact "Curation and Capabilities" "capability" (capabilityId capability)
           [ ("kind", capabilityKind capability), ("requires", csv (map renderRef (capabilityRequires capability))), ("conflicts", csv (map renderRef (capabilityConflicts capability)))
           , ("selected", bool (capabilityId capability `elem` map refId (capabilityCatalogueSelected catalogue)))]
       | capability <- capabilityCatalogueCapabilities catalogue
       ]
    ++ [fact "Curation and Capabilities" "need-trace" (needTraceId value) [("need", renderRef (needTraceNeed value)), ("capabilities", csv (map renderRef (needTraceCapabilities value))), ("rationale", needTraceRationale value)] | value <- capabilityCatalogueTraces catalogue]

integrationFacts :: ProjectBundle -> ProjectEntry -> ProjectMemory -> [String]
integrationFacts bundle entry memory =
  [fact "Project Integration" "bundle" (bundleId bundle) [("bundle-version", unVersion (bundleVersion bundle))]]
    ++ [fact "Project Integration" "pin" (refId (pinModel value)) [("context", pinContext value), ("model", renderRef (pinModel value)), ("digest", unDigest (pinDigest value))] | value <- bundlePins bundle]
    ++ [ fact "Project Integration" "entry" (projectEntryId entry)
           [ ("collaboration", renderRef (projectEntryCollaboration entry)), ("work-profile", renderRef (projectEntryWorkProfile entry))
           , ("governance", renderRef (projectEntryGovernance entry)), ("intent", renderRef (projectEntryIntent entry))
           , ("capabilities", renderRef (projectEntryCapabilities entry)), ("authority", renderRef (projectEntryAuthority entry))]
       ]
    ++ [fact "Host Adapter" (hostBindingKind value) (hostBindingIdentifier value) [] | value <- projectEntryHostBindings entry]
    ++ [fact "Project Memory" "contracts-and-pointers-only" (StableId "urn:ai4x:memory:comparison") [("contracts", csv (map renderRef (memoryContractRefs memory))), ("external-pointers", csv (map unStableId (memoryCurrentExternalPointers memory)))] ]

renderSource :: Source -> String
renderSource source =
  intercalate "|"
    ["source", sourceContext source, sourcePath source, "digest=" ++ unDigest (sourceContentDigest source), "digest-kind=fixture-token-not-computed"]

fact :: String -> String -> StableId -> [(String, String)] -> String
fact context kind identifier fields =
  intercalate "|"
    ( ["fact", context, kind, unStableId identifier, "version=1.0.0"]
        ++ [key ++ "=" ++ value | (key, value) <- fields]
        ++ ["source-path=src/R15/Fixture.hs", "source-anchor=" ++ sourceAnchor context]
    )

sourceAnchor :: String -> String
sourceAnchor context = case context of
  "Collaboration" -> "collaboration"
  "Work Management" -> "workManagement"
  "Work Management Evidence" -> "workManagement.operationalEvidence"
  "Governance and Assurance" -> "governance"
  "Project Intent" -> "projectIntent"
  "Curation and Capabilities" -> "capabilities"
  "Project Integration" -> "projectEntry-or-bundle"
  "Project Memory" -> "projectMemory"
  "Host Adapter" -> "projectEntry.hostBindings"
  _ -> "unknown"

parseFact :: String -> Maybe ParsedFact
parseFact row = case splitOn '|' row of
  "fact" : context : kind : identifier : fields ->
    Just (ParsedFact context kind identifier (mapMaybe parseField fields))
  _ -> Nothing

parseField :: String -> Maybe (String, String)
parseField value = case break (== '=') value of
  (key, '=' : fieldValue) -> Just (key, fieldValue)
  _ -> Nothing

factField :: String -> ParsedFact -> Maybe String
factField key value = lookup key (parsedFields value)

findFact :: String -> String -> String -> [ParsedFact] -> Maybe ParsedFact
findFact context kind identifier values = case
  [value | value <- values, parsedContext value == context, parsedKind value == kind, parsedId value == identifier] of
  [value] -> Just value
  _ -> Nothing

sortedCsvField :: String -> ParsedFact -> [String]
sortedCsvField key value = maybe [] (sort . splitCsv) (factField key value)

lookupPart :: String -> [String] -> Maybe String
lookupPart key = lookup key . mapMaybe parseField

referenceTokens :: String -> [String]
referenceTokens value
  | value == "" = []
  | "join-all(" `isPrefixOf` value = splitCsv (initSafe (drop 9 value))
  | otherwise = splitCsv value

initSafe :: String -> String
initSafe [] = []
initSafe value
  | last value == ')' = init value
  | otherwise = value

splitCsv :: String -> [String]
splitCsv "" = []
splitCsv value = splitOn ',' value

splitOn :: Char -> String -> [String]
splitOn delimiter value = case break (== delimiter) value of
  (before, []) -> [before]
  (before, _ : after) -> before : splitOn delimiter after

isSuffixOf :: Eq a => [a] -> [a] -> Bool
isSuffixOf needle haystack = reverse needle `isPrefixOf` reverse haystack

artifactError :: ArtifactErrorKind -> String -> ArtifactError
artifactError = ArtifactError

renderArtifactErrorKind :: ArtifactErrorKind -> String
renderArtifactErrorKind kind = case kind of
  ArtifactHeaderInvalid -> "ARTIFACT_HEADER_INVALID"
  ArtifactNotCanonical -> "ARTIFACT_NOT_CANONICAL"
  ArtifactDuplicateFact -> "ARTIFACT_DUPLICATE_FACT"
  ArtifactSourceMappingMissing -> "ARTIFACT_SOURCE_MAPPING_MISSING"
  ArtifactSourceDigestInvalid -> "ARTIFACT_SOURCE_DIGEST_INVALID"
  ArtifactFactSourceMissing -> "ARTIFACT_FACT_SOURCE_MISSING"
  ArtifactReferenceVersionMismatch -> "ARTIFACT_REFERENCE_VERSION_MISMATCH"
  ArtifactAcceptanceAuthorityInvalid -> "ARTIFACT_ACCEPTANCE_AUTHORITY_INVALID"
  ArtifactAcceptanceDecisionMissing -> "ARTIFACT_ACCEPTANCE_DECISION_MISSING"
  ArtifactReceiptIncoherent -> "ARTIFACT_RECEIPT_INCOHERENT"
  ArtifactIncompleteJoinAll -> "ARTIFACT_INCOMPLETE_JOIN_ALL"
  ArtifactTransitionPolicyInvalid -> "ARTIFACT_TRANSITION_POLICY_INVALID"
  ArtifactFlowMissing -> "ARTIFACT_FLOW_MISSING"
  ArtifactFailurePathMissing -> "ARTIFACT_FAILURE_PATH_MISSING"
  ArtifactEscalationMissing -> "ARTIFACT_ESCALATION_MISSING"
  ArtifactWaiverShapeMissing -> "ARTIFACT_WAIVER_SHAPE_MISSING"
  ArtifactContainsLiveBacklog -> "ARTIFACT_CONTAINS_LIVE_BACKLOG"

renderRef :: Ref -> String
renderRef value = unStableId (refId value) ++ "@" ++ unVersion (refVersion value)

csv :: [String] -> String
csv = intercalate "," . sort

bool :: Bool -> String
bool True = "true"
bool False = "false"

acceptanceAuthorityId, acceptanceDecisionId, acceptanceReceiptId, storyFlowId :: String
acceptanceAuthorityId = "urn:ai4x:authority:acceptance"
acceptanceDecisionId = "urn:ai4x:decision:accept-pass"
acceptanceReceiptId = "urn:ai4x:receipt:acceptance"
storyFlowId = "urn:ai4x:flow:story-delivery"

poRef, techLeadRef, acceptanceGateRef :: String
poRef = "urn:ai4x:participant:po@1.0.0"
techLeadRef = "urn:ai4x:participant:tech-lead@1.0.0"
acceptanceGateRef = "urn:ai4x:gate:acceptance@1.0.0"

expectedEvidenceDigests :: [String]
expectedEvidenceDigests = ["sha256:review-evidence-v1", "sha256:test-evidence-v1"]

expectedTransitions :: [(String, String, String, String, String)]
expectedTransitions =
  [ ("urn:ai4x:work-profile:epic-story:transition:ready:in-progress", "ready", "in-progress", techLeadRef, "none")
  , ("urn:ai4x:work-profile:epic-story:transition:in-progress:in-review", "in-progress", "in-review", techLeadRef, "implementation-evidence-complete")
  , ("urn:ai4x:work-profile:epic-story:transition:in-review:done", "in-review", "done", poRef, "allowed-decision-and-assurance-receipt")
  , ("urn:ai4x:work-profile:epic-story:transition:in-progress:failed", "in-progress", "failed", techLeadRef, "none")
  , ("urn:ai4x:work-profile:epic-story:transition:in-review:failed", "in-review", "failed", techLeadRef, "none")
  ]
