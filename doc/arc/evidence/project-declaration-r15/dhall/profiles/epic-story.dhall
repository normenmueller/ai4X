let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let ref = \(id : Text) -> { id, version = "1.0.0" }

in    { id = "urn:ai4x:work-profile:epic-story"
      , version = "1.0.0"
      , itemKinds =
        [ { id = "urn:ai4x:item-kind:epic"
          , name = "Epic"
          , parentPolicy = S.ParentPolicy.Root
          }
        , { id = "urn:ai4x:item-kind:story"
          , name = "Story"
          , parentPolicy =
              S.ParentPolicy.ExactlyOne (ref "urn:ai4x:item-kind:epic")
          }
        ]
      , dependencyPolicies =
        [ { id = "urn:ai4x:dependency-policy:story-story"
          , fromKind = ref "urn:ai4x:item-kind:story"
          , toKind = ref "urn:ai4x:item-kind:story"
          , acyclic = True
          }
        ]
      , states =
        [ { id = "urn:ai4x:state:done"
          , name = "done"
          , kind = S.LifecycleStateKind.TerminalSuccess
          }
        , { id = "urn:ai4x:state:failed"
          , name = "failed"
          , kind = S.LifecycleStateKind.TerminalFailure
          }
        , { id = "urn:ai4x:state:in-progress"
          , name = "in-progress"
          , kind = S.LifecycleStateKind.Active
          }
        , { id = "urn:ai4x:state:in-review"
          , name = "in-review"
          , kind = S.LifecycleStateKind.Review
          }
        , { id = "urn:ai4x:state:ready"
          , name = "ready"
          , kind = S.LifecycleStateKind.Initial
          }
        ]
      , transitions =
        [ { id = "urn:ai4x:transition:in-progress-failed"
          , fromState = ref "urn:ai4x:state:in-progress"
          , toState = ref "urn:ai4x:state:failed"
          , actor = ref "urn:ai4x:participant:tech-lead"
          , guard = S.TransitionGuard.None
          }
        , { id = "urn:ai4x:transition:in-progress-in-review"
          , fromState = ref "urn:ai4x:state:in-progress"
          , toState = ref "urn:ai4x:state:in-review"
          , actor = ref "urn:ai4x:participant:tech-lead"
          , guard =
              S.TransitionGuard.EvidenceComplete
                [ ref "urn:ai4x:evidence:test" ]
          }
        , { id = "urn:ai4x:transition:in-review-done"
          , fromState = ref "urn:ai4x:state:in-review"
          , toState = ref "urn:ai4x:state:done"
          , actor = ref "urn:ai4x:participant:po"
          , guard =
              S.TransitionGuard.GovernanceDecisionAndReceipt
                { decision = ref "urn:ai4x:decision:accept-pass"
                , receipt = ref "urn:ai4x:receipt:acceptance"
                }
          }
        , { id = "urn:ai4x:transition:in-review-failed"
          , fromState = ref "urn:ai4x:state:in-review"
          , toState = ref "urn:ai4x:state:failed"
          , actor = ref "urn:ai4x:participant:tech-lead"
          , guard = S.TransitionGuard.None
          }
        , { id = "urn:ai4x:transition:ready-in-progress"
          , fromState = ref "urn:ai4x:state:ready"
          , toState = ref "urn:ai4x:state:in-progress"
          , actor = ref "urn:ai4x:participant:tech-lead"
          , guard = S.TransitionGuard.None
          }
        ]
      }
    : S.WorkProfile
