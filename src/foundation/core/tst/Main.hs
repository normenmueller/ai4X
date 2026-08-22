module Main (main) where

import qualified AI4X.Core.IdentifierTest as IdentifierTest
import qualified AI4X.Core.Sha256Test as Sha256Test

main :: IO ()
main = do
  IdentifierTest.tests
  Sha256Test.tests
