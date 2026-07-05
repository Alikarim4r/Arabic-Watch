# Supabase Setup Steps

Follow these steps to enable Supabase auth and review persistence for Quran Story Universe.

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Note the **Project URL** and **anon public key** (Settings → API).

## 2. Run migrations

Apply the SQL migration:

```bash
# Option A: Supabase CLI
supabase db push

# Option B: SQL Editor
# Paste contents of supabase/migrations/001_content_review_actions.sql
```

This creates:

- `reviewer_profiles`
- `review_actions`
- `evidence_patch_submissions`
- RLS policies and helper functions
- Review queue views

See `docs/supabase_rls_policy.md` for policy details.

## 3. Configure environment

Copy `.env.example` → `.env` (for Vite builds) or inject at runtime:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For static `serve src` demo, inject before bootstrap:

```html
<script>
  window.__QSU_ENV__ = {
    VITE_DATA_MODE: 'supabase',
    VITE_SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'your-anon-key'
  };
</script>
```

**Missing credentials:** app falls back to local JSON with a warning — no crash.

## 4. Create Auth users

1. Supabase Dashboard → Authentication → Users → Add user.
2. Confirm email if required by project settings.

## 5. Assign reviewer/admin profiles

In SQL Editor (as service role / postgres):

```sql
insert into public.reviewer_profiles (user_id, display_name, role, is_active)
values ('AUTH_USER_UUID', 'Reviewer Name', 'reviewer', true);
```

For admin:

```sql
insert into public.reviewer_profiles (user_id, display_name, role, is_active)
values ('AUTH_USER_UUID', 'Admin Name', 'admin', true);
```

Only admins should manage this table (enforced by RLS).

## 6. Verify the app

```bash
npm run qa          # no live Supabase required
npm run dev         # local default
```

With Supabase env configured:

1. Sign in as reviewer (via Supabase Auth integration).
2. Open `#admin-review` — access granted for reviewer/admin only.
3. Submit a review action — row appears in `review_actions`.
4. Export/submit evidence patch — row in `evidence_patch_submissions`.

Public app (`isFinalContent`) behavior is unchanged until content tables are migrated.

## 7. What remains before production

| Item | Status |
|------|--------|
| Content tables in Supabase | Not migrated — seed JSON still source of truth |
| Review action → content promotion | Manual / future controlled job |
| Full Quran text import | Optional licensed file import |
| 48 events needing precise mapping | Still require curation |
| Sign-in UI | Placeholder — wire auth form to `authService.signIn()` |
| Email/OAuth providers | Configure in Supabase dashboard |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin shows access denied | Add `reviewer_profiles` row for signed-in user |
| Actions not persisting | Check RLS + authenticated session |
| App uses local JSON despite supabase mode | Verify URL/key env vars |
| QA fails | QA runs without live Supabase — check local fallback tests |

See also: `docs/auth_and_roles.md`, `docs/review_persistence_workflow.md`.
