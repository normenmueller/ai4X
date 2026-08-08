let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let base =
      ../project.dhall
        sha256:335c2187d3c172deb74f7987cfcabd526c1a4c1340bd73cb3af1b2a7d536fc81

let ref = \(id : Text) -> { id, version = "1.0.0" }

in    { id = "urn:ai4x:validation-case:positive"
      , declaration = base
      , probe =
        { transitionAttempt = Some
          { profile = ref "urn:ai4x:work-profile:epic-story"
          , transition = ref "urn:ai4x:transition:in-review-done"
          , fromState = ref "urn:ai4x:state:in-review"
          , toState = ref "urn:ai4x:state:done"
          , actor = ref "urn:ai4x:participant:po"
          , evidence =
            [ ref "urn:ai4x:evidence:review", ref "urn:ai4x:evidence:test" ]
          , decisions = [ ref "urn:ai4x:decision:accept-pass" ]
          , receipts = [ ref "urn:ai4x:receipt:acceptance" ]
          }
        , joinAttempt = Some
          { flow = ref "urn:ai4x:flow:story-delivery"
          , stage = ref "urn:ai4x:stage:accept"
          , requestedState = S.StageRunState.Succeeded
          , stageRuns =
            [ { stage = ref "urn:ai4x:stage:implement"
              , state = S.StageRunState.Succeeded
              }
            , { stage = ref "urn:ai4x:stage:review"
              , state = S.StageRunState.Succeeded
              }
            , { stage = ref "urn:ai4x:stage:test"
              , state = S.StageRunState.Succeeded
              }
            ]
          }
        }
      , expectedErrorCodes = [] : List Text
      , expectedValidator = "none"
      }
    : S.ValidationCase
