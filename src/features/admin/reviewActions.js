/** @typedef {'approve'|'needs_source'|'reject'|'request_revision'|'add_evidence'|'update_evidence'} ReviewAction */

import { escapeHtml } from '../../lib/utils.js';
import { isLocalRuntime } from '../../config/env.js';

/** Actions that require confirmation before execution. */
export const CONFIRMATION_ACTIONS = new Set([
  'approve',
  'reject',
  'needs_source',
  'request_revision',
]);

/** Actions that require a reviewer note. */
export const REQUIRED_NOTE_ACTIONS = new Set(['approve', 'reject', 'request_revision']);

/**
 * @param {string} action
 */
export function actionRequiresNote(action) {
  return REQUIRED_NOTE_ACTIONS.has(action);
}

/**
 * @param {string} action
 */
export function actionRequiresConfirmation(action) {
  return CONFIRMATION_ACTIONS.has(action);
}

/**
 * Map UI action to target review_status for audit rows (not auto-applied to content).
 * @param {ReviewAction} action
 */
export function mapReviewActionToStatus(action) {
  switch (action) {
    case 'approve':
      return 'approved';
    case 'needs_source':
      return 'needs_source';
    case 'reject':
      return 'pending';
    case 'request_revision':
      return 'pending';
    default:
      return 'pending';
  }
}

/**
 * @param {import('../lib/repository.js').Repository} repo
 * @param {{ record: Object, action: ReviewAction, note?: string, notes?: Object, reviewerName?: string }} params
 */
export async function submitReviewAction(repo, { record, action, note = '', notes = {}, reviewerName = 'reviewer' }) {
  const nextStatus = mapReviewActionToStatus(action);
  const mergedNote = note || notes.reviewer_note || '';
  const payload = {
    contentType: record.recordType,
    contentId: record.id,
    action,
    nextStatus,
    note: mergedNote,
    reviewer_note: mergedNote,
    internal_note: notes.internal_note || null,
    source_note: notes.source_note || null,
    evidence_note: notes.evidence_note || null,
    reviewerName,
    previousStatus: record.review_status,
    evidence_status: record.evidence_status || null,
    evidence_confidence: record.evidence_confidence || null,
  };

  if (typeof repo.submitReviewAction === 'function') {
    return repo.submitReviewAction(payload);
  }

  return {
    ok: true,
    mock: true,
    payload,
    message: 'Mock review saved in session only. Connect Supabase to persist.',
  };
}

/**
 * @param {import('../lib/repository.js').Repository} repo
 * @param {string} recordType
 * @param {string} recordId
 */
export async function loadReviewActionHistory(repo, recordType, recordId) {
  if (typeof repo.getReviewActionHistory !== 'function') return [];
  return repo.getReviewActionHistory(recordType, recordId);
}

/**
 * @param {Object[]} history
 * @param {{ localMode?: boolean }} [options]
 */
export function renderReviewHistoryHtml(history, options = {}) {
  const localMode = options.localMode ?? isLocalRuntime();
  if (!history?.length) {
    return `<p class="muted">${localMode ? 'لا يوجد سجل مراجعة في هذه الجلسة بعد.' : 'لا يوجد سجل مراجعة مسجّل بعد.'}</p>`;
  }

  return `
    <ul class="source-list admin-history">
      ${history
        .map(
          (row) => `
        <li>
          <strong>${escapeHtml(row.action)}</strong>
          <span class="muted">${escapeHtml(row.created_at || '')}</span><br/>
          ${row.previous_status || row.new_status ? `<span class="tag">${escapeHtml(row.previous_status || '—')} → ${escapeHtml(row.new_status || '—')}</span>` : ''}
          ${row.reviewer_note ? `<p>${escapeHtml(row.reviewer_note)}</p>` : ''}
          ${row.source === 'local_session' ? '<span class="tag rose">جلسة محلية</span>' : ''}
        </li>`
        )
        .join('')}
    </ul>`;
}

/**
 * In-memory mock state for demo admin (session-only UI override, not persisted to JSON).
 * @type {Map<string, { review_status: string, note?: string, action: string, at: string }>}
 */
export const mockReviewOverrides = new Map();

/**
 * @param {Object[]} records
 */
export function applyMockOverrides(records) {
  return records.map((r) => {
    const key = `${r.recordType}:${r.id}`;
    const override = mockReviewOverrides.get(key);
    if (!override) return r;
    return {
      ...r,
      review_status: override.review_status,
      isFinal: override.review_status === 'approved' && r.source_status !== 'none',
      mockOverride: override,
    };
  });
}

/**
 * @param {Object} record
 * @param {ReviewAction} action
 * @param {string} note
 */
export function saveMockOverride(record, action, note) {
  const key = `${record.recordType}:${record.id}`;
  mockReviewOverrides.set(key, {
    review_status: mapReviewActionToStatus(action),
    action,
    note,
    at: new Date().toISOString(),
  });
}

/**
 * @param {import('../lib/repository.js').Repository} repo
 * @param {Object} patchPayload
 */
export async function submitEvidencePatch(repo, patchPayload) {
  if (typeof repo.submitEvidencePatch === 'function') {
    return repo.submitEvidencePatch(patchPayload);
  }
  return {
    ok: true,
    mock: true,
    message: 'Evidence patch export only in local mode.',
  };
}
