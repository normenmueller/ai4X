module R15.Collaboration
  ( Participant (..)
  , Role (..)
  , Assignment (..)
  , Delegation (..)
  , Handoff (..)
  , Review (..)
  , Escalation (..)
  , CollaborationModel (..)
  , validateCollaboration
  ) where

import Data.List (find)
import R15.Common

data Participant = Participant
  { participantId :: StableId
  , participantName :: String
  }
  deriving (Eq, Show)

data Role = Role
  { roleId :: StableId
  , roleRights :: [String]
  , roleDuties :: [String]
  , roleProhibitions :: [String]
  }
  deriving (Eq, Show)

data Assignment = Assignment
  { assignmentParticipant :: Ref
  , assignmentRole :: Ref
  }
  deriving (Eq, Show)

data Delegation = Delegation
  { delegationFrom :: Ref
  , delegationTo :: Ref
  , delegationRight :: String
  , delegationRetainsAccountability :: Bool
  }
  deriving (Eq, Show)

data Handoff = Handoff
  { handoffId :: StableId
  , handoffSender :: Ref
  , handoffReceiver :: Ref
  , handoffPayloadKinds :: [String]
  }
  deriving (Eq, Show)

data Review = Review
  { reviewId :: StableId
  , reviewPerformer :: Ref
  , reviewSubjectProducer :: Ref
  }
  deriving (Eq, Show)

data Escalation = Escalation
  { escalationInitialTarget :: Ref
  , escalationRepeatedTarget :: Ref
  , escalationAfterRemediationCycles :: Int
  }
  deriving (Eq, Show)

data CollaborationModel = CollaborationModel
  { collaborationId :: StableId
  , collaborationVersion :: Version
  , collaborationSource :: Source
  , collaborationParticipants :: [Participant]
  , collaborationRoles :: [Role]
  , collaborationAssignments :: [Assignment]
  , collaborationDelegation :: Delegation
  , collaborationHandoff :: Handoff
  , collaborationReview :: Review
  , collaborationEscalation :: Escalation
  }
  deriving (Eq, Show)

validateCollaboration :: CollaborationModel -> [ValidationError]
validateCollaboration model =
  concat
    [ concatMap validateAssignment (collaborationAssignments model)
    , validateParticipantRef "delegation.from" (delegationFrom delegation)
    , validateParticipantRef "delegation.to" (delegationTo delegation)
    , validateParticipantRef "handoff.sender" (handoffSender handoff)
    , validateParticipantRef "handoff.receiver" (handoffReceiver handoff)
    , validateParticipantRef "review.performer" (reviewPerformer review)
    , validateParticipantRef "review.subjectProducer" (reviewSubjectProducer review)
    , validateParticipantRef "escalation.initialTarget" (escalationInitialTarget escalation)
    , validateParticipantRef "escalation.repeatedTarget" (escalationRepeatedTarget escalation)
    , validateRefVersion "Collaboration" "delegation.from" (delegationFrom delegation)
    , validateRefVersion "Collaboration" "delegation.to" (delegationTo delegation)
    , validateRefVersion "Collaboration" "handoff.sender" (handoffSender handoff)
    , validateRefVersion "Collaboration" "handoff.receiver" (handoffReceiver handoff)
    , validateRefVersion "Collaboration" "review.performer" (reviewPerformer review)
    , validateRefVersion "Collaboration" "review.subjectProducer" (reviewSubjectProducer review)
    , validateRefVersion "Collaboration" "escalation.initialTarget" (escalationInitialTarget escalation)
    , validateRefVersion "Collaboration" "escalation.repeatedTarget" (escalationRepeatedTarget escalation)
    , concatMap validateAssignmentVersions (collaborationAssignments model)
    , accountabilityErrors
    , selfReviewErrors
    ]
  where
    delegation = collaborationDelegation model
    handoff = collaborationHandoff model
    review = collaborationReview model
    escalation = collaborationEscalation model
    participantIds = map participantId (collaborationParticipants model)
    roleIds = map roleId (collaborationRoles model)

    validateParticipantRef field ref
      | refVersion ref /= collaborationVersion model = []
      | refId ref `elem` participantIds = []
      | otherwise = [unresolved "Collaboration" field (unStableId (refId ref))]

    validateRoleRef field ref
      | refVersion ref /= collaborationVersion model = []
      | refId ref `elem` roleIds = []
      | otherwise = [unresolved "Collaboration" field (unStableId (refId ref))]

    validateAssignment assignment =
      validateParticipantRef "assignment.participant" (assignmentParticipant assignment)
        ++ validateRoleRef "assignment.role" (assignmentRole assignment)
    validateAssignmentVersions assignment =
      validateRefVersion "Collaboration" "assignment.participant" (assignmentParticipant assignment)
        ++ validateRefVersion "Collaboration" "assignment.role" (assignmentRole assignment)

    accountabilityErrors
      | delegationRetainsAccountability delegation = []
      | otherwise =
          [invalid DelegationAccountabilityConflict "Collaboration" "Delegated performance must not transfer the Tech Lead's accountability"]

    selfReviewErrors
      | reviewPerformer review /= reviewSubjectProducer review = []
      | otherwise =
          [invalid SelfReviewProhibited "Collaboration" "The producer may not perform the implementation review"]

-- Keeping this tiny helper local makes role-policy ownership visible in this context.
_roleById :: CollaborationModel -> StableId -> Maybe Role
_roleById model wanted = find ((== wanted) . roleId) (collaborationRoles model)
