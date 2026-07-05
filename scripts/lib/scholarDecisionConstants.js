/** Shared scholar decision constants for compile + validate scripts. */

export const SCHOLAR_DECISIONS = [
  '',
  'approve_after_source_check',
  'revise_ayah_range',
  'split_event',
  'rename_event',
  'reject_mapping',
  'needs_source',
];

export const QURAN_TEXT_KEYS = [
  'text_uthmani',
  'text_ar',
  'quran_text',
  'ayah_text',
  'uthmani',
];

export const ARABIC_FIELD_NAMES = new Set([
  'name_ar',
  'title_ar',
  'summary_ar',
  'short_title_ar',
  'evidence_note_ar',
  'reviewer_note',
  'scholar_note',
  'corrected_event_title',
  'proposed_title_ar',
  'description_ar',
  'disclaimer_ar',
  'note_ar',
  'network_conclusion_ar',
  'caution_note',
  'lessons_ar',
  'name_ar',
]);

/** Latin letter immediately after Arabic letters (e.g. الخضr). */
export const ARABIC_THEN_LATIN = /[\u0600-\u06FF][a-zA-Z]/;

/** Any Latin letter in a string. */
export const HAS_LATIN = /[a-zA-Z]/;

export const MOJIBAKE_PATTERNS = [/Ã./, /Â./, /\uFFFD/, /â€/];

export function containsQuranTextPayload(obj, path = '') {
  if (!obj || typeof obj !== 'object') return [];
  const hits = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (QURAN_TEXT_KEYS.includes(key)) hits.push(nextPath);
    if (value && typeof value === 'object') {
      hits.push(...containsQuranTextPayload(value, nextPath));
    }
  }
  return hits;
}

export function canProposeApproved(entry, mapping) {
  const decision = String(entry.scholar_decision ?? '').trim();
  const finalStatus = String(entry.final_recommended_status ?? '').trim();
  const sourceId = String(entry.source_id ?? mapping.source_id ?? '').trim();
  const scholarNote = String(entry.scholar_note ?? mapping.scholar_note ?? '').trim();
  const confidence = entry.evidence_confidence ?? mapping.evidence_confidence;

  if (decision !== 'approve_after_source_check') return false;
  if (finalStatus !== 'approved') return false;
  if (!sourceId) return false;
  if (!scholarNote) return false;
  if (confidence === 'needs_review' || !confidence) return false;

  const sid = Number(mapping.surah_id);
  const aFrom = Number(mapping.ayah_from);
  const aTo = Number(mapping.ayah_to ?? mapping.ayah_from);
  if (!Number.isInteger(sid) || sid < 1 || sid > 114) return false;
  if (!Number.isInteger(aFrom) || aFrom < 1) return false;
  if (!Number.isInteger(aTo) || aTo < aFrom) return false;

  return true;
}
