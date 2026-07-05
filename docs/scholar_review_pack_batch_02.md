# Scholar Review Pack — Evidence Mapping Batch 2

**Phase:** 16  
**Patch:** `examples/evidence_patch.batch_02.proposed.json` (proposed — not applied)  
**Template:** `examples/evidence_patch.batch_02.review_template.json`  
**Batch 1:** Unapplied / unapproved

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Summary

| Metric | Value |
|--------|------:|
| Proposed mappings | 10 |
| `pending` | 10 |
| `needs_review` | 10 |
| `approved` | 0 |
| Public-final safe (unchanged) | 6 |

---

## Per-mapping review sheet

### `yunus_02__` — الحوت · yunus

| Field | Value |
|-------|-------|
| Proposed ayah | 37:139–144 |
| relation_type | main |
| review / source / evidence | pending / pending / needs_precise_mapping |
| evidence_confidence | needs_review |
| risk | **medium** |
| evidence_note_ar | سرد يونس والحوت في سورة الصافات |
| reviewer_note | تحقق من حدود النطاق مقابل yunus_03__ وyunus_04__ |
| decisions | approve after source check · revise ayah · split · rename · reject · needs source |

### `yunus_03__` — الدعاء · yunus

| Field | Value |
|-------|-------|
| Proposed ayah | 21:87–88 |
| risk | **low** (well-known ayah; still needs_review) |
| evidence_note_ar | دعاء يونس — prototype الأنبياء 21:87–88 |
| caution | Famous passage — scholar must still confirm before approved |

### `ayyub_01__` — الضر · ayyub

| Field | Value |
|-------|-------|
| Proposed ayah | 21:83 |
| risk | **medium** |
| caution | Single ayah for «الضر» — may need supporting range; overlaps ayyub_02 |

### `ayyub_02__` — الدعاء · ayyub

| Field | Value |
|-------|-------|
| Proposed ayah | 21:83–84 |
| risk | **medium** |
| caution | Prototype block split with ayyub_01__ |

### `sulayman_01__` — الهدهد · sulayman

| Field | Value |
|-------|-------|
| Proposed ayah | 27:20–22 |
| risk | **low** |
| caution | Sub-range of prototype 27:15–44 |

### `sulayman_02__` — ملكة سبأ · sulayman

| Field | Value |
|-------|-------|
| Proposed ayah | 27:23–31 |
| risk | **medium** |
| caution | Boundary vs deferred sulayman_03__ (العرش) |

### `dawud_01__` — قتل جالوت · dawud

| Field | Value |
|-------|-------|
| Proposed ayah | 2:251 |
| risk | **low** |
| caution | Direct ayah — do not auto-approve without source_id |

### `dawud_02__` — الحكم · dawud

| Field | Value |
|-------|-------|
| Proposed ayah | 38:21–26 |
| risk | **medium** |
| caution | Split from prototype 38:17–26 |

### `dhulqarnayn_03__` — بناء السد · dhulqarnayn

| Field | Value |
|-------|-------|
| Proposed ayah | 18:94–98 |
| risk | **low** |
| caution | End of prototype 18:83–98; dhulqarnayn_01/02 deferred |

### `nuh_04__` — نداء الابن · nuh

| Field | Value |
|-------|-------|
| Proposed ayah | 11:42–46 |
| risk | **high** |
| caution | Overlaps `nuh_ark` curated 11:36–44; nuh_03__ deferred |

---

## Risk overview

| High | `nuh_04__` |
| Medium | `yunus_02__`, `ayyub_01__`, `ayyub_02__`, `sulayman_02__`, `dawud_02__` |
| Low | `yunus_03__`, `sulayman_01__`, `dawud_01__`, `dhulqarnayn_03__` |

---

## Workflow

1. Fill `docs/scholar_review_decision_table_batch_02.md` or JSON template  
2. `node scripts/compile_scholar_review_decisions.mjs --input examples/evidence_patch.batch_02.review_template.json --output examples/evidence_patch.batch_02.revised.proposed.json`  
3. Validate revised patch  
4. Later: content change batch + controlled apply (not in this phase)

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
