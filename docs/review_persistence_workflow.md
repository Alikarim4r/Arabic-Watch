# Review Persistence Workflow

This document explains how review actions flow through the system in local vs Supabase mode.

## Principles

1. **Audit first** — actions are logged before any content promotion.
2. **No auto-approval** — `approve` actions do not automatically change public-final visibility in Phase 8.
3. **Evidence governance intact** — `isFinalContent()` still requires approved status, valid sources, and precise evidence on events.
4. **Local demo safe** — default local mode requires no credentials.

## Local mode (default)

```
Reviewer clicks action in Admin Review
        ↓
saveMockOverride() — session UI override only (demo)
        ↓
repo.submitReviewAction() — session audit array
        ↓
Review History panel — session entries only
```

Evidence Curation:

```
Draft → session storage → Export JSON file
```

No remote persistence. Seed JSON on disk is never modified.

## Supabase mode

```
Authenticated reviewer/admin
        ↓
repo.submitReviewAction()
        ↓
INSERT review_actions (payload jsonb, statuses, note)
        ↓
Review History panel loads from review_actions
```

Evidence patch:

```
Validate patch → repo.submitEvidencePatch()
        ↓
INSERT evidence_patch_submissions (status: submitted)
        ↓
Admin reviews → reviewEvidencePatchSubmission(approved|rejected)
        ↓
Manual/controlled apply to content tables (future phase)
```

## review_actions payload

Each row stores:

- `record_type`, `record_id`
- `action` — `approve`, `needs_source`, `reject`, `request_revision`, `add_evidence`, `update_evidence`
- `previous_status`, `new_status`
- optional evidence fields
- `reviewer_note`
- full `payload` jsonb for proposed change

## Why content is not automatically approved

Public users see content through `isFinalContent()` which reads **seed JSON fields** (`review_status`, `evidence_status`, etc.). Phase 8 persists **intent to review** separately so that:

- Auditors can reconstruct who proposed what
- Accidental clicks do not publish content
- A future promotion job can apply approved changes deliberately

The 48 `needs_precise_mapping` events remain blocked from public-final regardless of review actions until evidence is curated and content rows are updated through controlled processes.

## Review Action History panel

Admin Review detail view shows chronological actions for the selected record:

- action type
- previous → new status
- reviewer note
- timestamp
- local session badge when applicable

## Related docs

- `docs/supabase_rls_policy.md`
- `docs/auth_and_roles.md`
- `docs/admin_review_workflow.md`
- `docs/evidence_curation_workflow.md`
