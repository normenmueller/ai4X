{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.Internal.Protocol
  ( DeclarationProtocolVersion (..),
    SchemaVersion,
    DecoderVersion,
    ProductVersion,
    SemanticNode,
    SourceNode,
    SourceArtifact,
    GenerationIdentity (..),
    GenerationId,
    generationId,
    generationIdDigest,
    SourceMap,
    sourceMap,
    sourceMapEntries,
    Provenance,
    provenance,
    provenanceEntries,
    GenerationManifest,
    generationManifest,
    generationManifestIdentity,
    generationManifestGenerationId,
    generationManifestSourceMapDigest,
    generationManifestProvenanceDigest,
    AcceptedGenerationEnvelope,
    acceptedGenerationEnvelope,
    acceptedGenerationEnvelopeVersion,
    acceptedGenerationEnvelopeGenerationId,
    acceptedGenerationEnvelopeManifestDigest,
    AcceptedGeneration,
    validateAcceptedGeneration,
    acceptedGenerationEnvelopeValue,
    acceptedGenerationManifest,
    acceptedGenerationSemanticPayload,
    acceptedGenerationSourceMap,
    acceptedGenerationProvenance,
    encodeAcceptedGenerationEnvelope,
    decodeAcceptedGenerationEnvelope,
    encodeGenerationManifest,
    decodeGenerationManifest,
    encodeSourceMap,
    decodeSourceMap,
    encodeProvenance,
    decodeProvenance,
    DocumentKind (..),
    DigestRole (..),
    DeclarationDefect (..),
  )
where

import AI4X.Core
  ( Identifier,
    IdentifierDefect,
    Sha256,
    Sha256Defect,
    identifier,
    identifierText,
    sha256,
    sha256FromHex,
    sha256Hex,
  )
import AI4X.DeclarationProtocol.Internal.Json
  ( Json (..),
    parseJson,
    renderJson,
  )
import Data.ByteString (ByteString)
import Data.List (find)
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map
import Data.Set (Set)
import qualified Data.Set as Set
import Data.Text (Text)

-- | Versions understood by this package.
data DeclarationProtocolVersion
  = DeclarationProtocolV1
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | Domain tag for a declaration schema version identifier.
data SchemaVersion

-- | Domain tag for a declaration decoder version identifier.
data DecoderVersion

-- | Domain tag for an ai4X product version identifier.
data ProductVersion

-- | Domain tag for a semantic-node identifier.
data SemanticNode

-- | Domain tag for a source-node identifier.
data SourceNode

-- | Domain tag for a logical source-artifact identifier.
data SourceArtifact

-- | The complete, host-neutral input to Generation identity.
data GenerationIdentity = GenerationIdentity
  { identityProtocolVersion :: DeclarationProtocolVersion,
    identitySemanticDigest :: Sha256,
    identitySourceDigest :: Sha256,
    identitySchemaVersion :: Identifier SchemaVersion,
    identityDecoderVersion :: Identifier DecoderVersion,
    identityProductVersion :: Identifier ProductVersion
  }
  deriving stock (Eq, Ord, Show)

-- | The SHA-256 digest of the canonical identity projection.
newtype GenerationId = GenerationId Sha256
  deriving stock (Eq, Ord, Show)

-- | Derive identity from its single canonical, domain-separated projection.
generationId :: GenerationIdentity -> GenerationId
generationId = GenerationId . sha256 . encodeIdentityProjection

-- | Return the exact digest carried by a Generation ID.
generationIdDigest :: GenerationId -> Sha256
generationIdDigest (GenerationId digest) = digest

-- | A deterministic semantic-node to source-node mapping.
newtype SourceMap = SourceMap (Map (Identifier SemanticNode) (Identifier SourceNode))
  deriving stock (Eq, Ord, Show)

-- | Construct an ordered source map, rejecting duplicate semantic nodes.
sourceMap ::
  [(Identifier SemanticNode, Identifier SourceNode)] ->
  Either DeclarationDefect SourceMap
sourceMap entries =
  case firstDuplicate (fmap fst entries) of
    Just duplicate -> Left (DuplicateEntry SourceMapDocument (identifierText duplicate))
    Nothing -> Right (SourceMap (Map.fromList entries))

-- | Return source-map entries in canonical semantic-node order.
sourceMapEntries :: SourceMap -> [(Identifier SemanticNode, Identifier SourceNode)]
sourceMapEntries (SourceMap entries) = Map.toAscList entries

-- | Exact logical source artifacts and their content digests.
newtype Provenance = Provenance (Map (Identifier SourceArtifact) Sha256)
  deriving stock (Eq, Ord, Show)

-- | Construct ordered provenance, rejecting duplicate source artifacts.
provenance ::
  [(Identifier SourceArtifact, Sha256)] ->
  Either DeclarationDefect Provenance
provenance entries =
  case firstDuplicate (fmap fst entries) of
    Just duplicate -> Left (DuplicateEntry ProvenanceDocument (identifierText duplicate))
    Nothing -> Right (Provenance (Map.fromList entries))

-- | Return provenance entries in canonical source-artifact order.
provenanceEntries :: Provenance -> [(Identifier SourceArtifact, Sha256)]
provenanceEntries (Provenance entries) = Map.toAscList entries

-- | Identity plus exact digests of its source map and provenance documents.
data GenerationManifest = GenerationManifest
  GenerationIdentity
  GenerationId
  Sha256
  Sha256
  deriving stock (Eq, Ord, Show)

-- | Derive a manifest and every redundant digest from typed inputs.
generationManifest :: GenerationIdentity -> SourceMap -> Provenance -> GenerationManifest
generationManifest identity mapping sourceProvenance =
  GenerationManifest
    identity
    (generationId identity)
    (sha256 (encodeSourceMap mapping))
    (sha256 (encodeProvenance sourceProvenance))

-- | Return the identity projection bound by a manifest.
generationManifestIdentity :: GenerationManifest -> GenerationIdentity
generationManifestIdentity (GenerationManifest identity _ _ _) = identity

-- | Return the derived Generation ID bound by a manifest.
generationManifestGenerationId :: GenerationManifest -> GenerationId
generationManifestGenerationId (GenerationManifest _ identifierValue _ _) = identifierValue

-- | Return the canonical source-map document digest.
generationManifestSourceMapDigest :: GenerationManifest -> Sha256
generationManifestSourceMapDigest (GenerationManifest _ _ digest _) = digest

-- | Return the canonical provenance document digest.
generationManifestProvenanceDigest :: GenerationManifest -> Sha256
generationManifestProvenanceDigest (GenerationManifest _ _ _ digest) = digest

-- | The accepted marker value selecting one exact manifest.
data AcceptedGenerationEnvelope = AcceptedGenerationEnvelope
  DeclarationProtocolVersion
  GenerationId
  Sha256
  deriving stock (Eq, Ord, Show)

-- | Derive an accepted marker from one exact manifest.
acceptedGenerationEnvelope :: GenerationManifest -> AcceptedGenerationEnvelope
acceptedGenerationEnvelope manifest =
  AcceptedGenerationEnvelope
    (identityProtocolVersion (generationManifestIdentity manifest))
    (generationManifestGenerationId manifest)
    (sha256 (encodeGenerationManifest manifest))

-- | Return the protocol version selected by an envelope.
acceptedGenerationEnvelopeVersion :: AcceptedGenerationEnvelope -> DeclarationProtocolVersion
acceptedGenerationEnvelopeVersion (AcceptedGenerationEnvelope version _ _) = version

-- | Return the Generation ID selected by an envelope.
acceptedGenerationEnvelopeGenerationId :: AcceptedGenerationEnvelope -> GenerationId
acceptedGenerationEnvelopeGenerationId (AcceptedGenerationEnvelope _ identifierValue _) = identifierValue

-- | Return the exact manifest digest selected by an envelope.
acceptedGenerationEnvelopeManifestDigest :: AcceptedGenerationEnvelope -> Sha256
acceptedGenerationEnvelopeManifestDigest (AcceptedGenerationEnvelope _ _ digest) = digest

-- | A fully cross-validated accepted Generation whose semantic bytes remain inert.
data AcceptedGeneration = AcceptedGeneration
  AcceptedGenerationEnvelope
  GenerationManifest
  ByteString
  SourceMap
  Provenance
  deriving stock (Eq, Ord, Show)

-- | Cross-check one envelope, manifest, semantic payload, source map, and provenance.
validateAcceptedGeneration ::
  AcceptedGenerationEnvelope ->
  GenerationManifest ->
  ByteString ->
  SourceMap ->
  Provenance ->
  Either DeclarationDefect AcceptedGeneration
validateAcceptedGeneration envelope manifest semanticPayload mapping sourceProvenance = do
  requireGenerationId
    (generationManifestGenerationId manifest)
    (acceptedGenerationEnvelopeGenerationId envelope)
  requireDigest
    ManifestDigest
    (acceptedGenerationEnvelopeManifestDigest envelope)
    (sha256 (encodeGenerationManifest manifest))
  requireDigest
    SemanticDigest
    (identitySemanticDigest (generationManifestIdentity manifest))
    (sha256 semanticPayload)
  requireDigest
    SourceMapDigest
    (generationManifestSourceMapDigest manifest)
    (sha256 (encodeSourceMap mapping))
  requireDigest
    ProvenanceDigest
    (generationManifestProvenanceDigest manifest)
    (sha256 (encodeProvenance sourceProvenance))
  Right (AcceptedGeneration envelope manifest semanticPayload mapping sourceProvenance)

-- | Return the validated envelope.
acceptedGenerationEnvelopeValue :: AcceptedGeneration -> AcceptedGenerationEnvelope
acceptedGenerationEnvelopeValue (AcceptedGeneration envelope _ _ _ _) = envelope

-- | Return the validated manifest.
acceptedGenerationManifest :: AcceptedGeneration -> GenerationManifest
acceptedGenerationManifest (AcceptedGeneration _ manifest _ _ _) = manifest

-- | Return the exact validated but uninterpreted semantic payload bytes.
acceptedGenerationSemanticPayload :: AcceptedGeneration -> ByteString
acceptedGenerationSemanticPayload (AcceptedGeneration _ _ payload _ _) = payload

-- | Return the validated source map.
acceptedGenerationSourceMap :: AcceptedGeneration -> SourceMap
acceptedGenerationSourceMap (AcceptedGeneration _ _ _ mapping _) = mapping

-- | Return the validated provenance.
acceptedGenerationProvenance :: AcceptedGeneration -> Provenance
acceptedGenerationProvenance (AcceptedGeneration _ _ _ _ sourceProvenance) = sourceProvenance

-- | Protocol documents accepted and produced by the codecs.
data DocumentKind
  = EnvelopeDocument
  | ManifestDocument
  | SourceMapDocument
  | ProvenanceDocument
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | Digest positions checked across an accepted Generation.
data DigestRole
  = ManifestDigest
  | SemanticDigest
  | SourceMapDigest
  | ProvenanceDigest
  deriving stock (Bounded, Enum, Eq, Ord, Show)

-- | Every deterministic rejection exposed by the declaration protocol.
data DeclarationDefect
  = MalformedDocument DocumentKind
  | DuplicateField DocumentKind Text
  | MissingField DocumentKind Text
  | UnknownField DocumentKind Text
  | UnexpectedDocumentFormat DocumentKind Text
  | UnsupportedDocumentVersion DocumentKind Text
  | InvalidIdentifierField DocumentKind Text IdentifierDefect
  | InvalidDigestField DocumentKind Text Sha256Defect
  | NonCanonicalDocument DocumentKind
  | DuplicateEntry DocumentKind Text
  | GenerationIdMismatch GenerationId GenerationId
  | DigestMismatch DigestRole Sha256 Sha256
  deriving stock (Eq, Ord, Show)

-- | Encode an envelope as canonical version-1 JSON bytes.
encodeAcceptedGenerationEnvelope :: AcceptedGenerationEnvelope -> ByteString
encodeAcceptedGenerationEnvelope (AcceptedGenerationEnvelope version identifierValue manifestDigest) =
  renderJson
    ( JsonObject
        [ ("format", JsonString envelopeFormat),
          ("version", JsonString (renderVersion version)),
          ("generation_id", encodeGenerationId identifierValue),
          ("manifest_sha256", encodeDigest manifestDigest)
        ]
    )

-- | Decode only canonical, closed version-1 envelope bytes.
decodeAcceptedGenerationEnvelope :: ByteString -> Either DeclarationDefect AcceptedGenerationEnvelope
decodeAcceptedGenerationEnvelope bytes =
  canonicalDecode EnvelopeDocument encodeAcceptedGenerationEnvelope bytes $ \json -> do
    fields <- exactObject EnvelopeDocument envelopeFields json
    requireFormat EnvelopeDocument envelopeFormat fields
    version <- decodeVersionField EnvelopeDocument fields
    identifierValue <- GenerationId <$> decodeDigestField EnvelopeDocument "generation_id" fields
    manifestDigest <- decodeDigestField EnvelopeDocument "manifest_sha256" fields
    Right (AcceptedGenerationEnvelope version identifierValue manifestDigest)

-- | Encode a manifest as canonical version-1 JSON bytes.
encodeGenerationManifest :: GenerationManifest -> ByteString
encodeGenerationManifest (GenerationManifest identity identifierValue mappingDigest sourceProvenanceDigest) =
  renderJson
    ( JsonObject
        [ ("format", JsonString manifestFormat),
          ("version", JsonString (renderVersion (identityProtocolVersion identity))),
          ("generation_id", encodeGenerationId identifierValue),
          ("semantic_sha256", encodeDigest (identitySemanticDigest identity)),
          ("source_sha256", encodeDigest (identitySourceDigest identity)),
          ("schema_version", encodeIdentifier (identitySchemaVersion identity)),
          ("decoder_version", encodeIdentifier (identityDecoderVersion identity)),
          ("product_version", encodeIdentifier (identityProductVersion identity)),
          ("source_map_sha256", encodeDigest mappingDigest),
          ("provenance_sha256", encodeDigest sourceProvenanceDigest)
        ]
    )

-- | Decode only canonical, internally consistent version-1 manifest bytes.
decodeGenerationManifest :: ByteString -> Either DeclarationDefect GenerationManifest
decodeGenerationManifest bytes =
  canonicalDecode ManifestDocument encodeGenerationManifest bytes $ \json -> do
    fields <- exactObject ManifestDocument manifestFields json
    requireFormat ManifestDocument manifestFormat fields
    identity <- decodeIdentity fields
    actualIdentifier <- GenerationId <$> decodeDigestField ManifestDocument "generation_id" fields
    requireGenerationId (generationId identity) actualIdentifier
    mappingDigest <- decodeDigestField ManifestDocument "source_map_sha256" fields
    sourceProvenanceDigest <- decodeDigestField ManifestDocument "provenance_sha256" fields
    Right
      ( GenerationManifest
          identity
          actualIdentifier
          mappingDigest
          sourceProvenanceDigest
      )

-- | Encode a source map as canonical version-1 JSON bytes.
encodeSourceMap :: SourceMap -> ByteString
encodeSourceMap mapping =
  renderJson
    ( JsonObject
        [ ("format", JsonString sourceMapFormat),
          ("version", JsonString (renderVersion DeclarationProtocolV1)),
          ( "entries",
            JsonArray
              [ JsonObject
                  [ ("semantic_node", encodeIdentifier semanticNode),
                    ("source_node", encodeIdentifier sourceNode)
                  ]
                | (semanticNode, sourceNode) <- sourceMapEntries mapping
              ]
          )
        ]
    )

-- | Decode only canonical, duplicate-free version-1 source-map bytes.
decodeSourceMap :: ByteString -> Either DeclarationDefect SourceMap
decodeSourceMap bytes =
  canonicalDecode SourceMapDocument encodeSourceMap bytes $ \json -> do
    fields <- exactObject SourceMapDocument collectionFields json
    requireFormat SourceMapDocument sourceMapFormat fields
    _ <- decodeVersionField SourceMapDocument fields
    entries <- decodeArrayField SourceMapDocument "entries" fields
    mappingEntries <- traverse decodeSourceMapEntry entries
    sourceMap mappingEntries

-- | Encode provenance as canonical version-1 JSON bytes.
encodeProvenance :: Provenance -> ByteString
encodeProvenance sourceProvenance =
  renderJson
    ( JsonObject
        [ ("format", JsonString provenanceFormat),
          ("version", JsonString (renderVersion DeclarationProtocolV1)),
          ( "entries",
            JsonArray
              [ JsonObject
                  [ ("source_artifact", encodeIdentifier artifact),
                    ("sha256", encodeDigest digest)
                  ]
                | (artifact, digest) <- provenanceEntries sourceProvenance
              ]
          )
        ]
    )

-- | Decode only canonical, duplicate-free version-1 provenance bytes.
decodeProvenance :: ByteString -> Either DeclarationDefect Provenance
decodeProvenance bytes =
  canonicalDecode ProvenanceDocument encodeProvenance bytes $ \json -> do
    fields <- exactObject ProvenanceDocument collectionFields json
    requireFormat ProvenanceDocument provenanceFormat fields
    _ <- decodeVersionField ProvenanceDocument fields
    entries <- decodeArrayField ProvenanceDocument "entries" fields
    provenanceEntriesValue <- traverse decodeProvenanceEntry entries
    provenance provenanceEntriesValue

encodeIdentityProjection :: GenerationIdentity -> ByteString
encodeIdentityProjection identity =
  renderJson
    ( JsonObject
        [ ("format", JsonString identityFormat),
          ("version", JsonString (renderVersion (identityProtocolVersion identity))),
          ("semantic_sha256", encodeDigest (identitySemanticDigest identity)),
          ("source_sha256", encodeDigest (identitySourceDigest identity)),
          ("schema_version", encodeIdentifier (identitySchemaVersion identity)),
          ("decoder_version", encodeIdentifier (identityDecoderVersion identity)),
          ("product_version", encodeIdentifier (identityProductVersion identity))
        ]
    )

decodeIdentity :: [(Text, Json)] -> Either DeclarationDefect GenerationIdentity
decodeIdentity fields =
  GenerationIdentity
    <$> decodeVersionField ManifestDocument fields
    <*> decodeDigestField ManifestDocument "semantic_sha256" fields
    <*> decodeDigestField ManifestDocument "source_sha256" fields
    <*> decodeIdentifierField ManifestDocument "schema_version" fields
    <*> decodeIdentifierField ManifestDocument "decoder_version" fields
    <*> decodeIdentifierField ManifestDocument "product_version" fields

decodeSourceMapEntry :: Json -> Either DeclarationDefect (Identifier SemanticNode, Identifier SourceNode)
decodeSourceMapEntry json = do
  fields <- exactObject SourceMapDocument sourceMapEntryFields json
  semanticNode <- decodeIdentifierField SourceMapDocument "semantic_node" fields
  sourceNode <- decodeIdentifierField SourceMapDocument "source_node" fields
  Right (semanticNode, sourceNode)

decodeProvenanceEntry :: Json -> Either DeclarationDefect (Identifier SourceArtifact, Sha256)
decodeProvenanceEntry json = do
  fields <- exactObject ProvenanceDocument provenanceEntryFields json
  artifact <- decodeIdentifierField ProvenanceDocument "source_artifact" fields
  digest <- decodeDigestField ProvenanceDocument "sha256" fields
  Right (artifact, digest)

canonicalDecode ::
  DocumentKind ->
  (value -> ByteString) ->
  ByteString ->
  (Json -> Either DeclarationDefect value) ->
  Either DeclarationDefect value
canonicalDecode kind encoder bytes decoder = do
  json <- mapLeft (const (MalformedDocument kind)) (parseJson bytes)
  value <- decoder json
  if encoder value == bytes
    then Right value
    else Left (NonCanonicalDocument kind)

exactObject :: DocumentKind -> [Text] -> Json -> Either DeclarationDefect [(Text, Json)]
exactObject kind expected json =
  case json of
    JsonObject fields -> do
      case firstDuplicate (fmap fst fields) of
        Just duplicate -> Left (DuplicateField kind duplicate)
        Nothing -> Right ()
      case find (`notElem` expected) (fmap fst fields) of
        Just unknown -> Left (UnknownField kind unknown)
        Nothing -> Right ()
      case find (`notElem` fmap fst fields) expected of
        Just missing -> Left (MissingField kind missing)
        Nothing -> Right fields
    _ -> Left (MalformedDocument kind)

decodeArrayField :: DocumentKind -> Text -> [(Text, Json)] -> Either DeclarationDefect [Json]
decodeArrayField kind name fields =
  case fieldValue name fields of
    Just (JsonArray values) -> Right values
    _ -> Left (MalformedDocument kind)

decodeTextField :: DocumentKind -> Text -> [(Text, Json)] -> Either DeclarationDefect Text
decodeTextField kind name fields =
  case fieldValue name fields of
    Just (JsonString value) -> Right value
    _ -> Left (MalformedDocument kind)

decodeIdentifierField ::
  DocumentKind ->
  Text ->
  [(Text, Json)] ->
  Either DeclarationDefect (Identifier domain)
decodeIdentifierField kind name fields = do
  value <- decodeTextField kind name fields
  mapLeft (InvalidIdentifierField kind name) (identifier value)

decodeDigestField :: DocumentKind -> Text -> [(Text, Json)] -> Either DeclarationDefect Sha256
decodeDigestField kind name fields = do
  value <- decodeTextField kind name fields
  mapLeft (InvalidDigestField kind name) (sha256FromHex value)

decodeVersionField ::
  DocumentKind ->
  [(Text, Json)] ->
  Either DeclarationDefect DeclarationProtocolVersion
decodeVersionField kind fields = do
  token <- decodeTextField kind "version" fields
  case token of
    "v1" -> Right DeclarationProtocolV1
    _ -> Left (UnsupportedDocumentVersion kind token)

requireFormat :: DocumentKind -> Text -> [(Text, Json)] -> Either DeclarationDefect ()
requireFormat kind expected fields = do
  actual <- decodeTextField kind "format" fields
  if actual == expected
    then Right ()
    else Left (UnexpectedDocumentFormat kind actual)

fieldValue :: Text -> [(Text, Json)] -> Maybe Json
fieldValue = lookup

requireGenerationId :: GenerationId -> GenerationId -> Either DeclarationDefect ()
requireGenerationId expected actual
  | expected == actual = Right ()
  | otherwise = Left (GenerationIdMismatch expected actual)

requireDigest :: DigestRole -> Sha256 -> Sha256 -> Either DeclarationDefect ()
requireDigest role expected actual
  | expected == actual = Right ()
  | otherwise = Left (DigestMismatch role expected actual)

firstDuplicate :: (Ord value) => [value] -> Maybe value
firstDuplicate = go Set.empty
  where
    go :: (Ord value) => Set value -> [value] -> Maybe value
    go _ [] = Nothing
    go seen (value : remainder)
      | value `Set.member` seen = Just value
      | otherwise = go (Set.insert value seen) remainder

encodeGenerationId :: GenerationId -> Json
encodeGenerationId = encodeDigest . generationIdDigest

encodeDigest :: Sha256 -> Json
encodeDigest = JsonString . sha256Hex

encodeIdentifier :: Identifier domain -> Json
encodeIdentifier = JsonString . identifierText

renderVersion :: DeclarationProtocolVersion -> Text
renderVersion DeclarationProtocolV1 = "v1"

mapLeft :: (left -> mapped) -> Either left right -> Either mapped right
mapLeft transform = either (Left . transform) Right

identityFormat, envelopeFormat, manifestFormat, sourceMapFormat, provenanceFormat :: Text
identityFormat = "ai4x.generation-identity"
envelopeFormat = "ai4x.accepted-generation"
manifestFormat = "ai4x.generation-manifest"
sourceMapFormat = "ai4x.source-map"
provenanceFormat = "ai4x.provenance"

envelopeFields, manifestFields, collectionFields, sourceMapEntryFields, provenanceEntryFields :: [Text]
envelopeFields = ["format", "version", "generation_id", "manifest_sha256"]
manifestFields =
  [ "format",
    "version",
    "generation_id",
    "semantic_sha256",
    "source_sha256",
    "schema_version",
    "decoder_version",
    "product_version",
    "source_map_sha256",
    "provenance_sha256"
  ]
collectionFields = ["format", "version", "entries"]
sourceMapEntryFields = ["semantic_node", "source_node"]
provenanceEntryFields = ["source_artifact", "sha256"]
