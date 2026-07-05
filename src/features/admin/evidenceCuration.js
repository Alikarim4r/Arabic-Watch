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
    reviewTemplatePath: 'examples/evidence_patch.batch_01.review_template.json',
    scholarPackPath: 'docs/scholar_review_pack_batch_01.md',
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
  {
    id: 'evidence_mapping_sprint_02',
    label_ar: 'Sprint Batch 2',
    patchPath: 'examples/evidence_patch.batch_02.proposed.json',
    reviewTemplatePath: 'examples/evidence_patch.batch_02.review_template.json',
    scholarPackPath: 'docs/scholar_review_pack_batch_02.md',
    eventIds: [
      'yunus_02__',
      'yunus_03__',
      'ayyub_01__',
      'ayyub_02__',
      'sulayman_01__',
      'sulayman_02__',
      'dawud_01__',
      'dawud_02__',
      'dhulqarnayn_03__',
      'nuh_04__',
    ],
  },
  {
    id: 'evidence_mapping_sprint_03',
    label_ar: 'Sprint Batch 3',
    patchPath: 'examples/evidence_patch.batch_03.proposed.json',
    reviewTemplatePath: 'examples/evidence_patch.batch_03.review_template.json',
    eventIds: [
      'adam_02__',
      'adam_03__',
      'ibrahim_03__',
      'musa_04__',
      'musa_05__',
      'musa_06__',
      'musa_07__',
      'musa_08__',
      'muhammad_02__',
      'muhammad_05__',
    ],
  },
  {
    id: 'evidence_mapping_sprint_04',
    label_ar: 'Sprint Batch 4',
    patchPath: 'examples/evidence_patch.batch_04.proposed.json',
    reviewTemplatePath: 'examples/evidence_patch.batch_04.review_template.json',
    eventIds: [
      'yusuf_04__',
      'yusuf_05__',
      'yusuf_06__',
      'yusuf_07__',
      'yusuf_08__',
      'muhammad_03__',
      'muhammad_04__',
      'nuh_03__',
      'yunus_01__',
      'yunus_04__',
    ],
  },
  {
    id: 'evidence_mapping_sprint_05',
    label_ar: 'Sprint Batch 5',
    patchPath: 'examples/evidence_patch.batch_05.proposed.json',
    reviewTemplatePath: 'examples/evidence_patch.batch_05.review_template.json',
    eventIds: [
      'ayyub_03__',
      'dawud_03__',
      'dhulqarnayn_01__',
      'dhulqarnayn_02__',
      'isa_02__',
      'isa_03__',
      'maryam_02__',
      'sulayman_03__',
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
