module AI4X.Generation.Internal.Port
  ( AcceptedMarker,
    GenerationStoreFailureCode,
    GenerationSelection,
    generationSelection,
    generationSelectionIdentifier,
    GenerationPart (..),
    GenerationArtifact (..),
    GenerationStoreFailure (..),
    ArtifactReadResult (..),
    GenerationStorePort,
    generationStorePort,
    readGenerationArtifact,
  )
where

import AI4X.Core (Identifier)
import AI4X.DeclarationProtocol (GenerationId)
import Data.ByteString (ByteString)
import Data.Text (Text)

-- | Domain tag for an explicitly selected accepted-marker identifier.
data AcceptedMarker

-- | Domain tag for a host adapter's stable read-failure code.
data GenerationStoreFailureCode

-- | One explicit accepted-marker selection.
newtype GenerationSelection = GenerationSelection (Identifier AcceptedMarker)
  deriving stock (Eq, Ord, Show)

-- | Select exactly one accepted marker without interpreting its identifier.
generationSelection :: Identifier AcceptedMarker -> GenerationSelection
generationSelection = GenerationSelection

-- | Return the exact accepted-marker identifier.
generationSelectionIdentifier :: GenerationSelection -> Identifier AcceptedMarker
generationSelectionIdentifier (GenerationSelection selectionIdentifier) = selectionIdentifier

-- | The complete set of parts belonging to one Generation.
data GenerationPart
  = ManifestPart
  | SemanticPayloadPart
  | SourceMapPart
  | ProvenancePart
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | A direct address; no search or enumeration form exists.
data GenerationArtifact
  = AcceptedMarkerArtifact GenerationSelection
  | GenerationPartArtifact GenerationId GenerationPart
  deriving stock (Eq, Ord, Show)

-- | Stable host failure evidence returned by a Generation store adapter.
data GenerationStoreFailure = GenerationStoreFailure
  { generationStoreFailureCode :: Identifier GenerationStoreFailureCode,
    generationStoreFailureDetail :: Text
  }
  deriving stock (Eq, Ord, Show)

-- | Every result a direct artifact read can return.
data ArtifactReadResult
  = ArtifactMissing
  | ArtifactReadFailed GenerationStoreFailure
  | ArtifactFound ByteString
  deriving stock (Eq, Ord, Show)

-- | Host-neutral direct-read capability with no discovery or write operation.
newtype GenerationStorePort = GenerationStorePort (GenerationArtifact -> IO ArtifactReadResult)

-- | Construct a Generation store port from one total direct-read action.
generationStorePort ::
  (GenerationArtifact -> IO ArtifactReadResult) ->
  GenerationStorePort
generationStorePort = GenerationStorePort

-- | Request one exact artifact from the port.
readGenerationArtifact :: GenerationStorePort -> GenerationArtifact -> IO ArtifactReadResult
readGenerationArtifact (GenerationStorePort readArtifact) = readArtifact
