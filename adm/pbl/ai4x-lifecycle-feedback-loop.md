# Lifecycle Feedback Loop: evolve / assess

> **Status:** Parked — depends on `curate` being conceptually defined. Revisit when `curate` design work begins.

## Motivation

Das ai4X Operating Model ist aktuell ein Open-Loop-System: `curate` produziert ein Team, `spawn` materialisiert es, danach endet der Lifecycle. Es gibt keinen designten Mechanismus, um:

1. **Drift zu erkennen** — zwischen dem Corpus-Stand zum Zeitpunkt der Curation und dem aktuellen Corpus-Stand
2. **Performance zu bewerten** — ob ein kuratiertes Team tatsaechlich effektiv arbeitet
3. **Korrekturen zurueckzufuehren** — Erkenntnisse aus der Runtime zurueck in Corpus oder Team Declaration

Ohne Feedback-Loop waechst die Wahrscheinlichkeit suboptimaler Kompositionen mit der Corpus-Groesse, ohne dass das System empirische Signale hat, um seine Curation-Entscheidungen zu verbessern.

## Problem

### Drift-Problem

Wenn der Corpus sich weiterentwickelt (neue Capabilities, geaenderte Contracts, befuellte `conflicts`), werden bestehende Team Declarations potenziell stale. Es gibt keinen Mechanismus, der erkennt: "Dein Team wurde mit Corpus-Version X kuratiert, aber der Corpus ist jetzt bei Version Y — diese Aenderungen betreffen Dein Team."

### Bewertungs-Problem

`curate` trifft Kompositions-Entscheidungen (welche Capabilities, welche Topologie, welches Binding), aber es gibt keine Rueckmeldung darueber, ob diese Entscheidungen in der Praxis funktionieren. Das System kann nicht lernen, welche Capability-Kombinationen effektiv sind und welche nicht.

### Deaktivierungs-Problem

`spawn` aktiviert; nichts deaktiviert. Fuer dateibasierte Hosts mag das trivial sein (Dateien loeschen), aber das Operating Model sollte den Lifecycle explizit besitzen — insbesondere fuer Hosts, bei denen Aktivierung Konfigurationsmutationen beinhaltet.

## Loesungsrichtung

### Neuer Lifecycle-Schritt: `evolve` (oder `refresh`)

Erkennt Drift zwischen kuratiertem Team und aktuellem Corpus:
- Vergleicht den Corpus-Stand bei Curation (gespeichert in Team Declaration Metadata) mit dem aktuellen Stand
- Identifiziert betroffene Capabilities: geaendert, entfernt, neue `conflicts` hinzugefuegt
- Empfiehlt Re-Curation oder bestaetigt: "Team ist aktuell"

### Assessment-Signal (Design Target)

Ein optionaler Feedback-Mechanismus, der Runtime-Beobachtungen zurueck in die Curation-Entscheidungen fuehrt:
- Welche Capabilities wurden vom Agent tatsaechlich angewendet?
- Welche Governance-Regeln wurden eingehalten/verletzt?
- Welche Topologie-Entscheidungen fuehrten zu Reibung?

Hinweis: Dieses Signal ist host-abhaengig und erfordert Instrumentierung. Es ist ein Design Target, keine kurzfristige Anforderung.

### Deaktivierung: `despawn` (oder in `spawn --remove`)

Explizite Umkehr von `spawn`: entfernt materialisierte Artefakte sauber, unabhaengig vom Host.

## CLI-Implikation

Das aktuelle CLI-Modell (`curate`, `spawn`, `doctor`) koennte erweitert werden:
- `ai4x evolve` — prueft Drift, empfiehlt Re-Curation
- `ai4x spawn --remove` — deaktiviert ein materialisiertes Team
- `doctor` koennte Drift-Checks als Teil der Validierung ausfuehren

## Bezug zu bestehenden Artefakten

- **`doc/arc/08_concepts.md`**: Operating Model — muss den Lifecycle um `evolve` erweitern
- **`adm/pbl/ai4x-curate.md`**: `curate`-Pipeline — Team Declaration muss Corpus-Versionsstand speichern
- **`adm/gdl/glossary.md`**: Neue Begriffe: Drift, Lifecycle Feedback, Assessment Signal
- **CLI-Modell** (`README.md`, `copilot-instructions.md`): CLI-Oberflaeche muss ggf. erweitert werden

## Offene Fragen

1. Gehoert `evolve` in die CLI-Oberflaeche als eigenes Sub-command, oder ist es Teil von `doctor`?
2. Welche Corpus-Versionierung nutzen wir? Git-Commit-Hash zum Zeitpunkt der Curation?
3. Ist das Assessment-Signal realistisch implementierbar, oder ist es ein reines Design Target fuer spaetere Iterationen?
4. Braucht `despawn` wirklich ein eigenes Konzept, oder genuegt `spawn --remove`?
