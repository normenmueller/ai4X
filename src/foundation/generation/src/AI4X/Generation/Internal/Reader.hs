module AI4X.Generation.Internal.Reader
  ( GenerationReadDefect (..),
    readAcceptedGeneration,
  )
where

import AI4X.DeclarationProtocol
  ( AcceptedGeneration,
    DeclarationDefect,
    GenerationId,
    acceptedGenerationEnvelopeGenerationId,
    decodeAcceptedGenerationEnvelope,
    decodeGenerationManifest,
    decodeProvenance,
    decodeSourceMap,
    validateAcceptedGeneration,
  )
import AI4X.Generation.Internal.Port
  ( ArtifactReadResult (..),
    GenerationArtifact (..),
    GenerationPart (..),
    GenerationSelection,
    GenerationStoreFailure,
    GenerationStorePort,
    readGenerationArtifact,
  )
import Data.ByteString (ByteString)

-- | Every fail-closed rejection produced while reading one selection.
data GenerationReadDefect
  = GenerationArtifactMissing GenerationArtifact
  | GenerationArtifactReadFailed GenerationArtifact GenerationStoreFailure
  | GenerationArtifactRejected GenerationArtifact DeclarationDefect
  | AcceptedGenerationRejected GenerationId DeclarationDefect
  deriving stock (Eq, Ord, Show)

-- | Read and validate only the Generation named by one selected marker.
readAcceptedGeneration ::
  GenerationStorePort ->
  GenerationSelection ->
  IO (Either GenerationReadDefect AcceptedGeneration)
readAcceptedGeneration store selection =
  readDecoded store markerAddress decodeAcceptedGenerationEnvelope `bindRead` \envelope ->
    let selectedId = acceptedGenerationEnvelopeGenerationId envelope
        partAddress = GenerationPartArtifact selectedId
     in readDecoded store (partAddress ManifestPart) decodeGenerationManifest `bindRead` \manifest ->
          readRequired store (partAddress SemanticPayloadPart) `bindRead` \semanticPayload ->
            readDecoded store (partAddress SourceMapPart) decodeSourceMap `bindRead` \sourceMap ->
              readDecoded store (partAddress ProvenancePart) decodeProvenance `bindRead` \provenance ->
                pure
                  ( mapLeft
                      (AcceptedGenerationRejected selectedId)
                      (validateAcceptedGeneration envelope manifest semanticPayload sourceMap provenance)
                  )
  where
    markerAddress = AcceptedMarkerArtifact selection

readDecoded ::
  GenerationStorePort ->
  GenerationArtifact ->
  (ByteString -> Either DeclarationDefect value) ->
  IO (Either GenerationReadDefect value)
readDecoded store artifact decoder =
  fmap
    (>>= mapLeft (GenerationArtifactRejected artifact) . decoder)
    (readRequired store artifact)

readRequired ::
  GenerationStorePort ->
  GenerationArtifact ->
  IO (Either GenerationReadDefect ByteString)
readRequired store artifact = do
  result <- readGenerationArtifact store artifact
  pure $ case result of
    ArtifactMissing -> Left (GenerationArtifactMissing artifact)
    ArtifactReadFailed failure -> Left (GenerationArtifactReadFailed artifact failure)
    ArtifactFound bytes -> Right bytes

bindRead ::
  IO (Either defect value) ->
  (value -> IO (Either defect result)) ->
  IO (Either defect result)
bindRead action next = do
  result <- action
  case result of
    Left defect -> pure (Left defect)
    Right value -> next value

mapLeft :: (left -> mapped) -> Either left right -> Either mapped right
mapLeft transform = either (Left . transform) Right
