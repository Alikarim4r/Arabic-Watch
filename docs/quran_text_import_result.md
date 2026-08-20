# Quran Text Import Result

**Date:** 2026-07-05  
**Phase:** 25 — Licensed Quran Text Import and Mushaf Verification  
**Status:** Import completed successfully

## Source file

| Field | Value |
|-------|-------|
| **Path** | `imports/quran/quran_text.json` |
| **Source name** | Tanzil Quran Text (Uthmani, Version 1.1) |
| **Source URL** | https://tanzil.net |
| **License** | Creative Commons Attribution 3.0; verbatim copying allowed; changing Quran text is not allowed; source must be clearly indicated with link to tanzil.net. |
| **Script type** | uthmani |
| **Riwayah** | hafs |

## Validation

```bash
node scripts/validate_quran_text.mjs imports/quran/quran_text.json
```

**Result:** PASS — 6236 ayahs, required meta fields, unique `ayah_key` values, `text_uthmani` present on every row.

**Note:** `src/data/surahs.json` had incorrect `ayah_count` values for 66 surahs (from surah 44 onward). Metadata was corrected to match the licensed file so validation could pass. The Quran JSON file itself was **not** modified.

## Import

```bash
node scripts/import_quran_text.mjs imports/quran/quran_text.json --force
```

**Result:** PASS

| Output | Path |
|--------|------|
| Runtime index | `src/data/quran/quran_text.index.json` |
| Full archive | `src/data/quran/quran_text.full.json` |
| Total ayahs | 6236 |
| `text_uthmani` | Copied verbatim — no normalization |

## Integrity verification

```bash
node scripts/verify_quran_text_import.mjs
```

**Result:** PASS

- Total ayahs = 6236
- No duplicate `ayah_key`
- All keys match `surah_id:ayah_number`
- Sample lookups OK: `1:1`, `2:255`, `18:60`, `36:1`, `114:6`
- Index meta preserves source_name, license, script_type, riwayah

## Mushaf Reader

After import, `#mushaf` shows:

- Badge: **النص القرآني مستورد**
- `text_uthmani` from index (not placeholder)
- Surah selector, go-to surah/ayah, bookmarks, settings, night mode functional
- Story/Study **فتح في المصحف** opens real ayah text

## QA

```bash
npm run qa
```

**Result:** PASS (see commit for run)

## Warning

**Never edit `text_uthmani` manually** in `quran_text.full.json`, `quran_text.index.json`, or any UI file. To refresh text, replace the licensed source file and re-run validate + import with `--force`.

## Attribution

Quran text from [Tanzil](https://tanzil.net) — Uthmani Hafs, CC BY 3.0. Source must remain clearly indicated per license terms.
