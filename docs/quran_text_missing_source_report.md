# Quran Text Missing Source Report

**Date:** 2026-07-05  
**Phase:** 25 — Licensed Quran Text Import and Mushaf Verification  
**Status:** No import performed

## Summary

Phase 25 inspected the workspace for a **licensed full Quran JSON** file. **No licensed source file was found.** Therefore:

- **No Quran text was imported**
- **`src/data/quran/quran_text.index.json` remains the empty runtime stub**
- **`src/data/quran/quran_text.full.json` was not created**
- The Mushaf Reader (`#mushaf`) continues to show **safe placeholder references only**
- `npm run qa` still passes in placeholder mode

## Paths checked

| Path | Result |
|------|--------|
| `imports/quran/quran_text.json` | **Not found** |
| `imports/quran/hafs_uthmani.json` | **Not found** |
| `src/data/quran/quran_text.full.json` | **Not found** |

The `imports/quran/` directory does not exist yet. Only the structural sample exists at `src/data/quran/quran_text.sample.json` (marked `sample_only_not_full_quran` — **not** valid for production import).

## How to add a licensed source file

1. Obtain a **licensed** Uthmani (Hafs) Quran JSON dataset with explicit permission to use it in this application.
2. Place the file at one of these locations (create `imports/quran/` if needed):

   ```
   imports/quran/quran_text.json
   ```

   or

   ```
   imports/quran/hafs_uthmani.json
   ```

   The import script accepts any path — these are the recommended drop locations.

3. **Do not** scrape websites, manually type ayahs, or edit `text_uthmani` after export.

## Expected JSON format

Root object with `meta` and `ayahs`:

```json
{
  "meta": {
    "source_name": "Licensed dataset name",
    "source_url": "https://…",
    "license": "SPDX or license string you are allowed to use",
    "script_type": "uthmani",
    "riwayah": "hafs",
    "imported_at": "",
    "notes": "optional"
  },
  "ayahs": [
    {
      "surah_id": 1,
      "ayah_number": 1,
      "ayah_key": "1:1",
      "text_uthmani": "…verbatim Uthmani from licensed source…",
      "text_simple": "optional",
      "juz": 1,
      "page": 1
    }
  ]
}
```

### Required fields

| Field | Requirement |
|-------|-------------|
| `meta.source_name` | Non-empty string |
| `meta.license` | Non-empty license identifier |
| `meta.script_type` | Must be `uthmani` |
| `meta.riwayah` | Must match dataset (typically `hafs`) |
| `ayahs` | Array of **exactly 6236** ayahs for full import |
| `surah_id` | Integer 1–114 |
| `ayah_number` | Valid for surah per `src/data/surahs.json` |
| `ayah_key` | Must equal `surah_id:ayah_number` |
| `text_uthmani` | Non-empty; copied verbatim — never normalized |

**Do not** include `"status": "sample_only_not_full_quran"` on production files.

See also: `src/data/quran/quran_text.sample.json` (structure only) and `docs/quran_text_import_policy.md`.

## Validation command

```bash
node scripts/validate_quran_text.mjs path/to/your/licensed/quran.json
```

Expected output on success:

```
PASS validate_quran_text path/to/your/licensed/quran.json
ayahs: 6236
```

Validation is strict: 6236 ayahs, unique keys, valid surah/ayah numbers, required meta fields, and **no modification** of `text_uthmani` during validation.

## Import command

After validation passes:

```bash
node scripts/import_quran_text.mjs path/to/your/licensed/quran.json --force
```

This will:

1. Re-validate the file (full 6236 ayahs required)
2. Write `src/data/quran/quran_text.full.json` (archive, verbatim)
3. Write `src/data/quran/quran_text.index.json` (runtime lookup)
4. Copy `text_uthmani` **verbatim** — no normalization

## Post-import verification

```bash
node scripts/verify_quran_text_import.mjs
npm run qa
```

Manual Mushaf checks at `#mushaf`:

- Badge: **النص القرآني مستورد**
- `text_uthmani` visible (not placeholder)
- Surah selector, go-to surah/ayah, bookmarks, settings still work
- Story/Study **فتح في المصحف** opens real text when available

## Current app behavior (no import)

| Component | Behavior |
|-----------|----------|
| Mushaf `#mushaf` | Placeholder: *النص القرآني الكامل غير مستورد بعد. يظهر هنا مرجع الآية فقط.* |
| `isQuranTextImported()` | `false` |
| `getAyah()` | Returns `available: false` + safe placeholder |
| Evidence / public final gate | Unchanged — still strict |
| Arabic disclaimer | Preserved |

## Safety reminder

- **Never** edit `text_uthmani` manually in the repo after import
- **Never** invent, scrape, or type Quran text into the codebase
- **Never** import tafsir through this pipeline
- Owner approval SQL must **not** be applied automatically

When a licensed file is added, re-run Phase 25 (or follow the commands above) and create `docs/quran_text_import_result.md` with import metadata and QA results.
