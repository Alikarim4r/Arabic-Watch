# Supabase Row Level Security (RLS) Policies

This document describes the RLS model for Phase 8 review persistence tables. Content tables (story nodes/events) remain in local JSON until a future migration phase.

## Tables

| Table | Purpose |
|-------|---------|
| `reviewer_profiles` | Maps `auth.users.id` → role (`viewer`, `reviewer`, `admin`) |
| `review_actions` | Append-only audit log of review decisions |
| `evidence_patch_submissions` | Submitted evidence mapping patches awaiting admin decision |

## Views

| View | Purpose |
|------|---------|
| `content_review_queue_view` | Chronological review actions with reviewer display names |
| `content_review_latest_action_view` | Latest action per `(record_type, record_id)` |

## Helper functions

- `public.is_active_reviewer()` — true when authenticated user has active `reviewer` or `admin` role
- `public.is_active_admin()` — true when authenticated user has active `admin` role

## Policies

### reviewer_profiles

| Operation | Who | Rule |
|-----------|-----|------|
| SELECT | Self or admin | `auth.uid() = user_id OR is_active_admin()` |
| INSERT | Admin only | `is_active_admin()` |
| UPDATE | Admin only | `is_active_admin()` |
| DELETE | Admin only | `is_active_admin()` |

Public/anonymous users cannot read other users' profiles unless they are admin.

### review_actions

| Operation | Who | Rule |
|-----------|-----|------|
| SELECT | Reviewer/admin | `is_active_reviewer() OR is_active_admin()` |
| INSERT | Reviewer/admin | `is_active_reviewer() OR is_active_admin()` |
| UPDATE | **Denied** | `false` — audit rows are immutable |
| DELETE | **Denied** | `false` |

**Public users cannot write review actions.** Inserts do not mutate approved content tables in the app layer.

### evidence_patch_submissions

| Operation | Who | Rule |
|-----------|-----|------|
| SELECT | Reviewer/admin or submitter | reviewer/admin OR `submitted_by = auth.uid()` |
| INSERT | Reviewer/admin | Must set `submitted_by = auth.uid()` |
| UPDATE | Admin only | Approve/reject workflow |
| DELETE | **Denied** | `false` |

Reviewers may submit patches (`status: submitted`). Only admins may transition to `approved` / `rejected`. **`applied` status requires a controlled migration job — not automatic in UI.**

## Local mode independence

When `VITE_DATA_MODE=local` (default), the app never connects to these tables. Session-only mock actions are used for demo. RLS applies only when Supabase credentials are configured and the runtime mode resolves to `supabase`.

## Security notes

1. Review actions record intent — they do **not** auto-approve public content.
2. The app's `isFinalContent()` gate still reads seed JSON review fields until content tables are migrated.
3. Assign `admin` role sparingly — only admins manage profiles and patch approval.
4. Enable Supabase Auth email confirmation in production.

See also: `docs/auth_and_roles.md`, `docs/review_persistence_workflow.md`.
