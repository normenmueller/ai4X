let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let base =
      ../project.dhall
        sha256:335c2187d3c172deb74f7987cfcabd526c1a4c1340bd73cb3af1b2a7d536fc81

let epicStory =
      ../profiles/epic-story.dhall
        sha256:fd1577dc2e59fd48ec0120ed430034436c6e51f4eece39fc86ea0fd6737231c3

let issueSubIssue =
      ../profiles/issue-subissue.dhall
        sha256:067421713c4e7d6586872bb0c56e2a4d3ee11475516a0af5ea739956afcf6d4f

let ref = \(id : Text) -> { id, version = "1.0.0" }

let illegalTransition =
      { id = "urn:ai4x:transition:ready-done"
      , fromState = ref "urn:ai4x:state:ready"
      , toState = ref "urn:ai4x:state:done"
      , actor = ref "urn:ai4x:participant:tech-lead"
      , guard = S.TransitionGuard.None
      }

let invalid =
      base
      with workManagement.profiles
           =
        [ epicStory
          with transitions = epicStory.transitions # [ illegalTransition ]
        , issueSubIssue
        ]

in    { id = "urn:ai4x:validation-case:invalid-illegal-transition"
      , declaration = invalid
      , probe =
        { transitionAttempt = Some
          { profile = ref "urn:ai4x:work-profile:epic-story"
          , transition = ref "urn:ai4x:transition:ready-done"
          , fromState = ref "urn:ai4x:state:ready"
          , toState = ref "urn:ai4x:state:done"
          , actor = ref "urn:ai4x:participant:tech-lead"
          , evidence = [] : List S.Ref
          , decisions = [] : List S.Ref
          , receipts = [] : List S.Ref
          }
        , joinAttempt = None S.JoinAttempt
        }
      , expectedErrorCodes = [ "ILLEGAL_TRANSITION" ]
      , expectedValidator = "work-management"
      }
    : S.ValidationCase
