# Evidence Mapping Sprint 01 — Plan (Batch 1)

**Phase:** 13 — Evidence Mapping Sprint Batch 1  
**Status:** Proposed only — **not applied** to `seed_content.json` or Supabase  
**Patch file:** `examples/evidence_patch.batch_01.proposed.json`  
**Batch size:** 10 events (within 8–12 target)  
**Date:** 2026-07-05

---

## Scope and policy

This sprint selects **10** events from priority nodes (`adam`, `ibrahim`, `musa`, `maryam`, `isa`) where `evidence_status = needs_precise_mapping`. Each proposed mapping:

- Remains `proposed_review_status: pending` (no auto-approve)
- Uses `evidence_confidence: needs_review` unless an explicit seed source note supports a tighter label
- Includes Arabic evidence notes and reviewer caution notes
- Does **not** apply approximate or round-robin mapping
- Treats the original prototype ayah blocks as **draft context only**, not verified authority

**Excluded from Batch 1:** Events that already have curated `precise_evidence` (`musa_birth`, `ibrahim_idols`, `ibrahim_kaaba`, `isa_birth`, `maryam_withdraw`).

---

## Selected events

| event_id | Node | Title | review_status | source_status | evidence_status | Proposed ayah | Suitable for Batch 1 | Evidence needed | Reviewer caution |
|----------|------|-------|---------------|---------------|-----------------|---------------|----------------------|-----------------|------------------|
| `adam_01__` | adam | تعليم الأسماء | pending | pending | needs_precise_mapping | 2:31–33 (proposed) | Clear event title; Quranic episode identifiable within Adam narrative | Scholar must confirm sub-range within prototype draft block 2:30–37 | Prototype uses one block for all Adam events — per-event split is not verified |
| `adam_04__` | adam | الهبوط والتلقي | pending | pending | needs_precise_mapping | 2:35–39 (proposed) | Clear descent/repentance theme | Confirm boundary vs. adjacent Adam events (2:30–37 block) | Overlap risk with `adam_03__` if ranges are not split carefully |
| `ibrahim_04__` | ibrahim | الذبح | pending | pending | needs_precise_mapping | 37:102–107 (proposed) | Strong Quranic narrative for sacrifice episode | Verify event summary wording; confirm no supporting ayah needed | Generic seed source note only — range is proposed, not pre-approved |
| `ibrahim_05__` | ibrahim | بناء البيت | pending | pending | needs_precise_mapping | 2:127–129 (proposed) | Kaaba raising is a distinct Quranic episode | Confirm relation to `ibrahim_kaaba` curated mapping (21:51–70 title mismatch in seed) | Possible overlap with existing `ibrahim_kaaba` mapping — scholar must reconcile |
| `maryam_03__` | maryam | المخاض | pending | pending | needs_precise_mapping | 19:22–26 (proposed) | Labor/birth pain episode within Maryam surah narrative | Confirm within prototype draft block 19:16–34 | Adjacent to `isa_birth` (19:16–21) — avoid duplicate/over-broad range |
| `maryam_04__` | maryam | العودة | pending | pending | needs_precise_mapping | 19:27–33 (proposed) | Return to people with infant is identifiable in Surah Maryam | Confirm end ayah (33 vs 34) | Continuation of 19:16–34 block — boundary review required |
| `musa_firawn` | musa | اليم | pending | pending | needs_precise_mapping | 20:24–56 (proposed) | **Explicit seed source note:** «سورة طه 24-56» | Reconcile title «اليم» vs summary (return to Pharaoh with signs) | Title/summary mismatch — downgraded from approved in Phase 5; do not approve until metadata fixed |
| `musa_03__` | musa | مدين | pending | pending | needs_precise_mapping | 28:22–28 (proposed) | Madyan episode clearly in Surah al-Qasas | Confirm within prototype draft block 28:7–35 | Generic seed note only; sample patch used same range as illustration |
| `musa_09__` | musa | الخضر | pending | pending | needs_precise_mapping | 18:60–82 (proposed) | Khidr journey matches prototype draft block | Confirm full range vs supporting subset | Long passage — verify `relation_type: main` covers entire episode |
| `isa_04__` | isa | الغلو | pending | pending | needs_precise_mapping | 5:116–118 (proposed) | Prototype draft block matches excess/deification correction | Confirm event title aligns with ayah content | Prototype block is figure-level; per-event boundary still needs scholar sign-off |

---

## Events considered but not in Batch 1

| event_id | Reason deferred |
|----------|-----------------|
| `adam_02__`, `adam_03__` | Adam sub-ranges need coordinated split of 2:30–37 / 7:11–22 — defer to Batch 2 with scholar plan |
| `ibrahim_03__` (النار) | Multiple surah locations (21:68–70, 29:24) — needs explicit source note before proposing |
| `maryam_02__` (البشارة) | Overlaps 3:45–47 and 19:17–21 — requires choice of primary passage |
| `isa_02__`, `isa_03__` | No explicit prototype block per event; multiple surah options |
| `musa_04__`–`musa_08__` | Deferred to Batch 2 after Batch 1 review patterns are established |
| All non-priority nodes | Out of Batch 1 scope per phase instructions |

---

## Workflow after this phase

1. Scholar/reviewer reads `docs/evidence_mapping_sprint_01_review_notes.md`
2. Validates or edits `examples/evidence_patch.batch_01.proposed.json`
3. Runs controlled apply workflow (Phase 10) — **not automatic**
4. Only after full final-gate pass can any item reach `approved` + public-final display

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
