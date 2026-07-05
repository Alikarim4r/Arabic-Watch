# Arabic Text Hygiene Report

**Phase:** 15 — Arabic Text Hygiene (Unicode audit correction)  
**Date:** 2026-07-05  
**Checker:** `scripts/check_arabic_text_hygiene.mjs`  
**Unicode audit:** `scripts/audit_khidr_unicode.mjs`

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Correction: Phase 15 summary contradiction

An earlier agent summary incorrectly wrote that `musa_09__.title_ar` was «الخضr» while claiming it was “correct Arabic.” That was **wrong in the summary text only**.

Visually, **«الخضr»** uses Latin **`r` (U+0072)** — an error.  
The correct Arabic word is **«الخضر»** with **`ر` (U+0631)**.

**Seed data was always correct.** Only report/summary wording was confusing.

---

## Unicode audit — `musa_09__.title_ar`

| Character | Code point | Role |
|-----------|------------|------|
| ا | U+0627 | Arabic alef |
| ل | U+0644 | Arabic lam |
| خ | U+062E | Arabic kha |
| ض | U+0636 | Arabic dad |
| ر | U+0631 | Arabic ra (**not** Latin U+0072) |

```
value: "الخضر"
codepoints: ا U+0627 ل U+0644 خ U+062E ض U+0636 ر U+0631
latin letters: none
```

**Also verified:**

| Field | Value | Latin? |
|-------|-------|--------|
| `story_nodes.person_41a9d07c5c.name_ar` | الخضر | No |
| `musa_09__.summary_ar` | … الخضر … | No |

Run audit:

```bash
node scripts/audit_khidr_unicode.mjs
```

---

## Did seed contain Latin `r`?

**No.** The seed never contained «الخضr» (Latin r). No data fix was required.

| Item | Result |
|------|--------|
| Latin `r` (U+0072) in `musa_09__.title_ar` | **Not present** |
| Arabic `ر` (U+0631) in `musa_09__.title_ar` | **Present** |
| `musa_09__.title_ar === "الخضر"` | **Yes** |
| Evidence status changed | **No** |

---

## Hygiene checker rules (updated)

**Tier 1 — zero Latin (A–Z / a–z) in all JSON:**

- `name_ar`, `title_ar`, `summary_ar`, `short_title_ar`, `corrected_event_title`, `proposed_title_ar`

**Tier 2 — zero Latin when mostly Arabic (seed/precise data only):**

- `evidence_note_ar`, `reviewer_note`, `scholar_note`, `description_ar`

**Tier 3 — all scanned Arabic fields:**

- Fail on `الخض` + Latin letter (e.g. الخضr)
- Fail on Latin **adjacent** to Arabic script

**Examples** (`examples/*.json`): Tier 1 on title fields; technical English in `reviewer_note` / `evidence_note_ar` allowed when separated by space/punctuation.

---

## What was fixed (this correction)

| Item | Action |
|------|--------|
| Seed `musa_09__.title_ar` | **No change** — already «الخضر» (U+0631) |
| `precise_event_evidence.json` `meta.description_ar` | Replaced Latin `v0.2` with «الإصدار 0.2» (metadata only; mappings unchanged) |
| `docs/arabic_text_hygiene_report.md` | Clarified Unicode audit + summary contradiction |
| `scripts/check_arabic_text_hygiene.mjs` | Stricter zero-Latin on title/name fields |
| `scripts/audit_khidr_unicode.mjs` | Dedicated Unicode regression audit |
| QA | Regression: `musa_09__.title_ar === "الخضر"`, no Latin in `title_ar` |

---

## How to run

```bash
node scripts/audit_khidr_unicode.mjs
node scripts/check_arabic_text_hygiene.mjs --strict
npm run qa
```

---

## QA result

```
PASS audit_khidr_unicode
PASS check_arabic_text_hygiene --strict
PASS musa_09__.title_ar regression
```

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
