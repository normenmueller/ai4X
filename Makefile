PREFIX  ?= /usr/local
DESTDIR ?=
BINDIR  ?= $(PREFIX)/bin

BASH_COMPLETION_DIR ?= $(PREFIX)/share/bash-completion/completions
ZSH_COMPLETION_DIR  ?= $(PREFIX)/share/zsh/site-functions
FISH_COMPLETION_DIR ?= $(PREFIX)/share/fish/vendor_completions.d

CONFIG_MODE ?= keep

.PHONY: install install-user-config uninstall clean verify test

install:
	@command -v node >/dev/null 2>&1 || { echo '[ai4x] ERROR node is required but not found in PATH' >&2; exit 1; }
	@node -e 'var c = process.versions.node.split(".").map(Number), r = [23, 6, 0]; for (var i = 0; i < 3; i++) { if (c[i] > r[i]) process.exit(0); if (c[i] < r[i]) { console.error("[ai4x] ERROR Node.js >= 23.6.0 required, found " + process.version); process.exit(1); } }'
	@install -d "$(DESTDIR)$(BINDIR)"
	@printf '%s\n' '#!/usr/bin/env bash' 'exec node "$(CURDIR)/cli/src/app/ai4x.ts" "$$@"' > "$(DESTDIR)$(BINDIR)/ai4x"
	@chmod 0755 "$(DESTDIR)$(BINDIR)/ai4x"
	@install -d "$(DESTDIR)$(BASH_COMPLETION_DIR)"
	@install -m 0644 cli/cmp/ai4x.bash "$(DESTDIR)$(BASH_COMPLETION_DIR)/ai4x"
	@install -d "$(DESTDIR)$(ZSH_COMPLETION_DIR)"
	@install -m 0644 cli/cmp/_ai4x "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_ai4x"
	@install -d "$(DESTDIR)$(FISH_COMPLETION_DIR)"
	@install -m 0644 cli/cmp/ai4x.fish "$(DESTDIR)$(FISH_COMPLETION_DIR)/ai4x.fish"
	@$(MAKE) --no-print-directory install-user-config
	@echo '[ai4x] installed'

install-user-config:
	@case "$(CONFIG_MODE)" in keep|backup|force) ;; *) echo '[ai4x] ERROR invalid CONFIG_MODE (valid: keep, backup, force)' >&2; exit 1;; esac
	@config_dir="$${XDG_CONFIG_HOME:-$$HOME/.config}/ai4x"; \
	config_file="$$config_dir/config.yaml"; \
	install -d "$$config_dir"; \
	case "$(CONFIG_MODE)" in \
	  keep) \
	    if [ -f "$$config_file" ]; then \
	      echo '[ai4x] config exists, keeping (CONFIG_MODE=keep)'; \
	    else \
	      printf '%s\n' '# ai4x user configuration' '# See: https://github.com/normenmueller/ai4x' > "$$config_file"; \
	      echo '[ai4x] config created'; \
	    fi;; \
	  backup) \
	    if [ -f "$$config_file" ]; then \
	      mv "$$config_file" "$$config_file.backup.$$(date -u +%Y-%m-%dT%H:%M:%S)"; \
	      echo '[ai4x] existing config backed up'; \
	    fi; \
	    printf '%s\n' '# ai4x user configuration' '# See: https://github.com/normenmueller/ai4x' > "$$config_file"; \
	    echo '[ai4x] config created';; \
	  force) \
	    printf '%s\n' '# ai4x user configuration' '# See: https://github.com/normenmueller/ai4x' > "$$config_file"; \
	    echo '[ai4x] config created';; \
	esac

uninstall:
	@rm -f "$(DESTDIR)$(BINDIR)/ai4x"
	@rm -f "$(DESTDIR)$(BASH_COMPLETION_DIR)/ai4x"
	@rm -f "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_ai4x"
	@rm -f "$(DESTDIR)$(FISH_COMPLETION_DIR)/ai4x.fish"
	@-rmdir -p "$(DESTDIR)$(BINDIR)" 2>/dev/null || true
	@-rmdir -p "$(DESTDIR)$(BASH_COMPLETION_DIR)" 2>/dev/null || true
	@-rmdir -p "$(DESTDIR)$(ZSH_COMPLETION_DIR)" 2>/dev/null || true
	@-rmdir -p "$(DESTDIR)$(FISH_COMPLETION_DIR)" 2>/dev/null || true
	@echo '[ai4x] uninstalled (user config preserved)'

clean:
	@echo '[ai4x] clean: removing local build artifacts'
	@rm -rf node_modules dist .ai4x
	@echo '[ai4x] clean: done'

verify:
	@echo '[ai4x] verify: checking repository baseline'
	@test -f .github/agents/ai4x.agent.md || { echo '[ai4x] ERROR missing: .github/agents/ai4x.agent.md' >&2; exit 2; }
	@test -f CONTRIBUTING.md || { echo '[ai4x] ERROR missing: CONTRIBUTING.md' >&2; exit 2; }
	@test -f README.md || { echo '[ai4x] ERROR missing: README.md' >&2; exit 2; }
	@test -d cli/src/app || { echo '[ai4x] ERROR missing: cli/src/app' >&2; exit 2; }
	@test -d cli/src/lib || { echo '[ai4x] ERROR missing: cli/src/lib' >&2; exit 2; }
	@test -d cli/tst || { echo '[ai4x] ERROR missing: cli/tst' >&2; exit 2; }
	@git ls-files --error-unmatch cli/src/app/.gitkeep >/dev/null 2>&1 || { echo '[ai4x] ERROR not tracked: cli/src/app/.gitkeep' >&2; exit 2; }
	@git ls-files --error-unmatch cli/src/lib/.gitkeep >/dev/null 2>&1 || { echo '[ai4x] ERROR not tracked: cli/src/lib/.gitkeep' >&2; exit 2; }
	@git ls-files --error-unmatch cli/tst/.gitkeep >/dev/null 2>&1 || { echo '[ai4x] ERROR not tracked: cli/tst/.gitkeep' >&2; exit 2; }
	@bash utl/gh/repo-metadata.sh --check-local
	@echo '[ai4x] verify: baseline checks passed'

test: verify
	@cd cli && npm test
	@cd cli/src/lib/doctor/_scaffold && npm test
