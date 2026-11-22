# Updating an agent’s capabilities

A maintainer wants to use a revised capability in the strategy agent’s next session. Copying individual files into the agent’s workspace could leave a mixture of revisions. A reviewer would then have difficulty identifying which version the agent was set up to use.

The maintainer would pin a revision of the capability corpus and assemble the agent’s bundle from that revision. Before starting a session, the maintainer would run the consistency checks and inspect the resulting composition to see which capabilities the bundle contained.

The launch profile would point to that reviewed bundle for the next run. By recording the source revision, the composition and the check results, the maintainer could show a colleague which capability update the profile selected and repeat the update from the same source.
