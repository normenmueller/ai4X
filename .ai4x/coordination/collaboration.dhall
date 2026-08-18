let AboveOneApproval = { decisionReference : Text, approvedMaximum : Natural }

let FullHistoryApproval =
      { decisionReference : Text, issue : Text, task : Text, rationale : Text }

in  { schemaVersion = "ai4x.collaboration/v1"
    , assignmentClassification = "assignment-effects-and-granted-authority"
    , writeCapableAssignmentLimit =
      { maximum = 1, aboveOneApproval = None AboveOneApproval }
    , zeroLimitBehavior = "block-delegated-write-capable-spawn-only"
    , observeAllDelegatedAgents = True
    , collaborationTopologyCapped = False
    , contextInheritance =
      { defaultMode = "none"
      , boundedPositiveRequiresRationale = True
      , fullHistoryRequiresExactPoDecision = True
      , fullHistoryApproval = None FullHistoryApproval
      }
    }
