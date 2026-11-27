let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let epicStory =
      ./epic-story.dhall
        sha256:fd1577dc2e59fd48ec0120ed430034436c6e51f4eece39fc86ea0fd6737231c3

let ref = \(id : Text) -> { id, version = "1.0.0" }

in    { id = "urn:ai4x:work-profile:issue-subissue"
      , version = "1.0.0"
      , itemKinds =
        [ { id = "urn:ai4x:item-kind:issue"
          , name = "Issue"
          , parentPolicy = S.ParentPolicy.Root
          }
        , { id = "urn:ai4x:item-kind:sub-issue"
          , name = "Sub-Issue"
          , parentPolicy =
              S.ParentPolicy.ExactlyOne (ref "urn:ai4x:item-kind:issue")
          }
        ]
      , dependencyPolicies =
        [ { id = "urn:ai4x:dependency-policy:sub-issue-sub-issue"
          , fromKind = ref "urn:ai4x:item-kind:sub-issue"
          , toKind = ref "urn:ai4x:item-kind:sub-issue"
          , acyclic = True
          }
        ]
      , states = epicStory.states
      , transitions = epicStory.transitions
      }
    : S.WorkProfile
