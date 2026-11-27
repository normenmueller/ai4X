let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let base =
      ../project.dhall
        sha256:335c2187d3c172deb74f7987cfcabd526c1a4c1340bd73cb3af1b2a7d536fc81

let ref = \(id : Text) -> { id, version = "1.0.0" }

let invalidFlow =
      { id = "urn:ai4x:flow:empty-join"
      , version = "1.0.0"
      , stages = [ { id = "urn:ai4x:stage:accept", name = "accept" } ]
      , policies =
        [ { stage = ref "urn:ai4x:stage:accept"
          , predecessors = [] : List S.Ref
          , completion = S.CompletionPolicy.JoinAll ([] : List S.Ref)
          }
        ]
      , assignments = [] : List S.StageAssignment
      , failurePaths = [] : List S.FailurePath
      , guards = [] : List S.ProcessGuard
      , iterations = [] : List S.IterationPolicy
      }

let invalid = base with workManagement.flows = [ invalidFlow ]

in    { id = "urn:ai4x:validation-case:invalid-empty-join-all"
      , declaration = invalid
      , probe =
        { transitionAttempt = None S.TransitionAttempt
        , joinAttempt = None S.JoinAttempt
        }
      , expectedErrorCodes = [ "INCOMPLETE_JOIN_ALL" ]
      , expectedValidator = "work-management"
      }
    : S.ValidationCase
