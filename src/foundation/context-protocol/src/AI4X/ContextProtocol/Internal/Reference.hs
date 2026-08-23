{-# LANGUAGE OverloadedStrings #-}

module AI4X.ContextProtocol.Internal.Reference
  ( ContextProtocolVersion (..),
    OwnerTag (..),
    EntityTag (..),
    ContextReference,
    ContextDefect (..),
    contextReference,
    contextReferenceVersion,
    contextReferenceOwner,
    contextReferenceEntity,
    contextReferenceIdentifier,
    parseContextReference,
    renderContextReference,
  )
where

import AI4X.Core
  ( Identifier,
    IdentifierDefect,
    identifier,
    identifierText,
  )
import Data.Text (Text)
import qualified Data.Text as Text

-- | Versions understood by this package.
data ContextProtocolVersion
  = ContextProtocolV1
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | Systems that can own a referenced entity.
data OwnerTag
  = WorkSystemOwner
  | RecordStoreOwner
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | Entity kinds addressable by this protocol.
data EntityTag
  = WorkItemEntity
  | ContextRecordEntity
  deriving stock (Bounded, Enum, Eq, Ord, Show)

data ContextReferenceIdentity

-- | An opaque reference whose owner and entity tags form a valid pair.
data ContextReference = ContextReference
  ContextProtocolVersion
  OwnerTag
  EntityTag
  (Identifier ContextReferenceIdentity)
  deriving stock (Eq, Ord, Show)

-- | Every deterministic rejection produced by context reference construction.
data ContextDefect
  = MalformedContextReference Text
  | UnsupportedContextProtocolVersion Text
  | UnknownOwnerTag Text
  | UnknownEntityTag Text
  | InvalidOwnerEntityCombination OwnerTag EntityTag
  | InvalidContextReferenceIdentifier IdentifierDefect
  | ContextReferenceIdentifierContainsSeparator
  deriving stock (Eq, Ord, Show)

-- | Construct a reference when its tags and identifier satisfy the protocol.
contextReference ::
  ContextProtocolVersion ->
  OwnerTag ->
  EntityTag ->
  Text ->
  Either ContextDefect ContextReference
contextReference version owner entity rawIdentifier
  | not (validOwnerEntity owner entity) =
      Left (InvalidOwnerEntityCombination owner entity)
  | Text.any (== '/') rawIdentifier =
      Left ContextReferenceIdentifierContainsSeparator
  | otherwise =
      ContextReference version owner entity
        <$> mapLeft InvalidContextReferenceIdentifier (identifier rawIdentifier)

-- | Return the version embedded in a reference.
contextReferenceVersion :: ContextReference -> ContextProtocolVersion
contextReferenceVersion (ContextReference version _ _ _) = version

-- | Return the owner tag embedded in a reference.
contextReferenceOwner :: ContextReference -> OwnerTag
contextReferenceOwner (ContextReference _ owner _ _) = owner

-- | Return the entity tag embedded in a reference.
contextReferenceEntity :: ContextReference -> EntityTag
contextReferenceEntity (ContextReference _ _ entity _) = entity

-- | Return the exact identifier embedded in a reference.
contextReferenceIdentifier :: ContextReference -> Text
contextReferenceIdentifier (ContextReference _ _ _ value) = identifierText value

-- | Parse only the canonical reference representation understood by this package.
parseContextReference :: Text -> Either ContextDefect ContextReference
parseContextReference input =
  case Text.splitOn "/" input of
    ["ai4x-context", versionToken, ownerToken, entityToken, identifierToken] -> do
      version <- parseVersion versionToken
      owner <- parseOwner ownerToken
      entity <- parseEntity entityToken
      contextReference version owner entity identifierToken
    _ -> Left (MalformedContextReference input)

-- | Render a reference in its single canonical representation.
renderContextReference :: ContextReference -> Text
renderContextReference (ContextReference version owner entity value) =
  Text.intercalate
    "/"
    [ "ai4x-context",
      renderVersion version,
      renderOwner owner,
      renderEntity entity,
      identifierText value
    ]

validOwnerEntity :: OwnerTag -> EntityTag -> Bool
validOwnerEntity WorkSystemOwner WorkItemEntity = True
validOwnerEntity RecordStoreOwner ContextRecordEntity = True
validOwnerEntity WorkSystemOwner ContextRecordEntity = False
validOwnerEntity RecordStoreOwner WorkItemEntity = False

parseVersion :: Text -> Either ContextDefect ContextProtocolVersion
parseVersion "v1" = Right ContextProtocolV1
parseVersion token = Left (UnsupportedContextProtocolVersion token)

renderVersion :: ContextProtocolVersion -> Text
renderVersion ContextProtocolV1 = "v1"

parseOwner :: Text -> Either ContextDefect OwnerTag
parseOwner "work-system" = Right WorkSystemOwner
parseOwner "record-store" = Right RecordStoreOwner
parseOwner token = Left (UnknownOwnerTag token)

renderOwner :: OwnerTag -> Text
renderOwner WorkSystemOwner = "work-system"
renderOwner RecordStoreOwner = "record-store"

parseEntity :: Text -> Either ContextDefect EntityTag
parseEntity "work-item" = Right WorkItemEntity
parseEntity "context-record" = Right ContextRecordEntity
parseEntity token = Left (UnknownEntityTag token)

renderEntity :: EntityTag -> Text
renderEntity WorkItemEntity = "work-item"
renderEntity ContextRecordEntity = "context-record"

mapLeft :: (left -> mapped) -> Either left right -> Either mapped right
mapLeft transform = either (Left . transform) Right
