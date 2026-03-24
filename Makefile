PREFIX ?= /usr/local
DESTDIR ?=
XDG_CONFIG_HOME ?=

BIN_NAME ?= ai4x
SCRIPT_TS ?= utl/ai4x/src/app/ai4x.ts
SCRIPT_ABS := $(abspath $(SCRIPT_TS))
BINDIR ?= $(PREFIX)/bin
BASH_COMPLETION_DIR ?= $(PREFIX)/share/bash-completion/completions
ZSH_COMPLETION_DIR ?= $(PREFIX)/share/zsh/site-functions
FISH_COMPLETION_DIR ?= $(PREFIX)/share/fish/vendor_completions.d
CONFIG_TEMPLATE ?= utl/ai4x/config.tpl.yaml

ai4X_USER_CONFIG_BASE ?= $(if $(strip $(XDG_CONFIG_HOME)),$(XDG_CONFIG_HOME),$(HOME)/.config)
ai4X_USER_CONFIG_DIR ?= $(ai4X_USER_CONFIG_BASE)/ai4x
ai4X_USER_CONFIG_FILE ?= $(ai4X_USER_CONFIG_DIR)/config.yaml
CONFIG_MODE ?= keep
DEFAULT_MODULE_ASK ?= $(abspath $(CURDIR)/mod/ask)
DEFAULT_MODULE_KOB ?= $(abspath $(CURDIR)/mod/kob)
DEFAULT_MODULE_CCP ?= $(abspath $(CURDIR)/mod/cap/cog)
DEFAULT_MODULE_TCP ?= $(abspath $(CURDIR)/mod/cap/tec)

.PHONY: test install install-bin install-user-config uninstall

test:
	npm --prefix ./utl/ai4x/src test

install: install-bin install-user-config

install-bin:
	install -d "$(DESTDIR)$(BINDIR)"
	printf '%s\n' '#!/usr/bin/env bash' 'exec node "$(SCRIPT_ABS)" "$$@"' > "$(DESTDIR)$(BINDIR)/$(BIN_NAME)"
	chmod 0755 "$(DESTDIR)$(BINDIR)/$(BIN_NAME)"
	install -d "$(DESTDIR)$(BASH_COMPLETION_DIR)"
	install -m 0644 "utl/ai4x/utl/cmp/ai4x.bash" "$(DESTDIR)$(BASH_COMPLETION_DIR)/$(BIN_NAME)"
	install -d "$(DESTDIR)$(ZSH_COMPLETION_DIR)"
	install -m 0644 "utl/ai4x/utl/cmp/_ai4x" "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_$(BIN_NAME)"
	install -d "$(DESTDIR)$(FISH_COMPLETION_DIR)"
	install -m 0644 "utl/ai4x/utl/cmp/ai4x.fish" "$(DESTDIR)$(FISH_COMPLETION_DIR)/$(BIN_NAME).fish"
	@echo "Completion notes:"
	@echo "  Zsh: add 'fpath=(\"$(ZSH_COMPLETION_DIR)\" $$fpath)' and run 'compinit'."
	@echo "  Bash: ensure bash-completion is enabled; file is in $(BASH_COMPLETION_DIR)/$(BIN_NAME)."
	@echo "  Fish: completions auto-load from $(FISH_COMPLETION_DIR)/$(BIN_NAME).fish."

install-user-config:
	@if [ -n "$(DESTDIR)" ]; then \
	  echo "Skipping user config install because DESTDIR is set ($(DESTDIR))."; \
	  exit 0; \
	fi; \
	install -d "$(ai4X_USER_CONFIG_DIR)"; \
	mode="$(CONFIG_MODE)"; \
	if [ -z "$$mode" ]; then mode="keep"; fi; \
	case "$$mode" in keep|backup|force) ;; *) \
	  echo "Invalid CONFIG_MODE: $$mode (expected keep|backup|force)" >&2; \
	  exit 2; \
	esac; \
	target="$(ai4X_USER_CONFIG_FILE)"; \
	auto_ask="$(DEFAULT_MODULE_ASK)"; \
	auto_kob="$(DEFAULT_MODULE_KOB)"; \
	auto_ccp="$(DEFAULT_MODULE_CCP)"; \
	auto_tcp="$(DEFAULT_MODULE_TCP)"; \
	all_found=1; \
	for d in "$$auto_ask" "$$auto_kob" "$$auto_ccp" "$$auto_tcp"; do \
	  if [ ! -d "$$d" ]; then all_found=0; break; fi; \
	done; \
	placeholder_present=0; \
	if [ -f "$$target" ] && grep -Eq '/absolute/path/to/(ask|kob|ccp|tcp)' "$$target"; then \
	  placeholder_present=1; \
	fi; \
	write_auto_config() { \
	  printf '%s\n' \
	    'version: 0.1.0' \
	    'modules:' \
	    "  ask: $$auto_ask" \
	    "  kob: $$auto_kob" \
	    "  ccp: $$auto_ccp" \
	    "  tcp: $$auto_tcp" \
	    'install:' \
	    '  config_mode:' \
	    '    ask: keep' \
	    '    kob: keep' \
	    '    ccp: keep' \
	    '    tcp: keep' \
	    > "$$target"; \
	}; \
	if [ "$$mode" = "keep" ] && [ -f "$$target" ]; then \
	  if [ "$$placeholder_present" -eq 1 ]; then \
	    if [ "$$all_found" -eq 1 ]; then \
	      ts="$$(date +%Y%m%d%H%M%S)"; \
	      backup="$$target.bak.$$ts"; \
	      cp "$$target" "$$backup"; \
	      write_auto_config; \
	      echo "Replaced placeholder user config with detected module paths: $$target"; \
	      echo "Backup written: $$backup"; \
	      exit 0; \
	    fi; \
	    echo "Existing user config still contains placeholder paths: $$target" >&2; \
	    echo "Set modules.ask/modules.kob/modules.ccp/modules.tcp to absolute directories." >&2; \
	    echo "Hint: run with CONFIG_MODE=backup after setting valid module roots." >&2; \
	    exit 2; \
	  fi; \
	  echo "Keeping existing user config: $$target"; \
	  exit 0; \
	fi; \
	if [ "$$mode" = "backup" ] && [ -f "$$target" ]; then \
	  ts="$$(date +%Y%m%d%H%M%S)"; \
	  backup="$$target.bak.$$ts"; \
	  n=0; \
	  while [ -e "$$backup" ]; do \
	    n=$$((n + 1)); \
	    backup="$$target.bak.$$ts.$$n"; \
	  done; \
	  cp "$$target" "$$backup"; \
	  echo "Backed up existing user config: $$backup"; \
	fi; \
	if [ "$$all_found" -eq 1 ]; then \
	  write_auto_config; \
	  echo "Installed user config with detected module paths: $$target"; \
	else \
	  install -m 0644 "$(CONFIG_TEMPLATE)" "$$target"; \
	  echo "Installed default user config: $$target"; \
	  echo "Action required: replace placeholder module paths in $$target before 'ai4x doctor --strict'."; \
	fi

uninstall:
	rm -f "$(DESTDIR)$(BINDIR)/$(BIN_NAME)"
	rm -f "$(DESTDIR)$(BASH_COMPLETION_DIR)/$(BIN_NAME)"
	rm -f "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_$(BIN_NAME)"
	rm -f "$(DESTDIR)$(FISH_COMPLETION_DIR)/$(BIN_NAME).fish"
	@echo "User config is intentionally preserved:"
	@echo "  $(ai4X_USER_CONFIG_FILE)"
