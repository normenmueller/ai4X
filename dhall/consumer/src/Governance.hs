{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE DuplicateRecordFields #-}
{-# LANGUAGE OverloadedStrings #-}

module Governance (AuthorityView (..), DecisionView (..), Input (..), validate) where

import Prelude hiding (id)
import Common
import qualified Data.Map.Strict as Map
import Data.Text (Text)
import qualified Dhall
import GHC.Generics (Generic)

data AuthorityView = AuthorityView
  { authorityId :: Text, authorityGate :: Ref, decisionMakers :: [Ref] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall AuthorityView
data DecisionView = DecisionView
  { decisionId :: Text, decisionGate :: Ref, authority :: Ref, decidedBy :: Ref }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall DecisionView
data Input = Input { published :: [PublishedEntity], localReferences :: [ReferencePort], authorities :: [AuthorityView], decisions :: [DecisionView] }

validate :: Input -> ([Diagnostic], PublishedSummary)
validate input = (base <> unauthorized, summary)
  where
    (base, summary) = validateIndex GovernanceOwner "governanceAssurance" (published input) (localReferences input)
    known = Map.fromList [(authorityId a, a) | a <- authorities input]
    unauthorized = [Diagnostic UnauthorizedGateDecision GovernanceOwner "governanceAssurance.decisions.decidedBy" | d <- decisions input, not (allowed known d)]
    allowed knownAuthorities d = case Map.lookup (id (authority d)) knownAuthorities of
      Nothing -> False
      Just a -> decisionGate d == authorityGate a && decidedBy d `elem` decisionMakers a
