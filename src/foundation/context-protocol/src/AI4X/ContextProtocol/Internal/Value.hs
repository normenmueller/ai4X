module AI4X.ContextProtocol.Internal.Value
  ( PublishedSummary,
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
  )
where

import AI4X.ContextProtocol.Internal.Reference (ContextReference)
import AI4X.Core (Sha256)
import Data.Text (Text)

-- | Inert summary text bound to a referenced entity and exact content digest.
data PublishedSummary = PublishedSummary ContextReference Sha256 Text
  deriving stock (Eq, Ord, Show)

-- | Construct an inert published summary value.
publishedSummary :: ContextReference -> Sha256 -> Text -> PublishedSummary
publishedSummary = PublishedSummary

-- | Return the entity referenced by a published summary.
publishedSummaryReference :: PublishedSummary -> ContextReference
publishedSummaryReference (PublishedSummary reference _ _) = reference

-- | Return the exact content digest carried by a published summary.
publishedSummaryDigest :: PublishedSummary -> Sha256
publishedSummaryDigest (PublishedSummary _ digest _) = digest

-- | Return the summary text without interpretation.
publishedSummaryText :: PublishedSummary -> Text
publishedSummaryText (PublishedSummary _ _ summaryText) = summaryText

-- | A transported satisfaction observation without evaluation policy.
data SatisfactionResult
  = ContextSatisfied
  | ContextUnsatisfied Text
  deriving stock (Eq, Ord, Show)

-- | Inert acknowledgement of the exact published summary that was observed.
data ReceiptSummary = ReceiptSummary ContextReference Sha256 SatisfactionResult
  deriving stock (Eq, Ord, Show)

-- | Construct an inert receipt summary value.
receiptSummary :: ContextReference -> Sha256 -> SatisfactionResult -> ReceiptSummary
receiptSummary = ReceiptSummary

-- | Return the entity referenced by a receipt summary.
receiptSummaryReference :: ReceiptSummary -> ContextReference
receiptSummaryReference (ReceiptSummary reference _ _) = reference

-- | Return the observed content digest carried by a receipt summary.
receiptSummaryDigest :: ReceiptSummary -> Sha256
receiptSummaryDigest (ReceiptSummary _ digest _) = digest

-- | Return the transported satisfaction observation.
receiptSummarySatisfaction :: ReceiptSummary -> SatisfactionResult
receiptSummarySatisfaction (ReceiptSummary _ _ satisfaction) = satisfaction
