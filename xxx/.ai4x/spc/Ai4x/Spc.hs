-- | ai4x Specification Prelude.
--
-- Shipped with ai4x. Provides the base types for project need declarations.
-- Projects import this module and define their domain types + needs.
--
-- Validate with: ghc -fno-code -i<path-to-prelude-parent> Needs.hs
module Ai4x.Spc
  ( Job(..)
  , Priority(..)
  , Constraint(..)
  , TeamConstraint(..)
  , Domain(..)
  , Need(..)
  ) where

-- | The cognitive job class a need requires.
data Job
  = Assessment      -- ^ Evaluate, diagnose, review
  | Generation      -- ^ Produce new artifacts
  | Classification  -- ^ Categorize, label, sort
  | Transformation  -- ^ Reshape input into structurally different output
  | Orchestration   -- ^ Coordinate, delegate, sequence
  deriving (Show, Eq)

-- | How critical this need is.
data Priority
  = Required
  | Recommended
  | Optional
  deriving (Show, Eq)

-- | A typed constraint on how a need must be fulfilled.
data Constraint
  = Boundary String   -- ^ Scope or domain boundary
  | Quality  String   -- ^ Quality expectation
  | Temporal String   -- ^ Timing or ordering constraint
  | Resource String   -- ^ Resource or budget constraint
  deriving (Show, Eq)

-- | Team-level constraint (not per-need).
data TeamConstraint
  = MaxSpecialists Int
  | GovernanceRule String
  deriving (Show, Eq)

-- | The problem domain this project operates in.
data Domain = Domain
  { domainName        :: String
  , domainDescription :: String
  , domainBoundaries  :: [String]
  } deriving (Show)

-- | A project need with a phantom type encoding the functional signature.
--
-- The type parameter @a@ carries the transformation signature at the type level:
--
-- @
-- designArch :: Need (Requirements -> Model -> (Architecture, [Decision]))
-- @
--
-- This means: "a need that transforms Requirements and a Model
-- into an Architecture plus Decisions."
data Need a = Need
  { job         :: Job
  , priority    :: Priority
  , constraints :: [Constraint]
  , anti        :: [String]
  } deriving (Show)
