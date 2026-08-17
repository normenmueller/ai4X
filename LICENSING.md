# Licensing ai4X

ai4X uses path-based licensing. There is no implicit repository-wide default license.

| Material | License |
| --- | --- |
| Executable software, schemas and protocols used as software interfaces, tests, build and CI automation, and machine-oriented infrastructure | [Apache License 2.0](LICENSES/Apache-2.0.txt) |
| Human- and agent-consumable knowledge, cognitive Capabilities, governance, project and agent declarations, documentation, and the current ai4X logo | [Creative Commons Attribution 4.0 International](LICENSES/CC-BY-4.0.txt) |

The root [REUSE.toml](REUSE.toml) is the sole machine-readable authority for assigning one of these licenses to each tracked first-party file. The `LICENSES/` directory contains the canonical license texts. A root `LICENSE`, nested `REUSE.toml`, DEP5 file, or competing per-file declaration must not be used to infer or override a repository-wide default.

## Boundary rules

- Classification follows a file's semantic role and path, not its extension alone.
- Cognitive Capability contracts, governance, intent, explanatory documentation, and declarative agent or project knowledge use CC BY 4.0.
- Product code, protocol and validation schemas, tests, fixtures, generators, executable wrappers, and repository tooling use Apache 2.0.
- Generated material inherits the semantic class of its source. A generator must fail closed when one generated file would combine classes that cannot receive one unambiguous path license.
- Original code excerpts embedded in CC BY documentation follow the document license. Reusable product code should be linked to its Apache source rather than duplicated.
- Imported excerpts and third-party works retain their original license and attribution. They are not silently relicensed.
- Introducing a third first-party license, an incompatible excerpt, or unknown third-party material requires an explicit Product Owner decision before inclusion.

## Packages and releases

Pure software npm and Cabal packages declare `Apache-2.0`. Package-local Apache license copies must be byte-identical to the canonical Apache text.

A mixed ai4X corpus Cabal source distribution declares `Apache-2.0 AND CC-BY-4.0`, ships byte-identical copies of both canonical texts, and retains the per-path REUSE map. The aggregate package expression does not replace each file's single path assignment.

Published archives include both canonical texts, this document, attribution, and an exported path-to-license manifest. Ignored local material and on-demand build output are outside the tracked repository inventory, but published output must still preserve the applicable license and notices.

## Contributions and attribution

Contributors submit only material they are authorized to license. Unless an accepted written exception states otherwise, a contribution is offered under the effective license assigned to its target path in `REUSE.toml`. Existing contributor and third-party notices must be retained.

The first-party assignment notice is `2026 nemron <https://github.com/normenmueller>`. It does not claim exclusive ownership of contributions or third-party material, and it adds no trademark or patent claim beyond the canonical license texts.

© 2026 [nemron](https://github.com/normenmueller)
