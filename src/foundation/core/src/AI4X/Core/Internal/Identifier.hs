{-# LANGUAGE RoleAnnotations #-}

module AI4X.Core.Internal.Identifier
  ( Identifier,
    IdentifierDefect (..),
    identifier,
    identifierText,
  )
where

import Data.Text (Text)
import qualified Data.Text as Text

type role Identifier nominal

-- | Exact stable text whose phantom parameter prevents cross-domain coercion.
newtype Identifier domain = Identifier Text
  deriving stock (Eq, Ord, Show)

-- | The complete set of reasons an identifier can be rejected.
data IdentifierDefect
  -- | Identifier text must contain at least one character.
  = EmptyIdentifier
  -- | NUL is excluded from otherwise exact identifier text.
  | IdentifierContainsNul
  deriving stock (Eq, Ord, Show)

-- | Preserve non-empty, NUL-free text exactly as a domain-specific identifier.
identifier :: Text -> Either IdentifierDefect (Identifier domain)
identifier input
  | Text.null input = Left EmptyIdentifier
  | Text.any (== '\NUL') input = Left IdentifierContainsNul
  | otherwise = Right (Identifier input)

-- | Return the exact text accepted by 'identifier'.
identifierText :: Identifier domain -> Text
identifierText (Identifier value) = value
