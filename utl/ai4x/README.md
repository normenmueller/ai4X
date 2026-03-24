# ai4x Utility

> Operating and runtime system for reproducible GenAI workflows.

`ai4x` is the utility CLI for installation and cleanup operations in the ai4X suite.

## Scope

- `ai4x clean`: clean local installation artifacts
- `ai4x install`: install core modules
- `ai4x install --clean`: cleanup and installation in one run
- `ai4x doctor`: validate configuration and module layout
- `make install`: install `ai4x` with shell completion (Bash/Zsh/Fish)

## System Prerequisites

- Target platforms: macOS, Linux, Windows.
- For productive runtime operation with `ask`, the filesystem must support symbolic links.
- On Windows, Developer Mode or elevated rights may be required depending on host configuration.
- Submodules must be initialized: `git submodule update --init --recursive`.

## Commands and Options

```bash
ai4x clean
ai4x install
ai4x install --clean
ai4x install --clean --prefix "$HOME/.local"
ai4x doctor
ai4x doctor --strict
ai4x doctor --json
ai4x doctor --verbose
ai4x help install
```

Options:

- `-h, --help`
- `--version`
- `help <clean|install|doctor>`
- `--prefix <path>`
- `--admin` (install only)
- `--clean` (install only)
- `--dry-run`
- `--strict` (doctor only)
- `--json` (doctor only)
- `--verbose` (doctor only)

## Documentation

- ai4X primer: [`../../doc/usr/primer.md`](../../doc/usr/primer.md)
- ai4X agent-guided user onboarding: [`../../doc/agn/user-onboarding.md`](../../doc/agn/user-onboarding.md)
- ai4X roadmap: [`../../adm/pln/rdmp.md`](../../adm/pln/rdmp.md)
- ai4X UAT: [`../../adm/ops/runbooks/UAT.md`](../../adm/ops/runbooks/UAT.md)
- Architecture (arc42): [`./doc/arc/arc42.md`](./doc/arc/arc42.md)
- Diagram source: [`./adm/dev/protocols/arc.tex`](./adm/dev/protocols/arc.tex)

Note about `doctor`:

- Default output shows only failed checks plus `summary` and `result`.
- `--verbose` prints all checks.
- `--json` outputs the full report as JSON.

Installation scope of `ai4x install`:

- `ask` CLI
- `kob` CLI
- per module before installation: `npm ci`, `npm test`, `npm run verify`
- final console summary as `ai4X INSTALL REPORT` with `OK|FAIL`

CLI contract:

- `--help` and `--version` return exit code `0`.
- `help <topic>` returns exit code `0` for valid topics.
- invalid CLI arguments return exit code `2`.
- runtime errors return exit code `1`.

## Usage

Unless stated otherwise, all commands are executed from the repository root (`ai4x/`).
Run `git submodule update --init --recursive` once after clone and again after submodule pointer updates.

```bash
git submodule update --init --recursive
npm --prefix ./utl/ai4x/src ci
npm --prefix ./utl/ai4x/src test
npm --prefix ./utl/ai4x/src run verify
make PREFIX="$HOME/.local" install
hash -r
ai4x --help
ai4x doctor --strict
ai4x clean
ai4x install --clean
```

Tool-root workflow (CLI module only):

```bash
cd utl/ai4x/src
npm ci
npm test
npm run verify
```

Bootstrap and operations start:

```bash
git submodule update --init --recursive
npm --prefix ./utl/ai4x/src ci
make PREFIX="$HOME/.local" install
hash -r
ai4x --help
ai4x doctor --strict
ai4x install --clean
```

Notes:

- `make install` installs only `ai4x` itself (binary + completion + config handling).
- Suite operations (`clean`, `install --clean`, `doctor`) run through the `ai4x` CLI.
- If an existing config still contains placeholder paths, `install` replaces them automatically with detected module paths (including backup), as long as local layout is fully detected.
- For deliberate config regeneration, use `make install CONFIG_MODE=backup` and adjust config explicitly.

Completion artifacts after `make install`:

- Bash: `~/.local/share/bash-completion/completions/ai4x`
- Zsh: `~/.local/share/zsh/site-functions/_ai4x`
- Fish: `~/.local/share/fish/vendor_completions.d/ai4x.fish`

Configuration schema:

```yaml
version: 0.1.0
modules:
  ask: /absolute/path/to/ask
  kob: /absolute/path/to/kob
  ccp: /absolute/path/to/ccp
  tcp: /absolute/path/to/tcp
install:
  config_mode:
    ask: keep
    kob: keep
    ccp: keep
    tcp: keep
```

Schema note:

- If `mod/ask`, `mod/kob`, `mod/cap/cog`, and `mod/cap/tec` are present, `make install` writes these absolute paths to user config automatically.
- If a complete layout is not detected, placeholder schema remains and module paths must be set manually.

Example scenario (install + cognitive capability consistency check with `kob`):

```bash
ai4x install --clean
kob cap doctor --kob-root "/absolute/path/to/mod/kob" --cog-cap ai4x-ccp=/absolute/path/to/mod/cap/cog/cap
```

Note about `install.config_mode`:

- Values per module: `keep`, `backup`, `force`
- `install.config_mode.ask` controls Ask config backup/overwrite behavior during `ai4x install`
- If `install.config_mode.ask` is missing, `keep` is used
- `install.config_mode.kob`, `install.config_mode.ccp`, and `install.config_mode.tcp` are reserved config fields without install impact

## License

See [../../LICENSE](../../LICENSE).
© 2026 [nemron](https://github.com/normenmueller)
