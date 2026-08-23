-- | Closed, versioned, host-neutral context transport contracts.
module AI4X.ContextProtocol
  ( ContextProtocolVersion (..),
    OwnerTag (..),
    EntityTag (..),
    ContextReference,
    ContextDefect (..),
    contextReference,
    contextReferenceVersion,
    contextReferenceOwner,
    contextReferenceEntity,
    contextReferenceIdentifier,
    parseContextReference,
    renderContextReference,
    PublishedSummary,
    publishedSummary,
    publishedSummaryReference,
    publishedSummaryDigest,
    publishedSummaryText,
    SatisfactionResult (..),
    ReceiptSummary,
    receiptSummary,
    receiptSummaryReference,
    receiptSummaryDigest,
    receiptSummarySatisfaction,
    WorkSystemPort,
    workSystemPort,
    readPublishedSummary,
    RecordStorePort,
    recordStorePort,
    writeReceiptSummary,
  )
where

import AI4X.ContextProtocol.Internal.Port
import AI4X.ContextProtocol.Internal.Reference
import AI4X.ContextProtocol.Internal.Value
