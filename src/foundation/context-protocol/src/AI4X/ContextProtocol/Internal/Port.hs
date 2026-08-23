module AI4X.ContextProtocol.Internal.Port
  ( WorkSystemPort,
    workSystemPort,
    readPublishedSummary,
    RecordStorePort,
    recordStorePort,
    writeReceiptSummary,
  )
where

import AI4X.ContextProtocol.Internal.Reference (ContextReference)
import AI4X.ContextProtocol.Internal.Value (PublishedSummary, ReceiptSummary)

-- | Host-neutral boundary for reading a published summary from a work system.
newtype WorkSystemPort m = WorkSystemPort
  (ContextReference -> m (Maybe PublishedSummary))

-- | Construct a work-system port from its single required operation.
workSystemPort ::
  (ContextReference -> m (Maybe PublishedSummary)) ->
  WorkSystemPort m
workSystemPort = WorkSystemPort

-- | Read a published summary through a work-system boundary.
readPublishedSummary ::
  WorkSystemPort m ->
  ContextReference ->
  m (Maybe PublishedSummary)
readPublishedSummary (WorkSystemPort readSummary) = readSummary

-- | Host-neutral boundary for writing a receipt to a record store.
newtype RecordStorePort m = RecordStorePort (ReceiptSummary -> m ())

-- | Construct a record-store port from its single required operation.
recordStorePort :: (ReceiptSummary -> m ()) -> RecordStorePort m
recordStorePort = RecordStorePort

-- | Write a receipt through a record-store boundary.
writeReceiptSummary :: RecordStorePort m -> ReceiptSummary -> m ()
writeReceiptSummary (RecordStorePort writeReceipt) = writeReceipt
