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

const CURATION_DRAFT_STORAGE_KEY = 'qsu_curation_drafts';

function readDraftStore() {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CURATION_DRAFT_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeDraftStore(store) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CURATION_DRAFT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} eventId
 * @param {Object} patch
 */
export function saveDraftToStorage(eventId, patch) {
  const store = readDraftStore();
  store[eventId] = { ...patch, event_id: eventId, saved_at: new Date().toISOString() };
  writeDraftStore(store);
}

/** @param {string} eventId */
export function loadDraftFromStorage(eventId) {
  const store = readDraftStore();
  return store[eventId] || null;
}

/**
 * @param {string} eventId
 */
export function getDraftForEvent(eventId) {
  return getSessionPatch(eventId) || loadDraftFromStorage(eventId);
}

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

/** Sprint batches for reviewer filters — proposed patches only, not applied automatically. */
export const EVIDENCE_SPRINT_BATCHES = [
  {
    id: 'evidence_mapping_sprint_01',
    label_ar: 'Sprint Batch 1',
    patchPath: 'examples/evidence_patch.batch_01.proposed.json',
    eventIds: [
      'adam_01__',
      'adam_04__',
      'ibrahim_04__',
      'ibrahim_05__',
      'maryam_03__',
      'maryam_04__',
      'musa_firawn',
      'musa_03__',
      'musa_09__',
      'isa_04__',
    ],
  },
];

/**
 * @param {Object[]} queue
 * @param {string | null} batchId
 */
export function filterMappingQueueByBatch(queue, batchId) {
  if (!batchId) return queue;
  const batch = EVIDENCE_SPRINT_BATCHES.find((b) => b.id === batchId);
  if (!batch) return queue;
  const ids = new Set(batch.eventIds);
  return queue.filter((q) => ids.has(q.id));
}
