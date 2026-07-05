# Licensed Quran Text Import

This directory holds **imported** Quranic text only — never hand-edited in UI files and never scraped from random websites.

## Files

| File | Purpose |
|------|---------|
| `quran_text.sample.json` | Structural sample (`status: sample_only_not_full_quran`) — **not** production text |
| `quran_text.index.json` | Runtime lookup index (empty stub until import; overwritten by import script) |
| `quran_text.full.json` | Full licensed import archive (created by import script) |

## Workflow

1. Obtain a **licensed** Uthmani (Hafs) Quran JSON file from an approved source.
2. Validate: `node scripts/validate_quran_text.mjs path/to/your/quran.json`
3. Import: `node scripts/import_quran_text.mjs path/to/your/quran.json`
4. Re-run QA: `npm run qa`

See `/docs/quran_text_import_policy.md` for license requirements and safety rules.

## App behavior without import

When no full Quran index is present, the app shows ayah **references only** with this placeholder:

> النص القرآني الكامل غير مستورد بعد. يظهر هنا مرجع الآية فقط.

Evidence governance, review badges, and the public final gate are unchanged.
