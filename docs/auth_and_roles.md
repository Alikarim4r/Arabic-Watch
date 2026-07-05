# Auth and Roles

Quran Story Universe supports two runtime modes for authentication and review permissions.

## Modes

| Mode | Env | Auth source | Admin Review access |
|------|-----|-------------|---------------------|
| **Local (default)** | `VITE_DATA_MODE=local` | Mock / anonymous viewer | Demo panel with banner — not production security |
| **Supabase** | `VITE_DATA_MODE=supabase` + URL/key | Supabase Auth + `reviewer_profiles` | Requires `reviewer` or `admin` role |

If `VITE_DATA_MODE=supabase` but URL/key are missing, the app **falls back to local mode** with a console warning — it never crashes.

## Roles

| Role | Capabilities |
|------|--------------|
| `viewer` | Read public app content only |
| `reviewer` | Access Admin Review, insert `review_actions`, submit evidence patches |
| `admin` | Reviewer capabilities + manage `reviewer_profiles`, approve/reject patch submissions |

Roles are stored in `reviewer_profiles.role` and linked to `auth.users.id`.

## Auth service (`src/lib/authService.js`)

| Method | Description |
|--------|-------------|
| `getCurrentUser()` | Supabase user or null |
| `getReviewerRole()` | `viewer` / `reviewer` / `admin` |
| `isReviewer()` | reviewer or admin |
| `isAdmin()` | admin only |
| `canAccessAdminReview()` | always true in local demo; reviewer+ in Supabase |
| `signIn(email, password)` | Supabase password auth (Supabase mode only) |
| `signOut()` | Clears session |

## Local mock (development only)

In local mode, the default role is **`viewer`**, but Admin Review remains visible as a **demo** with banner:

> وضع تجريبي محلي — لا توجد صلاحيات إنتاجية

Optional dev mock role via browser console:

```javascript
import { setLocalMockRole } from './lib/authService.js';
setLocalMockRole('reviewer'); // or 'admin' — clearly labeled local mock
```

This does **not** represent production security.

## Supabase sign-in

When configured for Supabase mode:

1. Create users in Supabase Auth dashboard.
2. Insert matching row in `reviewer_profiles` with desired role.
3. User signs in via future UI hook or Supabase dashboard token — app reads session via `@supabase/supabase-js`.

## What auth does NOT do

- Does not auto-approve content
- Does not bypass `isFinalContent()` public gate
- Does not mutate seed JSON in local mode
- Does not grant reviewers ability to edit Quranic text import files

See `docs/supabase_setup_steps.md` for project setup.
