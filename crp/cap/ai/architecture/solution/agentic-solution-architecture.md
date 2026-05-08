# Agentic Solution Architecture (MUST)

## Purpose

Decompose agentic solutions into bounded runtime concerns before implementation detail accumulates.

## Trigger

Use when designing or reviewing a system that reasons, invokes tools, persists state, or escalates actions.

## Rules (MUST)

- Separate reasoning, state, tool use, control flow, and human escalation into explicit architecture concerns.
- Define where decisions are made, where actions are taken, and where execution must stop for validation or approval.
- Make state boundaries explicit for transient context, durable memory, and resumable workflow state.
- Define failure containment so tool, context, or model faults do not silently become business decisions.
- Do not collapse an agentic solution into a single undifferentiated "agent" box.

## Fallback

- If tasks, permissions, or escalation boundaries are unclear, keep the architecture provisional and name the missing decision points.

## Minimal Output Contract

- runtime concern map
- state boundary map
- tool and action boundaries
- escalation and stop points
- unresolved design risks
