# Content Review Policy — سياسة مراجعة المحتوى

## Review statuses

| Status | Arabic badge | Public display |
|--------|--------------|----------------|
| `approved` | مراجَع | May be shown as reviewed educational content |
| `pending` | قيد المراجعة | Visible with draft banner — not final tafsir |
| `needs_source` | يحتاج مصدر | Summary restricted; sources section must prompt for citation |

## Source statuses

| Status | Meaning |
|--------|---------|
| `cited` | At least one stored source reference exists |
| `pending` | Source identified but not fully verified |
| `none` | No acceptable source on record — do not present as verified |

## Workflow

1. **Authoring** — Content editor adds event with ayah range, relation type, and provisional summary.
2. **Source attachment** — Link `tafsir_sources` or Quranic reference rows.
3. **Scholarly review** — Reviewer sets `content_reviews.status` to `approved`, `rejected`, or `needs_revision`.
4. **Publication** — Public mode (`publicMode: true`) uses `isFinalContent()` to avoid treating drafts as authoritative.

## Reviewer responsibilities

- Verify prophet/figure names and honorifics.
- Verify event order when derived from tafsir (mark `certainty_level` accordingly).
- Reject AI-only tafsir with no citation.
- Confirm lessons are clearly framed as educational reflections, not fatwa.

## Database mapping

Local JSON uses:

- `review_status` on nodes, events, themes
- `source_status` on nodes and events
- `sources[]` on events with `{ source_id, note_ar }`

Supabase uses `content_reviews` table for audit trail; app should sync approved status to content rows.

## Rejection messages (UI)

When content is insufficient:

> **لا توجد مادة مراجعة كافية لهذا السؤال بعد.**

## Public mode rules

1. Never hide draft content entirely in demo mode — show badges instead.
2. Do not label unapproved summaries as "verified tafsir".
3. Always show the global educational disclaimer.
