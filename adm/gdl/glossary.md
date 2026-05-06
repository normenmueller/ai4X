# Governance Glossary

Canonical term definitions for the ai4X governance layer.
Terms defined here are the single authoritative source. Other documents reference this file rather than restating definitions.

## Planning Terms

1. **Idea**
   - A vague intent or exploration drafted by the PO in `adm/pbl/`. Temporary.

2. **Epic**
   - A refined requirement scope with acceptance criteria. Promoted to a GitHub Issue with label `epic`.

3. **Story**
   - An implementable unit of work within an Epic. GitHub Issue with label `story`, linked to parent Epic.

4. **Task**
   - An implementation step within a Story. Represented as a checklist within the Story Issue.

## Qualifier Terms

1. **Non-trivial**
   - A change is non-trivial if it adds or modifies behavior, contracts, boundaries, acceptance criteria, or domain types. Mechanical changes (typo fixes, formatting, comment-only edits) are trivial. When in doubt, treat the change as non-trivial.
