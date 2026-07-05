# Batch Review → Promotion Workflow

How evidence mapping Batch 1 moves from **proposed patch** to production — with **no auto-approval**.

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Overview

```
Phase 13: proposed patch (10 mappings, all pending)
        ↓
Phase 14: scholar review package + decision table + review template
        ↓
Human scholar: decisions per mapping (no auto-approve)
        ↓
Revised evidence patch (engineer/reviewer builds from decisions)
        ↓
content_change_batch (draft → submitted → approved)
        ↓
Controlled apply SQL (validate → generate → verify → manual execute)
        ↓
Final QA + isFinalContent() gate
        ↓
Optional public-final display (only if all gates pass)
```

---

## 1. Proposed patch (Phase 13)

**File:** `examples/evidence_patch.batch_01.proposed.json`

- `meta.status: proposed`
- 10 mappings, all `proposed_review_status: pending`
- All `evidence_confidence: needs_review`
- No `source_id`
- **Not applied** to `seed_content.json` or Supabase

Validate:

```bash
node scripts/validate_evidence_patch.mjs examples/evidence_patch.batch_01.proposed.json
```

---

## 2. Scholar review package (Phase 14)

**Files:**

| File | Purpose |
|------|---------|
| `docs/scholar_review_pack_batch_01.md` | Full context, risks, decision options per mapping |
| `docs/scholar_review_decision_table_batch_01.md` | Human-fillable decision table |
| `examples/evidence_patch.batch_01.review_template.json` | Machine-readable template with empty scholar fields |

Validate template (blank = OK):

```bash
node scripts/validate_scholar_review_template.mjs examples/evidence_patch.batch_01.review_template.json
```

---

## 3. Human decisions

Scholar completes decisions using options:

- `approve_after_source_check`
- `revise_ayah_range`
- `split_event`
- `rename_event`
- `reject_mapping`
- `needs_source`

**Rules:**

- Do **not** invent tafsir or ayah references.
- Do **not** set `final_recommended_status: approved` without `source_id` and without upgrading `evidence_confidence` from `needs_review`.
- Fix metadata conflicts (e.g. `musa_firawn` title vs range) before approval.
- Reconcile overlaps (`ibrahim_05__` vs `ibrahim_kaaba`, Maryam 19 block vs `isa_birth`).

---

## 4. Revised patch

After review, produce a new JSON patch (e.g. `evidence_patch.batch_01.revised.json`):

- Incorporate corrected ayah ranges, titles, confidence levels
- Still validate with `validate_evidence_patch.mjs`
- Only promote items the scholar explicitly approved
- Rejected mappings stay `needs_precise_mapping` in seed until a future batch

---

## 5. Content change batch

Build batch from revised patch:

```bash
node scripts/build_content_change_batch.mjs examples/evidence_patch.batch_01.revised.json
node scripts/validate_content_change_batch.mjs examples/content_change_batch.batch_01.json
```

Batch lifecycle (see `docs/controlled_apply_workflow.md`):

1. **draft** — reviewer creates batch
2. **submitted** — reviewer submits for admin review
3. **approved** — admin approves (audit only in UI)
4. **applied** — after manual SQL execution

UI records status; **UI never mutates** `story_events` or `event_ayahs` directly.

---

## 6. Controlled apply SQL

```bash
node scripts/apply_content_change_batch.mjs \
  --file path/to/approved_batch.json \
  --dry-run

node scripts/apply_content_change_batch.mjs \
  --file path/to/approved_batch.json \
  --generate-sql \
  --output supabase/generated/apply_batch_01.sql

node scripts/verify_applied_batch.mjs \
  --file path/to/approved_batch.json \
  --sql supabase/generated/apply_batch_01.sql
```

Apply tooling:

- Generates SQL only (no live DB connection required for QA)
- Does **not** mutate `ayahs.text_uthmani`
- Requires approved batch status
- Rejects items that would violate public final rules

Human engineer executes SQL in Supabase SQL editor after review.

---

## 7. Final QA

```bash
npm run qa
```

Checks include:

- `isFinalContent()` still strict
- No pending/needs_precise_mapping shown as public-final
- Evidence ayah rules (precise events have ayahs; unmapped events have none)
- Public-final count only increases when items pass **all** gates
- Arabic disclaimer unchanged

---

## Why no auto-approval is allowed

| Reason | Detail |
|--------|--------|
| Round-robin removed | Phase 3A approximate mapping caused wrong ayahs on approved events |
| Metadata conflicts | e.g. `musa_firawn`, `ibrahim_kaaba` title/summary mismatches |
| Prototype ≠ authority | Figure-level blocks are draft context only |
| Public trust | `isFinalContent()` requires approved + cited source + precise evidence + confidence ≠ needs_review |
| Quran text immutability | Apply path never writes Quranic text without licensed import |
| Scholarly responsibility | Ayah boundaries and tafsir links require human verification |

**Current state after Phase 14:** Batch 1 remains **proposed only**. Public-final safe events: **6**. Batch 1 items: **0 approved**.

---

## Related docs

- `docs/controlled_apply_workflow.md`
- `docs/content_promotion_workflow.md`
- `docs/evidence_mapping_sprint_01_plan.md`
- `docs/evidence_mapping_sprint_01_review_notes.md`

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
