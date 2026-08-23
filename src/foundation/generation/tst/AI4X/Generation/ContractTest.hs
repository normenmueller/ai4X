{-# LANGUAGE OverloadedStrings #-}

module AI4X.Generation.ContractTest (tests) where

import AI4X.Core
  ( Identifier,
    identifier,
    identifierText,
  )
import AI4X.DeclarationProtocol
  ( DeclarationDefect (..),
    DocumentKind (..),
  )
import AI4X.Generation
import AI4X.Generation.Fixture
import Control.Monad (unless)
import Data.Text (Text)

tests :: IO ()
tests = do
  selectionPreservesExactIdentifier
  generationPartsAreClosed
  artifactAddressesAreClosed
  readResultsAreClosed
  readDefectsAreClosed

selectionPreservesExactIdentifier :: IO ()
selectionPreservesExactIdentifier =
  case identifier "  accepted/é  " of
    Left defect -> failTest ("unexpected selection identifier defect: " <> show defect)
    Right markerIdentifier -> do
      let selection = generationSelection markerIdentifier
      assert
        "Generation selection identifier changed"
        (identifierText (generationSelectionIdentifier selection) == "  accepted/é  ")

generationPartsAreClosed :: IO ()
generationPartsAreClosed =
  assert
    "unexpected Generation parts"
    ( [minBound .. maxBound]
        == [ManifestPart, SemanticPayloadPart, SourceMapPart, ProvenancePart]
    )

artifactAddressesAreClosed :: IO ()
artifactAddressesAreClosed =
  withFixture $ \values ->
    assert
      "fixture did not exercise every artifact address shape"
      ( fmap classifyArtifact (expectedTrace values)
          == [MarkerAddress, PartAddress, PartAddress, PartAddress, PartAddress]
      )

readResultsAreClosed :: IO ()
readResultsAreClosed =
  withFixture $ \values -> do
    failureCode <- requireIdentifier "permission-denied"
    let failure = GenerationStoreFailure failureCode "denied by fake"
        results = [ArtifactMissing, ArtifactReadFailed failure, ArtifactFound "bytes"]
    assert
      "read-result constructors changed"
      (fmap classifyResult results == [MissingResult, FailedResult, FoundResult])
    assert "store failure code changed" (generationStoreFailureCode failure == failureCode)
    assert "store failure detail changed" (generationStoreFailureDetail failure == "denied by fake")
    assert "fixture unexpectedly empty" (not (null (expectedTrace values)))

readDefectsAreClosed :: IO ()
readDefectsAreClosed =
  withFixture $ \values -> do
    failureCode <- requireIdentifier "read-failed"
    let marker = AcceptedMarkerArtifact (fixtureSelection values)
        failure = GenerationStoreFailure failureCode "read failed"
        protocolDefect = MalformedDocument EnvelopeDocument
        defects =
          [ GenerationArtifactMissing marker,
            GenerationArtifactReadFailed marker failure,
            GenerationArtifactRejected marker protocolDefect,
            AcceptedGenerationRejected (fixtureGenerationId values) protocolDefect
          ]
    assert
      "read-defect constructors changed"
      ( fmap classifyDefect defects
          == [MissingDefect, ReadFailedDefect, ArtifactRejectedDefect, GenerationRejectedDefect]
      )

data ArtifactClass = MarkerAddress | PartAddress
  deriving stock (Eq, Show)

classifyArtifact :: GenerationArtifact -> ArtifactClass
classifyArtifact (AcceptedMarkerArtifact _) = MarkerAddress
classifyArtifact (GenerationPartArtifact _ _) = PartAddress

data ResultClass = MissingResult | FailedResult | FoundResult
  deriving stock (Eq, Show)

classifyResult :: ArtifactReadResult -> ResultClass
classifyResult ArtifactMissing = MissingResult
classifyResult (ArtifactReadFailed _) = FailedResult
classifyResult (ArtifactFound _) = FoundResult

data DefectClass
  = MissingDefect
  | ReadFailedDefect
  | ArtifactRejectedDefect
  | GenerationRejectedDefect
  deriving stock (Eq, Show)

classifyDefect :: GenerationReadDefect -> DefectClass
classifyDefect (GenerationArtifactMissing _) = MissingDefect
classifyDefect (GenerationArtifactReadFailed _ _) = ReadFailedDefect
classifyDefect (GenerationArtifactRejected _ _) = ArtifactRejectedDefect
classifyDefect (AcceptedGenerationRejected _ _) = GenerationRejectedDefect

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
