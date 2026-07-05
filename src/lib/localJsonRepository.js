/** @typedef {import('./repository.js').Repository} Repository */

let cachedData = null;

/**
 * @param {Object} data
 * @returns {Repository}
 */
export function createLocalJsonRepository(data) {
  return {
    async loadAll() {
      if (!cachedData) cachedData = data;
      return cachedData;
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
  };
}

/**
 * Load seed content from JSON files.
 * @returns {Promise<Repository>}
 */
export async function loadLocalRepository() {
  const [seedRes, surahsRes] = await Promise.all([
    fetch('./data/seed_content.json'),
    fetch('./data/surahs.json'),
  ]);

  if (!seedRes.ok) throw new Error('Failed to load seed_content.json');
  if (!surahsRes.ok) throw new Error('Failed to load surahs.json');

  const seed = await seedRes.json();
  const surahsFile = await surahsRes.json();

  const merged = {
    ...seed,
    surahs: surahsFile.surahs || seed.surahs || [],
  };

  return createLocalJsonRepository(merged);
}
