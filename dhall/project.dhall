let S =
      ./schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let ref = \(id : Text) -> { id, version = "1.0.0" }

let source =
      \(path : Text) ->
        { path
        , digest = "sha256:source-fixture-v1"
        , provenanceDigest = "sha256:fixture-positive-v1"
        }

let noRefs = [] : List S.Ref

let declaredEpicStoryProfile =
      ./profiles/epic-story.dhall
        sha256:fd1577dc2e59fd48ec0120ed430034436c6e51f4eece39fc86ea0fd6737231c3

let declaredIssueSubIssueProfile =
      ./profiles/issue-subissue.dhall
        sha256:067421713c4e7d6586872bb0c56e2a4d3ee11475516a0af5ea739956afcf6d4f

let collaboration =
      { id = "urn:ai4x:collaboration:review-team"
      , version = "1.0.0"
      , participants =
        [ { id = "urn:ai4x:participant:implementer"
          , kind = S.ParticipantKind.Agent
          }
        , { id = "urn:ai4x:participant:po", kind = S.ParticipantKind.Human }
        , { id = "urn:ai4x:participant:reviewer"
          , kind = S.ParticipantKind.Agent
          }
        , { id = "urn:ai4x:participant:tech-lead"
          , kind = S.ParticipantKind.Agent
          }
        ]
      , roles =
        [ { id = "urn:ai4x:role:implementer"
          , rights =
            [ { id = "urn:ai4x:right:produce-change"
              , statement = "Produce a declared change"
              }
            ]
          , duties =
            [ { id = "urn:ai4x:duty:provide-evidence"
              , statement = "Provide implementation evidence"
              }
            ]
          , prohibitions = [] : List S.NormativeRule
          }
        , { id = "urn:ai4x:role:po"
          , rights =
            [ { id = "urn:ai4x:right:accept-work"
              , statement = "Accept reviewed work"
              }
            ]
          , duties =
            [ { id = "urn:ai4x:duty:decide-waiver"
              , statement = "Decide acceptance waivers"
              }
            ]
          , prohibitions = [] : List S.NormativeRule
          }
        , { id = "urn:ai4x:role:reviewer"
          , rights =
            [ { id = "urn:ai4x:right:review-change"
              , statement = "Review a declared change"
              }
            ]
          , duties =
            [ { id = "urn:ai4x:duty:escalate-blocker"
              , statement = "Escalate unresolved blockers"
              }
            ]
          , prohibitions = [] : List S.NormativeRule
          }
        , { id = "urn:ai4x:role:tech-lead"
          , rights =
            [ { id = "urn:ai4x:right:assign-work"
              , statement = "Assign declared work"
              }
            , { id = "urn:ai4x:right:decide-design-gate"
              , statement = "Decide the design gate"
              }
            ]
          , duties =
            [ { id = "urn:ai4x:duty:remain-accountable-for-delegation"
              , statement = "Retain accountability for delegated performance"
              }
            ]
          , prohibitions =
            [ { id = "urn:ai4x:prohibition:self-review-implementation"
              , statement = "Do not review one's own implementation"
              }
            ]
          }
        ]
      , assignments =
        [ { id = "urn:ai4x:assignment:implementer-role"
          , participant = ref "urn:ai4x:participant:implementer"
          , role = ref "urn:ai4x:role:implementer"
          }
        , { id = "urn:ai4x:assignment:po-role"
          , participant = ref "urn:ai4x:participant:po"
          , role = ref "urn:ai4x:role:po"
          }
        , { id = "urn:ai4x:assignment:reviewer-role"
          , participant = ref "urn:ai4x:participant:reviewer"
          , role = ref "urn:ai4x:role:reviewer"
          }
        , { id = "urn:ai4x:assignment:tech-lead-role"
          , participant = ref "urn:ai4x:participant:tech-lead"
          , role = ref "urn:ai4x:role:tech-lead"
          }
        ]
      , delegations =
        [ { id = "urn:ai4x:delegation:produce-change"
          , delegator = ref "urn:ai4x:participant:tech-lead"
          , delegatee = ref "urn:ai4x:participant:implementer"
          , accountable = ref "urn:ai4x:participant:tech-lead"
          , delegatedRights = [ ref "urn:ai4x:right:produce-change" ]
          }
        ]
      , handoffs =
        [ { id = "urn:ai4x:handoff:implementation-review"
          , sender = ref "urn:ai4x:participant:implementer"
          , receiver = ref "urn:ai4x:participant:reviewer"
          , artifacts =
            [ ref "urn:ai4x:artifact:change", ref "urn:ai4x:evidence:test" ]
          }
        ]
      , reviews =
        [ { id = "urn:ai4x:review:implementation"
          , subject = ref "urn:ai4x:artifact:change"
          , performer = ref "urn:ai4x:participant:reviewer"
          , excludedPerformers = [ ref "urn:ai4x:participant:implementer" ]
          , evidence = [ ref "urn:ai4x:evidence:review" ]
          }
        ]
      , escalations =
        [ { id = "urn:ai4x:escalation:blocker-to-po"
          , fromParticipant = ref "urn:ai4x:participant:tech-lead"
          , toParticipant = ref "urn:ai4x:participant:po"
          , afterRemediationCycles = 1
          }
        , { id = "urn:ai4x:escalation:blocker-to-tech-lead"
          , fromParticipant = ref "urn:ai4x:participant:reviewer"
          , toParticipant = ref "urn:ai4x:participant:tech-lead"
          , afterRemediationCycles = 0
          }
        ]
      }

let deliveryFlow =
      { id = "urn:ai4x:flow:story-delivery"
      , version = "1.0.0"
      , stages =
        [ { id = "urn:ai4x:stage:accept", name = "accept" }
        , { id = "urn:ai4x:stage:implement", name = "implement" }
        , { id = "urn:ai4x:stage:review", name = "review" }
        , { id = "urn:ai4x:stage:test", name = "test" }
        ]
      , policies =
        [ { stage = ref "urn:ai4x:stage:accept"
          , predecessors =
            [ ref "urn:ai4x:stage:review", ref "urn:ai4x:stage:test" ]
          , completion =
              S.CompletionPolicy.JoinAll
                [ ref "urn:ai4x:stage:review", ref "urn:ai4x:stage:test" ]
          }
        , { stage = ref "urn:ai4x:stage:implement"
          , predecessors = noRefs
          , completion = S.CompletionPolicy.Single
          }
        , { stage = ref "urn:ai4x:stage:review"
          , predecessors = [ ref "urn:ai4x:stage:implement" ]
          , completion = S.CompletionPolicy.Single
          }
        , { stage = ref "urn:ai4x:stage:test"
          , predecessors = [ ref "urn:ai4x:stage:implement" ]
          , completion = S.CompletionPolicy.Single
          }
        ]
      , assignments =
        [ { id = "urn:ai4x:stage-assignment:accept-po"
          , stage = ref "urn:ai4x:stage:accept"
          , participant = ref "urn:ai4x:participant:po"
          }
        , { id = "urn:ai4x:stage-assignment:implement-implementer"
          , stage = ref "urn:ai4x:stage:implement"
          , participant = ref "urn:ai4x:participant:implementer"
          }
        , { id = "urn:ai4x:stage-assignment:review-reviewer"
          , stage = ref "urn:ai4x:stage:review"
          , participant = ref "urn:ai4x:participant:reviewer"
          }
        , { id = "urn:ai4x:stage-assignment:test-reviewer"
          , stage = ref "urn:ai4x:stage:test"
          , participant = ref "urn:ai4x:participant:reviewer"
          }
        ]
      , failurePaths =
        [ { id = "urn:ai4x:failure-path:accept"
          , triggeringStates = [ ref "urn:ai4x:state:failed" ]
          , preventsStages = [ ref "urn:ai4x:stage:accept" ]
          }
        ]
      , guards =
        [ { id = "urn:ai4x:guard:review-blocked"
          , statement = "Review has an unresolved blocking finding"
          }
        ]
      , iterations =
        [ { id = "urn:ai4x:iteration:review-remediation"
          , fromStage = ref "urn:ai4x:stage:review"
          , toStage = ref "urn:ai4x:stage:implement"
          , guard = ref "urn:ai4x:guard:review-blocked"
          , maxIterations = 1
          , onExhaustionStage = ref "urn:ai4x:stage:accept"
          }
        ]
      }

let workManagement =
      { id = "urn:ai4x:work-profile:epic-story"
      , version = "1.0.0"
      , profiles = [ declaredEpicStoryProfile, declaredIssueSubIssueProfile ]
      , flows = [ deliveryFlow ]
      }

let governanceAssurance =
      { id = "urn:ai4x:governance:two-gate"
      , version = "1.0.0"
      , authorities =
        [ { id = "urn:ai4x:authority:acceptance"
          , gate = ref "urn:ai4x:gate:acceptance"
          , decisionMakers = [ ref "urn:ai4x:participant:po" ]
          , waiverGrantors = [ ref "urn:ai4x:participant:po" ]
          }
        , { id = "urn:ai4x:authority:design"
          , gate = ref "urn:ai4x:gate:design"
          , decisionMakers = [ ref "urn:ai4x:participant:tech-lead" ]
          , waiverGrantors = noRefs
          }
        ]
      , gates =
        [ { id = "urn:ai4x:gate:acceptance"
          , requiredEvidence =
            [ ref "urn:ai4x:evidence:review", ref "urn:ai4x:evidence:test" ]
          }
        , { id = "urn:ai4x:gate:design", requiredEvidence = [] : List S.Ref }
        ]
      , decisions =
        [ { id = "urn:ai4x:decision:accept-pass"
          , gate = ref "urn:ai4x:gate:acceptance"
          , authority = ref "urn:ai4x:authority:acceptance"
          , decidedBy = ref "urn:ai4x:participant:po"
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
      , waivers = [] : List S.Waiver
      , evidence =
        [ { id = "urn:ai4x:evidence:review"
          , kind = "semantic-review"
          , digest = "sha256:evidence-review-v1"
          }
        , { id = "urn:ai4x:evidence:test"
          , kind = "deterministic-test"
          , digest = "sha256:evidence-test-v1"
          }
        ]
      , assurancePacks =
        [ { id = "urn:ai4x:assurance:acceptance"
          , gate = ref "urn:ai4x:gate:acceptance"
          , evidence =
            [ ref "urn:ai4x:evidence:review", ref "urn:ai4x:evidence:test" ]
          , decisions =
            [ ref "urn:ai4x:decision:accept-pass"
            , ref "urn:ai4x:decision:design-pass"
            ]
          }
        ]
      , receipts =
        [ { id = "urn:ai4x:receipt:acceptance"
          , gate = ref "urn:ai4x:gate:acceptance"
          , decision = ref "urn:ai4x:decision:accept-pass"
          , evidenceDigests =
            [ { evidence = ref "urn:ai4x:evidence:review"
              , digest = "sha256:evidence-review-v1"
              }
            , { evidence = ref "urn:ai4x:evidence:test"
              , digest = "sha256:evidence-test-v1"
              }
            ]
          }
        ]
      }

let projectIntent =
      { id = "urn:ai4x:intent:r15"
      , version = "1.0.0"
      , needs =
        [ { id = "urn:ai4x:need:auditable-delivery"
          , statement =
              "Project work needs deterministic, traceable delivery decisions across declared collaboration and work models"
          , constraints =
            [ ref "urn:ai4x:constraint:explicit-authority"
            , ref "urn:ai4x:constraint:offline"
            ]
          , antiRequirements =
            [ ref "urn:ai4x:anti-requirement:no-implicit-build"
            , ref "urn:ai4x:anti-requirement:no-live-backlog-copy"
            ]
          , cognitiveJobs = [ ref "urn:ai4x:cognitive-job:evaluate-gate" ]
          }
        ]
      , constraints =
        [ { id = "urn:ai4x:constraint:explicit-authority"
          , statement = "Authorities and profiles are explicit"
          }
        , { id = "urn:ai4x:constraint:offline"
          , statement = "Declaration validation works offline"
          }
        ]
      , antiRequirements =
        [ { id = "urn:ai4x:anti-requirement:no-implicit-build"
          , statement =
              "Ordinary commands do not compile or evaluate declarations"
          }
        , { id = "urn:ai4x:anti-requirement:no-live-backlog-copy"
          , statement =
              "Do not copy live backlog status or order into Project Memory"
          }
        ]
      , cognitiveJobs =
        [ { id = "urn:ai4x:cognitive-job:evaluate-gate"
          , statement =
              "Assess whether declared evidence semantically satisfies a gate"
          , supportsNeeds = [ ref "urn:ai4x:need:auditable-delivery" ]
          , uncertaintyPolicy =
              "Preserve uncertainty and escalate unresolved contradictions"
          }
        ]
      }

let curationCapabilities =
      { id = "urn:ai4x:capabilities:r15"
      , version = "1.0.0"
      , capabilities =
        [ { id = "urn:ai4x:capability:evaluate-gate"
          , mode = S.CapabilityMode.Cognitive
          , statement = "Perform the evaluate-gate Cognitive Job"
          , requires = [ ref "urn:ai4x:capability:validate-model" ]
          , conflicts = [ ref "urn:ai4x:capability:unsafe-auto-approve" ]
          }
        , { id = "urn:ai4x:capability:unsafe-auto-approve"
          , mode = S.CapabilityMode.Deterministic
          , statement = "Approve a gate without semantic review"
          , requires = noRefs
          , conflicts = [ ref "urn:ai4x:capability:evaluate-gate" ]
          }
        , { id = "urn:ai4x:capability:validate-model"
          , mode = S.CapabilityMode.Deterministic
          , statement =
              "Validate local invariants and published cross-context references"
          , requires = noRefs
          , conflicts = noRefs
          }
        ]
      , selectedCapabilities =
        [ ref "urn:ai4x:capability:evaluate-gate"
        , ref "urn:ai4x:capability:validate-model"
        ]
      , traces =
        [ { id = "urn:ai4x:trace:auditable-delivery"
          , need = ref "urn:ai4x:need:auditable-delivery"
          , capabilities =
            [ ref "urn:ai4x:capability:evaluate-gate"
            , ref "urn:ai4x:capability:validate-model"
            ]
          , rationale =
              "Validation supplies deterministic integrity while evaluate-gate supplies the required cognitive judgment"
          }
        ]
      }

let declaration =
      { bundle =
        { id = "urn:ai4x:bundle:comparison"
        , version = "1.0.0"
        , pins =
          [ { context = S.BoundedContext.CurationCapabilities
            , model = ref "urn:ai4x:capabilities:r15"
            , digest = "sha256:fixture-positive-v1"
            , source = source "./project.dhall#curationCapabilities"
            }
          , { context = S.BoundedContext.Collaboration
            , model = ref "urn:ai4x:collaboration:review-team"
            , digest = "sha256:fixture-positive-v1"
            , source = source "./project.dhall#collaboration"
            }
          , { context = S.BoundedContext.GovernanceAssurance
            , model = ref "urn:ai4x:governance:two-gate"
            , digest = "sha256:fixture-positive-v1"
            , source = source "./project.dhall#governanceAssurance"
            }
          , { context = S.BoundedContext.ProjectIntent
            , model = ref "urn:ai4x:intent:r15"
            , digest = "sha256:fixture-positive-v1"
            , source = source "./project.dhall#projectIntent"
            }
          , { context = S.BoundedContext.WorkManagement
            , model = ref "urn:ai4x:work-profile:epic-story"
            , digest = "sha256:fixture-positive-v1"
            , source = source "./project.dhall#workManagement"
            }
          ]
        }
      , entry =
        { id = "urn:ai4x:project:comparison"
        , version = "1.0.0"
        , bundle = ref "urn:ai4x:bundle:comparison"
        , collaborationModel = ref "urn:ai4x:collaboration:review-team"
        , workProfile = ref "urn:ai4x:work-profile:epic-story"
        , governanceModel = ref "urn:ai4x:governance:two-gate"
        , projectIntent = ref "urn:ai4x:intent:r15"
        , capabilityCatalogue = ref "urn:ai4x:capabilities:r15"
        , projectAuthority = ref "urn:ai4x:participant:po"
        , hostBindings =
          [ { id = "urn:ai4x:host-binding:github-project-3"
            , adapter = "github-project"
            , purpose = "work-board"
            , externalId = "urn:github:project:3"
            }
          , { id = "urn:ai4x:host-binding:github-repository-ai4x"
            , adapter = "github-issues"
            , purpose = "work-contracts"
            , externalId = "urn:github:repo:normenmueller/ai4x"
            }
          ]
        , currentPointers =
          [ { id = "urn:ai4x:pointer:github-project-3"
            , kind = "external-work-board"
            , target = "urn:github:project:3"
            }
          ]
        }
      , collaboration
      , workManagement
      , governanceAssurance
      , projectIntent
      , curationCapabilities
      }

in  declaration : S.ProjectDeclaration
