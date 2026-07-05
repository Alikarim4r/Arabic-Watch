import { isFinalContent } from '../../lib/dataService.js';

/**
 * @typedef {'node'|'event'|'theme'} ReviewRecordType
 * @typedef {'approve'|'needs_source'|'reject'|'request_revision'} ReviewAction
 */

/**
 * Build a flat review queue from repository data.
 * @param {{ nodes: Object[], events: Object[], themes: Object[], eventAyahs: Object[], tafsirSources: Object[] }} data
 */
export function buildReviewQueue({ nodes, events, themes, eventAyahs, tafsirSources }) {
  /** @type {Object[]} */
  const records = [];

  nodes.forEach((node) => {
    records.push({
      id: node.id,
      recordType: 'node',
      title_ar: node.name_ar,
      summary_ar: node.summary_ar || node.short_title_ar || '',
      review_status: node.review_status || 'pending',
      source_status: node.source_status || 'pending',
      node_type: node.node_type,
      source_ids: [],
      ayahs: [],
      isFinal: isFinalContent(node),
      raw: node,
    });
  });

  events.forEach((event) => {
    const ayahs = eventAyahs.filter((a) => a.event_id === event.id);
    const sourceIds = (event.sources || []).map((s) => s.source_id).filter(Boolean);
    records.push({
      id: event.id,
      recordType: 'event',
      title_ar: event.title_ar,
      summary_ar: event.summary_ar || '',
      review_status: event.review_status || 'pending',
      source_status: event.source_status || 'pending',
      node_id: event.node_id,
      source_ids: sourceIds,
      ayahs,
      isFinal: isFinalContent(event),
      raw: event,
    });
  });

  themes.forEach((theme) => {
    records.push({
      id: theme.id,
      recordType: 'theme',
      title_ar: theme.name_ar,
      summary_ar: theme.description_ar || '',
      review_status: theme.review_status || 'pending',
      source_status: theme.source_status || 'none',
      source_ids: [],
      ayahs: [],
      isFinal: theme.review_status === 'approved',
      raw: theme,
    });
  });

  return records;
}

/**
 * @param {Object[]} records
 */
export function summarizeReviewStats(records) {
  const stats = {
    total: records.length,
    approved: 0,
    pending: 0,
    needs_source: 0,
    notFinal: 0,
    byType: { node: 0, event: 0, theme: 0 },
  };

  records.forEach((r) => {
    stats.byType[r.recordType] = (stats.byType[r.recordType] || 0) + 1;
    if (r.review_status === 'approved') stats.approved++;
    else if (r.review_status === 'needs_source') stats.needs_source++;
    else stats.pending++;

    if (!r.isFinal) stats.notFinal++;
  });

  return stats;
}

/**
 * @param {Object[]} records
 * @param {Object} filters
 */
export function filterReviewQueue(records, filters = {}) {
  return records.filter((r) => {
    if (filters.recordType && r.recordType !== filters.recordType) return false;
    if (filters.reviewStatus && r.review_status !== filters.reviewStatus) return false;
    if (filters.sourceStatus && r.source_status !== filters.sourceStatus) return false;
    if (filters.sourceId && !r.source_ids.includes(filters.sourceId)) return false;
    if (filters.nodeType && r.node_type !== filters.nodeType) return false;
    if (filters.onlyNotFinal && r.isFinal) return false;
    if (filters.q) {
      const q = filters.q.trim();
      if (!q) return true;
      const hay = [r.title_ar, r.summary_ar, r.id].join(' ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Records that must not be shown as verified in public mode.
 * @param {Object[]} records
 */
export function getNonFinalRecords(records) {
  return records.filter((r) => !r.isFinal);
}

/**
 * @param {Object[]} tafsirSources
 * @param {string[]} sourceIds
 */
export function resolveSourceLabels(tafsirSources, sourceIds = []) {
  return sourceIds.map((id) => {
    const src = tafsirSources.find((s) => s.id === id);
    return src ? { id, name_ar: src.name_ar, is_approved: src.is_approved } : { id, name_ar: id, is_approved: false };
  });
}
