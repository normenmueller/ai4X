# Dhall-only declaration build contract

## Named entry point

The candidate's only evaluation boundary is the explicit command:

```text
ai4x declarations update \
  --project <project-root> \
  --source <project-root>/.ai4x/declarations/project.dhall \
  --output <project-root>/.ai4x/generated/declarations/v1
```

`curate`, `spawn`, `doctor`, and ordinary `validate` read the generated inert documents.
They do not invoke Dhall, resolve imports, or fall back to the source when generated data
is missing or stale. The generated directory is derived and non-authoritative.

## Required update pipeline

The installed Haskell CLI performs these steps in order and atomically publishes only
after every step succeeds:

1. Parse the Dhall source without resolving imports.
2. Walk the complete import AST and reject HTTP(S), environment, home-relative,
   absolute, `missing`, and project-escaping imports. Every accepted import is a relative
   path beneath the declared project source root and has a semantic integrity hash.
3. Resolve the closed graph offline and verify every import integrity hash.
4. Type-check and normalize it using the pinned Dhall language/library version.
5. Decode the normalized value into product-owned Haskell types. The project-local
   `schema/package.dhall` improves author feedback but is not the metamodel authority.
   A changed schema cannot extend the Haskell decoder.
6. Run local validators owned by `ai4x-collaboration`, `ai4x-work-management`,
   `ai4x-intent`, `ai4x-curation`, and `ai4x-assurance`.
7. Publish typed context summaries containing stable ID, exact semantic version, closed
   entity kind, and owning bounded context. Local references are resolved only by their
   owner. `ai4x-check` receives only those summaries and explicitly declared typed
   cross-context reference ports; no validator reaches into another aggregate.
8. Canonically order semantic sets by stable ID, encode the inert representation, and
   record source paths, source spans, import hashes, semantic digests, product version,
   and schema version.
9. Write to a sibling staging directory, fsync it, and atomically replace the previous
   generated generation. A failure leaves the previous generation unchanged.

`ai4x-core` owns only common envelopes, stable/versioned references, digests, and
publication mechanics. It does not own a merged domain aggregate. The Project Entry
binds the independently owned declarations.

## Prototype-only commands

The commands below validate the Dhall authoring surface. They are not substitutes for
the Haskell semantic update command.

```sh
export XDG_CACHE_HOME=/tmp/r15-dhall-cache
dhall --file xxx/r15-declaration-comparison/dhall/project.dhall >/dev/null
dhall type --file xxx/r15-declaration-comparison/dhall/project.dhall
dhall hash --file xxx/r15-declaration-comparison/dhall/project.dhall
dhall freeze --check --all xxx/r15-declaration-comparison/dhall/project.dhall
```

All fixture cases are type-checked with:

```sh
export XDG_CACHE_HOME=/tmp/r15-dhall-cache
for file in xxx/r15-declaration-comparison/dhall/cases/*.dhall; do
  dhall --file "$file" >/dev/null
  dhall type --file "$file" >/dev/null
done
```

The prototype semantic fixture build and command used for the final bounded run are:

```sh
sed '/^build-summary:/d' "$HOME/.cabal/config" > /tmp/ai4x-r15-cabal.config
cd xxx/r15-declaration-comparison/dhall/consumer
CABAL_CONFIG=/tmp/ai4x-r15-cabal.config \
  XDG_CACHE_HOME=/tmp/ai4x-r15-dhall-cache \
  cabal build --builddir=/tmp/ai4x-r15-dhall-final-dist -fdev-werror
XDG_CACHE_HOME=/tmp/ai4x-r15-dhall-cache \
  /tmp/ai4x-r15-dhall-final-dist/build/aarch64-osx/ghc-9.6.7/r15-dhall-consumer-0.1.0.0/x/r15-dhall-consumer/build/r15-dhall-consumer/r15-dhall-consumer \
  --project-root "$OLDPWD/xxx/r15-declaration-comparison/dhall" \
  --eval-timeout 10 \
  --mermaid-output /tmp/r15-story-delivery-typed.mmd
```

The temporary Cabal config only removes this workstation's sandbox-incompatible
`build-summary` path; it does not add repositories or dependencies. On a normal writable
Cabal installation, the first line and `CABAL_CONFIG` override are unnecessary.

It returns success for `positive.dhall` and independently derives the owning semantic
error for every `invalid-*.dhall` case, including the wrong-kind and wrong-version
regressions. The product-owned Dhall view does not include
`expectedErrorCodes` or `expectedValidator`; those fields remain test expectation data,
not executable validation logic. All disposable Cabal build output is directed outside
the repository.

The bounded prototype loader parses the transitive import AST before `Dhall.inputFile`,
requires integrity hashes on every local import, rejects every non-local import, checks
lexical and canonical/symlink-resolved root containment, and wraps evaluation in the
explicit timeout. It does not claim to close the local symlink-swap-during-read race or
to implement atomic production publication; the older authorized spike contains the
broader hardened-resolver and atomic-publication evidence.
