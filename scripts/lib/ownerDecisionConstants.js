/** Owner review decision constants — consolidated Batches 1–5. */

export const OWNER_DECISIONS = [
  '',
  'undecided',
  'approve_after_source_check',
  'revise_ayah_range',
  'rename_event',
  'split_event',
  'reject_mapping',
  'needs_source',
];

export { containsQuranTextPayload, QURAN_TEXT_KEYS } from './scholarDecisionConstants.js';

/**
 * @param {Object} entry
 * @param {Object} mapping
 */
export function canProposeOwnerApproved(entry, mapping) {
  const decision = String(entry.owner_decision ?? '').trim();
  const finalStatus = String(entry.final_recommended_status ?? '').trim();
  const sourceId = String(entry.source_id ?? mapping.source_id ?? '').trim();
  const ownerNote = String(entry.owner_note ?? mapping.owner_note ?? '').trim();
  const confidence = entry.evidence_confidence ?? mapping.evidence_confidence;

  if (decision !== 'approve_after_source_check') return false;
  if (finalStatus !== 'approved') return false;
  if (!sourceId) return false;
  if (!ownerNote) return false;
  if (confidence === 'needs_review' || !confidence) return false;

  const sid = Number(mapping.proposed_surah_id ?? mapping.surah_id);
  const aFrom = Number(mapping.proposed_ayah_from ?? mapping.ayah_from);
  const aTo = Number(mapping.proposed_ayah_to ?? mapping.ayah_to ?? aFrom);
  if (!Number.isInteger(sid) || sid < 1 || sid > 114) return false;
  if (!Number.isInteger(aFrom) || aFrom < 1) return false;
  if (!Number.isInteger(aTo) || aTo < aFrom) return false;

  return true;
}
