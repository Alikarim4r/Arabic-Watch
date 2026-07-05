/** Owner review workspace — shared browser + Node compile/validate logic. */

import { CONFIDENCE_LEVELS, validatePatchEntry } from './evidenceValidation.js';

export const OWNER_REVIEW_STORAGE_KEY = 'qsu_owner_review_decisions';
export const OWNER_TEMPLATE_PATH = './data/owner_review/all_batches.owner_review_template.json';

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

export const OWNER_DECISION_OPTIONS = [
  'undecided',
  'approve_after_source_check',
  'revise_ayah_range',
  'rename_event',
  'split_event',
  'reject_mapping',
  'needs_source',
];

export const DECISIONS_REQUIRING_OWNER_NOTE = new Set([
  'approve_after_source_check',
  'reject_mapping',
  'split_event',
  'rename_event',
]);

/** Arabic validation status messages for owner review UI */
export const VALIDATION_MESSAGES_AR = {
  undecided: 'لم يتم اتخاذ قرار بعد',
  missing_source_id: 'يحتاج مصدر',
  missing_owner_note: 'يحتاج ملاحظة المالك',
  invalid_ayah_range: 'يحتاج تصحيح نطاق الآيات',
  cannot_approve_yet: 'لا يمكن الاعتماد قبل اكتمال الشروط',
  valid_compile_only: 'صالح للتجميع كمقترح فقط',
  rejected_proposal: 'مرفوض كمقترح — ليس اعتمادًا نهائيًا',
  invalid: 'قرار غير صالح',
};

export const DECISION_LABELS_AR = {
  undecided: 'لم يُحدَّد',
  approve_after_source_check: 'موافقة بعد التحقق من المصدر',
  revise_ayah_range: 'تصحيح نطاق الآيات',
  rename_event: 'إعادة تسمية الحدث',
  split_event: 'تقسيم الحدث',
  reject_mapping: 'رفض الربط',
  needs_source: 'يحتاج مصدر',
};

export const OWNER_BACKUP_WARNING_AR =
  'قرارات المراجعة محفوظة محليًا في هذا المتصفح. يرجى تصدير JSON بشكل دوري حتى لا تضيع القرارات.';

export const OWNER_BROWSER_TIP_AR =
  'موصى به: Google Chrome أو Microsoft Edge — وضع ملء الشاشة على سطح المكتب. تجنّب نافذة المعاينة الصغيرة في Cursor للمراجعة الكاملة.';

export const OWNER_EXPORT_SAFETY_WARNINGS_AR = [
  'لا يُطبَّق شيء على المحتوى من هذه الواجهة.',
  'لا يصبح أي قرار نهائيًا للعرض العام تلقائيًا.',
  'قرار approve_after_source_check يتطلب لاحقًا Content Batch ثم Controlled Apply.',
  'بدون source_id لا يمكن الاعتماد.',
  'بدون owner_note لا يمكن الاعتماد.',
];

/**
 * @param {{ status?: string, messageAr?: string }} preview
 */
export function getValidationMessageAr(preview) {
  if (preview?.messageAr) return preview.messageAr;
  const map = {
    undecided: VALIDATION_MESSAGES_AR.undecided,
    'missing source_id': VALIDATION_MESSAGES_AR.missing_source_id,
    'missing owner_note': VALIDATION_MESSAGES_AR.missing_owner_note,
    'invalid ayah range': VALIDATION_MESSAGES_AR.invalid_ayah_range,
    'cannot approve yet': VALIDATION_MESSAGES_AR.cannot_approve_yet,
    valid: VALIDATION_MESSAGES_AR.valid_compile_only,
    'rejected proposal': VALIDATION_MESSAGES_AR.rejected_proposal,
    invalid: VALIDATION_MESSAGES_AR.invalid,
  };
  return map[preview?.status] || preview?.status || '';
}

function str(v) {
  return String(v ?? '').trim();
}

function numOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {Object} entry
 * @param {Object} [mapping]
 */
export function canProposeOwnerApproved(entry, mapping = entry) {
  const decision = str(entry.owner_decision);
  const finalStatus = str(entry.final_recommended_status);
  const sourceId = str(entry.source_id ?? mapping.source_id);
  const ownerNote = str(entry.owner_note ?? mapping.owner_note);
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

/**
 * @param {Object} entry
 * @param {{ surahMaxAyah?: Map<number, number> }} ctx
 */
export function validateCorrectedAyahRange(entry, ctx = {}) {
  const errors = [];
  const sid = numOrNull(entry.corrected_surah_id);
  const from = numOrNull(entry.corrected_ayah_from);
  const to = numOrNull(entry.corrected_ayah_to ?? entry.corrected_ayah_from);

  if (sid == null || from == null) {
    errors.push('corrected_surah_id و corrected_ayah_from مطلوبان');
    return { valid: false, errors };
  }
  if (!Number.isInteger(sid) || sid < 1 || sid > 114) errors.push('corrected_surah_id غير صالح');
  if (!Number.isInteger(from) || from < 1) errors.push('corrected_ayah_from غير صالح');
  if (!Number.isInteger(to) || to < from) errors.push('corrected_ayah_to غير صالح');
  const max = ctx.surahMaxAyah?.get(sid);
  if (max && to > max) errors.push(`corrected_ayah_to يتجاوز عدد آيات السورة (${max})`);
  return { valid: errors.length === 0, errors };
}

/**
 * @param {Object} entry
 * @param {{ sourceIds?: Set<string>, surahMaxAyah?: Map<number, number> }} ctx
 */
export function getEntryValidationPreview(entry, ctx = {}) {
  const decision = str(entry.owner_decision) || 'undecided';
  const issues = [];

  if (!decision || decision === 'undecided') {
    return {
      status: 'undecided',
      messageAr: VALIDATION_MESSAGES_AR.undecided,
      issues: [],
      canApprove: false,
      readyForCompile: true,
      invalid: false,
    };
  }

  if (decision === 'reject_mapping') {
    if (!str(entry.owner_note)) {
      return {
        status: 'missing owner_note',
        messageAr: VALIDATION_MESSAGES_AR.missing_owner_note,
        issues: ['owner_note مطلوب لـ reject_mapping'],
        canApprove: false,
        readyForCompile: false,
        invalid: true,
      };
    }
    return {
      status: 'rejected proposal',
      messageAr: VALIDATION_MESSAGES_AR.rejected_proposal,
      issues: [],
      canApprove: false,
      readyForCompile: true,
      invalid: false,
    };
  }

  if (decision === 'needs_source') {
    return {
      status: 'valid',
      messageAr: VALIDATION_MESSAGES_AR.valid_compile_only,
      issues: [],
      canApprove: false,
      readyForCompile: true,
      invalid: false,
    };
  }

  if (decision === 'revise_ayah_range') {
    const ayah = validateCorrectedAyahRange(entry, ctx);
    if (!ayah.valid) {
      return {
        status: 'invalid ayah range',
        messageAr: VALIDATION_MESSAGES_AR.invalid_ayah_range,
        issues: ayah.errors,
        canApprove: false,
        readyForCompile: false,
        invalid: true,
      };
    }
    return {
      status: 'valid',
      messageAr: VALIDATION_MESSAGES_AR.valid_compile_only,
      issues: [],
      canApprove: false,
      readyForCompile: true,
      invalid: false,
    };
  }

  if (DECISIONS_REQUIRING_OWNER_NOTE.has(decision) && !str(entry.owner_note)) {
    return {
      status: 'missing owner_note',
      messageAr: VALIDATION_MESSAGES_AR.missing_owner_note,
      issues: ['owner_note مطلوب'],
      canApprove: false,
      readyForCompile: false,
      invalid: true,
    };
  }

  if (decision === 'approve_after_source_check') {
    if (!str(entry.source_id)) {
      issues.push('source_id مطلوب');
    }
    if (!str(entry.owner_note)) {
      issues.push('owner_note مطلوب');
    }
    if (str(entry.final_recommended_status) === 'approved' && !canProposeOwnerApproved(entry, entry)) {
      issues.push('cannot approve yet');
    }
    const sourceId = str(entry.source_id);
    if (sourceId && ctx.sourceIds && !ctx.sourceIds.has(sourceId)) {
      issues.push(`source_id غير موجود: ${sourceId}`);
    }
    let status = 'valid';
    let messageAr = VALIDATION_MESSAGES_AR.valid_compile_only;
    if (issues.some((i) => i.includes('source_id'))) {
      status = 'missing source_id';
      messageAr = VALIDATION_MESSAGES_AR.missing_source_id;
    } else if (issues.some((i) => i.includes('owner_note'))) {
      status = 'missing owner_note';
      messageAr = VALIDATION_MESSAGES_AR.missing_owner_note;
    } else if (issues.some((i) => i.includes('cannot approve'))) {
      status = 'cannot approve yet';
      messageAr = VALIDATION_MESSAGES_AR.cannot_approve_yet;
    } else if (issues.length) {
      status = 'invalid';
      messageAr = VALIDATION_MESSAGES_AR.invalid;
    }

    return {
      status,
      messageAr,
      issues,
      canApprove: canProposeOwnerApproved(entry, entry),
      readyForCompile: issues.length === 0 || status === 'cannot approve yet',
      invalid: issues.length > 0 && status !== 'cannot approve yet',
    };
  }

  if (decision === 'rename_event' && !str(entry.corrected_event_title)) {
    return {
      status: 'invalid',
      messageAr: VALIDATION_MESSAGES_AR.invalid,
      issues: ['corrected_event_title مطلوب لـ rename_event'],
      canApprove: false,
      readyForCompile: false,
      invalid: true,
    };
  }

  return {
    status: 'valid',
    messageAr: VALIDATION_MESSAGES_AR.valid_compile_only,
    issues: [],
    canApprove: false,
    readyForCompile: true,
    invalid: false,
  };
}

/**
 * @param {Object[]} mappings
 * @param {{ sourceIds?: Set<string>, surahMaxAyah?: Map<number, number> }} ctx
 */
export function summarizeWorkspaceStats(mappings, ctx = {}) {
  const counts = {
    total: mappings.length,
    undecided: 0,
    approve_after_source_check: 0,
    revise_ayah_range: 0,
    rename_event: 0,
    split_event: 0,
    reject_mapping: 0,
    rejected: 0,
    needs_source: 0,
    invalid: 0,
    readyForCompilation: 0,
    notReady: 0,
    requiresOwnerAction: 0,
  };

  mappings.forEach((entry) => {
    const decision = str(entry.owner_decision) || 'undecided';
    if (decision === 'undecided' || !decision) counts.undecided += 1;
    else if (decision === 'reject_mapping') {
      counts.reject_mapping += 1;
      counts.rejected += 1;
    } else if (counts[decision] !== undefined) counts[decision] += 1;

    const preview = getEntryValidationPreview(entry, ctx);
    if (preview.invalid) counts.invalid += 1;
    if (preview.readyForCompile && !preview.invalid) counts.readyForCompilation += 1;
    else if (preview.invalid) counts.notReady += 1;
    if (decision === 'undecided' || preview.invalid) counts.requiresOwnerAction += 1;
  });

  return counts;
}

/**
 * @param {Object} baseTemplate
 * @param {Record<string, Object>} overrides
 */
export function mergeOwnerDecisions(baseTemplate, overrides = {}) {
  const mappings = (baseTemplate.mappings || []).map((base) => {
    const o = overrides[base.event_id];
    if (!o) return { ...base };
    return {
      ...base,
      owner_decision: o.owner_decision ?? base.owner_decision,
      corrected_surah_id: o.corrected_surah_id ?? base.corrected_surah_id,
      corrected_ayah_from: o.corrected_ayah_from ?? base.corrected_ayah_from,
      corrected_ayah_to: o.corrected_ayah_to ?? base.corrected_ayah_to,
      corrected_event_title: o.corrected_event_title ?? base.corrected_event_title,
      source_id: o.source_id ?? base.source_id,
      owner_note: o.owner_note ?? base.owner_note,
      final_recommended_status: o.final_recommended_status ?? base.final_recommended_status,
    };
  });
  return { meta: { ...baseTemplate.meta }, mappings };
}

export function readOwnerDecisionStore() {
  if (typeof localStorage === 'undefined') return { overrides: {}, savedAt: null };
  try {
    const raw = JSON.parse(localStorage.getItem(OWNER_REVIEW_STORAGE_KEY) || '{}');
    return {
      overrides: raw.overrides || {},
      savedAt: raw.savedAt || null,
      baseHash: raw.baseHash || null,
    };
  } catch {
    return { overrides: {}, savedAt: null };
  }
}

export function writeOwnerDecisionStore(overrides, meta = {}) {
  if (typeof localStorage === 'undefined') return null;
  const savedAt = new Date().toISOString();
  const payload = { overrides, savedAt, ...meta };
  localStorage.setItem(OWNER_REVIEW_STORAGE_KEY, JSON.stringify(payload));
  return savedAt;
}

/**
 * @param {Object} entry
 */
export function extractOwnerFields(entry) {
  return {
    owner_decision: str(entry.owner_decision) || 'undecided',
    corrected_surah_id: numOrNull(entry.corrected_surah_id),
    corrected_ayah_from: numOrNull(entry.corrected_ayah_from),
    corrected_ayah_to: numOrNull(entry.corrected_ayah_to),
    corrected_event_title: str(entry.corrected_event_title),
    source_id: str(entry.source_id),
    owner_note: str(entry.owner_note),
    final_recommended_status: str(entry.final_recommended_status),
  };
}

/**
 * @param {Object[]} mappings
 * @param {Object} filters
 */
export function filterOwnerMappings(mappings, filters = {}) {
  const q = str(filters.q).toLowerCase();
  const batchId = str(filters.batchId);
  const decision = str(filters.decision);
  const risk = str(filters.riskLevel);
  const validity = str(filters.validity);
  const ctx = filters.ctx || {};

  return mappings.filter((entry) => {
    if (batchId && entry.batch_id !== batchId) return false;
    if (decision) {
      const d = str(entry.owner_decision) || 'undecided';
      if (d !== decision) return false;
    }
    if (risk && entry.risk_level !== risk) return false;

    const preview = getEntryValidationPreview(entry, ctx);
    if (validity === 'valid' && preview.invalid) return false;
    if (validity === 'invalid' && !preview.invalid) return false;

    if (q) {
      const ayah = formatAyahRange(entry);
      const hay = [
        entry.event_id,
        entry.title_ar,
        entry.node_name_ar,
        entry.batch_id,
        ayah,
        entry.evidence_note_ar,
        entry.reviewer_note,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function formatAyahRange(entry) {
  const sid = entry.proposed_surah_id ?? entry.surah_id;
  const from = entry.proposed_ayah_from ?? entry.ayah_from;
  const to = entry.proposed_ayah_to ?? entry.ayah_to ?? from;
  return from === to ? `${sid}:${from}` : `${sid}:${from}-${to}`;
}

export function formatCorrectedAyahRange(entry) {
  const sid = entry.corrected_surah_id;
  const from = entry.corrected_ayah_from;
  const to = entry.corrected_ayah_to ?? from;
  if (sid == null || from == null) return '';
  return from === to ? `${sid}:${from}` : `${sid}:${from}-${to}`;
}

function normalizeDecision(entry) {
  const d = str(entry.owner_decision);
  if (!d || d === 'undecided') return 'undecided';
  return d;
}

function buildBaseMapping(entry) {
  const surahId = Number(entry.proposed_surah_id ?? entry.surah_id);
  const ayahFrom = Number(entry.proposed_ayah_from ?? entry.ayah_from);
  const ayahTo = Number(entry.proposed_ayah_to ?? entry.ayah_to ?? ayahFrom);
  return {
    event_id: entry.event_id,
    batch_id: entry.batch_id,
    surah_id: surahId,
    ayah_from: ayahFrom,
    ayah_to: ayahTo,
    relation_type: entry.relation_type,
    evidence_note_ar: str(entry.evidence_note_ar),
    evidence_confidence: entry.evidence_confidence || 'needs_review',
    source_id: str(entry.source_id),
    reviewer_note: str(entry.reviewer_note),
    owner_decision: normalizeDecision(entry),
    owner_note: str(entry.owner_note),
    proposed_title_ar: '',
    compile_status: 'unchanged',
    proposed_review_status: 'pending',
  };
}

function compileEntry(entry, validationCtx) {
  const decision = str(entry.owner_decision);

  if (decision === 'reject_mapping') {
    return {
      rejected: {
        event_id: entry.event_id,
        batch_id: entry.batch_id,
        owner_decision: decision,
        owner_note: str(entry.owner_note),
        original_surah_id: entry.proposed_surah_id,
        original_ayah_from: entry.proposed_ayah_from,
        original_ayah_to: entry.proposed_ayah_to,
        reviewer_note: str(entry.reviewer_note),
      },
      mapping: null,
    };
  }

  const mapping = buildBaseMapping(entry);

  if (!decision || decision === 'undecided') {
    mapping.compile_status = 'undecided';
    return { rejected: null, mapping };
  }

  switch (decision) {
    case 'revise_ayah_range': {
      const sid = entry.corrected_surah_id;
      const from = entry.corrected_ayah_from;
      const to = entry.corrected_ayah_to;
      if (sid != null && from != null) {
        const ayahCheck = validateCorrectedAyahRange(entry, validationCtx);
        if (ayahCheck.valid) {
          mapping.surah_id = Number(sid);
          mapping.ayah_from = Number(from);
          mapping.ayah_to = Number(to ?? from);
          mapping.compile_status = 'revised_ayah';
        }
      }
      break;
    }
    case 'rename_event': {
      const title = str(entry.corrected_event_title);
      if (title) {
        mapping.proposed_title_ar = title;
        mapping.compile_status = 'revised_title';
      }
      break;
    }
    case 'needs_source':
      mapping.proposed_review_status = 'needs_source';
      mapping.compile_status = 'needs_source';
      break;
    case 'split_event':
      mapping.compile_status = 'split_required';
      mapping.proposed_review_status = 'pending';
      break;
    case 'approve_after_source_check':
      if (canProposeOwnerApproved(entry, mapping)) {
        mapping.proposed_review_status = 'approved';
        mapping.source_id = str(entry.source_id);
        mapping.evidence_confidence = entry.evidence_confidence;
        mapping.compile_status = 'approved_proposed';
      } else {
        mapping.compile_status = 'approve_blocked';
        mapping.proposed_review_status = 'pending';
      }
      break;
    default:
      break;
  }

  if (mapping.proposed_review_status === 'approved' && !canProposeOwnerApproved(entry, mapping)) {
    mapping.proposed_review_status = 'pending';
    mapping.compile_status = 'approve_blocked';
  }

  if (!CONFIDENCE_LEVELS.includes(mapping.evidence_confidence)) {
    mapping.evidence_confidence = 'needs_review';
    mapping.proposed_review_status = 'pending';
    mapping.compile_status = 'approve_blocked';
  }

  const patchValidation = validatePatchEntry(mapping, validationCtx);
  if (!patchValidation.valid) {
    mapping.proposed_review_status = 'pending';
    if (mapping.compile_status === 'approved_proposed') {
      mapping.compile_status = 'approve_blocked';
    }
  }

  return { rejected: null, mapping };
}

/**
 * @param {Object} template
 * @param {{ eventIds?: Set<string>, sourceIds?: Set<string>, surahMaxAyah?: Map<number, number> }} validationCtx
 */
export function compileOwnerReviewDecisions(template, validationCtx = {}) {
  const inputMappings = template.mappings || [];
  const mappings = [];
  const rejectedProposals = [];
  const warnings = [];

  inputMappings.forEach((entry) => {
    const preview = getEntryValidationPreview(entry, validationCtx);
    if (preview.invalid) {
      warnings.push(`${entry.event_id}: validation blocked compile — ${preview.issues.join('; ')}`);
    }
    const { rejected, mapping } = compileEntry(entry, validationCtx);
    if (rejected) rejectedProposals.push(rejected);
    else if (mapping) mappings.push(mapping);
  });

  const approvedCount = mappings.filter((m) => m.proposed_review_status === 'approved').length;

  return {
    meta: {
      version: '1.0.0',
      status: 'revised_proposed',
      batch_id: 'evidence_mapping_all_batches',
      description_ar:
        'مسودة مُجمّعة من قرارات المالك — ليست محتوى معتمدًا. لا تُطبّق تلقائيًا على seed أو Supabase.',
      source_review_template: 'examples/evidence_patch.all_batches.owner_review_template.json',
      compiled_at: new Date().toISOString(),
      compiler_version: '1.0.0',
      summary: {
        total_input: inputMappings.length,
        included_mappings: mappings.length,
        rejected_proposals: rejectedProposals.length,
        undecided: mappings.filter((m) => m.owner_decision === 'undecided').length,
        approved_proposed: approvedCount,
      },
      rejected_proposals: rejectedProposals,
      disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
    },
    mappings,
    warnings,
    approvedCount,
  };
}

/**
 * @param {Object} template
 */
export function buildOwnerReviewExportTemplate(template) {
  const mappings = (template.mappings || []).map((entry) => {
    const exportEntry = { ...entry };
    const preview = getEntryValidationPreview(entry, {});
    if (
      str(exportEntry.final_recommended_status) === 'approved' &&
      !canProposeOwnerApproved(entry, entry)
    ) {
      exportEntry.final_recommended_status = '';
    }
    if (str(exportEntry.proposed_review_status) === 'approved') {
      exportEntry.proposed_review_status = 'pending';
    }
    return exportEntry;
  });

  return {
    meta: {
      ...template.meta,
      status: 'owner_review_template',
      exported_at: new Date().toISOString(),
      exported_from: 'owner_review_workspace',
    },
    mappings,
  };
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * @param {Object} template
 */
export function buildOwnerReviewCsv(template) {
  const header = [
    'batch_id',
    'event_id',
    'node',
    'title',
    'proposed_ayah_range',
    'relation_type',
    'risk_level',
    'caution',
    'owner_decision',
    'corrected_ayah_range',
    'source_id',
    'owner_note',
    'final_recommended_status',
  ];
  const rows = (template.mappings || []).map((m) =>
    [
      m.batch_id,
      m.event_id,
      m.node_name_ar,
      m.title_ar,
      formatAyahRange(m),
      m.relation_type,
      m.risk_level,
      m.overlap_warning || m.reviewer_note,
      str(m.owner_decision) || 'undecided',
      formatCorrectedAyahRange(m),
      m.source_id,
      m.owner_note,
      m.final_recommended_status,
    ]
      .map(csvEscape)
      .join(',')
  );
  return `${header.join(',')}\n${rows.join('\n')}\n`;
}

/**
 * @param {Object} template
 * @param {{ sourceIds?: Set<string>, surahMaxAyah?: Map<number, number> }} ctx
 */
export function validateOwnerReviewTemplateForExport(template, ctx = {}) {
  const errors = [];
  const mappings = template.mappings || [];
  const seen = new Set();

  if (mappings.length !== 48) {
    errors.push(`يجب أن يحتوي القالب على 48 mappings (found ${mappings.length})`);
  }

  mappings.forEach((entry, i) => {
    const prefix = `[${i}] ${entry.event_id}`;
    if (!entry.event_id) errors.push(`${prefix}: event_id مطلوب`);
    if (seen.has(entry.event_id)) errors.push(`${prefix}: duplicate event_id`);
    seen.add(entry.event_id);

    const decision = str(entry.owner_decision);
    if (decision && !OWNER_DECISIONS.includes(decision)) {
      errors.push(`${prefix}: owner_decision غير صالح`);
    }
    if (str(entry.proposed_review_status) === 'approved') {
      errors.push(`${prefix}: لا يجوز auto-approve في القالب`);
    }
    if (str(entry.final_recommended_status) === 'approved' && !canProposeOwnerApproved(entry, entry)) {
      errors.push(`${prefix}: final_recommended_status=approved بدون استيفاء الشروط`);
    }
    const preview = getEntryValidationPreview(entry, ctx);
    if (preview.invalid) {
      errors.push(`${prefix}: ${preview.issues.join('; ')}`);
    }
  });

  return { valid: errors.length === 0, errors };
}
