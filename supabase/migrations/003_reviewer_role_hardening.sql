-- Quran Story Universe — reviewer role hardening (Phase 12)
-- Run after 001_content_review_actions.sql and 002_core_content_tables.sql

-- ---------------------------------------------------------------------------
-- reviewer_profiles hardening
-- ---------------------------------------------------------------------------

alter table public.reviewer_profiles
  add column if not exists updated_at timestamptz not null default now();

create index if not exists reviewer_profiles_user_id_idx
  on public.reviewer_profiles (user_id);

create index if not exists reviewer_profiles_role_idx
  on public.reviewer_profiles (role);

create index if not exists reviewer_profiles_active_idx
  on public.reviewer_profiles (is_active)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- Role change audit log (admin actions only — no client insert)
-- ---------------------------------------------------------------------------

create table if not exists public.reviewer_role_audit (
  id uuid primary key default gen_random_uuid(),
  reviewer_profile_id uuid references public.reviewer_profiles(id) on delete set null,
  target_user_id uuid not null,
  previous_role text,
  new_role text,
  previous_is_active boolean,
  new_is_active boolean,
  changed_by uuid references auth.users(id),
  change_reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reviewer_role_audit_target_idx
  on public.reviewer_role_audit (target_user_id, created_at desc);

alter table public.reviewer_role_audit enable row level security;

drop policy if exists reviewer_role_audit_admin_select on public.reviewer_role_audit;
create policy reviewer_role_audit_admin_select
  on public.reviewer_role_audit for select
  using (public.is_active_admin());

drop policy if exists reviewer_role_audit_no_client_write on public.reviewer_role_audit;
create policy reviewer_role_audit_no_client_write
  on public.reviewer_role_audit for insert
  with check (false);

drop policy if exists reviewer_role_audit_no_client_update on public.reviewer_role_audit;
create policy reviewer_role_audit_no_client_update
  on public.reviewer_role_audit for update
  using (false);

drop policy if exists reviewer_role_audit_no_client_delete on public.reviewer_role_audit;
create policy reviewer_role_audit_no_client_delete
  on public.reviewer_role_audit for delete
  using (false);

-- ---------------------------------------------------------------------------
-- Audit trigger + block self role escalation on profile updates
-- ---------------------------------------------------------------------------

create or replace function public.audit_reviewer_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if auth.uid() = old.user_id
       and (new.role is distinct from old.role or new.is_active is distinct from old.is_active) then
      raise exception 'Self role escalation is forbidden';
    end if;

    if new.role is distinct from old.role
       or new.is_active is distinct from old.is_active then
      insert into public.reviewer_role_audit (
        reviewer_profile_id,
        target_user_id,
        previous_role,
        new_role,
        previous_is_active,
        new_is_active,
        changed_by,
        change_reason,
        payload
      ) values (
        old.id,
        old.user_id,
        old.role,
        new.role,
        old.is_active,
        new.is_active,
        auth.uid(),
        'profile_update',
        jsonb_build_object('operation', 'update')
      );
    end if;

    new.updated_at = now();
  elsif tg_op = 'INSERT' then
    insert into public.reviewer_role_audit (
      reviewer_profile_id,
      target_user_id,
      previous_role,
      new_role,
      previous_is_active,
      new_is_active,
      changed_by,
      change_reason,
      payload
    ) values (
      new.id,
      new.user_id,
      null,
      new.role,
      null,
      new.is_active,
      auth.uid(),
      'profile_created',
      jsonb_build_object('operation', 'insert')
    );
  end if;

  return new;
end;
$$;

drop trigger if exists reviewer_profiles_audit_trigger on public.reviewer_profiles;
create trigger reviewer_profiles_audit_trigger
  before insert or update on public.reviewer_profiles
  for each row execute function public.audit_reviewer_profile_change();

-- ---------------------------------------------------------------------------
-- RLS refinements — read own profile; admin manages; no self insert
-- ---------------------------------------------------------------------------

drop policy if exists reviewer_profiles_select_own on public.reviewer_profiles;
create policy reviewer_profiles_select_own
  on public.reviewer_profiles for select
  using (auth.uid() = user_id or public.is_active_admin());

drop policy if exists reviewer_profiles_select_reviewer_directory on public.reviewer_profiles;
create policy reviewer_profiles_select_reviewer_directory
  on public.reviewer_profiles for select
  using (
    public.is_active_reviewer()
    and auth.uid() is not null
  );

drop policy if exists reviewer_profiles_admin_insert on public.reviewer_profiles;
create policy reviewer_profiles_admin_insert
  on public.reviewer_profiles for insert
  with check (
    public.is_active_admin()
    and auth.uid() is not null
    and auth.uid() <> user_id
  );

drop policy if exists reviewer_profiles_admin_update on public.reviewer_profiles;
create policy reviewer_profiles_admin_update
  on public.reviewer_profiles for update
  using (public.is_active_admin())
  with check (public.is_active_admin());

drop policy if exists reviewer_profiles_no_self_insert on public.reviewer_profiles;
drop policy if exists reviewer_profiles_no_self_update on public.reviewer_profiles;

-- Explicit deny: authenticated users cannot insert review_actions without reviewer role
drop policy if exists review_actions_insert_reviewer on public.review_actions;
create policy review_actions_insert_reviewer
  on public.review_actions for insert
  with check (
    auth.uid() is not null
    and (public.is_active_reviewer() or public.is_active_admin())
    and reviewer_user_id = auth.uid()
  );

grant select on public.reviewer_role_audit to authenticated;
