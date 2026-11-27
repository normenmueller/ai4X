# Bibliographic Description (MUST)

## Purpose

Describe an identifiable publication using verifiable source evidence and terms useful for retrieval.

## Trigger

Use when a requester needs bibliographic metadata, a source-grounded abstract or subject terms for a publication.

## Rules (MUST)

- Inspect the title page, imprint or other identifying passage. Record creators and their roles, title, date, edition or version and publication venue as supported. Treat embedded metadata as candidate evidence. Identify which version a conflicting date or title describes.
- Check persistent identifiers against the described item. Distinguish the publication's own DOI, ISBN or repository identifier from identifiers in its references. Keep an identifier at its supported level, such as a journal ISSN or an edition ISBN.
- Base the abstract on readable content. Cover the question, approach and findings only as far as the source supports them. Label a supplied abstract as such when the full text is unavailable.
- Select terms that capture the central subject and distinctive concepts. Reuse suitable preferred terms from the supplied vocabulary. Explain a proposed new term when an existing term could appear equivalent.

## Fallback

If evidence is missing, return the supported fields and name the specific page, text or identifier needed. If only a title or an unreadable scan is available, leave the unsupported abstract open.

## Minimal Output Contract

Return the requested fields, abstract or subject terms, with source anchors for identity and any disputed fields. Mark unresolved values explicitly.
