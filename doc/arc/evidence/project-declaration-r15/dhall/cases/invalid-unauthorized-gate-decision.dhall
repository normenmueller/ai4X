let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let base =
      ../project.dhall
        sha256:335c2187d3c172deb74f7987cfcabd526c1a4c1340bd73cb3af1b2a7d536fc81

let ref = \(id : Text) -> { id, version = "1.0.0" }

let invalid =
      base
      with governanceAssurance.decisions
           =
        [ { id = "urn:ai4x:decision:accept-pass"
          , gate = ref "urn:ai4x:gate:acceptance"
          , authority = ref "urn:ai4x:authority:acceptance"
          , decidedBy = ref "urn:ai4x:participant:reviewer"
          , outcome = S.DecisionOutcome.Pass
          , rationale =
              "Semantic review and declared evidence satisfy acceptance"
          }
        , { id = "urn:ai4x:decision:design-pass"
          , gate = ref "urn:ai4x:gate:design"
          , authority = ref "urn:ai4x:authority:design"
          , decidedBy = ref "urn:ai4x:participant:tech-lead"
          , outcome = S.DecisionOutcome.Pass
          , rationale = "The declared design is coherent"
          }
        ]

in    { id = "urn:ai4x:validation-case:invalid-unauthorized-gate-decision"
      , declaration = invalid
      , probe =
        { transitionAttempt = None S.TransitionAttempt
        , joinAttempt = None S.JoinAttempt
        }
      , expectedErrorCodes = [ "UNAUTHORIZED_GATE_DECISION" ]
      , expectedValidator = "assurance-check"
      }
    : S.ValidationCase
