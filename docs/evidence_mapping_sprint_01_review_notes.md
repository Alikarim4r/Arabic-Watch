# Evidence Mapping Sprint 01 — Review Notes

**Patch:** `examples/evidence_patch.batch_01.proposed.json`  
**Status:** `meta.status = proposed` — **not applied**  
**Validation:** `node scripts/validate_evidence_patch.mjs examples/evidence_patch.batch_01.proposed.json`

---

## What was proposed (10 mappings)

| event_id | Node | Proposed ayah | relation_type | evidence_confidence | proposed_review_status |
|----------|------|---------------|---------------|---------------------|------------------------|
| `adam_01__` | adam | 2:31–33 | main | needs_review | pending |
| `adam_04__` | adam | 2:35–39 | main | needs_review | pending |
| `ibrahim_04__` | ibrahim | 37:102–107 | main | needs_review | pending |
| `ibrahim_05__` | ibrahim | 2:127–129 | main | needs_review | pending |
| `maryam_03__` | maryam | 19:22–26 | main | needs_review | pending |
| `maryam_04__` | maryam | 19:27–33 | main | needs_review | pending |
| `musa_firawn` | musa | 20:24–56 | main | needs_review | pending |
| `musa_03__` | musa | 28:22–28 | main | needs_review | pending |
| `musa_09__` | musa | 18:60–82 | main | needs_review | pending |
| `isa_04__` | isa | 5:116–118 | main | needs_review | pending |

All mappings include `evidence_note_ar`, `reviewer_note`, and `relation_type` as required.

---

## What was not proposed

- **No `approved` status** on any mapping (`proposed_review_status` is `pending` for all 10).
- **No `source_id`** set — all remain without cited source until human review assigns `quran_text` or other approved source.
- **38 events** still `needs_precise_mapping` in seed (48 before sprint minus 10 proposed, but patch not applied — count unchanged in production data).
- **Deferred events:** `adam_02__`, `adam_03__`, `ibrahim_03__`, `maryam_02__`, `isa_02__`, `isa_03__`, `musa_04__`–`musa_08__` (see plan doc).
- **No automatic apply** — seed and Supabase unchanged.

---

## Confidence breakdown (proposed batch)

| evidence_confidence | Count | event_ids |
|---------------------|------:|-----------|
| quran_explicit | 0 | — |
| tafsir_based | 0 | — |
| scholarly_inference | 0 | — |
| needs_review | 10 | all Batch 1 events |

**Rationale:** Even where Quranic narrative is well known, seed lacks explicit per-event source notes (except `musa_firawn`). Sprint policy keeps all items at `needs_review` until a scholar confirms boundaries and metadata.

---

## Items requiring scholar confirmation (priority)

1. **`musa_firawn`** — Title «اليم» vs summary (Pharaoh return) vs source note (Ta Ha 24–56). Metadata fix required before approval.
2. **`ibrahim_05__` vs `ibrahim_kaaba`** — Potential overlap/conflict with existing curated 21:51–70 on wrong title in seed.
3. **`adam_01__` / `adam_04__`** — Sub-split of prototype block 2:30–37; coordinate with deferred `adam_02__` / `adam_03__`.
4. **`maryam_03__` / `maryam_04__`** — Boundaries within 19:16–34 vs existing `isa_birth` 19:16–21.
5. **`musa_09__`** — Long range 18:60–82 — confirm main vs supporting.

---

## Quran-explicit vs draft context

| Mapping | Quran-explicit content? | Basis used |
|---------|-------------------------|------------|
| All 10 | Narrative identifiable in Quran | Proposed ranges + seed source note (`musa_firawn` only) + prototype draft blocks (not authority) |

None are labeled `quran_explicit` in the patch until scholar review upgrades confidence.

---

## What must happen before any item becomes `approved`

For each mapping, **all** of the following:

1. Scholar confirms ayah range boundaries and `relation_type`.
2. Event title/summary aligned with evidence (especially `musa_firawn`, `ibrahim_kaaba`/`ibrahim_05__`).
3. `source_id` set (typically `quran_text` after licensed Quran import).
4. `evidence_confidence` upgraded from `needs_review` if appropriate (not `needs_review` for final gate).
5. Controlled apply via Phase 10 workflow — patch promoted to approved batch, then applied.
6. `isFinalContent()` gates pass: `review_status=approved`, valid `source_status`, `evidence_status=precise_evidence`, confidence ≠ `needs_review`.

**Current public-final safe events remain 6** — none of Batch 1 are safe for public-final display yet.

---

## Reviewer UI

Evidence Curation Workbench includes a **Batch 1** filter tag linking to this patch file. Exported patches show a proposed-only warning.

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
