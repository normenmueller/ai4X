{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedStrings #-}

module AI4X.DeclarationProtocol.Internal.Json
  ( Json (..),
    parseJson,
    renderJson,
  )
where

import Data.Bifunctor (first)
import Data.ByteString (ByteString)
import Data.Char (chr, ord)
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Data.Text.Encoding as Text

-- | The deliberately small JSON value set used by the declaration protocol.
data Json
  = JsonObject [(Text, Json)]
  | JsonArray [Json]
  | JsonString Text
  deriving stock (Eq, Ord, Show)

-- | Parse JSON while preserving object order and duplicate fields.
parseJson :: ByteString -> Either () Json
parseJson bytes = do
  input <- first (const ()) (Text.decodeUtf8' bytes)
  (value, remainder) <- parseValue (dropWhitespace input)
  if Text.null (dropWhitespace remainder)
    then Right value
    else Left ()

-- | Render the protocol's single compact JSON representation.
renderJson :: Json -> ByteString
renderJson = Text.encodeUtf8 . render

parseValue :: Text -> Either () (Json, Text)
parseValue input =
  case Text.uncons (dropWhitespace input) of
    Just ('{', remainder) -> parseObject remainder
    Just ('[', remainder) -> parseArray remainder
    Just ('"', remainder) -> firstPair JsonString <$> parseString remainder
    _ -> Left ()

parseObject :: Text -> Either () (Json, Text)
parseObject input =
  case Text.uncons (dropWhitespace input) of
    Just ('}', remainder) -> Right (JsonObject [], remainder)
    _ -> go [] input
  where
    go fields remaining = do
      (name, afterName) <- parseQuotedString (dropWhitespace remaining)
      afterColon <- consume ':' (dropWhitespace afterName)
      (value, afterValue) <- parseValue afterColon
      case Text.uncons (dropWhitespace afterValue) of
        Just (',', afterComma) -> go ((name, value) : fields) afterComma
        Just ('}', afterObject) -> Right (JsonObject (reverse ((name, value) : fields)), afterObject)
        _ -> Left ()

parseArray :: Text -> Either () (Json, Text)
parseArray input =
  case Text.uncons (dropWhitespace input) of
    Just (']', remainder) -> Right (JsonArray [], remainder)
    _ -> go [] input
  where
    go values remaining = do
      (value, afterValue) <- parseValue remaining
      case Text.uncons (dropWhitespace afterValue) of
        Just (',', afterComma) -> go (value : values) afterComma
        Just (']', afterArray) -> Right (JsonArray (reverse (value : values)), afterArray)
        _ -> Left ()

parseQuotedString :: Text -> Either () (Text, Text)
parseQuotedString input = do
  afterQuote <- consume '"' input
  parseString afterQuote

parseString :: Text -> Either () (Text, Text)
parseString = go []
  where
    go characters input =
      case Text.uncons input of
        Nothing -> Left ()
        Just ('"', remainder) -> Right (Text.pack (reverse characters), remainder)
        Just ('\\', remainder) -> do
          (escaped, afterEscape) <- parseEscape remainder
          go (escaped : characters) afterEscape
        Just (character, remainder)
          | ord character < 0x20 -> Left ()
          | otherwise -> go (character : characters) remainder

parseEscape :: Text -> Either () (Char, Text)
parseEscape input =
  case Text.uncons input of
    Just ('"', remainder) -> Right ('"', remainder)
    Just ('\\', remainder) -> Right ('\\', remainder)
    Just ('/', remainder) -> Right ('/', remainder)
    Just ('b', remainder) -> Right ('\b', remainder)
    Just ('f', remainder) -> Right ('\f', remainder)
    Just ('n', remainder) -> Right ('\n', remainder)
    Just ('r', remainder) -> Right ('\r', remainder)
    Just ('t', remainder) -> Right ('\t', remainder)
    Just ('u', remainder) -> parseUnicodeEscape remainder
    _ -> Left ()

parseUnicodeEscape :: Text -> Either () (Char, Text)
parseUnicodeEscape input = do
  (firstUnit, remainder) <- parseCodeUnit input
  if isHighSurrogate firstUnit
    then do
      afterPrefix <- consumePrefix "\\u" remainder
      (secondUnit, afterSecond) <- parseCodeUnit afterPrefix
      if isLowSurrogate secondUnit
        then Right (chr (combineSurrogates firstUnit secondUnit), afterSecond)
        else Left ()
    else
      if isLowSurrogate firstUnit
        then Left ()
        else Right (chr firstUnit, remainder)

parseCodeUnit :: Text -> Either () (Int, Text)
parseCodeUnit input =
  let (digits, remainder) = Text.splitAt 4 input
   in if Text.length digits == 4
        then (,remainder) <$> foldl' accumulateHex (Right 0) (Text.unpack digits)
        else Left ()

accumulateHex :: Either () Int -> Char -> Either () Int
accumulateHex accumulated character = do
  value <- accumulated
  nibble <- hexNibble character
  Right (value * 16 + nibble)

hexNibble :: Char -> Either () Int
hexNibble character
  | '0' <= character && character <= '9' = Right (ord character - ord '0')
  | 'a' <= character && character <= 'f' = Right (ord character - ord 'a' + 10)
  | 'A' <= character && character <= 'F' = Right (ord character - ord 'A' + 10)
  | otherwise = Left ()

isHighSurrogate :: Int -> Bool
isHighSurrogate value = 0xD800 <= value && value <= 0xDBFF

isLowSurrogate :: Int -> Bool
isLowSurrogate value = 0xDC00 <= value && value <= 0xDFFF

combineSurrogates :: Int -> Int -> Int
combineSurrogates high low =
  0x10000 + ((high - 0xD800) * 0x400) + (low - 0xDC00)

consume :: Char -> Text -> Either () Text
consume expected input =
  case Text.uncons input of
    Just (actual, remainder) | actual == expected -> Right remainder
    _ -> Left ()

consumePrefix :: Text -> Text -> Either () Text
consumePrefix prefix input =
  maybe (Left ()) Right (Text.stripPrefix prefix input)

dropWhitespace :: Text -> Text
dropWhitespace = Text.dropWhile (`elem` [' ', '\t', '\n', '\r'])

firstPair :: (first -> mapped) -> (first, second) -> (mapped, second)
firstPair transform (value, remainder) = (transform value, remainder)

render :: Json -> Text
render = \case
  JsonObject fields ->
    "{" <> Text.intercalate "," (fmap renderField fields) <> "}"
  JsonArray values ->
    "[" <> Text.intercalate "," (fmap render values) <> "]"
  JsonString value -> renderString value

renderField :: (Text, Json) -> Text
renderField (name, value) = renderString name <> ":" <> render value

renderString :: Text -> Text
renderString value = "\"" <> Text.concatMap escapeCharacter value <> "\""

escapeCharacter :: Char -> Text
escapeCharacter = \case
  '"' -> "\\\""
  '\\' -> "\\\\"
  '\b' -> "\\b"
  '\f' -> "\\f"
  '\n' -> "\\n"
  '\r' -> "\\r"
  '\t' -> "\\t"
  character
    | ord character < 0x20 -> "\\u00" <> twoHexDigits (ord character)
    | otherwise -> Text.singleton character

twoHexDigits :: Int -> Text
twoHexDigits value = Text.pack [hexCharacter (value `div` 16), hexCharacter (value `mod` 16)]

hexCharacter :: Int -> Char
hexCharacter nibble
  | nibble < 10 = chr (ord '0' + nibble)
  | otherwise = chr (ord 'a' + nibble - 10)
