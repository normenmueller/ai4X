# Writing a capability

What should another person be able to tell from a capability description? They should be able to recognize when to use it, apply its rules and check whether its result is useful.

## Start with the decision

Name the ability and the situation that calls for it. For example, “evaluate strategic fit” tells an author what judgment to make. A team deciding whether to pursue an initiative has a reason to use it. “Produce a spreadsheet” describes an artifact and leaves that reason unclear.

## Write the cognitive contract

| Section | Question the text should answer |
| --- | --- |
| Purpose | What specific work does this capability contribute? |
| Trigger | What situation makes this work necessary? |
| Rules | What judgments or checks should the agent carry out? |
| Fallback | When essential evidence is missing, what can the agent conclude provisionally, and what must it ask for? |
| Minimal output contract | What must the result contain for someone to act on it or check it? |

Write the rules so an agent can apply them across roles and hosts. For strategic fit, an actionable rule asks the agent to relate each judgment to a stated objective and the evidence for it. If the objective is missing, the agent can identify the gap and request clarification before issuing a recommendation.

## Compare the closest capability

Find the existing capability most likely to be chosen for the same task. Describe a case where each applies. If both would make the same judgment and return the same result, consider refining the existing capability. If they serve different purposes, state the boundary clearly enough that a reviewer can choose between them.

Give an example of when to leave the capability out if the choice could be misleading. A team comparing two pitches for strategic fit can use the evaluation above. A team checking the arithmetic in a pitch budget needs a calculation check, even when the budget supports the same initiative.

Keep the instructions for doing the work in the capability text. Use the accompanying metadata for relationships such as dependencies, conflicts and distinctions. Record a conflict only when the two capabilities genuinely exclude each other.
