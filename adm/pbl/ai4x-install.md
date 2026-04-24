/plan CLI installation and shell completions via Makefile

# Zielbild

`make install` und `make uninstall` sollen ai4x robust und portable installieren bzw. deinstallieren.
Kernnutzen: einfacher Einstieg für Entwickler und Tester ohne manuelle Pfad-Konfiguration.

Referenzimplementierung: `ai4x.bak/mod/ask` (Makefile, `utl/cmp/`).

# Scope

1. **`make install`**: Erzeugt Launcher-Script in `$(PREFIX)/bin/ai4x`, installiert Shell-Completions (bash, zsh, fish).
2. **`make uninstall`**: Entfernt Launcher und Completions. Config-Dateien bleiben erhalten.
3. **Shell Completions**: Dynamisch basierend auf verfügbaren Sub-Commands (`curate`, `spawn`, `doctor`, `--help`, `--version`).
4. **`PREFIX`/`DESTDIR`-Support**: Standard `/usr/local`, überschreibbar für Packaging.

# Bekannte Randbedingungen

1. Node >=23.6.0 vorausgesetzt (native TS stripping).
2. Launcher ist ein generiertes Bash-Script (`exec node "<abs-path>/src/app/ai4x.ts" "$@"`), kein Symlink.
3. Repository muss nach Installation am Platz bleiben (Pfad ist eingebacken).
4. Completion-Dateien liegen unter `utl/cmp/` im Repository.
5. `package.json` braucht kein `bin`-Feld — der Launcher übernimmt die Rolle.

# Offene Fragen

- Soll `make install` auch User-Config (`~/.config/ai4x/config.yaml`) anlegen? (Referenz: ja, mit CONFIG_MODE keep/backup/force)
- Soll ein `make install-system-config` Target für `/etc/ai4x/` existieren?
