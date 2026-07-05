import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath =
  process.argv[2] || join(root, 'examples/evidence_patch.batch_01.review_template.json');
const proposedPath = join(root, 'examples/evidence_patch.batch_01.proposed.json');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;
const template = JSON.parse(readFileSync(templatePath, 'utf8'));
const proposed = JSON.parse(readFileSync(proposedPath, 'utf8'));

const { CONFIDENCE_LEVELS, PROPOSED_REVIEW_STATUSES } = await import(
  pathToFileURL(join(root, 'src/features/admin/evidenceValidation.js')).href
);

const SCHOLAR_DECISIONS = [
  '',
  'approve_after_source_check',
  'revise_ayah_range',
  'split_event',
  'rename_event',
  'reject_mapping',
  'needs_source',
];

const QURAN_TEXT_KEYS = [
  'text_uthmani',
  'text_ar',
  'quran_text',
  'ayah_text',
  'text',
  'uthmani',
];

const eventIds = new Set((seed.story_events || []).map((e) => e.id));
const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
const proposedEventIds = new Set((proposed.mappings || []).map((m) => m.event_id));

const errors = [];
const mappings = template.mappings || [];

if (template.meta?.status !== 'review_template') {
  errors.push('meta.status يجب أن يكون review_template');
}

if (!Array.isArray(mappings) || mappings.length !== 10) {
  errors.push('يجب أن يحتوي القالب على 10 mappings');
}

function containsQuranTextPayload(obj, path = '') {
  if (!obj || typeof obj !== 'object') return [];
  const hits = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (QURAN_TEXT_KEYS.includes(key)) {
      hits.push(nextPath);
    }
    if (value && typeof value === 'object') {
      hits.push(...containsQuranTextPayload(value, nextPath));
    }
  }
  return hits;
}

const quranTextHits = containsQuranTextPayload(template);
if (quranTextHits.length) {
  errors.push(`لا يجوز تضمين نص قرآني في القالب: ${quranTextHits.join(', ')}`);
}

const seen = new Set();

mappings.forEach((entry, i) => {
  const prefix = `[${i}] ${entry.event_id || '?'}`;

  if (!entry.event_id) {
    errors.push(`${prefix}: event_id مطلوب`);
    return;
  }

  if (!eventIds.has(entry.event_id)) {
    errors.push(`${prefix}: event_id غير موجود في seed`);
  }

  if (!proposedEventIds.has(entry.event_id)) {
    errors.push(`${prefix}: event_id غير موجود في proposed patch Batch 1`);
  }

  if (seen.has(entry.event_id)) {
    errors.push(`${prefix}: duplicate event_id`);
  }
  seen.add(entry.event_id);

  const decision = String(entry.scholar_decision ?? '').trim();
  if (!SCHOLAR_DECISIONS.includes(decision)) {
    errors.push(`${prefix}: scholar_decision غير صالح (${decision || 'missing'})`);
  }

  const finalStatus = String(entry.final_recommended_status ?? '').trim();
  if (finalStatus && !PROPOSED_REVIEW_STATUSES.includes(finalStatus)) {
    errors.push(`${prefix}: final_recommended_status غير صالح (${finalStatus})`);
  }

  if (entry.proposed_review_status === 'approved') {
    errors.push(`${prefix}: proposed_review_status لا يجوز أن يكون approved في القالب`);
  }

  if (finalStatus === 'approved') {
    const sourceId = String(entry.source_id || '').trim();
    if (!sourceId) {
      errors.push(`${prefix}: final_recommended_status=approved يتطلب source_id`);
    } else if (!sourceIds.has(sourceId)) {
      errors.push(`${prefix}: source_id غير موجود (${sourceId})`);
    }
    if (entry.evidence_confidence === 'needs_review') {
      errors.push(`${prefix}: final_recommended_status=approved لا يجوز مع evidence_confidence=needs_review`);
    }
    if (!CONFIDENCE_LEVELS.includes(entry.evidence_confidence)) {
      errors.push(`${prefix}: evidence_confidence غير صالح`);
    }
  }

  if (decision === 'revise_ayah_range') {
    const sid = entry.corrected_surah_id;
    const from = entry.corrected_ayah_from;
    const to = entry.corrected_ayah_to;
    if (sid != null || from != null || to != null) {
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

  if (decision === 'approve_after_source_check' && finalStatus === 'approved' && !String(entry.source_id || '').trim()) {
    errors.push(`${prefix}: approve_after_source_check مع approved يتطلب source_id`);
  }
});

for (const id of proposedEventIds) {
  if (!seen.has(id)) {
    errors.push(`missing mapping for proposed event_id: ${id}`);
  }
}

const batchEvents = (seed.story_events || []).filter((e) => proposedEventIds.has(e.id));
const wronglyApproved = batchEvents.filter((e) => e.review_status === 'approved');
if (wronglyApproved.length) {
  errors.push(`seed contains approved Batch 1 events: ${wronglyApproved.map((e) => e.id).join(', ')}`);
}

if (errors.length) {
  console.log('FAIL validate_scholar_review_template', templatePath);
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}

console.log('NOTE review template — scholar fields blank; not production content');
console.log('PASS validate_scholar_review_template', templatePath);
console.log('mappings:', mappings.length);
process.exit(0);
