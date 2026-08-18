let collaboration = ../../../.ai4x/coordination/collaboration.dhall

let resources = ../../../.ai4x/operations/session-hygiene.dhall

let approval =
      merge
        { Some =
            \ ( value
              : { decisionReference : Text, approvedMaximum : Natural }
              ) ->
              "{ \"decisionReference\": \"${value.decisionReference}\", \"approvedMaximum\": ${Natural/show
                                                                                                 value.approvedMaximum} }"
        , None = "null"
        }
        collaboration.writeCapableAssignmentLimit.aboveOneApproval

let bool = \(value : Bool) -> if value then "true" else "false"

in  ''
    {
      "schemaVersion": "ai4x.session-hygiene-projection/v1",
      "authorityStatus": "mechanically-derived-inert-projection",
      "collaboration": {
        "assignmentClassification": "${collaboration.assignmentClassification}",
        "writeCapableAssignmentLimit": {
          "maximum": ${Natural/show
                         collaboration.writeCapableAssignmentLimit.maximum},
          "aboveOneApproval": ${approval}
        },
        "zeroLimitBehavior": "${collaboration.zeroLimitBehavior}",
        "observeAllDelegatedAgents": ${bool
                                         collaboration.observeAllDelegatedAgents},
        "collaborationTopologyCapped": ${bool
                                           collaboration.collaborationTopologyCapped},
        "contextInheritance": {
          "defaultMode": "${collaboration.contextInheritance.defaultMode}",
          "boundedPositiveRequiresRationale": ${bool
                                                  collaboration.contextInheritance.boundedPositiveRequiresRationale},
          "fullHistoryRequiresExactPoDecision": ${bool
                                                    collaboration.contextInheritance.fullHistoryRequiresExactPoDecision}
        }
      },
      "resources": {
        "minimumFreeBytes": ${Natural/show resources.minimumFreeBytes},
        "unexplainedFreeSpaceDecreaseBytes": ${Natural/show
                                                 resources.unexplainedFreeSpaceDecreaseBytes},
        "maximumObservationAgeSeconds": ${Natural/show
                                            resources.maximumObservationAgeSeconds},
        "abnormalSingleRolloutGrowthBytes": ${Natural/show
                                                resources.abnormalSingleRolloutGrowthBytes}
      }
    }
    ''
