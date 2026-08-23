{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.Fixture
  ( Fixture (..),
    fixture,
    goldenEnvelope,
    goldenManifest,
    goldenSourceMap,
    goldenProvenance,
    goldenGenerationId,
  )
where

import AI4X.Core
  ( Identifier,
    Sha256,
    identifier,
    sha256,
  )
import AI4X.DeclarationProtocol
import Data.ByteString (ByteString)
import Data.Text (Text)

data Fixture = Fixture
  { fixtureSemanticPayload :: ByteString,
    fixtureSourceDigest :: Sha256,
    fixtureIdentity :: GenerationIdentity,
    fixtureSourceMap :: SourceMap,
    fixtureProvenance :: Provenance,
    fixtureManifest :: GenerationManifest,
    fixtureEnvelope :: AcceptedGenerationEnvelope
  }

fixture :: Either String Fixture
fixture = do
  schemaVersion <- checkedIdentifier "schema-1"
  decoderVersion <- checkedIdentifier "decoder-1"
  productVersion <- checkedIdentifier "product-1"
  semanticAlpha <- checkedIdentifier "need/alpha"
  semanticZeta <- checkedIdentifier "need/zeta"
  sourceAlpha <- checkedIdentifier "src/alpha:1"
  sourceZeta <- checkedIdentifier "src/zeta:2"
  sourceArtifact <- checkedIdentifier "declarations/main.dhall"
  mapping <-
    mapLeft show
      ( sourceMap
          [ (semanticZeta, sourceZeta),
            (semanticAlpha, sourceAlpha)
          ]
      )
  sourceProvenance <-
    mapLeft show
      (provenance [(sourceArtifact, sourceDigest)])
  let identity =
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
  Right
    Fixture
      { fixtureSemanticPayload = semanticPayload,
        fixtureSourceDigest = sourceDigest,
        fixtureIdentity = identity,
        fixtureSourceMap = mapping,
        fixtureProvenance = sourceProvenance,
        fixtureManifest = manifest,
        fixtureEnvelope = envelope
      }
  where
    semanticPayload = "semantic-v1"
    sourceDigest = sha256 "source-v1"

checkedIdentifier :: Text -> Either String (Identifier domain)
checkedIdentifier = mapLeft show . identifier

mapLeft :: (left -> mapped) -> Either left right -> Either mapped right
mapLeft transform = either (Left . transform) Right

goldenGenerationId :: Text
goldenGenerationId = "2c05d401a88b8abc871a9512ba0ec8657ea338c47891ee94b29d5db7632e15cd"

goldenSourceMap :: ByteString
goldenSourceMap = "{\"format\":\"ai4x.source-map\",\"version\":\"v1\",\"entries\":[{\"semantic_node\":\"need/alpha\",\"source_node\":\"src/alpha:1\"},{\"semantic_node\":\"need/zeta\",\"source_node\":\"src/zeta:2\"}]}"

goldenProvenance :: ByteString
goldenProvenance = "{\"format\":\"ai4x.provenance\",\"version\":\"v1\",\"entries\":[{\"source_artifact\":\"declarations/main.dhall\",\"sha256\":\"88850a88f6a356b5eb4e4be1fa2ccc95de2733368c80d5756c24b2853280cdd8\"}]}"

goldenManifest :: ByteString
goldenManifest = "{\"format\":\"ai4x.generation-manifest\",\"version\":\"v1\",\"generation_id\":\"2c05d401a88b8abc871a9512ba0ec8657ea338c47891ee94b29d5db7632e15cd\",\"semantic_sha256\":\"0d05f729f928b76c15e31e5097fb25f1f11909706e64d9c582607e5d227166c3\",\"source_sha256\":\"88850a88f6a356b5eb4e4be1fa2ccc95de2733368c80d5756c24b2853280cdd8\",\"schema_version\":\"schema-1\",\"decoder_version\":\"decoder-1\",\"product_version\":\"product-1\",\"source_map_sha256\":\"1efc0a1adae46aadee7ac85fcdccae8cb6b99b7f4694b31b7aabc0e07b71da3a\",\"provenance_sha256\":\"ce12822c031708e848e372cd29180d706429731b1757e0d2c483805bb5ca073d\"}"

goldenEnvelope :: ByteString
goldenEnvelope = "{\"format\":\"ai4x.accepted-generation\",\"version\":\"v1\",\"generation_id\":\"2c05d401a88b8abc871a9512ba0ec8657ea338c47891ee94b29d5db7632e15cd\",\"manifest_sha256\":\"0aa8abced172eb1447f96bf5d41f989e399f6654533ff4cdbb3ec3a9bc0d23cb\"}"
