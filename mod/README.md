# mod

`mod/` binds the ai4X module repositories as submodules:

- `mod/ask` -> `ask`
- `mod/kob` -> `kob`
- `mod/cap/cog` -> `ccp`
- `mod/cap/tec` -> `tcp`

## Working Mode

1. Make changes directly in the corresponding submodule directory.
2. Commit and push in the module repository.
3. Commit the submodule pointer in integration repository `ai4x`.

## Initialization

```bash
git submodule update --init --recursive
```

## Update to Integration-Pinned State

```bash
git submodule update --recursive
```

## Architecture Map

- Overall architecture (integration): [`../doc/arc/arc42.md`](../doc/arc/arc42.md)
- Module architectures:
  - `ask`: [`./ask/doc/arc/arc42.md`](./ask/doc/arc/arc42.md)
  - `kob`: [`./kob/doc/arc/arc42.md`](./kob/doc/arc/arc42.md)
  - `ccp`: [`./cap/cog/doc/arc/arc42.md`](./cap/cog/doc/arc/arc42.md)
  - `tcp`: [`./cap/tec/doc/arc/arc42.md`](./cap/tec/doc/arc/arc42.md)

## Targeted Update to Remote State (intentional)

```bash
git submodule update --remote mod/ask
git submodule update --remote mod/kob
git submodule update --remote mod/cap/cog
git submodule update --remote mod/cap/tec
```

Note:

- The effective integration state is always the submodule pointer stored in the `ai4x` commit.
