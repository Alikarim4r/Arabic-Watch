# Content Tables Migration (Phase 9)

Phase 9 adds Supabase PostgreSQL tables for Quranic story content with governance columns matching the local seed JSON.

## Migration file

`supabase/migrations/002_core_content_tables.sql`

Run after Phase 8 migration (`001_content_review_actions.sql`).

## Tables

| Table | Purpose |
|-------|---------|
| `surahs` | Surah metadata (114 rows from `surahs.json`) |
| `ayahs` | Licensed Quran text only — **not populated by seed export** |
| `tafsir_sources` | Registered source catalog |
| `tafsir_entries` | Tafsir summaries (future; not in current seed export) |
| `themes` | Thematic axes |
| `story_nodes` | Prophets, places, themes, etc. |
| `story_events` | Story timeline events with evidence governance fields |
| `event_ayahs` | Precise ayah references for events |
| `node_links` | Graph edges |
| `ayah_themes` | Ayah ↔ theme links (future) |
| `content_reviews` | Legacy/simple review log |
| `content_change_batches` | Controlled promotion payloads |

## Governance columns

Applied to nodes, events, themes (where relevant):

- `review_status` — `approved` | `pending` | `needs_source`
- `source_status` — `cited` | `pending` | `none` | `needs_source`
- `evidence_status` — `precise_evidence` | `needs_precise_mapping`
- `evidence_confidence` — `quran_explicit` | `tafsir_based` | `scholarly_inference` | `needs_review`
- `source_id`, `reviewer_note`, timestamps

These mirror the app's `isFinalContent()` gate.

## Public read model

RLS uses `row_is_public_final()` — same rules as the public final gate:

- `review_status = approved`
- `source_status` not `none` / `needs_source`
- Events also require `evidence_status = precise_evidence` and confidence ≠ `needs_review`

Anonymous users see only public-final-safe rows. Reviewers/admins see the full queue.

## Seed loading

See `docs/seed_to_supabase_workflow.md`.

## What is NOT migrated automatically

- Full Quran `ayahs` text (requires licensed import — Phase 7)
- `eras` timeline (remains in local JSON until a future table)
- Auto-promotion of review actions into approved content

See also: `docs/content_promotion_workflow.md`, `docs/supabase_rls_policy.md`.
