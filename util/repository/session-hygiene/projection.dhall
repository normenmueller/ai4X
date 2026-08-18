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

let fullHistoryApproval =
      merge
        { Some =
            \ ( value
              : { decisionReference : Text
                , issue : Text
                , task : Text
                , rationale : Text
                }
              ) ->
              "{ \"decisionReference\": ${Text/show
                                            value.decisionReference}, \"issue\": ${Text/show
                                                                                     value.issue}, \"task\": ${Text/show
                                                                                                                 value.task}, \"rationale\": ${Text/show
                                                                                                                                                 value.rationale} }"
        , None = "null"
        }
        collaboration.contextInheritance.fullHistoryApproval

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
                                                    collaboration.contextInheritance.fullHistoryRequiresExactPoDecision},
          "fullHistoryApproval": ${fullHistoryApproval}
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
