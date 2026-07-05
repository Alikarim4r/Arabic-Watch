You are building Quran Story Universe, an Arabic-first Quranic story atlas.

Current state:
- There is one HTML prototype with a beautiful UI, Canvas physics graph, Story Mode, search, surah grid, and study modal.
- The current data is embedded in JavaScript and is not enough for a trusted Quranic product.
- Rebuild the project as a professional, scalable, source-backed application.

Main goal:
Transform the prototype into a production-ready Quranic knowledge platform while preserving the luxury visual identity.

Mandatory requirements:
1. Separate data from UI.
2. Create a clean data layer using Supabase/PostgreSQL.
3. Use the provided schema as the starting point:
   - surahs
   - ayahs
   - tafsir_sources
   - tafsir_entries
   - story_nodes
   - story_events
   - event_ayahs
   - node_links
   - themes
   - ayah_themes
   - content_reviews
4. Do not hard-code Quranic content inside UI files.
5. Every story claim must be linked to:
   - surah number
   - ayah number or ayah range
   - source type
   - review status
6. Tafsir must not be invented.
   Use short educational summaries only when the source is recorded.
7. Add a visible disclaimer:
   "هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة."
8. Add an admin/reviewer workflow:
   - pending
   - approved
   - rejected
   - needs_revision
9. Build the frontend with Arabic RTL excellence:
   - responsive mobile-first
   - dark luxury theme
   - accessible typography
   - smooth animations
   - reduced-motion support
10. Improve the graph:
   - filters by prophet/theme/surah/place
   - node details panel
   - search inside graph
   - stable layout option
   - mobile gesture support
11. Improve Story Mode:
   - event timeline
   - ayah range card
   - themes
   - lessons
   - source references
   - next/previous navigation
12. Improve search:
   - exact search
   - normalized Arabic search
   - tag filter
   - surah filter
   - story filter
   - future semantic search-ready architecture
13. Add tests:
   - data validation
   - Arabic normalization
   - graph rendering smoke test
   - Story Mode route test
   - no unreviewed content shown in public mode
14. Keep all code clean and modular.

Recommended architecture:
- /src/components
- /src/features/graph
- /src/features/story
- /src/features/search
- /src/features/surahs
- /src/features/study
- /src/data
- /src/lib/arabicNormalize.ts
- /supabase/schema.sql
- /supabase/seed_sample.sql
- /docs/content_policy.md
- /docs/source_policy.md

Content safety rules:
- Do not generate tafsir by AI as final religious interpretation.
- Any AI answer must be labeled as educational summary and must cite stored sources.
- If no approved source exists, show: "لا توجد مادة مراجعة كافية لهذا السؤال بعد."
- Do not show weak historical claims as certain.

Deliverables:
1. Refactored frontend.
2. Supabase schema.
3. Seed sample for Yusuf, Musa, Ibrahim, Nuh, Maryam, Isa, Muhammad ﷺ.
4. Admin review screen.
5. Public app screen.
6. Search and graph improvements.
7. README explaining setup, sources, and review workflow.
8. Checklist of remaining content work.

Start by creating the folder structure, moving the current UI into components, then implement the schema and connect mock data through a repository layer before using real Supabase.
