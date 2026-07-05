# Evidence Mapping Sprint 02 — Review Notes

**Patch:** `examples/evidence_patch.batch_02.proposed.json`  
**Status:** `proposed` — not applied  
**Batch 1:** Still unapplied / unapproved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## What was proposed (10)

| event_id | Node | Ayah | confidence | status |
|----------|------|------|------------|--------|
| `yunus_02__` | yunus | 37:139–144 | needs_review | pending |
| `yunus_03__` | yunus | 21:87–88 | needs_review | pending |
| `ayyub_01__` | ayyub | 21:83 | needs_review | pending |
| `ayyub_02__` | ayyub | 21:83–84 | needs_review | pending |
| `sulayman_01__` | sulayman | 27:20–22 | needs_review | pending |
| `sulayman_02__` | sulayman | 27:23–31 | needs_review | pending |
| `dawud_01__` | dawud | 2:251 | needs_review | pending |
| `dawud_02__` | dawud | 38:21–26 | needs_review | pending |
| `dhulqarnayn_03__` | dhulqarnayn | 18:94–98 | needs_review | pending |
| `nuh_04__` | nuh | 11:42–46 | needs_review | pending |

All include `evidence_note_ar`, `reviewer_note`, `relation_type`. No `source_id`. No `approved`.

---

## What was not proposed

- Batch 1 events (10) — unchanged
- `nuh_03__` — flood overlap with `nuh_ark`
- Remaining 28 `needs_precise_mapping` events outside this batch
- No apply to seed or Supabase

---

## Confidence breakdown

| Level | Count |
|-------|------:|
| quran_explicit | 0 |
| tafsir_based | 0 |
| scholarly_inference | 0 |
| needs_review | 10 |

Even `dawud_01__` (2:251) stays `needs_review` until scholar confirms.

---

## Scholar confirmation priorities

1. **Yunus arc** — `yunus_02__` (37) vs `yunus_03__` (21)
2. **Ayyub split** — `ayyub_01__` vs `ayyub_02__` on 21:83–84
3. **Nuh overlap** — `nuh_04__` vs `nuh_ark` (11:36–44)
4. **Sulayman sub-ranges** — 27:20–31 vs deferred `sulayman_03__`

---

## Before approval

Same gates as Batch 1: scholar decision, `source_id`, confidence ≠ `needs_review`, controlled apply only.

**Public-final safe events: 6** (unchanged).

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
