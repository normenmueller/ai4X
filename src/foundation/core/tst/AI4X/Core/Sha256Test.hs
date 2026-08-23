{-# LANGUAGE OverloadedStrings #-}

module AI4X.Core.Sha256Test (tests) where

import AI4X.Core
  ( Sha256Defect (..),
    sha256,
    sha256FromHex,
    sha256Hex,
  )
import Control.Monad (unless)
import qualified Data.ByteString.Char8 as ByteString
import qualified Data.Text as Text

canonicalDigest :: String
canonicalDigest = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

tests :: IO ()
tests = do
  computesKnownDigest
  canonicalRoundTrip
  deterministicEqualityAndOrdering
  rejectsInvalidLength
  rejectsNonCanonicalCharacter

computesKnownDigest :: IO ()
computesKnownDigest =
  assert
    "SHA-256 computation did not match the known abc vector"
    ( sha256Hex (sha256 (ByteString.pack "abc"))
        == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    )

canonicalRoundTrip :: IO ()
canonicalRoundTrip =
  case sha256FromHex "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" of
    Left defect -> failTest ("unexpected SHA-256 defect: " <> show defect)
    Right digest -> assert "SHA-256 rendering is not canonical" (Text.unpack (sha256Hex digest) == canonicalDigest)

deterministicEqualityAndOrdering :: IO ()
deterministicEqualityAndOrdering =
  case (sha256FromHex zeroDigest, sha256FromHex oneDigest) of
    (Right zero, Right one) -> do
      assert "SHA-256 equality is not deterministic" (zero == zero)
      assert "SHA-256 ordering is not bytewise" (zero < one)
    result -> failTest ("unexpected SHA-256 defects: " <> show result)
  where
    zeroDigest = "0000000000000000000000000000000000000000000000000000000000000000"
    oneDigest = "0000000000000000000000000000000000000000000000000000000000000001"

rejectsInvalidLength :: IO ()
rejectsInvalidLength =
  assert
    "invalid SHA-256 length was accepted"
    (sha256FromHex "abc" == Left (InvalidSha256Length 3))

rejectsNonCanonicalCharacter :: IO ()
rejectsNonCanonicalCharacter =
  assert
    "non-canonical SHA-256 character was accepted"
    ( sha256FromHex "012G456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        == Left (NonCanonicalSha256Character 3 'G')
    )

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
