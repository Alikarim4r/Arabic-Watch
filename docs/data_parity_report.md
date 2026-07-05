# Data Parity Report — Phase 3A

**Date:** 2026-07-05  
**Prototype source:** `quran_story_universe_10_10_final.html`  
**Refactored data:** `src/data/seed_content.json` (v0.3.0)  
**Migration script:** `scripts/migrate_prototype_data.py`

---

## Executive summary

The refactored app previously shipped a **minimal demo seed** (v0.2.0) with only 13 nodes and 12 events. Phase 3A migrates the **full prototype story graph** into the JSON schema while preserving content-governance rules: no prototype tafsir treated as verified, draft lessons marked pending, ayah references stored without licensed full text.

**Result:** Full parity with prototype `RAW` / `ERAS` structures; expanded relational graph (places, people, surah links, themes).

---

## Dataset counts

| Entity | Original prototype | Pre-migration (v0.2.0) | Post-migration (v0.3.0) |
|--------|-------------------:|------------------------:|------------------------:|
| Main figures (`RAW`) | 13 | 7 (+ sparse extras) | **13** |
| Story events | 59 | 12 | **59** |
| Ayah reference blocks in prototype | 18 | 12 | **59** event_ayah rows (1 per event, round-robin from 18 prototype refs) |
| Themes (unique in RAW rows) | 34 | 5 | **45** theme nodes + themes array |
| Places | 23 | 0 | **23** |
| Secondary people | 28 | 0 | **28** (`person_*` nodes) |
| Surah links (unique IDs) | 47 | hard-coded ~10 | **47** surah nodes + links |
| Eras | 9 | 0 (hard-coded 6) | **9** in JSON |
| Graph nodes (total) | ~110 embedded | 13 | **156** |
| Graph links | embedded in RAW | 11 | **187** |

### Main figures migrated (all 13)

`adam`, `nuh`, `ibrahim`, `yusuf`, `musa`, `dawud`, `sulayman`, `ayyub`, `yunus`, `maryam`, `isa`, `muhammad`, `dhulqarnayn`

**Missing prophets/persons:** none  
**Missing themes from RAW:** none  
**Missing places:** none  
**Missing surah links:** none  
**Missing events:** none (59/59 per figure matches prototype event counts)

---

## What was migrated

| Prototype structure | JSON target | Notes |
|--------------------|-------------|-------|
| `SURAH` (114 names) | `src/data/surahs.json` | Already present; unchanged |
| `RAW` figures | `story_nodes` (prophet/person) | Includes `era_ar`, `summary_ar`, `surah_ids`, draft `lessons_ar`, `network_conclusion_ar` |
| `RAW` events | `story_events` | Titles preserved; summaries default to draft unless legacy approved match |
| `RAW` ayah tuples | `event_ayahs` | **Reference only:** `surah_id`, `ayah_from`, `ayah_to`, `ayah_key`, `relation_type`, `note_ar` — no full ayah text |
| `RAW` themes | `themes` + theme `story_nodes` + `node_links` | `embodies_theme` relations |
| `RAW` places | place `story_nodes` + `located_in` links | |
| `RAW` people | person `story_nodes` + `related_to` links | |
| `RAW` surahs | surah `story_nodes` + `narrated_in` links | |
| `ERAS` | `eras` array | Loaded by timeline UI |
| Educational notes in ayah tuples | `lessons_ar` on nodes | `review_status: pending` via node governance |
| Network conclusions (4 figures) | `network_conclusion_ar` | `network_conclusion_review_status: pending` |

### Review status preserved from v0.2.0

Previously **approved** records kept when IDs matched:

- **Nodes:** `yusuf`, `musa`, `nuh`, `muhammad` (+ approved themes `sabr`, `tawakkul`, `family_trial`)
- **Events:** 7 events with prior approval (yusuf/musa/nuh/maryam/isa/muhammad pipeline)

All newly migrated figures (`adam`, `dawud`, `sulayman`, `ayyub`, `yunus`, `dhulqarnayn`, etc.) remain **`pending`**.

---

## What was intentionally NOT migrated

| Prototype content | Reason |
|-------------------|--------|
| Fake tafsir blocks (`tabari`, `kathir`, `qurtubi`, `ashur` text in HTML) | Not verified tafsir; violates source policy |
| AI chat / generated answers | Out of scope; not scholarly content |
| Full ayah Arabic text in prototype quotes | Licensed text not imported; references only |
| Prototype `THEMES` JS spread (duplicate/extra theme names beyond RAW) | Merged via RAW row themes + known list; extras without RAW usage omitted |
| Hard-coded UI-only surah lists | Replaced by data-driven `node_links` / `surah_ids` |

---

## What still needs scholarly review

| Category | Count / scope | Status |
|----------|---------------|--------|
| Main figure summaries | 9 of 13 figures `pending` | Needs source verification |
| Story events | 52 of 59 `pending` | Draft summaries; verify against Quran + approved tafsir |
| Event ayah notes | All `note_ar` from prototype | Educational drafts — **not** tafsir |
| Theme nodes | 42+ `pending` | Theme descriptions are generic placeholders |
| Place / secondary person nodes | All `pending` | Names only; no independent sourcing |
| Network conclusions | All 13 figures | `network_conclusion_review_status: pending` |
| Lessons from ayah notes | On multiple nodes | Draft; `source_status: pending` |
| Round-robin ayah assignment | 18 prototype refs → 59 events | Some events share/reuse refs; scholars should map explicit ayahs per event |

---

## Ayah reference gap (expected)

- Prototype embeds **18** explicit ayah reference blocks with educational notes.
- Migration assigns ayahs to **59** events (one `event_ayah` per event) via round-robin from available refs per figure.
- **Action for reviewers:** Replace round-robin mapping with precise per-event ayah citations.

---

## UI updates for expanded dataset

| Component | Change |
|-----------|--------|
| `eraTimeline.js` | Loads `eras` from JSON (fallback to defaults) |
| `surahGrid.js` | Links surahs via `getNodesForSurah()` / `node_links` |
| `graphView.js` | Surah filter populated from linked surahs in data |
| `storyMode.js` | Story selector uses main figures only (`isMainStoryNode`) |
| `studyModal.js` | Shows themes, people, places from links; `network_conclusion_ar`; surah-linked nodes |
| `utils.js` | Added `isMainStoryNode`, `getNodesForSurah` helpers |
| `localJsonRepository.js` | Added `getEras()` |

Safety features unchanged: Arabic disclaimer, review badges, `isFinalContent()`, public mode draft banners.

---

## Content governance compliance

- [x] No prototype tafsir imported as verified
- [x] No invented sources
- [x] Unreviewed content marked `review_status: pending`
- [x] Ayah refs without licensed text stored as reference fields only
- [x] Educational conclusions stored as draft lessons / network conclusions with pending review
- [x] `isFinalContent()` still requires `approved` + `source_status !== 'none'`

---

## Verification

```bash
npm run qa
```

Expected: data policy checks pass; browser smoke tests pass with expanded graph and 13 study cards.
