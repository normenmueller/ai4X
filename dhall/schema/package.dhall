let Ref = { id : Text, version : Text }

let SourceReference = { path : Text, digest : Text, provenanceDigest : Text }

let BoundedContext =
      < Collaboration
      | WorkManagement
      | GovernanceAssurance
      | ProjectIntent
      | CurationCapabilities
      >

let ModelPin =
      { context : BoundedContext
      , model : Ref
      , digest : Text
      , source : SourceReference
      }

let ProjectBundle = { id : Text, version : Text, pins : List ModelPin }

let HostBinding =
      { id : Text, adapter : Text, purpose : Text, externalId : Text }

let ExternalPointer = { id : Text, kind : Text, target : Text }

let ProjectEntry =
      { id : Text
      , version : Text
      , bundle : Ref
      , collaborationModel : Ref
      , workProfile : Ref
      , governanceModel : Ref
      , projectIntent : Ref
      , capabilityCatalogue : Ref
      , projectAuthority : Ref
      , hostBindings : List HostBinding
      , currentPointers : List ExternalPointer
      }

let ParticipantKind = < Human | Agent >

let Participant = { id : Text, kind : ParticipantKind }

let NormativeRule = { id : Text, statement : Text }

let Role =
      { id : Text
      , rights : List NormativeRule
      , duties : List NormativeRule
      , prohibitions : List NormativeRule
      }

let RoleAssignment = { id : Text, participant : Ref, role : Ref }

let Delegation =
      { id : Text
      , delegator : Ref
      , delegatee : Ref
      , accountable : Ref
      , delegatedRights : List Ref
      }

let Handoff = { id : Text, sender : Ref, receiver : Ref, artifacts : List Ref }

let Review =
      { id : Text
      , subject : Ref
      , performer : Ref
      , excludedPerformers : List Ref
      , evidence : List Ref
      }

let EscalationStep =
      { id : Text
      , fromParticipant : Ref
      , toParticipant : Ref
      , afterRemediationCycles : Natural
      }

let Collaboration =
      { id : Text
      , version : Text
      , participants : List Participant
      , roles : List Role
      , assignments : List RoleAssignment
      , delegations : List Delegation
      , handoffs : List Handoff
      , reviews : List Review
      , escalations : List EscalationStep
      }

let ParentPolicy = < Root | ExactlyOne : Ref >

let ItemKind = { id : Text, name : Text, parentPolicy : ParentPolicy }

let DependencyPolicy =
      { id : Text, fromKind : Ref, toKind : Ref, acyclic : Bool }

let LifecycleStateKind =
      < Initial | Active | Review | TerminalSuccess | TerminalFailure >

let LifecycleState = { id : Text, name : Text, kind : LifecycleStateKind }

let TransitionGuard =
      < None
      | EvidenceComplete : List Ref
      | GovernanceDecisionAndReceipt : { decision : Ref, receipt : Ref }
      >

let Transition =
      { id : Text
      , fromState : Ref
      , toState : Ref
      , actor : Ref
      , guard : TransitionGuard
      }

let WorkProfile =
      { id : Text
      , version : Text
      , itemKinds : List ItemKind
      , dependencyPolicies : List DependencyPolicy
      , states : List LifecycleState
      , transitions : List Transition
      }

let Stage = { id : Text, name : Text }

let CompletionPolicy = < Single | JoinAll : List Ref >

let StagePolicy =
      { stage : Ref, predecessors : List Ref, completion : CompletionPolicy }

let StageAssignment = { id : Text, stage : Ref, participant : Ref }

let FailurePath =
      { id : Text, triggeringStates : List Ref, preventsStages : List Ref }

let IterationPolicy =
      { id : Text
      , fromStage : Ref
      , toStage : Ref
      , guard : Ref
      , maxIterations : Natural
      , onExhaustionStage : Ref
      }

let ProcessGuard = { id : Text, statement : Text }

let ProcessFlow =
      { id : Text
      , version : Text
      , stages : List Stage
      , policies : List StagePolicy
      , assignments : List StageAssignment
      , failurePaths : List FailurePath
      , guards : List ProcessGuard
      , iterations : List IterationPolicy
      }

let WorkManagement =
      { id : Text
      , version : Text
      , profiles : List WorkProfile
      , flows : List ProcessFlow
      }

let Authority =
      { id : Text
      , gate : Ref
      , decisionMakers : List Ref
      , waiverGrantors : List Ref
      }

let Gate = { id : Text, requiredEvidence : List Ref }

let DecisionOutcome = < Pass | Blocked >

let Decision =
      { id : Text
      , gate : Ref
      , authority : Ref
      , decidedBy : Ref
      , outcome : DecisionOutcome
      , rationale : Text
      }

let Waiver =
      { id : Text
      , gate : Ref
      , authority : Ref
      , grantor : Ref
      , rationale : Text
      , expiresWhen : Text
      , waivedEvidence : Ref
      }

let Evidence = { id : Text, kind : Text, digest : Text }

let EvidenceDigest = { evidence : Ref, digest : Text }

let AssurancePack =
      { id : Text, gate : Ref, evidence : List Ref, decisions : List Ref }

let Receipt =
      { id : Text
      , gate : Ref
      , decision : Ref
      , evidenceDigests : List EvidenceDigest
      }

let GovernanceAssurance =
      { id : Text
      , version : Text
      , authorities : List Authority
      , gates : List Gate
      , decisions : List Decision
      , waivers : List Waiver
      , evidence : List Evidence
      , assurancePacks : List AssurancePack
      , receipts : List Receipt
      }

let IntentRule = { id : Text, statement : Text }

let Need =
      { id : Text
      , statement : Text
      , constraints : List Ref
      , antiRequirements : List Ref
      , cognitiveJobs : List Ref
      }

let CognitiveJob =
      { id : Text
      , statement : Text
      , supportsNeeds : List Ref
      , uncertaintyPolicy : Text
      }

let ProjectIntent =
      { id : Text
      , version : Text
      , needs : List Need
      , constraints : List IntentRule
      , antiRequirements : List IntentRule
      , cognitiveJobs : List CognitiveJob
      }

let CapabilityMode = < Deterministic | Cognitive >

let CapabilityContract =
      { id : Text
      , mode : CapabilityMode
      , statement : Text
      , requires : List Ref
      , conflicts : List Ref
      }

let NeedCapabilityTrace =
      { id : Text, need : Ref, capabilities : List Ref, rationale : Text }

let CurationCapabilities =
      { id : Text
      , version : Text
      , capabilities : List CapabilityContract
      , selectedCapabilities : List Ref
      , traces : List NeedCapabilityTrace
      }

let ProjectDeclaration =
      { bundle : ProjectBundle
      , entry : ProjectEntry
      , collaboration : Collaboration
      , workManagement : WorkManagement
      , governanceAssurance : GovernanceAssurance
      , projectIntent : ProjectIntent
      , curationCapabilities : CurationCapabilities
      }

let StageRunState = < Pending | Running | Succeeded | Failed >

let StageRun = { stage : Ref, state : StageRunState }

let TransitionAttempt =
      { profile : Ref
      , transition : Ref
      , fromState : Ref
      , toState : Ref
      , actor : Ref
      , evidence : List Ref
      , decisions : List Ref
      , receipts : List Ref
      }

let JoinAttempt =
      { flow : Ref
      , stage : Ref
      , requestedState : StageRunState
      , stageRuns : List StageRun
      }

let ValidationProbe =
      { transitionAttempt : Optional TransitionAttempt
      , joinAttempt : Optional JoinAttempt
      }

let ValidationCase =
      { id : Text
      , declaration : ProjectDeclaration
      , probe : ValidationProbe
      , expectedErrorCodes : List Text
      , expectedValidator : Text
      }

in  { Ref
    , SourceReference
    , BoundedContext
    , ModelPin
    , ProjectBundle
    , HostBinding
    , ExternalPointer
    , ProjectEntry
    , ParticipantKind
    , Participant
    , NormativeRule
    , Role
    , RoleAssignment
    , Delegation
    , Handoff
    , Review
    , EscalationStep
    , Collaboration
    , ParentPolicy
    , ItemKind
    , DependencyPolicy
    , LifecycleState
    , LifecycleStateKind
    , TransitionGuard
    , Transition
    , WorkProfile
    , Stage
    , CompletionPolicy
    , StagePolicy
    , StageAssignment
    , FailurePath
    , IterationPolicy
    , ProcessGuard
    , ProcessFlow
    , WorkManagement
    , Authority
    , Gate
    , DecisionOutcome
    , Decision
    , Waiver
    , Evidence
    , EvidenceDigest
    , AssurancePack
    , Receipt
    , GovernanceAssurance
    , IntentRule
    , Need
    , CognitiveJob
    , ProjectIntent
    , CapabilityMode
    , CapabilityContract
    , NeedCapabilityTrace
    , CurationCapabilities
    , ProjectDeclaration
    , StageRunState
    , StageRun
    , TransitionAttempt
    , JoinAttempt
    , ValidationProbe
    , ValidationCase
    }
