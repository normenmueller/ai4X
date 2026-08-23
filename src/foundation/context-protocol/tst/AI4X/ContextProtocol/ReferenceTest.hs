{-# LANGUAGE OverloadedStrings #-}

module AI4X.ContextProtocol.ReferenceTest (tests) where

import AI4X.ContextProtocol
import AI4X.Core (IdentifierDefect (..))
import Control.Monad (unless)

tests :: IO ()
tests = do
  everyVersionAndValidTagPairRoundTrips
  preservesExactReferenceIdentifier
  rejectsEveryInvalidTagPair
  rejectsEveryReferenceDefect

everyVersionAndValidTagPairRoundTrips :: IO ()
everyVersionAndValidTagPairRoundTrips =
  mapM_ assertRoundTrip validCombinations
  where
    validCombinations =
      [ (version, owner, entity, rendered)
        | version <- [minBound .. maxBound],
          (owner, entity, rendered) <-
            [ (WorkSystemOwner, WorkItemEntity, "ai4x-context/v1/work-system/work-item/item-42"),
              (RecordStoreOwner, ContextRecordEntity, "ai4x-context/v1/record-store/context-record/item-42")
            ]
      ]

    assertRoundTrip (version, owner, entity, expectedRendering) =
      case contextReference version owner entity "item-42" of
        Left defect -> failTest ("unexpected context defect: " <> show defect)
        Right reference -> do
          assert "reference version changed" (contextReferenceVersion reference == version)
          assert "reference owner changed" (contextReferenceOwner reference == owner)
          assert "reference entity changed" (contextReferenceEntity reference == entity)
          assert "reference identifier changed" (contextReferenceIdentifier reference == "item-42")
          assert "reference rendering is not canonical" (renderContextReference reference == expectedRendering)
          assert "canonical reference did not round trip" (parseContextReference expectedRendering == Right reference)

preservesExactReferenceIdentifier :: IO ()
preservesExactReferenceIdentifier =
  case contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity "  item-é  " of
    Left defect -> failTest ("unexpected context defect: " <> show defect)
    Right reference -> do
      assert "reference identifier was normalized" (contextReferenceIdentifier reference == "  item-é  ")
      assert
        "exact reference identifier did not round trip"
        (parseContextReference (renderContextReference reference) == Right reference)

rejectsEveryInvalidTagPair :: IO ()
rejectsEveryInvalidTagPair = do
  assert
    "work-system/context-record pair was accepted"
    ( contextReference ContextProtocolV1 WorkSystemOwner ContextRecordEntity "item-42"
        == Left (InvalidOwnerEntityCombination WorkSystemOwner ContextRecordEntity)
    )
  assert
    "record-store/work-item pair was accepted"
    ( contextReference ContextProtocolV1 RecordStoreOwner WorkItemEntity "item-42"
        == Left (InvalidOwnerEntityCombination RecordStoreOwner WorkItemEntity)
    )

rejectsEveryReferenceDefect :: IO ()
rejectsEveryReferenceDefect = do
  assert
    "malformed reference was accepted"
    (parseContextReference "work-system/item-42" == Left (MalformedContextReference "work-system/item-42"))
  assert
    "reference with a non-canonical prefix was accepted"
    ( parseContextReference "context/v1/work-system/work-item/item-42"
        == Left (MalformedContextReference "context/v1/work-system/work-item/item-42")
    )
  assert
    "unsupported version was accepted"
    ( parseContextReference "ai4x-context/v2/work-system/work-item/item-42"
        == Left (UnsupportedContextProtocolVersion "v2")
    )
  assert
    "unknown owner tag was accepted"
    ( parseContextReference "ai4x-context/v1/other/work-item/item-42"
        == Left (UnknownOwnerTag "other")
    )
  assert
    "unknown entity tag was accepted"
    ( parseContextReference "ai4x-context/v1/work-system/other/item-42"
        == Left (UnknownEntityTag "other")
    )
  assert
    "invalid parsed owner/entity pair was accepted"
    ( parseContextReference "ai4x-context/v1/work-system/context-record/item-42"
        == Left (InvalidOwnerEntityCombination WorkSystemOwner ContextRecordEntity)
    )
  assert
    "empty reference identifier was accepted"
    ( contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity ""
        == Left (InvalidContextReferenceIdentifier EmptyIdentifier)
    )
  assert
    "NUL reference identifier was accepted"
    ( contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity "item\NUL42"
        == Left (InvalidContextReferenceIdentifier IdentifierContainsNul)
    )
  assert
    "reference identifier containing a separator was accepted"
    ( contextReference ContextProtocolV1 WorkSystemOwner WorkItemEntity "item/42"
        == Left ContextReferenceIdentifierContainsSeparator
    )

assert :: String -> Bool -> IO ()
assert message condition = unless condition (failTest message)

failTest :: String -> IO a
failTest message = ioError (userError message)
