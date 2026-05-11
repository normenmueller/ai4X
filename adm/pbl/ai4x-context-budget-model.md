# Context-Budget-Modell fuer Capability-Komposition

## Motivation

Wenn `curate` Capabilities aus dem Corpus (`crp/cap/`) zu einem CCC komponiert, kann das resultierende Instruktionsset das Context-Fenster des Ziel-Agent-Hosts sprengen. Aktuell gibt es kein Modell, das dieses Risiko adressiert:

- Kein Token-Estimat pro Capability
- Kein Budget-Ceiling pro CCC, parametrisiert nach Agent Host
- Keine Truncation-Strategie bei Budgetueberschreitung

Ohne Context-Budget-Modell produziert `curate` formal korrekte, aber praktisch degradierte Kompositionen — der Agent erhaelt Instruktionen, die sein Context-Fenster ueberlasten.

## Problem

Eine typische Capability hat 500–2000 Tokens. Ueber `requires`-Ketten kann ein einzelner Agent 10–20 Capabilities akkumulieren. Das ergibt 10.000–40.000 Tokens Instruktionstext — bevor jeglicher Task-Kontext hinzukommt.

Die Materialization Boundary definiert `spawn` als reine Funktion. Budget-Entscheidungen gehoeren deshalb in `curate`, nicht in `spawn` — sonst muesste `spawn` Capabilities silent droppen, was die Boundary als stateless Transformation bricht.

## Loesungsrichtung

### Neues Meta-YAML Feld

`token_estimate` als deterministisch berechnetes Feld in jeder `.meta.yaml`. Berechnung aus Wortanzahl der `.md`-Datei (kein LLM noetig).

Abhaengigkeit: Epic #37 (Schema-First Capability Metadata Redesign) definiert das zentrale Schema. `token_estimate` waere ein neues Feld in diesem Schema.

### Budget-Ceiling

Pro CCC ein `context_budget`, parametrisiert nach Ziel-Agent-Host (unterschiedliche Hosts haben unterschiedliche Context-Fenster).

### Tiered Truncation-Strategie

| Tier | Kriterium | Verhalten |
|------|-----------|-----------|
| Tier 1 (critical) | Foundation capabilities + direkte `requires` | Nie abschneidbar — Budgetueberschreitung = Composition invalid |
| Tier 2 (core) | Explizit selektierte Capabilities | Volltext; bei Druck: Purpose + Rules (MUST) only |
| Tier 3 (supplementary) | Transitive `requires` (2. Ordnung+) | Bei Druck: Purpose + Rules; bei weiterem Druck: Purpose-Einzeiler |

Wenn Tier 1 allein das Budget sprengt, ist die Composition ungueltig und `curate` meldet einen Fehler.

## Bezug zu bestehenden Artefakten

- **Epic #37**: Schema-Definition — `token_estimate` als neues Schema-Feld
- **`crp/gov/qlt/capability-authoring-governance.md`**: Metadata Contract — muss `token_estimate` aufnehmen
- **`doc/arc/08_concepts.md`**: Materialization Boundary — Budget-Entscheidung gehoert architektonisch in `curate`
- **`adm/pbl/ai4x-curate.md`**: `curate`-Pipeline — Budget-Check als Validierungsschritt

## Offene Fragen

1. Soll `token_estimate` manuell gepflegt oder automatisch berechnet werden (z.B. via CI-Check)?
2. Welche Host-Budget-Referenzwerte sind realistisch (z.B. Copilot ~8k system prompt, Claude ~200k)?
3. Soll die Truncation deterministisch sein (feste Tier-Regeln) oder soll `curate` LLM-gestuetzt entscheiden, welche Sections am wenigsten informationsverlust verursachen?
