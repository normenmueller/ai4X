{-# LANGUAGE OverloadedStrings #-}

module AI4X.Generation.Fixture
  ( Fixture (..),
    fixture,
    expectedTrace,
    artifactBytes,
  )
where

import AI4X.Core
  ( Identifier,
    identifier,
    sha256,
  )
import AI4X.DeclarationProtocol
import AI4X.Generation
import Data.ByteString (ByteString)
import Data.Text (Text)

data Fixture = Fixture
  { fixtureSelection :: GenerationSelection,
    fixtureGenerationId :: GenerationId,
    fixtureEnvelope :: AcceptedGenerationEnvelope,
    fixtureManifest :: GenerationManifest,
    fixtureSemanticPayload :: ByteString,
    fixtureSourceMap :: SourceMap,
    fixtureProvenance :: Provenance,
    fixtureArtifacts :: [(GenerationArtifact, ByteString)]
  }

fixture :: Either String Fixture
fixture = do
  markerIdentifier <- checkedIdentifier "accepted/default"
  schemaVersion <- checkedIdentifier "schema-1"
  decoderVersion <- checkedIdentifier "decoder-1"
  productVersion <- checkedIdentifier "product-1"
  semanticNode <- checkedIdentifier "need/alpha"
  sourceNode <- checkedIdentifier "src/alpha:1"
  sourceArtifact <- checkedIdentifier "declarations/main.dhall"
  mapping <- mapLeft show (sourceMap [(semanticNode, sourceNode)])
  sourceProvenance <- mapLeft show (provenance [(sourceArtifact, sourceDigest)])
  let selection = generationSelection markerIdentifier
      identity =
        GenerationIdentity
          { identityProtocolVersion = DeclarationProtocolV1,
            identitySemanticDigest = sha256 semanticPayload,
            identitySourceDigest = sourceDigest,
            identitySchemaVersion = schemaVersion,
            identityDecoderVersion = decoderVersion,
            identityProductVersion = productVersion
          }
      manifest = generationManifest identity mapping sourceProvenance
      envelope = acceptedGenerationEnvelope manifest
      selectedId = generationManifestGenerationId manifest
      artifacts =
        [ (AcceptedMarkerArtifact selection, encodeAcceptedGenerationEnvelope envelope),
          (GenerationPartArtifact selectedId ManifestPart, encodeGenerationManifest manifest),
          (GenerationPartArtifact selectedId SemanticPayloadPart, semanticPayload),
          (GenerationPartArtifact selectedId SourceMapPart, encodeSourceMap mapping),
          (GenerationPartArtifact selectedId ProvenancePart, encodeProvenance sourceProvenance)
        ]
  Right
    Fixture
      { fixtureSelection = selection,
        fixtureGenerationId = selectedId,
        fixtureEnvelope = envelope,
        fixtureManifest = manifest,
        fixtureSemanticPayload = semanticPayload,
        fixtureSourceMap = mapping,
        fixtureProvenance = sourceProvenance,
        fixtureArtifacts = artifacts
      }
  where
    semanticPayload = "semantic-v1"
    sourceDigest = sha256 "source-v1"

expectedTrace :: Fixture -> [GenerationArtifact]
expectedTrace = fmap fst . fixtureArtifacts

artifactBytes :: Fixture -> GenerationArtifact -> Maybe ByteString
artifactBytes values artifact = lookup artifact (fixtureArtifacts values)

checkedIdentifier :: Text -> Either String (Identifier domain)
checkedIdentifier = mapLeft show . identifier

mapLeft :: (left -> mapped) -> Either left right -> Either mapped right
mapLeft transform = either (Left . transform) Right
