import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { containsQuranTextPayload, OWNER_DECISIONS } from './lib/ownerDecisionConstants.js';
import { parseBatchCliArgs } from './lib/batchCli.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { input: templatePath, proposed: proposedPathArg } = parseBatchCliArgs(process.argv, {
  input: 'examples/evidence_patch.all_batches.owner_review_template.json',
  proposed: 'examples/evidence_patch.all_batches.proposed.json',
});

const template = JSON.parse(readFileSync(templatePath, 'utf8'));
const proposedPath =
  proposedPathArg ||
  (template.meta?.source_proposed_patch
    ? join(root, String(template.meta.source_proposed_patch).replace(/^\//, ''))
    : join(root, 'examples/evidence_patch.all_batches.proposed.json'));

if (!existsSync(proposedPath)) {
  console.log('FAIL validate_owner_review_template — proposed patch not found:', proposedPath);
  process.exit(1);
}

const seed = JSON.parse(readFileSync(`${root}/src/data/seed_content.json`, 'utf8'));
const surahs = JSON.parse(readFileSync(`${root}/src/data/surahs.json`, 'utf8')).surahs;
const proposed = JSON.parse(readFileSync(proposedPath, 'utf8'));

const { CONFIDENCE_LEVELS, PROPOSED_REVIEW_STATUSES } = await import(
  pathToFileURL(`${root}/src/features/admin/evidenceValidation.js`).href
);

const { isFinalContent } = await import(pathToFileURL(`${root}/src/lib/dataService.js`).href);

const eventIds = new Set((seed.story_events || []).map((e) => e.id));
const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
const proposedEventIds = new Set((proposed.mappings || []).map((m) => m.event_id));
const needsMappingIds = new Set(
  (seed.story_events || []).filter((e) => e.evidence_status === 'needs_precise_mapping').map((e) => e.id)
);
const expectedCount = 48;

const errors = [];
const mappings = template.mappings || [];

const OWNER_APPROVED_STATUSES = new Set(['owner_review_template', 'owner_review_approved_by_owner']);

if (!OWNER_APPROVED_STATUSES.has(template.meta?.status)) {
  errors.push('meta.status يجب أن يكون owner_review_template أو owner_review_approved_by_owner');
}

if (!Array.isArray(mappings) || mappings.length !== expectedCount) {
  errors.push(`يجب أن يحتوي القالب على ${expectedCount} mappings (found ${mappings.length})`);
}

if (proposed.meta?.total_mappings !== expectedCount) {
  errors.push(`proposed patch total_mappings يجب أن يكون ${expectedCount}`);
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

  if (!needsMappingIds.has(entry.event_id)) {
    errors.push(`${prefix}: event_id ليس needs_precise_mapping في seed`);
  }

  if (!proposedEventIds.has(entry.event_id)) {
    errors.push(`${prefix}: event_id غير موجود في consolidated proposed patch`);
  }

  if (seen.has(entry.event_id)) {
    errors.push(`${prefix}: duplicate event_id`);
  }
  seen.add(entry.event_id);

  const decision = String(entry.owner_decision ?? '').trim();
  if (!OWNER_DECISIONS.includes(decision)) {
    errors.push(`${prefix}: owner_decision غير صالح (${decision || 'missing'})`);
  }

  const finalStatus = String(entry.final_recommended_status ?? '').trim();
  if (finalStatus && !PROPOSED_REVIEW_STATUSES.includes(finalStatus)) {
    errors.push(`${prefix}: final_recommended_status غير صالح (${finalStatus})`);
  }

  const isOwnerApprovedPack = template.meta?.status === 'owner_review_approved_by_owner';

  if (entry.proposed_review_status === 'approved' && !isOwnerApprovedPack) {
    errors.push(`${prefix}: proposed_review_status لا يجوز أن يكون approved في القالب`);
  }

  if (isOwnerApprovedPack && entry.proposed_review_status === 'approved') {
    if (decision !== 'approve_after_source_check') {
      errors.push(`${prefix}: owner approved pack requires owner_decision=approve_after_source_check`);
    }
    if (finalStatus !== 'approved') {
      errors.push(`${prefix}: owner approved pack requires final_recommended_status=approved`);
    }
  }

  if (finalStatus === 'approved') {
    const sourceId = String(entry.source_id || '').trim();
    if (!sourceId) {
      errors.push(`${prefix}: final_recommended_status=approved يتطلب source_id`);
    } else if (!sourceIds.has(sourceId)) {
      errors.push(`${prefix}: source_id غير موجود (${sourceId})`);
    }
    if (!String(entry.owner_note || '').trim()) {
      errors.push(`${prefix}: final_recommended_status=approved يتطلب owner_note`);
    }
    if (entry.evidence_confidence === 'needs_review') {
      errors.push(`${prefix}: final_recommended_status=approved لا يجوز مع evidence_confidence=needs_review`);
    }
    if (!CONFIDENCE_LEVELS.includes(entry.evidence_confidence)) {
      errors.push(`${prefix}: evidence_confidence غير صالح`);
    }
    const sid = Number(entry.proposed_surah_id);
    const from = Number(entry.proposed_ayah_from);
    const to = Number(entry.proposed_ayah_to ?? from);
    if (!Number.isInteger(sid) || !Number.isInteger(from) || !Number.isInteger(to)) {
      errors.push(`${prefix}: approved item requires valid proposed ayah range`);
    }
  }

  if (decision === 'approve_after_source_check' && finalStatus === 'approved') {
    if (!String(entry.source_id || '').trim()) {
      errors.push(`${prefix}: approve_after_source_check مع approved يتطلب source_id`);
    }
    if (!String(entry.owner_note || '').trim()) {
      errors.push(`${prefix}: approve_after_source_check مع approved يتطلب owner_note`);
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

  if (finalStatus === 'approved' && decision !== 'approve_after_source_check') {
    errors.push(`${prefix}: final_recommended_status=approved يتطلب owner_decision=approve_after_source_check`);
  }
});

for (const id of needsMappingIds) {
  if (!seen.has(id)) {
    errors.push(`missing mapping for needs_precise_mapping event_id: ${id}`);
  }
}

for (const id of proposedEventIds) {
  if (!seen.has(id)) {
    errors.push(`missing template row for proposed event_id: ${id}`);
  }
}

const batchEvents = (seed.story_events || []).filter((e) => proposedEventIds.has(e.id));
const wronglyApproved = batchEvents.filter((e) => e.review_status === 'approved');
if (wronglyApproved.length) {
  errors.push(`seed contains approved batch events: ${wronglyApproved.map((e) => e.id).join(', ')}`);
}

const autoApproved = mappings.filter((m) => {
  if (template.meta?.status === 'owner_review_approved_by_owner') {
    return (
      String(m.final_recommended_status || '').trim() === 'approved' &&
      String(m.owner_decision || '').trim() !== 'approve_after_source_check'
    );
  }
  return (
    m.proposed_review_status === 'approved' ||
    (String(m.final_recommended_status || '').trim() === 'approved' && !String(m.owner_decision || '').trim())
  );
});
if (autoApproved.length) {
  errors.push(`template must not auto-approve items: ${autoApproved.map((m) => m.event_id).join(', ')}`);
}

const finalSafe = (seed.story_events || []).filter((e) => isFinalContent(e));
if (finalSafe.length !== 6) {
  errors.push(`public-final count must remain 6 (found ${finalSafe.length})`);
}

if (errors.length) {
  console.log('FAIL validate_owner_review_template', templatePath);
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}

console.log(
  template.meta?.status === 'owner_review_approved_by_owner'
    ? 'NOTE owner approved pack — explicit owner decisions; not applied to seed'
    : 'NOTE owner review template — owner fields blank; not production content'
);
console.log('PASS validate_owner_review_template', templatePath.replace(`${root}/`, ''));
console.log('proposed:', proposedPath.replace(`${root}/`, ''));
console.log('mappings:', mappings.length);
process.exit(0);
