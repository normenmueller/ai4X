{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.ValidationTest (tests) where

import AI4X.Core (identifier, sha256)
import AI4X.DeclarationProtocol
import AI4X.DeclarationProtocol.Fixture
import Control.Monad (unless)

tests :: IO ()
tests = do
  acceptsOneExactGeneration
  rejectsDifferentGenerationId
  rejectsEveryDigestMismatch

acceptsOneExactGeneration :: IO ()
acceptsOneExactGeneration =
  withFixture $ \values ->
    case
        validateAcceptedGeneration
          (fixtureEnvelope values)
          (fixtureManifest values)
          (fixtureSemanticPayload values)
          (fixtureSourceMap values)
          (fixtureProvenance values)
      of
        Left defect -> failTest ("exact Generation was rejected: " <> show defect)
        Right accepted ->
          assert
            "validated Generation did not retain exact semantic bytes"
            (acceptedGenerationSemanticPayload accepted == fixtureSemanticPayload values)

rejectsDifferentGenerationId :: IO ()
rejectsDifferentGenerationId =
  withFixture $ \values -> do
    let differentIdentity =
          (fixtureIdentity values)
            {identitySemanticDigest = sha256 "different-semantic-payload"}
        differentManifest =
          generationManifest differentIdentity (fixtureSourceMap values) (fixtureProvenance values)
        differentEnvelope = acceptedGenerationEnvelope differentManifest
    case
        validateAcceptedGeneration
          differentEnvelope
          (fixtureManifest values)
          (fixtureSemanticPayload values)
          (fixtureSourceMap values)
          (fixtureProvenance values)
      of
        Left (GenerationIdMismatch expected actual) ->
          assert "different Generation IDs collapsed" (expected /= actual)
        result -> failTest ("different Generation ID was not rejected precisely: " <> show result)

rejectsEveryDigestMismatch :: IO ()
rejectsEveryDigestMismatch =
  withFixture $ \values -> do
    alternateMap <- requireSourceMap
    alternateProvenance <- requireProvenance
    let alternateManifest =
          generationManifest
            (fixtureIdentity values)
            alternateMap
            (fixtureProvenance values)
        alternateEnvelope = acceptedGenerationEnvelope alternateManifest
    assertDigestRole
      ManifestDigest
      ( validateAcceptedGeneration
          alternateEnvelope
          (fixtureManifest values)
          (fixtureSemanticPayload values)
          (fixtureSourceMap values)
          (fixtureProvenance values)
      )
    assertDigestRole
      SemanticDigest
      ( validateAcceptedGeneration
          (fixtureEnvelope values)
          (fixtureManifest values)
          "tampered-semantic-payload"
          (fixtureSourceMap values)
          (fixtureProvenance values)
      )
    assertDigestRole
      SourceMapDigest
      ( validateAcceptedGeneration
          (fixtureEnvelope values)
          (fixtureManifest values)
          (fixtureSemanticPayload values)
          alternateMap
          (fixtureProvenance values)
      )
    assertDigestRole
      ProvenanceDigest
      ( validateAcceptedGeneration
          (fixtureEnvelope values)
          (fixtureManifest values)
          (fixtureSemanticPayload values)
          (fixtureSourceMap values)
          alternateProvenance
      )

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

assertDigestRole :: DigestRole -> Either DeclarationDefect AcceptedGeneration -> IO ()
assertDigestRole expectedRole result =
  case result of
    Left (DigestMismatch actualRole expected actual) -> do
      assert "wrong digest role was reported" (actualRole == expectedRole)
      assert "digest mismatch collapsed expected and actual" (expected /= actual)
    other -> failTest ("digest tamper was not rejected precisely: " <> show other)

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
