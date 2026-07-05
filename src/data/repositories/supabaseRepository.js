/** @typedef {import('../../lib/repository.js').Repository} Repository */

import { getEnvConfig } from '../../config/env.js';
import { getCurrentUser } from '../../lib/authService.js';
import { getSupabaseClient } from '../../lib/supabaseClient.js';
import { attachQuranTextMethods } from '../../lib/quranText.js';
import { loadLocalRepository, loadQuranTextIndex } from './localRepository.js';

/**
 * Map Supabase row shapes to the JSON seed shape used by the UI.
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
 * @param {Object} payload
 */
function buildReviewActionRow(payload, userId) {
  return {
    record_type: payload.contentType || payload.recordType,
    record_id: payload.contentId || payload.recordId,
    action: payload.action,
    previous_status: payload.previousStatus || payload.previous_status || null,
    new_status: payload.nextStatus || payload.new_status || null,
    evidence_status: payload.evidence_status || payload.evidenceStatus || null,
    evidence_confidence: payload.evidence_confidence || payload.evidenceConfidence || null,
    source_id: payload.source_id || payload.sourceId || null,
    reviewer_note: payload.note || payload.reviewer_note || null,
    payload,
    reviewer_user_id: userId || null,
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

  const client = await getSupabaseClient();
  if (!client) {
    console.warn('[QSU] Supabase client unavailable — falling back to local JSON.');
    return loadLocalRepository();
  }

  /** @type {Repository|null} */
  let localFallback = null;
  async function getFallback() {
    if (!localFallback) localFallback = await loadLocalRepository();
    return localFallback;
  }

  /**
   * Content tables are not migrated yet — seed JSON remains source of truth for display.
   * Review actions persist to Supabase audit tables only (no auto-approval of content).
   */
  async function loadRemoteOrLocal() {
    try {
      console.info('[QSU] Supabase mode — content from local seed; review actions persist remotely.');
      const local = await getFallback();
      const data = await local.loadAll();
      return { ...data, _provider: 'supabase' };
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
      return 'supabase';
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
     * Persist review action audit row — does not mutate approved content tables.
     * @param {Object} payload
     */
    async submitReviewAction(payload) {
      const user = await getCurrentUser();
      if (!user?.id) {
        return {
          ok: false,
          provider: 'supabase',
          error: 'not_authenticated',
          message: 'Sign in as reviewer/admin to persist review actions.',
        };
      }

      const row = buildReviewActionRow(payload, user.id);
      const { data, error } = await client.from('review_actions').insert(row).select('*').single();

      if (error) {
        console.warn('[QSU] review_actions insert failed', error);
        return {
          ok: false,
          provider: 'supabase',
          error: error.message,
          message: 'Failed to persist review action.',
        };
      }

      return {
        ok: true,
        provider: 'supabase',
        persisted: true,
        mock: false,
        data,
        message: 'Review action recorded in Supabase audit log (content not auto-approved).',
      };
    },

    /**
     * @param {string} recordType
     * @param {string} recordId
     */
    async getReviewActionHistory(recordType, recordId) {
      const { data, error } = await client
        .from('review_actions')
        .select('*')
        .eq('record_type', recordType)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[QSU] review_actions history fetch failed', error);
        return [];
      }
      return data || [];
    },

    /**
     * @param {Object} patchPayload
     */
    async submitEvidencePatch(patchPayload) {
      const user = await getCurrentUser();
      if (!user?.id) {
        return {
          ok: false,
          provider: 'supabase',
          error: 'not_authenticated',
          message: 'Sign in as reviewer to submit evidence patches.',
        };
      }

      const { data, error } = await client
        .from('evidence_patch_submissions')
        .insert({
          status: 'submitted',
          patch: patchPayload,
          submitted_by: user.id,
        })
        .select('*')
        .single();

      if (error) {
        return {
          ok: false,
          provider: 'supabase',
          error: error.message,
          message: 'Failed to submit evidence patch.',
        };
      }

      return {
        ok: true,
        provider: 'supabase',
        persisted: true,
        data,
        message: 'Evidence patch submitted for admin review (not auto-applied).',
      };
    },

    /**
     * Admin-only status update for evidence patch submissions.
     * @param {string} submissionId
     * @param {'approved'|'rejected'} status
     * @param {string} [reviewerNote]
     */
    async reviewEvidencePatchSubmission(submissionId, status, reviewerNote = '') {
      const user = await getCurrentUser();
      if (!user?.id) {
        return { ok: false, error: 'not_authenticated' };
      }

      const { data, error } = await client
        .from('evidence_patch_submissions')
        .update({
          status,
          reviewed_by: user.id,
          reviewer_note: reviewerNote,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select('*')
        .single();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data, message: `Patch marked ${status} — content tables not auto-mutated.` };
    },
  };

  await ensureQuranIndex();
  return attachQuranTextMethods(repo, quranIndex);
}
