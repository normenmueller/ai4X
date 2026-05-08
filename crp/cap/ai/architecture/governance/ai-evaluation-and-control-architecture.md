# AI Evaluation and Control Architecture (MUST)

## Purpose

Define how AI behavior is evaluated, monitored, constrained, and interrupted across the runtime lifecycle.

## Trigger

Use when an AI solution needs explicit quality, safety, oversight, or escalation controls.

## Rules (MUST)

- Define evaluation criteria before rollout and align them to business impact, failure tolerance, and control obligations.
- Separate offline evaluation, runtime monitoring, and human oversight concerns instead of collapsing them into one control step.
- Make escalation thresholds, stop conditions, and rollback or safe-fail paths explicit.
- Ensure control architecture covers both output quality and action authority.
- Do not claim operational readiness without evaluation and intervention architecture.

## Fallback

- If evaluation criteria or intervention rights are missing, keep the control architecture provisional and name the blocking gaps.

## Minimal Output Contract

- evaluation dimensions
- runtime monitoring points
- oversight and escalation model
- stop and rollback conditions
- unresolved control gaps
