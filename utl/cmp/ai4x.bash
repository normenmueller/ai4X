# ai4x bash completion
#
# MAINTENANCE NOTE: Future Epics that add sub-command arguments must update
# this completion file.
#
# Install: source this file or copy to the bash-completion directory.
#   source utl/cmp/ai4x.bash
#   # or
#   cp utl/cmp/ai4x.bash /etc/bash_completion.d/ai4x

_ai4x() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local commands="curate spawn doctor"
    local global_flags="--help -h --version"

    # Only complete at position 1 — no sub-command arguments exist yet.
    if [[ ${COMP_CWORD} -eq 1 ]]; then
        if [[ "${cur}" == -* ]]; then
            COMPREPLY=($(compgen -W "${global_flags}" -- "${cur}"))
        else
            COMPREPLY=($(compgen -W "${commands} ${global_flags}" -- "${cur}"))
        fi
    fi
}

complete -F _ai4x ai4x
