# Issue 183 AI Co-authoring and Review Evidence

Date: 2026-08-27

This record supports the ai4X project-instance remediation in Issue #183. It is
evidence, not semantic, lifecycle, or Product Owner authority.

## Co-authors

Two specialist AI agents independently reviewed the pre-change state and
co-authored the target design:

- **AI / Agentic Architecture:** designed the greeting-only discovery router,
  fact-kind authority resolution, `Resume | Await Product Owner | Stop on drift`
  outcomes, fail-closed cases, and the separation of intact-session continuity
  from disaster recovery.
- **Type Theory / Functional Domain Design:** identified the local-only Curation
  contract as Shadow Authority and designed the concise tracked
  `.ai4x/context/curation.md` owner with essential type families, function
  contracts, constructor ownership, invariants, and deliberately deferred
  implementation choices.

Both reviews required a lean pointer-only handoff and prohibited recovery
material from becoming work or semantic authority.

## Independent review

A third AI agent that did not author the increment reviewed the complete staged
diff against Issue #183, repository behavior, Cold Start UX, authority
boundaries, Curation semantics, Work Continuity, verification, and non-goals.

The review found and drove resolution of:

- **High:** the initial verifier test copied the ignored local handoff, so a
  fresh clone would fail. The test now creates its valid fixture hermetically.
- **Medium:** structural checks allowed a handoff to grow back beyond a concise
  router. The verifier now limits it to 80 lines and 8 KiB, with a negative
  oversized-handoff test.
- **Low:** machine-local path detection missed macOS volume, file-URL, and
  Windows-drive forms. Detection and negative tests now cover these forms.

Final re-review reported no remaining findings.

## Fresh-agent Cold Start drill

A fourth AI agent received no conversation history and only this Product Owner
message in the repository:

```text
Hi Gertrud, weiter geht's!
```

Under a strict read-only constraint it independently returned:

- route: `Resume`;
- owning work: Issue #183, observed open and `In progress`;
- expected branch: `fix/183-self-discovering-cold-start`;
- next safe action: independent review and verification of the focused #183
  increment;
- boundaries: no branch switch, file mutation, publication, Pull Request,
  merge, lifecycle mutation, or work on #103, #161, #179, #180, or #184.

It validated the handoff schema and size, branch/HEAD/upstream, live GitHub
Issue and Project state, absence of a Pull Request and remote topic branch, the
exact staged file set, `git diff --cached --check`, and the session-continuity
verifier. It did not mutate the workspace.

## Residual risks

- The verifier proves schema, concision, safe references, and selected negative
  cases; semantic authority drift still requires independent review.
- GitHub unavailability intentionally routes to `Await Product Owner` or `Stop
  on drift` whenever current mutable work state is required.
- This is #eyodf evidence for the current project instance, not a released
  Portfolio contract. Generalization remains in Backlog Issue #184.
