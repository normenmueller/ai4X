{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE DerivingStrategies #-}

module Loader (LoaderError (..), loadClosed) where

import Control.Exception (SomeException, try)
import Control.Monad (forM)
import Data.Foldable (toList)
import Data.IORef
import Data.List (isPrefixOf)
import qualified Data.Set as Set
import Data.Text (Text)
import qualified Data.Text as Text
import qualified Data.Text.IO as Text
import qualified Dhall
import qualified Dhall.Core as Core
import qualified Dhall.Parser as Parser
import System.Directory (canonicalizePath, doesFileExist, makeAbsolute)
import System.FilePath (joinPath, splitDirectories, takeDirectory, (</>))
import System.Timeout (timeout)

data LoaderError = ParseError Text | ImportPolicyError [Text] | EvaluationError Text | EvaluationTimeout
  deriving stock (Eq, Show)

loadClosed :: Dhall.FromDhall a => Int -> FilePath -> FilePath -> IO (Either LoaderError a)
loadClosed timeoutSeconds projectRoot sourcePath = do
  root <- canonicalizePath projectRoot
  source <- makeAbsolute sourcePath
  sourceAllowed <- isWithinRoot root source
  if not sourceAllowed then pure (Left (ImportPolicyError ["entry source escapes project root"])) else do
    violations <- scanImports root source
    if not (null violations) then pure (Left (ImportPolicyError violations)) else do
      evaluated <- timeout (timeoutSeconds * 1000000) (try (Dhall.inputFile Dhall.auto source))
      pure $ case evaluated of
        Nothing -> Left EvaluationTimeout
        Just (Left (exception :: SomeException)) -> Left (EvaluationError (Text.pack (show exception)))
        Just (Right value) -> Right value

scanImports :: FilePath -> FilePath -> IO [Text]
scanImports root entry = newIORef Set.empty >>= scanFile root entry

scanFile :: FilePath -> FilePath -> IORef (Set.Set FilePath) -> IO [Text]
scanFile root path visited = do
  canonical <- canonicalizeSafe path
  seen <- readIORef visited
  if canonical `Set.member` seen then pure [] else do
    modifyIORef' visited (Set.insert canonical)
    exists <- doesFileExist path
    if not exists then pure ["missing local import: " <> Text.pack path] else do
      source <- Text.readFile path
      case Parser.exprFromText path source of
        Left parseFailure -> pure ["parse failure: " <> Text.pack (show parseFailure)]
        Right expression -> fmap concat $ forM (toList expression) $ \import_ ->
          classify root (takeDirectory path) import_ >>= \case
            Left violation -> pure [violation]
            Right child -> scanFile root child visited

classify :: FilePath -> FilePath -> Core.Import -> IO (Either Text FilePath)
classify root directory import_ =
  case Core.importType (Core.importHashed import_) of
    Core.Remote _ -> pure (Left "network import rejected")
    Core.Env _ -> pure (Left "environment import rejected")
    Core.Missing -> pure (Left "missing import rejected")
    Core.Local Core.Home _ -> pure (Left "home-relative import rejected")
    Core.Local Core.Absolute _ -> pure (Left "absolute import rejected")
    Core.Local prefix file_ ->
      if Core.hash (Core.importHashed import_) == Nothing
        then pure (Left "unfrozen local import rejected")
        else do
          let target = case prefix of
                Core.Here -> directory </> rel file_
                Core.Parent -> takeDirectory directory </> rel file_
          allowed <- isWithinRoot root target
          pure (if allowed then Right (collapse target) else Left "local import escapes project root")

rel :: Core.File -> FilePath
rel (Core.File (Core.Directory components) name) =
  joinPath (map Text.unpack (reverse components) <> [Text.unpack name])

isWithinRoot :: FilePath -> FilePath -> IO Bool
isWithinRoot root target = do
  rootParts <- splitDirectories <$> canonicalizePath root
  realTarget <- canonicalizeSafe target
  let lexical = splitDirectories (collapse target)
  pure (prefixWithin rootParts lexical && prefixWithin rootParts (splitDirectories realTarget))

prefixWithin :: [FilePath] -> [FilePath] -> Bool
prefixWithin root parts = root `isPrefixOf` parts && ".." `notElem` drop (length root) parts

collapse :: FilePath -> FilePath
collapse = joinPath . foldl step [] . splitDirectories
  where
    step acc "." = acc
    step acc ".." = case acc of [] -> [".."]; _ -> init acc
    step acc part = acc <> [part]

canonicalizeSafe :: FilePath -> IO FilePath
canonicalizeSafe path = doesFileExist path >>= \exists -> if exists then canonicalizePath path else pure (collapse path)
