# Graph Algorithm Selection (MUST)

## Purpose

Select a graph algorithm whose objective and preconditions match the question.

## Trigger

Use when choosing a traversal, path, ranking or grouping algorithm.

## Rules (MUST)

- Define the requested output, graph projection, direction and meaning of weights. Check assumptions that change the answer, such as negative weights, disconnected components, ties or duplicate edges.
- Compare viable algorithms on correctness conditions, time and memory under the stated representation. For instance, distinguish minimizing hop count from minimizing total cost on a graph where the direct edge is expensive.
- Trace the choice on a small discriminating example. If recommending a library implementation, check its version, availability and supported input separately from the mathematical argument.

## Fallback

If a missing assumption changes the choice, show how the candidate answers differ and request that fact.

## Minimal Output Contract

Objective, assumptions, selected algorithm, rejected alternative, cost assumptions and worked example.
