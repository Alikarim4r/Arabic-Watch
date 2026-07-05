# Scholar Review Pack — Evidence Mapping Batch 1

**Phase:** 14 — Scholar Review Package  
**Proposed patch:** `examples/evidence_patch.batch_01.proposed.json` (not applied)  
**Review template:** `examples/evidence_patch.batch_01.review_template.json`  
**Decision table:** `docs/scholar_review_decision_table_batch_01.md`  
**Date:** 2026-07-05

---

## How to use this pack

1. Read each mapping below with seed context and risk notes.
2. Fill `docs/scholar_review_decision_table_batch_01.md` (human-only fields).
3. Optionally fill `examples/evidence_patch.batch_01.review_template.json` for machine-readable handoff.
4. Produce a **revised patch** (not in this phase) after decisions are complete.
5. Follow `docs/batch_review_to_promotion_workflow.md` for promotion — **no auto-approval**.

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Batch summary

| Metric | Value |
|--------|------:|
| Proposed mappings | 10 |
| All `proposed_review_status` | pending |
| All `evidence_confidence` | needs_review |
| All `source_id` | empty |
| Applied to seed | **No** |
| Public-final safe events (unchanged) | 6 |

---

## Related curated mappings (for overlap checks)

| event_id | Title in seed | Curated ayah | Notes |
|----------|---------------|--------------|-------|
| `ibrahim_kaaba` | تحطيم الأصنام | 21:51–70 | Summary describes **building** Kaaba — title/mapping mismatch in seed |
| `isa_birth` | الميلاد | 19:16–21 | Overlaps Maryam surah block 19:16–34 |
| `maryam_withdraw` | الكفالة | 3:37 | Separate from Surah Maryam narrative |

---

## Mapping 1 — `adam_01__`

| Field | Value |
|-------|-------|
| **event_id** | `adam_01__` |
| **Node / prophet** | adam — آدم عليه السلام |
| **Event title** | تعليم الأسماء |
| **Event summary** | مرحلة من القصة: تعليم الأسماء — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 2:31–33 |
| **relation_type** | main |
| **evidence_note_ar** | آيات تعليم آدم الأسماء كلها — مقترح ضمن سياق قصة آدم في سورة البقرة (مسودة prototype: 2:30-37). |
| **reviewer_note** | تقسيم حدث «تعليم الأسماء» من كتلة prototype الموحدة 2:30-37 — يحتاج تأكيد عالم قبل الدمج. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** Prototype used a single block **2:30–37** for all Adam events. This proposal splits «تعليم الأسماء» to 2:31–33. Scholar must confirm boundaries vs `adam_02__` (السجود) and `adam_03__` (الوسوسة) before promotion.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 2 — `adam_04__`

| Field | Value |
|-------|-------|
| **event_id** | `adam_04__` |
| **Node / prophet** | adam — آدم عليه السلام |
| **Event title** | الهبوط والتلقي |
| **Event summary** | مرحلة من القصة: الهبوط والتلقي — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 2:35–39 |
| **relation_type** | main |
| **evidence_note_ar** | آيات الهبوط من الجنة وتوبة آدم وحواء وقبول التوبة — مقترح ضمن 2:30-37. |
| **reviewer_note** | تحقق من عدم تداخل النطاق مع adam_03__ (الوسوسة) قبل الاعتماد. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** Same prototype block split as `adam_01__`. Confirm 2:35–39 does not overlap `adam_03__` (وسوسة — often 2:35–36 or 7:20–22). Coordinate Adam batch boundaries holistically.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 3 — `ibrahim_04__`

| Field | Value |
|-------|-------|
| **event_id** | `ibrahim_04__` |
| **Node / prophet** | ibrahim — إبراهيم عليه السلام |
| **Event title** | الذبح |
| **Event summary** | مرحلة من القصة: الذبح — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 37:102–107 |
| **relation_type** | main |
| **evidence_note_ar** | آيات ابتلاء إبراهيم بذبح ابنه وفديه بالذبح العظيم — القصة منصوص عليها في سورة الصافات. |
| **reviewer_note** | النص قرآني واضح لكن seed لا يحتوي مرجعًا صريحًا — مسودة sprint فقط، لا approved. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **low** |

**Caution:** Narrative is well known in Surah al-Saffat. Seed lacks explicit source note — scholar should confirm range and upgrade confidence only after source check (`quran_text` when licensed import exists).

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 4 — `ibrahim_05__`

| Field | Value |
|-------|-------|
| **event_id** | `ibrahim_05__` |
| **Node / prophet** | ibrahim — إبراهيم عليه السلام |
| **Event title** | بناء البيت |
| **Event summary** | مرحلة من القصة: بناء البيت — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 2:127–129 |
| **relation_type** | main |
| **evidence_note_ar** | آيات رفع إبراهيم وإسماعيل قواعد البيت والدعاء — حدث «بناء البيت». |
| **reviewer_note** | قارن مع ibrahim_kaaba (21:51-70 في precise_evidence) — قد يكون هناك تداخل أو خطأ في seed؛ مراجعة عالم مطلوبة. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **high** |

**Caution:** **2:127–129 is suitable for raising the foundations of the House.** However, existing curated event `ibrahim_kaaba` maps **21:51–70** while its seed **title** is «تحطيم الأصنام» and **summary** describes building the Kaaba. Scholar must avoid duplicate/conflicting mappings — decide whether to merge events, fix `ibrahim_kaaba`, or assign distinct ayah ranges.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 5 — `maryam_03__`

| Field | Value |
|-------|-------|
| **event_id** | `maryam_03__` |
| **Node / prophet** | maryam — مريم عليها السلام |
| **Event title** | المخاض |
| **Event summary** | مرحلة من القصة: المخاض — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 19:22–26 |
| **relation_type** | main |
| **evidence_note_ar** | آيات مخاض مريم وندائها لو أنها ماتت قبل هذا — ضمن سرد سورة مريم (مسودة prototype: 19:16-34). |
| **reviewer_note** | تأكد من حدود النطاق مقابل isa_birth (19:16-21) الموجود مسبقًا في precise_evidence. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** Possible overlap between **Maryam 19:16–34**, **`isa_birth` (19:16–21)**, and Isa’s speech in 19:27–33. Confirm exact boundaries so 19:16–21 is not double-mapped.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 6 — `maryam_04__`

| Field | Value |
|-------|-------|
| **event_id** | `maryam_04__` |
| **Node / prophet** | maryam — مريم عليها السلام |
| **Event title** | العودة |
| **Event summary** | مرحلة من القصة: العودة — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 19:27–33 |
| **relation_type** | main |
| **evidence_note_ar** | آيات عودة مريم إلى قومها بالمولود والتعجب من المعجزة — تتمة سورة مريم. |
| **reviewer_note** | راجع هل ayah_to=33 كافٍ أم يمتد إلى 34 — مسودة sprint فقط. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** Continuation of 19:16–34 block. Ayah 19:30–33 includes **Isa’s speech** — scholar should confirm whether «العودة» ends at 33 or includes 34, and how this relates to `isa_birth` / future Isa events.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 7 — `musa_firawn`

| Field | Value |
|-------|-------|
| **event_id** | `musa_firawn` |
| **Node / prophet** | musa — موسى عليه السلام |
| **Event title** | اليم |
| **Event summary** | عاد موسى إلى فرعون بالآيات والحجة. |
| **Proposed ayah range** | 20:24–56 |
| **relation_type** | main |
| **evidence_note_ar** | مرجع seed صريح: «سورة طه 24-56» — سرد موسى مع فرعون والآيات والحجة. |
| **reviewer_note** | تعارض: العنوان «اليم» والملخص عن العودة لفرعون — أُعيدت review_status إلى pending في Phase 5. أصلح metadata قبل أي approved. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **high** |

**⚠ Critical caution — `musa_firawn`:** Title **«اليم»** (the sea) may **not** match **20:24–56** (Moses sent to Pharaoh, signs, magicians’ prelude). The seed source note cites Ta Ha 24–56, which aligns with the **summary** (return to Pharaoh with signs), not the title.

**Scholar must decide:**
- **Rename** to e.g. «مواجهة فرعون» or «إرسال موسى إلى فرعون» and keep 20:24–56, **or**
- **Change ayah range** if the intended event is truly «اليم» (river/sea — likely covered by `musa_birth` 28:7–13)

Do **not** approve until title, summary, and ayah range are aligned.

**Reviewer decision options:** approve after source check · revise ayah range · split event · **rename event** · reject mapping · needs source

---

## Mapping 8 — `musa_03__`

| Field | Value |
|-------|-------|
| **event_id** | `musa_03__` |
| **Node / prophet** | musa — موسى عليه السلام |
| **Event title** | مدين |
| **Event summary** | مرحلة من القصة: مدين — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 28:22–28 |
| **relation_type** | main |
| **evidence_note_ar** | آيات موسى في مدين: الهرب، الماء، الشعيب، الزواج — سورة القصص (ضمن prototype 28:7-35). |
| **reviewer_note** | نطاق مقترح من سرد القصص — seed يحمل ملاحظة عامة فقط؛ لا approved حتى مراجعة بشرية. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **low** |

**Caution:** Standard Qasas narrative for Madyan. Confirm 28:22–28 vs wider 28:7–35 prototype block.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 9 — `musa_09__`

| Field | Value |
|-------|-------|
| **event_id** | `musa_09__` |
| **Node / prophet** | musa — موسى عليه السلام |
| **Event title** | الخضر |
| **Event summary** | مرحلة من القصة: الخضر — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 18:60–82 |
| **relation_type** | main |
| **evidence_note_ar** | قصة موسى والخضر — مسودة prototype: الكهف 18:60-82. |
| **reviewer_note** | نطاق طويل — تحقق أن relation_type=main مناسب للحدث كاملًا وليس supporting فقط. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** Long passage (18:60–82). Seed title is correctly **الخضر** (Arabic). Confirm whether entire surah segment is `main` or needs `supporting` splits. Prototype block matches full Khidr episode.

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Mapping 10 — `isa_04__`

| Field | Value |
|-------|-------|
| **event_id** | `isa_04__` |
| **Node / prophet** | isa — عيسى عليه السلام |
| **Event title** | الغلو |
| **Event summary** | مرحلة من القصة: الغلو — ملخص تعليمي يحتاج مراجعة. |
| **Proposed ayah range** | 5:116–118 |
| **relation_type** | main |
| **evidence_note_ar** | آيات تصحيح الغلو في عيسى — سؤال الله لعيسى عن قول الناس وبراءته — مسودة prototype: المائدة 5:116-118. |
| **reviewer_note** | prototype يربط كتلة واحدة بالغلو — تأكيد حدود الحدث قبل promote إلى precise_evidence. |
| **current review_status** | pending |
| **current source_status** | pending |
| **proposed_review_status** | pending |
| **evidence_confidence** | needs_review |
| **risk level** | **medium** |

**Caution:** 5:116–118 is distinct from Maryam 19:16–34. Still confirm no thematic overlap with `isa_birth` / Maryam return narrative; prototype used this block for Isa figure-level «الغلو».

**Reviewer decision options:** approve after source check · revise ayah range · split event · rename event · reject mapping · needs source

---

## Risk overview

| Risk | event_ids |
|------|-----------|
| **High** | `musa_firawn`, `ibrahim_05__` |
| **Medium** | `adam_01__`, `adam_04__`, `maryam_03__`, `maryam_04__`, `musa_09__`, `isa_04__` |
| **Low** | `ibrahim_04__`, `musa_03__` |

---

## What the scholar must decide (summary)

1. **Metadata fixes** — especially `musa_firawn` title vs ayah range.
2. **Boundary splits** — Adam 2:30–37; Maryam 19:16–34 vs existing curated events.
3. **Duplicate reconciliation** — `ibrahim_05__` vs `ibrahim_kaaba`.
4. **Confidence upgrade** — only after source check; never leave `needs_review` on approved items.
5. **Reject or defer** — any mapping that cannot be verified without tafsir invention.

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
