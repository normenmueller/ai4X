let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let base =
      ../project.dhall
        sha256:335c2187d3c172deb74f7987cfcabd526c1a4c1340bd73cb3af1b2a7d536fc81

let ref = \(id : Text) -> { id, version = "1.0.0" }

let invalid =
      base
      with curationCapabilities.selectedCapabilities
           =
        [ ref "urn:ai4x:capability:evaluate-gate" ]

in    { id = "urn:ai4x:validation-case:invalid-capability-coverage-gap"
      , declaration = invalid
      , probe =
        { transitionAttempt = None S.TransitionAttempt
        , joinAttempt = None S.JoinAttempt
        }
      , expectedErrorCodes = [ "CAPABILITY_COVERAGE_GAP" ]
      , expectedValidator = "curation"
      }
    : S.ValidationCase
