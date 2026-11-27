{-# LANGUAGE OverloadedStrings #-}

module Intent (Input (..), validate) where

import Common
data Input = Input { published :: [PublishedEntity], localReferences :: [ReferencePort] }

validate :: Input -> ([Diagnostic], PublishedSummary)
validate input = validateIndex ProjectIntentOwner "projectIntent" (published input) (localReferences input)
