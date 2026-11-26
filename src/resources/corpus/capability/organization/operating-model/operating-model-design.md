# Operating Model Design (MUST)

## Purpose

Define who owns each stage of a service and who may approve, interrupt or change its operation.

## Trigger

Use when a service spans teams and ownership, decision rights or control points need to be agreed.

## Rules (MUST)

- Identify the decision owner and participants for each stage, from intake through design, delivery, release and operation.
- For an AI service, assign responsibility for model evaluation and release, human oversight and the authority to stop or override operation.
- Make control points explicit for approval, escalation, exception handling, and policy enforcement.
- Distinguish reusable platform responsibilities from use-case-local responsibilities.
- For each control point, name the decision and the role empowered to make it.

## Fallback

- If organizational scope or owners are unclear, mark the model as provisional and list the unresolved responsibility gaps.

## Minimal Output Contract

- operating-model scope
- lifecycle stages
- role and decision-right map
- control points and escalation paths
- unresolved ownership gaps
