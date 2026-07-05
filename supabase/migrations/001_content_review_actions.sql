-- Quran Story Universe — review persistence schema (Phase 8)
-- Run via Supabase SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists public.reviewer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('viewer', 'reviewer', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.review_actions (
  id uuid primary key default gen_random_uuid(),
  record_type text not null,
  record_id text not null,
  action text not null check (
    action in (
      'approve',
      'needs_source',
      'reject',
      'request_revision',
      'add_evidence',
      'update_evidence'
    )
  ),
  previous_status text,
  new_status text,
  evidence_status text,
  evidence_confidence text,
  source_id text,
  reviewer_note text,
  payload jsonb not null default '{}'::jsonb,
  reviewer_user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists review_actions_record_idx
  on public.review_actions (record_type, record_id, created_at desc);

create table if not exists public.evidence_patch_submissions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'approved', 'rejected', 'applied')
  ),
  patch jsonb not null,
  submitted_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists evidence_patch_submissions_status_idx
  on public.evidence_patch_submissions (status, created_at desc);

create or replace view public.content_review_queue_view as
select
  ra.id,
  ra.record_type,
  ra.record_id,
  ra.action,
  ra.previous_status,
  ra.new_status,
  ra.evidence_status,
  ra.evidence_confidence,
  ra.reviewer_note,
  ra.reviewer_user_id,
  ra.created_at,
  rp.display_name as reviewer_display_name,
  rp.role as reviewer_role
from public.review_actions ra
left join public.reviewer_profiles rp on rp.user_id = ra.reviewer_user_id
order by ra.created_at desc;

create or replace view public.content_review_latest_action_view as
select distinct on (record_type, record_id)
  ra.*
from public.review_actions ra
order by record_type, record_id, created_at desc;

alter table public.reviewer_profiles enable row level security;
alter table public.review_actions enable row level security;
alter table public.evidence_patch_submissions enable row level security;

-- Helper: active reviewer/admin
create or replace function public.is_active_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reviewer_profiles rp
    where rp.user_id = auth.uid()
      and rp.is_active = true
      and rp.role in ('reviewer', 'admin')
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reviewer_profiles rp
    where rp.user_id = auth.uid()
      and rp.is_active = true
      and rp.role = 'admin'
  );
$$;

-- reviewer_profiles policies
create policy reviewer_profiles_select_own
  on public.reviewer_profiles for select
  using (auth.uid() = user_id or public.is_active_admin());

create policy reviewer_profiles_admin_insert
  on public.reviewer_profiles for insert
  with check (public.is_active_admin());

create policy reviewer_profiles_admin_update
  on public.reviewer_profiles for update
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy reviewer_profiles_admin_delete
  on public.reviewer_profiles for delete
  using (public.is_active_admin());

-- review_actions policies
create policy review_actions_select_reviewer
  on public.review_actions for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy review_actions_insert_reviewer
  on public.review_actions for insert
  with check (public.is_active_reviewer() or public.is_active_admin());

-- Public users cannot update/delete audit rows
create policy review_actions_no_public_update
  on public.review_actions for update
  using (false);

create policy review_actions_no_public_delete
  on public.review_actions for delete
  using (false);

-- evidence_patch_submissions policies
create policy evidence_patch_select_reviewer
  on public.evidence_patch_submissions for select
  using (
    public.is_active_reviewer()
    or public.is_active_admin()
    or submitted_by = auth.uid()
  );

create policy evidence_patch_insert_reviewer
  on public.evidence_patch_submissions for insert
  with check (
    (public.is_active_reviewer() or public.is_active_admin())
    and submitted_by = auth.uid()
  );

create policy evidence_patch_update_admin
  on public.evidence_patch_submissions for update
  using (public.is_active_admin())
  with check (public.is_active_admin());

create policy evidence_patch_no_public_delete
  on public.evidence_patch_submissions for delete
  using (false);

grant select on public.content_review_queue_view to authenticated;
grant select on public.content_review_latest_action_view to authenticated;
