# Using the same team in two projects

Two projects are moving customer data. Both need Dagmar to review the data mapping, Alfhilde to assess the interfaces and Brunhilde to identify the services affected. Could the second project reuse the same revisions of the three roles and their review rules?

In the first project, the team would run the mapping check named in the project brief, attach its findings to the migration issue and ask the data owner to approve the mapping. In the second, the team would use that project’s check and record its findings in its change request. There, the service owner decides. If the brief leaves that owner unspecified, the team would bring the decision back to the project owner.

The test would pass if both projects could use the same review rule: identify mappings that could lose data and present them for a human decision. If a reviewer in the second project needed the first project’s command, issue tracker or approver to do that job, the trial would expose the project detail still embedded in the team.

Whether ai4X should offer such a team as a named bundle is an open design question. [Issue #208](https://github.com/normenmueller/ai4X/issues/208)
