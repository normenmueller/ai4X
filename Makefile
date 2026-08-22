.PHONY: verify structure-check licensing-check

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
	SECURITY.md

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

verify: structure-check licensing-check
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

licensing-check:
	@command -v reuse >/dev/null 2>&1 || { echo '[ai4x] ERROR reuse is required' >&2; exit 2; }
	@reuse --no-multiprocessing lint
