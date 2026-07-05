# Arabic Text Hygiene Report

**Phase:** 15 — Arabic Text Hygiene  
**Date:** 2026-07-05  
**Checker:** `scripts/check_arabic_text_hygiene.mjs`

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## What was checked

| Scope | Files | Fail on error? |
|-------|-------|----------------|
| Core data | `src/data/seed_content.json`, `src/data/precise_event_evidence.json` | **Yes** |
| Examples | `examples/*.json` (6 files) | **Yes** with `--strict` |
| Docs | `docs/*.md` (35 files) | Warnings only |

**Arabic fields scanned:** `name_ar`, `title_ar`, `summary_ar`, `short_title_ar`, `evidence_note_ar`, `reviewer_note`, `scholar_note`, `corrected_event_title`, `proposed_title_ar`, `description_ar`, `disclaimer_ar`, `note_ar`, and related `_ar` keys.

**Detections:**

- Latin letters immediately after Arabic (e.g. «الخضr»)
- Explicit «الخضr» typo pattern
- Empty `title_ar`
- Mojibake / replacement characters (warnings)
- Repeated whitespace (warnings)

---

## «الخضr» typo check

| Location | Result |
|----------|--------|
| `src/data/seed_content.json` — `musa_09__.title_ar` | **Correct:** «الخضر» (Arabic ر) — no Latin `r` |
| `src/data/seed_content.json` — person node name | **Correct:** «الخضر» |
| `examples/evidence_patch.batch_01.*.json` | No typo |
| `docs/*.md` | No «الخضr» typo in data fields |

**Data change required:** **None.** The typo «الخضr» (Latin `r`) does **not** exist in production JSON data. It appeared only in prior agent summaries, not in `seed_content.json`.

**Evidence status:** Unchanged — typo fix not applicable.

---

## What was fixed

No seed or evidence data changes in Phase 15. Hygiene tooling added to **prevent** future «الخضr»-style regressions.

---

## Remaining warnings

With `--strict`, the checker **passes** (exit 0) when no **errors** are found.

Optional warnings (non-blocking) may appear in docs for English prose or table rows mixing scripts. Docs are not failed by default.

Technical English in `reviewer_note` fields (e.g. `event_ayahs`, `prototype`) is allowed and not treated as title typos.

---

## How to run

```bash
# Data + examples — fails on Arabic field errors (including الخضr)
node scripts/check_arabic_text_hygiene.mjs --strict

# Include docs warnings in output (still pass unless errors)
node scripts/check_arabic_text_hygiene.mjs

# Treat warnings as failures (optional CI mode)
node scripts/check_arabic_text_hygiene.mjs --strict --fail-on-warn
```

**QA integration:** `npm run qa` runs `--strict` on data and examples.

---

## QA result (Phase 15)

```
PASS check_arabic_text_hygiene --strict
```

No «الخضr» in Arabic data. `musa_09__` title verified as «الخضر».

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
