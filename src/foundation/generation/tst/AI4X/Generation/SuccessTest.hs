module AI4X.Generation.SuccessTest (tests) where

import AI4X.DeclarationProtocol
  ( GenerationId,
    acceptedGenerationEnvelopeValue,
    acceptedGenerationManifest,
    acceptedGenerationProvenance,
    acceptedGenerationSemanticPayload,
    acceptedGenerationSourceMap,
  )
import AI4X.Generation
import AI4X.Generation.Fixture
import Control.Monad (unless)
import Data.IORef (modifyIORef', newIORef, readIORef)

tests :: IO ()
tests = successfulReadUsesOneExactTrace

successfulReadUsesOneExactTrace :: IO ()
successfulReadUsesOneExactTrace =
  withFixture $ \values -> do
    observed <- newIORef []
    let store =
          generationStorePort $ \artifact -> do
            modifyIORef' observed (<> [artifact])
            pure (maybe ArtifactMissing ArtifactFound (artifactBytes values artifact))
    result <- readAcceptedGeneration store (fixtureSelection values)
    trace <- readIORef observed
    assert "success trace changed" (trace == expectedTrace values)
    assert
      "Generation parts did not use one selected ID"
      (all (usesGenerationId (fixtureGenerationId values)) trace)
    case result of
      Left defect -> failTest ("exact selected Generation was rejected: " <> show defect)
      Right accepted -> do
        assert "accepted envelope changed" (acceptedGenerationEnvelopeValue accepted == fixtureEnvelope values)
        assert "accepted manifest changed" (acceptedGenerationManifest accepted == fixtureManifest values)
        assert "accepted semantic bytes changed" (acceptedGenerationSemanticPayload accepted == fixtureSemanticPayload values)
        assert "accepted source map changed" (acceptedGenerationSourceMap accepted == fixtureSourceMap values)
        assert "accepted provenance changed" (acceptedGenerationProvenance accepted == fixtureProvenance values)

usesGenerationId :: GenerationId -> GenerationArtifact -> Bool
usesGenerationId _ (AcceptedMarkerArtifact _) = True
usesGenerationId expectedId (GenerationPartArtifact actualId _) = actualId == expectedId

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
