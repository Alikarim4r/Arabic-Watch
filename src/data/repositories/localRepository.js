/** @typedef {import('../../lib/repository.js').Repository} Repository */

import { attachQuranTextMethods } from '../../lib/quranText.js';

let cachedData = null;

/** @type {Object[]} */
const sessionReviewHistory = [];

/** @type {Object[]} */
const sessionEvidencePatches = [];

/**
 * @param {Object} data
 * @param {Object|null} [quranIndex]
 * @returns {Repository}
 */
export function createLocalJsonRepository(data, quranIndex = null) {
  const repo = {
    async loadAll() {
      if (!cachedData) cachedData = data;
      return cachedData;
    },
    async getProvider() {
      return 'local';
    },
    async getNodes() {
      const d = await this.loadAll();
      return d.story_nodes || [];
    },
    async getEvents() {
      const d = await this.loadAll();
      return d.story_events || [];
    },
    async getNodeById(id) {
      const nodes = await this.getNodes();
      return nodes.find((n) => n.id === id) || null;
    },
    async getEventById(id) {
      const events = await this.getEvents();
      return events.find((e) => e.id === id) || null;
    },
    async getEventsByNode(nodeId) {
      const events = await this.getEvents();
      return events
        .filter((e) => e.node_id === nodeId)
        .sort((a, b) => a.event_order - b.event_order);
    },
    async getLinks() {
      const d = await this.loadAll();
      return d.node_links || [];
    },
    async getEventAyahs() {
      const d = await this.loadAll();
      return d.event_ayahs || [];
    },
    async getThemes() {
      const d = await this.loadAll();
      return d.themes || [];
    },
    async getSurahs() {
      const d = await this.loadAll();
      return d.surahs || [];
    },
    async getTafsirSources() {
      const d = await this.loadAll();
      return d.tafsir_sources || [];
    },
    async getEras() {
      const d = await this.loadAll();
      return d.eras || [];
    },
    /**
     * Mock review action — local JSON is read-only; session-only audit trail.
     * @param {Object} payload
     */
    async submitReviewAction(payload) {
      const entry = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        record_type: payload.contentType,
        record_id: payload.contentId,
        action: payload.action,
        previous_status: payload.previousStatus,
        new_status: payload.nextStatus || localActionToStatus(payload.action),
        reviewer_note: payload.note || null,
        payload,
        created_at: new Date().toISOString(),
        source: 'local_session',
      };
      sessionReviewHistory.unshift(entry);
      return {
        ok: true,
        mock: true,
        provider: 'local',
        persisted: false,
        data: entry,
        message: 'Local JSON mode is read-only. Review action saved in session only.',
      };
    },

    /**
     * @param {string} recordType
     * @param {string} recordId
     */
    async getReviewActionHistory(recordType, recordId) {
      return sessionReviewHistory.filter(
        (row) => row.record_type === recordType && row.record_id === recordId
      );
    },

    /**
     * @param {Object} patchPayload
     */
    async submitEvidencePatch(patchPayload) {
      const entry = {
        id: `local-patch-${Date.now()}`,
        status: 'draft',
        patch: patchPayload,
        created_at: new Date().toISOString(),
        source: 'local_session',
      };
      sessionEvidencePatches.unshift(entry);
      return {
        ok: true,
        mock: true,
        provider: 'local',
        persisted: false,
        data: entry,
        message: 'Evidence patch kept in local session only — export JSON to apply manually.',
      };
    },

    async reviewEvidencePatchSubmission() {
      return {
        ok: false,
        mock: true,
        provider: 'local',
        message: 'Patch approval requires Supabase admin mode.',
      };
    },
  };

  return attachQuranTextMethods(repo, quranIndex);
}

function localActionToStatus(action) {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'needs_source':
      return 'needs_source';
    default:
      return 'pending';
  }
}

/**
 * @returns {Promise<Object|null>}
 */
export async function loadQuranTextIndex() {
  try {
    const res = await fetch('./data/quran/quran_text.index.json');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Load seed content from JSON files.
 * @returns {Promise<Repository>}
 */
export async function loadLocalRepository() {
  const [seedRes, surahsRes, quranIndex] = await Promise.all([
    fetch('./data/seed_content.json'),
    fetch('./data/surahs.json'),
    loadQuranTextIndex(),
  ]);

  if (!seedRes.ok) throw new Error('Failed to load seed_content.json');
  if (!surahsRes.ok) throw new Error('Failed to load surahs.json');

  const seed = await seedRes.json();
  const surahsFile = await surahsRes.json();

  const merged = {
    ...seed,
    surahs: surahsFile.surahs || seed.surahs || [],
  };

  return createLocalJsonRepository(merged, quranIndex);
}
