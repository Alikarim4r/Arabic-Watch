/**
 * Map Supabase content table rows to the JSON seed shape used by the UI.
 */

/**
 * @param {Object} rows
 */
export function mapSupabaseBundle(rows) {
  return {
    story_nodes: (rows.story_nodes || []).map(mapStoryNodeRow),
    story_events: (rows.story_events || []).map(mapStoryEventRow),
    event_ayahs: (rows.event_ayahs || []).map(mapEventAyahRow),
    node_links: rows.node_links || [],
    themes: (rows.themes || []).map(mapThemeRow),
    tafsir_sources: rows.tafsir_sources || [],
    eras: rows.eras || [],
    surahs: (rows.surahs || []).map(mapSurahRow),
    _provider: rows._provider || 'supabase',
    _contentSource: rows._contentSource || 'supabase',
  };
}

function mapStoryNodeRow(row) {
  return {
    id: row.id,
    node_type: row.node_type,
    name_ar: row.name_ar,
    name_en: row.name_en,
    short_title_ar: row.short_title_ar,
    summary_ar: row.summary_ar,
    caution_note: row.caution_note,
    is_sensitive: row.is_sensitive,
    review_status: row.review_status,
    source_status: row.source_status,
    evidence_status: row.evidence_status,
    evidence_confidence: row.evidence_confidence,
    source_id: row.source_id,
    reviewer_note: row.reviewer_note,
    network_conclusion_ar: row.network_conclusion_ar,
    network_conclusion_review_status: row.network_conclusion_review_status,
    lessons_ar: row.lessons_ar || [],
  };
}

function mapStoryEventRow(row) {
  return {
    id: row.id,
    node_id: row.node_id,
    title_ar: row.title_ar,
    summary_ar: row.summary_ar,
    event_order: row.event_order,
    start_label_ar: row.start_label_ar,
    end_label_ar: row.end_label_ar,
    certainty_level: row.certainty_level,
    review_status: row.review_status,
    source_status: row.source_status,
    evidence_status: row.evidence_status,
    evidence_confidence: row.evidence_confidence,
    source_id: row.source_id,
    reviewer_note: row.reviewer_note,
    theme_ids: row.theme_ids || [],
    lessons_ar: row.lessons_ar || [],
    sources: row.sources || [],
  };
}

function mapEventAyahRow(row) {
  return {
    event_id: row.event_id,
    surah_id: row.surah_id,
    ayah_from: row.ayah_from,
    ayah_to: row.ayah_to,
    ayah_key: row.ayah_key,
    relation_type: row.relation_type,
    note_ar: row.note_ar,
    evidence_note_ar: row.evidence_note_ar || row.note_ar,
    source_id: row.source_id,
    reviewer_note: row.reviewer_note,
  };
}

function mapThemeRow(row) {
  return {
    id: row.id,
    name_ar: row.name_ar,
    description_ar: row.description_ar,
    review_status: row.review_status,
    source_status: row.source_status,
    evidence_status: row.evidence_status,
    evidence_confidence: row.evidence_confidence,
    source_id: row.source_id,
    reviewer_note: row.reviewer_note,
  };
}

function mapSurahRow(row) {
  return {
    id: row.id,
    name_ar: row.name_ar,
    revelation_type: row.revelation_type,
    ayah_count: row.ayah_count,
    featured: row.featured,
  };
}

/**
 * @param {Object} error
 * @returns {boolean}
 */
export function isMissingContentTableError(error) {
  if (!error) return false;
  const code = error.code || '';
  const message = String(error.message || '');
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('Could not find the table')
  );
}

/**
 * @param {Object} client
 */
export async function fetchSupabaseContentBundle(client) {
  const [
    story_nodes,
    story_events,
    event_ayahs,
    node_links,
    themes,
    tafsir_sources,
    surahs,
  ] = await Promise.all([
    client.from('story_nodes').select('*'),
    client.from('story_events').select('*').order('event_order'),
    client.from('event_ayahs').select('*'),
    client.from('node_links').select('*'),
    client.from('themes').select('*'),
    client.from('tafsir_sources').select('*'),
    client.from('surahs').select('*').order('id'),
  ]);

  const firstError =
    story_nodes.error ||
    story_events.error ||
    event_ayahs.error ||
    node_links.error ||
    themes.error ||
    tafsir_sources.error ||
    surahs.error;

  if (firstError) {
    if (isMissingContentTableError(firstError)) {
      const err = new Error('CONTENT_TABLES_MISSING');
      err.cause = firstError;
      throw err;
    }
    throw firstError;
  }

  if (!story_nodes.data?.length && !story_events.data?.length) {
    const err = new Error('CONTENT_TABLES_EMPTY');
    throw err;
  }

  return mapSupabaseBundle({
    story_nodes: story_nodes.data,
    story_events: story_events.data,
    event_ayahs: event_ayahs.data,
    node_links: node_links.data,
    themes: themes.data,
    tafsir_sources: tafsir_sources.data,
    surahs: surahs.data,
    _provider: 'supabase',
    _contentSource: 'supabase',
  });
}

/**
 * @param {Object} client
 */
export async function fetchReviewQueueFromSupabase(client) {
  const { data, error } = await client.from('content_review_queue_content_view').select('*');
  if (error) {
    if (isMissingContentTableError(error)) return [];
    console.warn('[QSU] review queue view fetch failed', error);
    return [];
  }
  return data || [];
}

/**
 * @param {Object} client
 */
export async function fetchContentChangeBatches(client) {
  const { data, error } = await client
    .from('content_change_batches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    if (isMissingContentTableError(error)) return [];
    console.warn('[QSU] content_change_batches fetch failed', error);
    return [];
  }
  return data || [];
}
