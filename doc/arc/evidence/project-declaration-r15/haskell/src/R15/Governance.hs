module R15.Governance
  ( Authority (..)
  , Gate (..)
  , DecisionOutcome (..)
  , Decision (..)
  , Evidence (..)
  , Waiver (..)
  , AssurancePack (..)
  , Receipt (..)
  , GovernanceModel (..)
  , validateGovernance
  , validateGovernanceParticipants
  , renderDecisionOutcome
  ) where

import Data.List (sort)
import R15.Common

data Authority = Authority
  { authorityId :: StableId
  , authorityDecider :: Ref
  , authorityGate :: Ref
  , authorityMayWaive :: Bool
  }
  deriving (Eq, Show)

data Gate = Gate
  { gateId :: StableId
  , gateRequiredEvidence :: [Ref]
  }
  deriving (Eq, Show)

data DecisionOutcome = DecisionPass | DecisionBlocked
  deriving (Eq, Ord, Show)

data Decision = Decision
  { decisionId :: StableId
  , decisionGate :: Ref
  , decisionDecider :: Ref
  , decisionOutcome :: DecisionOutcome
  }
  deriving (Eq, Show)

data Evidence = Evidence
  { evidenceId :: StableId
  , evidenceDigest :: Digest
  }
  deriving (Eq, Show)

data Waiver = Waiver
  { waiverId :: StableId
  , waiverGate :: Ref
  , waiverAuthority :: Ref
  , waiverGrantor :: Ref
  , waiverRationale :: String
  , waiverExpiryCondition :: String
  , waiverEvidenceRequirement :: Ref
  }
  deriving (Eq, Show)

data AssurancePack = AssurancePack
  { assurancePackId :: StableId
  , assurancePackGate :: Ref
  , assurancePackEvidence :: [Ref]
  , assurancePackDecisions :: [Ref]
  }
  deriving (Eq, Show)

data Receipt = Receipt
  { receiptId :: StableId
  , receiptGate :: Ref
  , receiptDecision :: Ref
  , receiptEvidenceDigests :: [Digest]
  }
  deriving (Eq, Show)

data GovernanceModel = GovernanceModel
  { governanceId :: StableId
  , governanceVersion :: Version
  , governanceSource :: Source
  , governanceAuthorities :: [Authority]
  , governanceGates :: [Gate]
  , governanceDecisions :: [Decision]
  , governanceEvidence :: [Evidence]
  , governanceWaivers :: [Waiver]
  , governanceAssurancePack :: AssurancePack
  , governanceReceipt :: Receipt
  }
  deriving (Eq, Show)

validateGovernance :: GovernanceModel -> [ValidationError]
validateGovernance model =
  concat
    [ concatMap validateDecision decisions
    , unresolvedErrors
    , packCoherenceErrors
    , receiptCoherenceErrors
    , waiverErrors
    , referenceVersionErrors
    ]
  where
    authorities = governanceAuthorities model
    decisions = governanceDecisions model
    gates = governanceGates model
    evidence = governanceEvidence model
    waivers = governanceWaivers model
    pack = governanceAssurancePack model
    receipt = governanceReceipt model

    validateDecision decision
      | any (permits decision) authorities = []
      | otherwise =
          [invalid UnauthorizedGateDecision "Governance and Assurance" (unStableId (decisionId decision))]
    permits decision authority =
      authorityGate authority == decisionGate decision
        && authorityDecider authority == decisionDecider decision

    unresolvedErrors =
      [ unresolved "Governance and Assurance" field (unStableId (refId ref))
      | (field, ref, known) <-
          [("authority.gate", authorityGate authority, map gateId gates) | authority <- authorities]
            ++ [("decision.gate", decisionGate decision, map gateId gates) | decision <- decisions]
            ++ [("gate.requiredEvidence", ref, map evidenceId evidence) | gate <- gates, ref <- gateRequiredEvidence gate]
            ++ [("assurance.gate", assurancePackGate pack, map gateId gates)]
            ++ [("assurance.evidence", ref, map evidenceId evidence) | ref <- assurancePackEvidence pack]
            ++ [("assurance.decision", ref, map decisionId decisions) | ref <- assurancePackDecisions pack]
            ++ [("receipt.gate", receiptGate receipt, map gateId gates)]
            ++ [("receipt.decision", receiptDecision receipt, map decisionId decisions)]
            ++ [("waiver.gate", waiverGate waiver, map gateId gates) | waiver <- waivers]
            ++ [("waiver.authority", waiverAuthority waiver, map authorityId authorities) | waiver <- waivers]
            ++ [("waiver.evidence", waiverEvidenceRequirement waiver, map evidenceId evidence) | waiver <- waivers]
      , refId ref `notElem` known
      ]

    selectedGateEvidence =
      case [gateRequiredEvidence gate | gate <- gates, gateId gate == refId (assurancePackGate pack)] of
        [required] -> required
        _ -> []
    packCoherenceErrors
      | sort (assurancePackEvidence pack) == sort selectedGateEvidence
          && all ((`elem` map decisionId decisions) . refId) (assurancePackDecisions pack) = []
      | otherwise =
          [invalid AssurancePackIncoherent "Governance and Assurance" "Assurance Pack must bind exactly the gate's evidence and declared decisions"]

    receiptDecisionValue =
      case [decision | decision <- decisions, decisionId decision == refId (receiptDecision receipt)] of
        [decision] -> Just decision
        _ -> Nothing
    requiredEvidenceDigests =
      sort
        [ evidenceDigest evidenceValue
        | required <- selectedGateEvidence
        , evidenceValue <- evidence
        , evidenceId evidenceValue == refId required
        ]
    receiptCoherenceErrors = case receiptDecisionValue of
      Just decision
        | receiptGate receipt == decisionGate decision
            && decisionOutcome decision == DecisionPass
            && sort (receiptEvidenceDigests receipt) == requiredEvidenceDigests -> []
      _ ->
        [invalid ReceiptIncoherent "Governance and Assurance" "Receipt must record an allowed gate decision and exactly the required evidence digests"]

    waiverErrors = concatMap validateWaiver waivers
    validateWaiver waiver
      | null (waiverRationale waiver) || null (waiverExpiryCondition waiver) =
          [invalid AssurancePackIncoherent "Governance and Assurance" "Waiver rationale and expiry condition must be explicit"]
      | not (any (permitsWaiver waiver) authorities) =
          [invalid UnauthorizedGateDecision "Governance and Assurance" (unStableId (waiverId waiver))]
      | otherwise = []
    permitsWaiver waiver authority =
      authorityId authority == refId (waiverAuthority waiver)
        && authorityGate authority == waiverGate waiver
        && authorityDecider authority == waiverGrantor waiver
        && authorityMayWaive authority

    referenceVersionErrors =
      concat
        [ concatMap authorityVersions authorities
        , concatMap gateVersions gates
        , concatMap decisionVersions decisions
        , concatMap waiverVersions waivers
        , validateRefVersion "Governance and Assurance" "assurance.gate" (assurancePackGate pack)
        , concatMap (validateRefVersion "Governance and Assurance" "assurance.evidence") (assurancePackEvidence pack)
        , concatMap (validateRefVersion "Governance and Assurance" "assurance.decision") (assurancePackDecisions pack)
        , validateRefVersion "Governance and Assurance" "receipt.gate" (receiptGate receipt)
        , validateRefVersion "Governance and Assurance" "receipt.decision" (receiptDecision receipt)
        ]
    authorityVersions value =
      validateRefVersion "Governance and Assurance" "authority.decider" (authorityDecider value)
        ++ validateRefVersion "Governance and Assurance" "authority.gate" (authorityGate value)
    gateVersions value = concatMap (validateRefVersion "Governance and Assurance" "gate.requiredEvidence") (gateRequiredEvidence value)
    decisionVersions value =
      validateRefVersion "Governance and Assurance" "decision.gate" (decisionGate value)
        ++ validateRefVersion "Governance and Assurance" "decision.decider" (decisionDecider value)
    waiverVersions value =
      concat
        [ validateRefVersion "Governance and Assurance" "waiver.gate" (waiverGate value)
        , validateRefVersion "Governance and Assurance" "waiver.authority" (waiverAuthority value)
        , validateRefVersion "Governance and Assurance" "waiver.grantor" (waiverGrantor value)
        , validateRefVersion "Governance and Assurance" "waiver.evidence" (waiverEvidenceRequirement value)
        ]

validateGovernanceParticipants :: [StableId] -> GovernanceModel -> [ValidationError]
validateGovernanceParticipants participantIds model =
  concat
    [ [ unresolved "Governance and Assurance" field (unStableId (refId participant))
      | (field, participant) <-
          [("authority.decider", authorityDecider authority) | authority <- governanceAuthorities model]
            ++ [("decision.decider", decisionDecider decision) | decision <- governanceDecisions model]
            ++ [("waiver.grantor", waiverGrantor waiver) | waiver <- governanceWaivers model]
      , refId participant `notElem` participantIds
      ]
    , concatMap (validateRefVersion "Governance and Assurance" "participant")
        ([authorityDecider authority | authority <- governanceAuthorities model]
          ++ [decisionDecider decision | decision <- governanceDecisions model]
          ++ [waiverGrantor waiver | waiver <- governanceWaivers model])
    ]

renderDecisionOutcome :: DecisionOutcome -> String
renderDecisionOutcome outcome = case outcome of
  DecisionPass -> "pass"
  DecisionBlocked -> "blocked"
