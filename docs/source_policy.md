# Source Policy — سياسة المصادر

## Purpose

Quran Story Universe presents **educational summaries** linked to Quranic ayah references. It is not an independent tafsir authority.

## Approved source tiers

### Tier 1 — Quranic text (required for story claims)

- King Fahd Complex for the Printing of the Holy Quran (developer platform)
- Tanzil Quran Text (with license compliance)
- QPC Hafs via QUL / Tarteel (verify font/text license)

Rules:

- Do not alter Uthmani text.
- Always store `surah_id`, `ayah_from`, `ayah_to`, and `relation_type`.
- Attribute the text provider in `tafsir_sources`.

### Tier 2 — Tafsir summaries (optional, reviewed)

- Licensed tafsir books or approved APIs (Quran.com / Quran Foundation backend, QuranEnc where licensed).
- Store `source_id`, author, license note, and URL.
- Display **short summaries only**, with citation — never full unlicensed copies.

### Tier 3 — Educational framing (lowest)

- Timeline labels, theme names, and lesson bullets must still cite ayah ranges.
- Must pass `content_reviews` before public "approved" status.

## Prohibited

- AI-generated tafsir presented as final religious ruling.
- Random web copies of tafsir books.
- Historical claims marked `quran_explicit` without ayah evidence.
- Publishing unreviewed content without draft badges.

## Visible disclaimer (mandatory)

> **هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.**

## API usage

- Call Quran APIs from a backend service when possible.
- Do not expose private API keys in frontend bundles.
- Cache ayah text according to provider terms.

## Licensing checklist before public launch

- [ ] Quranic text license documented
- [ ] Each tafsir source row has `license_note` and approval flag
- [ ] Commercial use terms verified
- [ ] Attribution displayed in study modal
