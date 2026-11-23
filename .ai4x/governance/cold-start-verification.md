# Verify Cold Start after an instruction change

Apply this check when a change can affect how an agent identifies its role,
working checkout, owning Issue or authority at Cold Start.

- Shared entry behavior changed: test the changed revision in every supported host.
- Only one host's entry behavior changed: test that revision in the affected host.
- Editorial changes that preserve behavior and ordinary session starts require no test run.

In an isolated checkout, use a non-trunk branch that differs from the
branch named in `.ai4x/STATE.md`. Start a fresh session and give it only the
usual continuation greeting. The check passes when each agent reports both
branches and stops before switching branches, changing files or resuming work.

This check applies the failure-case guidance in the Corpus
[AI strategy quality contract](../../src/resources/corpus/governance/quality/ai-strategy.md)
at revision `ada4abdd4297a762958dcb8952efff3a9aa269ea`.
