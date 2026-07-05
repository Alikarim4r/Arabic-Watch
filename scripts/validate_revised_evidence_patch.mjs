import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { containsQuranTextPayload, canProposeApproved } from './lib/scholarDecisionConstants.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const patchPath =
  process.argv[2] || join(root, 'examples/evidence_patch.batch_01.revised.proposed.json');

const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;
const patch = JSON.parse(readFileSync(patchPath, 'utf8'));

const { validatePatchFile, validatePatchEntry } = await import(
  pathToFileURL(join(root, 'src/features/admin/evidenceValidation.js')).href
);

const eventIds = new Set((seed.story_events || []).map((e) => e.id));
const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
const ctx = { eventIds, sourceIds, surahMaxAyah };

const errors = [];
const mappings = patch.mappings || [];
const rejected = patch.meta?.rejected_proposals || [];

if (patch.meta?.status !== 'revised_proposed') {
  errors.push('meta.status يجب أن يكون revised_proposed');
}

const quranHits = containsQuranTextPayload(patch);
if (quranHits.length) {
  errors.push(`لا يجوز تضمين نص قرآني: ${quranHits.join(', ')}`);
}

if (!mappings.length && !rejected.length) {
  errors.push('لا توجد mappings ولا rejected_proposals');
}

const patchResult = validatePatchFile(mappings.length ? mappings : [{ event_id: '_placeholder', surah_id: 1, ayah_from: 1, ayah_to: 1, relation_type: 'main', evidence_confidence: 'needs_review', proposed_review_status: 'pending' }], ctx);
if (mappings.length && !patchResult.valid) {
  errors.push(...patchResult.errors);
}

mappings.forEach((entry, i) => {
  const prefix = `[${i}] ${entry.event_id}`;

  if (!eventIds.has(entry.event_id)) {
    errors.push(`${prefix}: event_id غير موجود في seed`);
  }

  if (entry.proposed_review_status === 'approved') {
    if (!canProposeApproved(
      {
        scholar_decision: entry.scholar_decision,
        final_recommended_status: 'approved',
        source_id: entry.source_id,
        scholar_note: entry.scholar_note,
        evidence_confidence: entry.evidence_confidence,
      },
      entry
    )) {
      errors.push(`${prefix}: auto-approved item missing required scholar gates`);
    }
    if (!String(entry.scholar_note || '').trim()) {
      errors.push(`${prefix}: approved item requires scholar_note`);
    }
    if (!String(entry.source_id || '').trim()) {
      errors.push(`${prefix}: approved item requires source_id`);
    }
    if (entry.evidence_confidence === 'needs_review') {
      errors.push(`${prefix}: approved item cannot have needs_review confidence`);
    }
  }

  if (entry.compile_status === 'approve_blocked' && entry.proposed_review_status === 'approved') {
    errors.push(`${prefix}: compile_status=approve_blocked but status is approved`);
  }

  if (entry.proposed_title_ar && typeof entry.proposed_title_ar !== 'string') {
    errors.push(`${prefix}: proposed_title_ar must be string (proposed only)`);
  }
});

rejected.forEach((r, i) => {
  if (r.proposed_review_status === 'approved') {
    errors.push(`[rejected ${i}] rejected mapping cannot be approved`);
  }
});

const batch01Ids = new Set(
  JSON.parse(
    readFileSync(join(root, 'examples/evidence_patch.batch_01.proposed.json'), 'utf8')
  ).mappings.map((m) => m.event_id)
);

const wronglyApprovedInSeed = (seed.story_events || []).filter(
  (e) => batch01Ids.has(e.id) && e.review_status === 'approved'
);
if (wronglyApprovedInSeed.length) {
  errors.push(`Batch 1 seed events must not be approved: ${wronglyApprovedInSeed.map((e) => e.id).join(', ')}`);
}

const autoApprovedWithoutScholar = mappings.filter(
  (m) =>
    m.proposed_review_status === 'approved' &&
    (m.scholar_decision === 'undecided' || !String(m.scholar_decision || '').trim())
);
if (autoApprovedWithoutScholar.length) {
  errors.push(`inferred approval without scholar decision: ${autoApprovedWithoutScholar.map((m) => m.event_id).join(', ')}`);
}

if (errors.length) {
  console.log('FAIL validate_revised_evidence_patch', patchPath);
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}

console.log('NOTE revised proposed patch — not production content; not applied');
console.log('PASS validate_revised_evidence_patch', patchPath);
console.log('mappings:', mappings.length, '| rejected:', rejected.length);
process.exit(0);
