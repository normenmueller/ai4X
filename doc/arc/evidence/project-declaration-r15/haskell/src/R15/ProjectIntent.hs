module R15.ProjectIntent
  ( Need (..)
  , CognitiveJob (..)
  , ProjectIntent (..)
  , validateProjectIntent
  ) where

import R15.Common

data Need = Need
  { needId :: StableId
  , needStatement :: String
  }
  deriving (Eq, Show)

data CognitiveJob = CognitiveJob
  { cognitiveJobId :: StableId
  , cognitiveJobStatement :: String
  , cognitiveJobSupportsNeed :: Ref
  }
  deriving (Eq, Show)

data ProjectIntent = ProjectIntent
  { projectIntentId :: StableId
  , projectIntentVersion :: Version
  , projectIntentSource :: Source
  , projectIntentNeeds :: [Need]
  , projectIntentConstraints :: [(StableId, String)]
  , projectIntentAntiRequirements :: [(StableId, String)]
  , projectIntentCognitiveJobs :: [CognitiveJob]
  }
  deriving (Eq, Show)

validateProjectIntent :: ProjectIntent -> [ValidationError]
validateProjectIntent intent =
  [ unresolved "Project Intent" "cognitiveJob.supportsNeed" (unStableId (refId (cognitiveJobSupportsNeed job)))
  | job <- projectIntentCognitiveJobs intent
  , refId (cognitiveJobSupportsNeed job) `notElem` map needId (projectIntentNeeds intent)
  ]
    ++ concatMap
      (validateRefVersion "Project Intent" "cognitiveJob.supportsNeed" . cognitiveJobSupportsNeed)
      (projectIntentCognitiveJobs intent)
