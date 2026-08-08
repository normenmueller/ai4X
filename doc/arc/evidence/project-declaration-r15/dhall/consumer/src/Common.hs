{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE DerivingStrategies #-}
{-# LANGUAGE OverloadedStrings #-}

module Common
  ( Ref (..), Owner (..), EntityKind (..), PublishedEntity (..)
  , ReferencePort (..), Code (..), Diagnostic (..), PublishedSummary (..)
  , validateIndex, validateReferencePorts
  ) where

import Prelude hiding (id)
import Data.Char (isAlphaNum, isControl, isSpace)
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Dhall
import GHC.Generics (Generic)

data Ref = Ref { id :: Text, version :: Text }
  deriving stock (Eq, Ord, Show, Generic)
instance Dhall.FromDhall Ref

data Owner
  = CollaborationOwner
  | WorkManagementOwner
  | GovernanceOwner
  | ProjectIntentOwner
  | CurationOwner
  | CompositionOwner
  deriving stock (Eq, Ord, Show, Generic)
instance Dhall.FromDhall Owner

data EntityKind
  = CollaborationModel | Participant | Role | NormativeRule | RoleAssignment
  | Delegation | Handoff | Review | Escalation
  | WorkManagementModel | WorkProfile | ItemKind | DependencyPolicy
  | LifecycleState | Transition | ProcessFlow | Stage | StageAssignment
  | FailurePath | ProcessGuard | IterationPolicy
  | GovernanceModel | Authority | Gate | Decision | Waiver | Evidence
  | AssurancePack | Receipt
  | ProjectIntentModel | Need | Constraint | AntiRequirement | CognitiveJob
  | CapabilityCatalogue | Capability | NeedCapabilityTrace
  | ProjectBundle | ProjectEntry | HostBinding | ExternalPointer
  deriving stock (Eq, Ord, Show, Generic)
instance Dhall.FromDhall EntityKind

data PublishedEntity = PublishedEntity
  { stableId :: Text
  , semanticVersion :: Text
  , entityKind :: EntityKind
  , owningContext :: Owner
  } deriving stock (Eq, Ord, Show, Generic)
instance Dhall.FromDhall PublishedEntity

data ReferencePort = ReferencePort
  { target :: Ref
  , expectedKind :: EntityKind
  , expectedOwner :: Owner
  , referencePath :: Text
  } deriving stock (Eq, Ord, Show, Generic)
instance Dhall.FromDhall ReferencePort

data Code = InvalidStableUrn | InvalidReferenceVersion | WrongEntityKind
  | UnresolvedReference | DelegationAccountabilityConflict | IllegalTransition
  | IncompleteJoinAll | InvalidIterationPolicy | UnauthorizedGateDecision
  | CapabilityConflict | CapabilityCoverageGap
  deriving stock (Eq, Ord, Show)

data Diagnostic = Diagnostic
  { diagnosticCode :: Code, diagnosticOwner :: Owner, diagnosticPath :: Text }
  deriving stock (Eq, Ord, Show)

newtype PublishedSummary = PublishedSummary { publishedEntities :: [PublishedEntity] }
  deriving stock (Eq, Show)

stableUrn :: Text -> Bool
stableUrn value = case Text.splitOn ":" value of
  "urn" : nid : nss@(_ : _) -> validNid nid && all validPart nss
  _ -> False
  where
    validNid n = not (Text.null n) && Text.all (\c -> isAlphaNum c || c == '-') n
    validPart p = not (Text.null p) && Text.all (\c -> not (isSpace c || isControl c)) p

validateIndex
  :: Owner -> Text -> [PublishedEntity] -> [ReferencePort]
  -> ([Diagnostic], PublishedSummary)
validateIndex owner prefix entities references =
  ( [ Diagnostic InvalidStableUrn owner (prefix <> ".published[" <> tshow i <> "].stableId")
    | (i, entity) <- zip [(0 :: Int)..] entities, not (stableUrn (stableId entity))
    ]
    <> [ Diagnostic InvalidReferenceVersion owner (prefix <> ".published[" <> tshow i <> "].semanticVersion")
       | (i, entity) <- zip [(0 :: Int)..] entities, semanticVersion entity /= "1.0.0"
       ]
    <> [ Diagnostic WrongEntityKind owner (prefix <> ".published[" <> tshow i <> "].owningContext")
       | (i, entity) <- zip [(0 :: Int)..] entities, owningContext entity /= owner
       ]
    <> validateReferencePorts owner entities references
  , PublishedSummary entities
  )

validateReferencePorts :: Owner -> [PublishedEntity] -> [ReferencePort] -> [Diagnostic]
validateReferencePorts diagnosticOwner entities = concatMap validateReference
  where
    validateReference port
      | not (stableUrn (id ref)) = [diagnostic InvalidStableUrn]
      | version ref /= "1.0.0" = [diagnostic InvalidReferenceVersion]
      | null sameId = [diagnostic UnresolvedReference]
      | null sameType = [diagnostic WrongEntityKind]
      | null exact = [diagnostic InvalidReferenceVersion]
      | otherwise = []
      where
        ref = target port
        sameId = filter ((== id ref) . stableId) entities
        sameType = filter (\entity -> owningContext entity == expectedOwner port && entityKind entity == expectedKind port) sameId
        exact = filter ((== version ref) . semanticVersion) sameType
        diagnostic code = Diagnostic code diagnosticOwner (referencePath port)

tshow :: Show a => a -> Text
tshow = Text.pack . show
