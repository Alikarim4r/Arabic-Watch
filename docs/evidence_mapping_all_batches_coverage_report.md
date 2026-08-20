# Evidence Mapping — All Batches Coverage Report

**Date:** 2026-07-05  
**Status:** All proposed mappings are **pending** — not applied, not approved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Summary counts

| Metric | Count |
|--------|------:|
| Total story events | 59 |
| Events with existing `precise_evidence` in seed | 11 |
| Events with `needs_precise_mapping` in seed | 48 |
| Batch 1 proposed mappings | 10 |
| Batch 2 proposed mappings | 10 |
| Batch 3 proposed mappings | 10 |
| Batch 4 proposed mappings | 10 |
| Batch 5 proposed mappings | 8 |
| **Total proposed mappings (Batches 1–5)** | **48** |
| Events still without batch proposal | **0** |
| Public-final safe events (`isFinalContent`) | **6** (unchanged) |

---

## Coverage statement

All **48** events marked `needs_precise_mapping` in `src/data/seed_content.json` now have a proposed ayah mapping in at least one sprint batch patch (Batches 1–5). **No patch has been applied** to seed or Supabase. **No mapping is approved.**

> **All proposed mappings are pending and need owner/human review before approval or application.**

---

## Batch inventory

### Batch 1 (`evidence_mapping_sprint_01`) — 10 events

`adam_01__`, `adam_04__`, `ibrahim_04__`, `ibrahim_05__`, `maryam_03__`, `maryam_04__`, `musa_firawn`, `musa_03__`, `musa_09__`, `isa_04__`

### Batch 2 (`evidence_mapping_sprint_02`) — 10 events

`yunus_02__`, `yunus_03__`, `ayyub_01__`, `ayyub_02__`, `sulayman_01__`, `sulayman_02__`, `dawud_01__`, `dawud_02__`, `dhulqarnayn_03__`, `nuh_04__`

### Batch 3 (`evidence_mapping_sprint_03`) — 10 events

`adam_02__`, `adam_03__`, `ibrahim_03__`, `musa_04__`, `musa_05__`, `musa_06__`, `musa_07__`, `musa_08__`, `muhammad_02__`, `muhammad_05__`

### Batch 4 (`evidence_mapping_sprint_04`) — 10 events

`yusuf_04__`, `yusuf_05__`, `yusuf_06__`, `yusuf_07__`, `yusuf_08__`, `muhammad_03__`, `muhammad_04__`, `nuh_03__`, `yunus_01__`, `yunus_04__`

### Batch 5 (`evidence_mapping_sprint_05`) — 8 events

`ayyub_03__`, `dawud_03__`, `dhulqarnayn_01__`, `dhulqarnayn_02__`, `isa_02__`, `isa_03__`, `maryam_02__`, `sulayman_03__`

---

## Duplicate event_id check

No `event_id` appears in more than one batch patch. **PASS** — no duplicate proposals across batches.

---

## Thematic / ayah overlap warnings (not duplicate event_ids)

| Area | Warning |
|------|---------|
| Adam (Batches 1, 3) | Baqara 2:30–39 split across four events |
| Musa (Batches 1, 3) | Ta Ha / A'raf parallel narratives |
| Yusuf (Batch 4) | Sub-ranges of seed `yusuf_prison` (12:23–57) |
| Nuh (Batches 2, 4) | Hud 11:36–46 overlapping flood/ark/son |
| Yunus (Batches 2, 4) | Saffat 37:139–144 and Anbiya 21:87–88 |
| Ayyub (Batches 2, 5) | Anbiya 21:83–84 split three ways |
| Dhulqarnayn (Batches 2, 5) | Kahf 18:83–98 split four ways |
| Isa/Maryam (Batches 1, 5) | Maida / Al Imran / Maryam surah choices |

These are **draft boundary overlaps** for owner review — not applied conflicts.

---

## Seed state (unchanged)

- `evidence_status: needs_precise_mapping` count in seed: **48**
- `evidence_status: precise_evidence` count in seed: **11**
- Public-final safe count: **6**
- No batch applied; no `review_status: approved` added via sprint patches

---

## Patch files

| Batch | Proposed | Review template | Revised proposed |
|-------|----------|-----------------|------------------|
| 1 | `examples/evidence_patch.batch_01.proposed.json` | `examples/evidence_patch.batch_01.review_template.json` | `examples/evidence_patch.batch_01.revised.proposed.json` |
| 2 | `examples/evidence_patch.batch_02.proposed.json` | `examples/evidence_patch.batch_02.review_template.json` | `examples/evidence_patch.batch_02.revised.proposed.json` |
| 3 | `examples/evidence_patch.batch_03.proposed.json` | `examples/evidence_patch.batch_03.review_template.json` | `examples/evidence_patch.batch_03.revised.proposed.json` |
| 4 | `examples/evidence_patch.batch_04.proposed.json` | `examples/evidence_patch.batch_04.review_template.json` | `examples/evidence_patch.batch_04.revised.proposed.json` |
| 5 | `examples/evidence_patch.batch_05.proposed.json` | `examples/evidence_patch.batch_05.review_template.json` | `examples/evidence_patch.batch_05.revised.proposed.json` |

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
