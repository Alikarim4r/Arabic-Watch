# Supabase Migration Plan

**Project:** Quran Story Universe  
**Schema:** `supabase/schema.sql`  
**Current data mode:** `VITE_DATA_MODE=local` (default)

---

## Goal

Move from read-only local JSON (`src/data/seed_content.json`) to Supabase-backed content with reviewer workflows, while keeping the public app runnable without credentials.

---

## Phase A — Repository (done in code)

| Component | Path | Status |
|-----------|------|--------|
| Env config | `src/config/env.js`, `.env.example` | Ready |
| Local repository | `src/data/repositories/localRepository.js` | Production for demo |
| Supabase placeholder | `src/data/repositories/supabaseRepository.js` | Loads local seed until tables populated |
| Factory + fallback | `src/data/repositories/repositoryFactory.js` | Falls back when URL/key missing |

---

## Phase B — Database setup

1. Create Supabase project.
2. Apply `supabase/schema.sql`.
3. Add columns for governance (recommended migration):

```sql
alter table story_nodes add column if not exists review_status text default 'pending';
alter table story_nodes add column if not exists source_status text default 'pending';
alter table story_events add column if not exists review_status text default 'pending';
alter table story_events add column if not exists source_status text default 'pending';
alter table themes add column if not exists review_status text default 'pending';
```

4. Enable Row Level Security (RLS):
   - **Public read:** `review_status = 'approved'` for anonymous users (optional strict mode).
   - **Reviewer write:** authenticated role `reviewer` or `admin`.

---

## Phase C — Data import

1. Export `seed_content.json` to CSV/SQL or use a seed script.
2. Import order:
   - `tafsir_sources` → `themes` → `story_nodes` → `story_events` → `event_ayahs` → `node_links` → `eras` (JSON column or separate table)
3. Preserve existing IDs (`yusuf`, `musa_01_...`) for UI deep links.
4. Do **not** import prototype HTML tafsir blocks as verified entries.

---

## Phase D — Wire Supabase client

1. Add dependency: `@supabase/supabase-js`.
2. In `supabaseRepository.js`:
   - `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`
   - Map PostgREST rows → current UI bundle shape via `mapSupabaseBundle()`.
3. Implement `submitReviewAction()`:
   - Insert into `content_reviews`
   - Update target row `review_status` / `source_status`
   - Optional RPC for atomic review + audit log

---

## Phase E — Admin auth

1. Supabase Auth (email magic link or OAuth) for reviewers only.
2. Hide `#admin-review` behind auth gate in production.
3. Keep mock admin available in local demo with banner.

---

## Phase F — Licensed ayah text

1. Import official ayah text into `ayahs` table (Tanzil / King Fahd Complex license).
2. UI reads text only from approved source rows.
3. Until then: keep reference-only `event_ayahs` fields.

---

## Rollback strategy

Set `VITE_DATA_MODE=local` — app uses JSON with zero Supabase dependency.

---

## Checklist before switching production traffic

- [ ] Supabase tables populated and indexed
- [ ] RLS policies tested (public cannot write)
- [ ] Review actions persist and audit in `content_reviews`
- [ ] `npm run qa` passes with `VITE_DATA_MODE=supabase`
- [ ] Scholar sign-off on approved subset
- [ ] Licensed Quran text imported (if displaying full ayah)
