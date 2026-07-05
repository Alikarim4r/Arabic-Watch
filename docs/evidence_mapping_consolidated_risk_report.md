# Evidence Mapping — Consolidated Risk Report

**Date:** 2026-07-05  
**Scope:** Batches 1–5 consolidated (48 proposed mappings)  
**Status:** Proposed only — not applied

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Executive summary

All 48 `needs_precise_mapping` events have draft ayah proposals. **None are approved.** Primary risks are **overlapping ayah ranges** within the same surah block and **seed metadata mismatches**. Full Quran text is not imported in this environment — ayah verification against licensed text remains an owner task.

---

## Duplicate / overlapping ayah range warnings

| Area | Events | Issue |
|------|--------|-------|
| Adam (Baqara 2:30–39) | adam_01__ … adam_04__ | Four events split one narrative block |
| Musa Ta Ha | musa_firawn, musa_04__, musa_08__ | Same surah, overlapping themes |
| Musa A'raf | musa_05__, musa_06__ | Adjacent Pharaoh narrative |
| Yusuf | yusuf_04__–yusuf_07__ | Sub-ranges of seed `yusuf_prison` (12:23–57) |
| Nuh Hud | nuh_03__, nuh_04__ vs `nuh_ark` | 11:36–46 flood/ark block |
| Yunus | yunus_01__–yunus_04__ | Saffat 37 + Anbiya 21 + Yunus 10 |
| Ayyub | ayyub_01__–ayyub_03__ | Anbiya 21:83–84 split three ways |
| Dhulqarnayn | dhulqarnayn_01__–03__ | Kahf 18:83–98 split four ways |
| Sulayman | sulayman_01__–03__ | Naml 27:20–40 sub-ranges |
| Isa/Maryam | maryam_02__–04__, isa_02__, isa_04__ | Al Imran + Maida + Maryam surah |
| Ibrahim | ibrahim_05__ vs `ibrahim_kaaba` | 21:51–70 vs 2:127–129 |

---

## Highlighted review items (required)

### musa_firawn title/range issue
- **event_id:** `musa_firawn`
- **Issue:** Title «اليم» vs summary about Pharaoh; range 20:24–56 is broad
- **Risk:** high

### ibrahim_05__ vs ibrahim_kaaba overlap
- **event_id:** `ibrahim_05__`
- **Issue:** Proposed 2:127–129 vs precise `ibrahim_kaaba` 21:51–70
- **Risk:** high

### Adam split boundaries
- **events:** `adam_01__`–`adam_04__` across Batches 1 and 3
- **Issue:** Baqara 2:30–39 boundary splits
- **Risk:** high

### Maryam/Isa boundary overlap
- **events:** `maryam_02__`, `maryam_03__`, `isa_birth` precise, `isa_02__`
- **Issue:** Glad tidings, birth, miracles across surahs 3, 5, 19
- **Risk:** high

### Nuh overlap
- **events:** `nuh_03__`, `nuh_04__`, seed `nuh_ark`
- **Issue:** Hud 11:36–46 shared flood narrative
- **Risk:** high

### Yusuf sub-ranges
- **events:** `yusuf_04__`–`yusuf_08__`
- **Issue:** Split of `yusuf_prison` precise block 12:23–57
- **Risk:** high

### Muhammad Badr alternate range
- **event_id:** `muhammad_03__`
- **Issue:** Proposed 3:123–126 vs alternate Anfal 8:9–19
- **Risk:** high

### Yunus overlap
- **events:** `yunus_01__`–`yunus_04__` across Batches 2 and 4
- **Issue:** Multiple surahs for one prophet arc
- **Risk:** high/medium

### Sulayman sub-ranges
- **events:** `sulayman_01__`–`sulayman_03__`
- **Issue:** Naml 27:20–40 sequential splits
- **Risk:** high

---

## Events that may need renaming

| event_id | Issue |
|----------|-------|
| `musa_firawn` | Title «اليم» does not match Pharaoh summary |
| `ibrahim_kaaba` (precise) | Title «تحطيم الأصنام» vs kaaba building summary (seed metadata — outside sprint patches) |

---

## Events that may need splitting

- Adam arc (4 events on 2:30–39)
- Yusuf prison block (yusuf_04–07 vs yusuf_prison)
- Dhulqarnayn Kahf block (4 events)
- Ayyub on 21:83–84 (3 events)

---

## Events that may need source

All 48 proposed mappings currently have empty `source_id`. Any `approve_after_source_check` decision requires a valid seed `source_id` (e.g. `quran_text`) plus owner note.

---

## Pending until Quran text imported

All mappings should be verified against licensed Quran text before public-final promotion. The app runs without full Quran import; `getAyah` returns placeholders until import.

---

## High priority review list (26 items)

1. `adam_01__` — تعليم الأسماء — 2:31–33 — تقسيم كتلة البقرة 2:30-37 مع adam_02__ وadam_03__ وadam_04__
1. `adam_02__` — السجود لآدم — 2:34 — نطاق 2:34 ضمن كتلة آدم في البقرة — تداخل مع الدفعة 1 و3
1. `adam_03__` — وسوسة إبليس — 2:35–36 — 2:35-36 يتداخل مع adam_04__ (2:35-39) في الدفعة 1
1. `adam_04__` — الهبوط والتلقي — 2:35–39 — 2:35-39 يتداخل مع adam_03__ في الدفعة 3
1. `ayyub_02__` — الدعاء — 21:83–84 — 21:83-84 يتداخل مع ayyub_01__ وayyub_03__ (21:84)
1. `ayyub_03__` — الفرج — 21:84 — 21:84 ضمن نطاق ayyub_02__ في الدفعة 2
1. `dhulqarnayn_01__` — السفر — 18:83–86 — بداية كتلة الكهف 18:83-98 — قبل dhulqarnayn_03__
1. `dhulqarnayn_02__` — الحكم بالعدل — 18:87–88 — 18:87-88 بين السفر وبناء السد
1. `dhulqarnayn_03__` — بناء السد — 18:94–98 — 18:94-98 — ختام كتلة ذي القرنين
1. `ibrahim_05__` — بناء البيت — 2:127–129 — تداخل محتمل مع ibrahim_kaaba precise (21:51-70) و2:127-129
1. `isa_02__` — المعجزات — 5:110–115 — معجزات 5:110-115 قريبة من isa_04__ (5:116-118) في الدفعة 1
1. `maryam_02__` — البشارة — 3:45–47 — 3:45-47 مقابل isa_birth (19:16-21) وmaryam_03__ (19:22-26)
1. `maryam_03__` — المخاض — 19:22–26 — 19:22-26 بعد isa_birth precise (19:16-21)
1. `muhammad_03__` — بدر — 3:123–126 — بدر — بديل الأنفال 8:9-19 مقابل آل عمران 3:123-126
1. `musa_firawn` — اليم — 20:24–56 — العنوان «اليم» يتعارض مع ملخص فرعون؛ نطاق طه 20:24-56 واسع
1. `musa_04__` — الوحي — 20:9–16 — طه 20:9-16 يتداخل موضوعيًا مع musa_firawn (20:24-56)
1. `nuh_03__` — الطوفان — 11:40–41 — 11:40-41 يتداخل مع nuh_ark (11:36-44) وnuh_04__
1. `nuh_04__` — نداء الابن — 11:42–46 — 11:42-46 يتداخل مع nuh_ark وnuh_03__
1. `sulayman_02__` — ملكة سبأ — 27:23–31 — 27:23-31 — حدود مع sulayman_03__ (27:38-40)
1. `sulayman_03__` — العرش — 27:38–40 — يتبع sulayman_02__ في سورة النمل
1. `yunus_01__` — المغاضبة — 37:139–141 — 37:139-141 فرعي من yunus_02__ (37:139-144) في الدفعة 2
1. `yunus_02__` — الحوت — 37:139–144 — سرد الصافات — تداخل مع yunus_01__ وyunus_04__
1. `yusuf_04__` — الفتنة — 12:23–29 — فرعي من yusuf_prison precise (12:23-57)
1. `yusuf_05__` — السجن — 12:33–42 — 12:33-42 ضمن yusuf_prison — تداخل مع yusuf_04__
1. `yusuf_06__` — التأويل — 12:43–49 — 12:43-49 ضمن yusuf_prison
1. `yusuf_07__` — التمكين — 12:54–57 — 12:54-57 قد يحتاج 12:50-53 — yusuf_prison

---

## Medium priority (19 items)

- `ayyub_01__` — 21:83
- `dawud_02__` — 38:21–26
- `dawud_03__` — 38:18–19
- `ibrahim_03__` — 21:68–70
- `isa_03__` — 3:52–53
- `isa_04__` — 5:116–118
- `maryam_04__` — 19:27–33
- `muhammad_02__` — 9:40
- `muhammad_04__` — 33:9–22
- `musa_03__` — 28:22–28
- `musa_05__` — 7:103–108
- `musa_06__` — 7:113–122
- `musa_07__` — 26:63–66
- `musa_08__` — 20:83–89
- `musa_09__` — 18:60–82
- `sulayman_01__` — 27:20–22
- `yunus_03__` — 21:87–88
- `yunus_04__` — 10:98
- `yusuf_08__` — 12:92–100

---

## Low priority (3 items)

- `dawud_01__` — 2:251
- `ibrahim_04__` — 37:102–107
- `muhammad_05__` — 48:1–3

---

## Public-final gate

- Current public-final safe count: **6** (unchanged)
- No sprint proposal qualifies for `isFinalContent()` until owner approval + apply workflow

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
