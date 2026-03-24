#!/usr/bin/env bash
# Bash completion for ai4x / ai4x.ts

_ai4x_complete() {
  local cur prev cmd
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  cmd="${COMP_WORDS[1]}"

  if [[ "${prev}" == "--prefix" ]]; then
    COMPREPLY=($(compgen -d -- "${cur}"))
    return 0
  fi

  if [[ "${COMP_CWORD}" -eq 1 ]]; then
    if [[ "${cur}" == -* ]]; then
      COMPREPLY=($(compgen -W "-h --help --version --clean --prefix --admin --dry-run --strict --json --verbose" -- "${cur}"))
    else
      COMPREPLY=($(compgen -W "clean install doctor" -- "${cur}"))
    fi
    return 0
  fi

  case "${cmd}" in
    clean)
      COMPREPLY=($(compgen -W "--prefix --dry-run" -- "${cur}"))
      ;;
    install)
      COMPREPLY=($(compgen -W "--clean --prefix --admin --dry-run" -- "${cur}"))
      ;;
    doctor)
      COMPREPLY=($(compgen -W "--strict --json --verbose" -- "${cur}"))
      ;;
    *)
      COMPREPLY=($(compgen -W "--help --version clean install doctor" -- "${cur}"))
      ;;
  esac
}

complete -F _ai4x_complete ai4x ai4x.ts
