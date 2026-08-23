{-# LANGUAGE OverloadedStrings #-}

module AI4X.Generation.FailureTest (tests) where

import AI4X.Core (identifier)
import AI4X.DeclarationProtocol (AcceptedGeneration)
import AI4X.Generation
import AI4X.Generation.Fixture
import Control.Monad (forM_, unless)
import Data.IORef (modifyIORef', newIORef, readIORef)

tests :: IO ()
tests = do
  everyMissingArtifactStopsImmediately
  everyStoreFailureStopsImmediately

everyMissingArtifactStopsImmediately :: IO ()
everyMissingArtifactStopsImmediately =
  withFixture $ \values ->
    forM_ (zip [0 ..] (expectedTrace values)) $ \(position, target) -> do
      (result, trace) <- runInjected values target ArtifactMissing
      assert
        ("missing artifact did not stop at position " <> show position)
        (trace == take (position + 1) (expectedTrace values))
      assert
        ("missing artifact defect changed at position " <> show position)
        (result == Left (GenerationArtifactMissing target))

everyStoreFailureStopsImmediately :: IO ()
everyStoreFailureStopsImmediately =
  withFixture $ \values ->
    case identifier "fake-read-failed" of
      Left defect -> failTest ("unexpected failure-code defect: " <> show defect)
      Right failureCode -> do
        let failure = GenerationStoreFailure failureCode "injected read failure"
        forM_ (zip [0 ..] (expectedTrace values)) $ \(position, target) -> do
          (result, trace) <- runInjected values target (ArtifactReadFailed failure)
          assert
            ("store failure did not stop at position " <> show position)
            (trace == take (position + 1) (expectedTrace values))
          assert
            ("store failure defect changed at position " <> show position)
            (result == Left (GenerationArtifactReadFailed target failure))

runInjected ::
  Fixture ->
  GenerationArtifact ->
  ArtifactReadResult ->
  IO (Either GenerationReadDefect AcceptedGeneration, [GenerationArtifact])
runInjected values target injected = do
  observed <- newIORef []
  let store =
        generationStorePort $ \artifact -> do
          modifyIORef' observed (<> [artifact])
          pure
            ( if artifact == target
                then injected
                else maybe ArtifactMissing ArtifactFound (artifactBytes values artifact)
            )
  result <- readAcceptedGeneration store (fixtureSelection values)
  trace <- readIORef observed
  pure (result, trace)

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
