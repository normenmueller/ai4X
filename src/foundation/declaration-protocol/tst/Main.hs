module Main (main) where

import qualified AI4X.DeclarationProtocol.CodecTest as CodecTest
import qualified AI4X.DeclarationProtocol.ContractTest as ContractTest
import qualified AI4X.DeclarationProtocol.ValidationTest as ValidationTest

main :: IO ()
main = do
  ContractTest.tests
  CodecTest.tests
  ValidationTest.tests
