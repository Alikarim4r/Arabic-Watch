# Data Integrity Report

**Date:** 2026-07-05  
**Dataset:** `src/data/seed_content.json` v0.4.0  
**Checker:** `scripts/data-integrity-check.mjs`

---

## Summary

| Result | Count |
|--------|------:|
| Checks passed | 10 |
| Checks failed | 0 |
| Story nodes | 156 |
| Story events | 59 |
| Event ayahs | 11 |
| Node links | 187 |
| Themes | 45 |

**Overall:** PASS — all integrity checks passed

---

## Required integrity rules

| # | Rule | Result | Detail |
|---|------|--------|--------|
| 1 | Every story event has `node_id` | PASS | 59 events linked to valid nodes |
| 2 | Event ayahs have valid `surah_id` and ayah range | PASS | 11 ayah rows on precise events only |
| 3 | Graph nodes have `name_ar` and `node_type` | PASS | 156 nodes complete |
| 4 | Theme links point to existing themes | PASS | 44 theme links valid |
| 5 | Source refs valid or flagged `needs_source` | PASS | All event sources valid or flagged |
| 6 | Pending/`needs_source` not treated as verified | PASS | 202 unreviewed records correctly excluded from isFinalContent |
| 7 | UI surfaces work after dataset expansion | See Functional QA below | Browser smoke tests in `npm run qa` |

---

## Verification checklist

### PASS — events_have_node_id

59 events linked to valid nodes

### PASS — event_ayahs_valid

11 ayah rows on precise events only

### PASS — nodes_have_name_and_type

156 nodes complete

### PASS — theme_links_valid

44 theme links valid

### PASS — source_references_valid

All event sources valid or flagged

### PASS — unreviewed_not_final

202 unreviewed records correctly excluded from isFinalContent

### PASS — approved_not_source_none

No approved records with source_status none

### PASS — final_requires_precise_evidence

6 public-final events have precise evidence

### PASS — node_links_resolve

187 links resolve

### PASS — era_node_ids_valid

9 eras valid

---

## Rule 6 — Unreviewed content vs verified display

| review_status | Records | Passes isFinalContent (public mode) |
|---------------|--------:|------------------------------------:|
| approved | 58 | 57 |
| pending | 201 | 0 |
| needs_source | 1 | 0 |

UI surfaces use `isFinalContent()` + `reviewBadgeHtml()` in Story Mode, study modal, and search results. Surah catalog entries are bibliographic metadata and marked approved separately in search.

---

## Functional QA

Integrated into `npm run qa`:

1. `scripts/data-integrity-check.mjs` — this report
2. `scripts/qa-check.mjs` — `isFinalContent`, search filters, ayah coverage
3. `scripts/browser-qa.mjs` — Playwright desktop + mobile:
   - Graph canvas loads (`#universe2d`)
   - Story Mode next/prev navigation
   - Search for «موسى» returns results
   - Study card opens/closes modal
   - Surah grid selects سورة 12 and shows linked يوسف node
   - Graph surah filter selects surah 12
   - RTL `dir` attribute

**Last run:** PASS (all stages green)

---

## Notes

- Ayah rows store references only (no licensed full ayah text).
- Events with empty `sources` arrays rely on `source_status: pending` and draft banners in UI.
- Round-robin ayah assignment removed in Phase 5. Only `precise_evidence` events may have `event_ayahs` rows (see `precise_event_evidence.json`).
