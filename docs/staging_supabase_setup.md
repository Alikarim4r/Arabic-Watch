# Staging Supabase Setup

Guide to preparing a **staging** Supabase project for Quran Story Universe reviewer/admin workflows.

## Prerequisites

- Supabase account and a **staging** project (separate from production)
- Supabase CLI optional; SQL Editor works fine
- Never commit real credentials — use `.env.staging` locally (gitignored)

## 1. Create a Supabase project

1. Create a new project in [Supabase Dashboard](https://supabase.com/dashboard).
2. Note **Project URL** and **anon public key** (Settings → API).
3. Label the project clearly as **staging**.

## 2. Run migrations (order matters)

In SQL Editor, run in order:

1. `supabase/migrations/001_content_review_actions.sql`
2. `supabase/migrations/002_core_content_tables.sql`
3. `supabase/migrations/003_reviewer_role_hardening.sql`

Or with CLI:

```bash
supabase db push
```

## 3. Generate and load seed SQL

```bash
node scripts/export_seed_to_supabase_sql.mjs
```

Output: `supabase/seed/001_seed_content.sql`

Run that file in Supabase SQL Editor. This loads surahs, nodes, events, themes, etc. from local JSON — **not** full Quran text.

## 4. Create test auth users

In Supabase Dashboard → Authentication → Users:

| User | Purpose |
|------|---------|
| `reviewer-staging@example.com` | Reviewer role testing |
| `admin-staging@example.com` | Admin role testing |
| `viewer-staging@example.com` | Access denied testing |

Use strong passwords; do not commit them.

## 5. Create reviewer_profiles rows

After users exist, insert profiles (replace UUIDs with real `auth.users.id`):

```sql
insert into public.reviewer_profiles (user_id, display_name, role, is_active)
values
  ('REVIEWER_USER_UUID', 'Staging Reviewer', 'reviewer', true),
  ('ADMIN_USER_UUID', 'Staging Admin', 'admin', true),
  ('VIEWER_USER_UUID', 'Staging Viewer', 'viewer', true);
```

**First admin bootstrap:** use SQL Editor as postgres/service role (Dashboard SQL Editor bypasses RLS) for the initial admin row only.

## 6. Assign roles

| role | Access |
|------|--------|
| `viewer` | Public app only — **denied** Admin Review |
| `reviewer` | Review Queue, Evidence Curation, batches (submit) |
| `admin` | Above + approve batches + reviewer management placeholder |

Deactivate a reviewer:

```sql
update public.reviewer_profiles set is_active = false where user_id = 'UUID';
```

## 7. Configure local environment

Copy template:

```bash
cp .env.staging.example .env.staging
```

Fill (never commit):

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_ENV=staging
```

For static `serve src`, inject via `window.__QSU_ENV__` or build step.

## 8. Verify reviewer dashboard

1. Open app → `#admin-review`
2. Badge should show **Supabase Staging**
3. Sign in as reviewer → Dashboard, Review Queue, Curation load
4. Sign in as viewer → access denied view
5. Sign in as admin → Profile shows **إدارة المراجعين** (read-only placeholder)

## 9. Verify access denied for non-reviewers

- Viewer signed in: sees access denied + sign-in panel
- Anonymous: access denied, no reviewer tools
- Inactive reviewer: sign-in rejected with inactive message

## 10. Verify RLS manually

As **anonymous** (no session) in SQL or via smoke script:

```bash
npm run qa:staging
```

Manual checks:

- `select * from story_events` returns only public-final rows
- `insert into review_actions (...)` **fails**
- `insert into reviewer_profiles (...)` **fails** for non-admin

As **reviewer** session:

- `insert into review_actions` with `reviewer_user_id = auth.uid()` **succeeds**
- `update reviewer_profiles set role = 'admin'` **fails** (self-escalation blocked)

See `docs/staging_verification_checklist.md` for full checklist.

## Related docs

- [Staging verification checklist](./staging_verification_checklist.md)
- [Reviewer management hardening](./reviewer_management_hardening.md)
- [Auth and roles](./auth_and_roles.md)
