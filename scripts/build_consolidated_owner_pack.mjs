#!/usr/bin/env node
/**
 * Build consolidated owner review pack from Batches 1–5 proposed patches.
 * Outputs: proposed JSON, owner template, CSV, and optional markdown docs.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getRiskMeta } from './lib/consolidatedRiskMeta.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_FILES = [
  'examples/evidence_patch.batch_01.proposed.json',
  'examples/evidence_patch.batch_02.proposed.json',
  'examples/evidence_patch.batch_03.proposed.json',
  'examples/evidence_patch.batch_04.proposed.json',
  'examples/evidence_patch.batch_05.proposed.json',
];

const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const eventById = new Map((seed.story_events || []).map((e) => [e.id, e]));
const nodeById = new Map((seed.story_nodes || []).map((n) => [n.id, n]));

const consolidatedMappings = [];
const seen = new Set();

for (const rel of BATCH_FILES) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    console.error('FAIL missing batch file:', rel);
    process.exit(1);
  }
  const batch = JSON.parse(readFileSync(path, 'utf8'));
  const batchId = batch.meta?.batch_id || rel;
  for (const m of batch.mappings || []) {
    if (seen.has(m.event_id)) {
      console.error('FAIL duplicate event_id across batches:', m.event_id);
      process.exit(1);
    }
    seen.add(m.event_id);
    consolidatedMappings.push({
      ...m,
      batch_id: batchId,
      proposed_review_status: 'pending',
      evidence_confidence: m.evidence_confidence || 'needs_review',
      source_id: m.source_id || '',
    });
  }
}

const needsIds = (seed.story_events || [])
  .filter((e) => e.evidence_status === 'needs_precise_mapping')
  .map((e) => e.id);
const missing = needsIds.filter((id) => !seen.has(id));
const extra = [...seen].filter((id) => !needsIds.includes(id));
if (missing.length || extra.length) {
  console.error('FAIL coverage mismatch', { missing, extra });
  process.exit(1);
}

consolidatedMappings.sort((a, b) => {
  const ea = eventById.get(a.event_id);
  const eb = eventById.get(b.event_id);
  const na = `${ea?.node_id || ''}-${ea?.event_order ?? 0}`;
  const nb = `${eb?.node_id || ''}-${eb?.event_order ?? 0}`;
  return na.localeCompare(nb);
});

const proposedOut = {
  meta: {
    version: '1.0.0',
    status: 'consolidated_proposed',
    batch_id: 'evidence_mapping_all_batches',
    description_ar:
      'مسودة موحّدة — Sprint Batches 1–5 (48 حدثًا). ليست محتوى معتمدًا. لا تُدمج دون مراجعة المالك.',
    total_mappings: consolidatedMappings.length,
    source_batches: BATCH_FILES,
    exported_at: new Date().toISOString(),
    disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
  },
  mappings: consolidatedMappings.map(({ batch_id, ...m }) => m),
};

const templateMappings = consolidatedMappings.map((m) => {
  const ev = eventById.get(m.event_id);
  const node = ev ? nodeById.get(ev.node_id) : null;
  const risk = getRiskMeta(m.event_id);
  return {
    batch_id: m.batch_id,
    event_id: m.event_id,
    node_id: ev?.node_id || '',
    node_name_ar: node?.name_ar || ev?.node_id || '',
    title_ar: ev?.title_ar || '',
    summary_ar: ev?.summary_ar || '',
    proposed_surah_id: m.surah_id,
    proposed_ayah_from: m.ayah_from,
    proposed_ayah_to: m.ayah_to,
    relation_type: m.relation_type,
    evidence_note_ar: m.evidence_note_ar,
    reviewer_note: m.reviewer_note,
    evidence_confidence: m.evidence_confidence,
    proposed_review_status: 'pending',
    risk_level: risk.risk_level,
    overlap_warning: risk.overlap_warning,
    owner_decision: '',
    corrected_surah_id: null,
    corrected_ayah_from: null,
    corrected_ayah_to: null,
    corrected_event_title: '',
    source_id: '',
    owner_note: '',
    final_recommended_status: '',
  };
});

const templateOut = {
  meta: {
    version: '1.0.0',
    status: 'owner_review_template',
    batch_id: 'evidence_mapping_all_batches',
    description_ar: 'قالب مراجعة المالك — كل الدفعات (48). املأ الحقول الفارغة يدويًا.',
    source_proposed_patch: 'examples/evidence_patch.all_batches.proposed.json',
    total_mappings: templateMappings.length,
    disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
  },
  mappings: templateMappings,
};

function ayahRange(m) {
  const to = m.proposed_ayah_to ?? m.ayah_to ?? m.proposed_ayah_from ?? m.ayah_from;
  const from = m.proposed_ayah_from ?? m.ayah_from;
  const sid = m.proposed_surah_id ?? m.surah_id;
  return from === to ? `${sid}:${from}` : `${sid}:${from}-${to}`;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const csvHeader = [
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

const csvRows = templateMappings.map((m) =>
  [
    m.batch_id,
    m.event_id,
    m.node_name_ar,
    m.title_ar,
    ayahRange(m),
    m.relation_type,
    m.risk_level,
    m.overlap_warning || m.reviewer_note,
    '',
    '',
    '',
    '',
    '',
  ]
    .map(csvEscape)
    .join(',')
);

const csvOut = `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`;

writeFileSync(join(root, 'examples/evidence_patch.all_batches.proposed.json'), `${JSON.stringify(proposedOut, null, 2)}\n`);
writeFileSync(
  join(root, 'examples/evidence_patch.all_batches.owner_review_template.json'),
  `${JSON.stringify(templateOut, null, 2)}\n`
);
writeFileSync(join(root, 'examples/evidence_patch.all_batches.owner_review.csv'), csvOut);

const browserTemplateDir = join(root, 'src/data/owner_review');
mkdirSync(browserTemplateDir, { recursive: true });
writeFileSync(
  join(browserTemplateDir, 'all_batches.owner_review_template.json'),
  `${JSON.stringify(templateOut, null, 2)}\n`
);

console.log('PASS build_consolidated_owner_pack');
console.log(' mappings:', consolidatedMappings.length);
console.log(' proposed:', 'examples/evidence_patch.all_batches.proposed.json');
console.log(' template:', 'examples/evidence_patch.all_batches.owner_review_template.json');
console.log(' csv:', 'examples/evidence_patch.all_batches.owner_review.csv');
