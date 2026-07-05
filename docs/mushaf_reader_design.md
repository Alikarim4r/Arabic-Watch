# Mushaf Reader Design

## Purpose

The **المصحف** (`#mushaf`) section is a full Quran reading interface in Quran Story Universe. It complements the thematic surah grid (`#surahs` / المصحف الموضوعي) by offering sequential surah/ayah navigation, reading preferences, bookmarks, and deep links from Story Mode and Study Modal.

The reader is wired to the existing Quran text import pipeline via repository methods — it does not embed, scrape, or invent Quran text.

## Quran Text Import Pipeline

The reader uses these repository methods (attached in `src/lib/quranText.js`):

| Method | Role |
|--------|------|
| `isQuranTextImported()` | `true` only when the index reports a full 6236-ayah import |
| `getAyah(surahId, ayahNumber)` | Single ayah with `text_uthmani` or safe placeholder |
| `getAyahRange(surahId, from, to)` | Range of ayah objects |
| `getSurahAyahs(surahId)` | All ayahs for a surah |

Licensed text is imported offline via `scripts/import_quran_text.mjs` into `src/data/quran/quran_text.index.json`. The app loads the index at runtime; no network fetch of Quran text occurs.

## Behavior Before Full Quran Text Import

When `isQuranTextImported()` is `false` (current default):

- The reader shows: **النص القرآني الكامل غير مستورد بعد. يظهر هنا مرجع الآية فقط.**
- Each ayah displays an Arabic reference only, e.g. `سورة البقرة — الآية 31`
- Bismillah is shown as a configurable placeholder string (not substituted ayah text)
- Navigation, bookmarks, settings, and Story/Study deep links still work
- No fake `text_uthmani`, no scraping, no hard-coded full Quran

## Behavior After Full Quran Text Import

When a validated licensed index is present:

- `text_uthmani` is rendered exactly as imported
- No normalization, diacritic stripping, or search-time alteration of Quran text
- Typography uses Amiri with user-controlled font size and line height
- Import status badge shows **النص القرآني مستورد**

## Reading Modes

| Mode | Arabic label | Behavior |
|------|--------------|----------|
| Page | صفحة | Chunks of ~10 ayahs per “page” with prev/next page controls |
| List | قائمة آيات | Full surah as a vertical ayah list |

## Settings (localStorage)

Key: `qsu_mushaf_settings`

- Font size (16–40px)
- Line height (1.4–2.6)
- Reading mode (صفحة / قائمة آيات)
- Show/hide ayah numbers
- Show/hide references
- Night reading mode
- Fullscreen on the reading area (when supported)

## Bookmarks and Last Read (localStorage)

| Key | Purpose |
|-----|---------|
| `qsu_mushaf_last_read` | Last surah/ayah position (auto-saved on navigation) |
| `qsu_mushaf_bookmarks` | User bookmarks (add/remove, no login required) |

## Story / Study Integration

Where an ayah reference exists, a **فتح في المصحف** button dispatches `qsu:open-mushaf` with `{ surahId, ayahFrom, ayahTo }`, sets `#mushaf`, and scrolls to the reader.

## Content Safety Rules

1. Do not invent Quran text or tafsir
2. Do not scrape Quran text from the internet
3. Do not import full text without a licensed file
4. Do not alter `text_uthmani` after import
5. Do not weaken `isFinalContent()` or remove the Arabic disclaimer:
   > هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

## Module Layout

```
src/features/mushaf/
  mushafReader.js      — main section shell and event wiring
  mushafNavigation.js  — surah/ayah navigation, deep links, progress
  mushafPageView.js    — surah header, bismillah, ayah rendering
  mushafSettings.js    — localStorage preferences
  mushafBookmarks.js   — bookmarks and last-read position
```

## Related Docs

- `docs/quran_text_import_policy.md` — licensed import workflow
- `docs/evidence_mapping_consolidated_risk_report.md` — evidence vs Quran text availability
