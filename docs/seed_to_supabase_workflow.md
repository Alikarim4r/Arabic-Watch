# Seed to Supabase Workflow

How to export local JSON seed content into Supabase SQL without a live connection during export.

## Prerequisites

1. Supabase project created
2. Migrations applied:
   - `supabase/migrations/001_content_review_actions.sql`
   - `supabase/migrations/002_core_content_tables.sql`

## Step 1 — Generate SQL

```bash
node scripts/export_seed_to_supabase_sql.mjs
```

Reads:

- `src/data/seed_content.json`
- `src/data/surahs.json`

Writes:

- `supabase/seed/001_seed_content.sql`

The script:

- Uses `INSERT ... ON CONFLICT DO UPDATE` for idempotent loads
- Preserves `review_status`, `source_status`, `evidence_status`, `evidence_confidence`
- Does **not** upgrade pending content to approved
- Escapes Arabic text safely (`'` → `''`)
- Does **not** insert licensed full Quran text into `ayahs`

## Step 2 — Load into Supabase

In Supabase SQL Editor (or `psql`):

```sql
-- Run generated seed file
\i supabase/seed/001_seed_content.sql
```

Or paste the file contents into the SQL editor.

## Step 3 — Configure app

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4 — Verify

1. Public app loads — non-final content still shows review badges
2. `isFinalContent()` — only 6 events remain public-final (same as local seed)
3. Admin Review → دفعات المحتوى tab loads
4. Reviewer actions persist to `review_actions` without mutating content

```bash
npm run qa
```

## Fallback behavior

If Supabase credentials are missing or content tables are empty/missing:

- App falls back to local JSON
- Console warning explains the reason
- No crash

## Re-export after seed changes

When `seed_content.json` changes (e.g. after curated evidence merge):

```bash
node scripts/export_seed_to_supabase_sql.mjs
# Re-run SQL against Supabase
```

## Quran text

Full Quran ayah rows belong in `ayahs` via the licensed import pipeline (Phase 7):

```bash
node scripts/validate_quran_text.mjs your/quran.json
node scripts/import_quran_text.mjs your/quran.json
# Separate SQL export or Supabase insert job for ayahs table
```

Do not add Quran text to `export_seed_to_supabase_sql.mjs`.

See also: `docs/content_tables_migration.md`, `docs/quran_text_import_policy.md`.
