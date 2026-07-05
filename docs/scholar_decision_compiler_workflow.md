# Scholar Decision Compiler Workflow

**Phase:** 15 — Scholar Decision Compiler  
**Batch:** Evidence Mapping Sprint 01  
**Status:** Toolchain only — **no apply, no auto-approval**

**Disclaimer:** هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Purpose

After a scholar fills the review template, the **compiler** converts human decisions into a **revised proposed patch** (`revised_proposed`). The compiler:

- Reads scholar decisions — does **not** invent them
- Keeps undecided items **pending**
- Never writes to `seed_content.json` or `precise_event_evidence.json`
- Never auto-approves unless **all** approval gates pass explicitly

---

## Files

| File | Role |
|------|------|
| `examples/evidence_patch.batch_01.review_template.json` | Input — scholar fills `scholar_decision`, corrections, notes |
| `examples/evidence_patch.batch_01.revised.proposed.json` | Output — compiled revised patch |
| `scripts/compile_scholar_review_decisions.mjs` | Compiler |
| `scripts/validate_revised_evidence_patch.mjs` | Validates revised patch |
| `scripts/validate_scholar_review_template.mjs` | Validates template before compile |

---

## Step 1 — Scholar fills review template

Edit `examples/evidence_patch.batch_01.review_template.json` (or copy to a working file).

**Supported `scholar_decision` values:**

| Value | Effect |
|-------|--------|
| `""` (empty) | Keep mapping unchanged; `pending` |
| `needs_source` | `proposed_review_status: needs_source` |
| `reject_mapping` | Excluded from `mappings`; listed in `meta.rejected_proposals` |
| `rename_event` | Sets `proposed_title_ar` (does not mutate seed) |
| `revise_ayah_range` | Uses `corrected_surah_id`, `corrected_ayah_from`, `corrected_ayah_to` |
| `split_event` | Keeps `pending`; marks `compile_status: split_required` |
| `approve_after_source_check` | **Only** sets `approved` if all gates pass (see below) |

Validate template:

```bash
node scripts/validate_scholar_review_template.mjs examples/evidence_patch.batch_01.review_template.json
```

---

## Step 2 — Run compiler

```bash
# Batch 1 (defaults)
node scripts/compile_scholar_review_decisions.mjs

# Any batch
node scripts/compile_scholar_review_decisions.mjs \
  --input examples/evidence_patch.batch_02.review_template.json \
  --output examples/evidence_patch.batch_02.revised.proposed.json
```

**Approval gates** (all required for `proposed_review_status: approved`):

1. `scholar_decision === approve_after_source_check`
2. `final_recommended_status === approved`
3. Valid `source_id` (exists in `tafsir_sources`)
4. `evidence_confidence !== needs_review`
5. Valid ayah range
6. Non-empty `scholar_note`

If any gate fails → item stays **`pending`** with `compile_status: approve_blocked`.

---

## Step 3 — Validate revised patch

```bash
node scripts/validate_revised_evidence_patch.mjs examples/evidence_patch.batch_01.revised.proposed.json
```

Checks:

- All `event_id` values exist in seed
- No inferred/auto approval
- Approved items have `source_id`, `scholar_note`, valid ayah range
- No Quran text payload in patch
- Rejected mappings cannot become public-final
- Title changes are `proposed_title_ar` only (not seed mutation)

Also validate patch structure:

```bash
node scripts/validate_evidence_patch.mjs examples/evidence_patch.batch_01.revised.proposed.json
```

*(Revised patch uses `meta.status: revised_proposed` — evidence validator treats it like other non-example patches.)*

---

## Step 4 — Build content change batch (later)

**Not part of Phase 15.** After scholar-approved revised patch:

```bash
node scripts/build_content_change_batch.mjs examples/evidence_patch.batch_01.revised.proposed.json
node scripts/validate_content_change_batch.mjs examples/content_change_batch.batch_01.json
```

Then controlled apply per `docs/batch_review_to_promotion_workflow.md` and `docs/controlled_apply_workflow.md`.

---

## Step 5 — Controlled apply SQL (later)

Admin approves batch → engineer generates SQL → manual execution. UI never auto-applies.

---

## Why no automatic approval or apply

| Rule | Reason |
|------|--------|
| No compiler inference | Scholar decisions must be explicit |
| No seed mutation | Prevents accidental content promotion |
| No `approved` without `source_id` | Public final gate requires cited source |
| No `approved` with `needs_review` | `isFinalContent()` rejects needs_review |
| SQL-only apply | Human reviews generated SQL before execution |

---

## Blank template behaviour (current QA state)

With an unfilled review template:

- **10** mappings compiled
- **0** rejected
- **0** approved_proposed
- All items `compile_status: undecided` or `unchanged`
- Seed unchanged; public-final count **6**

---

## Related docs

- `docs/scholar_review_pack_batch_01.md`
- `docs/scholar_review_decision_table_batch_01.md`
- `docs/batch_review_to_promotion_workflow.md`
- `docs/arabic_text_hygiene_report.md`

---

## Disclaimer

هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.
