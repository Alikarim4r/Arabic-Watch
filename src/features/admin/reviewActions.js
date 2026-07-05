/** @typedef {'approve'|'needs_source'|'reject'|'request_revision'} ReviewAction */

/**
 * Map UI action to target review_status for future Supabase updates.
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
 * Mock review submission — structured for future Supabase persistence.
 * @param {import('../../lib/repository.js').Repository} repo
 * @param {{ record: Object, action: ReviewAction, note?: string, reviewerName?: string }} params
 */
export async function submitReviewAction(repo, { record, action, note = '', reviewerName = 'reviewer' }) {
  const nextStatus = mapReviewActionToStatus(action);
  const payload = {
    contentType: record.recordType,
    contentId: record.id,
    action,
    nextStatus,
    note,
    reviewerName,
    previousStatus: record.review_status,
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
 * In-memory mock state for demo admin (session-only, not persisted to JSON).
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
