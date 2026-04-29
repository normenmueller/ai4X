/plan Sub-command `curate`: Anforderungsanalyse, Design, Umsetzung

# Zielbild

Das Sub-command `curate` soll ein kuratiertes Multi-Agent-System mit explizitem Workflow erzeugen und pflegen.
Kernnutzen: gewonnene Team- und Governance-Insights werden reproduzierbar materialisiert statt ad hoc wiederholt.

Hinweis: Ich, als PO, vermute, dass `curate` "nur" in dem aktuellen VZ eine `.ai4x/` Gerüst mit Agent- und Workflow-Definitionen wie diese Agents zusammenarbeiten analog wie wir sie hier in dem ai4X Projekt gerade verwenden. So gesehen ist ai4X eine Refernezimplementation seiner selbst ;-) 

`curate` soll insbesondere die Faehigkeit bereitstellen, aus deklarativen Eingaben folgende Artefakte konsistent zu erzeugen oder zu aktualisieren:

1. Canonical Orchestrator Agent Definition
2. Specialist Agent Definitions
3. Workflow-Routing inkl. Stage-Gates
4. Session Conformance Contract und One-Page Template
5. Optionale Visual Flow Diagramme (Mermaid)

# Bereits geklaerte Setup-Insights (vorab festgelegt)

Diese Punkte gelten fuer den spaeteren `curate`-Track als vorgeklaert:

1. Das Agent-System ist ein Expert-Team-Modell mit Orchestrator plus Specialist Agents.
2. Der Orchestrator ist Gate-Authority und darf Specialist-Gates nicht ueberspringen.
3. Stage-Artefakte sind verbindlich: Requirements Pack, Architecture Pack, Review A Findings, AI Strategy Note (conditional), Implementation Pack, Test Evidence Pack, Review B Findings.
4. Session Conformance Checks sind verpflichtend (mindestens vor Implementierung und vor finaler Abnahme).
5. Explizitheitsregel gilt systemweit: keine impliziten Defaults in Verhalten, Parametern oder Konfigurationsauflosung.

# Architekturprinzipien fuer Governance und Rollen (vorab festgelegt)

Diese Architekturentscheidung gilt als verbindliche Anforderung fuer `curate`:

1. Engineering- und TypeScript-Qualitaetsregeln bleiben zentral in Governance-Contracts (`adm/gdl/dev/contracts/engineering-quality.md`, `adm/gdl/dev/contracts/typescript-quality.md`).
2. Diese Regeln werden nicht in Agent-Dateien verschoben oder dupliziert.
3. Agents referenzieren Contracts verbindlich und erzwingen deren Anwendung rollenbasiert.

Begruendung (verbindlich):

1. Single Source of Truth: normative Regeln gehoeren in Contracts.
2. Drift-Vermeidung: keine Duplikate und keine widerspruechlichen Versionen derselben Regeln.
3. Saubere Verantwortlichkeit: Contracts definieren was gilt; Agents definieren wie strikt es durchgesetzt wird.
4. Eleganz und Wartbarkeit: Regelanpassungen erfolgen zentral, Agents bleiben schlank und konsistent.

Resultierende Zielarchitektur:

1. Governance in Contracts (inkl. TypeScript Quality Contract).
2. Orchestrierung im Master-Agent.
3. Rollenspezifische Durchsetzung in Specialist-Agents.

## Abstraktionsebenen-Regel (verbindlich fuer curate)

Agents und Contracts operieren auf unterschiedlichen Abstraktionsebenen — absichtlich:

- **Agents = Rollen mit Methodik** (das *Wie*): z.B. `ai4x-architecture-ddd` (DDD), `ai4x-testing-tdd` (TDD).
- **Contracts = Qualitaetsanforderungen fuer ein Fachgebiet** (das *Was*): z.B. `architecture-quality`, `testing-quality`.

Contracts benennen das Fachgebiet, Agents benennen die Rolle + Methodik.

Konsequenz fuer `curate`:

- Contract-Dateinamen verwenden das Fachgebiet, nicht die Methodik: `<fachgebiet>-quality.md`.
- Agent-Dateinamen verwenden die Rolle und die Methodik: `ai4x-<rolle>-<methodik>.agent.md`.
- Aendert sich die Methodik (z.B. von DDD zu Hexagonal), wird der Agent umbenannt; der Contract bleibt stabil.
- Output Contracts und Challenge Rules gehoeren ausschliesslich in Contracts, nicht in Agent-Definitionen.
- Agents referenzieren ihre Contracts unter "Mandatory Quality Contracts (MUST)" und duplizieren keine Regeln.

# (1) Anforderungsanalyse

Fuehre mit mir eine strukturierte Anforderungsanalyse fuer `ai4x curate` durch.

Interview-Fokus:

1. Welche Input-Spezifikation soll `curate` akzeptieren (Dateiformat, Pflichtfelder, Versionierung)?
2. Welche Zielartefakte sind pro Run Pflicht vs. optional?
3. Wann ist ein Run blocked, wann conditional-approve, wann approved?
4. Wie strikt soll `curate` auf bestehende Dateien reagieren (fail, merge, overwrite nur explizit)?
5. Welche Idempotenz-Anforderungen gelten (identischer Input => identischer Output)?
6. Welche Traceability soll `curate` erzeugen (Aenderungsbericht, Decision Log, Mapping Input->Output)?
7. Welche Variabilitaet soll unterstuetzt werden (Teamgroesse, Agent-Rollen, Gate-Haerte, Diagrammoptionen)?

Fasse die Anforderungen in `adm/pbl/ai4x-curate-req.md` im [EARS](https://alistairmavin.com/ears/) Format zusammen.

Nach meiner Freigabe:

# (2) Software Design

Basierend auf `adm/pbl/ai4x-curate-req.md` erstelle das Codedesign fuer `ai4x`.

Design-Ziele fuer `curate`:

1. Deterministisch und idempotent.
2. Diff-basiert und review-freundlich.
3. Explizite Konfliktbehandlung bei bestehenden Artefakten.
4. Strikte Trennung von Parsing, Validation, Planning und Materialization.
5. Klare Fehlerklassifikation (Input Error, Governance Conflict, Write Conflict, Validation Error).

Richte dich bei Fach- und Strukturinspiration an den bekannten Referenzen aus der `ai4x.bak` Historie, aber spezifiziere fuer das aktive Repository und seine Governance.

Beruecksichtige insbesondere:

1. Spezifikation der ai4X `config.yaml` fuer `curate`.
2. Spezifikation der Library-Struktur fuer `dev/src/lib`.
3. Abgleich mit bestehender Governance unter `adm/gdl/**` und `.github/agents/**`.

# (3) Umsetzungs- und Abnahmefokus (vorab)

Wenn Design freigegeben ist, soll die Umsetzung mindestens folgende Outcomes liefern:

1. CLI-Verhalten fuer `ai4x curate` inkl. klarer Argument- und Fehlervertraege.
2. Tests fuer Parser, Validierung, Materialisierung und Regressionsfaelle.
3. Nachvollziehbarer Run-Report pro Ausfuehrung (was wurde erzeugt, aktualisiert, uebersprungen, blockiert).
4. Validierte Kompatibilitaet mit `make verify` und `make doctor`.

# Architektur-Hinweise aus Scaffolding Epic (#2)

1. **`core/types/domain.ts` Extraktion:** Wenn `curate` Domain-Typen einfuehrt, die nicht CLI-spezifisch sind (z.B. Manifest-Strukturen, Agent-Definitionen), sollen diese in `dev/src/lib/core/types/domain.ts` extrahiert werden — analog zum Pattern in `ai4x.bak`. Im Scaffolding (Stories #3–#5) existieren nur CLI-Typen in `core/cli/types.ts`; eine Extraktion war dort premature. Quelle: Story #4 Architecture Pack, Rejected Alternative.

# Offene Klaerungsfragen (noch zu entscheiden)

1. Soll `curate` defaultmaessig nur planen (`--plan`) und erst mit explizitem `--apply` schreiben?
2. Soll es ein striktes `--no-overwrite` als Standard geben?
3. Wie wird Template-Versionierung fuer kuenftige Governance-Evolution abgebildet?
4. Soll `curate` gezielt nur bestimmte Artefaktklassen aktualisieren koennen (z. B. nur Agents, nur Workflow, nur Contracts)?

# Erkenntnisse aus manuellem Setup-Review (verbindlich fuer curate)

Die folgenden Erkenntnisse stammen aus dem manuellen Setup des Agent-Teams und der Governance-Struktur.
Sie sind als verbindliche Anforderungen an `curate` zu verstehen.

## Referenzketten-Prinzip (Single Source of Truth)

Lesereihenfolgen und Dokumentabhaengigkeiten werden ausschliesslich in `adm/gdl/index.yaml` definiert.
Kein Agent, kein Contract und kein Protocol darf eine eigenstaendige Lesereihenspegelung fuehren.

Konsequenz fuer `curate`:

- Agents erzeugen unter Required Reading nur Verweise auf `ai4x.agent.md` + `index.yaml`.
- Einzelne Contracts oder Protocols werden in Agents nicht als Leseliste aufgezaehlt.
- Autoritaetsverweise innerhalb von Regeln (z.B. "Gate-Semantik: siehe workflow.md") sind erlaubt und gewollt.
- Unterscheidung: Lesereihenspegelung (verboten ausserhalb index.yaml) vs. Autoritaetsverweis in einer Regel (erlaubt).

## Orchestrator-Struktur

Der Orchestrator (`ai4x.agent.md`) definiert:

- Produktregeln (CLI Model, Explicitness, Configuration, Runtime Linking, Quality, Decision).
- Teamregeln (Delegation Matrix, Stage Gates, Gate Decision Model, Expert Team Operating Model).

Produktregeln enthalten die normativen Regeln direkt im Orchestrator (sie sind die kanonische Definition).
Teamregeln verweisen auf autoritative Quellen in `workflow.md` und `development-conformance.md` — sie kopieren nichts.

Konsequenz fuer `curate`:

- Generierte Orchestrator-Dateien muessen zwischen Produktregeln (inline) und Teamregeln (Verweis) trennen.
- Delegation Matrix, Stage Gates, Gate Decision Model: nur Verweis auf `workflow.md`.
- Session Conformance: nur Verweis auf `development-conformance.md`.
- Expert Team Operating Model: Verweis auf `workflow.md` + inline Expert Standards und Challenge Protocol.

## Specialist-Agent-Struktur

Alle Specialist-Agents folgen exakt demselben Schema:

1. Frontmatter (name, description)
2. Role (1 Satz)
3. Required Reading: nur `ai4x.agent.md` + `index.yaml`
4. Mandatory Quality Contracts (MUST) — Referenz auf zugehoerige Contracts (keine Duplikation)
5. Responsibilities (MUST)
6. Required Inputs (MUST)
7. Deliverables (MUST)

Ausnahme: `ai4x-implementation` hat zusaetzlich "Tech Stack and Runtime Scope" vor Required Reading.

Output Contracts und Quality/Challenge Rules leben ausschliesslich in den referenzierten Contracts unter `adm/gdl/dev/contracts/`.

Konsequenz fuer `curate`:

- Specialist-Template ist einheitlich und mechanisch erzeugbar.
- Varianz liegt nur in: Role-Text, Responsibilities, Inputs, Deliverables, Contract-Referenzen.
- Required Reading ist fuer alle identisch und darf nicht variiert werden.
- Output Contracts und Challenge Rules werden in den zugehoerigen Quality Contracts erzeugt, nicht in Agents.

## Naming-Konvention

- `ai4X` (grosses X): Projektname, Orchestrator-Agent-Name, Produktbezeichnung in Prosa.
- `ai4x` (lowercase): CLI-Befehl, Dateipfade, Config-Pfade, Shell-Log-Prefix, Specialist-Agent-Namen.

Konsequenz fuer `curate`:

- Generierte Artefakte muessen Naming-Konvention automatisch durchsetzen.
- Orchestrator Frontmatter: `name: ai4X`.
- Specialist Frontmatter: `name: ai4x-<role>`.
- Prosa-Referenzen zum Projekt: `ai4X`.
- CLI/Pfad-Referenzen: `ai4x`.

## index.yaml als Steuerungszentrale

`index.yaml` ist nicht nur Lesereihenspegelung, sondern:

1. Kanonische Dokumentregistrierung (Pfad, Titel, Purpose, Priority, Audience, Scope).
2. Abhaengigkeitsgraph (`depends_on`).
3. Task-spezifische Lesepfade (Feature, Planning, Ops, Onboarding).
4. Glossar-Discoverability-Hinweise.

Konsequenz fuer `curate`:

- Neue Governance-Dokumente muessen automatisch in `index.yaml` registriert werden.
- Abhaengigkeiten muessen korrekt gesetzt sein.
- Task-Pfade muessen bei neuen Dokumenten aktualisiert werden.

## Governance-Glossar

Kanonische Terminologie fuer Gates, Artefakte und Verdicts lebt in `workflow.md` (Governance Glossary).
Alle anderen Dokumente verweisen auf dieses Glossar statt Begriffe neu zu definieren.

Konsequenz fuer `curate`:

- Generierte Workflow-Dateien muessen das Glossar enthalten.
- Generierte Conformance-Contracts muessen auf das Glossar verweisen.
- Begriffe duerfen nicht in Agents oder anderen Contracts eigenstaendig definiert werden.

## Verification-Kompatibilitaet

`make verify` und `make doctor` pruefen:

- `verify.sh`: `.github/agents/ai4x.agent.md`, `CONTRIBUTING.md`, `README.md`, `dev/src/app`, `dev/src/lib`, `dev/tst`, `.gitkeep` Tracking, repo-metadata local check.
- `doctor.sh`: `dev/src/app`, `dev/src/lib`, `dev/tst`, `.github/agents/ai4x.agent.md`.

Konsequenz fuer `curate`:

- `curate` darf keine Dateien erzeugen oder loeschen, die `verify` oder `doctor` brechen.
- Nach jedem `curate`-Run muss `make verify && make doctor` gruen sein.
- Wenn `curate` neue geprueften Pfade einfuehrt, muessen verify/doctor-Skripte mit-aktualisiert werden.

---

```yaml
version: 0.1.0

defaults:
  runtime: altman

clients:
  codex:
    adapter: codex/cli
    run:
      command: ["codex"]
      options:
        - req: ["--model", "{runtime.params.model}"]
        - req: ["--ask-for-approval", "{runtime.params.approval}"]

  copilot:
    adapter: copilot/cli
    run:
      command: ["copilot"]
      options:
        - req: ["--model", "{runtime.params.model}"]

  vscode+copilot:
    adapter: copilot/vscode
    run:
      command: ["code"]
      options:
        - req: ["-n", ".", "--wait"]

runtimes:
  altman:
    client: codex
    params:
      model: "gpt-5.4"
      approval: "on-request"

  nadella:
    client: copilot
    params:
      model: "claude-opus-4.6"

  satya:
    client: vscode+copilot

inventory:
  agentic:
    kob:
      root: "${HOME}/workspace/ai4x/mod/kob/agn"
  cognitive:
    ccp:
      root: "${HOME}/workspace/ai4x/mod/cap/cog/cap"
  technical:
    tcp:
      root: "${HOME}/workspace/ai4x/mod/cap/tec/cap"
    private-tech:
      root: "/Volumes/secure/team/tcp-private/cap"
```