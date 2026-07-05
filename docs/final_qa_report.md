# Final QA Report — Quran Story Universe

Date: 2026-07-05  
Branch: `cursor/quran-story-universe-refactor-8e4e`

## How to run the app

```bash
cd /workspace
npm run dev
```

Open **http://localhost:3000**

Run automated QA:

```bash
cd /workspace
npm run qa
```

---

## What was tested

| # | Area | Method |
|---|------|--------|
| 1 | Broken imports | Browser boot + module graph review |
| 2 | Console errors | Playwright desktop + mobile (`scripts/browser-qa.mjs`) |
| 3 | Buttons / interactions | Playwright: story next/prev, study card, graph zoom/reset, modal close |
| 4 | Mobile layout | Playwright iPhone 13 viewport |
| 5 | RTL alignment | `document.documentElement.dir === 'rtl'` |
| 6 | Search filters | `scripts/qa-check.mjs` (event type, review status, Arabic normalization) |
| 7 | Graph click/drag/zoom | Code review + manual logic tests; pointer/touch handlers added |
| 8 | Story Mode next/previous | Playwright click `#story-next` / `#story-prev` |
| 9 | Study modal data | Import fix + theme handler + rich node study path |
| 10 | Unreviewed as final | `isFinalContent()` audit on all seed nodes/events |

---

## What passed

- **Imports:** All `/src` modules load; app bootstraps successfully.
- **Console:** No page errors on desktop or mobile after QA fixes.
- **Story Mode:** Next/previous, step buttons, prophet selector, draft banners on non-final events.
- **Search:** Normalized Arabic search, type filter (`event`), review status filter; results open correct modal types.
- **Graph:** Canvas renders; zoom +/-, reset, pause controls wired; theme click scrolls to search and fills query.
- **Surahs:** 114 surahs in grid; detail panel and study button work.
- **Study modal:** Opens from study cards; node study shows timeline, ayah refs, sources, disclaimer, review badges.
- **RTL:** `lang="ar" dir="rtl"` on `<html>`.
- **Content policy:** `isFinalContent()` only true when `review_status === 'approved'` AND `source_status !== 'none'`.
- **Disclaimer:** Visible at top via `#disclaimer-mount` and repeated in study modal.
- **Review badges:** Present on search results, Story Mode, study modal; unapproved content shows draft banners.

---

## What failed (before fixes)

| Issue | Severity | Symptom |
|-------|----------|---------|
| `reviewBadgeHtml` imported from `utils.js` | **Critical** | App failed to boot; blank page; `#universe2d` never rendered |
| Graph node click on mousedown | Medium | Modal opened while dragging nodes |
| Graph theme click | Medium | Updated state only; search input unchanged |
| Search theme result click | Medium | Opened as `node` — missing data for theme-only IDs |
| Study modal “Story Mode” button | Low | Scrolled to story without selecting prophet |
| Mobile graph | Medium | Mouse-only handlers; no touch support |
| Graph listener cleanup | Low | Window listeners leaked on destroy |

---

## What was fixed

1. **`storyMode.js` / `studyModal.js`** — import `reviewBadgeHtml` from `components/reviewBadge.js` (not `utils.js`).
2. **`graphCanvas.js`** — pointer/touch events; click fires on tap release if movement < 8px; listener cleanup in `destroy()`; improved surah filter visibility.
3. **`graphView.js`** — theme nodes call `triggerSearch()` and scroll to `#search`.
4. **`searchUI.js`** — exported `triggerSearch()`; fixed modal routing for `theme` / `event` / `surah` / `node`.
5. **`studyModal.js`** — added `renderThemeStudy()`; Story Mode button dispatches `qsu:select-story` with node id.
6. **`storyMode.js`** — registers rerender callback for cross-feature navigation.
7. **`main.js` / `index.html`** — stable mount points; no destructive `innerHTML` wipe of section containers.
8. **`reviewBadge.js` / `main.css`** — `review-badge` class + mobile disclaimer padding.
9. **`story.css`** — mobile single-column story controls.
10. **`scripts/qa-check.mjs` + `scripts/browser-qa.mjs`** — automated regression checks added.
11. **`package.json`** — `npm run qa` script.

---

## Remaining risks

| Risk | Notes |
|------|-------|
| **Limited seed content** | Demo covers 7 prophets; not full original RAW dataset. |
| **Ayah text not licensed** | Modal shows references + summaries, not full Uthmani ayah text. |
| **Surah–node linking heuristic** | Surah detail uses hard-coded surah id list, not full `event_ayahs` join. |
| **Theme-only IDs** | Themes without `story_nodes` row rely on `themes` table in modal. |
| **No Supabase yet** | Local JSON only; `supabase` provider throws if selected. |
| **Scholarly review pending** | Several events/nodes still `pending` or `needs_source` — correctly flagged, not hidden. |
| **AI chat omitted by policy** | Original prototype Q&A not restored (intentional). |

---

## Content policy verification

- Arabic disclaimer present: **نعم** — «هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.»
- Review badges on non-final content: **نعم**
- No invented tafsir blocks: **نعم**
- Unreviewed content not treated as final: **نعم** (`isFinalContent` + draft banners)

---

## QA command summary

```bash
# Start app
npm run dev

# Full automated QA
npm run qa
```

Expected QA output: all `PASS` lines + `BROWSER QA PASSED` with exit code `0`.
