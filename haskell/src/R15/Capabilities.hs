module R15.Capabilities
  ( Capability (..)
  , NeedTrace (..)
  , CapabilityCatalogue (..)
  , validateCapabilities
  , validateCapabilityNeedRefs
  ) where

import R15.Common

data Capability = Capability
  { capabilityId :: StableId
  , capabilityKind :: String
  , capabilityRequires :: [Ref]
  , capabilityConflicts :: [Ref]
  }
  deriving (Eq, Show)

data NeedTrace = NeedTrace
  { needTraceId :: StableId
  , needTraceNeed :: Ref
  , needTraceCapabilities :: [Ref]
  , needTraceRationale :: String
  }
  deriving (Eq, Show)

data CapabilityCatalogue = CapabilityCatalogue
  { capabilityCatalogueId :: StableId
  , capabilityCatalogueVersion :: Version
  , capabilityCatalogueSource :: Source
  , capabilityCatalogueCapabilities :: [Capability]
  , capabilityCatalogueSelected :: [Ref]
  , capabilityCatalogueTraces :: [NeedTrace]
  }
  deriving (Eq, Show)

validateCapabilities :: CapabilityCatalogue -> [ValidationError]
validateCapabilities catalogue = conflictErrors ++ coverageErrors ++ referenceVersionErrors
  where
    selected = capabilityCatalogueSelected catalogue
    capabilities = capabilityCatalogueCapabilities catalogue
    selectedIds = map refId selected
    selectedCapabilities = [capability | capability <- capabilities, capabilityId capability `elem` selectedIds]

    conflictErrors =
      [ invalid
          CapabilityConflict
          "Curation and Capabilities"
          (unStableId (capabilityId capability) ++ " conflicts with " ++ unStableId (refId conflict))
      | capability <- selectedCapabilities
      , conflict <- capabilityConflicts capability
      , refId conflict `elem` selectedIds
      , capabilityId capability < refId conflict
      ]

    missingRequirements =
      [ required
      | capability <- selectedCapabilities
      , required <- capabilityRequires capability
      , refId required `notElem` selectedIds
      ]
    emptyTraces =
      [ trace
      | trace <- capabilityCatalogueTraces catalogue
      , null (needTraceCapabilities trace)
          || any ((`notElem` selectedIds) . refId) (needTraceCapabilities trace)
      ]
    coverageErrors
      | null missingRequirements && null emptyTraces = []
      | otherwise =
          [invalid CapabilityCoverageGap "Curation and Capabilities" "The selected set or Need trace omits a required capability"]
    referenceVersionErrors =
      concat
        [ concatMap (validateRefVersion "Curation and Capabilities" "selected") selected
        , concatMap capabilityVersions capabilities
        , concatMap traceVersions (capabilityCatalogueTraces catalogue)
        ]
    capabilityVersions capability =
      concatMap (validateRefVersion "Curation and Capabilities" "capability.requires") (capabilityRequires capability)
        ++ concatMap (validateRefVersion "Curation and Capabilities" "capability.conflicts") (capabilityConflicts capability)
    traceVersions trace =
      validateRefVersion "Curation and Capabilities" "needTrace.need" (needTraceNeed trace)
        ++ concatMap (validateRefVersion "Curation and Capabilities" "needTrace.capability") (needTraceCapabilities trace)

validateCapabilityNeedRefs :: [StableId] -> CapabilityCatalogue -> [ValidationError]
validateCapabilityNeedRefs needIds catalogue =
  [ unresolved "Curation and Capabilities" "needTrace.need" (unStableId (refId (needTraceNeed trace)))
  | trace <- capabilityCatalogueTraces catalogue
  , refId (needTraceNeed trace) `notElem` needIds
  ]
