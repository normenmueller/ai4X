.PHONY: verify structure-check licensing-check haskell-check

GHC_VERSION := 9.10.3
CABAL_VERSION := 3.16.1.0
AI4X_LOCAL_TMP := $(CURDIR)/.ai4x/local/build-tmp

REQUIRED_FILES := \
	.ai4x/.gitignore \
	.ai4x/BEHAVIOR.md \
	.ai4x/CONTEXT.md \
	.ai4x/context/architecture.md \
	.ai4x/context/domain-language.md \
	.github/CODEOWNERS \
	.github/copilot-instructions.md \
	.github/workflows/verify.yml \
	AGENTS.md \
	CODE_OF_CONDUCT.md \
	CONTRIBUTING.md \
	GOVERNANCE.md \
	LICENSES/Apache-2.0.txt \
	LICENSES/CC-BY-4.0.txt \
	LICENSING.md \
	README.md \
	REUSE.toml \
	SECURITY.md \
	src/cabal.project \
	src/cabal.project.freeze \
	src/hie.yaml \
	src/foundation/core/LICENSE \
	src/foundation/core/ai4x-core.cabal \
	src/foundation/core/src/AI4X/Core.hs \
	src/foundation/core/src/AI4X/Core/Internal/Identifier.hs \
	src/foundation/core/src/AI4X/Core/Internal/Sha256.hs \
	src/foundation/core/tst/Main.hs \
	src/foundation/core/tst/AI4X/Core/IdentifierTest.hs \
	src/foundation/core/tst/AI4X/Core/Sha256Test.hs \
	src/foundation/context-protocol/LICENSE \
	src/foundation/context-protocol/ai4x-context-protocol.cabal \
	src/foundation/context-protocol/src/AI4X/ContextProtocol.hs \
	src/foundation/context-protocol/src/AI4X/ContextProtocol/Internal/Port.hs \
	src/foundation/context-protocol/src/AI4X/ContextProtocol/Internal/Reference.hs \
	src/foundation/context-protocol/src/AI4X/ContextProtocol/Internal/Value.hs \
	src/foundation/context-protocol/tst/Main.hs \
	src/foundation/context-protocol/tst/AI4X/ContextProtocol/PortTest.hs \
	src/foundation/context-protocol/tst/AI4X/ContextProtocol/ReferenceTest.hs \
	src/foundation/context-protocol/tst/AI4X/ContextProtocol/ValueTest.hs \
	src/foundation/declaration-protocol/LICENSE \
	src/foundation/declaration-protocol/ai4x-declaration-protocol.cabal \
	src/foundation/declaration-protocol/src/AI4X/DeclarationProtocol.hs \
	src/foundation/declaration-protocol/src/AI4X/DeclarationProtocol/Internal/Json.hs \
	src/foundation/declaration-protocol/src/AI4X/DeclarationProtocol/Internal/Protocol.hs \
	src/foundation/declaration-protocol/tst/Main.hs \
	src/foundation/declaration-protocol/tst/AI4X/DeclarationProtocol/CodecTest.hs \
	src/foundation/declaration-protocol/tst/AI4X/DeclarationProtocol/ContractTest.hs \
	src/foundation/declaration-protocol/tst/AI4X/DeclarationProtocol/Fixture.hs \
	src/foundation/declaration-protocol/tst/AI4X/DeclarationProtocol/ValidationTest.hs

REQUIRED_DIRS := \
	.ai4x/agents \
	.ai4x/assurance \
	.ai4x/bindings \
	.ai4x/context \
	.ai4x/coordination \
	.ai4x/governance/quality \
	.ai4x/intent \
	.ai4x/operations \
	.ai4x/records/evidence/assurance \
	.ai4x/records/evidence/reviews \
	.ai4x/records/provenance \
	.ai4x/records/receipts \
	.codex \
	.github/agents \
	.github/ISSUE_TEMPLATE \
	.github/workflows \
	doc/architecture/evidence \
	doc/commands \
	doc/concepts \
	doc/diagrams \
	doc/examples \
	doc/reference \
	src/foundation/core \
	src/foundation/context-protocol \
	src/foundation/declaration-protocol \
	src/foundation/generation \
	src/domains/corpus \
	src/domains/intent \
	src/domains/curation \
	src/domains/collaboration \
	src/domains/work-management \
	src/domains/governance \
	src/domains/assurance \
	src/domains/declaration \
	src/domains/check \
	src/domains/project-entry \
	src/domains/activation \
	src/domains/bundle \
	src/interfaces/cli \
	src/interfaces/adapters/codex \
	src/interfaces/adapters/github \
	src/resources/assurance/packs \
	src/resources/bundles \
	src/resources/corpus/capabilities \
	src/resources/corpus/governance \
	src/resources/corpus/releases \
	src/resources/corpus/schema \
	src/resources/skeletons \
	util/assurance \
	util/documentation \
	util/repository

LEGACY_DIRS := \
	.ai4x/planning \
	.ai4x/team \
	acc \
	adm \
	cli \
	crp \
	doc/agn \
	doc/arc \
	doc/usr \
	src/assurance \
	src/bundles \
	src/cli \
	src/corpus \
	src/light \
	src/packages \
	src/policy \
	src/skeletons \
	util/assurance/vendor \
	utl

verify: structure-check licensing-check haskell-check
	@git diff --check
	@echo '[ai4x] verify: passed'

structure-check:
	@for path in $(REQUIRED_FILES); do \
		test -f "$$path" || { echo "[ai4x] ERROR missing file: $$path" >&2; exit 2; }; \
	done
	@for path in $(REQUIRED_DIRS); do \
		test -d "$$path" || { echo "[ai4x] ERROR missing directory: $$path" >&2; exit 2; }; \
	done
	@for path in $(LEGACY_DIRS); do \
		test ! -e "$$path" || { echo "[ai4x] ERROR legacy root remains: $$path" >&2; exit 2; }; \
	done
	@test ! -e cabal.project || { echo '[ai4x] ERROR Cabal project belongs under src/' >&2; exit 2; }
	@test ! -e cabal.project.freeze || { echo '[ai4x] ERROR Cabal freeze file belongs under src/' >&2; exit 2; }
	@test ! -e hie.yaml || { echo '[ai4x] ERROR HLS configuration belongs under src/' >&2; exit 2; }
	@test -z "$$(find . -maxdepth 1 -name '*.cabal' -print -quit)" || { echo '[ai4x] ERROR Cabal packages belong under src/' >&2; exit 2; }

licensing-check:
	@command -v reuse >/dev/null 2>&1 || { echo '[ai4x] ERROR reuse is required' >&2; exit 2; }
	@reuse --no-multiprocessing lint

haskell-check:
	@command -v ghc >/dev/null 2>&1 || { echo '[ai4x] ERROR GHC $(GHC_VERSION) is required' >&2; exit 2; }
	@command -v cabal >/dev/null 2>&1 || { echo '[ai4x] ERROR Cabal $(CABAL_VERSION) is required' >&2; exit 2; }
	@test "$$(ghc --numeric-version)" = "$(GHC_VERSION)" || { echo '[ai4x] ERROR GHC $(GHC_VERSION) is required' >&2; exit 2; }
	@test "$$(cabal --numeric-version)" = "$(CABAL_VERSION)" || { echo '[ai4x] ERROR Cabal $(CABAL_VERSION) is required' >&2; exit 2; }
	@mkdir -p "$(AI4X_LOCAL_TMP)"
	@TMPDIR="$(AI4X_LOCAL_TMP)" cabal --project-dir=src build all --ghc-options=-Werror
	@TMPDIR="$(AI4X_LOCAL_TMP)" cabal --project-dir=src test all --ghc-options=-Werror
	@TMPDIR="$(AI4X_LOCAL_TMP)" cabal --project-dir=src haddock all
	@cd src/foundation/core && TMPDIR="$(AI4X_LOCAL_TMP)" cabal check
	@cd src/foundation/context-protocol && TMPDIR="$(AI4X_LOCAL_TMP)" cabal check
	@cd src/foundation/declaration-protocol && TMPDIR="$(AI4X_LOCAL_TMP)" cabal check
