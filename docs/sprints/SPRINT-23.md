# Sprint 23: Content Versioning

**Phase:** Scale  
**Duration:** Week 45 - Week 46  
**Goal:** Implement content versioning so progress data remains valid across content updates.

---

## Summary

Without versioning, updating a question (fixing an answer key, rewording) invalidates all historical progress for that question. This sprint solves that.

## Sprint Backlog (Summary)

| ID | Story | Points |
|---|---|---|
| S23-01 | Add version header to markdown content files | 2 |
| S23-02 | Create content manifest with file checksums | 3 |
| S23-03 | Implement checksum generation in CI | 2 |
| S23-04 | Add content version to persistence schema | 2 |
| S23-05 | Create progress data migration framework | 5 |
| S23-06 | Add content version mismatch warning in UI | 2 |

**Total:** ~16 points

## Key Decisions

- **Version format:** Semantic versioning per exam track (e.g., `NCA-75 v1.2.0`)
- **Checksum:** SHA-256 of file content; stored in manifest JSON
- **Manifest:** `content-manifest.json` at repo root with file -> version -> checksum mapping
- **Migration framework:** Versioned migration scripts (`migrate_v1_to_v2.js` or C#); runs on app startup if content version > stored version
- **UI warning:** Dialog when opening exam if content version changed since last session

## Dependencies

- S9-02 (persistence schema needs content version column)
- S2-06 (content linter can verify version headers)

## Risks

| Risk | Mitigation |
|---|---|
| Migration scripts are error-prone | Extensive unit tests; dry-run mode; backup before migrate |
| Version header forgotten by content authors | Linter enforces header presence in CI |
| Checksum changes on trivial edits (whitespace) | Normalize content before hashing (strip trailing whitespace) |

## Definition of Done

- [ ] All .md files have version headers
- [ ] Content manifest generated in CI
- [ ] Progress data includes content version reference
- [ ] Migration framework handles at least one example migration
- [ ] UI warns users when content has changed
