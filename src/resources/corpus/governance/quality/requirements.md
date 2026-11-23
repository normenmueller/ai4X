# Refine requirements

Draft for review.

When refining an Idea, Epic or Story, identify the problem, scope and exclusions. Cite constraints. For each material assumption, state what fails if it is wrong. Challenge at least one key assumption and compare a rejected option with the recommendation. Name unresolved risks and decisions.

Write each acceptance criterion as an observable EARS statement. Choose the pattern that matches the behavior.

| Pattern | Form |
| --- | --- |
| Always applies | The system shall … |
| Event | When …, the system shall … |
| State | While …, the system shall … |
| Optional feature | Where …, the system shall … |
| Unwanted condition | If …, then the system shall … |

Supply a concrete observation that could falsify each criterion. Resolve hidden defaults and contradictory or untestable criteria before implementation. Ask the product owner a specific decision question when the ambiguity changes product behavior.

Use a single issue for a feature or fix that can be delivered and accepted as one change. Use an Epic when several Stories contribute to a shared outcome.

Before requesting approval for an Epic's proposed Stories, check coverage in both directions. Which Stories cover each Epic acceptance criterion? Which criterion does each Story help satisfy? Identify any uncovered criterion or Story with no clear contribution and resolve it before requesting approval.

Record the mapping with the Epic so a reviewer can trace each criterion to its Stories and each Story back to its criteria. Choose a format that suits the scope, such as linked bullets or a table.
