# Evidence Mapping Sprint 03 — Review Notes

**Patch:** `examples/evidence_patch.batch_03.proposed.json`  
**Status:** `proposed` — not applied  
**Batches 1–2:** Still unapplied / unapproved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## What was proposed (10)

| event_id | Node | Ayah | confidence | status |
|----------|------|------|------------|--------|
| `adam_02__` | adam | 2:34 | needs_review | pending |
| `adam_03__` | adam | 2:35–36 | needs_review | pending |
| `ibrahim_03__` | ibrahim | 21:68–70 | needs_review | pending |
| `musa_04__` | musa | 20:9–16 | needs_review | pending |
| `musa_05__` | musa | 7:103–108 | needs_review | pending |
| `musa_06__` | musa | 7:113–122 | needs_review | pending |
| `musa_07__` | musa | 26:63–66 | needs_review | pending |
| `musa_08__` | musa | 20:83–89 | needs_review | pending |
| `muhammad_02__` | muhammad | 9:40 | needs_review | pending |
| `muhammad_05__` | muhammad | 48:1–3 | needs_review | pending |

All include `evidence_note_ar`, `reviewer_note`, `relation_type`. No `source_id`. No `approved`.

---

## What was not proposed

- Batch 1 events (10) — unchanged
- Batch 2 events (10) — unchanged
- `muhammad_03__` (بدر) — multiple surah candidates; defer to Batch 4
- `muhammad_04__` (الأحزاب) — long Ahzab passage; coordinate with Badr
- `nuh_03__` (الطوفان) — overlaps `nuh_ark` (11:36–44) and Batch 2 `nuh_04__`
- Remaining ~18 `needs_precise_mapping` events outside Batches 1–3
- No apply to seed or Supabase

---

## Uncertain mappings

| event_id | Uncertainty |
|----------|-------------|
| `adam_03__` | Overlaps Batch 1 `adam_04__` (2:35–39) — scholar must split وسوسة vs هبوط |
| `ibrahim_03__` | Sub-range inside `ibrahim_kaaba` precise block 21:51–70 |
| `musa_04__` | Thematic overlap with Batch 1 `musa_firawn` (20:24–56) in same surah |
| `musa_07__` | Sea parting narrated in 2:50, 7:136, 10:90, 20:77, 26:63, etc. |
| `musa_08__` | Calf episode also in 2:51, 7:148, 11:69 |
| `muhammad_02__` | Single-ayah proposal; hijra may need wider range |

---

## Overlaps with earlier batches

| Batch 3 event | Earlier batch overlap |
|---------------|----------------------|
| `adam_02__`, `adam_03__` | Batch 1 `adam_01__` (2:31–33), `adam_04__` (2:35–39) — same Baqara block |
| `musa_04__`, `musa_08__` | Batch 1 `musa_firawn` (20:24–56) — same surah Ta Ha |
| `ibrahim_03__` | Seed `ibrahim_kaaba` precise_evidence (21:51–70) |

No duplicate `event_id` across batches.

---

## Items requiring later owner review

1. **Adam arc split** — four events sharing Baqara 2:30–39 narrative
2. **Musa Ta Ha vs A'raf** — parallel Pharaoh narratives across surahs
3. **Muhammad battles** — `muhammad_03__` and `muhammad_04__` deferred
4. **Nuh flood** — `nuh_03__` still unmapped due to `nuh_ark` overlap

---

## Items not safe for public-final

All 10 Batch 3 mappings remain `needs_review` / `pending`. None qualify for `isFinalContent()` promotion without scholar approval, `source_id`, and controlled apply.

**Public-final safe events: 6** (unchanged).

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
