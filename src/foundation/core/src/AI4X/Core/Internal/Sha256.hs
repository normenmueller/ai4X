module AI4X.Core.Internal.Sha256
  ( Sha256,
    Sha256Defect (..),
    sha256FromHex,
    sha256Hex,
  )
where

import Data.ByteString (ByteString)
import qualified Data.ByteString as ByteString
import Data.Char (ord)
import Data.Text (Text)
import qualified Data.Text as Text
import Data.Word (Word8)

-- | A SHA-256 digest stored as its 32 canonical bytes.
newtype Sha256 = Sha256 ByteString
  deriving stock (Eq, Ord, Show)

-- | The complete set of reasons a SHA-256 representation can be rejected.
data Sha256Defect
  -- | A SHA-256 digest must contain exactly 64 hexadecimal characters.
  = InvalidSha256Length Int
  -- | The character at the zero-based position is not canonical lowercase hex.
  | NonCanonicalSha256Character Int Char
  deriving stock (Eq, Ord, Show)

-- | Parse exactly 64 lowercase hexadecimal characters into a digest.
sha256FromHex :: Text -> Either Sha256Defect Sha256
sha256FromHex input
  | actualLength /= canonicalLength = Left (InvalidSha256Length actualLength)
  | Just (position, character) <- firstNonCanonical input =
      Left (NonCanonicalSha256Character position character)
  | Just bytes <- decodeHex input = Right (Sha256 bytes)
  | otherwise = Left (InvalidSha256Length actualLength)
  where
    actualLength = Text.length input

-- | Render a digest as exactly 64 lowercase hexadecimal characters.
sha256Hex :: Sha256 -> Text
sha256Hex (Sha256 bytes) = Text.pack (ByteString.foldr renderByte [] bytes)

canonicalLength :: Int
canonicalLength = 64

firstNonCanonical :: Text -> Maybe (Int, Char)
firstNonCanonical input = do
  position <- Text.findIndex (not . isCanonicalHex) input
  (character, _) <- Text.uncons (Text.drop position input)
  pure (position, character)

isCanonicalHex :: Char -> Bool
isCanonicalHex character =
  ('0' <= character && character <= '9')
    || ('a' <= character && character <= 'f')

decodeHex :: Text -> Maybe ByteString
decodeHex = fmap ByteString.pack . decodePairs . Text.unpack

decodePairs :: [Char] -> Maybe [Word8]
decodePairs [] = Just []
decodePairs (high : low : remainder) = do
  highNibble <- hexNibble high
  lowNibble <- hexNibble low
  rest <- decodePairs remainder
  pure ((highNibble * 16 + lowNibble) : rest)
decodePairs [_] = Nothing

hexNibble :: Char -> Maybe Word8
hexNibble character
  | '0' <= character && character <= '9' = Just (fromIntegral (ord character - ord '0'))
  | 'a' <= character && character <= 'f' = Just (fromIntegral (ord character - ord 'a' + 10))
  | otherwise = Nothing

renderByte :: Word8 -> String -> String
renderByte byte remainder =
  hexCharacter (byte `div` 16) : hexCharacter (byte `mod` 16) : remainder

hexCharacter :: Word8 -> Char
hexCharacter nibble
  | nibble < 10 = toEnum (fromIntegral nibble + ord '0')
  | otherwise = toEnum (fromIntegral nibble - 10 + ord 'a')
