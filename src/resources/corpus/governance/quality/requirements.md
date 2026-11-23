# Refine requirements

Draft for review.

When refining an Idea, Epic or Story, identify the problem, scope and exclusions. Cite constraints. For each material assumption, state what fails if it is wrong. Challenge at least one key assumption and compare a rejected option with the recommendation. Name unresolved risks and decisions.

Use EARS for every acceptance criterion that specifies observable product behavior. For a criterion that only verifies a deliverable, state directly what a reviewer can inspect. For example, “If a configuration value is invalid, then the CLI shall report the affected key” specifies behavior. “The package contains the license file” specifies delivery evidence. Choose the EARS pattern that matches the behavior.

| Pattern | Form |
| --- | --- |
| Always applies | The system shall … |
| Event | When …, the system shall … |
| State | While …, the system shall … |
| Optional feature | Where …, the system shall … |
| Unwanted condition | If …, then the system shall … |

Supply a concrete observation that could falsify each criterion. Resolve hidden defaults and contradictory or untestable criteria before implementation. Ask the product owner a specific decision question when the ambiguity changes product behavior.

Use a single issue for a feature or fix that can be delivered and accepted as one change. Use an Epic when several Stories contribute to a shared outcome. Give each Story an outcome the product owner can accept on its own. Record any prerequisite Story and what it must deliver. Use one focused pull request per Story as a sizing guide.

Before requesting approval for an Epic's proposed Stories, check coverage in both directions. Which Stories cover each Epic acceptance criterion? Which criterion does each Story help satisfy? Identify any uncovered criterion or Story with no clear contribution and resolve it before requesting approval.

Record the mapping with the Epic so a reviewer can trace each criterion to its Stories and each Story back to its criteria. Choose a format that suits the scope, such as linked bullets or a table.

Brief the product owner on what the proposed Stories cover. If a gap remains, identify the missing coverage and recommend how to close it. Once coverage is complete, state the decision you are asking the product owner to make.
