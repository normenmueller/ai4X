{-# LANGUAGE OverloadedStrings #-}

module Composition (Input (..), validate) where

import Common

data Input = Input
  { published :: [PublishedEntity]
  , localReferences :: [ReferencePort]
  , crossContextReferences :: [ReferencePort]
  }

validate :: [PublishedSummary] -> Input -> ([Diagnostic], PublishedSummary)
validate contextSummaries input =
  (localDiagnostics <> crossDiagnostics, summary)
  where
    (localDiagnostics, summary) =
      validateIndex CompositionOwner "composition" (published input) (localReferences input)
    crossDiagnostics =
      validateReferencePorts
        CompositionOwner
        (concatMap publishedEntities (summary : contextSummaries))
        (crossContextReferences input)
