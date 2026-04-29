PREFIX  ?= /usr/local
DESTDIR ?=
BINDIR  ?= $(PREFIX)/bin

BASH_COMPLETION_DIR ?= $(PREFIX)/share/bash-completion/completions
ZSH_COMPLETION_DIR  ?= $(PREFIX)/share/zsh/site-functions
FISH_COMPLETION_DIR ?= $(PREFIX)/share/fish/vendor_completions.d

.PHONY: install uninstall clean doctor verify test

install:
	@command -v node >/dev/null 2>&1 || { echo '[ai4x] ERROR node is required but not found in PATH' >&2; exit 1; }
	@node -e 'var c = process.versions.node.split(".").map(Number), r = [23, 6, 0]; for (var i = 0; i < 3; i++) { if (c[i] > r[i]) process.exit(0); if (c[i] < r[i]) { console.error("[ai4x] ERROR Node.js >= 23.6.0 required, found " + process.version); process.exit(1); } }'
	@install -d "$(DESTDIR)$(BINDIR)"
	@printf '%s\n' '#!/usr/bin/env bash' 'exec node "$(CURDIR)/dev/src/app/ai4x.ts" "$$@"' > "$(DESTDIR)$(BINDIR)/ai4x"
	@chmod 0755 "$(DESTDIR)$(BINDIR)/ai4x"
	@install -d "$(DESTDIR)$(BASH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/ai4x.bash "$(DESTDIR)$(BASH_COMPLETION_DIR)/ai4x"
	@install -d "$(DESTDIR)$(ZSH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/_ai4x "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_ai4x"
	@install -d "$(DESTDIR)$(FISH_COMPLETION_DIR)"
	@install -m 0644 utl/cmp/ai4x.fish "$(DESTDIR)$(FISH_COMPLETION_DIR)/ai4x.fish"
	@echo '[ai4x] installed'

uninstall:
	@rm -f "$(DESTDIR)$(BINDIR)/ai4x"
	@rm -f "$(DESTDIR)$(BASH_COMPLETION_DIR)/ai4x"
	@rm -f "$(DESTDIR)$(ZSH_COMPLETION_DIR)/_ai4x"
	@rm -f "$(DESTDIR)$(FISH_COMPLETION_DIR)/ai4x.fish"
	@echo '[ai4x] uninstalled (user config preserved)'

clean:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" bash ./utl/ops/clean.sh

doctor:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" bash ./utl/ops/doctor.sh

verify:
	@bash ./utl/ops/verify.sh

test: verify
