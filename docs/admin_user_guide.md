# Admin User Guide

Guide for administrators managing reviewers, batches, and production change control.

## Roles

| Role | Capabilities |
|------|----------------|
| `viewer` | Public app only |
| `reviewer` | Review queue, evidence curation, submit batches/patches |
| `admin` | Approve/reject batches, mark applied, view reviewer management placeholder |

Role changes in production require Supabase `reviewer_profiles` + RLS — **not** client-side escalation.

## Admin workflows

### Review actions

Admins use the same Review Queue with confirmation dialogs. Approve actions require `reviewer_note` and do **not** promote content to public-final automatically.

### Evidence patches

Reviewers submit patches; admins may review submissions in Supabase (`evidence_patch_submissions`). Local mode keeps session-only patches.

### Content batches

Lifecycle: `draft` → `submitted` → `approved` → SQL generated → `applied` / `rejected`

1. Reviewer submits batch (validation must pass)
2. Admin approves with required note + confirmation
3. Engineer generates SQL: `scripts/apply_content_change_batch.mjs`
4. Engineer verifies: `scripts/verify_applied_batch.mjs`
5. SQL applied manually in Supabase
6. Admin marks batch `applied` (audit only)

See `docs/controlled_apply_workflow.md`.

### Reviewer management (placeholder)

**إدارة المراجعين** in Profile (admin only):

- Lists reviewers, roles, active status, last activity
- activate / deactivate / change role buttons are **disabled** until backend RLS supports safe updates

## Local demo vs production

| Feature | Local | Supabase |
|---------|-------|----------|
| Sign-in | Mock roles | Email/password |
| Review actions | Session | `review_actions` table |
| Batches | Session | `content_change_batches` |
| Apply to content | Never via UI | Manual SQL only |

## Production blockers

- Full Quran text import (licensed file required)
- 48 events still `needs_precise_mapping`
- Controlled apply requires engineer SQL review
- Reviewer role management requires admin backend/RLS
