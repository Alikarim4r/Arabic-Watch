# Quality Checklist — قائمة الجودة

Based on the upgrade kit checklist, tracked for Quran Story Universe.

## Content

- [x] Every event has surah + ayah range (`event_ayahs`)
- [x] Every event has `relation_type`
- [x] Every event has `review_status` and `source_status`
- [x] Global educational disclaimer visible in UI
- [ ] Full Quranic ayah text imported from licensed source
- [ ] Every tafsir summary has approved `tafsir_sources` row
- [ ] Complete seed for all 114 surahs in production dataset
- [ ] Scholarly sign-off on lessons and event ordering

## UI / UX

- [x] Full RTL (`lang="ar" dir="rtl"`)
- [x] Mobile-first responsive layout
- [x] Reduced motion support (`prefers-reduced-motion`)
- [x] Loading / empty / error states
- [x] Review badges: مراجَع | قيد المراجعة | يحتاج مصدر
- [x] Study modal source/reference section
- [ ] Admin review dashboard screen

## Graph

- [x] Canvas network preserved
- [x] Filters: type, surah, theme, place
- [x] In-graph search
- [x] Side details panel
- [x] Reset layout + pause motion
- [x] Mobile pan/zoom gestures

## Story Mode

- [x] Event timeline
- [x] Ayah range card
- [x] Theme chips
- [x] Lessons section
- [x] Source references section
- [x] Previous/next navigation
- [x] Open study modal

## Search

- [x] Arabic normalization (tashkeel, hamza, ta marbuta, alif maqsura)
- [x] Exact + normalized modes
- [x] Filters: type, theme, surah, review status

## Technical

- [x] No hard-coded Quranic data in UI files
- [x] JSON data layer + repository abstraction
- [x] Supabase schema in `/supabase/schema.sql`
- [x] Modular `/src` structure
- [ ] Automated tests (normalization, public mode, graph smoke)
- [ ] Supabase live connection

## Scholarly review (pending)

- [ ] Prophet/figure naming audit
- [ ] Event sequence audit (Ibrahim, Maryam, Isa entries)
- [ ] Lesson wording audit
- [ ] Tafsir summary licensing audit
- [ ] Source URLs and licenses documented
