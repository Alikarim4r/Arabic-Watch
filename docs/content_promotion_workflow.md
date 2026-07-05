# Content Promotion Workflow

Controlled promotion moves **proposed** reviewed changes toward production content without automatic UI mutation.

## Pipeline overview

```
Evidence Curation / Admin Review
        ↓
review_actions (audit log — Phase 8)
        ↓
evidence_patch_submissions OR content_change_batches (proposed changes)
        ↓
Admin approve batch (status: approved)
        ↓
Admin mark applied (status: applied) — audit only in UI
        ↓
Controlled promotion job (future/manual) mutates story_* tables
        ↓
Public app reads promoted rows via isFinalContent()
```

## content_change_batches

| Status | Meaning |
|--------|---------|
| `draft` | Reviewer composing proposed changes |
| `submitted` | Ready for admin review |
| `approved` | Admin accepted proposal — **still not live** |
| `applied` | Marked for/after controlled apply job |
| `rejected` | Admin rejected proposal |

### Rules

1. **Reviewers** can create/submit batches.
2. **Admins** approve, reject, or mark `applied`.
3. **UI buttons never directly UPDATE** `story_events` / `story_nodes` public fields.
4. **`applied` does not auto-promote** in Phase 9 — requires a separate controlled script/job.

## Building a batch

```bash
node scripts/build_content_change_batch.mjs examples/evidence_patch.sample.json
node scripts/validate_content_change_batch.mjs examples/content_change_batch.sample.json
```

Output: `examples/content_change_batch.sample.json` with `payload.items[]` of proposed changes only.

## Validation (final gate parity)

`validate_content_change_batch.mjs` rejects items that would violate public final rules:

- No `needs_review` confidence on approved/final items
- No approved event without `precise_evidence`
- No approved item without valid `source_id`
- No Quran `text_uthmani` modifications in batches
- Valid ayah ranges and known `event_id` / `source_id`

## Why content is not auto-promoted

1. **Scholarly safety** — accidental approve clicks must not publish content.
2. **Audit trail** — batches preserve proposed payloads separately from live tables.
3. **Public gate integrity** — `isFinalContent()` continues to enforce evidence governance.
4. **48 events** still `needs_precise_mapping` — batches cannot bypass this without explicit curated evidence.

## Admin UI — دفعات المحتوى

Tab in Admin Review shows:

- Batch list + status badges
- Payload preview
- Validation summary
- Actions: submit / approve / reject / mark applied

Local mode: session-only mock batches with demo banner.

## After marking `applied`

Run a controlled promotion job (future phase) that:

1. Reads `content_change_batches` where `status = applied`
2. Applies each item to content tables in a transaction
3. Re-validates `isFinalContent()` per row
4. Logs apply results — never silently approves pending content

See also: `docs/review_persistence_workflow.md`, `docs/seed_to_supabase_workflow.md`.
