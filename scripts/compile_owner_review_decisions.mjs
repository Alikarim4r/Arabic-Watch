import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { OWNER_DECISIONS, canProposeOwnerApproved } from './lib/ownerDecisionConstants.js';
import { parseBatchCliArgs } from './lib/batchCli.mjs';

const { root, input: inputPath, output: outputPath } = parseBatchCliArgs(process.argv, {
  input: 'examples/evidence_patch.all_batches.owner_review_template.json',
  output: 'examples/evidence_patch.all_batches.revised.proposed.json',
});

const { validatePatchEntry, CONFIDENCE_LEVELS } = await import(
  pathToFileURL(`${root}/src/features/admin/evidenceValidation.js`).href
);

const seed = JSON.parse(readFileSync(`${root}/src/data/seed_content.json`, 'utf8'));
const surahs = JSON.parse(readFileSync(`${root}/src/data/surahs.json`, 'utf8')).surahs;
const template = JSON.parse(readFileSync(inputPath, 'utf8'));

const eventIds = new Set((seed.story_events || []).map((e) => e.id));
const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
const validationCtx = { eventIds, sourceIds, surahMaxAyah };

const errors = [];
const warnings = [];
const mappings = [];
const rejectedProposals = [];

function str(v) {
  return String(v ?? '').trim();
}

function normalizeDecision(entry) {
  const d = str(entry.owner_decision);
  if (!d || d === 'undecided') return 'undecided';
  return d;
}

function validateDecision(entry, i) {
  const prefix = `[${i}] ${entry.event_id}`;
  const decision = str(entry.owner_decision);

  if (!OWNER_DECISIONS.includes(decision)) {
    errors.push(`${prefix}: owner_decision غير صالح (${decision || 'missing'})`);
    return false;
  }

  if (decision === 'revise_ayah_range') {
    const sid = entry.corrected_surah_id;
    const from = entry.corrected_ayah_from;
    const to = entry.corrected_ayah_to;
    if (sid == null && from == null && to == null) {
      warnings.push(`${prefix}: revise_ayah_range بدون corrected_* — يُبقى النطاق الأصلي`);
    } else {
      const sidNum = Number(sid);
      const fromNum = Number(from);
      const toNum = Number(to ?? from);
      if (!Number.isInteger(sidNum) || sidNum < 1 || sidNum > 114) {
        errors.push(`${prefix}: corrected_surah_id غير صالح`);
      }
      if (!Number.isInteger(fromNum) || fromNum < 1) {
        errors.push(`${prefix}: corrected_ayah_from غير صالح`);
      }
      if (!Number.isInteger(toNum) || toNum < fromNum) {
        errors.push(`${prefix}: corrected_ayah_to غير صالح`);
      }
      const max = surahMaxAyah.get(sidNum);
      if (max && toNum > max) {
        errors.push(`${prefix}: corrected_ayah_to يتجاوز عدد آيات السورة (${max})`);
      }
    }
  }

  if (decision === 'rename_event' && !str(entry.corrected_event_title)) {
    warnings.push(`${prefix}: rename_event بدون corrected_event_title — لا تغيير عنوان`);
  }

  if (decision === 'split_event' && !str(entry.owner_note)) {
    warnings.push(`${prefix}: split_event بدون owner_note — يُفضّل توثيق تقسيم الحدث`);
  }

  if (decision === 'approve_after_source_check') {
    if (!canProposeOwnerApproved(entry, entry)) {
      warnings.push(`${prefix}: approve_after_source_check — شروط approved غير مكتملة؛ يُبقى pending`);
    }
  }

  return true;
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

function compileEntry(entry) {
  const decision = str(entry.owner_decision);

  if (decision === 'reject_mapping') {
    rejectedProposals.push({
      event_id: entry.event_id,
      batch_id: entry.batch_id,
      owner_decision: decision,
      owner_note: str(entry.owner_note),
      original_surah_id: entry.proposed_surah_id,
      original_ayah_from: entry.proposed_ayah_from,
      original_ayah_to: entry.proposed_ayah_to,
      reviewer_note: str(entry.reviewer_note),
    });
    return null;
  }

  const mapping = buildBaseMapping(entry);

  if (!decision || decision === 'undecided') {
    mapping.compile_status = 'undecided';
    return mapping;
  }

  switch (decision) {
    case 'revise_ayah_range': {
      const sid = entry.corrected_surah_id;
      const from = entry.corrected_ayah_from;
      const to = entry.corrected_ayah_to;
      if (sid != null && from != null) {
        mapping.surah_id = Number(sid);
        mapping.ayah_from = Number(from);
        mapping.ayah_to = Number(to ?? from);
        mapping.compile_status = 'revised_ayah';
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
    warnings.push(`${entry.event_id}: patch validation blocked approval — ${patchValidation.errors.join('; ')}`);
  }

  return mapping;
}

const OWNER_APPROVED_TEMPLATE_STATUSES = new Set(['owner_review_template', 'owner_review_approved_by_owner']);

if (!OWNER_APPROVED_TEMPLATE_STATUSES.has(template.meta?.status)) {
  errors.push('input meta.status يجب أن يكون owner_review_template أو owner_review_approved_by_owner');
}

const inputMappings = template.mappings || [];
if (!inputMappings.length) {
  errors.push('لا توجد mappings في القالب');
}

inputMappings.forEach((entry, i) => {
  if (!entry.event_id || !eventIds.has(entry.event_id)) {
    errors.push(`[${i}] event_id غير موجود في seed: ${entry.event_id}`);
    return;
  }
  validateDecision(entry, i);
  const compiled = compileEntry(entry);
  if (compiled) mappings.push(compiled);
});

if (errors.length) {
  console.log('FAIL compile_owner_review_decisions', inputPath);
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}

const approvedCount = mappings.filter((m) => m.proposed_review_status === 'approved').length;

const output = {
  meta: {
    version: '1.0.0',
    status: 'revised_proposed',
    batch_id: 'evidence_mapping_all_batches',
    description_ar:
      'مسودة مُجمّعة من قرارات المالك — ليست محتوى معتمدًا. لا تُطبّق تلقائيًا على seed أو Supabase.',
    source_review_template: inputPath.replace(`${root}/`, ''),
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
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

warnings.forEach((w) => console.log('WARN', w));
console.log('NOTE revised patch — not applied to seed or precise_event_evidence.json');
console.log('PASS compile_owner_review_decisions');
console.log(' input :', inputPath);
console.log(' output:', outputPath);
console.log(' mappings:', mappings.length, '| rejected:', rejectedProposals.length, '| approved_proposed:', approvedCount);
process.exit(0);
