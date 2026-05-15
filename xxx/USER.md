# ai4X User Journey

<!--
scout  = LLM-Interview
curate = LLM-Matching
spawn  = mechanisch
-->

Die ai4X User Journey startet in einem lokalen Verzeichnis - z.B.:

```
~/Sandbox/ai4x-tst/proja
>
```

Dort möchte man ein neues Vorhaben starten. Dafür benötigt man ein Team. Ein Team aus Experten deren kognitive Fähigkeiten und Zusammenarbeitsmodell optimal auf das Vorhaben bzw. die darin herrschenden Bedarfe abgestimmt und für agentic AI optimiert sind.

## Team aufstellen (`scout` → `curate` → `spawn`)

### Bedarfsidentifikation (`scout`)

Zuerst müssen aber die eigentlichen Bedarfe identifiziert werden — wir gehen davon aus, dass der Nutzer meist mit dem "WIE" ins Rennen geht, statt mit dem "WAS". Also führen wir ein geregeltes, methodisches Interview durch.

#### Was passiert intern?

`scout` nutzt `spawn` als internes Primitiv:

1. **Temporärer spawn:** Interview-Agent(en) aus `crp/agn/` werden für den gewählten Host materialisiert (Symlinks).
2. **Host starten:** Der Agent Host (z.B. Codex) läuft mit dem Interview-Agenten aktiv.
3. **Interview:** Der Agent interviewt den Nutzer, identifiziert die eigentlichen Bedarfe.
4. **Output:** Der Agent schreibt `.ai4x/spc/Needs.hs`.
5. **Teardown:** Temporäre Links werden entfernt.

#### Nutzersicht

```
~/Sandbox/ai4x-tst/proja
> ai4x scout --runtime altman

╭──────────────────────────────────────────────╮
│ >_ OpenAI Codex (v0.130.0)                   │
│                                              │
│ model:     gpt-5.5 medium   /model to change │
│ directory: ~/Sandbox/ai4x-tst/proja          │
╰──────────────────────────────────────────────╯

  [...interview session...]

  gpt-5.5 medium · ~
```

Der Agent führt das Interview methodisch — extrahiert Bedarfe aus dem was der Nutzer beschreibt, hinterfragt das "WIE" und destilliert das "WAS".

#### Ergebnis

```
~/Sandbox/ai4x-tst/proja
> tree -a -L 3 .
.
└── .ai4x
    ├── config.yaml
    └── spc
        ├── AI4X
        │   └── Spc.hs
        └── Needs.hs

4 directories, 3 files
```

`Needs.hs` enthält die identifizierten Bedarfe als typsichere Haskell-Deklarationen. Validierbar mit `ghc -fno-code Needs.hs`.

---

### Teamkuration (`curate`)

Nun wird aus den Bedarfen ein Team zusammengestellt. `curate` liest `Needs.hs`, matcht Bedarfe gegen das kognitive Capability-Corpus (`crp/cap/`) und stellt das optimale Team zusammen.

#### Was passiert intern?

Auch `curate` nutzt `spawn` als Primitiv — ein Kurator-Agent aus `crp/agn/` wird temporär aktiviert:

1. **Temporärer spawn:** Kurator-Agent für den gewählten Host.
2. **Matching:** Der Agent liest `Needs.hs` + Corpus-Index, identifiziert optimale Capabilities pro Bedarf.
3. **Team-Komposition:** Der Agent bestimmt welche Agenten (Rollen) das Team braucht und weist ihnen Capabilities zu.
4. **Output:** `.ai4x/agn/` wird geschrieben.
5. **Teardown:** Temporäre Links werden entfernt.

#### Nutzersicht

```
~/Sandbox/ai4x-tst/proja
> ai4x curate --runtime altman

  [...LLM-gestütztes Matching...]

  ✓ 7 needs matched
  ✓ 5 specialists + 1 orchestrator composed
  ✓ mapping protocol written to .ai4x/agn/mapping.yaml
```

#### Transparenz

`curate` protokolliert das Mapping (welcher Bedarf → welche Capabilities → welcher Agent) in einer reviewbaren Datei, damit der PO das Ergebnis auditieren kann.

#### Ergebnis

```
~/Sandbox/ai4x-tst/proja
> tree -a .ai4x/agn/
.ai4x/agn/
├── mapping.yaml              ← Need→Cap→Agent Protokoll (reviewbar)
├── collabm.yaml              ← Team-Topologie + Zusammenarbeitsmodell
├── orchestrator.yaml         ← Agent-Definition
├── architect.yaml
├── implementer.yaml
└── ...
```

`collabm.yaml` definiert *wie* das Team zusammenarbeitet: Topologie, Delegationsmodell, Handoff-Protokoll, Eskalationsregeln. Beide Dimensionen — Fähigkeiten und Zusammenarbeit — sind explizit für agentic AI entworfen: maschinenlesbare Handoff-Protokolle, deterministische Delegationsregeln, explizite Eskalationspfade. `curate` bestimmt das basierend auf den Needs — ein Assessment-lastiges Projekt braucht ein anderes Kollaborationsmodell als ein generativer Workflow.

---

### Host-spezifische Aktivierung (`spawn`)

Jetzt wird das Team für den konkreten Agent Host materialisiert. `spawn` ist rein mechanisch — kein LLM nötig.

#### Was passiert intern?

1. **Lesen:** `spawn` liest `.ai4x/agn/` (Team) + `.ai4x/ctx/` (Projektkontext) + `config.yaml` (Host/Runtime).
2. **Zusammenführen:** Team-Topologie (`agn/collabm.yaml`) + Projekt-Kontext (`ctx/`) werden in die Agent-Artefakte eingewoben.
3. **Materialisieren:** Host-spezifische Artefakte werden geschrieben.
4. **Fertig:** Das Team ist aktiv.

Projekt-Kontext (`ctx/`) sind Fakten über das Projekt — z.B. Commit-Konventionen, Board-Policy, Terminologie — die `spawn` in die Agenten einwebt. Das ist unabhängig vom Team-Design (das kommt aus `agn/`).

#### Nutzersicht

```
~/Sandbox/ai4x-tst/proja
> ai4x spawn

  ✓ runtime: satya (vscode+copilot)
  ✓ 6 agents materialized to .github/agents/
  ✓ copilot-instructions.md written
```

#### Ergebnis je nach Host

| Host | Output |
|------|--------|
| `vscode+copilot` | `.github/agents/*.agent.md`, `.github/copilot-instructions.md` |
| `codex` | `AGENTS.md`, `.codex/` |
| `copilot` (CLI) | `AGENTS.md` |

```
~/Sandbox/ai4x-tst/proja
> tree -a -L 2 .github/
.github/
├── agents/
│   ├── orchestrator.agent.md
│   ├── architect.agent.md
│   ├── implementer.agent.md
│   └── ...
└── copilot-instructions.md
```

Das Team ist einsatzbereit.

---

## Experten direkt nutzen (`ask`)

Nicht jedes Anliegen braucht ein ganzes Team. Manchmal will man einfach einen konkreten Experten aus dem ai4X-Corpus ansprechen — z.B. Gertrud für Organisation-Design oder Sigrid für Anforderungsanalyse.

`ask` überspringt die Pipeline komplett. Kein Interview, keine Bedarfsanalyse, kein Team.

### Was passiert intern?

`ask` nutzt `spawn` als Primitiv — genau wie `scout` und `curate`:

1. **Temporärer spawn:** Der gewählte Agent aus `crp/agn/` wird für den Host materialisiert.
2. **Host starten:** Der Agent Host läuft mit dem Experten aktiv.
3. **Interaktion:** Der Nutzer arbeitet direkt mit dem Experten.
4. **Teardown:** Temporäre Links werden entfernt.

### Nutzersicht

```
~/Sandbox/ai4x-tst/proja
> ai4x ask Gertrud --runtime altman

  ✓ agent: Gertrud (organization-design)
  ✓ runtime: altman (codex)

╭──────────────────────────────────────────────╮
│ >_ OpenAI Codex (v0.130.0)                   │
│                                              │
│ model:     gpt-5.5 medium   /model to change │
│ directory: ~/Sandbox/ai4x-tst/proja          │
╰──────────────────────────────────────────────╯

  [...direkte Interaktion mit Gertrud...]
```

### Kein persistenter Output

`ask` hinterlässt keine Artefakte im Projekt. Die temporären Host-Links werden nach der Session entfernt. Das Projekt bleibt unverändert — anders als bei `scout` (erzeugt `spc/`) oder `curate` (erzeugt `agn/`).
