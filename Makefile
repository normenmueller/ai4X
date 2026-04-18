PREFIX ?= /usr/local
DESTDIR ?=
ADMIN ?= 0

.PHONY: install clean doctor verify test

install:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" ADMIN="$(ADMIN)" bash ./utl/ops/install.sh

clean:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" bash ./utl/ops/clean.sh

doctor:
	@PREFIX="$(PREFIX)" DESTDIR="$(DESTDIR)" bash ./utl/ops/doctor.sh

verify:
	@bash ./utl/ops/verify.sh

test: verify
