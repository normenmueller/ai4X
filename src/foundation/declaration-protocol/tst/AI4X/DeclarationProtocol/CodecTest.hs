{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.CodecTest (tests) where

import AI4X.Core
  ( IdentifierDefect (..),
    Sha256Defect (..),
    identifier,
    sha256Hex,
  )
import AI4X.DeclarationProtocol
import AI4X.DeclarationProtocol.Fixture
import Control.Monad (unless)
import Data.ByteString (ByteString)
import qualified Data.ByteString as ByteString
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Data.Text.Encoding as Text

tests :: IO ()
tests = do
  goldenDocumentsRoundTrip
  canonicalEscapingRoundTrips
  rejectsStructuralDefects
  rejectsValueDefects
  rejectsNonCanonicalDocuments
  rejectsGenerationIdMismatch

goldenDocumentsRoundTrip :: IO ()
goldenDocumentsRoundTrip =
  withFixture $ \values -> do
    assert "source-map golden bytes changed" (encodeSourceMap (fixtureSourceMap values) == goldenSourceMap)
    assert "provenance golden bytes changed" (encodeProvenance (fixtureProvenance values) == goldenProvenance)
    assert "manifest golden bytes changed" (encodeGenerationManifest (fixtureManifest values) == goldenManifest)
    assert "envelope golden bytes changed" (encodeAcceptedGenerationEnvelope (fixtureEnvelope values) == goldenEnvelope)
    assert "source-map golden did not decode" (decodeSourceMap goldenSourceMap == Right (fixtureSourceMap values))
    assert "provenance golden did not decode" (decodeProvenance goldenProvenance == Right (fixtureProvenance values))
    assert "manifest golden did not decode" (decodeGenerationManifest goldenManifest == Right (fixtureManifest values))
    assert "envelope golden did not decode" (decodeAcceptedGenerationEnvelope goldenEnvelope == Right (fixtureEnvelope values))

canonicalEscapingRoundTrips :: IO ()
canonicalEscapingRoundTrips =
  case (identifier "need/\"é\n", identifier "source\\node\t") of
    (Right semanticNode, Right sourceNode) ->
      case sourceMap [(semanticNode, sourceNode)] of
        Left defect -> failTest ("unexpected source-map defect: " <> show defect)
        Right mapping -> do
          let encoded = encodeSourceMap mapping
          assert "canonical encoder did not preserve UTF-8" (Text.encodeUtf8 "é" `ByteString.isInfixOf` encoded)
          assert "canonical encoder did not escape quote" ("\\\"" `ByteString.isInfixOf` encoded)
          assert "canonical encoder did not escape newline" ("\\n" `ByteString.isInfixOf` encoded)
          assert "canonical escaped source map did not round trip" (decodeSourceMap encoded == Right mapping)
    result -> failTest ("unexpected identifier defects: " <> show result)

rejectsStructuralDefects :: IO ()
rejectsStructuralDefects = do
  assert
    "malformed JSON was accepted"
    (decodeSourceMap "{" == Left (MalformedDocument SourceMapDocument))
  assert
    "duplicate field was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"format\":\"ai4x.source-map\",\"version\":\"v1\",\"entries\":[]}"
        == Left (DuplicateField SourceMapDocument "format")
    )
  assert
    "missing field was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"version\":\"v1\"}"
        == Left (MissingField SourceMapDocument "entries")
    )
  assert
    "unknown field was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"version\":\"v1\",\"entries\":[],\"extra\":\"x\"}"
        == Left (UnknownField SourceMapDocument "extra")
    )
  assert
    "unexpected document format was accepted"
    ( decodeSourceMap "{\"format\":\"other\",\"version\":\"v1\",\"entries\":[]}"
        == Left (UnexpectedDocumentFormat SourceMapDocument "other")
    )
  assert
    "unsupported document version was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"version\":\"v2\",\"entries\":[]}"
        == Left (UnsupportedDocumentVersion SourceMapDocument "v2")
    )

rejectsValueDefects :: IO ()
rejectsValueDefects = do
  assert
    "invalid identifier field was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"version\":\"v1\",\"entries\":[{\"semantic_node\":\"\",\"source_node\":\"source\"}]}"
        == Left (InvalidIdentifierField SourceMapDocument "semantic_node" EmptyIdentifier)
    )
  assert
    "invalid digest field was accepted"
    ( decodeProvenance "{\"format\":\"ai4x.provenance\",\"version\":\"v1\",\"entries\":[{\"source_artifact\":\"source\",\"sha256\":\"abc\"}]}"
        == Left (InvalidDigestField ProvenanceDocument "sha256" (InvalidSha256Length 3))
    )
  assert
    "duplicate source-map entry was accepted"
    ( decodeSourceMap "{\"format\":\"ai4x.source-map\",\"version\":\"v1\",\"entries\":[{\"semantic_node\":\"same\",\"source_node\":\"one\"},{\"semantic_node\":\"same\",\"source_node\":\"two\"}]}"
        == Left (DuplicateEntry SourceMapDocument "same")
    )

rejectsNonCanonicalDocuments :: IO ()
rejectsNonCanonicalDocuments = do
  assert
    "leading whitespace was accepted"
    (decodeSourceMap (" " <> goldenSourceMap) == Left (NonCanonicalDocument SourceMapDocument))
  assert
    "reordered fields were accepted"
    ( decodeSourceMap "{\"version\":\"v1\",\"format\":\"ai4x.source-map\",\"entries\":[]}"
        == Left (NonCanonicalDocument SourceMapDocument)
    )
  assert
    "non-canonical slash escape was accepted"
    ( decodeSourceMap (replaceText "need/alpha" "need\\/alpha" goldenSourceMap)
        == Left (NonCanonicalDocument SourceMapDocument)
    )

rejectsGenerationIdMismatch :: IO ()
rejectsGenerationIdMismatch =
  case decodeGenerationManifest (replaceText goldenGenerationId zeroDigest goldenManifest) of
    Left (GenerationIdMismatch expected actual) -> do
      assert "mismatch expected ID changed" (sha256Hex (generationIdDigest expected) == goldenGenerationId)
      assert "mismatch actual ID changed" (sha256Hex (generationIdDigest actual) == zeroDigest)
    result -> failTest ("Generation-ID mismatch was not rejected precisely: " <> show result)

replaceText :: Text -> Text -> ByteString -> ByteString
replaceText old new = Text.encodeUtf8 . Text.replace old new . Text.decodeUtf8

zeroDigest :: Text
zeroDigest = Text.replicate 64 "0"

withFixture :: (Fixture -> IO ()) -> IO ()
withFixture action =
  case fixture of
    Left message -> failTest ("invalid fixture: " <> message)
    Right values -> action values

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
