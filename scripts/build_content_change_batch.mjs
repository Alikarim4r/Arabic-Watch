import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const evidencePath = process.argv[2] || join(root, 'examples/evidence_patch.sample.json');
const reviewPath = process.argv[3] || '';
const outPath = process.argv[4] || join(root, 'examples/content_change_batch.sample.json');

const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
/** @type {Object[]} */
let reviewActions = [];
if (reviewPath) {
  const reviewPayload = JSON.parse(readFileSync(reviewPath, 'utf8'));
  reviewActions = reviewPayload.actions || reviewPayload.review_actions || [];
}

const items = (evidence.mappings || []).map((mapping) => ({
  change_type: 'evidence_mapping',
  record_type: 'event',
  event_id: mapping.event_id,
  surah_id: mapping.surah_id,
  ayah_from: mapping.ayah_from,
  ayah_to: mapping.ayah_to,
  relation_type: mapping.relation_type,
  evidence_note_ar: mapping.evidence_note_ar,
  proposed_review_status: mapping.proposed_review_status || 'pending',
  proposed_source_status: mapping.source_id ? 'cited' : 'pending',
  proposed_evidence_status:
    mapping.proposed_review_status === 'approved' ? 'precise_evidence' : 'needs_precise_mapping',
  proposed_evidence_confidence: mapping.evidence_confidence,
  source_id: mapping.source_id || null,
  reviewer_note: mapping.reviewer_note || '',
  promote_as_final: false,
}));

for (const action of reviewActions) {
  items.push({
    change_type: 'review_action',
    record_type: action.contentType || action.record_type,
    record_id: action.contentId || action.record_id,
    action: action.action,
    proposed_review_status: action.nextStatus || action.new_status,
    reviewer_note: action.note || action.reviewer_note || '',
    promote_as_final: false,
  });
}

const batch = {
  meta: {
    version: '1.0.0',
    status: 'sample',
    description_ar:
      'مثال دفعة تغيير محتوى — proposed changes only. NOT applied to production tables automatically.',
    disclaimer_ar: 'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.',
    source_evidence_patch: evidencePath.replace(`${root}/`, ''),
  },
  id: null,
  batch_type: 'evidence_promotion',
  status: 'draft',
  summary: `Proposed batch from evidence patch (${items.length} item(s))`,
  payload: {
    items,
    generated_at: new Date().toISOString(),
  },
  created_by: null,
  approved_by: null,
  applied_by: null,
};

writeFileSync(outPath, JSON.stringify(batch, null, 2), 'utf8');
console.log('PASS build_content_change_batch');
console.log(' evidence:', evidencePath);
console.log(' output :', outPath);
console.log(' items  :', items.length);
