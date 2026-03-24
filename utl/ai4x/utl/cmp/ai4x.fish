function __ai4x_subcommand
    set -l words (commandline -opc)
    if test (count $words) -ge 2
        echo $words[2]
    end
end

complete -c ai4x -s h -l help -d "Show this help and exit"
complete -c ai4x -l version -d "Show version and exit"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -a "clean install doctor"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l clean -d "Run clean before install"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l prefix -r -d "Install prefix for binaries"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l admin -d "Include system-level /etc/ask operations via sudo"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l dry-run -d "Print planned commands without executing"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l strict -d "Exit with code 1 if required failures are found"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l json -d "Print doctor report as JSON"
complete -c ai4x -n "test (count (commandline -opc)) -eq 1" -l verbose -d "Print all doctor checks"

complete -c ai4x -n "test (__ai4x_subcommand) = clean" -l prefix -r -d "Install prefix for binaries"
complete -c ai4x -n "test (__ai4x_subcommand) = clean" -l dry-run -d "Print planned commands without executing"

complete -c ai4x -n "test (__ai4x_subcommand) = install" -l clean -d "Run clean before install"
complete -c ai4x -n "test (__ai4x_subcommand) = install" -l prefix -r -d "Install prefix for binaries"
complete -c ai4x -n "test (__ai4x_subcommand) = install" -l admin -d "Include system-level /etc/ask operations via sudo"
complete -c ai4x -n "test (__ai4x_subcommand) = install" -l dry-run -d "Print planned commands without executing"

complete -c ai4x -n "test (__ai4x_subcommand) = doctor" -l strict -d "Exit with code 1 if required failures are found"
complete -c ai4x -n "test (__ai4x_subcommand) = doctor" -l json -d "Print doctor report as JSON"
complete -c ai4x -n "test (__ai4x_subcommand) = doctor" -l verbose -d "Print all doctor checks"

complete -c ai4x.ts -s h -l help -d "Show this help and exit"
complete -c ai4x.ts -l version -d "Show version and exit"
complete -c ai4x.ts -n "test (count (commandline -opc)) -eq 1" -a "clean install doctor"
