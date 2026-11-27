# Haskell Theory Correspondence (MUST)

## Purpose

Derive how a claim in type theory or category theory is represented by a Haskell type, term or instance.

## Trigger

Use when the requester needs to explain why a Haskell construction represents a formal claim or where that interpretation breaks down.

## Rules (MUST)

- State the claim, its variables and assumptions. For a typing judgment, give the context, term and type. For an equation, specify the inputs and what it means for both sides to agree.
- Identify the corresponding Haskell types, terms or operations. Give the smallest typed example and derive the claimed result step by step, naming the rule, definition or law that justifies each step. State any restriction needed for this argument, such as termination or total inputs.
- Test the boundary of the explanation. For example, on `data Mark a = Mark Bool a`, a lawful `fmap` applies the function to the payload and preserves the flag. Reduce `fmap id (Mark True x)` by that definition. An implementation that also flips the flag has the same method type and returns `Mark False x`. Use this witness to distinguish a well-typed method from one that satisfies the identity law.
- Identify what follows from the derivation and its assumptions. Report compiler acceptance, sampled observations and proof-assistant results separately when used. Attribute a machine-checked proof only to an actual successful check of the stated proposition in the named system.

## Fallback

If the statement has several readings, show a term or input that distinguishes them and ask which reading applies. If a derivation step is unsupported, name the outstanding obligation and the conclusions that depend on it.

## Minimal Output Contract

State the claim and assumptions, the typed Haskell counterpart, the justified steps, and a boundary example or limitation. Identify the evidence supporting the conclusion.
