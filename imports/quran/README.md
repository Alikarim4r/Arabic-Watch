# Licensed Quran text drop folder

Place a **licensed** full Quran JSON file here before import.

Recommended filenames:

- `quran_text.json`
- `hafs_uthmani.json`

Then run:

```bash
node scripts/validate_quran_text.mjs imports/quran/quran_text.json
node scripts/import_quran_text.mjs imports/quran/quran_text.json --force
node scripts/verify_quran_text_import.mjs
npm run qa
```

See `docs/quran_text_import_policy.md` and `docs/quran_text_missing_source_report.md`.

**Do not** scrape, invent, or manually type Quran text into this repository.
