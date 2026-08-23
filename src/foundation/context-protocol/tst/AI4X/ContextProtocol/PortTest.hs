{-# LANGUAGE OverloadedStrings #-}

module AI4X.ContextProtocol.PortTest (tests) where

import AI4X.ContextProtocol
import AI4X.Core (sha256FromHex)
import Control.Monad (unless)
import Data.IORef (newIORef, readIORef, writeIORef)

tests :: IO ()
tests = do
  workSystemFakeReadsPublishedSummary
  recordStoreFakeWritesReceiptSummary

workSystemFakeReadsPublishedSummary :: IO ()
workSystemFakeReadsPublishedSummary =
  withFixture $ \reference summary _ -> do
    let fake = workSystemPort (\requested -> pure (if requested == reference then Just summary else Nothing))
    found <- readPublishedSummary fake reference
    assert "work-system fake did not return its summary" (found == Just summary)

recordStoreFakeWritesReceiptSummary :: IO ()
recordStoreFakeWritesReceiptSummary =
  withFixture $ \_ _ receipt -> do
    written <- newIORef Nothing
    let fake = recordStorePort (writeIORef written . Just)
    writeReceiptSummary fake receipt
    observed <- readIORef written
    assert "record-store fake did not receive its receipt" (observed == Just receipt)

withFixture :: (ContextReference -> PublishedSummary -> ReceiptSummary -> IO ()) -> IO ()
withFixture action =
  case
      ( contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity "item-42",
        sha256FromHex "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      )
    of
      (Right reference, Right digest) ->
        action
          reference
          (publishedSummary reference digest "summary")
          (receiptSummary reference digest ContextSatisfied)
      result -> failTest ("unexpected fixture defect: " <> show result)

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
