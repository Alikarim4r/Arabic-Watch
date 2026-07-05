# Production Change Control

This document defines how curated content moves from review workflows into production tables without weakening public safety gates.

## Principles

1. **UI is audit-only** — Admin buttons update `content_change_batches.status`, not `story_events` / `story_nodes` / `themes` directly.
2. **Approved ≠ live** — `approved` means admin accepted the proposal; public visibility still follows `isFinalContent()`.
3. **SQL is the apply boundary** — Only reviewed, verified SQL may run against Supabase.
4. **Quran text is immutable** — No batch may change `ayahs.text_uthmani`; apply scripts enforce this.
5. **Evidence governance** — Public-final content requires `precise_evidence`, valid `source_id`, and no `needs_review` confidence.

## Allowed apply surface

| Table | Allowed operations | Allowed columns |
|-------|-------------------|-----------------|
| `story_events` | UPDATE | governance fields only |
| `story_nodes` | UPDATE | governance fields only |
| `themes` | UPDATE | governance fields only |
| `event_ayahs` | INSERT/UPSERT | mapping metadata only |

**Forbidden:** `ayahs`, tafsir body text, `DROP`, `TRUNCATE`, bulk `DELETE` (except rollback of inserted `event_ayahs`).

## Roles

| Role | Actions |
|------|---------|
| Reviewer | Create/submit batches, evidence curation |
| Admin | Approve/reject batches, mark applied after manual SQL |
| Engineer | Run apply/verify scripts, execute SQL in Supabase |

## Status model

| Status | Production impact |
|--------|---------------------|
| `draft` | None |
| `submitted` | None |
| `approved` | None until SQL applied |
| SQL generated | Operational step (engineer); not stored in DB |
| `applied` | Audit marker after manual SQL success |
| `rejected` | None |

## Scripts (no live DB in QA)

```bash
# Validation
node scripts/validate_content_change_batch.mjs examples/content_change_batch.sample.json

# Apply (approved only)
node scripts/apply_content_change_batch.mjs --file batch.json --generate-sql --output out.sql

# Verify
node scripts/verify_applied_batch.mjs --file batch.json --sql out.sql
```

`npm run qa` exercises these paths without Supabase credentials.

## Public final gate (unchanged)

`isFinalContent()` remains strict:

- `review_status === 'approved'`
- Valid source citation
- `evidence_status === 'precise_evidence'`
- `evidence_confidence !== 'needs_review'`

The 48 events with `needs_precise_mapping` must not be auto-approved or batch-applied to public-final state.

## Arabic disclaimer

Public and Admin surfaces retain:

> هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

## Related docs

- [Controlled apply workflow](./controlled_apply_workflow.md)
- [Rollback and recovery](./rollback_and_recovery.md)
- [Content promotion workflow](./content_promotion_workflow.md)
- [Quran text import policy](./quran_text_import_policy.md)
