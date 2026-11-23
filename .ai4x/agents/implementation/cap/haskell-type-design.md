# Haskell Type Design (MUST)

## Purpose

Translate a domain invariant into a Haskell API and identify exactly what a well-typed client can still do.

## Trigger

Use when designing a Haskell type, public signature or instance that promises to enforce an invariant.

## Rules (MUST)

- State the invariant and give one intended use and one misuse. Start with a sum, product or abstract newtype. Introduce an indexed type or GADT when a constructor must provide evidence of a specific state or type equality. Show how a caller consumes that evidence.
- For a polymorphic signature, identify who chooses each type and which operations its constraints allow. Use existential packaging when the producer chooses a hidden type and the consumer needs only the operations carried with it. Check that an ordinary call site can infer the intended types.
- For an abstract or phantom-indexed type, inspect exported constructors, instances and coercions. If changing a domain index would break the invariant, check the parameter role and whether clients can use representational equality to cross the boundary.
- Assign value-dependent facts to the boundary that can observe them. Validate external input there and expose the resulting evidence through a narrow interface. State assumptions such as termination and the exclusion of unsafe operations when relevant.
- For an overloaded operation, state the instance laws and what the types actually enforce. Keep a concrete function if there is no shared law or meaningful variation.

## Fallback

If the domain invariant, public exports or supported compiler features are unknown, give a provisional signature and identify the smallest example that would distinguish the viable designs.

## Minimal Output Contract

Give the public signature, a valid use, the misuse it excludes or detects, and the remaining runtime check or assumption.
