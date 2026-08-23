{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.ContractTest (tests) where

import AI4X.Core
  ( Identifier,
    identifier,
    identifierText,
    sha256,
    sha256Hex,
  )
import AI4X.DeclarationProtocol
import AI4X.DeclarationProtocol.Fixture
import Control.Monad (unless)
import Data.Text (Text)
import System.Environment (lookupEnv, setEnv, unsetEnv)

tests :: IO ()
tests = do
  closedEnumerationsAreExhaustive
  generationIdentityIsStableAndSensitive
  generationIdentityIgnoresHostEnvironment
  sourceMapIsOrderedAndUnique
  provenanceIsOrderedAndUnique
  derivedAggregatesExposeExactComponents

closedEnumerationsAreExhaustive :: IO ()
closedEnumerationsAreExhaustive = do
  assert "unexpected declaration protocol versions" ([minBound .. maxBound] == [DeclarationProtocolV1])
  assert
    "unexpected document kinds"
    ( [minBound .. maxBound]
        == [EnvelopeDocument, ManifestDocument, SourceMapDocument, ProvenanceDocument]
    )
  assert
    "unexpected digest roles"
    ( [minBound .. maxBound]
        == [ManifestDigest, SemanticDigest, SourceMapDigest, ProvenanceDigest]
    )

generationIdentityIsStableAndSensitive :: IO ()
generationIdentityIsStableAndSensitive =
  withFixture $ \values -> do
    schemaVersion <- requireIdentifier "schema-2"
    decoderVersion <- requireIdentifier "decoder-2"
    productVersion <- requireIdentifier "product-2"
    let identity = fixtureIdentity values
        identifierValue = generationId identity
        variants =
          [ identity {identitySemanticDigest = sha256 "semantic-v2"},
            identity {identitySourceDigest = sha256 "source-v2"},
            identity {identitySchemaVersion = schemaVersion},
            identity {identityDecoderVersion = decoderVersion},
            identity {identityProductVersion = productVersion}
          ]
    assert
      "Generation ID did not match the golden identity vector"
      (sha256Hex (generationIdDigest identifierValue) == goldenGenerationId)
    assert "Generation ID was not deterministic" (generationId identity == identifierValue)
    assert
      "a variable identity component did not affect Generation ID"
      (all ((/= identifierValue) . generationId) variants)

generationIdentityIgnoresHostEnvironment :: IO ()
generationIdentityIgnoresHostEnvironment =
  withFixture $ \values -> do
    let variableName = "AI4X_DECLARATION_PROTOCOL_TEST_HOST"
        before = generationId (fixtureIdentity values)
    original <- lookupEnv variableName
    setEnv variableName "host-local-value"
    let after = generationId (fixtureIdentity values)
    maybe (unsetEnv variableName) (setEnv variableName) original
    assert "host environment leaked into Generation ID" (after == before)

sourceMapIsOrderedAndUnique :: IO ()
sourceMapIsOrderedAndUnique = do
  alpha <- requireIdentifier "alpha"
  zeta <- requireIdentifier "zeta"
  sourceAlpha <- requireIdentifier "source-alpha"
  sourceZeta <- requireIdentifier "source-zeta"
  case sourceMap [(zeta, sourceZeta), (alpha, sourceAlpha)] of
    Left defect -> failTest ("unexpected source-map defect: " <> show defect)
    Right mapping ->
      assert
        "source-map entries were not normalized by semantic identifier"
        (fmap (identifierText . fst) (sourceMapEntries mapping) == ["alpha", "zeta"])
  assert
    "duplicate semantic node was accepted"
    ( sourceMap [(alpha, sourceAlpha), (alpha, sourceZeta)]
        == Left (DuplicateEntry SourceMapDocument "alpha")
    )

provenanceIsOrderedAndUnique :: IO ()
provenanceIsOrderedAndUnique = do
  alpha <- requireIdentifier "alpha"
  zeta <- requireIdentifier "zeta"
  let alphaDigest = sha256 "alpha"
      zetaDigest = sha256 "zeta"
  case provenance [(zeta, zetaDigest), (alpha, alphaDigest)] of
    Left defect -> failTest ("unexpected provenance defect: " <> show defect)
    Right sourceProvenance ->
      assert
        "provenance entries were not normalized by artifact identifier"
        (fmap (identifierText . fst) (provenanceEntries sourceProvenance) == ["alpha", "zeta"])
  assert
    "duplicate source artifact was accepted"
    ( provenance [(alpha, alphaDigest), (alpha, zetaDigest)]
        == Left (DuplicateEntry ProvenanceDocument "alpha")
    )

derivedAggregatesExposeExactComponents :: IO ()
derivedAggregatesExposeExactComponents =
  withFixture $ \values -> do
    let identity = fixtureIdentity values
        mapping = fixtureSourceMap values
        sourceProvenance = fixtureProvenance values
        manifest = fixtureManifest values
        envelope = fixtureEnvelope values
    assert "manifest identity changed" (generationManifestIdentity manifest == identity)
    assert "manifest Generation ID was not derived" (generationManifestGenerationId manifest == generationId identity)
    assert "envelope version changed" (acceptedGenerationEnvelopeVersion envelope == DeclarationProtocolV1)
    assert
      "envelope Generation ID was not derived"
      (acceptedGenerationEnvelopeGenerationId envelope == generationManifestGenerationId manifest)
    case validateAcceptedGeneration envelope manifest (fixtureSemanticPayload values) mapping sourceProvenance of
      Left defect -> failTest ("unexpected accepted-generation defect: " <> show defect)
      Right accepted -> do
        assert "accepted envelope changed" (acceptedGenerationEnvelopeValue accepted == envelope)
        assert "accepted manifest changed" (acceptedGenerationManifest accepted == manifest)
        assert "accepted semantic payload changed" (acceptedGenerationSemanticPayload accepted == fixtureSemanticPayload values)
        assert "accepted source map changed" (acceptedGenerationSourceMap accepted == mapping)
        assert "accepted provenance changed" (acceptedGenerationProvenance accepted == sourceProvenance)

requireIdentifier :: Text -> IO (Identifier domain)
requireIdentifier raw =
  case identifier raw of
    Left defect -> failTest ("unexpected identifier defect: " <> show defect)
    Right value -> pure value

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
