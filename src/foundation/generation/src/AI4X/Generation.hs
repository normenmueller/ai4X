-- | Fail-closed reading of one explicitly selected accepted Generation.
module AI4X.Generation
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
    GenerationReadDefect (..),
    readAcceptedGeneration,
  )
where

import AI4X.Generation.Internal.Port
import AI4X.Generation.Internal.Reader
