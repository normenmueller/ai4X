{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE OverloadedStrings #-}

module Curation (CapabilityView (..), TraceView (..), Input (..), validate) where

import Prelude hiding (id)
import Common
import qualified Data.Map.Strict as Map
import qualified Data.Set as Set
import Data.Text (Text)
import qualified Dhall
import GHC.Generics (Generic)

data CapabilityView = CapabilityView
  { capabilityId :: Text, requires :: [Ref], conflicts :: [Ref] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall CapabilityView
data TraceView = TraceView
  { traceId :: Text, need :: Ref, tracedCapabilities :: [Ref] }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall TraceView
data Input = Input
  { published :: [PublishedEntity], localReferences :: [ReferencePort], capabilities :: [CapabilityView]
  , selectedCapabilities :: [Ref], traces :: [TraceView] }

validate :: Input -> ([Diagnostic], PublishedSummary)
validate input = (base <> conflictErrors <> coverageErrors, summary)
  where
    (base, summary) = validateIndex CurationOwner "curationCapabilities" (published input) (localReferences input)
    selected = Set.fromList (map id (selectedCapabilities input))
    known = Map.fromList [(capabilityId c, c) | c <- capabilities input]
    conflictErrors = [Diagnostic CapabilityConflict CurationOwner "curationCapabilities.selectedCapabilities" | selectedId <- Set.toList selected, Just c <- [Map.lookup selectedId known], any ((`Set.member` selected) . id) (conflicts c)]
    coverageErrors =
      [ Diagnostic CapabilityCoverageGap CurationOwner "curationCapabilities.capabilities.requires"
      | selectedId <- Set.toList selected, maybe True (any ((`Set.notMember` selected) . id) . requires) (Map.lookup selectedId known) ]
      <> [ Diagnostic CapabilityCoverageGap CurationOwner "curationCapabilities.traces.capabilities"
         | t <- traces input, null (tracedCapabilities t) || any ((`Set.notMember` selected) . id) (tracedCapabilities t) ]
