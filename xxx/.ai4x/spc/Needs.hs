-- | ai4X project need specification.
--
-- scout output for the ai4X project itself (#eyodf).
-- Validated by: ghc -fno-code Needs.hs
module Needs where

import Ai4x.Spc

-- ============================================================
-- Domain
-- ============================================================

projectDomain :: Domain
projectDomain = Domain
  { domainName        = "ai4x-development"
  , domainDescription = "CLI tool for agentic AI team curation and materialization"
  , domainBoundaries  = ["cli-tooling", "agentic-ai", "typescript", "cognitive-capability-management"]
  }

teamConstraints :: [TeamConstraint]
teamConstraints =
  [ MaxSpecialists 6
  , GovernanceRule "authority-stack-binding"
  ]

-- ============================================================
-- Domain types
-- ============================================================

data RequirementsPack
data AcceptanceCriteria

data DomainModel
data ArchitecturePack
data ArchitectureDecision

data Story
data SourceCode
data TestSuite
data TestResult

data ReviewReport
data Finding

data AIStrategy
data PromptContract
data ContextBudget

data CapabilityPortfolio
data CapabilityDraft
data AdmissionDecision

-- ============================================================
-- Needs
-- ============================================================

-- | Transform requirements and domain knowledge into architecture.
designArchitecture
  :: Need (RequirementsPack -> DomainModel -> (ArchitecturePack, [ArchitectureDecision]))
designArchitecture = Need
  { job         = Transformation
  , priority    = Required
  , constraints = [ Quality "DDD and bounded contexts"
                  , Quality "arc42 documentation"
                  ]
  , anti        = ["not implementation", "not code generation"]
  }

-- | Generate production code and tests from architecture and stories.
implementFeature
  :: Need (ArchitecturePack -> Story -> (SourceCode, TestSuite))
implementFeature = Need
  { job         = Generation
  , priority    = Required
  , constraints = [ Quality "TypeScript strict mode"
                  , Quality "Node.js native test runner"
                  , Quality "explicit error modeling"
                  ]
  , anti        = ["not architecture decisions"]
  }

-- | Assess code quality through TDD-driven verification.
verifyQuality
  :: Need (SourceCode -> Story -> (TestResult, [Finding]))
verifyQuality = Need
  { job         = Assessment
  , priority    = Required
  , constraints = [ Quality "TDD red-green-refactor"
                  , Quality "regression safety"
                  ]
  , anti        = ["not happy-path-only testing"]
  }

-- | Independently assess artifacts for correctness and quality.
reviewArtifact
  :: Need (SourceCode -> ArchitecturePack -> (ReviewReport, [Finding]))
reviewArtifact = Need
  { job         = Assessment
  , priority    = Required
  , constraints = [ Quality "independent and skeptical"
                  , Quality "no diplomatic hedging"
                  ]
  , anti        = ["not approval rubber-stamping"]
  }

-- | Transform domain knowledge into structured requirements.
engineerRequirements
  :: Need (DomainModel -> (RequirementsPack, [AcceptanceCriteria]))
engineerRequirements = Need
  { job         = Transformation
  , priority    = Required
  , constraints = [ Quality "explicit acceptance criteria"
                  , Quality "traceability"
                  ]
  , anti        = ["not implementation planning"]
  }

-- | Design AI interaction strategy for the project.
designAIStrategy
  :: Need (DomainModel -> (AIStrategy, [PromptContract], ContextBudget))
designAIStrategy = Need
  { job         = Transformation
  , priority    = Required
  , constraints = [ Quality "prompt-context discipline"
                  , Quality "model-tool boundary awareness"
                  ]
  , anti        = ["not general software architecture"]
  }

-- | Assess capability portfolio fitness and admission decisions.
governCapabilities
  :: Need (CapabilityPortfolio -> CapabilityDraft -> (AdmissionDecision, [Finding]))
governCapabilities = Need
  { job         = Assessment
  , priority    = Required
  , constraints = [ Quality "semantic distinctness"
                  , Quality "nearest-neighbor comparison"
                  ]
  , anti        = ["not capability authoring"]
  }
