/** Shared evidence patch validation rules (browser + Node parity). */

export const RELATION_TYPES = ['main', 'supporting', 'parallel', 'contrast'];
export const CONFIDENCE_LEVELS = ['quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review'];
export const PROPOSED_REVIEW_STATUSES = ['pending', 'approved', 'needs_source'];

/**
 * @param {Object} entry
 * @param {{ eventIds?: Set<string>, sourceIds?: Set<string>, surahMaxAyah?: Map<number, number> }} ctx
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePatchEntry(entry, ctx = {}) {
  const errors = [];

  if (!entry.event_id) errors.push('event_id مطلوب');
  else if (ctx.eventIds && !ctx.eventIds.has(entry.event_id)) {
    errors.push(`event_id غير موجود: ${entry.event_id}`);
  }

  const sid = Number(entry.surah_id);
  if (!Number.isInteger(sid) || sid < 1 || sid > 114) {
    errors.push('surah_id يجب أن يكون بين 1 و 114');
  }

  const aFrom = Number(entry.ayah_from);
  const aTo = Number(entry.ayah_to ?? entry.ayah_from);
  if (!Number.isInteger(aFrom) || aFrom < 1) errors.push('ayah_from يجب أن يكون ≥ 1');
  if (!Number.isInteger(aTo) || aTo < aFrom) errors.push('ayah_to يجب أن يكون ≥ ayah_from');

  if (ctx.surahMaxAyah && sid >= 1 && sid <= 114) {
    const max = ctx.surahMaxAyah.get(sid);
    if (max && aTo > max) errors.push(`ayah_to يتجاوز عدد آيات السورة (${max})`);
  }

  if (!entry.relation_type || !RELATION_TYPES.includes(entry.relation_type)) {
    errors.push('relation_type غير صالح');
  }

  if (!entry.evidence_confidence || !CONFIDENCE_LEVELS.includes(entry.evidence_confidence)) {
    errors.push('evidence_confidence غير صالح');
  }

  if (entry.evidence_confidence === 'quran_explicit') {
    if (!aFrom || !aTo) errors.push('quran_explicit يتطلب نطاق آيات دقيقًا');
  }

  const sourceId = String(entry.source_id || '').trim();
  const proposed = entry.proposed_review_status || 'pending';

  if (!PROPOSED_REVIEW_STATUSES.includes(proposed)) {
    errors.push('proposed_review_status غير صالح');
  }

  if (!sourceId && proposed === 'approved') {
    errors.push('لا يمكن proposed_review_status=approved بدون source_id');
  }

  if (sourceId && ctx.sourceIds && !ctx.sourceIds.has(sourceId)) {
    errors.push(`source_id غير موجود: ${sourceId}`);
  }

  if (proposed === 'approved') {
    if (entry.evidence_confidence === 'needs_review') {
      errors.push('لا يمكن approved مع evidence_confidence=needs_review');
    }
    if (!entry.relation_type || !aFrom || !aTo) {
      errors.push('approved يتطلب precise_evidence مع نطاق آيات صالح');
    }
  }

  if (!sourceId && !['pending', 'needs_source'].includes(proposed)) {
    errors.push('بدون source_id يجب أن يبقى pending أو needs_source');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {Object[]} mappings
 * @param {Object} ctx
 */
export function validatePatchFile(mappings, ctx = {}) {
  const errors = [];
  const seen = new Set();

  if (!Array.isArray(mappings) || !mappings.length) {
    return { valid: false, errors: ['لا توجد mappings'] };
  }

  mappings.forEach((entry, i) => {
    const result = validatePatchEntry(entry, ctx);
    if (!result.valid) {
      errors.push(...result.errors.map((e) => `[${i}] ${e}`));
    }
    const key = `${entry.event_id}:${entry.surah_id}:${entry.ayah_from}:${entry.ayah_to}`;
    if (seen.has(key)) errors.push(`[${i}] duplicate mapping key ${key}`);
    seen.add(key);
  });

  return { valid: errors.length === 0, errors };
}

/**
 * @param {Object} entry
 */
export function normalizePatchEntry(entry) {
  return {
    event_id: entry.event_id,
    surah_id: Number(entry.surah_id),
    ayah_from: Number(entry.ayah_from),
    ayah_to: Number(entry.ayah_to ?? entry.ayah_from),
    relation_type: entry.relation_type,
    evidence_note_ar: String(entry.evidence_note_ar || '').trim(),
    evidence_confidence: entry.evidence_confidence,
    source_id: String(entry.source_id || '').trim(),
    reviewer_note: String(entry.reviewer_note || '').trim(),
    proposed_review_status: entry.proposed_review_status || 'pending',
  };
}

/**
 * @param {Object[]} patches
 */
export function buildExportPatch(patches) {
  return {
    meta: {
      version: '1.0.0',
      status: 'proposed',
      description_ar:
        'مسودة ربط أدلة — ليست محتوى معتمدًا. ألحق بـ precise_event_evidence.json بعد المراجعة.',
      exported_at: new Date().toISOString(),
      disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
    },
    mappings: patches.map(normalizePatchEntry),
  };
}

export const EVIDENCE_GUIDANCE_AR = {
  title: 'ضوابط ربط الحدث بالآيات',
  bullets: [
    'لا تربط الحدث بآية إلا إذا كان المعنى واضحًا أو منصوصًا عليه.',
    'إذا كان الربط مستندًا إلى تفسير، اختر tafsir_based.',
    'إذا كان الربط استنتاجيًا، اختر scholarly_inference.',
    'لا تجعل الحالة approved إلا بعد مراجعة بشرية موثوقة.',
    'لا تستخدم أي ربط تقريبي أو آلي.',
  ],
};
