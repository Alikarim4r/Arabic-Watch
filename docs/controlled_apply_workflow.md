# Controlled Apply Workflow

Phase 10 introduces a **SQL-only apply path** for approved `content_change_batches`. The Admin UI records batch status but **never mutates** production `story_*` tables.

## Why the UI does not apply batches

- Prevents accidental promotion of pending or unmapped content
- Keeps Quran text (`ayahs.text_uthmani`) immutable via apply tooling
- Requires human review of generated SQL before execution
- Works without a live Supabase connection during QA

## End-to-end flow

```
Admin Review / Evidence Curation
        ↓
content_change_batches (draft → submitted)
        ↓
Admin approves batch (status: approved) — audit only in UI
        ↓
Engineer: validate + apply_content_change_batch.mjs
        ↓
Generated SQL in supabase/generated/ or examples/
        ↓
Engineer: verify_applied_batch.mjs
        ↓
Manual SQL execution (Supabase SQL editor or CI)
        ↓
Admin marks batch applied (status: applied) — audit trail
        ↓
Public app reads rows via isFinalContent()
```

## 1. Validate the batch

Always validate before apply:

```bash
node scripts/validate_content_change_batch.mjs path/to/batch.json
```

Apply tooling re-runs validation plus stricter apply rules:

- `batch.status` must be `approved`
- No Quran text mutation fields
- Approved/final items require `source_id`, `evidence_status=precise_evidence`, and no `needs_review` confidence
- Items must pass `isFinalContent()` parity checks

## 2. Dry-run (report only)

```bash
node scripts/apply_content_change_batch.mjs \
  --file examples/content_change_batch.approved.sample.json \
  --dry-run
```

Prints what would change without writing files.

## 3. Generate apply SQL

```bash
node scripts/apply_content_change_batch.mjs \
  --file examples/content_change_batch.approved.sample.json \
  --generate-sql \
  --output supabase/generated/apply_batch_<id>.sql
```

Default behavior is **SQL generation only** — the script does not connect to Supabase.

Generated SQL:

- Wrapped in `BEGIN;` … `COMMIT;`
- Comments: batch id, generated at, dry-run status, affected records
- Updates only allowed governance columns on `story_events`, `story_nodes`, `themes`
- Upserts `event_ayahs` from validated evidence mappings
- Does **not** update `ayahs.text_uthmani` or tafsir body text

## 4. Generate rollback SQL (optional)

```bash
node scripts/apply_content_change_batch.mjs \
  --file examples/content_change_batch.approved.sample.json \
  --generate-sql \
  --generate-rollback \
  --output supabase/generated/apply_batch_<id>.sql \
  --rollback-output supabase/generated/rollback_batch_<id>.sql
```

Use `--strict` to warn when `previous_values` are missing (partial rollback).

## 5. Verify SQL before applying

```bash
node scripts/verify_applied_batch.mjs \
  --file examples/content_change_batch.approved.sample.json \
  --sql supabase/generated/apply_batch_<id>.sql
```

Verification checks:

- Transaction block present
- Batch id referenced in comments
- Only allowed tables/columns
- No `DROP`, `TRUNCATE`, or unexpected `DELETE`
- No `text_uthmani` or `ayahs` table writes
- No approving content without `precise_evidence`

## 6. Apply manually

1. Review SQL in a second pair of eyes (admin + engineer).
2. Run in Supabase SQL editor or approved CI migration path.
3. Confirm affected rows match the batch report.
4. Mark batch `applied` in Admin for audit (UI status only).

## Sample files

| File | Purpose |
|------|---------|
| `examples/content_change_batch.approved.sample.json` | Small approved example (NOT auto-applied) |
| `examples/apply_batch.sample.sql` | Sample generated apply SQL |
| `examples/rollback_batch.sample.sql` | Sample rollback SQL |

## Local mode

`npm run qa` and local Admin run without Supabase credentials. Content Batches tab shows instructional guidance only; apply scripts run offline against JSON + seed validation context.
