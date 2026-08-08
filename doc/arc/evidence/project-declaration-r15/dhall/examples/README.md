# Story-delivery declaration example

`story-delivery.dhall` is a pinned projection of the real authoritative
`project.dhall` source. It contains the stage graph, fork after `implement`, `join-all`
acceptance, failure prevention, and the guarded review-remediation iteration with its
explicit budget and exhaustion stage.

Human-readable normalized declaration:

```sh
dhall --file xxx/r15-declaration-comparison/dhall/examples/story-delivery.dhall
```

Deterministic derived Mermaid (explicitly non-authoritative):

```sh
cabal run \
  --project-dir=xxx/r15-declaration-comparison/dhall/consumer \
  --builddir=/tmp/ai4x-r15-dhall-dist \
  -fdev-werror r15-dhall-consumer -- \
  --project-root xxx/r15-declaration-comparison/dhall \
  --eval-timeout 10 \
  --mermaid-output /tmp/r15-story-delivery.mmd
```
