# Quran Text Import Policy

This document defines how **licensed** Quranic text may enter Quran Story Universe. The app stores ayah references in story content; full Uthmani text is imported separately through a controlled pipeline.

## Accepted source requirements

A Quran JSON file is acceptable only when **all** of the following are true:

1. **License** — You have explicit permission to use and redistribute the text in this application (or your deployment context). The license string must be recorded in `meta.license`.
2. **Provenance** — `meta.source_name` and preferably `meta.source_url` identify the upstream dataset.
3. **Script** — `meta.script_type` must be `uthmani` for this app. Do not substitute simplified or edited orthography for display.
4. **Riwayah** — `meta.riwayah` must match the dataset (default expectation: `hafs`).
5. **Completeness** — Production import requires exactly **6236** ayahs with unique `ayah_key` values.

## Rules (non-negotiable)

| Rule | Rationale |
|------|-----------|
| **No scraping** | Do not fetch Quran text from random websites or undocumented APIs. |
| **No tafsir import** | This pipeline is for Quranic ayah text only — not commentary. |
| **No manual UI embedding** | Do not paste full Quran text into components or CSS. |
| **No text modification** | Validation and import copy `text_uthmani` verbatim. No normalization, diacritic stripping, or “fixes”. |
| **No invented text** | If text is missing, the app shows references + placeholder — never fabricated ayahs. |

## JSON format

See `src/data/quran/quran_text.sample.json` for the expected shape. Sample files must include:

```json
"status": "sample_only_not_full_quran"
```

Sample files validate structure but **cannot** be imported as production text.

## How to validate a Quran JSON file

```bash
node scripts/validate_quran_text.mjs path/to/your/quran.json
```

Validation checks:

- `surah_id` in 1–114
- Valid `ayah_number` per surah
- `ayah_key` equals `surah_id:ayah_number`
- `text_uthmani` present on every row
- No duplicate `ayah_key`
- Required `meta` fields
- **6236 ayahs** for full imports (skipped for sample files)
- `text_uthmani` is never altered during validation

## How to import

```bash
node scripts/import_quran_text.mjs path/to/your/quran.json
```

The import script:

1. Validates the file
2. Writes `src/data/quran/quran_text.full.json` (archive)
3. Writes `src/data/quran/quran_text.index.json` (runtime lookup)
4. Refuses to overwrite an existing full import unless `--force` is passed
5. Rejects sample-only files

## How to verify the app still works

```bash
npm run qa
```

Manual checks:

1. **Without import** — Story Mode and Study Modal show ayah references + placeholder Arabic warning.
2. **Admin Evidence Curation** — Badge shows `النص غير مستورد` until text exists for the selected range.
3. **Public final gate** — Events without precise evidence remain blocked; missing Quran text does not weaken `isFinalContent()`.
4. **Disclaimer** — Arabic disclaimer remains visible: «هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.»

## After import

Reload the app. Repository methods `getAyah`, `getAyahRange`, and `getSurahAyahs` resolve from the index. UI shows Uthmani text for imported ayahs only.

## Removing an import

Delete `quran_text.index.json` and `quran_text.full.json`, then re-run QA. The app falls back to reference-only mode safely.
