# Evidence Mapping Sprint 04 — Review Notes

**Patch:** `examples/evidence_patch.batch_04.proposed.json`  
**Status:** `proposed` — not applied  
**Batches 1–3:** Still unapplied / unapproved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## What was proposed (10)

| event_id | Node | Ayah | confidence | status |
|----------|------|------|------------|--------|
| `yusuf_04__` | yusuf | 12:23–29 | needs_review | pending |
| `yusuf_05__` | yusuf | 12:33–42 | needs_review | pending |
| `yusuf_06__` | yusuf | 12:43–49 | needs_review | pending |
| `yusuf_07__` | yusuf | 12:54–57 | needs_review | pending |
| `yusuf_08__` | yusuf | 12:92–100 | needs_review | pending |
| `muhammad_03__` | muhammad | 3:123–126 | needs_review | pending |
| `muhammad_04__` | muhammad | 33:9–22 | needs_review | pending |
| `nuh_03__` | nuh | 11:40–41 | needs_review | pending |
| `yunus_01__` | yunus | 37:139–141 | needs_review | pending |
| `yunus_04__` | yunus | 10:98 | needs_review | pending |

All include `evidence_note_ar`, `reviewer_note`, `relation_type`. No `source_id`. No `approved`.

---

## What was not proposed

- Batches 1–3 events (30) — unchanged
- **Batch 5 deferred (8):** `ayyub_03__`, `dawud_03__`, `dhulqarnayn_01__`, `dhulqarnayn_02__`, `isa_02__`, `isa_03__`, `maryam_02__`, `sulayman_03__`
- No apply to seed or Supabase

---

## Uncertain mappings

| event_id | Uncertainty |
|----------|-------------|
| `yusuf_04__`–`yusuf_07__` | All sub-ranges of seed `yusuf_prison` precise block (12:23–57) |
| `yusuf_07__` | May need 12:50–53 (king's dream) included in تمكين |
| `muhammad_03__` | Badr narrated in Al Imran and Anfal — 3:123–126 vs 8:9–19 |
| `nuh_03__` | Flood overlaps `nuh_ark` (11:36–44) and Batch 2 `nuh_04__` (11:42–46) |
| `yunus_01__` | Sub-range of Batch 2 `yunus_02__` (37:139–144) |
| `yunus_04__` | Community salvation (10:98) vs personal rescue in other Yunus events |

---

## Overlaps with earlier batches / seed

| Batch 4 event | Overlap |
|---------------|---------|
| `yusuf_04__`–`yusuf_07__` | Seed `yusuf_prison` event_ayahs 12:23–57 |
| `nuh_03__` | Seed `nuh_ark` 11:36–44; Batch 2 `nuh_04__` 11:42–46 |
| `yunus_01__` | Batch 2 `yunus_02__` 37:139–144 |
| `muhammad_03__`, `muhammad_04__` | Batch 3 `muhammad_02__`, `muhammad_05__` — same node, no ayah overlap |

No duplicate `event_id` across batches.

---

## Items requiring later owner review

1. **Yusuf arc split** — five events vs single `yusuf_prison` precise block
2. **Nuh flood boundaries** — `nuh_03__` vs `nuh_ark` vs `nuh_04__`
3. **Yunus full arc** — coordinate Batch 2 + Batch 4 proposals
4. **Muhammad battles** — confirm surah choice for Badr and Ahzab range ends

---

## Items not safe for public-final

All 10 Batch 4 mappings remain `needs_review` / `pending`. None qualify for `isFinalContent()` promotion.

**Public-final safe events: 6** (unchanged).

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
