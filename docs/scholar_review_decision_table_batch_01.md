# Scholar Review Decision Table — Batch 1

**For human completion only.** Leave decision columns blank until scholarly review is done.

**Related files:**
- Review pack: `docs/scholar_review_pack_batch_01.md`
- Proposed patch: `examples/evidence_patch.batch_01.proposed.json`
- Machine template: `examples/evidence_patch.batch_01.review_template.json`

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Decision options (reference)

| scholar_decision | When to use |
|------------------|-------------|
| `approve_after_source_check` | Ayah range and event metadata OK; assign `source_id` after licensed Quran source check |
| `revise_ayah_range` | Change surah/ayah boundaries — fill corrected columns |
| `split_event` | One seed event should become multiple events with separate mappings |
| `rename_event` | Title/summary must change to match evidence (e.g. `musa_firawn`) |
| `reject_mapping` | Cannot verify — do not map |
| `needs_source` | Correct direction but source/tafsir reference required first |

**Allowed `final_recommended_status`:** `pending` · `needs_source` · `approved` (only with `source_id` and confidence ≠ `needs_review`)

---

## Review table

| event_id | current title | proposed ayah range | reviewer decision | corrected ayah range | corrected title if needed | source_id | reviewer note | final recommended status |
|----------|---------------|---------------------|-------------------|----------------------|---------------------------|-----------|---------------|--------------------------|
| `adam_01__` | تعليم الأسماء | 2:31–33 | | | | | | |
| `adam_04__` | الهبوط والتلقي | 2:35–39 | | | | | | |
| `ibrahim_04__` | الذبح | 37:102–107 | | | | | | |
| `ibrahim_05__` | بناء البيت | 2:127–129 | | | | | | |
| `maryam_03__` | المخاض | 19:22–26 | | | | | | |
| `maryam_04__` | العودة | 19:27–33 | | | | | | |
| `musa_firawn` | اليم | 20:24–56 | | | | | | |
| `musa_03__` | مدين | 28:22–28 | | | | | | |
| `musa_09__` | الخضر | 18:60–82 | | | | | | |
| `isa_04__` | الغلو | 5:116–118 | | | | | | |

---

## Priority review notes

### `musa_firawn`
Title **«اليم»** may not match **20:24–56**. Decide: rename to «مواجهة فرعون» / «إرسال موسى إلى فرعون», **or** change ayah range if event is truly «اليم».

### `musa_09__`
Seed title is **الخضر** (correct Arabic). Confirm long range 18:60–82 as `main`.

### `ibrahim_05__`
2:127–129 fits «بناء البيت» — check overlap with `ibrahim_kaaba` (21:51–70) and seed title mismatch on that event.

### `adam_01__` / `adam_04__`
Prototype block 2:30–37 was split — confirm boundaries vs deferred `adam_02__` / `adam_03__`.

### `maryam_03__` / `maryam_04__` / `isa_04__`
Confirm boundaries across Maryam 19:16–34, `isa_birth` (19:16–21), and Isa’s speech; `isa_04__` uses distinct 5:116–118.

---

## After completion

1. Save completed template JSON (if used).
2. Build revised evidence patch from decisions.
3. Follow `docs/batch_review_to_promotion_workflow.md`.
4. **Do not apply** until approved content change batch + controlled SQL apply.

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
