# Neo4j Query Tuning (MUST)

## Purpose

Reduce the measured cost of a Neo4j query while preserving its result and write contract.

## Trigger

Use when a correct Neo4j query has a concrete performance target.

## Rules (MUST)

- Record the Neo4j version, query, parameters, indexes, graph size and distribution, and the metric that matters. Capture the baseline on representative data, including a high fan-out or low-selectivity case where relevant.
- Use EXPLAIN for estimates. PROFILE executes the query, including writes. Obtain actual operator rows and database hits only in a suitable authorized environment. Locate the operator where work expands unexpectedly and connect one proposed change to that observation.
- Repeat with comparable parameters, cache conditions and data. Verify equivalent rows and, for writes, equivalent graph effects on equivalent starting fixtures. State the measured trade-off, including index maintenance where relevant.

## Fallback

Without comparable measurements, identify the suspected operator, give a falsifiable tuning hypothesis and specify the next measurement.

## Minimal Output Contract

Baseline, proposed change, evidence of equivalent results and measured cost difference, or an explicitly unverified hypothesis.
