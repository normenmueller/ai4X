# Test observable behavior

Draft for review.

Map every acceptance criterion to a case, input, expected observation and failure condition. Define the order of checks. Include a falsification attempt, invalid input and relevant failure paths. For new behavior, demonstrate that the test fails for the expected reason before implementing the smallest change that makes it pass. For a defect, preserve a regression check.

When an artifact has a specified maximum size, identify the measured content and unit. Test the largest allowed size and one unit over it. Record the limit, observed size and outcome for each case. Verify that overflow follows the specified behavior and that required evidence is never silently discarded.

When a state transition rule changes, test the affected cases from their initial state. For an allowed transition, assert that the expected target state is reached. For a disallowed transition, assert both that the transition is rejected and that the state remains unchanged.

Name tests by behavior. Keep pure domain tests isolated and exercise effects with targeted integration checks. Record commands, results, untested edges and residual risk. Block completion if a criterion lacks evidence or a required gate cannot be verified.
