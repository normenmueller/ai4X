module Main (main) where

import qualified AI4X.ContextProtocol.PortTest as PortTest
import qualified AI4X.ContextProtocol.ReferenceTest as ReferenceTest
import qualified AI4X.ContextProtocol.ValueTest as ValueTest

main :: IO ()
main = do
  ReferenceTest.tests
  ValueTest.tests
  PortTest.tests
