/**
 * Controlled apply SQL generation for approved content_change_batches.
 * Never connects to Supabase — SQL file output only.
 */

import {
  itemPassesFinalGate,
  validateContentChangeBatch,
} from '../../src/lib/contentChangeBatchValidation.js';

const ALLOWED_UPDATE_COLUMNS = new Set([
  'review_status',
  'source_status',
  'evidence_status',
  'evidence_confidence',
  'source_id',
  'reviewer_note',
  'updated_at',
]);

const ALLOWED_TABLES = new Set(['story_nodes', 'story_events', 'themes', 'event_ayahs']);

/**
 * @param {unknown} value
 */
export function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * @param {Object} batch
 * @param {Object} ctx
 * @param {{ strict?: boolean }} [options]
 */
export function validateBatchForApply(batch, ctx = {}, options = {}) {
  const errors = [];
  const warnings = [];

  if (batch.status !== 'approved') {
    errors.push(`batch.status must be approved (got "${batch.status}")`);
  }

  const base = validateContentChangeBatch(batch, ctx);
  errors.push(...base.errors);
  warnings.push(...base.warnings);

  const items = batch.payload?.items || [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prefix = `items[${i}]`;

    if (item.modifies_quran_text || item.text_uthmani || item.quran_text_change) {
      errors.push(`${prefix}: Quran text mutation is forbidden`);
    }

    const proposedReview = item.proposed_review_status || item.review_status;
    const sourceId = String(item.source_id || item.proposed_source_id || '').trim();
    const evidenceStatus = item.proposed_evidence_status || item.evidence_status;
    const evidenceConfidence = item.proposed_evidence_confidence || item.evidence_confidence;

    if (proposedReview === 'approved' || item.promote_as_final) {
      const candidate = {
        review_status: 'approved',
        source_status: item.proposed_source_status || item.source_status || (sourceId ? 'cited' : 'pending'),
        evidence_status: evidenceStatus,
        evidence_confidence: evidenceConfidence,
        record_type: item.record_type,
        event_id: item.event_id,
        node_id: item.node_id,
      };

      if (item.event_id || item.record_type === 'event') {
        candidate.record_type = 'event';
      }

      if (!sourceId) errors.push(`${prefix}: approved apply requires source_id`);
      if (evidenceStatus !== 'precise_evidence') {
        errors.push(`${prefix}: approved apply requires evidence_status=precise_evidence`);
      }
      if (evidenceConfidence === 'needs_review') {
        errors.push(`${prefix}: approved apply rejects evidence_confidence=needs_review`);
      }
      if (sourceId && ctx.sourceIds && !ctx.sourceIds.has(sourceId)) {
        errors.push(`${prefix}: fake/unknown source_id ${sourceId}`);
      }
      if (!itemPassesFinalGate(candidate)) {
        errors.push(`${prefix}: item fails public final gate`);
      }
    }

    if (['pending', 'needs_source'].includes(proposedReview) && item.promote_as_final) {
      errors.push(`${prefix}: cannot promote pending/needs_source content to public-final`);
    }

    if (options.strict && !item.previous_values) {
      warnings.push(`${prefix}: strict mode — previous_values missing (rollback will be partial)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    itemCount: items.length,
  };
}

/**
 * Resolve target governance values for an item.
 * @param {Object} item
 */
function resolveGovernance(item) {
  const sourceId = item.source_id || item.proposed_source_id || null;
  return {
    review_status: item.proposed_review_status || item.review_status || null,
    source_status:
      item.proposed_source_status || item.source_status || (sourceId ? 'cited' : null),
    evidence_status: item.proposed_evidence_status || item.evidence_status || null,
    evidence_confidence: item.proposed_evidence_confidence || item.evidence_confidence || null,
    source_id: sourceId,
    reviewer_note: item.reviewer_note || item.reviewer_note_ar || null,
  };
}

/**
 * @param {Object} batch
 * @param {{ dryRun?: boolean, batchId?: string }} [options]
 */
export function generateApplySql(batch, options = {}) {
  const batchId = options.batchId || batch.id || batch.meta?.batch_id || 'unknown-batch';
  const generatedAt = new Date().toISOString();
  const dryRun = Boolean(options.dryRun);
  const items = batch.payload?.items || [];
  const statements = [];
  const affected = [];

  statements.push('-- SAMPLE / GENERATED APPLY SQL — review before running in production');
  statements.push(`-- batch id: ${batchId}`);
  statements.push(`-- generated at: ${generatedAt}`);
  statements.push(`-- dry run status: ${dryRun ? 'dry-run (report only)' : 'sql-generation'}`);
  statements.push(`-- affected records: ${items.length} item(s)`);
  statements.push('BEGIN;');
  statements.push('');

  for (const item of items) {
    const gov = resolveGovernance(item);
    const recordType = item.record_type || (item.event_id ? 'event' : item.node_id ? 'node' : 'theme');
    const recordId = item.event_id || item.record_id || item.node_id || item.theme_id;

    if (recordType === 'event' && recordId && gov.review_status) {
      const sets = [];
      for (const col of ALLOWED_UPDATE_COLUMNS) {
        if (col === 'updated_at') {
          sets.push(`${col} = now()`);
        } else if (gov[col] != null) {
          sets.push(`${col} = ${sqlLiteral(gov[col])}`);
        }
      }
      if (sets.length) {
        statements.push(`-- event governance: ${recordId}`);
        statements.push(
          `UPDATE public.story_events SET ${sets.join(', ')} WHERE id = ${sqlLiteral(recordId)};`
        );
        affected.push({ table: 'story_events', id: recordId, action: 'update' });
      }
    }

    if (recordType === 'node' && recordId && gov.review_status) {
      const sets = [];
      for (const col of ALLOWED_UPDATE_COLUMNS) {
        if (col === 'updated_at') sets.push(`${col} = now()`);
        else if (gov[col] != null) sets.push(`${col} = ${sqlLiteral(gov[col])}`);
      }
      if (sets.length) {
        statements.push(`-- node governance: ${recordId}`);
        statements.push(
          `UPDATE public.story_nodes SET ${sets.join(', ')} WHERE id = ${sqlLiteral(recordId)};`
        );
        affected.push({ table: 'story_nodes', id: recordId, action: 'update' });
      }
    }

    if (recordType === 'theme' && recordId && gov.review_status) {
      const sets = [];
      for (const col of ALLOWED_UPDATE_COLUMNS) {
        if (col === 'updated_at') sets.push(`${col} = now()`);
        else if (gov[col] != null) sets.push(`${col} = ${sqlLiteral(gov[col])}`);
      }
      if (sets.length) {
        statements.push(`-- theme governance: ${recordId}`);
        statements.push(
          `UPDATE public.themes SET ${sets.join(', ')} WHERE id = ${sqlLiteral(recordId)};`
        );
        affected.push({ table: 'themes', id: recordId, action: 'update' });
      }
    }

    if (item.surah_id && item.ayah_from && item.event_id) {
      const ayahTo = item.ayah_to ?? item.ayah_from;
      const ayahKey = item.ayah_key || `${item.surah_id}:${item.ayah_from}${ayahTo !== item.ayah_from ? `-${ayahTo}` : ''}`;
      statements.push(`-- event_ayah mapping: ${item.event_id} ${ayahKey}`);
      statements.push(`
INSERT INTO public.event_ayahs (
  event_id, surah_id, ayah_from, ayah_to, ayah_key, relation_type, note_ar, evidence_note_ar, source_id, reviewer_note, updated_at
) VALUES (
  ${sqlLiteral(item.event_id)},
  ${sqlLiteral(item.surah_id)},
  ${sqlLiteral(item.ayah_from)},
  ${sqlLiteral(ayahTo)},
  ${sqlLiteral(ayahKey)},
  ${sqlLiteral(item.relation_type || 'main')},
  ${sqlLiteral(item.evidence_note_ar || item.note_ar)},
  ${sqlLiteral(item.evidence_note_ar || item.note_ar)},
  ${sqlLiteral(item.source_id || gov.source_id)},
  ${sqlLiteral(item.reviewer_note)},
  now()
)
ON CONFLICT (event_id, surah_id, ayah_from, ayah_to) DO UPDATE SET
  ayah_key = EXCLUDED.ayah_key,
  relation_type = EXCLUDED.relation_type,
  note_ar = EXCLUDED.note_ar,
  evidence_note_ar = EXCLUDED.evidence_note_ar,
  source_id = EXCLUDED.source_id,
  reviewer_note = EXCLUDED.reviewer_note,
  updated_at = now();`.trim());
      affected.push({
        table: 'event_ayahs',
        id: `${item.event_id}:${ayahKey}`,
        action: 'upsert',
      });
    }
  }

  statements.push('');
  statements.push('-- NOTE: UI does not apply batches — run manually after verify_applied_batch.mjs');
  statements.push('COMMIT;');
  statements.push('');

  return {
    batchId,
    generatedAt,
    dryRun,
    sql: statements.join('\n'),
    affected,
  };
}

/**
 * @param {Object} batch
 * @param {{ batchId?: string }} [options]
 */
export function generateRollbackSql(batch, options = {}) {
  const batchId = options.batchId || batch.id || batch.meta?.batch_id || 'unknown-batch';
  const generatedAt = new Date().toISOString();
  const items = batch.payload?.items || [];
  const warnings = [];
  const statements = [];

  statements.push('-- GENERATED ROLLBACK SQL — review before running');
  statements.push(`-- batch id: ${batchId}`);
  statements.push(`-- generated at: ${generatedAt}`);
  statements.push('BEGIN;');
  statements.push('');

  let partial = false;

  for (const item of items) {
    const prev = item.previous_values;
    const recordType = item.record_type || (item.event_id ? 'event' : 'node');
    const recordId = item.event_id || item.record_id || item.node_id;

    if (!prev) {
      partial = true;
      warnings.push(`Rollback is partial because previous values were not provided for ${recordId || 'item'}.`);
      continue;
    }

    const table =
      recordType === 'event' ? 'story_events' : recordType === 'node' ? 'story_nodes' : 'themes';

    if (recordId && ALLOWED_TABLES.has(table)) {
      const sets = [];
      for (const col of ALLOWED_UPDATE_COLUMNS) {
        if (col === 'updated_at') sets.push(`${col} = now()`);
        else if (col in prev) sets.push(`${col} = ${sqlLiteral(prev[col])}`);
      }
      if (sets.length) {
        statements.push(`-- rollback ${table}: ${recordId}`);
        statements.push(`UPDATE public.${table} SET ${sets.join(', ')} WHERE id = ${sqlLiteral(recordId)};`);
      }
    }

    if (item.surah_id && item.ayah_from && item.event_id && prev.event_ayah_exists === false) {
      statements.push(`-- rollback delete event_ayah inserted by batch`);
      statements.push(
        `DELETE FROM public.event_ayahs WHERE event_id = ${sqlLiteral(item.event_id)} AND surah_id = ${sqlLiteral(item.surah_id)} AND ayah_from = ${sqlLiteral(item.ayah_from)} AND ayah_to = ${sqlLiteral(item.ayah_to ?? item.ayah_from)};`
      );
    }
  }

  if (partial) {
    statements.unshift('-- WARNING: Rollback is partial because previous values were not provided.');
  }

  statements.push('COMMIT;');
  statements.push('');

  return { batchId, generatedAt, sql: statements.join('\n'), warnings, partial };
}

/**
 * Build human-readable apply report.
 * @param {Object} batch
 * @param {Object} validation
 * @param {Object} sqlResult
 */
export function buildApplyReport(batch, validation, sqlResult) {
  const lines = [];
  lines.push(`Batch: ${sqlResult.batchId}`);
  lines.push(`Status: ${batch.status}`);
  lines.push(`Valid for apply: ${validation.valid ? 'YES' : 'NO'}`);
  lines.push(`Items: ${validation.itemCount || 0}`);
  if (validation.errors?.length) {
    lines.push('Errors:');
    validation.errors.forEach((e) => lines.push(`  - ${e}`));
  }
  if (validation.warnings?.length) {
    lines.push('Warnings:');
    validation.warnings.forEach((w) => lines.push(`  - ${w}`));
  }
  if (sqlResult.affected?.length) {
    lines.push('Would change:');
    sqlResult.affected.forEach((a) => lines.push(`  - ${a.table} ${a.id} (${a.action})`));
  }
  return lines.join('\n');
}

export { ALLOWED_UPDATE_COLUMNS, ALLOWED_TABLES };
