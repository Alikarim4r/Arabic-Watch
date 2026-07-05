/** @typedef {import('../../lib/repository.js').Repository} Repository */

import { getEnvConfig } from '../../config/env.js';
import { attachQuranTextMethods } from '../../lib/quranText.js';
import { loadLocalRepository, loadQuranTextIndex } from './localRepository.js';

/**
 * Map Supabase row shapes to the JSON seed shape used by the UI.
 * Placeholder — wire to real queries when Supabase is populated.
 */
export function mapSupabaseBundle(rows) {
  return {
    story_nodes: rows.story_nodes || [],
    story_events: rows.story_events || [],
    event_ayahs: rows.event_ayahs || [],
    node_links: rows.node_links || [],
    themes: rows.themes || [],
    tafsir_sources: rows.tafsir_sources || [],
    eras: rows.eras || [],
    surahs: rows.surahs || [],
  };
}

/**
 * Create a Supabase-backed repository.
 * Falls back to local JSON when credentials are missing or fetch fails.
 *
 * @param {{ supabaseUrl?: string, supabaseAnonKey?: string }} [options]
 * @returns {Promise<Repository>}
 */
export async function createSupabaseRepository(options = {}) {
  const env = getEnvConfig();
  const url = options.supabaseUrl || env.supabaseUrl;
  const key = options.supabaseAnonKey || env.supabaseAnonKey;

  if (!url || !key) {
    console.warn('[QSU] Supabase credentials missing — falling back to local JSON.');
    return loadLocalRepository();
  }

  /** @type {Repository|null} */
  let localFallback = null;
  async function getFallback() {
    if (!localFallback) localFallback = await loadLocalRepository();
    return localFallback;
  }

  /**
   * Placeholder fetch — replace with @supabase/supabase-js client queries.
   * Until migration is complete, use local seed as data source.
   */
  async function loadRemoteOrLocal() {
    try {
      // Future implementation:
      // const client = createClient(url, key);
      // const [nodes, events, ...] = await Promise.all([...]);
      // return mapSupabaseBundle({ ... });
      console.info('[QSU] Supabase repository placeholder — using local seed until tables are populated.');
      const local = await getFallback();
      const data = await local.loadAll();
      return { ...data, _provider: 'supabase-placeholder' };
    } catch (err) {
      console.warn('[QSU] Supabase load failed — falling back to local JSON.', err);
      const local = await getFallback();
      return local.loadAll();
    }
  }

  let cachedData = null;
  let quranIndex = null;

  async function ensureQuranIndex() {
    if (quranIndex === null) quranIndex = await loadQuranTextIndex();
    return quranIndex;
  }

  const repo = {
    async loadAll() {
      if (!cachedData) cachedData = await loadRemoteOrLocal();
      return cachedData;
    },
    async getProvider() {
      return cachedData?._provider === 'supabase-placeholder' ? 'supabase' : 'supabase';
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
     * Structured for future Supabase writes to content_reviews + row updates.
     * @param {{ contentType: string, contentId: string, action: string, note?: string, reviewerName?: string }} payload
     */
    async submitReviewAction(payload) {
      // Future:
      // await client.from('content_reviews').insert({ ... })
      // await client.from(table).update({ review_status }).eq('id', payload.contentId)
      return {
        ok: true,
        mock: true,
        provider: 'supabase',
        pendingSync: true,
        payload,
        message: 'Review action recorded locally (mock). Wire Supabase RPC to persist.',
      };
    },
  };

  await ensureQuranIndex();
  return attachQuranTextMethods(repo, quranIndex);
}
