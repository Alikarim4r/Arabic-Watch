# Reviewer Management Hardening

Why reviewer role changes must **not** happen from normal client code, and how to implement them safely.

## Problem

The reviewer dashboard includes an **إدارة المراجعين** placeholder. Allowing role changes directly from browser JavaScript would enable:

- Self-escalation to `admin`
- Unauthorized deactivation of other reviewers
- Silent privilege changes without audit trail

## Principle: client is never trusted for roles

| Operation | Allowed in UI today | Production path |
|-----------|--------------------|-----------------|
| Read own profile | Yes | `reviewer_profiles` SELECT (RLS) |
| Read reviewer directory | Admin / limited reviewer | RLS + views |
| Change any role | **No** (disabled buttons) | Admin backend only |
| Deactivate reviewer | **No** | Admin backend only |

Migration `003_reviewer_role_hardening.sql` adds:

- `reviewer_role_audit` table
- Trigger blocking self role escalation
- RLS: only admin INSERT/UPDATE on `reviewer_profiles`
- Stricter `review_actions` insert (authenticated reviewer + `reviewer_user_id = auth.uid()`)

## Recommended production implementation

### Option A: Supabase Edge Function (preferred)

Admin-only HTTPS endpoint:

```
POST /admin/reviewer-role
Authorization: Bearer <admin session>
Body: { user_id, role, is_active, reason }
```

Function runs with **service role** server-side:

1. Verify caller is active admin (query `reviewer_profiles`)
2. Validate target user exists
3. UPDATE `reviewer_profiles`
4. INSERT `reviewer_role_audit`
5. Return sanitized response

Never expose service role key to the browser.

### Option B: Secure RPC with SECURITY DEFINER

```sql
create or replace function public.admin_set_reviewer_role(...)
returns void
language plpgsql
security definer
as $$
begin
  if not public.is_active_admin() then
    raise exception 'admin only';
  end if;
  -- update + audit
end;
$$;
```

Grant `EXECUTE` only to `authenticated`. Function must validate admin on every call.

## RLS requirements

- **SELECT own row:** `auth.uid() = user_id`
- **SELECT directory:** active reviewers/admins only; limit columns if needed
- **INSERT/UPDATE profiles:** `is_active_admin()` only
- **No INSERT** for `auth.uid() = user_id` (prevent self-registration as admin)
- **Audit table:** admin SELECT only; no client INSERT

## Audit logging

Every role change should record:

- `target_user_id`
- `previous_role` / `new_role`
- `previous_is_active` / `new_is_active`
- `changed_by` (admin user id)
- `change_reason` (required text)
- `created_at`

Table: `reviewer_role_audit` (migration 003).

## Avoid self-escalation

Defense in depth:

1. RLS denies non-admin writes
2. Trigger raises if `auth.uid() = user_id` and role/active changes
3. No client-side `setRole()` API
4. Edge Function re-checks admin server-side

## Safe deactivation

Before deactivating a reviewer:

1. Confirm no in-flight batches assigned (operational process)
2. Set `is_active = false` — user becomes `viewer` effective immediately
3. Log reason in `reviewer_role_audit`
4. Do not delete `auth.users` unless required (preserves audit FK)

Reactivation: admin sets `is_active = true` with documented reason.

## UI placeholder policy

Current UI shows disabled **activate / deactivate / change role** buttons with tooltip «يتطلب RLS». When backend is ready:

- Wire buttons to Edge Function only
- Require admin confirmation + reason note
- Never update local state without server confirmation

## Related

- [Staging setup](./staging_supabase_setup.md)
- [Production change control](./production_change_control.md)
