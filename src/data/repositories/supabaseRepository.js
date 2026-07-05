/** @typedef {import('../../lib/repository.js').Repository} Repository */

import { getEnvConfig } from '../../config/env.js';
import { getCurrentUser, isAdmin } from '../../lib/authService.js';
import { getSupabaseClient } from '../../lib/supabaseClient.js';
import { attachQuranTextMethods } from '../../lib/quranText.js';
import {
  fetchContentChangeBatches,
  fetchReviewQueueFromSupabase,
  fetchSupabaseContentBundle,
} from '../../lib/supabaseContentMapper.js';
import { loadLocalRepository, loadQuranTextIndex } from './localRepository.js';

export { mapSupabaseBundle } from '../../lib/supabaseContentMapper.js';

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

  let cachedData = null;
  let contentLoadWarning = null;
  let quranIndex = null;

  async function ensureQuranIndex() {
    if (quranIndex === null) quranIndex = await loadQuranTextIndex();
    return quranIndex;
  }

  async function loadRemoteOrLocal() {
    try {
      const remote = await fetchSupabaseContentBundle(client);
      const local = await getFallback();
      const localData = await local.loadAll();
      console.info('[QSU] Supabase content tables loaded.');
      return { ...remote, eras: localData.eras || [] };
    } catch (err) {
      if (err.message === 'CONTENT_TABLES_MISSING' || err.message === 'CONTENT_TABLES_EMPTY') {
        contentLoadWarning =
          err.message === 'CONTENT_TABLES_EMPTY'
            ? 'Supabase content tables exist but are empty — using local seed fallback.'
            : 'Supabase content tables missing — run migrations + seed SQL. Using local seed fallback.';
        console.warn(`[QSU] ${contentLoadWarning}`);
        const local = await getFallback();
        const data = await local.loadAll();
        return { ...data, _provider: 'supabase', _contentSource: 'local_fallback', _contentWarning: contentLoadWarning };
      }
      console.warn('[QSU] Supabase content load failed — falling back to local JSON.', err);
      const local = await getFallback();
      const data = await local.loadAll();
      return { ...data, _provider: 'supabase', _contentSource: 'local_fallback' };
    }
  }

  const repo = {
    async loadAll() {
      if (!cachedData) {
        const remote = await loadRemoteOrLocal();
        const fallback = await getFallback();
        const localData = await fallback.loadAll();
        cachedData = {
          ...localData,
          ...remote,
          eras: localData.eras || [],
          _contentWarning: remote._contentWarning || contentLoadWarning,
        };
      }
      return cachedData;
    },
    async getProvider() {
      return 'supabase';
    },
    async getContentSource() {
      const d = await this.loadAll();
      return d._contentSource || 'supabase';
    },
    async getNodes() {
      const d = await this.loadAll();
      return d.story_nodes || [];
    },
    async getStoryNodes() {
      return this.getNodes();
    },
    async getEvents() {
      const d = await this.loadAll();
      return d.story_events || [];
    },
    async getStoryEvents() {
      return this.getEvents();
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
    async getNodeLinks() {
      return this.getLinks();
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

    async getReviewQueue() {
      return fetchReviewQueueFromSupabase(client);
    },

    async getContentChangeBatches() {
      return fetchContentChangeBatches(client);
    },

    async submitContentChangeBatch(batchPayload) {
      const user = await getCurrentUser();
      if (!user?.id) {
        return { ok: false, error: 'not_authenticated', message: 'Sign in as reviewer to submit batches.' };
      }
      const { data, error } = await client
        .from('content_change_batches')
        .insert({
          batch_type: batchPayload.batch_type || 'evidence_promotion',
          status: batchPayload.status || 'draft',
          summary: batchPayload.summary || '',
          payload: batchPayload.payload || batchPayload,
          created_by: user.id,
        })
        .select('*')
        .single();
      if (error) return { ok: false, error: error.message, message: 'Failed to submit content batch.' };
      return {
        ok: true,
        persisted: true,
        data,
        message: 'Content batch recorded — not applied to production tables automatically.',
      };
    },

    async updateContentChangeBatchStatus(batchId, status, reviewerNote = '') {
      const user = await getCurrentUser();
      if (!user?.id) return { ok: false, error: 'not_authenticated' };

      if (status === 'applied' && !(await isAdmin())) {
        return { ok: false, message: 'Only admin can mark batches as applied.' };
      }
      if (['approved', 'rejected', 'applied'].includes(status) && !(await isAdmin())) {
        return { ok: false, message: 'Admin role required for this batch transition.' };
      }

      const patch = {
        status,
        reviewer_note: reviewerNote,
      };
      if (status === 'approved') {
        patch.approved_by = user.id;
        patch.approved_at = new Date().toISOString();
      }
      if (status === 'applied') {
        patch.applied_by = user.id;
        patch.applied_at = new Date().toISOString();
      }

      const { data, error } = await client
        .from('content_change_batches')
        .update(patch)
        .eq('id', batchId)
        .select('*')
        .single();

      if (error) return { ok: false, error: error.message };
      return {
        ok: true,
        data,
        message:
          status === 'applied'
            ? 'Batch marked applied — run controlled promotion job to mutate content tables.'
            : `Batch marked ${status}.`,
      };
    },

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
