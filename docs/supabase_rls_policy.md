# Supabase Row Level Security (RLS) Policies

This document describes the RLS model for review persistence (Phase 8) and core content tables (Phase 9).

## Phase 8 — Review persistence

### Tables

| Table | Purpose |
|-------|---------|
| `reviewer_profiles` | Maps `auth.users.id` → role (`viewer`, `reviewer`, `admin`) |
| `review_actions` | Append-only audit log of review decisions |
| `evidence_patch_submissions` | Submitted evidence mapping patches awaiting admin decision |

### Views

| View | Purpose |
|------|---------|
| `content_review_queue_view` | Chronological review actions with reviewer display names |
| `content_review_latest_action_view` | Latest action per `(record_type, record_id)` |

## Phase 9 — Core content + promotion batches

### Content tables

| Table | Public read | Reviewer read | Public write |
|-------|-------------|---------------|--------------|
| `story_nodes` | `row_is_public_final(...)` | All rows | Denied |
| `story_events` | `row_is_public_final(..., is_event=true)` | All rows | Denied |
| `themes` | `row_is_public_final(...)` | All rows | Denied |
| `event_ayahs` | Parent event is public-final | All rows | Denied |
| `node_links` | Source node is public-final | All rows | Denied |
| `surahs` | All rows | All rows | Denied |
| `tafsir_sources` | `is_approved = true` | All rows | Denied |
| `content_change_batches` | Own/submitted rows for reviewer; admins see all | Reviewer+ | Insert/update via policies |

### content_change_batches policies

| Operation | Who | Rule |
|-----------|-----|------|
| SELECT | Reviewer/admin or creator | `is_active_reviewer()` OR `created_by = auth.uid()` |
| INSERT | Reviewer/admin | `created_by = auth.uid()`, status `draft`/`submitted` |
| UPDATE | Reviewer (own draft/submitted) or admin | Admin required for `approved`/`rejected`/`applied` |
| DELETE | **Denied** | Immutable audit trail |

**No automatic apply:** marking `applied` updates batch status only — it does not mutate `story_*` tables in the UI.

### content_review_queue_content_view

Reviewer/admin view of non-final nodes, events, and themes for queue tooling.

## Helper functions

- `public.is_active_reviewer()` — active `reviewer` or `admin`
- `public.is_active_admin()` — active `admin`
- `public.row_is_public_final(...)` — mirrors app `isFinalContent()` rules

## Phase 8 policies (unchanged summary)

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
