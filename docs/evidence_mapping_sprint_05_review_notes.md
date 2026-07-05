# Evidence Mapping Sprint 05 — Review Notes

**Patch:** `examples/evidence_patch.batch_05.proposed.json`  
**Status:** `proposed` — not applied  
**Batches 1–4:** Still unapplied / unapproved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## What was proposed (8 — final batch)

| event_id | Node | Ayah | confidence | status |
|----------|------|------|------------|--------|
| `ayyub_03__` | ayyub | 21:84 | needs_review | pending |
| `dawud_03__` | dawud | 38:18–19 | needs_review | pending |
| `dhulqarnayn_01__` | dhulqarnayn | 18:83–86 | needs_review | pending |
| `dhulqarnayn_02__` | dhulqarnayn | 18:87–88 | needs_review | pending |
| `isa_02__` | isa | 5:110–115 | needs_review | pending |
| `isa_03__` | isa | 3:52–53 | needs_review | pending |
| `maryam_02__` | maryam | 3:45–47 | needs_review | pending |
| `sulayman_03__` | sulayman | 27:38–40 | needs_review | pending |

All include `evidence_note_ar`, `reviewer_note`, `relation_type`. No `source_id`. No `approved`.

---

## What was not proposed

- No events excluded from the final 8 candidates
- Batches 1–4 events (40) — unchanged
- No apply to seed or Supabase

---

## Uncertain mappings

| event_id | Uncertainty |
|----------|-------------|
| `ayyub_03__` | Single ayah 21:84 overlaps Batch 2 `ayyub_02__` (21:83–84) |
| `dawud_03__` | Mountains praising also in 21:79, 34:10 |
| `dhulqarnayn_01__`, `dhulqarnayn_02__` | Split of Kahf 18:83–98 block; Batch 2 has dam (18:94–98) |
| `isa_02__` | Miracles also in 3:49; near Batch 1 `isa_04__` (5:116–118) |
| `maryam_02__` | Glad tidings also in Maryam 19:19–21 (overlaps `isa_birth`) |

---

## Overlaps with earlier batches / seed

| Batch 5 event | Overlap |
|---------------|---------|
| `ayyub_03__` | Batch 2 `ayyub_01__`, `ayyub_02__` (21:83–84) |
| `dawud_03__` | Batch 2 `dawud_02__` (38:21–26) — same surah |
| `dhulqarnayn_01__`, `dhulqarnayn_02__` | Batch 2 `dhulqarnayn_03__` (18:94–98) |
| `isa_02__` | Batch 1 `isa_04__` (5:116–118); seed `isa_birth` (19:16–21) |
| `maryam_02__` | Seed `maryam_withdraw` (3:37); Batch 1 `maryam_03__`, `maryam_04__` |
| `sulayman_03__` | Batch 2 `sulayman_01__`, `sulayman_02__` (27:20–31) |

No duplicate `event_id` across batches.

---

## Items requiring later owner review

1. **Ayyub arc** — three-way split on 21:83–84
2. **Dhulqarnayn Kahf block** — four events across Batches 2 and 5
3. **Isa/Maryam** — surah choice for miracles and glad tidings
4. **Full sprint** — all 48 `needs_precise_mapping` events now have proposed drafts; owner reviews before any apply

---

## Items not safe for public-final

All 8 Batch 5 mappings remain `needs_review` / `pending`.

**Public-final safe events: 6** (unchanged).

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
