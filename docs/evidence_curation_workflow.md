# Evidence Curation Workflow

**Phase:** 6 — Evidence Curation Workbench  
**Admin screen:** `#admin-review` → tab **Evidence Curation**

---

## Overview

Reviewers map each `needs_precise_mapping` event to exact Quran ayah ranges **manually**. The workbench does **not** auto-approve or write to production JSON. It produces validated **JSON patches** for later merge.

Arabic disclaimer remains visible on all admin screens:

> هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.

---

## Step 1 — Open the curation queue

1. Navigate to `#admin-review`.
2. Click **Evidence Curation**.
3. Review the stats bar:
   - Total events (59)
   - `precise_evidence` / `needs_precise_mapping`
   - `needs_review` confidence count
   - Safe vs blocked from public final display
4. Open queue: **«الأحداث التي تحتاج ربطًا دقيقًا بالآيات»** (48 events).

---

## Step 2 — Review one event

For each queued event, verify:

| Field | Action |
|-------|--------|
| `event_id` / title | Confirm correct story stage |
| Related node | Prophet/person context |
| `review_status` / `source_status` | Do not assume approved |
| Summary + themes | Context only — not tafsir |
| Existing ayahs | Should be empty for queue items |
| Warning | «لا نطاق آيات» = blocked from final display |

Read **«ضوابط ربط الحدث بالآيات»** before filling the form.

---

## Step 3 — Propose ayah mapping (form)

Fill the reviewer form:

| Field | Required | Notes |
|-------|----------|-------|
| `surah_id` | Yes | 1–114 |
| `ayah_from` | Yes | ≥ 1 |
| `ayah_to` | Yes | ≥ ayah_from |
| `relation_type` | Yes | main / supporting / parallel / contrast |
| `evidence_note_ar` | Recommended | Educational note — not invented tafsir |
| `evidence_confidence` | Yes | See guidance panel |
| `source_id` | If approving | e.g. `quran_text` |
| `reviewer_note` | Optional | Internal review note |
| `proposed_review_status` | Yes | Default: `pending` |

**Validation blocks:**

- `approved` without `source_id`
- `approved` with `evidence_confidence = needs_review`
- Invalid ayah range
- Empty range for `quran_explicit`

Click **«حفظ مسودة الجلسة»** — saves to browser session only.

---

## Step 4 — Export JSON patch

1. Repeat for additional events (optional).
2. Click **«تصدير JSON Patch»**.
3. Download file: `evidence_patch_<timestamp>.json`

Patch structure:

```json
{
  "meta": {
    "version": "1.0.0",
    "status": "proposed",
    "description_ar": "...",
    "exported_at": "..."
  },
  "mappings": [
    {
      "event_id": "...",
      "surah_id": 2,
      "ayah_from": 30,
      "ayah_to": 37,
      "relation_type": "main",
      "evidence_note_ar": "...",
      "evidence_confidence": "quran_explicit",
      "source_id": "quran_text",
      "reviewer_note": "...",
      "proposed_review_status": "pending"
    }
  ]
}
```

Validate before merge:

```bash
node scripts/validate_evidence_patch.mjs path/to/evidence_patch.json
```

---

## Step 5 — Apply patch to production data

1. Scholarly committee reviews exported patch.
2. Convert `proposed_review_status` → `review_status` and set `source_status` (`cited` / `pending` / `needs_source`).
3. Append approved rows to `src/data/precise_event_evidence.json` under `mappings`.
4. Run:

```bash
python3 scripts/apply_precise_evidence.py
npm run qa
```

5. Commit seed + precise file together.

**Never** reintroduce round-robin or automatic ayah assignment.

---

## Keeping non-reviewed content blocked

Public final display requires **all** of:

- `review_status = approved`
- Valid `source_status` (not `none` / `needs_source`)
- `evidence_status = precise_evidence`
- `evidence_confidence ≠ needs_review`

Events in the curation queue remain `needs_precise_mapping` until merged via `precise_event_evidence.json`.

---

## Files

| File | Purpose |
|------|---------|
| `src/features/admin/evidenceCurationPanel.js` | UI tab |
| `src/features/admin/evidenceValidation.js` | Shared validation |
| `examples/evidence_patch.sample.json` | Example only (status: example) |
| `scripts/validate_evidence_patch.mjs` | CLI validator |

---

## Completing the remaining 48 mappings

Work **one event at a time** by prophet/story arc:

1. Adam (4) → Nuh extras → Ibrahim gaps → …
2. Export patches in batches (e.g. 5–10 events).
3. Validate each batch.
4. Scholar review → merge to `precise_event_evidence.json`.
5. Re-run `apply_precise_evidence.py` and QA.

Do not bulk-approve the 48 events without individual ayah verification.
