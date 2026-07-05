-- Quran Story Universe Database Schema
-- Recommended for Supabase / PostgreSQL

create table if not exists surahs (
  id smallint primary key check (id between 1 and 114),
  name_ar text not null,
  name_en text,
  revelation_type text check (revelation_type in ('makkah','madinah')),
  ayah_count smallint not null
);

create table if not exists ayahs (
  id bigserial primary key,
  surah_id smallint not null references surahs(id) on delete cascade,
  ayah_number smallint not null,
  ayah_key text generated always as (surah_id::text || ':' || ayah_number::text) stored,
  text_uthmani text not null,
  text_simple text,
  juz smallint,
  page smallint,
  hizb numeric,
  unique (surah_id, ayah_number)
);

create table if not exists tafsir_sources (
  id text primary key,
  name_ar text not null,
  author_ar text,
  type text default 'tafsir',
  license_note text,
  source_url text,
  is_approved boolean default false
);

create table if not exists tafsir_entries (
  id bigserial primary key,
  source_id text not null references tafsir_sources(id),
  surah_id smallint not null,
  ayah_number smallint not null,
  summary_ar text not null,
  quote_ar text,
  editor_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique (source_id, surah_id, ayah_number)
);

create table if not exists story_nodes (
  id text primary key,
  node_type text not null check (node_type in ('prophet','person','people','place','theme','event_group','surah')),
  name_ar text not null,
  name_en text,
  short_title_ar text,
  summary_ar text,
  caution_note text,
  is_sensitive boolean default false,
  created_at timestamptz default now()
);

create table if not exists story_events (
  id text primary key,
  node_id text not null references story_nodes(id) on delete cascade,
  title_ar text not null,
  summary_ar text not null,
  event_order int not null,
  start_label_ar text,
  end_label_ar text,
  certainty_level text check (certainty_level in ('quran_explicit','tafsir_based','scholarly_inference')) default 'quran_explicit'
);

create table if not exists event_ayahs (
  id bigserial primary key,
  event_id text not null references story_events(id) on delete cascade,
  surah_id smallint not null,
  ayah_from smallint not null,
  ayah_to smallint not null,
  relation_type text not null check (relation_type in ('main','supporting','parallel','contrast')),
  note_ar text,
  unique (event_id, surah_id, ayah_from, ayah_to)
);

create table if not exists node_links (
  id bigserial primary key,
  source_node_id text not null references story_nodes(id) on delete cascade,
  target_node_id text not null references story_nodes(id) on delete cascade,
  relation_type text not null,
  evidence_note_ar text,
  confidence numeric check (confidence >= 0 and confidence <= 1) default 1,
  unique (source_node_id, target_node_id, relation_type)
);

create table if not exists themes (
  id text primary key,
  name_ar text not null,
  description_ar text
);

create table if not exists ayah_themes (
  id bigserial primary key,
  surah_id smallint not null,
  ayah_number smallint not null,
  theme_id text not null references themes(id),
  evidence_note_ar text,
  reviewed boolean default false,
  unique (surah_id, ayah_number, theme_id)
);

create table if not exists content_reviews (
  id bigserial primary key,
  content_type text not null,
  content_id text not null,
  reviewer_name text not null,
  status text not null check (status in ('pending','approved','rejected','needs_revision')),
  note text,
  reviewed_at timestamptz default now()
);

-- Recommended indexes
create index if not exists idx_ayahs_surah on ayahs(surah_id);
create index if not exists idx_events_node on story_events(node_id);
create index if not exists idx_event_ayahs_surah on event_ayahs(surah_id);
create index if not exists idx_node_links_source on node_links(source_node_id);
create index if not exists idx_node_links_target on node_links(target_node_id);
