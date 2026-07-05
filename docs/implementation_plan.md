# Quran Story Universe — Implementation Plan

## Executive summary

Transform the single-file HTML prototype into a modular, Arabic-first Quranic story atlas that separates UI from data, supports scholarly review workflows, and can later connect to Supabase without rewriting feature code.

## Current state assessment

| Area | Prototype (expected) | Gap |
|------|---------------------|-----|
| Architecture | Monolithic HTML + embedded JS data | Must split into `/src` modules |
| Content trust | Mixed summaries without review gates | Needs `review_status`, `source_status`, disclaimers |
| Data layer | Hard-coded in UI | JSON repository first, Supabase-ready interface |
| Graph | Canvas physics graph | Needs filters, panel, mobile gestures, motion controls |
| Story Mode | Timeline per prophet | Needs ayah cards, themes, lessons, sources, navigation |
| Search | Basic text match | Needs Arabic normalization + multi-filter search |
| Study | Modal with summaries | Needs source area + review badges |
| Database | None | PostgreSQL schema in `/supabase/schema.sql` |

**Note:** The original `quran_story_universe_10_10_final.html` file was not uploaded to the workspace. The refactor follows the upgrade kit specifications and preserves the luxury dark/gold RTL identity from the repository design reference.

## Target architecture

```
/src
  index.html              # Shell, navigation, app bootstrap
  main.js                 # App orchestration, routing, public mode
  styles/                 # Design tokens, layout, feature styles
  components/             # Shared UI: header, disclaimer, modal, badges
  features/
    graph/                # Canvas graph, filters, details panel
    story/                # Story Mode timeline and navigation
    search/               # Search UI + query engine
    surahs/               # Surah grid
    study/                # Study modal / detail view
  data/
    seed_content.json     # Local demo content (Phase 1–2)
    surahs.json           # Surah metadata
  lib/
    arabicNormalize.js    # Tashkeel + letter normalization
    repository.js         # Abstract data access contract
    localJsonRepository.js
    dataService.js        # Provider switch (local → Supabase)
    state.js              # Lightweight app state
    utils.js
/docs                     # Policies, checklist, this plan
/supabase/schema.sql      # PostgreSQL schema
/backup                   # Original/reference assets
```

## Phase 1 — Refactor prototype

### Goals

1. Preserve luxury visual identity (dark background, gold accents, Amiri/Reem Kufi/Cormorant).
2. Split UI, graph, story, search, surahs, study, and modal logic into modules.
3. Remove hard-coded Quranic/story data from UI files.
4. Load content from `/src/data/*.json` via a repository layer.
5. Keep the demo runnable locally with a static file server (no backend).

### Tasks

- [x] Create folder structure and backup reference.
- [x] Extract CSS variables and base layout into `/src/styles`.
- [x] Implement shared components (disclaimer, review badges, loading/empty/error states).
- [x] Implement `arabicNormalize.js` for search.
- [x] Implement graph canvas with filters, panel, reset/pause, mobile pan/zoom.
- [x] Implement Story Mode with timeline, ayah card, themes, lessons, sources, prev/next.
- [x] Implement search with exact + normalized modes and filters.
- [x] Implement surah grid and study modal with source/review sections.
- [x] Wire `main.js` navigation and public mode (hide unreviewed as final content).

### Public mode rule

Content with `review_status !== 'approved'` is shown with draft badges and a non-final banner. Summaries marked `needs_source` are not presented as verified tafsir.

## Phase 2 — Content and database preparation

### Goals

1. Add Supabase-compatible SQL schema.
2. Expand seed JSON aligned with schema fields.
3. Document source policy, content review policy, and quality checklist.
4. Provide repository abstraction swappable to Supabase.

### Tasks

- [x] Copy schema to `/supabase/schema.sql` (extended with review/source columns).
- [x] Build `/src/data/seed_content.json` with sample prophets: Yusuf, Musa, Ibrahim, Nuh, Maryam, Isa, Muhammad ﷺ.
- [x] Add `/docs/source_policy.md`, `/docs/content_review_policy.md`, `/docs/quality_checklist.md`.
- [x] Implement `dataService.js` with `local` provider and stub `supabase` provider.

## Phase 3 — Pending (future)

- Connect Supabase client and migrate seed to SQL seed scripts.
- Import full Uthmani ayah text from licensed APIs (Tanzil / King Fahd Complex).
- Admin review dashboard for `content_reviews` workflow.
- Semantic search index (embeddings) behind backend API.
- React or Flutter rewrite consuming the same repository contract.
- Automated tests (Vitest): normalization, repository validation, public mode filter.
- Full scholarly review of all events, lessons, and tafsir summaries.

## Content safety constraints (non-negotiable)

1. Do not invent tafsir.
2. Every event links to surah + ayah range + relation type + source/review status.
3. Visible disclaimer: **«هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.»**
4. Unreviewed content must not appear as final in public mode.

## How to run locally

```bash
cd /workspace
npx --yes serve src -p 3000
# open http://localhost:3000
```

Or with Python:

```bash
cd /workspace/src && python3 -m http.server 3000
```

## Migration path to Supabase

1. Run `/supabase/schema.sql` on a PostgreSQL instance.
2. Import JSON seed via a future seed script or Supabase dashboard.
3. Set `dataService.configure({ provider: 'supabase', url, key })`.
4. Implement `supabaseRepository.js` matching `repository.js` interface.

## Success criteria

- Modular codebase with no Quranic data in UI files.
- Working graph, Story Mode, search, surahs, study modal locally.
- Arabic normalization and RTL mobile-first layout.
- Review badges: مراجَع | قيد المراجعة | يحتاج مصدر
- Documentation and schema ready for production content pipeline.
