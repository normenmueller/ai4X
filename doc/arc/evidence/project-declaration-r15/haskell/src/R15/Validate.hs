module R15.Validate (validateFixture) where

import R15.Capabilities
import R15.Collaboration
import R15.Common
import R15.Fixture
import R15.Governance
import R15.Integration
import R15.ProjectIntent
import R15.WorkManagement

validateFixture :: Fixture -> [ValidationError]
validateFixture fixture =
  concat
    [ validateCollaboration collaboration
    , validateWorkProfile work
    , concatMap validateWorkProfile (fixtureOtherWorkProfiles fixture)
    , validateWorkAssignments participantIds work
    , concatMap (validateWorkAssignments participantIds) (fixtureOtherWorkProfiles fixture)
    , validateGovernance governance
    , validateGovernanceParticipants participantIds governance
    , validateProjectIntent intent
    , validateCapabilities capabilities
    , validateCapabilityNeedRefs needIds capabilities
    , validateIntegration published (fixtureBundle fixture) (fixtureProjectEntry fixture)
    ]
  where
    collaboration = fixtureCollaboration fixture
    work = fixtureWorkManagement fixture
    governance = fixtureGovernance fixture
    intent = fixtureProjectIntent fixture
    capabilities = fixtureCapabilities fixture
    participantIds = map participantId (collaborationParticipants collaboration)
    needIds = map needId (projectIntentNeeds intent)
    published =
      PublishedIds
        (collaborationId collaboration)
        (workProfileId work)
        (governanceId governance)
        (projectIntentId intent)
        (capabilityCatalogueId capabilities)
        participantIds
