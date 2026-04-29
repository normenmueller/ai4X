# ai4x fish completion
#
# MAINTENANCE NOTE: Future Epics that add sub-command arguments must update
# this completion file.
#
# Install: copy to the fish completions directory.
#   cp utl/cmp/ai4x.fish ~/.config/fish/completions/ai4x.fish

# Disable file completions — ai4x takes commands and flags only.
complete -c ai4x -f

# Sub-commands (only when no sub-command has been given yet)
complete -c ai4x -n "__fish_use_subcommand" -a curate -d "Write declarative, client-agnostic agent artifacts"
complete -c ai4x -n "__fish_use_subcommand" -a spawn -d "Materialize and activate an agent for a target client"
complete -c ai4x -n "__fish_use_subcommand" -a doctor -d "Validate configuration, declaration, and spawn-readiness"

# Global flags (only when no sub-command has been given yet)
complete -c ai4x -n "__fish_use_subcommand" -s h -l help -d "Show usage information"
complete -c ai4x -n "__fish_use_subcommand" -l version -d "Show version information"
