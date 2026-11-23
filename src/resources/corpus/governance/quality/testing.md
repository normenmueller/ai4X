# Test observable behavior

Draft for review.

Map every acceptance criterion to a case, input, expected observation and failure condition. Define the order of checks. Include a falsification attempt, invalid input and relevant failure paths. For new behavior, demonstrate that the test fails for the expected reason before implementing the smallest change that makes it pass. For a defect, preserve a regression check.

Name tests by behavior. Keep pure domain tests isolated and exercise effects with targeted integration checks. Record commands, results, untested edges and residual risk. Block completion if a criterion lacks evidence or a required gate cannot be verified.
