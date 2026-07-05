# Admin Review Workflow

**Screen:** `#admin-review` (nav: «المراجعة»)  
**Module:** `src/features/admin/`

---

## Purpose

Give scholars/reviewers a single place to inspect content governance status before public release — without treating draft material as verified tafsir.

---

## Layout

| Panel | Function |
|-------|----------|
| Sidebar | Stats by `review_status`, data mode, disclaimer, filters |
| Queue | Filtered list of records (one click to select) |
| Detail | Full record view + ayah refs + sources + mock actions |

---

## Record types

| Type | Source table (future) | Fields shown |
|------|----------------------|--------------|
| `node` | `story_nodes` | name, summary, node_type, review/source status |
| `event` | `story_events` | title, summary, linked ayahs, sources |
| `theme` | `themes` | name, description, review status |

---

## Filters

- Record type: node / event / theme
- `review_status`: pending, needs_source, approved
- `source_status`: cited, pending, needs_source, none
- Source ID: from `tafsir_sources`
- Node type: prophet, person, place, theme, surah
- «غير نهائي فقط» — hides records that pass `isFinalContent()` in public mode
- Text search on title / id

Default queue filter: **pending** — surfaces work queue first.

---

## Review actions (mock → Supabase)

| Button | Maps to | Future Supabase effect |
|--------|---------|------------------------|
| اعتماد | `approved` | Update row + log in `content_reviews` |
| يحتاج مصدر | `needs_source` | Flag for sourcing; block final display |
| رفض | `pending` | Revert / keep draft |
| طلب تعديل | `pending` | Log note; notify editor |

**Current behavior:** actions save to in-memory `mockReviewOverrides` (session only). Toast confirms mock save. Repository `submitReviewAction()` is structured for later persistence.

---

## Content safety rules (enforced)

1. Arabic disclaimer always visible on admin screen.
2. Review badges on every queue item.
3. Detail panel shows «غير نهائي في الوضع العام» when `isFinalContent()` is false.
4. Mock approve does **not** write to `seed_content.json`.
5. No tafsir text invented in admin UI — only existing summaries and ayah reference keys.

---

## Reviewer workflow (recommended)

1. Open `#admin-review`.
2. Filter `pending` + `needs_source`.
3. Select one record from queue.
4. Verify ayah references against licensed Quran text (external).
5. Verify sources exist in `tafsir_sources` and are approved.
6. Add reviewer note.
7. Click appropriate action (mock until Supabase wired).
8. Repeat until pending count is acceptable for release.

---

## Warning thresholds

If **>50%** of records are pending/needs_source, admin sidebar shows a yellow warning — public mode still displays drafts with badges, not as final tafsir.

---

## Files

| File | Role |
|------|------|
| `adminReview.js` | UI render + event binding |
| `reviewQueue.js` | Build/filter/stats |
| `reviewActions.js` | Mock actions + Supabase-ready payload |

---

## Next steps for production

1. Authenticate reviewers via Supabase Auth.
2. Persist `submitReviewAction()` to database.
3. Remove session-only mock overrides.
4. Optional: email/Slack on `request_revision`.
