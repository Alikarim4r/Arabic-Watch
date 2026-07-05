/**
 * Shared content change batch validation (browser + Node parity).
 */

const VALID_STATUSES = ['draft', 'submitted', 'approved', 'applied', 'rejected'];
const VALIDATION_STATUSES = ['draft', 'submitted'];

/**
 * @param {Object} item
 */
export function itemPassesFinalGate(item) {
  if (item.review_status !== 'approved') return false;
  if (!item.source_status || ['none', 'needs_source'].includes(item.source_status)) return false;
  if (item.record_type === 'event' || item.node_id != null || item.event_id != null) {
    if (item.evidence_status !== 'precise_evidence') return false;
    if (item.evidence_confidence === 'needs_review') return false;
  }
  return true;
}

/**
 * @param {Object} batch
 * @param {{ sourceIds?: Set<string>, eventIds?: Set<string>, surahMaxAyah?: Map<number, number> }} [ctx]
 */
export function validateContentChangeBatch(batch, ctx = {}) {
  const errors = [];
  const warnings = [];

  if (!batch || typeof batch !== 'object') {
    return { valid: false, errors: ['Batch must be a JSON object'], warnings };
  }

  const status = batch.status || 'draft';
  if (!VALID_STATUSES.includes(status)) {
    errors.push(`Invalid batch status: ${status}`);
  }

  if (!batch.batch_type) errors.push('batch_type is required');
  if (!batch.payload || typeof batch.payload !== 'object') errors.push('payload object is required');

  const items = batch.payload?.items || batch.payload?.changes || [];
  if (!Array.isArray(items)) {
    errors.push('payload.items must be an array');
    return { valid: false, errors, warnings };
  }

  if (VALIDATION_STATUSES.includes(status) && items.length === 0) {
    errors.push('draft/submitted batches must include at least one proposed change');
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prefix = `items[${i}]`;

    if (item.modifies_quran_text || item.text_uthmani || item.quran_text_change) {
      errors.push(`${prefix}: Quran text changes are forbidden in content batches`);
    }

    const sourceId = String(item.source_id || item.proposed_source_id || '').trim();
    const proposedReview = item.proposed_review_status || item.review_status;
    const evidenceStatus = item.proposed_evidence_status || item.evidence_status;
    const evidenceConfidence = item.proposed_evidence_confidence || item.evidence_confidence;

    if (sourceId && ctx.sourceIds && !ctx.sourceIds.has(sourceId)) {
      errors.push(`${prefix}: unknown source_id ${sourceId}`);
    }

    if (proposedReview === 'approved' || item.promote_as_final) {
      const candidate = {
        review_status: proposedReview || item.review_status,
        source_status: item.proposed_source_status || item.source_status || (sourceId ? 'cited' : 'pending'),
        evidence_status: evidenceStatus,
        evidence_confidence: evidenceConfidence,
        record_type: item.record_type,
        node_id: item.node_id,
        event_id: item.event_id,
      };

      if (item.event_id || item.record_type === 'event') {
        candidate.record_type = 'event';
        if (evidenceStatus !== 'precise_evidence') {
          errors.push(`${prefix}: approved/final items require evidence_status=precise_evidence`);
        }
        if (evidenceConfidence === 'needs_review') {
          errors.push(`${prefix}: approved/final items cannot use evidence_confidence=needs_review`);
        }
      }

      if (!sourceId && proposedReview === 'approved') {
        errors.push(`${prefix}: approved items require source_id`);
      }

      if (!itemPassesFinalGate(candidate)) {
        errors.push(`${prefix}: item fails public final gate requirements`);
      }
    }

    const sid = Number(item.surah_id);
    const aFrom = Number(item.ayah_from);
    const aTo = Number(item.ayah_to ?? item.ayah_from);
    if (item.surah_id != null) {
      if (!Number.isInteger(sid) || sid < 1 || sid > 114) {
        errors.push(`${prefix}: invalid surah_id`);
      }
      if (Number.isInteger(aFrom) && ctx.surahMaxAyah?.get(sid) && aTo > ctx.surahMaxAyah.get(sid)) {
        errors.push(`${prefix}: ayah_to exceeds surah ayah count`);
      }
    }

    if (item.event_id && ctx.eventIds && !ctx.eventIds.has(item.event_id)) {
      errors.push(`${prefix}: unknown event_id ${item.event_id}`);
    }
  }

  if (status === 'applied' && !batch.applied_at && !batch._allow_applied_validation) {
    warnings.push('applied batches should only be set by admin controlled promotion jobs');
  }

  return { valid: errors.length === 0, errors, warnings, itemCount: items.length };
}

/**
 * @param {Object} batch
 * @param {Object} [ctx]
 */
export function summarizeBatchValidation(batch, ctx = {}) {
  const result = validateContentChangeBatch(batch, ctx);
  return {
    valid: result.valid,
    errors: result.errors,
    warnings: result.warnings,
    summary_ar: result.valid
      ? `صالح — ${result.itemCount || 0} تغيير(ات) مقترح(ة)`
      : `غير صالح — ${result.errors.length} خطأ`,
  };
}
