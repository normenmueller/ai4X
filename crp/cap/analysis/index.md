# Analysis Capability Catalog

This index exposes the local capability selection surface for `analysis`.

## Organization

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `function-deduplication` | `function-deduplication.md` | Remove duplicate function statements without losing meaningful distinctions. | Use when a normalized function set may contain duplicate or near-duplicate function statements. | `[]` | `[]` | `[function-extraction]` | `[]` |
| `function-extraction` | `function-extraction.md` | Extract normalized business or organizational functions from source material. | Use when source material contains business or organizational work statements that must be normalized into functions. | `[]` | `[]` | `[statement-extraction-rigor]` | `[]` |
| `function-ownership-allocation` | `function-ownership-allocation.md` | Allocate clear accountability for each materially relevant function without collapsing ownership into informal group responsibility. | Use when assigning accountability for materially relevant functions across teams, roles, or organizational units. | `[]` | `[]` | `[function-extraction]` | `[]` |
| `value-stream-organization-design` | `value-stream-organization-design.md` | Design target organizations around end-to-end value flow instead of accidental internal boundaries. | Use when designing or reviewing organizational structures against end-to-end value flow. | `[]` | `[]` | `[function-extraction, function-deduplication, function-ownership-allocation]` | `[]` |

## Role Assessment

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `comparison-dimension-discipline` | `comparison-dimension-discipline.md` | Ensure that comparative analysis uses stable, decision-relevant dimensions instead of ad hoc framing. | Use when comparing alternatives, roles, proposals, or candidate options that need a stable evaluation frame. | `[]` | `[]` | `[statement-extraction-rigor, fact-interpretation-separation]` | `[]` |
| `evidence-typing-discipline` | `evidence-typing-discipline.md` | Keep material claims traceable by marking whether they are directly observed or inferred. | Use when materially relevant claims, findings, or recommendations depend on source evidence or observed outputs. | `[]` | `[]` | `[fact-interpretation-separation]` | `[]` |
| `fact-interpretation-separation` | `fact-interpretation-separation.md` | Separate observed statements from inference, synthesis, and judgment. | Use when deriving interpretations, conclusions, or recommendations from source statements or observed evidence. | `[]` | `[]` | `[statement-extraction-rigor]` | `[]` |
| `statement-extraction-rigor` | `statement-extraction-rigor.md` | Extract all materially relevant statements from source material without collapsing distinct claims. | Use when extracting materially relevant statements from documents, transcripts, requirements, or review artifacts. | `[]` | `[]` | `[deterministic-reasoning]` | `[]` |

## Specification

| ID | File | Purpose | Use When | Do Not Use When | Distinguish From | Requires | Conflicts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ambiguity-detection` | `ambiguity-detection.md` | Detect terms or clauses that allow materially different interpretations. | Use when reviewing text, specifications, contracts, or guidance that may allow materially different readings. | `[]` | `[]` | `[statement-extraction-rigor]` | `[]` |
| `contradiction-detection` | `contradiction-detection.md` | Detect when two statements cannot both be true within the same scope and time frame. | Use when reviewing statements, requirements, or contracts for claims that may not both hold in the same scope and time frame. | `[]` | `[]` | `[fact-interpretation-separation]` | `[]` |
| `overlap-detection` | `overlap-detection.md` | Detect materially relevant duplication of responsibility, output, or control intent. | Use when reviewing responsibilities, outputs, or control boundaries for possible duplication. | `[]` | `[]` | `[statement-extraction-rigor]` | `[]` |
| `semantic-conflict-detection` | `semantic-conflict-detection.md` | Detect materially incompatible intent, behavior, or governance semantics even when statements are not literally contradictory. | Use when reviewing policies, processes, models, or interfaces that may be materially incompatible without being literally contradictory. | `[]` | `[]` | `[fact-interpretation-separation, contradiction-detection]` | `[]` |
