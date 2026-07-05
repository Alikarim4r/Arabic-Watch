/** @typedef {import('../../lib/repository.js').Repository} Repository */

import { attachQuranTextMethods } from '../../lib/quranText.js';

let cachedData = null;

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
     * Mock review action — local JSON is read-only in demo mode.
     * @param {{ contentType: string, contentId: string, action: string, note?: string }} _payload
     */
    async submitReviewAction(_payload) {
      return {
        ok: true,
        mock: true,
        provider: 'local',
        message: 'Local JSON mode is read-only. Connect Supabase to persist reviews.',
      };
    },
  };

  return attachQuranTextMethods(repo, quranIndex);
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
