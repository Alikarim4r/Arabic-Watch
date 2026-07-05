# Rollback and Recovery

When an approved batch is applied via generated SQL, rollback uses **`previous_values`** captured in the batch payload at approval time.

## Generating rollback SQL

```bash
node scripts/apply_content_change_batch.mjs \
  --file path/to/approved_batch.json \
  --generate-rollback \
  --rollback-output supabase/generated/rollback_batch_<id>.sql
```

Rollback SQL:

- Restores governance fields (`review_status`, `source_status`, `evidence_status`, `evidence_confidence`, `source_id`, `reviewer_note`) from `previous_values`
- Can `DELETE` an `event_ayahs` row if `previous_values.event_ayah_exists === false` (row was inserted by the batch)
- Wrapped in `BEGIN;` … `COMMIT;`

## Partial rollback warning

If an item lacks `previous_values`, the script warns:

> Rollback is partial because previous values were not provided.

In that case:

- Document what was changed manually
- Export current row state from Supabase before apply (backup query)
- Prefer batches with complete `previous_values` for production changes

Use `--strict` on apply generation to surface missing rollback metadata early.

## Verifying rollback SQL

Run the same verifier (rollback files may contain allowed `DELETE FROM event_ayahs`):

```bash
node scripts/verify_applied_batch.mjs \
  --file path/to/batch.json \
  --sql supabase/generated/rollback_batch_<id>.sql
```

## If a bad batch was applied

1. **Stop** — do not mark additional batches applied.
2. **Assess** — identify rows touched (match batch report / SQL comments).
3. **Rollback** — run verified rollback SQL if `previous_values` exist; otherwise restore from Supabase point-in-time backup or manual UPDATE from exported snapshot.
4. **Reject** the batch in Admin (`rejected`) and file an incident note in `reviewer_note` / audit log.
5. **Re-validate** public content: no pending or `needs_precise_mapping` events should pass `isFinalContent()`.
6. **Fix forward** — correct the batch JSON, re-approve, regenerate SQL, verify, re-apply.

## Quran text immutability

Apply tooling **refuses** batches that modify Quran text. Rollback does not restore `text_uthmani` because apply never changes it. Full Quran import remains a separate licensed pipeline (`docs/quran_text_import_policy.md`).

## Prevention checklist

- [ ] Batch validated with `validate_content_change_batch.mjs`
- [ ] Batch status is `approved`
- [ ] Apply dry-run reviewed
- [ ] `verify_applied_batch.mjs` passed
- [ ] `previous_values` present for governance changes
- [ ] Second reviewer signed off on SQL
- [ ] Admin `applied` status updated after successful execution
