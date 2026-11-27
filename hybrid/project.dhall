-- Authoritative project graph facts for the deliberate hybrid candidate.
-- This file owns identities, instances, topology, and descriptive intent.
-- Behavioral policy is intentionally absent; HybridPolicy.hs owns it.

let Ref = { id : Text, version : Text }

let ref = \(id : Text) -> { id = id, version = "1.0.0" }

let Pin = { id : Text, version : Text, digest : Text }

let pin =
      \(id : Text) ->
        { id = id
        , version = "1.0.0"
        , digest = "sha256:fixture-positive-v1"
        }

let declaration =
      \(id : Text) ->
        { id = id
        , version = "1.0.0"
        , digest = "sha256:fixture-positive-v1"
        , source = "hybrid/project.dhall"
        , sourceDigestToken = "sha256:source-fixture-v1"
        }

let Assignment = { participant : Ref, role : Ref }

let StageAssignment = { stage : Ref, participant : Ref }

let Capability =
      { id : Text
      , summary : Text
      , requires : List Ref
      , conflicts : List Ref
      }

in  { protocolVersion = "1.0.0"
    , sourceDigestToken = "sha256:source-fixture-v1"
    , bundle =
        { declaration = declaration "urn:ai4x:bundle:comparison"
        , pins =
          [ pin "urn:ai4x:collaboration:review-team"
          , pin "urn:ai4x:work-profile:epic-story"
          , pin "urn:ai4x:governance:two-gate"
          , pin "urn:ai4x:intent:r15"
          , pin "urn:ai4x:capabilities:r15"
          ] : List Pin
        }
    , projectEntry =
        { id = "urn:ai4x:project:comparison"
        , collaboration = ref "urn:ai4x:collaboration:review-team"
        , workProfile = ref "urn:ai4x:work-profile:epic-story"
        , governance = ref "urn:ai4x:governance:two-gate"
        , intent = ref "urn:ai4x:intent:r15"
        , capabilities = ref "urn:ai4x:capabilities:r15"
        , projectAuthority = ref "urn:ai4x:participant:po"
        , githubProjectPointer = "urn:github:project:3"
        , githubRepositoryPointer = "urn:github:repo:normenmueller/ai4x"
        }
    , collaboration =
        { declaration = declaration "urn:ai4x:collaboration:review-team"
        , participants =
          [ ref "urn:ai4x:participant:po"
          , ref "urn:ai4x:participant:tech-lead"
          , ref "urn:ai4x:participant:implementer"
          , ref "urn:ai4x:participant:reviewer"
          ]
        , roles =
          [ ref "urn:ai4x:role:po"
          , ref "urn:ai4x:role:tech-lead"
          , ref "urn:ai4x:role:implementer"
          , ref "urn:ai4x:role:reviewer"
          ]
        , assignments =
          [ { participant = ref "urn:ai4x:participant:po", role = ref "urn:ai4x:role:po" }
          , { participant = ref "urn:ai4x:participant:tech-lead", role = ref "urn:ai4x:role:tech-lead" }
          , { participant = ref "urn:ai4x:participant:implementer", role = ref "urn:ai4x:role:implementer" }
          , { participant = ref "urn:ai4x:participant:reviewer", role = ref "urn:ai4x:role:reviewer" }
          ] : List Assignment
        , delegation =
          { delegator = ref "urn:ai4x:participant:tech-lead"
          , delegate = ref "urn:ai4x:participant:implementer"
          , performance = "produce-change"
          , accountabilityHolder = ref "urn:ai4x:participant:tech-lead"
          }
        , handoff =
          { id = "urn:ai4x:handoff:implementation-review"
          , sender = ref "urn:ai4x:participant:implementer"
          , receiver = ref "urn:ai4x:participant:reviewer"
          , payload = [ "change", "evidence" ]
          }
        , review =
          { id = "urn:ai4x:review:implementation"
          , performer = ref "urn:ai4x:participant:reviewer"
          , prohibitedPerformer = ref "urn:ai4x:participant:implementer"
          }
        , escalation =
          { first = ref "urn:ai4x:participant:tech-lead"
          , afterRepeatedBlocker = ref "urn:ai4x:participant:po"
          , remediationCycles = 1
          }
        }
    , workManagement =
        { declaration = declaration "urn:ai4x:work-profile:epic-story"
        , availableProfiles =
          [ ref "urn:ai4x:work-profile:epic-story"
          , ref "urn:ai4x:work-profile:issue-subissue"
          ]
        , explicitlySelectedProfile = ref "urn:ai4x:work-profile:epic-story"
        , itemKinds = [ "Epic", "Story" ]
        , representativeHierarchy =
          { parentKind = "Epic", childKind = "Story", childParentCardinality = "exactly-one" }
        , representativeDependency = { fromKind = "Story", toKind = "Story" }
        , states = [ "ready", "in-progress", "in-review", "done", "failed" ]
        , flow =
          { id = "urn:ai4x:flow:story-delivery"
          , stages =
            [ ref "urn:ai4x:stage:implement"
            , ref "urn:ai4x:stage:test"
            , ref "urn:ai4x:stage:review"
            , ref "urn:ai4x:stage:accept"
            ]
          , edges =
            [ { predecessor = ref "urn:ai4x:stage:implement", successor = ref "urn:ai4x:stage:test" }
            , { predecessor = ref "urn:ai4x:stage:implement", successor = ref "urn:ai4x:stage:review" }
            , { predecessor = ref "urn:ai4x:stage:test", successor = ref "urn:ai4x:stage:accept" }
            , { predecessor = ref "urn:ai4x:stage:review", successor = ref "urn:ai4x:stage:accept" }
            ]
          }
        , assignments =
          [ { stage = ref "urn:ai4x:stage:implement", participant = ref "urn:ai4x:participant:implementer" }
          , { stage = ref "urn:ai4x:stage:test", participant = ref "urn:ai4x:participant:reviewer" }
          , { stage = ref "urn:ai4x:stage:review", participant = ref "urn:ai4x:participant:reviewer" }
          , { stage = ref "urn:ai4x:stage:accept", participant = ref "urn:ai4x:participant:po" }
          ] : List StageAssignment
        }
    , governance =
        { declaration = declaration "urn:ai4x:governance:two-gate"
        , authorities =
          [ ref "urn:ai4x:authority:design"
          , ref "urn:ai4x:authority:acceptance"
          ]
        , gates =
          [ ref "urn:ai4x:gate:design"
          , ref "urn:ai4x:gate:acceptance"
          ]
        , decisions =
          [ { id = "urn:ai4x:decision:design-pass", gate = ref "urn:ai4x:gate:design", decider = ref "urn:ai4x:participant:tech-lead", outcome = "pass" }
          , { id = "urn:ai4x:decision:accept-pass", gate = ref "urn:ai4x:gate:acceptance", decider = ref "urn:ai4x:participant:po", outcome = "pass" }
          ]
        , evidence =
          [ { id = "urn:ai4x:evidence:test", digest = "sha256:evidence-test-v1" }
          , { id = "urn:ai4x:evidence:review", digest = "sha256:evidence-review-v1" }
          ]
        , assurance =
          { id = "urn:ai4x:assurance:acceptance"
          , gate = ref "urn:ai4x:gate:acceptance"
          , evidence = [ ref "urn:ai4x:evidence:test", ref "urn:ai4x:evidence:review" ]
          , decisions = [ ref "urn:ai4x:decision:design-pass", ref "urn:ai4x:decision:accept-pass" ]
          }
        , receipt =
          { id = "urn:ai4x:receipt:acceptance"
          , decision = ref "urn:ai4x:decision:accept-pass"
          , evidenceDigests = [ "sha256:evidence-test-v1", "sha256:evidence-review-v1" ]
          }
        , waivers =
            []
          : List
              { id : Text
              , gate : Ref
              , authority : Ref
              , grantor : Ref
              , rationale : Text
              , expiryCondition : Text
              , waivedEvidence : Ref
              }
        }
    , projectIntent =
        { declaration = declaration "urn:ai4x:intent:r15"
        , need =
          { id = "urn:ai4x:need:auditable-delivery"
          , statement = "Project work needs deterministic, traceable delivery decisions across declared collaboration and work models."
          }
        , constraints =
          [ { id = "urn:ai4x:constraint:offline", statement = "Declaration validation works offline." }
          , { id = "urn:ai4x:constraint:explicit-authority", statement = "Authorities and profiles are explicit." }
          ]
        , antiRequirements =
          [ { id = "urn:ai4x:anti-requirement:no-live-backlog-copy", statement = "Do not copy live backlog status or order into Project Memory." }
          , { id = "urn:ai4x:anti-requirement:no-implicit-build", statement = "Ordinary commands do not compile or evaluate declarations." }
          ]
        , cognitiveJob =
          { id = "urn:ai4x:cognitive-job:evaluate-gate"
          , supports = ref "urn:ai4x:need:auditable-delivery"
          , statement = "Assess whether declared evidence semantically satisfies a gate, preserve uncertainty, and escalate unresolved contradictions."
          }
        }
    , capabilities =
        { declaration = declaration "urn:ai4x:capabilities:r15"
        , catalogue =
          [ { id = "urn:ai4x:capability:validate-model"
            , summary = "Deterministically validate local invariants and published references."
            , requires = [] : List Ref
            , conflicts = [] : List Ref
            }
          , { id = "urn:ai4x:capability:evaluate-gate"
            , summary = "Perform the evaluate-gate Cognitive Job."
            , requires = [ ref "urn:ai4x:capability:validate-model" ]
            , conflicts = [ ref "urn:ai4x:capability:unsafe-auto-approve" ]
            }
          , { id = "urn:ai4x:capability:unsafe-auto-approve"
            , summary = "Approve without semantic evaluation; deliberately incompatible."
            , requires = [] : List Ref
            , conflicts = [ ref "urn:ai4x:capability:evaluate-gate" ]
            }
          ] : List Capability
        , selected =
          [ ref "urn:ai4x:capability:validate-model"
          , ref "urn:ai4x:capability:evaluate-gate"
          ]
        , trace =
          { id = "urn:ai4x:trace:auditable-delivery"
          , need = ref "urn:ai4x:need:auditable-delivery"
          , capabilities =
            [ ref "urn:ai4x:capability:validate-model"
            , ref "urn:ai4x:capability:evaluate-gate"
            ]
          , rationale = "Validation supplies deterministic integrity while gate evaluation supplies bounded semantic judgment."
          }
        }
    }
