let S =
      ../schema/package.dhall
        sha256:472a372676bd7f5d25e489c40f3cb81b54afbf8670a30fa7907562bd991fdb8e

let map =
      \(a : Type) ->
      \(b : Type) ->
      \(f : a -> b) ->
      \(xs : List a) ->
        List/fold
          a
          xs
          (List b)
          (\(x : a) -> \(ys : List b) -> [ f x ] # ys)
          ([] : List b)

let concat =
      \(a : Type) ->
      \(xss : List (List a)) ->
        List/fold
          (List a)
          xss
          (List a)
          (\(xs : List a) -> \(ys : List a) -> xs # ys)
          ([] : List a)

let DelegationView =
      { delegator : S.Ref, delegatee : S.Ref, accountable : S.Ref }

let TransitionView =
      { transitionId : Text
      , declaredFromState : S.Ref
      , declaredToState : S.Ref
      , transitionActor : S.Ref
      , guardKind : Text
      }

let StateView = { stateId : Text, stateKind : Text }

let ProfileView =
      { profileId : Text
      , profileVersion : Text
      , states : List StateView
      , transitions : List TransitionView
      }

let PolicyView =
      { policyStage : S.Ref
      , predecessors : List S.Ref
      , completionKind : Text
      , joinAll : List S.Ref
      }

let FailureView =
      { failureId : Text
      , triggeringStates : List S.Ref
      , preventsStages : List S.Ref
      }

let FlowView = { flowId : Text, flowVersion : Text, policies : List PolicyView }

let IterationView =
      { iterationId : Text
      , fromStage : S.Ref
      , toStage : S.Ref
      , guard : S.Ref
      , maxIterations : Natural
      , onExhaustionStage : S.Ref
      }

let FlowView =
      { flowId : Text
      , flowVersion : Text
      , stageIds : List Text
      , policies : List PolicyView
      , failurePaths : List FailureView
      , iterations : List IterationView
      }

let AuthorityView =
      { authorityId : Text, authorityGate : S.Ref, decisionMakers : List S.Ref }

let DecisionView =
      { decisionId : Text
      , decisionGate : S.Ref
      , authority : S.Ref
      , decidedBy : S.Ref
      }

let CapabilityView =
      { capabilityId : Text, requires : List S.Ref, conflicts : List S.Ref }

let TraceView =
      { traceId : Text, need : S.Ref, tracedCapabilities : List S.Ref }

let TransitionAttemptView =
      { profile : S.Ref
      , transition : S.Ref
      , attemptedFromState : S.Ref
      , attemptedToState : S.Ref
      , attemptedActor : S.Ref
      }

let StageRunView = { runStage : S.Ref, state : Text }

let JoinAttemptView =
      { flow : S.Ref
      , requestedStage : S.Ref
      , requestedState : Text
      , stageRuns : List StageRunView
      }

let guardKind =
      \(guard : S.TransitionGuard) ->
        merge
          { None = "none"
          , EvidenceComplete = \(_ : List S.Ref) -> "evidence-complete"
          , GovernanceDecisionAndReceipt =
              \(_ : { decision : S.Ref, receipt : S.Ref }) ->
                "governance-receipt"
          }
          guard

let stageRunState =
      \(state : S.StageRunState) ->
        merge
          { Pending = "pending"
          , Running = "running"
          , Succeeded = "succeeded"
          , Failed = "failed"
          }
          state

let transitionView =
      \(transition : S.Transition) ->
        { transitionId = transition.id
        , declaredFromState = transition.fromState
        , declaredToState = transition.toState
        , transitionActor = transition.actor
        , guardKind = guardKind transition.guard
        }

let stateKind =
      \(kind : S.LifecycleStateKind) ->
        merge
          { Initial = "initial"
          , Active = "active"
          , Review = "review"
          , TerminalSuccess = "terminal-success"
          , TerminalFailure = "terminal-failure"
          }
          kind

let profileView =
      \(profile : S.WorkProfile) ->
        { profileId = profile.id
        , profileVersion = profile.version
        , states =
            map
              S.LifecycleState
              StateView
              ( \(state : S.LifecycleState) ->
                  { stateId = state.id, stateKind = stateKind state.kind }
              )
              profile.states
        , transitions =
            map S.Transition TransitionView transitionView profile.transitions
        }

let policyView =
      \(policy : S.StagePolicy) ->
        { policyStage = policy.stage
        , predecessors = policy.predecessors
        , completionKind =
            merge
              { Single = "single", JoinAll = \(_ : List S.Ref) -> "join-all" }
              policy.completion
        , joinAll =
            merge
              { Single = [] : List S.Ref
              , JoinAll = \(predecessors : List S.Ref) -> predecessors
              }
              policy.completion
        }

let flowView =
      \(flow : S.ProcessFlow) ->
        { flowId = flow.id
        , flowVersion = flow.version
        , stageIds =
            map S.Stage Text (\(stage : S.Stage) -> stage.id) flow.stages
        , policies = map S.StagePolicy PolicyView policyView flow.policies
        , failurePaths =
            map
              S.FailurePath
              FailureView
              ( \(failure : S.FailurePath) ->
                  { failureId = failure.id
                  , triggeringStates = failure.triggeringStates
                  , preventsStages = failure.preventsStages
                  }
              )
              flow.failurePaths
        , iterations =
            map
              S.IterationPolicy
              IterationView
              ( \(iteration : S.IterationPolicy) ->
                  { iterationId = iteration.id
                  , fromStage = iteration.fromStage
                  , toStage = iteration.toStage
                  , guard = iteration.guard
                  , maxIterations = iteration.maxIterations
                  , onExhaustionStage = iteration.onExhaustionStage
                  }
              )
              flow.iterations
        }

let authorityView =
      \(authority : S.Authority) ->
        { authorityId = authority.id
        , authorityGate = authority.gate
        , decisionMakers = authority.decisionMakers
        }

let decisionView =
      \(decision : S.Decision) ->
        { decisionId = decision.id
        , decisionGate = decision.gate
        , authority = decision.authority
        , decidedBy = decision.decidedBy
        }

let capabilityView =
      \(capability : S.CapabilityContract) ->
        { capabilityId = capability.id
        , requires = capability.requires
        , conflicts = capability.conflicts
        }

let traceView =
      \(trace : S.NeedCapabilityTrace) ->
        { traceId = trace.id
        , need = trace.need
        , tracedCapabilities = trace.capabilities
        }

let transitionAttemptView =
      \(attempt : S.TransitionAttempt) ->
        { profile = attempt.profile
        , transition = attempt.transition
        , attemptedFromState = attempt.fromState
        , attemptedToState = attempt.toState
        , attemptedActor = attempt.actor
        }

let stageRunView =
      \(run : S.StageRun) ->
        { runStage = run.stage, state = stageRunState run.state }

let joinAttemptView =
      \(attempt : S.JoinAttempt) ->
        { flow = attempt.flow
        , requestedStage = attempt.stage
        , requestedState = stageRunState attempt.requestedState
        , stageRuns = map S.StageRun StageRunView stageRunView attempt.stageRuns
        }

let collaborationEntityIds =
      \(c : S.Collaboration) ->
        concat
          Text
          [ [ c.id ]
          , map S.Participant Text (\(x : S.Participant) -> x.id) c.participants
          , map S.Role Text (\(x : S.Role) -> x.id) c.roles
          , concat
              Text
              ( map
                  S.Role
                  (List Text)
                  ( \(x : S.Role) ->
                      map
                        S.NormativeRule
                        Text
                        (\(r : S.NormativeRule) -> r.id)
                        (x.rights # x.duties # x.prohibitions)
                  )
                  c.roles
              )
          , map
              S.RoleAssignment
              Text
              (\(x : S.RoleAssignment) -> x.id)
              c.assignments
          , map S.Delegation Text (\(x : S.Delegation) -> x.id) c.delegations
          , map S.Handoff Text (\(x : S.Handoff) -> x.id) c.handoffs
          , map S.Review Text (\(x : S.Review) -> x.id) c.reviews
          , map
              S.EscalationStep
              Text
              (\(x : S.EscalationStep) -> x.id)
              c.escalations
          ]

let collaborationReferences =
      \(c : S.Collaboration) ->
        concat
          S.Ref
          [ concat
              S.Ref
              ( map
                  S.RoleAssignment
                  (List S.Ref)
                  (\(x : S.RoleAssignment) -> [ x.participant, x.role ])
                  c.assignments
              )
          , concat
              S.Ref
              ( map
                  S.Delegation
                  (List S.Ref)
                  ( \(x : S.Delegation) ->
                        [ x.delegator, x.delegatee, x.accountable ]
                      # x.delegatedRights
                  )
                  c.delegations
              )
          , concat
              S.Ref
              ( map
                  S.Handoff
                  (List S.Ref)
                  (\(x : S.Handoff) -> [ x.sender, x.receiver ] # x.artifacts)
                  c.handoffs
              )
          , concat
              S.Ref
              ( map
                  S.Review
                  (List S.Ref)
                  ( \(x : S.Review) ->
                        [ x.subject, x.performer ]
                      # x.excludedPerformers
                      # x.evidence
                  )
                  c.reviews
              )
          , concat
              S.Ref
              ( map
                  S.EscalationStep
                  (List S.Ref)
                  ( \(x : S.EscalationStep) ->
                      [ x.fromParticipant, x.toParticipant ]
                  )
                  c.escalations
              )
          ]

let parentReferences =
      \(policy : S.ParentPolicy) ->
        merge
          { Root = [] : List S.Ref, ExactlyOne = \(r : S.Ref) -> [ r ] }
          policy

let guardReferences =
      \(guard : S.TransitionGuard) ->
        merge
          { None = [] : List S.Ref
          , EvidenceComplete = \(rs : List S.Ref) -> rs
          , GovernanceDecisionAndReceipt =
              \(x : { decision : S.Ref, receipt : S.Ref }) ->
                [ x.decision, x.receipt ]
          }
          guard

let completionReferences =
      \(completion : S.CompletionPolicy) ->
        merge
          { Single = [] : List S.Ref, JoinAll = \(rs : List S.Ref) -> rs }
          completion

let workEntityIds =
      \(w : S.WorkManagement) ->
        concat
          Text
          [ [ w.id ]
          , map S.WorkProfile Text (\(p : S.WorkProfile) -> p.id) w.profiles
          , concat
              Text
              ( map
                  S.WorkProfile
                  (List Text)
                  ( \(p : S.WorkProfile) ->
                      map
                        S.ItemKind
                        Text
                        (\(x : S.ItemKind) -> x.id)
                        p.itemKinds
                  )
                  w.profiles
              )
          , concat
              Text
              ( map
                  S.WorkProfile
                  (List Text)
                  ( \(p : S.WorkProfile) ->
                      map
                        S.DependencyPolicy
                        Text
                        (\(x : S.DependencyPolicy) -> x.id)
                        p.dependencyPolicies
                  )
                  w.profiles
              )
          , concat
              Text
              ( map
                  S.WorkProfile
                  (List Text)
                  ( \(p : S.WorkProfile) ->
                      map
                        S.LifecycleState
                        Text
                        (\(x : S.LifecycleState) -> x.id)
                        p.states
                  )
                  w.profiles
              )
          , concat
              Text
              ( map
                  S.WorkProfile
                  (List Text)
                  ( \(p : S.WorkProfile) ->
                      map
                        S.Transition
                        Text
                        (\(x : S.Transition) -> x.id)
                        p.transitions
                  )
                  w.profiles
              )
          , map S.ProcessFlow Text (\(f : S.ProcessFlow) -> f.id) w.flows
          , concat
              Text
              ( map
                  S.ProcessFlow
                  (List Text)
                  ( \(f : S.ProcessFlow) ->
                      map S.Stage Text (\(x : S.Stage) -> x.id) f.stages
                  )
                  w.flows
              )
          , concat
              Text
              ( map
                  S.ProcessFlow
                  (List Text)
                  ( \(f : S.ProcessFlow) ->
                      map
                        S.StageAssignment
                        Text
                        (\(x : S.StageAssignment) -> x.id)
                        f.assignments
                  )
                  w.flows
              )
          , concat
              Text
              ( map
                  S.ProcessFlow
                  (List Text)
                  ( \(f : S.ProcessFlow) ->
                      map
                        S.FailurePath
                        Text
                        (\(x : S.FailurePath) -> x.id)
                        f.failurePaths
                  )
                  w.flows
              )
          , concat
              Text
              ( map
                  S.ProcessFlow
                  (List Text)
                  ( \(f : S.ProcessFlow) ->
                      map
                        S.ProcessGuard
                        Text
                        (\(x : S.ProcessGuard) -> x.id)
                        f.guards
                  )
                  w.flows
              )
          , concat
              Text
              ( map
                  S.ProcessFlow
                  (List Text)
                  ( \(f : S.ProcessFlow) ->
                      map
                        S.IterationPolicy
                        Text
                        (\(x : S.IterationPolicy) -> x.id)
                        f.iterations
                  )
                  w.flows
              )
          ]

let workReferences =
      \(w : S.WorkManagement) ->
        concat
          S.Ref
          [ concat
              S.Ref
              ( map
                  S.WorkProfile
                  (List S.Ref)
                  ( \(p : S.WorkProfile) ->
                      concat
                        S.Ref
                        ( map
                            S.ItemKind
                            (List S.Ref)
                            ( \(x : S.ItemKind) ->
                                parentReferences x.parentPolicy
                            )
                            p.itemKinds
                        )
                  )
                  w.profiles
              )
          , concat
              S.Ref
              ( map
                  S.WorkProfile
                  (List S.Ref)
                  ( \(p : S.WorkProfile) ->
                      concat
                        S.Ref
                        ( map
                            S.DependencyPolicy
                            (List S.Ref)
                            ( \(x : S.DependencyPolicy) ->
                                [ x.fromKind, x.toKind ]
                            )
                            p.dependencyPolicies
                        )
                  )
                  w.profiles
              )
          , concat
              S.Ref
              ( map
                  S.WorkProfile
                  (List S.Ref)
                  ( \(p : S.WorkProfile) ->
                      concat
                        S.Ref
                        ( map
                            S.Transition
                            (List S.Ref)
                            ( \(x : S.Transition) ->
                                  [ x.fromState, x.toState, x.actor ]
                                # guardReferences x.guard
                            )
                            p.transitions
                        )
                  )
                  w.profiles
              )
          , concat
              S.Ref
              ( map
                  S.ProcessFlow
                  (List S.Ref)
                  ( \(f : S.ProcessFlow) ->
                      concat
                        S.Ref
                        ( map
                            S.StagePolicy
                            (List S.Ref)
                            ( \(x : S.StagePolicy) ->
                                  [ x.stage ]
                                # x.predecessors
                                # completionReferences x.completion
                            )
                            f.policies
                        )
                  )
                  w.flows
              )
          , concat
              S.Ref
              ( map
                  S.ProcessFlow
                  (List S.Ref)
                  ( \(f : S.ProcessFlow) ->
                      concat
                        S.Ref
                        ( map
                            S.StageAssignment
                            (List S.Ref)
                            ( \(x : S.StageAssignment) ->
                                [ x.stage, x.participant ]
                            )
                            f.assignments
                        )
                  )
                  w.flows
              )
          , concat
              S.Ref
              ( map
                  S.ProcessFlow
                  (List S.Ref)
                  ( \(f : S.ProcessFlow) ->
                      concat
                        S.Ref
                        ( map
                            S.FailurePath
                            (List S.Ref)
                            ( \(x : S.FailurePath) ->
                                x.triggeringStates # x.preventsStages
                            )
                            f.failurePaths
                        )
                  )
                  w.flows
              )
          , concat
              S.Ref
              ( map
                  S.ProcessFlow
                  (List S.Ref)
                  ( \(f : S.ProcessFlow) ->
                      concat
                        S.Ref
                        ( map
                            S.IterationPolicy
                            (List S.Ref)
                            ( \(x : S.IterationPolicy) ->
                                [ x.fromStage
                                , x.toStage
                                , x.guard
                                , x.onExhaustionStage
                                ]
                            )
                            f.iterations
                        )
                  )
                  w.flows
              )
          ]

let governanceEntityIds =
      \(g : S.GovernanceAssurance) ->
        concat
          Text
          [ [ g.id ]
          , map S.Authority Text (\(x : S.Authority) -> x.id) g.authorities
          , map S.Gate Text (\(x : S.Gate) -> x.id) g.gates
          , map S.Decision Text (\(x : S.Decision) -> x.id) g.decisions
          , map S.Waiver Text (\(x : S.Waiver) -> x.id) g.waivers
          , map S.Evidence Text (\(x : S.Evidence) -> x.id) g.evidence
          , map
              S.AssurancePack
              Text
              (\(x : S.AssurancePack) -> x.id)
              g.assurancePacks
          , map S.Receipt Text (\(x : S.Receipt) -> x.id) g.receipts
          ]

let governanceReferences =
      \(g : S.GovernanceAssurance) ->
        concat
          S.Ref
          [ concat
              S.Ref
              ( map
                  S.Authority
                  (List S.Ref)
                  ( \(x : S.Authority) ->
                      [ x.gate ] # x.decisionMakers # x.waiverGrantors
                  )
                  g.authorities
              )
          , concat
              S.Ref
              ( map
                  S.Gate
                  (List S.Ref)
                  (\(x : S.Gate) -> x.requiredEvidence)
                  g.gates
              )
          , concat
              S.Ref
              ( map
                  S.Decision
                  (List S.Ref)
                  (\(x : S.Decision) -> [ x.gate, x.authority, x.decidedBy ])
                  g.decisions
              )
          , concat
              S.Ref
              ( map
                  S.Waiver
                  (List S.Ref)
                  ( \(x : S.Waiver) ->
                      [ x.gate, x.authority, x.grantor, x.waivedEvidence ]
                  )
                  g.waivers
              )
          , concat
              S.Ref
              ( map
                  S.AssurancePack
                  (List S.Ref)
                  ( \(x : S.AssurancePack) ->
                      [ x.gate ] # x.evidence # x.decisions
                  )
                  g.assurancePacks
              )
          , concat
              S.Ref
              ( map
                  S.Receipt
                  (List S.Ref)
                  ( \(x : S.Receipt) ->
                        [ x.gate, x.decision ]
                      # map
                          S.EvidenceDigest
                          S.Ref
                          (\(d : S.EvidenceDigest) -> d.evidence)
                          x.evidenceDigests
                  )
                  g.receipts
              )
          ]

let intentEntityIds =
      \(i : S.ProjectIntent) ->
          [ i.id ]
        # map S.Need Text (\(x : S.Need) -> x.id) i.needs
        # map S.IntentRule Text (\(x : S.IntentRule) -> x.id) i.constraints
        # map S.IntentRule Text (\(x : S.IntentRule) -> x.id) i.antiRequirements
        # map
            S.CognitiveJob
            Text
            (\(x : S.CognitiveJob) -> x.id)
            i.cognitiveJobs

let intentReferences =
      \(i : S.ProjectIntent) ->
        concat
          S.Ref
          [ concat
              S.Ref
              ( map
                  S.Need
                  (List S.Ref)
                  ( \(x : S.Need) ->
                      x.constraints # x.antiRequirements # x.cognitiveJobs
                  )
                  i.needs
              )
          , concat
              S.Ref
              ( map
                  S.CognitiveJob
                  (List S.Ref)
                  (\(x : S.CognitiveJob) -> x.supportsNeeds)
                  i.cognitiveJobs
              )
          ]

let curationEntityIds =
      \(c : S.CurationCapabilities) ->
          [ c.id ]
        # map
            S.CapabilityContract
            Text
            (\(x : S.CapabilityContract) -> x.id)
            c.capabilities
        # map
            S.NeedCapabilityTrace
            Text
            (\(x : S.NeedCapabilityTrace) -> x.id)
            c.traces

let curationReferences =
      \(c : S.CurationCapabilities) ->
          c.selectedCapabilities
        # concat
            S.Ref
            ( map
                S.CapabilityContract
                (List S.Ref)
                (\(x : S.CapabilityContract) -> x.requires # x.conflicts)
                c.capabilities
            )
        # concat
            S.Ref
            ( map
                S.NeedCapabilityTrace
                (List S.Ref)
                (\(x : S.NeedCapabilityTrace) -> [ x.need ] # x.capabilities)
                c.traces
            )

let Owner =
      < CollaborationOwner
      | WorkManagementOwner
      | GovernanceOwner
      | ProjectIntentOwner
      | CurationOwner
      | CompositionOwner
      >

let EntityKind =
      < CollaborationModel
      | Participant
      | Role
      | NormativeRule
      | RoleAssignment
      | Delegation
      | Handoff
      | Review
      | Escalation
      | WorkManagementModel
      | WorkProfile
      | ItemKind
      | DependencyPolicy
      | LifecycleState
      | Transition
      | ProcessFlow
      | Stage
      | StageAssignment
      | FailurePath
      | ProcessGuard
      | IterationPolicy
      | GovernanceModel
      | Authority
      | Gate
      | Decision
      | Waiver
      | Evidence
      | AssurancePack
      | Receipt
      | ProjectIntentModel
      | Need
      | Constraint
      | AntiRequirement
      | CognitiveJob
      | CapabilityCatalogue
      | Capability
      | NeedCapabilityTrace
      | ProjectBundle
      | ProjectEntry
      | HostBinding
      | ExternalPointer
      >

let PublishedEntity =
      { stableId : Text
      , semanticVersion : Text
      , entityKind : EntityKind
      , owningContext : Owner
      }

let ReferencePort =
      { target : S.Ref
      , expectedKind : EntityKind
      , expectedOwner : Owner
      , referencePath : Text
      }

let publish =
      \(owner : Owner) ->
      \(kind : EntityKind) ->
      \(semanticVersion : Text) ->
      \(stableId : Text) ->
        { stableId, semanticVersion, entityKind = kind, owningContext = owner }

let publishMany =
      \(owner : Owner) ->
      \(kind : EntityKind) ->
      \(semanticVersion : Text) ->
      \(ids : List Text) ->
        map Text PublishedEntity (publish owner kind semanticVersion) ids

let ports =
      \(owner : Owner) ->
      \(kind : EntityKind) ->
      \(path : Text) ->
      \(references : List S.Ref) ->
        map
          S.Ref
          ReferencePort
          ( \(target : S.Ref) ->
              { target
              , expectedKind = kind
              , expectedOwner = owner
              , referencePath = path
              }
          )
          references

let collaborationPublished =
      \(c : S.Collaboration) ->
          [ publish
              Owner.CollaborationOwner
              EntityKind.CollaborationModel
              c.version
              c.id
          ]
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Participant
            c.version
            ( map
                S.Participant
                Text
                (\(x : S.Participant) -> x.id)
                c.participants
            )
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Role
            c.version
            (map S.Role Text (\(x : S.Role) -> x.id) c.roles)
        # publishMany
            Owner.CollaborationOwner
            EntityKind.NormativeRule
            c.version
            ( concat
                Text
                ( map
                    S.Role
                    (List Text)
                    ( \(x : S.Role) ->
                        map
                          S.NormativeRule
                          Text
                          (\(r : S.NormativeRule) -> r.id)
                          (x.rights # x.duties # x.prohibitions)
                    )
                    c.roles
                )
            )
        # publishMany
            Owner.CollaborationOwner
            EntityKind.RoleAssignment
            c.version
            ( map
                S.RoleAssignment
                Text
                (\(x : S.RoleAssignment) -> x.id)
                c.assignments
            )
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Delegation
            c.version
            (map S.Delegation Text (\(x : S.Delegation) -> x.id) c.delegations)
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Handoff
            c.version
            (map S.Handoff Text (\(x : S.Handoff) -> x.id) c.handoffs)
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Review
            c.version
            (map S.Review Text (\(x : S.Review) -> x.id) c.reviews)
        # publishMany
            Owner.CollaborationOwner
            EntityKind.Escalation
            c.version
            ( map
                S.EscalationStep
                Text
                (\(x : S.EscalationStep) -> x.id)
                c.escalations
            )

let collaborationLocalReferences =
      \(c : S.Collaboration) ->
        concat
          ReferencePort
          [ concat
              ReferencePort
              ( map
                  S.RoleAssignment
                  (List ReferencePort)
                  ( \(x : S.RoleAssignment) ->
                        ports
                          Owner.CollaborationOwner
                          EntityKind.Participant
                          "collaboration.assignments.participant"
                          [ x.participant ]
                      # ports
                          Owner.CollaborationOwner
                          EntityKind.Role
                          "collaboration.assignments.role"
                          [ x.role ]
                  )
                  c.assignments
              )
          , concat
              ReferencePort
              ( map
                  S.Delegation
                  (List ReferencePort)
                  ( \(x : S.Delegation) ->
                        ports
                          Owner.CollaborationOwner
                          EntityKind.Participant
                          "collaboration.delegations.participants"
                          [ x.delegator, x.delegatee, x.accountable ]
                      # ports
                          Owner.CollaborationOwner
                          EntityKind.NormativeRule
                          "collaboration.delegations.delegatedRights"
                          x.delegatedRights
                  )
                  c.delegations
              )
          , concat
              ReferencePort
              ( map
                  S.Handoff
                  (List ReferencePort)
                  ( \(x : S.Handoff) ->
                        ports
                          Owner.CollaborationOwner
                          EntityKind.Participant
                          "collaboration.handoffs.sender"
                          [ x.sender ]
                      # ports
                          Owner.CollaborationOwner
                          EntityKind.Participant
                          "collaboration.handoffs.receiver"
                          [ x.receiver ]
                  )
                  c.handoffs
              )
          , concat
              ReferencePort
              ( map
                  S.Review
                  (List ReferencePort)
                  ( \(x : S.Review) ->
                      ports
                        Owner.CollaborationOwner
                        EntityKind.Participant
                        "collaboration.reviews.performer"
                        ([ x.performer ] # x.excludedPerformers)
                  )
                  c.reviews
              )
          , concat
              ReferencePort
              ( map
                  S.EscalationStep
                  (List ReferencePort)
                  ( \(x : S.EscalationStep) ->
                      ports
                        Owner.CollaborationOwner
                        EntityKind.Participant
                        "collaboration.escalations.participants"
                        [ x.fromParticipant, x.toParticipant ]
                  )
                  c.escalations
              )
          ]

let workPublished =
      \(w : S.WorkManagement) ->
          concat
            PublishedEntity
            ( map
                S.WorkProfile
                (List PublishedEntity)
                ( \(p : S.WorkProfile) ->
                      [ publish
                          Owner.WorkManagementOwner
                          EntityKind.WorkProfile
                          p.version
                          p.id
                      ]
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.ItemKind
                        p.version
                        ( map
                            S.ItemKind
                            Text
                            (\(x : S.ItemKind) -> x.id)
                            p.itemKinds
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.DependencyPolicy
                        p.version
                        ( map
                            S.DependencyPolicy
                            Text
                            (\(x : S.DependencyPolicy) -> x.id)
                            p.dependencyPolicies
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.LifecycleState
                        p.version
                        ( map
                            S.LifecycleState
                            Text
                            (\(x : S.LifecycleState) -> x.id)
                            p.states
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.Transition
                        p.version
                        ( map
                            S.Transition
                            Text
                            (\(x : S.Transition) -> x.id)
                            p.transitions
                        )
                )
                w.profiles
            )
        # concat
            PublishedEntity
            ( map
                S.ProcessFlow
                (List PublishedEntity)
                ( \(f : S.ProcessFlow) ->
                      [ publish
                          Owner.WorkManagementOwner
                          EntityKind.ProcessFlow
                          f.version
                          f.id
                      ]
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.Stage
                        f.version
                        (map S.Stage Text (\(x : S.Stage) -> x.id) f.stages)
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.StageAssignment
                        f.version
                        ( map
                            S.StageAssignment
                            Text
                            (\(x : S.StageAssignment) -> x.id)
                            f.assignments
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.FailurePath
                        f.version
                        ( map
                            S.FailurePath
                            Text
                            (\(x : S.FailurePath) -> x.id)
                            f.failurePaths
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.ProcessGuard
                        f.version
                        ( map
                            S.ProcessGuard
                            Text
                            (\(x : S.ProcessGuard) -> x.id)
                            f.guards
                        )
                    # publishMany
                        Owner.WorkManagementOwner
                        EntityKind.IterationPolicy
                        f.version
                        ( map
                            S.IterationPolicy
                            Text
                            (\(x : S.IterationPolicy) -> x.id)
                            f.iterations
                        )
                )
                w.flows
            )

let transitionGuardCrossReferences =
      \(guard : S.TransitionGuard) ->
        merge
          { None = [] : List ReferencePort
          , EvidenceComplete =
              \(evidence : List S.Ref) ->
                ports
                  Owner.GovernanceOwner
                  EntityKind.Evidence
                  "workManagement.transitions.guard.evidence"
                  evidence
          , GovernanceDecisionAndReceipt =
              \(x : { decision : S.Ref, receipt : S.Ref }) ->
                  ports
                    Owner.GovernanceOwner
                    EntityKind.Decision
                    "workManagement.transitions.guard.decision"
                    [ x.decision ]
                # ports
                    Owner.GovernanceOwner
                    EntityKind.Receipt
                    "workManagement.transitions.guard.receipt"
                    [ x.receipt ]
          }
          guard

let workLocalReferences =
      \(w : S.WorkManagement) ->
        concat
          ReferencePort
          [ concat
              ReferencePort
              ( map
                  S.WorkProfile
                  (List ReferencePort)
                  ( \(p : S.WorkProfile) ->
                        concat
                          ReferencePort
                          ( map
                              S.ItemKind
                              (List ReferencePort)
                              ( \(x : S.ItemKind) ->
                                  ports
                                    Owner.WorkManagementOwner
                                    EntityKind.ItemKind
                                    "workManagement.itemKinds.parentPolicy"
                                    (parentReferences x.parentPolicy)
                              )
                              p.itemKinds
                          )
                      # concat
                          ReferencePort
                          ( map
                              S.DependencyPolicy
                              (List ReferencePort)
                              ( \(x : S.DependencyPolicy) ->
                                  ports
                                    Owner.WorkManagementOwner
                                    EntityKind.ItemKind
                                    "workManagement.dependencyPolicies.itemKinds"
                                    [ x.fromKind, x.toKind ]
                              )
                              p.dependencyPolicies
                          )
                      # concat
                          ReferencePort
                          ( map
                              S.Transition
                              (List ReferencePort)
                              ( \(x : S.Transition) ->
                                  ports
                                    Owner.WorkManagementOwner
                                    EntityKind.LifecycleState
                                    "workManagement.transitions.states"
                                    [ x.fromState, x.toState ]
                              )
                              p.transitions
                          )
                  )
                  w.profiles
              )
          , concat
              ReferencePort
              ( map
                  S.ProcessFlow
                  (List ReferencePort)
                  ( \(f : S.ProcessFlow) ->
                        concat
                          ReferencePort
                          ( map
                              S.StagePolicy
                              (List ReferencePort)
                              ( \(x : S.StagePolicy) ->
                                  ports
                                    Owner.WorkManagementOwner
                                    EntityKind.Stage
                                    "workManagement.flows.policies.stages"
                                    (   [ x.stage ]
                                      # x.predecessors
                                      # completionReferences x.completion
                                    )
                              )
                              f.policies
                          )
                      # concat
                          ReferencePort
                          ( map
                              S.StageAssignment
                              (List ReferencePort)
                              ( \(x : S.StageAssignment) ->
                                  ports
                                    Owner.WorkManagementOwner
                                    EntityKind.Stage
                                    "workManagement.flows.assignments.stage"
                                    [ x.stage ]
                              )
                              f.assignments
                          )
                      # concat
                          ReferencePort
                          ( map
                              S.FailurePath
                              (List ReferencePort)
                              ( \(x : S.FailurePath) ->
                                    ports
                                      Owner.WorkManagementOwner
                                      EntityKind.LifecycleState
                                      "workManagement.flows.failurePaths.triggeringStates"
                                      x.triggeringStates
                                  # ports
                                      Owner.WorkManagementOwner
                                      EntityKind.Stage
                                      "workManagement.flows.failurePaths.preventsStages"
                                      x.preventsStages
                              )
                              f.failurePaths
                          )
                      # concat
                          ReferencePort
                          ( map
                              S.IterationPolicy
                              (List ReferencePort)
                              ( \(x : S.IterationPolicy) ->
                                    ports
                                      Owner.WorkManagementOwner
                                      EntityKind.Stage
                                      "workManagement.flows.iterations.stages"
                                      [ x.fromStage
                                      , x.toStage
                                      , x.onExhaustionStage
                                      ]
                                  # ports
                                      Owner.WorkManagementOwner
                                      EntityKind.ProcessGuard
                                      "workManagement.flows.iterations.guard"
                                      [ x.guard ]
                              )
                              f.iterations
                          )
                  )
                  w.flows
              )
          ]

let workCrossReferences =
      \(w : S.WorkManagement) ->
          concat
            ReferencePort
            ( map
                S.WorkProfile
                (List ReferencePort)
                ( \(p : S.WorkProfile) ->
                    concat
                      ReferencePort
                      ( map
                          S.Transition
                          (List ReferencePort)
                          ( \(x : S.Transition) ->
                                ports
                                  Owner.CollaborationOwner
                                  EntityKind.Participant
                                  "workManagement.transitions.actor"
                                  [ x.actor ]
                              # transitionGuardCrossReferences x.guard
                          )
                          p.transitions
                      )
                )
                w.profiles
            )
        # concat
            ReferencePort
            ( map
                S.ProcessFlow
                (List ReferencePort)
                ( \(f : S.ProcessFlow) ->
                    concat
                      ReferencePort
                      ( map
                          S.StageAssignment
                          (List ReferencePort)
                          ( \(x : S.StageAssignment) ->
                              ports
                                Owner.CollaborationOwner
                                EntityKind.Participant
                                "workManagement.flows.assignments.participant"
                                [ x.participant ]
                          )
                          f.assignments
                      )
                )
                w.flows
            )

let governancePublished =
      \(g : S.GovernanceAssurance) ->
          [ publish
              Owner.GovernanceOwner
              EntityKind.GovernanceModel
              g.version
              g.id
          ]
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Authority
            g.version
            (map S.Authority Text (\(x : S.Authority) -> x.id) g.authorities)
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Gate
            g.version
            (map S.Gate Text (\(x : S.Gate) -> x.id) g.gates)
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Decision
            g.version
            (map S.Decision Text (\(x : S.Decision) -> x.id) g.decisions)
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Waiver
            g.version
            (map S.Waiver Text (\(x : S.Waiver) -> x.id) g.waivers)
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Evidence
            g.version
            (map S.Evidence Text (\(x : S.Evidence) -> x.id) g.evidence)
        # publishMany
            Owner.GovernanceOwner
            EntityKind.AssurancePack
            g.version
            ( map
                S.AssurancePack
                Text
                (\(x : S.AssurancePack) -> x.id)
                g.assurancePacks
            )
        # publishMany
            Owner.GovernanceOwner
            EntityKind.Receipt
            g.version
            (map S.Receipt Text (\(x : S.Receipt) -> x.id) g.receipts)

let governanceLocalReferences =
      \(g : S.GovernanceAssurance) ->
        concat
          ReferencePort
          [ concat
              ReferencePort
              ( map
                  S.Authority
                  (List ReferencePort)
                  ( \(x : S.Authority) ->
                      ports
                        Owner.GovernanceOwner
                        EntityKind.Gate
                        "governance.authorities.gate"
                        [ x.gate ]
                  )
                  g.authorities
              )
          , concat
              ReferencePort
              ( map
                  S.Gate
                  (List ReferencePort)
                  ( \(x : S.Gate) ->
                      ports
                        Owner.GovernanceOwner
                        EntityKind.Evidence
                        "governance.gates.requiredEvidence"
                        x.requiredEvidence
                  )
                  g.gates
              )
          , concat
              ReferencePort
              ( map
                  S.Decision
                  (List ReferencePort)
                  ( \(x : S.Decision) ->
                        ports
                          Owner.GovernanceOwner
                          EntityKind.Gate
                          "governance.decisions.gate"
                          [ x.gate ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Authority
                          "governance.decisions.authority"
                          [ x.authority ]
                  )
                  g.decisions
              )
          , concat
              ReferencePort
              ( map
                  S.Waiver
                  (List ReferencePort)
                  ( \(x : S.Waiver) ->
                        ports
                          Owner.GovernanceOwner
                          EntityKind.Gate
                          "governance.waivers.gate"
                          [ x.gate ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Authority
                          "governance.waivers.authority"
                          [ x.authority ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Evidence
                          "governance.waivers.waivedEvidence"
                          [ x.waivedEvidence ]
                  )
                  g.waivers
              )
          , concat
              ReferencePort
              ( map
                  S.AssurancePack
                  (List ReferencePort)
                  ( \(x : S.AssurancePack) ->
                        ports
                          Owner.GovernanceOwner
                          EntityKind.Gate
                          "governance.assurancePacks.gate"
                          [ x.gate ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Evidence
                          "governance.assurancePacks.evidence"
                          x.evidence
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Decision
                          "governance.assurancePacks.decisions"
                          x.decisions
                  )
                  g.assurancePacks
              )
          , concat
              ReferencePort
              ( map
                  S.Receipt
                  (List ReferencePort)
                  ( \(x : S.Receipt) ->
                        ports
                          Owner.GovernanceOwner
                          EntityKind.Gate
                          "governance.receipts.gate"
                          [ x.gate ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Decision
                          "governance.receipts.decision"
                          [ x.decision ]
                      # ports
                          Owner.GovernanceOwner
                          EntityKind.Evidence
                          "governance.receipts.evidenceDigests"
                          ( map
                              S.EvidenceDigest
                              S.Ref
                              (\(d : S.EvidenceDigest) -> d.evidence)
                              x.evidenceDigests
                          )
                  )
                  g.receipts
              )
          ]

let governanceCrossReferences =
      \(g : S.GovernanceAssurance) ->
        concat
          ReferencePort
          [ concat
              ReferencePort
              ( map
                  S.Authority
                  (List ReferencePort)
                  ( \(x : S.Authority) ->
                      ports
                        Owner.CollaborationOwner
                        EntityKind.Participant
                        "governance.authorities.participants"
                        (x.decisionMakers # x.waiverGrantors)
                  )
                  g.authorities
              )
          , concat
              ReferencePort
              ( map
                  S.Decision
                  (List ReferencePort)
                  ( \(x : S.Decision) ->
                      ports
                        Owner.CollaborationOwner
                        EntityKind.Participant
                        "governance.decisions.decidedBy"
                        [ x.decidedBy ]
                  )
                  g.decisions
              )
          , concat
              ReferencePort
              ( map
                  S.Waiver
                  (List ReferencePort)
                  ( \(x : S.Waiver) ->
                      ports
                        Owner.CollaborationOwner
                        EntityKind.Participant
                        "governance.waivers.grantor"
                        [ x.grantor ]
                  )
                  g.waivers
              )
          ]

let intentPublished =
      \(i : S.ProjectIntent) ->
          [ publish
              Owner.ProjectIntentOwner
              EntityKind.ProjectIntentModel
              i.version
              i.id
          ]
        # publishMany
            Owner.ProjectIntentOwner
            EntityKind.Need
            i.version
            (map S.Need Text (\(x : S.Need) -> x.id) i.needs)
        # publishMany
            Owner.ProjectIntentOwner
            EntityKind.Constraint
            i.version
            (map S.IntentRule Text (\(x : S.IntentRule) -> x.id) i.constraints)
        # publishMany
            Owner.ProjectIntentOwner
            EntityKind.AntiRequirement
            i.version
            ( map
                S.IntentRule
                Text
                (\(x : S.IntentRule) -> x.id)
                i.antiRequirements
            )
        # publishMany
            Owner.ProjectIntentOwner
            EntityKind.CognitiveJob
            i.version
            ( map
                S.CognitiveJob
                Text
                (\(x : S.CognitiveJob) -> x.id)
                i.cognitiveJobs
            )

let intentLocalReferences =
      \(i : S.ProjectIntent) ->
          concat
            ReferencePort
            ( map
                S.Need
                (List ReferencePort)
                ( \(x : S.Need) ->
                      ports
                        Owner.ProjectIntentOwner
                        EntityKind.Constraint
                        "projectIntent.needs.constraints"
                        x.constraints
                    # ports
                        Owner.ProjectIntentOwner
                        EntityKind.AntiRequirement
                        "projectIntent.needs.antiRequirements"
                        x.antiRequirements
                    # ports
                        Owner.ProjectIntentOwner
                        EntityKind.CognitiveJob
                        "projectIntent.needs.cognitiveJobs"
                        x.cognitiveJobs
                )
                i.needs
            )
        # concat
            ReferencePort
            ( map
                S.CognitiveJob
                (List ReferencePort)
                ( \(x : S.CognitiveJob) ->
                    ports
                      Owner.ProjectIntentOwner
                      EntityKind.Need
                      "projectIntent.cognitiveJobs.supportsNeeds"
                      x.supportsNeeds
                )
                i.cognitiveJobs
            )

let curationPublished =
      \(c : S.CurationCapabilities) ->
          [ publish
              Owner.CurationOwner
              EntityKind.CapabilityCatalogue
              c.version
              c.id
          ]
        # publishMany
            Owner.CurationOwner
            EntityKind.Capability
            c.version
            ( map
                S.CapabilityContract
                Text
                (\(x : S.CapabilityContract) -> x.id)
                c.capabilities
            )
        # publishMany
            Owner.CurationOwner
            EntityKind.NeedCapabilityTrace
            c.version
            ( map
                S.NeedCapabilityTrace
                Text
                (\(x : S.NeedCapabilityTrace) -> x.id)
                c.traces
            )

let curationLocalReferences =
      \(c : S.CurationCapabilities) ->
          ports
            Owner.CurationOwner
            EntityKind.Capability
            "curation.selectedCapabilities"
            c.selectedCapabilities
        # concat
            ReferencePort
            ( map
                S.CapabilityContract
                (List ReferencePort)
                ( \(x : S.CapabilityContract) ->
                      ports
                        Owner.CurationOwner
                        EntityKind.Capability
                        "curation.capabilities.requires"
                        x.requires
                    # ports
                        Owner.CurationOwner
                        EntityKind.Capability
                        "curation.capabilities.conflicts"
                        x.conflicts
                )
                c.capabilities
            )
        # concat
            ReferencePort
            ( map
                S.NeedCapabilityTrace
                (List ReferencePort)
                ( \(x : S.NeedCapabilityTrace) ->
                    ports
                      Owner.CurationOwner
                      EntityKind.Capability
                      "curation.traces.capabilities"
                      x.capabilities
                )
                c.traces
            )

let curationCrossReferences =
      \(c : S.CurationCapabilities) ->
        concat
          ReferencePort
          ( map
              S.NeedCapabilityTrace
              (List ReferencePort)
              ( \(x : S.NeedCapabilityTrace) ->
                  ports
                    Owner.ProjectIntentOwner
                    EntityKind.Need
                    "curation.traces.need"
                    [ x.need ]
              )
              c.traces
          )

let compositionPublished =
      \(d : S.ProjectDeclaration) ->
          [ publish
              Owner.CompositionOwner
              EntityKind.ProjectBundle
              d.bundle.version
              d.bundle.id
          , publish
              Owner.CompositionOwner
              EntityKind.ProjectEntry
              d.entry.version
              d.entry.id
          ]
        # publishMany
            Owner.CompositionOwner
            EntityKind.HostBinding
            d.entry.version
            ( map
                S.HostBinding
                Text
                (\(x : S.HostBinding) -> x.id)
                d.entry.hostBindings
            )
        # publishMany
            Owner.CompositionOwner
            EntityKind.ExternalPointer
            d.entry.version
            ( map
                S.ExternalPointer
                Text
                (\(x : S.ExternalPointer) -> x.id)
                d.entry.currentPointers
            )

let pinKind =
      \(context : S.BoundedContext) ->
        merge
          { Collaboration = EntityKind.CollaborationModel
          , WorkManagement = EntityKind.WorkProfile
          , GovernanceAssurance = EntityKind.GovernanceModel
          , ProjectIntent = EntityKind.ProjectIntentModel
          , CurationCapabilities = EntityKind.CapabilityCatalogue
          }
          context

let pinOwner =
      \(context : S.BoundedContext) ->
        merge
          { Collaboration = Owner.CollaborationOwner
          , WorkManagement = Owner.WorkManagementOwner
          , GovernanceAssurance = Owner.GovernanceOwner
          , ProjectIntent = Owner.ProjectIntentOwner
          , CurationCapabilities = Owner.CurationOwner
          }
          context

let compositionLocalReferences =
      \(d : S.ProjectDeclaration) ->
        ports
          Owner.CompositionOwner
          EntityKind.ProjectBundle
          "projectEntry.bundle"
          [ d.entry.bundle ]

let compositionCrossReferences =
      \(d : S.ProjectDeclaration) ->
          map
            S.ModelPin
            ReferencePort
            ( \(pin : S.ModelPin) ->
                { target = pin.model
                , expectedKind = pinKind pin.context
                , expectedOwner = pinOwner pin.context
                , referencePath = "projectBundle.pins.model"
                }
            )
            d.bundle.pins
        # ports
            Owner.CollaborationOwner
            EntityKind.CollaborationModel
            "projectEntry.collaborationModel"
            [ d.entry.collaborationModel ]
        # ports
            Owner.WorkManagementOwner
            EntityKind.WorkProfile
            "projectEntry.workProfile"
            [ d.entry.workProfile ]
        # ports
            Owner.GovernanceOwner
            EntityKind.GovernanceModel
            "projectEntry.governanceModel"
            [ d.entry.governanceModel ]
        # ports
            Owner.ProjectIntentOwner
            EntityKind.ProjectIntentModel
            "projectEntry.projectIntent"
            [ d.entry.projectIntent ]
        # ports
            Owner.CurationOwner
            EntityKind.CapabilityCatalogue
            "projectEntry.capabilityCatalogue"
            [ d.entry.capabilityCatalogue ]
        # ports
            Owner.CollaborationOwner
            EntityKind.Participant
            "projectEntry.projectAuthority"
            [ d.entry.projectAuthority ]

in  \(fixture : S.ValidationCase) ->
      { caseId = fixture.id
      , collaborationPublished =
          collaborationPublished fixture.declaration.collaboration
      , collaborationLocalReferences =
          collaborationLocalReferences fixture.declaration.collaboration
      , workPublished = workPublished fixture.declaration.workManagement
      , workLocalReferences =
          workLocalReferences fixture.declaration.workManagement
      , governancePublished =
          governancePublished fixture.declaration.governanceAssurance
      , governanceLocalReferences =
          governanceLocalReferences fixture.declaration.governanceAssurance
      , intentPublished = intentPublished fixture.declaration.projectIntent
      , intentLocalReferences =
          intentLocalReferences fixture.declaration.projectIntent
      , curationPublished =
          curationPublished fixture.declaration.curationCapabilities
      , curationLocalReferences =
          curationLocalReferences fixture.declaration.curationCapabilities
      , compositionPublished = compositionPublished fixture.declaration
      , compositionLocalReferences =
          compositionLocalReferences fixture.declaration
      , crossContextReferences =
            workCrossReferences fixture.declaration.workManagement
          # governanceCrossReferences fixture.declaration.governanceAssurance
          # curationCrossReferences fixture.declaration.curationCapabilities
          # compositionCrossReferences fixture.declaration
      , entryWorkProfile = fixture.declaration.entry.workProfile
      , delegations =
          map
            S.Delegation
            DelegationView
            ( \(delegation : S.Delegation) ->
                { delegator = delegation.delegator
                , delegatee = delegation.delegatee
                , accountable = delegation.accountable
                }
            )
            fixture.declaration.collaboration.delegations
      , profiles =
          map
            S.WorkProfile
            ProfileView
            profileView
            fixture.declaration.workManagement.profiles
      , flows =
          map
            S.ProcessFlow
            FlowView
            flowView
            fixture.declaration.workManagement.flows
      , authorities =
          map
            S.Authority
            AuthorityView
            authorityView
            fixture.declaration.governanceAssurance.authorities
      , decisions =
          map
            S.Decision
            DecisionView
            decisionView
            fixture.declaration.governanceAssurance.decisions
      , capabilityContracts =
          map
            S.CapabilityContract
            CapabilityView
            capabilityView
            fixture.declaration.curationCapabilities.capabilities
      , selectedCapabilities =
          fixture.declaration.curationCapabilities.selectedCapabilities
      , traces =
          map
            S.NeedCapabilityTrace
            TraceView
            traceView
            fixture.declaration.curationCapabilities.traces
      , transitionAttempts =
          merge
            { None = [] : List TransitionAttemptView
            , Some =
                \(attempt : S.TransitionAttempt) ->
                  [ transitionAttemptView attempt ]
            }
            fixture.probe.transitionAttempt
      , joinAttempts =
          merge
            { None = [] : List JoinAttemptView
            , Some = \(attempt : S.JoinAttempt) -> [ joinAttemptView attempt ]
            }
            fixture.probe.joinAttempt
      }
