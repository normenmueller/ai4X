{-# LANGUAGE OverloadedStrings #-}

module AI4X.Generation.ProtocolTest (tests) where

import AI4X.Core (identifier, sha256)
import AI4X.DeclarationProtocol
import AI4X.Generation
import AI4X.Generation.Fixture
import Control.Applicative ((<|>))
import Control.Monad (forM_, unless)
import Data.ByteString (ByteString)
import Data.IORef (modifyIORef', newIORef, readIORef)
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Data.Text.Encoding as Text

tests :: IO ()
tests = do
  malformedDocumentsStopAtTheirArtifact
  unsupportedDocumentsStopAtTheirArtifact
  manifestFromAnotherGenerationIsRejected
  everyCrossDocumentDigestIsValidated

malformedDocumentsStopAtTheirArtifact :: IO ()
malformedDocumentsStopAtTheirArtifact =
  withFixture $ \values ->
    withDocumentCases values $ \documents ->
      forM_ documents $ \(position, artifact, kind) -> do
        (result, trace) <- runWithOverrides values [(artifact, "{")]
        assert
          ("malformed document read past position " <> show position)
          (trace == take (position + 1) (expectedTrace values))
        assert
          ("malformed document defect changed at position " <> show position)
          (result == Left (GenerationArtifactRejected artifact (MalformedDocument kind)))

unsupportedDocumentsStopAtTheirArtifact :: IO ()
unsupportedDocumentsStopAtTheirArtifact =
  withFixture $ \values ->
    withDocumentCases values $ \documents ->
      forM_ documents $ \(position, artifact, kind) ->
        case artifactBytes values artifact of
          Nothing -> failTest ("missing fixture document at position " <> show position)
          Just original -> do
            let unsupported = replaceText "\"version\":\"v1\"" "\"version\":\"v2\"" original
            (result, trace) <- runWithOverrides values [(artifact, unsupported)]
            assert
              ("unsupported document read past position " <> show position)
              (trace == take (position + 1) (expectedTrace values))
            assert
              ("unsupported document defect changed at position " <> show position)
              ( result
                  == Left
                    ( GenerationArtifactRejected
                        artifact
                        (UnsupportedDocumentVersion kind "v2")
                    )
              )

manifestFromAnotherGenerationIsRejected :: IO ()
manifestFromAnotherGenerationIsRejected =
  withFixture $ \values -> do
    let identity = generationManifestIdentity (fixtureManifest values)
        differentIdentity = identity {identitySemanticDigest = sha256 "different-semantic"}
        differentManifest = generationManifest differentIdentity (fixtureSourceMap values) (fixtureProvenance values)
        manifestArtifact = GenerationPartArtifact (fixtureGenerationId values) ManifestPart
    (result, trace) <-
      runWithOverrides values [(manifestArtifact, encodeGenerationManifest differentManifest)]
    assert "different manifest did not consume the exact read plan" (trace == expectedTrace values)
    case result of
      Left (AcceptedGenerationRejected selectedId (GenerationIdMismatch expected actual)) -> do
        assert "rejection lost selected Generation ID" (selectedId == fixtureGenerationId values)
        assert "different manifest IDs collapsed" (expected /= actual)
      other -> failTest ("manifest from another Generation was not rejected precisely: " <> show other)

everyCrossDocumentDigestIsValidated :: IO ()
everyCrossDocumentDigestIsValidated =
  withFixture $ \values -> do
    alternateMap <- requireSourceMap
    alternateProvenance <- requireProvenance
    let selectedId = fixtureGenerationId values
        part = GenerationPartArtifact selectedId
        alternateManifest =
          generationManifest
            (generationManifestIdentity (fixtureManifest values))
            alternateMap
            (fixtureProvenance values)
        mutations =
          [ (ManifestDigest, part ManifestPart, encodeGenerationManifest alternateManifest),
            (SemanticDigest, part SemanticPayloadPart, "tampered-semantic"),
            (SourceMapDigest, part SourceMapPart, encodeSourceMap alternateMap),
            (ProvenanceDigest, part ProvenancePart, encodeProvenance alternateProvenance)
          ]
    forM_ mutations $ \(role, artifact, mutatedBytes) -> do
      (result, trace) <- runWithOverrides values [(artifact, mutatedBytes)]
      assert ("digest mismatch changed read trace for " <> show role) (trace == expectedTrace values)
      case result of
        Left (AcceptedGenerationRejected actualId (DigestMismatch actualRole expected actual)) -> do
          assert "digest rejection lost selected Generation ID" (actualId == selectedId)
          assert "wrong digest role was reported" (actualRole == role)
          assert "digest mismatch collapsed expected and actual" (expected /= actual)
        other -> failTest ("digest mismatch was not rejected precisely: " <> show other)

documentCases :: Fixture -> Either String [(Int, GenerationArtifact, DocumentKind)]
documentCases values =
  case expectedTrace values of
    [marker, manifest, _, mapping, provenanceArtifact] ->
      Right
        [ (0, marker, EnvelopeDocument),
          (1, manifest, ManifestDocument),
          (3, mapping, SourceMapDocument),
          (4, provenanceArtifact, ProvenanceDocument)
        ]
    trace -> Left ("invalid fixture trace: " <> show trace)

withDocumentCases ::
  Fixture ->
  ([(Int, GenerationArtifact, DocumentKind)] -> IO ()) ->
  IO ()
withDocumentCases values action =
  case documentCases values of
    Left message -> failTest message
    Right documents -> action documents

runWithOverrides ::
  Fixture ->
  [(GenerationArtifact, ByteString)] ->
  IO (Either GenerationReadDefect AcceptedGeneration, [GenerationArtifact])
runWithOverrides values overrides = do
  observed <- newIORef []
  let store =
        generationStorePort $ \artifact -> do
          modifyIORef' observed (<> [artifact])
          pure
            ( maybe
                ArtifactMissing
                ArtifactFound
                (lookup artifact overrides <|> artifactBytes values artifact)
            )
  result <- readAcceptedGeneration store (fixtureSelection values)
  trace <- readIORef observed
  pure (result, trace)

requireSourceMap :: IO SourceMap
requireSourceMap =
  case (identifier "need/alternate", identifier "src/alternate:1") of
    (Right semanticNode, Right sourceNode) ->
      case sourceMap [(semanticNode, sourceNode)] of
        Left defect -> failTest ("unexpected alternate source-map defect: " <> show defect)
        Right mapping -> pure mapping
    result -> failTest ("unexpected alternate source-map identifiers: " <> show result)

requireProvenance :: IO Provenance
requireProvenance =
  case identifier "declarations/alternate.dhall" of
    Left defect -> failTest ("unexpected alternate provenance identifier: " <> show defect)
    Right artifact ->
      case provenance [(artifact, sha256 "alternate-source")] of
        Left defect -> failTest ("unexpected alternate provenance defect: " <> show defect)
        Right sourceProvenance -> pure sourceProvenance

replaceText :: Text -> Text -> ByteString -> ByteString
replaceText old new = Text.encodeUtf8 . Text.replace old new . Text.decodeUtf8

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
