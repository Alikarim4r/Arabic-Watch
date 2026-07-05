import { isFinalContent } from '../../lib/dataService.js';

export const REVIEW_FILTERS_STORAGE_KEY = 'qsu_admin_review_filters';

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
      evidence_status: event.evidence_status || 'needs_precise_mapping',
      evidence_confidence: event.evidence_confidence || 'needs_review',
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
      isFinal: isFinalContent(theme),
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
    needs_precise_mapping: 0,
    precise_evidence: 0,
    byType: { node: 0, event: 0, theme: 0 },
  };

  records.forEach((r) => {
    stats.byType[r.recordType] = (stats.byType[r.recordType] || 0) + 1;
    if (r.review_status === 'approved') stats.approved++;
    else if (r.review_status === 'needs_source') stats.needs_source++;
    else stats.pending++;

    if (!r.isFinal) stats.notFinal++;
    if (r.evidence_status === 'needs_precise_mapping') stats.needs_precise_mapping++;
    if (r.evidence_status === 'precise_evidence') stats.precise_evidence++;
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
    if (filters.evidenceStatus && r.evidence_status !== filters.evidenceStatus) return false;
    if (filters.evidenceConfidence && r.evidence_confidence !== filters.evidenceConfidence) return false;
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

/**
 * Priority sort for reviewer productivity.
 * @param {Object[]} records
 */
export function sortReviewQueueByPriority(records) {
  const rank = (r) => {
    if (r.review_status === 'needs_source') return 1;
    if (r.evidence_status === 'needs_precise_mapping') return 2;
    if (r.review_status === 'pending') return 3;
    if (r.evidence_confidence === 'needs_review') return 4;
    if (r.review_status === 'approved') return 5;
    return 6;
  };
  return [...records].sort((a, b) => {
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return String(a.title_ar || '').localeCompare(String(b.title_ar || ''), 'ar');
  });
}

/**
 * @param {Object[]} records
 */
export function buildFilterChips(records) {
  const count = (fn) => records.filter(fn).length;
  return [
    { key: 'needs_source', label: 'needs_source', label_ar: 'يحتاج مصدر', count: count((r) => r.review_status === 'needs_source') },
    { key: 'needs_precise_mapping', label: 'needs_precise_mapping', label_ar: 'ربط آيات', count: count((r) => r.evidence_status === 'needs_precise_mapping') },
    { key: 'pending', label: 'pending', label_ar: 'قيد المراجعة', count: count((r) => r.review_status === 'pending') },
    { key: 'needs_review', label: 'needs_review', label_ar: 'needs_review', count: count((r) => r.evidence_confidence === 'needs_review') },
    { key: 'approved', label: 'approved', label_ar: 'معتمد', count: count((r) => r.review_status === 'approved') },
    { key: 'not_final', label: 'not_final', label_ar: 'غير نهائي', count: count((r) => !r.isFinal) },
  ];
}

/**
 * @returns {Object|null}
 */
export function loadSavedReviewFilters() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REVIEW_FILTERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** @param {Object} filters */
export function saveReviewFilters(filters) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(REVIEW_FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Apply quick chip filter on top of base filters.
 * @param {Object[]} records
 * @param {string} chipKey
 */
export function applyChipFilter(records, chipKey) {
  switch (chipKey) {
    case 'needs_source':
      return records.filter((r) => r.review_status === 'needs_source');
    case 'needs_precise_mapping':
      return records.filter((r) => r.evidence_status === 'needs_precise_mapping');
    case 'pending':
      return records.filter((r) => r.review_status === 'pending');
    case 'needs_review':
      return records.filter((r) => r.evidence_confidence === 'needs_review');
    case 'approved':
      return records.filter((r) => r.review_status === 'approved');
    case 'not_final':
      return records.filter((r) => !r.isFinal);
    default:
      return records;
  }
}
