-- Quran Story Universe — core content tables (Phase 9)
-- Adapted from supabase/schema.sql with governance columns and promotion batches.

-- ---------------------------------------------------------------------------
-- Core reference tables
-- ---------------------------------------------------------------------------

create table if not exists public.surahs (
  id smallint primary key check (id between 1 and 114),
  name_ar text not null,
  name_en text,
  revelation_type text check (revelation_type in ('makkah', 'madinah')),
  ayah_count smallint not null,
  featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ayahs (
  id bigserial primary key,
  surah_id smallint not null references public.surahs(id) on delete cascade,
  ayah_number smallint not null,
  ayah_key text generated always as (surah_id::text || ':' || ayah_number::text) stored,
  text_uthmani text not null,
  text_simple text,
  juz smallint,
  page smallint,
  hizb numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (surah_id, ayah_number)
);

create table if not exists public.tafsir_sources (
  id text primary key,
  name_ar text not null,
  author_ar text,
  type text default 'tafsir',
  license_note text,
  source_url text,
  is_approved boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tafsir_entries (
  id bigserial primary key,
  source_id text not null references public.tafsir_sources(id),
  surah_id smallint not null,
  ayah_number smallint not null,
  summary_ar text not null,
  quote_ar text,
  editor_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  review_status text check (review_status in ('approved', 'pending', 'needs_source')) default 'pending',
  source_status text check (source_status in ('cited', 'pending', 'none', 'needs_source')) default 'pending',
  source_id text references public.tafsir_sources(id),
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, surah_id, ayah_number)
);

create table if not exists public.themes (
  id text primary key,
  name_ar text not null,
  description_ar text,
  review_status text check (review_status in ('approved', 'pending', 'needs_source')) default 'pending',
  source_status text check (source_status in ('cited', 'pending', 'none', 'needs_source')) default 'pending',
  evidence_status text check (evidence_status in ('precise_evidence', 'needs_precise_mapping')),
  evidence_confidence text check (
    evidence_confidence in ('quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review')
  ),
  source_id text references public.tafsir_sources(id),
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_nodes (
  id text primary key,
  node_type text not null check (
    node_type in ('prophet', 'person', 'people', 'place', 'theme', 'event_group', 'surah')
  ),
  name_ar text not null,
  name_en text,
  short_title_ar text,
  summary_ar text,
  caution_note text,
  is_sensitive boolean default false,
  review_status text check (review_status in ('approved', 'pending', 'needs_source')) default 'pending',
  source_status text check (source_status in ('cited', 'pending', 'none', 'needs_source')) default 'pending',
  evidence_status text check (evidence_status in ('precise_evidence', 'needs_precise_mapping')),
  evidence_confidence text check (
    evidence_confidence in ('quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review')
  ),
  source_id text references public.tafsir_sources(id),
  reviewer_note text,
  network_conclusion_ar text,
  network_conclusion_review_status text,
  lessons_ar jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_events (
  id text primary key,
  node_id text not null references public.story_nodes(id) on delete cascade,
  title_ar text not null,
  summary_ar text not null,
  event_order int not null,
  start_label_ar text,
  end_label_ar text,
  certainty_level text check (
    certainty_level in ('quran_explicit', 'tafsir_based', 'scholarly_inference')
  ) default 'quran_explicit',
  review_status text check (review_status in ('approved', 'pending', 'needs_source')) default 'pending',
  source_status text check (source_status in ('cited', 'pending', 'none', 'needs_source')) default 'pending',
  evidence_status text check (evidence_status in ('precise_evidence', 'needs_precise_mapping')) default 'needs_precise_mapping',
  evidence_confidence text check (
    evidence_confidence in ('quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review')
  ) default 'needs_review',
  source_id text references public.tafsir_sources(id),
  reviewer_note text,
  theme_ids jsonb default '[]'::jsonb,
  lessons_ar jsonb default '[]'::jsonb,
  sources jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_ayahs (
  id bigserial primary key,
  event_id text not null references public.story_events(id) on delete cascade,
  surah_id smallint not null,
  ayah_from smallint not null,
  ayah_to smallint not null,
  ayah_key text,
  relation_type text not null check (relation_type in ('main', 'supporting', 'parallel', 'contrast')),
  note_ar text,
  evidence_note_ar text,
  source_id text references public.tafsir_sources(id),
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, surah_id, ayah_from, ayah_to)
);

create table if not exists public.node_links (
  id bigserial primary key,
  source_node_id text not null references public.story_nodes(id) on delete cascade,
  target_node_id text not null references public.story_nodes(id) on delete cascade,
  relation_type text not null,
  evidence_note_ar text,
  confidence numeric check (confidence >= 0 and confidence <= 1) default 1,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_node_id, target_node_id, relation_type)
);

create table if not exists public.ayah_themes (
  id bigserial primary key,
  surah_id smallint not null,
  ayah_number smallint not null,
  theme_id text not null references public.themes(id),
  evidence_note_ar text,
  reviewed boolean default false,
  reviewer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (surah_id, ayah_number, theme_id)
);

create table if not exists public.content_reviews (
  id bigserial primary key,
  content_type text not null,
  content_id text not null,
  reviewer_name text not null,
  status text not null check (status in ('pending', 'approved', 'rejected', 'needs_revision')),
  note text,
  reviewer_user_id uuid references auth.users(id),
  reviewed_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Controlled promotion batches
-- ---------------------------------------------------------------------------

create table if not exists public.content_change_batches (
  id uuid primary key default gen_random_uuid(),
  batch_type text not null,
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'approved', 'applied', 'rejected')
  ),
  summary text,
  payload jsonb not null,
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  applied_by uuid references auth.users(id),
  reviewer_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  applied_at timestamptz
);

create index if not exists idx_content_change_batches_status
  on public.content_change_batches (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_ayahs_surah on public.ayahs (surah_id);
create index if not exists idx_events_node on public.story_events (node_id);
create index if not exists idx_event_ayahs_surah on public.event_ayahs (surah_id);
create index if not exists idx_node_links_source on public.node_links (source_node_id);
create index if not exists idx_node_links_target on public.node_links (target_node_id);
create index if not exists idx_story_events_review on public.story_events (review_status, evidence_status);

-- ---------------------------------------------------------------------------
-- Public final helper (mirrors app isFinalContent rules)
-- ---------------------------------------------------------------------------

create or replace function public.row_is_public_final(
  p_review_status text,
  p_source_status text,
  p_evidence_status text default null,
  p_evidence_confidence text default null,
  p_is_event boolean default false
)
returns boolean
language sql
stable
as $$
  select
    p_review_status = 'approved'
    and p_source_status is not null
    and p_source_status not in ('none', 'needs_source')
    and (
      not p_is_event
      or (
        p_evidence_status = 'precise_evidence'
        and coalesce(p_evidence_confidence, 'needs_review') <> 'needs_review'
      )
    );
$$;

-- Review queue view for reviewer/admin tooling
create or replace view public.content_review_queue_content_view as
select
  'node'::text as record_type,
  n.id as record_id,
  n.name_ar as title_ar,
  n.review_status,
  n.source_status,
  n.evidence_status,
  n.evidence_confidence,
  n.updated_at
from public.story_nodes n
where not public.row_is_public_final(n.review_status, n.source_status, n.evidence_status, n.evidence_confidence, false)
union all
select
  'event'::text,
  e.id,
  e.title_ar,
  e.review_status,
  e.source_status,
  e.evidence_status,
  e.evidence_confidence,
  e.updated_at
from public.story_events e
where not public.row_is_public_final(e.review_status, e.source_status, e.evidence_status, e.evidence_confidence, true)
union all
select
  'theme'::text,
  t.id,
  t.name_ar,
  t.review_status,
  t.source_status,
  t.evidence_status,
  t.evidence_confidence,
  t.updated_at
from public.themes t
where not public.row_is_public_final(t.review_status, t.source_status, t.evidence_status, t.evidence_confidence, false);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.surahs enable row level security;
alter table public.ayahs enable row level security;
alter table public.tafsir_sources enable row level security;
alter table public.tafsir_entries enable row level security;
alter table public.themes enable row level security;
alter table public.story_nodes enable row level security;
alter table public.story_events enable row level security;
alter table public.event_ayahs enable row level security;
alter table public.node_links enable row level security;
alter table public.ayah_themes enable row level security;
alter table public.content_reviews enable row level security;
alter table public.content_change_batches enable row level security;

-- Public read: approved/final-safe rows only
create policy story_nodes_public_read on public.story_nodes for select
  using (public.row_is_public_final(review_status, source_status, evidence_status, evidence_confidence, false));

create policy story_events_public_read on public.story_events for select
  using (public.row_is_public_final(review_status, source_status, evidence_status, evidence_confidence, true));

create policy themes_public_read on public.themes for select
  using (public.row_is_public_final(review_status, source_status, evidence_status, evidence_confidence, false));

create policy surahs_public_read on public.surahs for select using (true);

create policy tafsir_sources_public_read on public.tafsir_sources for select
  using (is_approved = true);

create policy event_ayahs_public_read on public.event_ayahs for select
  using (
    exists (
      select 1 from public.story_events e
      where e.id = event_ayahs.event_id
        and public.row_is_public_final(
          e.review_status, e.source_status, e.evidence_status, e.evidence_confidence, true
        )
    )
  );

create policy node_links_public_read on public.node_links for select
  using (
    exists (
      select 1 from public.story_nodes n
      where n.id = node_links.source_node_id
        and public.row_is_public_final(n.review_status, n.source_status, n.evidence_status, n.evidence_confidence, false)
    )
  );

-- Reviewer/admin read all content rows
create policy story_nodes_reviewer_read on public.story_nodes for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy story_events_reviewer_read on public.story_events for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy themes_reviewer_read on public.themes for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy event_ayahs_reviewer_read on public.event_ayahs for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy node_links_reviewer_read on public.node_links for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy tafsir_sources_reviewer_read on public.tafsir_sources for select
  using (public.is_active_reviewer() or public.is_active_admin());

create policy surahs_reviewer_read on public.surahs for select
  using (public.is_active_reviewer() or public.is_active_admin());

-- No public writes on content
create policy story_nodes_no_public_write on public.story_nodes for insert with check (false);
create policy story_nodes_no_public_update on public.story_nodes for update using (false);
create policy story_nodes_no_public_delete on public.story_nodes for delete using (false);

create policy story_events_no_public_write on public.story_events for insert with check (false);
create policy story_events_no_public_update on public.story_events for update using (false);
create policy story_events_no_public_delete on public.story_events for delete using (false);

-- content_change_batches policies
create policy content_batches_select on public.content_change_batches for select
  using (
    public.is_active_reviewer()
    or public.is_active_admin()
    or created_by = auth.uid()
  );

create policy content_batches_insert on public.content_change_batches for insert
  with check (
    (public.is_active_reviewer() or public.is_active_admin())
    and created_by = auth.uid()
    and status in ('draft', 'submitted')
  );

create policy content_batches_update_reviewer on public.content_change_batches for update
  using (
    (public.is_active_reviewer() and created_by = auth.uid() and status in ('draft', 'submitted'))
    or public.is_active_admin()
  )
  with check (
    public.is_active_admin()
    or (public.is_active_reviewer() and status in ('draft', 'submitted'))
  );

create policy content_batches_no_public_delete on public.content_change_batches for delete using (false);

grant select on public.content_review_queue_content_view to authenticated;
