# Capability Toolchain Deficits

## Scope

Fix two known deficits in `utl/cap/checks/capability-indexes.mjs` and `utl/cap/checks/capability-meta.mjs`.

## Findings

### F1: `[object Object]` rendering in generated indexes

`capability-indexes.mjs` does not serialize structured `distinguish_from` entries. When a capability has `distinguish_from` with `{id, boundary}` objects, the generated Markdown index renders `[object Object]` instead of the boundary text. Affects `dev/cap/index.md` and domain-local `index.md` files.

### F3: `allowedSourceKinds` missing `domain-reference`

`capability-meta.mjs` allows only `standard | architecture-guidance | security-guidance | adoption-guidance` as `sources[].kind` values. Domain reference works (e.g., Parmenter, Kaplan/Norton) are not formal standards nor adoption guides. A `domain-reference` kind would express the intent more precisely.

## Origin

Discovered during Issue #29 (kpi-system review), Critical Review B.
