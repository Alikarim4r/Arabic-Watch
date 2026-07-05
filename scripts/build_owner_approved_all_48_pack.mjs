#!/usr/bin/env node
/**
 * Build owner-approved pack for all 48 evidence mappings.
 * Generates approved decision file + content batch (files only — no apply).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE_ID = 'quran_direct_reference';
const OWNER_NOTE_AR =
  'تمت مراجعة المالك للربط المقترح واعتماده كربط آيات مباشر، مع بقاء النص القرآني الكامل غير مستورد بعد.';
const BATCH_ID = 'owner-approved-all-48-001';

const templatePath = join(root, 'examples/evidence_patch.all_batches.owner_review_template.json');
const proposedPath = join(root, 'examples/evidence_patch.all_batches.proposed.json');
const approvedOut = join(root, 'examples/evidence_patch.all_batches.owner_review.approved_by_owner.json');
const revisedOut = join(root, 'examples/evidence_patch.all_batches.owner_approved.revised.json');
const batchOut = join(root, 'examples/content_change_batch.owner_approved_all_48.json');

const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const template = JSON.parse(readFileSync(templatePath, 'utf8'));
const proposed = JSON.parse(readFileSync(proposedPath, 'utf8'));
const proposedByEvent = new Map((proposed.mappings || []).map((m) => [m.event_id, m]));
const eventById = new Map((seed.story_events || []).map((e) => [e.id, e]));
const ayahByEvent = new Map((seed.event_ayahs || []).map((a) => [a.event_id, a]));

const sourceExists = (seed.tafsir_sources || []).some((s) => s.id === SOURCE_ID);
if (!sourceExists) {
  console.error('FAIL missing source_id in seed:', SOURCE_ID);
  process.exit(1);
}

const approvedMappings = (template.mappings || []).map((row) => {
  const prop = proposedByEvent.get(row.event_id);
  if (!prop) {
    console.error('FAIL missing proposed mapping for', row.event_id);
    process.exit(1);
  }
  return {
    ...row,
    owner_decision: 'approve_after_source_check',
    final_recommended_status: 'approved',
    source_id: SOURCE_ID,
    owner_note: OWNER_NOTE_AR,
    evidence_confidence: 'quran_explicit',
    proposed_review_status: 'approved',
    corrected_surah_id: null,
    corrected_ayah_from: null,
    corrected_ayah_to: null,
    corrected_event_title: '',
  };
});

const approvedDoc = {
  meta: {
    ...template.meta,
    status: 'owner_review_approved_by_owner',
    description_ar:
      'قرارات المالك المعتمدة — 48 ربطًا. ملف للتجميع ودفعة المحتوى فقط. لم يُطبَّق على seed أو Supabase.',
    approved_at: new Date().toISOString(),
    approved_by: 'project_owner',
    source_id: SOURCE_ID,
    evidence_confidence: 'quran_explicit',
    total_approved: approvedMappings.length,
    disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
  },
  mappings: approvedMappings,
};

writeFileSync(approvedOut, `${JSON.stringify(approvedDoc, null, 2)}\n`);

const batchItems = approvedMappings.map((row) => {
  const prop = proposedByEvent.get(row.event_id);
  const ev = eventById.get(row.event_id);
  const existingAyah = ayahByEvent.get(row.event_id);
  const surahId = Number(row.proposed_surah_id ?? prop.surah_id);
  const ayahFrom = Number(row.proposed_ayah_from ?? prop.ayah_from);
  const ayahTo = Number(row.proposed_ayah_to ?? prop.ayah_to ?? ayahFrom);
  const ayahKey =
    ayahFrom === ayahTo ? `${surahId}:${ayahFrom}` : `${surahId}:${ayahFrom}-${ayahTo}`;

  return {
    change_type: 'evidence_mapping',
    record_type: 'event',
    event_id: row.event_id,
    surah_id: surahId,
    ayah_from: ayahFrom,
    ayah_to: ayahTo,
    ayah_key: ayahKey,
    relation_type: prop.relation_type || row.relation_type || 'main',
    evidence_note_ar: prop.evidence_note_ar || row.evidence_note_ar,
    proposed_review_status: 'approved',
    proposed_source_status: 'cited',
    proposed_evidence_status: 'precise_evidence',
    proposed_evidence_confidence: 'quran_explicit',
    source_id: SOURCE_ID,
    reviewer_note: OWNER_NOTE_AR,
    owner_note: OWNER_NOTE_AR,
    promote_as_final: false,
    previous_values: {
      review_status: ev?.review_status ?? 'pending',
      source_status: ev?.source_status ?? 'pending',
      evidence_status: ev?.evidence_status ?? 'needs_precise_mapping',
      evidence_confidence: ev?.evidence_confidence ?? 'needs_review',
      source_id: ev?.source_id ?? null,
      reviewer_note: ev?.reviewer_note ?? null,
      event_ayah_exists: Boolean(existingAyah),
    },
  };
});

const batchDoc = {
  meta: {
    version: '1.0.0',
    status: 'owner_approved',
    batch_id: BATCH_ID,
    description_ar:
      'دفعة معتمدة من المالك — 48 ربط دليل. للمراجعة اليدوية والتطبيق المُتحكَّم به فقط.',
    source_owner_approved: 'examples/evidence_patch.all_batches.owner_review.approved_by_owner.json',
    disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
  },
  id: BATCH_ID,
  batch_type: 'evidence_mapping_owner_approval',
  status: 'approved',
  summary: 'Owner-approved evidence mappings for all 48 previously unmapped events',
  payload: {
    items: batchItems,
    generated_at: new Date().toISOString(),
    owner_approved_count: batchItems.length,
    excluded_count: 0,
  },
  created_by: 'project_owner',
  approved_by: 'project_owner',
  applied_by: null,
  approved_at: new Date().toISOString(),
};

writeFileSync(batchOut, `${JSON.stringify(batchDoc, null, 2)}\n`);

console.log('PASS build_owner_approved_all_48_pack');
console.log(' approved decisions:', approvedOut.replace(`${root}/`, ''));
console.log(' content batch    :', batchOut.replace(`${root}/`, ''));
console.log(' mappings         :', approvedMappings.length);
console.log(' source_id        :', SOURCE_ID);
console.log(' NOTE: run validate + compile + apply scripts separately');
