PREFIX  ?= /usr/local
DESTDIR ?=
BINDIR  ?= $(PREFIX)/bin

BASH_COMPLETION_DIR ?= $(PREFIX)/share/bash-completion/completions
ZSH_COMPLETION_DIR  ?= $(PREFIX)/share/zsh/site-functions
FISH_COMPLETION_DIR ?= $(PREFIX)/share/fish/vendor_completions.d

CONFIG_MODE ?= keep

.PHONY: install install-user-config uninstall clean doctor verify test

install:
	@command -v node >/dev/null 2>&1 || { echo '[ai4x] ERROR node is required but not found in PATH' >&2; exit 1; }
	@node -e 'var c = process.versions.node.split(".").map(Number), r = [23, 6, 0]; for (var i = 0; i < 3; i++) { if (c[i] > r[i]) process.exit(0); if (c[i] < r[i]) { console.error("[ai4x] ERROR Node.js >= 23.6.0 required, found " + process.version); process.exit(1); } }'
	@install -d "$(DESTDIR)$(BINDIR)"
	@printf '%s\n' '#!/usr/bin/env bash' 'exec node "$(CURDIR)/dev/cli/src/app/ai4x.ts" "$$@"' > "$(DESTDIR)$(BINDIR)/ai4x"
	@chmod 0755 "$(DESTDIR)$(BINDIR)/ai4x"
	@install -d "$(DESTDIR)$(BASH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/ai4x.bash "$(DESTDIR)$(BASH_COMPLETION_DIR)/ai4x"
	@install -d "$(DESTDIR)$(ZSH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/_ai4x "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_ai4x"
	@install -d "$(DESTDIR)$(FISH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/ai4x.fish "$(DESTDIR)$(FISH_COMPLETION_DIR)/ai4x.fish"
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
	@bash ./utl/ops/clean.sh

doctor:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" bash ./utl/ops/doctor.sh

verify:
	@bash ./utl/ops/verify.sh

test: verify
	@cd dev/cli && npm test
	@cd utl/cap && npm test
