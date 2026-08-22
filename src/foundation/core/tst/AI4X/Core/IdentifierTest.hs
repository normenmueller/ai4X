{-# LANGUAGE OverloadedStrings #-}

module AI4X.Core.IdentifierTest (tests) where

import AI4X.Core
  ( Identifier,
    IdentifierDefect (..),
    identifier,
    identifierText,
  )
import Control.Monad (unless)

data Project

tests :: IO ()
tests = do
  exactRoundTrip
  deterministicEqualityAndOrdering
  rejectsEmptyText
  rejectsNul

exactRoundTrip :: IO ()
exactRoundTrip =
  case identifier "  AI4X-é  " :: Either IdentifierDefect (Identifier Project) of
    Left defect -> failTest ("unexpected identifier defect: " <> show defect)
    Right value -> assert "identifier text changed" (identifierText value == "  AI4X-é  ")

deterministicEqualityAndOrdering :: IO ()
deterministicEqualityAndOrdering =
  case (identifier "alpha", identifier "beta") :: (Either IdentifierDefect (Identifier Project), Either IdentifierDefect (Identifier Project)) of
    (Right alpha, Right beta) -> do
      assert "identifier equality is not deterministic" (alpha == alpha)
      assert "identifier ordering is not lexical" (alpha < beta)
    result -> failTest ("unexpected identifier defects: " <> show result)

rejectsEmptyText :: IO ()
rejectsEmptyText =
  assert
    "empty identifier was accepted"
    ((identifier "" :: Either IdentifierDefect (Identifier Project)) == Left EmptyIdentifier)

rejectsNul :: IO ()
rejectsNul =
  assert
    "identifier containing NUL was accepted"
    ((identifier "ai4x\NULcore" :: Either IdentifierDefect (Identifier Project)) == Left IdentifierContainsNul)

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
