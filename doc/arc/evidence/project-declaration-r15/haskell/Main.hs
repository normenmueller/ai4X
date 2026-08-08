module Main (main) where

import Data.List (intercalate, isPrefixOf)
import R15.Artifact
import R15.Common
import R15.Fixture
import R15.Validate
import System.Directory (removeFile, renameFile)
import System.Environment (getArgs)
import System.Exit (exitFailure)

main :: IO ()
main = do
  arguments <- getArgs
  case arguments of
    ["update", outputPath] -> update outputPath
    ["check-source"] -> checkPositive
    ["check-invalid"] -> checkInvalid
    ["check-invariants"] -> checkInvariantMatrix
    ["check-tamper"] -> checkTamper
    ["validate-artifact", inputPath] -> validateInert inputPath
    _ -> do
      putStrLn "usage: r15-haskell (update OUTPUT | check-source | check-invalid | check-invariants | check-tamper | validate-artifact INPUT)"
      exitFailure

-- This is the only operation that evaluates project-authored declarations. The staged
-- artifact is re-read and validated before a same-directory rename publishes it. This
-- demonstrates the atomic boundary; it does not make arbitrary project Haskell safe.
update :: FilePath -> IO ()
update outputPath =
  case validateFixture positiveFixture of
    [] -> do
      let stagedPath = outputPath ++ ".staged"
      writeFile stagedPath (emitArtifact positiveFixture)
      staged <- readFile stagedPath
      case validateArtifact staged of
        [] -> do
          renameFile stagedPath outputPath
          published <- readFile outputPath
          case validateArtifact published of
            [] -> putStrLn ("PASS staged atomic update: wrote and re-read inert derived artifact " ++ outputPath)
            artifactErrors -> failWithArtifactErrors "BLOCKED published artifact re-read" artifactErrors
        artifactErrors -> do
          removeFile stagedPath
          failWithArtifactErrors "BLOCKED staged artifact" artifactErrors
    errors -> failWithErrors "BLOCKED update" errors

checkPositive :: IO ()
checkPositive =
  case validateFixture positiveFixture of
    [] -> putStrLn "PASS positive fixture"
    errors -> failWithErrors "BLOCKED positive fixture" errors

checkInvalid :: IO ()
checkInvalid = do
  outcomes <- mapM checkOne invalidFixtures
  if and outcomes
    then putStrLn "PASS all 7 invalid fixtures with exact owner and typed error kind"
    else exitFailure

checkInvariantMatrix :: IO ()
checkInvariantMatrix = do
  outcomes <- mapM checkOne additionalInvariantFixtures
  if and outcomes
    then putStrLn "PASS dependency, stage identity, reference version, receipt, transition actor, and guard invariants"
    else exitFailure

checkOne :: InvalidFixture -> IO Bool
checkOne invalidFixture = do
  let errors = validateFixture (invalidValue invalidFixture)
      expected = (invalidExpectedKind invalidFixture, invalidExpectedOwner invalidFixture)
      actual = [(validationErrorKind value, errorOwner value) | value <- errors]
      passed = expected `elem` actual
  putStrLn
    ( (if passed then "PASS " else "FAIL ")
        ++ invalidName invalidFixture
        ++ ": expected="
        ++ renderErrorKind (fst expected)
        ++ "@"
        ++ snd expected
        ++ ", actual="
        ++ show [(renderErrorKind kind, owner) | (kind, owner) <- actual]
    )
  pure passed

checkTamper :: IO ()
checkTamper = do
  let original = emitArtifact positiveFixture
      cases =
        [ ( "tamper-reviewer-as-acceptance-authority"
          , modifyFactField "Governance and Assurance" "authority" "urn:ai4x:authority:acceptance" "decider" "urn:ai4x:participant:reviewer@1.0.0" original
          , ArtifactAcceptanceAuthorityInvalid
          )
        , ( "tamper-review-pending-while-accept-complete"
          , modifyFactField "Work Management Evidence" "stage-evidence" "urn:ai4x:stage:review" "state" "pending" original
          , ArtifactIncompleteJoinAll
          )
        , ( "tamper-remove-acceptance-decision"
          , removeFact "Governance and Assurance" "decision" "urn:ai4x:decision:accept-pass" original
          , ArtifactAcceptanceDecisionMissing
          )
        , ( "tamper-forge-source-digest"
          , modifySourceDigest "Collaboration" "sha256:forged" original
          , ArtifactSourceDigestInvalid
          )
        ]
  outcomes <- mapM checkTamperCase cases
  if and outcomes
    then putStrLn "PASS all 4 inert semantic tamper regressions"
    else exitFailure

checkTamperCase :: (String, String, ArtifactErrorKind) -> IO Bool
checkTamperCase (name, artifact, expected) = do
  let actual = map artifactErrorKind (validateArtifact artifact)
      passed = expected `elem` actual
  putStrLn
    ((if passed then "PASS " else "FAIL ") ++ name ++ ": expected=" ++ renderArtifactErrorKind expected ++ ", actual=" ++ show (map renderArtifactErrorKind actual))
  pure passed

validateInert :: FilePath -> IO ()
validateInert inputPath = do
  input <- readFile inputPath
  case validateArtifact input of
    [] -> putStrLn "PASS inert semantic artifact (no declaration evaluation)"
    errors -> failWithArtifactErrors "BLOCKED inert artifact" errors

modifyFactField :: String -> String -> String -> String -> String -> String -> String
modifyFactField context kind identifier key newValue =
  unlines . map modify . lines
  where
    prefix = intercalate "|" ["fact", context, kind, identifier] ++ "|"
    modify row
      | prefix `isPrefixOf` row = intercalate "|" (map replace (splitOn '|' row))
      | otherwise = row
    replace field
      | (key ++ "=") `isPrefixOf` field = key ++ "=" ++ newValue
      | otherwise = field

removeFact :: String -> String -> String -> String -> String
removeFact context kind identifier =
  unlines . filter (not . (prefix `isPrefixOf`)) . lines
  where
    prefix = intercalate "|" ["fact", context, kind, identifier] ++ "|"

modifySourceDigest :: String -> String -> String -> String
modifySourceDigest context newDigest =
  unlines . map modify . lines
  where
    prefix = "source|" ++ context ++ "|"
    modify row
      | prefix `isPrefixOf` row = intercalate "|" (map replace (splitOn '|' row))
      | otherwise = row
    replace field
      | "digest=" `isPrefixOf` field = "digest=" ++ newDigest
      | otherwise = field

splitOn :: Char -> String -> [String]
splitOn delimiter value = case break (== delimiter) value of
  (before, []) -> [before]
  (before, _ : after) -> before : splitOn delimiter after

failWithErrors :: String -> [ValidationError] -> IO a
failWithErrors heading errors = do
  putStrLn heading
  mapM_ (putStrLn . renderValidationError) errors
  exitFailure

renderValidationError :: ValidationError -> String
renderValidationError value =
  renderErrorKind (validationErrorKind value) ++ "@" ++ errorOwner value ++ ": " ++ errorDetail value

failWithArtifactErrors :: String -> [ArtifactError] -> IO a
failWithArtifactErrors heading errors = do
  putStrLn heading
  mapM_ (putStrLn . renderArtifactError) errors
  exitFailure

renderArtifactError :: ArtifactError -> String
renderArtifactError value =
  renderArtifactErrorKind (artifactErrorKind value) ++ ": " ++ artifactErrorDetail value
