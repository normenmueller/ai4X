# AI Readiness Assessment (MUST)

## Purpose

Assess whether an organization or initiative is ready to design, deploy, and control AI responsibly.

## Trigger

Use when deciding whether an AI initiative should start, scale, or pause.

## Rules (MUST)

- Assess readiness across governance, data, platform, operations, skills, and organizational adoption.
- Distinguish absent capability from immature capability instead of flattening both into a generic low score.
- Evaluate readiness relative to the proposed use-case risk and autonomy level.
- Make blocking gaps explicit before recommending scale or production use.
- Do not claim readiness solely from tooling availability.

## Fallback

- If evidence is partial, return a partial readiness view and list the unassessed dimensions.

## Minimal Output Contract

- readiness dimensions
- maturity assessment per dimension
- blocking gaps
- scale or pause recommendation
- evidence gaps
