{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE OverloadedStrings #-}

module Collaboration (DelegationView (..), Input (..), validate) where

import Prelude hiding (id)
import Common
import qualified Dhall
import GHC.Generics (Generic)

data DelegationView = DelegationView
  { delegator :: Ref, delegatee :: Ref, accountable :: Ref }
  deriving stock (Eq, Show, Generic)
instance Dhall.FromDhall DelegationView

data Input = Input
  { published :: [PublishedEntity], localReferences :: [ReferencePort]
  , delegations :: [DelegationView]
  }

validate :: Input -> ([Diagnostic], PublishedSummary)
validate input =
  ( base
    <> [ Diagnostic DelegationAccountabilityConflict CollaborationOwner "collaboration.delegations.accountable"
       | delegation <- delegations input, accountable delegation /= delegator delegation ]
  , summary
  )
  where (base, summary) = validateIndex CollaborationOwner "collaboration" (published input) (localReferences input)
