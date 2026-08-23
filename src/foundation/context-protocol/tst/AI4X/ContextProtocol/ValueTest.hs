{-# LANGUAGE OverloadedStrings #-}

module AI4X.ContextProtocol.ValueTest (tests) where

import AI4X.ContextProtocol
import AI4X.Core (Sha256, sha256FromHex)
import Control.Monad (unless)

tests :: IO ()
tests = do
  publishedSummaryCarriesExactData
  receiptSummaryCarriesEverySatisfactionResult

publishedSummaryCarriesExactData :: IO ()
publishedSummaryCarriesExactData =
  withFixture $ \reference digest -> do
    let summary = publishedSummary reference digest "  exact summary é  "
    assert "published reference changed" (publishedSummaryReference summary == reference)
    assert "published digest changed" (publishedSummaryDigest summary == digest)
    assert "published text changed" (publishedSummaryText summary == "  exact summary é  ")

receiptSummaryCarriesEverySatisfactionResult :: IO ()
receiptSummaryCarriesEverySatisfactionResult =
  withFixture $ \reference digest ->
    mapM_
      (\satisfaction -> do
         let receipt = receiptSummary reference digest satisfaction
         assert "receipt reference changed" (receiptSummaryReference receipt == reference)
         assert "receipt digest changed" (receiptSummaryDigest receipt == digest)
         assert "receipt satisfaction changed" (receiptSummarySatisfaction receipt == satisfaction)
      )
      [ContextSatisfied, ContextUnsatisfied "missing approved context"]

withFixture :: (ContextReference -> Sha256 -> IO ()) -> IO ()
withFixture action =
  case
      ( contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity "item-42",
        sha256FromHex "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      )
    of
      (Right reference, Right digest) -> action reference digest
      result -> failTest ("unexpected fixture defect: " <> show result)

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
