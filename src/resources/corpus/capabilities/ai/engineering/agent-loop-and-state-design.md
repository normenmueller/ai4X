# Agent Loop and State Design (MUST)

## Purpose

Design agent loops and state transitions so work remains resumable, bounded, and interruptible.

## Trigger

Use when an AI system iterates across planning, tool use, review, or multi-step execution.

## Rules (MUST)

- Define explicit state transitions for pending work, active execution, blocked states, completion, and failure.
- Set stop criteria, retry limits, and checkpoint rules before enabling iterative execution.
- Keep durable state separate from transient reasoning traces unless persistence is explicitly justified.
- Ensure loops can pause, resume, or escalate without losing decision-critical context.
- Do not allow open-ended recursive behavior without bounded control semantics.

## Fallback

- If stop criteria, retry policy, or state ownership is unclear, treat the loop design as provisional and name the missing controls.

## Minimal Output Contract

- state model
- loop and checkpoint rules
- stop and retry criteria
- resume and escalation semantics
- unresolved control gaps
