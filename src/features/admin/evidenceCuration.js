import { isFinalContent } from '../../lib/dataService.js';

/**
 * @param {Object[]} events
 * @param {Object[]} eventAyahs
 */
export function summarizeEvidenceStats(events, eventAyahs = []) {
  const safeForPublic = events.filter((e) => isFinalContent(e));
  const blocked = events.filter((e) => !isFinalContent(e));

  return {
    totalEvents: events.length,
    preciseEvidence: events.filter((e) => e.evidence_status === 'precise_evidence').length,
    needsPreciseMapping: events.filter((e) => e.evidence_status === 'needs_precise_mapping').length,
    needsReviewConfidence: events.filter((e) => e.evidence_confidence === 'needs_review').length,
    safeForPublicFinal: safeForPublic.length,
    blockedFromFinal: blocked.length,
    safeEventIds: safeForPublic.map((e) => e.id),
    blockedEventIds: blocked.map((e) => e.id),
  };
}

/**
 * @param {Object[]} events
 * @param {Object[]} nodes
 * @param {Object[]} themes
 * @param {Object[]} eventAyahs
 */
export function buildMappingQueue(events, nodes, themes, eventAyahs) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const themeById = new Map(themes.map((t) => [t.id, t]));
  const ayahByEvent = new Map(eventAyahs.map((a) => [a.event_id, a]));

  return events
    .filter((e) => e.evidence_status === 'needs_precise_mapping')
    .sort((a, b) => `${a.node_id}-${a.event_order}`.localeCompare(`${b.node_id}-${b.event_order}`))
    .map((event) => {
      const node = nodeById.get(event.node_id);
      const themeNames = (event.theme_ids || [])
        .map((id) => themeById.get(id)?.name_ar)
        .filter(Boolean);
      const ayahs = ayahByEvent.has(event.id) ? [ayahByEvent.get(event.id)] : [];

      return {
        id: event.id,
        recordType: 'event',
        title_ar: event.title_ar,
        summary_ar: event.summary_ar || '',
        node_id: event.node_id,
        node_name_ar: node?.name_ar || event.node_id,
        node_type: node?.node_type,
        review_status: event.review_status,
        source_status: event.source_status,
        evidence_status: event.evidence_status,
        evidence_confidence: event.evidence_confidence,
        theme_names: themeNames,
        ayahs,
        raw: event,
      };
    });
}

/** @type {Map<string, Object>} */
export const sessionEvidencePatches = new Map();

/**
 * @param {string} eventId
 * @param {Object} patch
 */
export function saveSessionPatch(eventId, patch) {
  sessionEvidencePatches.set(eventId, {
    ...patch,
    event_id: eventId,
    saved_at: new Date().toISOString(),
  });
}

/** @returns {Object[]} */
export function getAllSessionPatches() {
  return [...sessionEvidencePatches.values()];
}

/** @param {string} eventId */
export function getSessionPatch(eventId) {
  return sessionEvidencePatches.get(eventId) || null;
}
