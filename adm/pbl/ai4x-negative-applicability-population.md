# Negative-Applicability Metadaten: Systematische Population

## Motivation

Der Capability-Corpus (`crp/cap/`) hat 70+ Capabilities mit `.meta.yaml` Dateien. Drei Felder dienen der negativen Anwendbarkeit — sie kodifizieren, wann eine Capability NICHT verwendet werden soll:

| Feld | Zweck | Aktueller Fuellgrad |
|------|-------|---------------------|
| `conflicts` | "Darf NICHT zusammen mit Capability X verwendet werden" | **0%** (alle 70 leer) |
| `do_not_use_when` | "Verwende diese Capability nicht, wenn Bedingung Y gilt" | ~27% |
| `distinguish_from` | "Verwechsle diese Capability nicht mit Capability Z" | ~27% |

## Problem

Der `requires`-Graph (positive Anwendbarkeit) ist gut befuellt und ermoeglicht Vorwaerts-Komposition: "Was braucht diese Capability?"

Aber `curate` kann NICHT pruefen, ob zwei Capabilities semantisch inkompatibel sind, weil `conflicts` nirgends befuellt ist. Das Ergebnis: `curate` produziert formal gueltige (alle `requires` erfuellt) aber potenziell semantisch inkohärente Capability-Sets.

### Konkretes Beispiel

Zwei hypothetische Capabilities:
- **Capability A**: "Always provide multiple alternatives before deciding"
- **Capability B**: "Make decisive, single-option recommendations without hedging"

Beide sind einzeln sinnvoll. Zusammen widersprechen sie sich. `conflicts: [capability-b]` in A (und umgekehrt) wuerde `curate` erlauben, diesen Widerspruch zu erkennen und den Nutzer zu warnen oder eine Aufloesung zu verlangen.

Analoges gilt fuer `do_not_use_when` (kontextabhaengige Ausschlussregeln) und `distinguish_from` (semantische Abgrenzung bei aehnlich klingenden Capabilities).

## Loesungsrichtung

### Phase 1: Systematische Analyse

Alle 70+ Capabilities paarweise auf semantische Inkompatibilitaet pruefen. Ergebnis: eine Conflicts-Matrix.

Vorgeschlagenes Vorgehen:
1. Pro Domain (Foundation, AI, Analysis, Architecture, Engineering, Strategy) interne Konflikte identifizieren
2. Cross-Domain-Konflikte identifizieren (z.B. Analysis vs. Engineering Reasoning-Stile)
3. `do_not_use_when` fuer alle Capabilities mit kontextabhaengiger Anwendbarkeit befuellen
4. `distinguish_from` fuer alle Capabilities mit semantischer Naehe befuellen

### Phase 2: Population

Befuellen der `.meta.yaml` Dateien — idealerweise als Big-Bang in einem Schritt (analog zu Epic #37 AC-Migration).

### Phase 3: Validierung

CI-Check erweitern: `conflicts`-Symmetrie pruefen (wenn A conflicts B, muss B conflicts A deklarieren).

## Bezug zu bestehenden Artefakten

- **Epic #37**: Definiert `conflicts`, `do_not_use_when`, `distinguish_from` als Schema-Felder — dieses PBL-Item befuellt sie
- **`crp/gov/qlt/capability-authoring-governance.md`**: Authoring-Regeln — muss Population-Anforderungen aufnehmen
- **`utl/cap/checks/capability-meta.mjs`**: Validierung — Symmetrie-Check fuer `conflicts`
- **`adm/pbl/ai4x-context-budget-model.md`**: Context Budget — `conflicts` verhindert auch redundante Capability-Paare, die Budget verschwenden

## Offene Fragen

1. Soll die paarweise Analyse manuell (PO/Capability-Governance) oder LLM-gestuetzt erfolgen?
2. Ab welchem Fuellgrad gilt `conflicts` als "ausreichend"? 100% geprueft (auch wenn viele leer bleiben weil kein Konflikt existiert)?
3. Sollen `conflicts` nur harte Inkompatibilitaeten kodifizieren, oder auch weiche Spannungen ("tension" vs. "conflict")?
