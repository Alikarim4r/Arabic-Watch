# Data Integrity Report

**Date:** 2026-07-05  
**Dataset:** `src/data/seed_content.json` v0.3.0  
**Checker:** `scripts/data-integrity-check.mjs`

---

## Summary

| Result | Count |
|--------|------:|
| Checks passed | 9 |
| Checks failed | 0 |
| Story nodes | 156 |
| Story events | 59 |
| Event ayahs | 59 |
| Node links | 187 |
| Themes | 45 |

**Overall:** PASS — all integrity checks passed

---

## Required integrity rules

| # | Rule | Result | Detail |
|---|------|--------|--------|
| 1 | Every story event has `node_id` | PASS | 59 events linked to valid nodes |
| 2 | Event ayahs have valid `surah_id` and ayah range | PASS | 59 ayah rows valid for 59 events |
| 3 | Graph nodes have `name_ar` and `node_type` | PASS | 156 nodes complete |
| 4 | Theme links point to existing themes | PASS | 44 theme links valid |
| 5 | Source refs valid or flagged `needs_source` | PASS | All event sources valid or flagged |
| 6 | Pending/`needs_source` not treated as verified | PASS | 201 unreviewed records correctly excluded from isFinalContent |
| 7 | UI surfaces work after dataset expansion | See Functional QA below | Browser smoke tests in `npm run qa` |

---

## Verification checklist

### PASS — events_have_node_id

59 events linked to valid nodes

### PASS — event_ayahs_valid

59 ayah rows valid for 59 events

### PASS — nodes_have_name_and_type

156 nodes complete

### PASS — theme_links_valid

44 theme links valid

### PASS — source_references_valid

All event sources valid or flagged

### PASS — unreviewed_not_final

201 unreviewed records correctly excluded from isFinalContent

### PASS — approved_not_source_none

No approved records with source_status none

### PASS — node_links_resolve

187 links resolve

### PASS — era_node_ids_valid

9 eras valid

---

## Rule 6 — Unreviewed content vs verified display

| review_status | Records | Passes isFinalContent (public mode) |
|---------------|--------:|------------------------------------:|
| approved | 59 | 59 |
| pending | 200 | 0 |
| needs_source | 1 | 0 |

UI surfaces use `isFinalContent()` + `reviewBadgeHtml()` in Story Mode, study modal, and search results. Surah catalog entries are bibliographic metadata and marked approved separately in search.

---

## Functional QA

Run `npm run qa` after this check (data policy + Playwright smoke tests for search, graph, story mode, surah grid, study modal).

---

## Notes

- Ayah rows store references only (no licensed full ayah text).
- Events with empty `sources` arrays rely on `source_status: pending` and draft banners in UI.
- Round-robin ayah assignment from prototype (18 refs → 59 events) is structurally valid; scholarly mapping still pending.
