# xxx — curate/spawn Design Sandbox

This directory simulates a project that uses ai4x.
It serves to design the full flow:

1. Global config (`~/.config/ai4x/config.yaml`) — what does `make install` put there?
2. Project config (`.ai4x/config.yaml`) — what does the user override per project?
3. `curate` input — how does curate know what team to build?
4. `curate` output — what ends up in `.ai4x/team/`?
5. `spawn` input — what does spawn read from `.ai4x/`?
6. `spawn` output — what lands in `.github/` or `AGENTS.md`?

## Simulated scenario

This "project" wants to use ai4x with:
- VS Code + Copilot (runtime: satya)
- Codex CLI (runtime: altman)
