module R15.Common
  ( StableId (..)
  , Version (..)
  , Digest (..)
  , Ref (..)
  , Source (..)
  , ErrorKind (..)
  , ValidationError (..)
  , mkRef
  , fixtureVersion
  , fixtureDigest
  , sourceDigest
  , unresolved
  , invalid
  , renderErrorKind
  , validateRefVersion
  ) where

newtype StableId = StableId { unStableId :: String }
  deriving (Eq, Ord, Show)

newtype Version = Version { unVersion :: String }
  deriving (Eq, Ord, Show)

newtype Digest = Digest { unDigest :: String }
  deriving (Eq, Ord, Show)

data Ref = Ref
  { refId :: StableId
  , refVersion :: Version
  }
  deriving (Eq, Ord, Show)

data Source = Source
  { sourceContext :: String
  , sourcePath :: FilePath
  , sourceContentDigest :: Digest
  }
  deriving (Eq, Ord, Show)

data ErrorKind
  = UnresolvedReference
  | ReferenceVersionMismatch
  | DelegationAccountabilityConflict
  | SelfReviewProhibited
  | StoryParentRequired
  | SubIssueParentRequired
  | IllegalTransition
  | UnauthorizedTransitionActor
  | TransitionGuardMismatch
  | DependencyCycle
  | DuplicateStageId
  | IncompleteJoinAll
  | UnauthorizedGateDecision
  | AssurancePackIncoherent
  | ReceiptIncoherent
  | CapabilityConflict
  | CapabilityCoverageGap
  | PinMismatch
  | ProjectSelectionMismatch
  deriving (Eq, Ord, Show)

data ValidationError = ValidationError
  { validationErrorKind :: ErrorKind
  , errorOwner :: String
  , errorDetail :: String
  }
  deriving (Eq, Ord, Show)

fixtureVersion :: Version
fixtureVersion = Version "1.0.0"

fixtureDigest :: Digest
fixtureDigest = Digest "sha256:fixture-positive-v1"

sourceDigest :: Digest
sourceDigest = Digest "sha256:source-fixture-v1"

mkRef :: String -> Ref
mkRef value = Ref (StableId value) fixtureVersion

unresolved :: String -> String -> String -> ValidationError
unresolved owner field value =
  ValidationError
    UnresolvedReference
    owner
    (field ++ " references unknown ID " ++ value)

invalid :: ErrorKind -> String -> String -> ValidationError
invalid kind owner detail = ValidationError kind owner detail

renderErrorKind :: ErrorKind -> String
renderErrorKind kind = case kind of
  UnresolvedReference -> "UNRESOLVED_REFERENCE"
  ReferenceVersionMismatch -> "REFERENCE_VERSION_MISMATCH"
  DelegationAccountabilityConflict -> "DELEGATION_ACCOUNTABILITY_CONFLICT"
  SelfReviewProhibited -> "SELF_REVIEW_PROHIBITED"
  StoryParentRequired -> "STORY_PARENT_REQUIRED"
  SubIssueParentRequired -> "SUBISSUE_PARENT_REQUIRED"
  IllegalTransition -> "ILLEGAL_TRANSITION"
  UnauthorizedTransitionActor -> "UNAUTHORIZED_TRANSITION_ACTOR"
  TransitionGuardMismatch -> "TRANSITION_GUARD_MISMATCH"
  DependencyCycle -> "DEPENDENCY_CYCLE"
  DuplicateStageId -> "DUPLICATE_STAGE_ID"
  IncompleteJoinAll -> "INCOMPLETE_JOIN_ALL"
  UnauthorizedGateDecision -> "UNAUTHORIZED_GATE_DECISION"
  AssurancePackIncoherent -> "ASSURANCE_PACK_INCOHERENT"
  ReceiptIncoherent -> "RECEIPT_INCOHERENT"
  CapabilityConflict -> "CAPABILITY_CONFLICT"
  CapabilityCoverageGap -> "CAPABILITY_COVERAGE_GAP"
  PinMismatch -> "PIN_MISMATCH"
  ProjectSelectionMismatch -> "PROJECT_SELECTION_MISMATCH"

validateRefVersion :: String -> String -> Ref -> [ValidationError]
validateRefVersion owner field value
  | refVersion value == fixtureVersion = []
  | otherwise =
      [ invalid
          ReferenceVersionMismatch
          owner
          (field ++ " uses " ++ unVersion (refVersion value) ++ ", expected " ++ unVersion fixtureVersion)
      ]
