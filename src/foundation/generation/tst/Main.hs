module Main (main) where

import qualified AI4X.Generation.ContractTest as ContractTest
import qualified AI4X.Generation.FailureTest as FailureTest
import qualified AI4X.Generation.ProtocolTest as ProtocolTest
import qualified AI4X.Generation.SuccessTest as SuccessTest

main :: IO ()
main = do
  ContractTest.tests
  SuccessTest.tests
  FailureTest.tests
  ProtocolTest.tests
