module R15.Integration
  ( Pin (..)
  , ProjectBundle (..)
  , HostBinding (..)
  , ProjectEntry (..)
  , ProjectMemory (..)
  , PublishedIds (..)
  , validateIntegration
  ) where

import R15.Common

data Pin = Pin
  { pinContext :: String
  , pinModel :: Ref
  , pinDigest :: Digest
  }
  deriving (Eq, Show)

data ProjectBundle = ProjectBundle
  { bundleId :: StableId
  , bundleVersion :: Version
  , bundlePins :: [Pin]
  }
  deriving (Eq, Show)

data HostBinding = HostBinding
  { hostBindingKind :: String
  , hostBindingIdentifier :: StableId
  }
  deriving (Eq, Show)

data ProjectEntry = ProjectEntry
  { projectEntryId :: StableId
  , projectEntryCollaboration :: Ref
  , projectEntryWorkProfile :: Ref
  , projectEntryGovernance :: Ref
  , projectEntryIntent :: Ref
  , projectEntryCapabilities :: Ref
  , projectEntryAuthority :: Ref
  , projectEntryHostBindings :: [HostBinding]
  }
  deriving (Eq, Show)

data ProjectMemory = ProjectMemory
  { memoryContractRefs :: [Ref]
  , memoryCurrentExternalPointers :: [StableId]
  }
  deriving (Eq, Show)

data PublishedIds = PublishedIds
  { publishedCollaboration :: StableId
  , publishedWorkProfile :: StableId
  , publishedGovernance :: StableId
  , publishedIntent :: StableId
  , publishedCapabilities :: StableId
  , publishedParticipants :: [StableId]
  }
  deriving (Eq, Show)

validateIntegration :: PublishedIds -> ProjectBundle -> ProjectEntry -> [ValidationError]
validateIntegration published bundle entry = pinErrors ++ selectionErrors ++ authorityErrors ++ versionErrors
  where
    expected =
      [ ("Collaboration", projectEntryCollaboration entry, publishedCollaboration published)
      , ("Work Management", projectEntryWorkProfile entry, publishedWorkProfile published)
      , ("Governance and Assurance", projectEntryGovernance entry, publishedGovernance published)
      , ("Project Intent", projectEntryIntent entry, publishedIntent published)
      , ("Curation and Capabilities", projectEntryCapabilities entry, publishedCapabilities published)
      ]
    pinErrors =
      [ integrationError PinMismatch context
      | (context, selected, expectedId) <- expected
      , not (any (matchesPin context selected expectedId) (bundlePins bundle))
      ]
    matchesPin context selected expectedId pin =
      pinContext pin == context
        && pinModel pin == selected
        && refId selected == expectedId
        && pinDigest pin == fixtureDigest
    selectionErrors =
      [ integrationError ProjectSelectionMismatch context
      | (context, selected, expectedId) <- expected
      , refId selected /= expectedId || refVersion selected /= fixtureVersion
      ]
    authorityErrors
      | refId (projectEntryAuthority entry) `elem` publishedParticipants published = []
      | otherwise = [unresolved "Project Integration" "projectEntry.authority" (unStableId (refId (projectEntryAuthority entry)))]
    versionErrors =
      concatMap (validateRefVersion "Project Integration" "bundle.pin" . pinModel) (bundlePins bundle)
        ++ concatMap
          (validateRefVersion "Project Integration" "projectEntry.selection")
          [ projectEntryCollaboration entry
          , projectEntryWorkProfile entry
          , projectEntryGovernance entry
          , projectEntryIntent entry
          , projectEntryCapabilities entry
          , projectEntryAuthority entry
          ]

integrationError :: ErrorKind -> String -> ValidationError
integrationError kind detail = invalid kind "Project Integration" detail
