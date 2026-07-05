# Owner Review — All Batches (Batches 1–5)

**Status:** Consolidated proposed only — **not applied**, **not approved**  
**Patch:** `examples/evidence_patch.all_batches.proposed.json`  
**Template:** `examples/evidence_patch.all_batches.owner_review_template.json`  
**CSV:** `examples/evidence_patch.all_batches.owner_review.csv`  
**Risk report:** `docs/evidence_mapping_consolidated_risk_report.md`  
**Date:** 2026-07-05

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Warning

**هذه المقترحات ليست معتمدة بعد، ولا تصبح نهائية إلا بعد مراجعة المالك ثم إنشاء Content Batch ثم Controlled Apply.**

---

## Coverage summary

| Metric | Count |
|--------|------:|
| Total story events | 59 |
| Existing precise evidence in seed | 11 |
| needs_precise_mapping in seed | 48 |
| Batch 1 proposed | 10 |
| Batch 2 proposed | 10 |
| Batch 3 proposed | 10 |
| Batch 4 proposed | 10 |
| Batch 5 proposed | 8 |
| **Total proposed (Batches 1–5)** | **48** |
| Public-final safe | **6** (unchanged) |

> All proposed mappings are pending and need owner/human review before approval or application.

---

## Batches overview

| Batch | Node focus | Count |
|-------|------------|------:|
| 1 | adam, ibrahim, musa, maryam, isa | 10 |
| 2 | yunus, ayyub, sulayman, dawud, dhulqarnayn, nuh | 10 |
| 3 | adam, ibrahim, musa, muhammad | 10 |
| 4 | yusuf, muhammad, nuh, yunus | 10 |
| 5 | ayyub, dawud, dhulqarnayn, isa, maryam, sulayman | 8 |

---

## All 48 proposed mappings

| event_id | Batch | Node | Title | Ayah | Risk | Caution |
|----------|-------|------|-------|------|------|---------|
| `adam_01__` | B1 | آدم عليه السلام | تعليم الأسماء | 2:31–33 | high | تقسيم كتلة البقرة 2:30-37 مع adam_02__ وadam_03__ وadam_04__ |
| `adam_02__` | B3 | آدم عليه السلام | السجود لآدم | 2:34 | high | نطاق 2:34 ضمن كتلة آدم في البقرة — تداخل مع الدفعة 1 و3 |
| `adam_03__` | B3 | آدم عليه السلام | وسوسة إبليس | 2:35–36 | high | 2:35-36 يتداخل مع adam_04__ (2:35-39) في الدفعة 1 |
| `adam_04__` | B1 | آدم عليه السلام | الهبوط والتلقي | 2:35–39 | high | 2:35-39 يتداخل مع adam_03__ في الدفعة 3 |
| `ayyub_01__` | B2 | أيوب عليه السلام | الضر | 21:83 | medium | 21:83 — تداخل مع ayyub_02__ و03__ |
| `ayyub_02__` | B2 | أيوب عليه السلام | الدعاء | 21:83–84 | high | 21:83-84 يتداخل مع ayyub_01__ وayyub_03__ (21:84) |
| `ayyub_03__` | B5 | أيوب عليه السلام | الفرج | 21:84 | high | 21:84 ضمن نطاق ayyub_02__ في الدفعة 2 |
| `dawud_01__` | B2 | داود عليه السلام | قتل جالوت | 2:251 | low | آية مباشرة لكن seed لم يُراجع بعد — مسودة sprint؛ لا approve… |
| `dawud_02__` | B2 | داود عليه السلام | الحكم | 38:21–26 | medium | تقسيم ص 38:17-26 |
| `dawud_03__` | B5 | داود عليه السلام | تسبيح الجبال | 38:18–19 | medium | تسبيح الجبال — بدائل 21:79 و34:10 |
| `dhulqarnayn_01__` | B5 | ذو القرنين | السفر | 18:83–86 | high | بداية كتلة الكهف 18:83-98 — قبل dhulqarnayn_03__ |
| `dhulqarnayn_02__` | B5 | ذو القرنين | الحكم بالعدل | 18:87–88 | high | 18:87-88 بين السفر وبناء السد |
| `dhulqarnayn_03__` | B2 | ذو القرنين | بناء السد | 18:94–98 | high | 18:94-98 — ختام كتلة ذي القرنين |
| `ibrahim_03__` | B3 | إبراهيم عليه السلام | النار | 21:68–70 | medium | نطاق فرعي ضمن ibrahim_kaaba precise (21:51-70) |
| `ibrahim_04__` | B1 | إبراهيم عليه السلام | الذبح | 37:102–107 | low | النص قرآني واضح لكن seed لا يحتوي مرجعًا صريحًا — مسودة spri… |
| `ibrahim_05__` | B1 | إبراهيم عليه السلام | بناء البيت | 2:127–129 | high | تداخل محتمل مع ibrahim_kaaba precise (21:51-70) و2:127-129 |
| `isa_02__` | B5 | عيسى عليه السلام | المعجزات | 5:110–115 | high | معجزات 5:110-115 قريبة من isa_04__ (5:116-118) في الدفعة 1 |
| `isa_03__` | B5 | عيسى عليه السلام | الحواريون | 3:52–53 | medium | 3:52-53 — بديل محتمل الصف 61:14 |
| `isa_04__` | B1 | عيسى عليه السلام | الغلو | 5:116–118 | medium | كتلة الغلو 5:116-118 |
| `maryam_02__` | B5 | مريم عليها السلام | البشارة | 3:45–47 | high | 3:45-47 مقابل isa_birth (19:16-21) وmaryam_03__ (19:22-26) |
| `maryam_03__` | B1 | مريم عليها السلام | المخاض | 19:22–26 | high | 19:22-26 بعد isa_birth precise (19:16-21) |
| `maryam_04__` | B1 | مريم عليها السلام | العودة | 19:27–33 | medium | تتمة سورة مريم — حدود ayah_to مع 34 |
| `muhammad_02__` | B3 | محمد ﷺ | الهجرة | 9:40 | medium | 9:40 آية واحدة — قد يحتاج نطاقًا أوسع |
| `muhammad_03__` | B4 | محمد ﷺ | بدر | 3:123–126 | high | بدر — بديل الأنفال 8:9-19 مقابل آل عمران 3:123-126 |
| `muhammad_04__` | B4 | محمد ﷺ | الأحزاب | 33:9–22 | medium | 33:9-22 نطاق طويل للأحزاب |
| `muhammad_05__` | B3 | محمد ﷺ | الفتح | 48:1–3 | low | حدث «الفتح» قد يمتد إلى آيات لاحقة في السورة — مسودة sprint؛… |
| `musa_firawn` | B1 | موسى عليه السلام | اليم | 20:24–56 | high | العنوان «اليم» يتعارض مع ملخص فرعون؛ نطاق طه 20:24-56 واسع |
| `musa_03__` | B1 | موسى عليه السلام | مدين | 28:22–28 | medium | نطاق القصص 28:22-28 — مسودة sprint |
| `musa_04__` | B3 | موسى عليه السلام | الوحي | 20:9–16 | high | طه 20:9-16 يتداخل موضوعيًا مع musa_firawn (20:24-56) |
| `musa_05__` | B3 | موسى عليه السلام | فرعون | 7:103–108 | medium | سرد الأعراف مقابل طه لقصة فرعون |
| `musa_06__` | B3 | موسى عليه السلام | السحرة | 7:113–122 | medium | سحرة الأعراف — حدود مع musa_05__ |
| `musa_07__` | B3 | موسى عليه السلام | البحر | 26:63–66 | medium | فلق البحر مذكور في عدة سور — الشعراء 26:63-66 مقترح |
| `musa_08__` | B3 | موسى عليه السلام | العجل | 20:83–89 | medium | العجل في طه — روايات في البقرة والأعراف |
| `musa_09__` | B1 | موسى عليه السلام | الخضر | 18:60–82 | medium | نطاق طويل الكهف 18:60-82 |
| `nuh_03__` | B4 | نوح عليه السلام | الطوفان | 11:40–41 | high | 11:40-41 يتداخل مع nuh_ark (11:36-44) وnuh_04__ |
| `nuh_04__` | B2 | نوح عليه السلام | نداء الابن | 11:42–46 | high | 11:42-46 يتداخل مع nuh_ark وnuh_03__ |
| `sulayman_01__` | B2 | سليمان عليه السلام | الهدهد | 27:20–22 | medium | فرعي من كتلة النمل 27:15-44 |
| `sulayman_02__` | B2 | سليمان عليه السلام | ملكة سبأ | 27:23–31 | high | 27:23-31 — حدود مع sulayman_03__ (27:38-40) |
| `sulayman_03__` | B5 | سليمان عليه السلام | العرش | 27:38–40 | high | يتبع sulayman_02__ في سورة النمل |
| `yunus_01__` | B4 | يونس عليه السلام | المغاضبة | 37:139–141 | high | 37:139-141 فرعي من yunus_02__ (37:139-144) في الدفعة 2 |
| `yunus_02__` | B2 | يونس عليه السلام | الحوت | 37:139–144 | high | سرد الصافات — تداخل مع yunus_01__ وyunus_04__ |
| `yunus_03__` | B2 | يونس عليه السلام | الدعاء | 21:87–88 | medium | 21:87-88 — آية مشهورة تحتاج مراجعة |
| `yunus_04__` | B4 | يونس عليه السلام | النجاة | 10:98 | medium | 10:98 نجاة القوم — مختلف عن سرد الحوت |
| `yusuf_04__` | B4 | يوسف عليه السلام | الفتنة | 12:23–29 | high | فرعي من yusuf_prison precise (12:23-57) |
| `yusuf_05__` | B4 | يوسف عليه السلام | السجن | 12:33–42 | high | 12:33-42 ضمن yusuf_prison — تداخل مع yusuf_04__ |
| `yusuf_06__` | B4 | يوسف عليه السلام | التأويل | 12:43–49 | high | 12:43-49 ضمن yusuf_prison |
| `yusuf_07__` | B4 | يوسف عليه السلام | التمكين | 12:54–57 | high | 12:54-57 قد يحتاج 12:50-53 — yusuf_prison |
| `yusuf_08__` | B4 | يوسف عليه السلام | العفو | 12:92–100 | medium | 12:92-100 ختام السورة |

---

## Risk summary

| Level | Count |
|-------|------:|
| high | 26 |
| medium | 19 |
| low | 3 |

### High priority (26)

- `adam_01__` (تعليم الأسماء) — تقسيم كتلة البقرة 2:30-37 مع adam_02__ وadam_03__ وadam_04__
- `adam_02__` (السجود لآدم) — نطاق 2:34 ضمن كتلة آدم في البقرة — تداخل مع الدفعة 1 و3
- `adam_03__` (وسوسة إبليس) — 2:35-36 يتداخل مع adam_04__ (2:35-39) في الدفعة 1
- `adam_04__` (الهبوط والتلقي) — 2:35-39 يتداخل مع adam_03__ في الدفعة 3
- `ayyub_02__` (الدعاء) — 21:83-84 يتداخل مع ayyub_01__ وayyub_03__ (21:84)
- `ayyub_03__` (الفرج) — 21:84 ضمن نطاق ayyub_02__ في الدفعة 2
- `dhulqarnayn_01__` (السفر) — بداية كتلة الكهف 18:83-98 — قبل dhulqarnayn_03__
- `dhulqarnayn_02__` (الحكم بالعدل) — 18:87-88 بين السفر وبناء السد
- `dhulqarnayn_03__` (بناء السد) — 18:94-98 — ختام كتلة ذي القرنين
- `ibrahim_05__` (بناء البيت) — تداخل محتمل مع ibrahim_kaaba precise (21:51-70) و2:127-129
- `isa_02__` (المعجزات) — معجزات 5:110-115 قريبة من isa_04__ (5:116-118) في الدفعة 1
- `maryam_02__` (البشارة) — 3:45-47 مقابل isa_birth (19:16-21) وmaryam_03__ (19:22-26)
- `maryam_03__` (المخاض) — 19:22-26 بعد isa_birth precise (19:16-21)
- `muhammad_03__` (بدر) — بدر — بديل الأنفال 8:9-19 مقابل آل عمران 3:123-126
- `musa_firawn` (اليم) — العنوان «اليم» يتعارض مع ملخص فرعون؛ نطاق طه 20:24-56 واسع
- `musa_04__` (الوحي) — طه 20:9-16 يتداخل موضوعيًا مع musa_firawn (20:24-56)
- `nuh_03__` (الطوفان) — 11:40-41 يتداخل مع nuh_ark (11:36-44) وnuh_04__
- `nuh_04__` (نداء الابن) — 11:42-46 يتداخل مع nuh_ark وnuh_03__
- `sulayman_02__` (ملكة سبأ) — 27:23-31 — حدود مع sulayman_03__ (27:38-40)
- `sulayman_03__` (العرش) — يتبع sulayman_02__ في سورة النمل
- `yunus_01__` (المغاضبة) — 37:139-141 فرعي من yunus_02__ (37:139-144) في الدفعة 2
- `yunus_02__` (الحوت) — سرد الصافات — تداخل مع yunus_01__ وyunus_04__
- `yusuf_04__` (الفتنة) — فرعي من yusuf_prison precise (12:23-57)
- `yusuf_05__` (السجن) — 12:33-42 ضمن yusuf_prison — تداخل مع yusuf_04__
- `yusuf_06__` (التأويل) — 12:43-49 ضمن yusuf_prison
- `yusuf_07__` (التمكين) — 12:54-57 قد يحتاج 12:50-53 — yusuf_prison

---

## Owner review checklist

- [ ] Review high-risk items first (see risk report)
- [ ] Resolve ayah boundary overlaps within each prophet arc
- [ ] Fix metadata issues (e.g. `musa_firawn` title vs summary)
- [ ] For each approved item: set `owner_decision=approve_after_source_check`, valid `source_id`, `owner_note`, confidence ≠ `needs_review`
- [ ] Rejected items stay out of Content Batch until re-proposed
- [ ] After owner decisions: run `compile_owner_review_decisions.mjs`
- [ ] Build Content Batch only from owner-approved revised patch
- [ ] Apply via Controlled Apply workflow only — never auto-apply

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
