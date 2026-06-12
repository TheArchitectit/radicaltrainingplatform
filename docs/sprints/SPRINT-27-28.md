# Sprints 27-28: Multi-Vendor Plugin Architecture

**Phase:** Enterprise  
**Duration:** Weeks 53-56 (4 weeks)  
**Goal:** Enable multiple certification vendors beyond Nutanix via a plugin architecture.

---

## Summary

Transform hardcoded Nutanix-specific data into a plugin system where exam vendors, blueprints, and reference materials are loaded from JSON manifests at runtime.

## Key Deliverables

| ID | Deliverable | Points |
|---|---|---|
| S27-01 | Design IExamMetadataProvider interface | 2 |
| S27-02 | Design IBlueprintProvider interface | 2 |
| S27-03 | Design IReferenceProvider interface | 2 |
| S27-04 | Implement JSON manifest loader | 3 |
| S27-05 | Migrate Nutanix data to JSON manifests | 3 |
| S27-06 | Add AWS-SAA exam track manifest and content | 5 |
| S27-07 | Add AZ-104 exam track manifest and content | 5 |
| S27-08 | Plugin discovery (load from directory) | 3 |
| S27-09 | Plugin validation (schema + checksum) | 2 |

**Total:** ~27 points over 2 sprints

## Key Decisions

- **Manifest format:** JSON with schema version, vendor metadata, blueprint file references, question directory references
- **Plugin directory:** `~/.config/RadicalTrainingPlatform/plugins/` or portable directory
- **Provider registration:** Auto-discovered at startup; validated; loaded into DI container
- **AWS-SAA and AZ-104:** Full exam tracks with blueprints and initial question sets (50+ each)
- **Backward compatibility:** Nutanix built-in plugins ensure existing users unaffected

## Dependencies

- S3-03, S3-04 (IBlueprintService, IReferenceService interfaces)
- S23 (content versioning for plugin content updates)
- Phase 3 stable (v1.0)

## Risks

| Risk | Mitigation |
|---|---|
| JSON manifest schema requires versioning | Schema version field; migration path documented |
| Third-party plugin security | Validation + sandbox; signed manifests in future |
| Content authoring for new vendors is slow | Start with 50 questions each; expand in later sprints |
