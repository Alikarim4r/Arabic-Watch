#!/usr/bin/env node
/**
 * Node tests for Owner Review Workspace logic (browser-shared module).
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const {
  compileOwnerReviewDecisions,
  mergeOwnerDecisions,
  filterOwnerMappings,
  getEntryValidationPreview,
  buildOwnerReviewExportTemplate,
  validateOwnerReviewTemplateForExport,
  canProposeOwnerApproved,
  readOwnerDecisionStore,
  writeOwnerDecisionStore,
  OWNER_REVIEW_STORAGE_KEY,
} = await import(pathToFileURL(`${root}/src/features/admin/ownerReviewLogic.js`).href);

const { isFinalContent } = await import(pathToFileURL(`${root}/src/lib/dataService.js`).href);

const templatePath = join(root, 'examples/evidence_patch.all_batches.owner_review_template.json');
const browserTemplatePath = join(root, 'src/data/owner_review/all_batches.owner_review_template.json');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;

const template = JSON.parse(readFileSync(templatePath, 'utf8'));
const browserTemplate = JSON.parse(readFileSync(browserTemplatePath, 'utf8'));

const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
const ctx = { sourceIds, surahMaxAyah };

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.log('FAIL', msg);
    failed += 1;
  } else {
    console.log('PASS', msg);
  }
}

assert(template.mappings.length === 48, 'template has 48 mappings');
assert(browserTemplate.mappings.length === 48, 'browser template has 48 mappings');
assert(
  browserTemplate.meta.status === 'owner_review_template',
  'browser template meta.status is owner_review_template'
);

const filtered = filterOwnerMappings(template.mappings, { batchId: 'evidence_mapping_sprint_01', ctx });
assert(filtered.length === 10, 'batch filter returns 10 for sprint 01');

const highRisk = filterOwnerMappings(template.mappings, { riskLevel: 'high', ctx });
assert(highRisk.length >= 1, 'risk filter returns high-risk items');

const undecidedCompiled = compileOwnerReviewDecisions(template, ctx);
assert(undecidedCompiled.mappings.length === 48, 'compile with blank decisions keeps 48 mappings');
assert(undecidedCompiled.approvedCount === 0, 'compile with blank decisions has 0 approved');

const blockedApprove = {
  ...template.mappings[0],
  owner_decision: 'approve_after_source_check',
  source_id: 'quran_text',
  owner_note: 'test',
  final_recommended_status: 'approved',
};
assert(!canProposeOwnerApproved(blockedApprove, blockedApprove), 'cannot approve with needs_review confidence');

const invalidRevise = {
  ...template.mappings[0],
  owner_decision: 'revise_ayah_range',
  corrected_surah_id: 2,
  corrected_ayah_from: 999,
  corrected_ayah_to: 1000,
};
const invalidPreview = getEntryValidationPreview(invalidRevise, ctx);
assert(invalidPreview.invalid, 'revise_ayah_range with invalid range is invalid');

const exportDoc = buildOwnerReviewExportTemplate(template);
const exportValidation = validateOwnerReviewTemplateForExport(exportDoc, ctx);
assert(exportValidation.valid, 'export template validates for blank decisions');

const publicFinal = (seed.story_events || []).filter((e) => isFinalContent(e));
assert(publicFinal.length === 6, 'public-final count remains 6');

const storeKey = OWNER_REVIEW_STORAGE_KEY;
assert(storeKey === 'qsu_owner_review_decisions', 'localStorage key is defined');

if (failed) {
  console.log(`\nFAILED ${failed} assertion(s)`);
  process.exit(1);
}
console.log('\nPASS test_owner_review_workspace');
