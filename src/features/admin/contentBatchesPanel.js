import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { getAuthModeLabelAr } from '../../lib/authService.js';
import { summarizeBatchValidation } from '../../lib/contentChangeBatchValidation.js';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderContentBatchesPanel(root, ctx) {
  const {
    repo,
    isLocalMode,
    isAdmin,
    canSubmitBatches,
    batchSelectedId,
    onTabChange,
    onSelectBatch,
    onRefreshBatches,
    onToast,
  } = ctx;

  const batches = (await repo.getContentChangeBatches?.()) || [];
  const selected = batches.find((b) => b.id === batchSelectedId) || batches[0] || null;
  const validation = selected ? summarizeBatchValidation(selected) : null;

  root.innerHTML = `
    <div class="admin-batches">
      ${isLocalMode ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>` : ''}
      <div class="admin-tabs">
        <button type="button" class="btn sm" data-tab="review">مراجعة عامة</button>
        <button type="button" class="btn sm" data-tab="curation">Evidence Curation</button>
        <button type="button" class="btn sm primary" data-tab="batches">دفعات المحتوى</button>
      </div>

      <div class="glass pad admin-export-bar">
        <p class="muted">دفعات الترويج المُتحكَّم بها — لا تُطبَّق تلقائيًا على المحتوى العام.</p>
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
      </div>

      <div class="admin-curation-grid">
        <div class="glass pad admin-main">
          <h3 class="gold">دفعات المحتوى (${batches.length})</h3>
          <div class="admin-queue" id="batch-queue">
            ${batches.length ? batches.map((b) => batchQueueItem(b, selected)).join('') : '<p class="muted">لا توجد دفعات بعد — أنشئ واحدة من evidence patch أو JSON.</p>'}
          </div>
        </div>

        <div class="glass pad admin-detail" id="batch-detail">
          ${selected ? batchDetailHtml(selected, validation, { isLocalMode, isAdmin, canSubmitBatches }) : '<p class="muted">اختر دفعة.</p>'}
        </div>
      </div>

      <div class="glass pad admin-export-bar">
        <div class="admin-actions">
          <button type="button" class="btn sm" id="batch-create-sample">إنشاء مسودة من evidence patch (جلسة)</button>
        </div>
        <pre class="admin-patch-preview" id="batch-validation-msg"></pre>
      </div>
    </div>
  `;

  root.querySelector('[data-tab="review"]')?.addEventListener('click', () => onTabChange('review'));
  root.querySelector('[data-tab="curation"]')?.addEventListener('click', () => onTabChange('curation'));

  root.querySelectorAll('.batch-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => onSelectBatch(btn.dataset.id));
  });

  root.querySelector('#batch-create-sample')?.addEventListener('click', async () => {
    const msgEl = root.querySelector('#batch-validation-msg');
    const samplePayload = {
      batch_type: 'evidence_promotion',
      status: 'draft',
      summary: 'Local session sample batch',
      payload: {
        items: [
          {
            change_type: 'evidence_mapping',
            record_type: 'event',
            event_id: 'musa_03__',
            surah_id: 28,
            ayah_from: 22,
            ayah_to: 28,
            relation_type: 'main',
            proposed_review_status: 'pending',
            proposed_evidence_status: 'needs_precise_mapping',
            proposed_evidence_confidence: 'needs_review',
            promote_as_final: false,
          },
        ],
      },
    };
    const result = await repo.submitContentChangeBatch?.(samplePayload);
    msgEl.textContent = result?.message || 'تم';
    msgEl.className = 'admin-patch-preview admin-ok';
    onToast?.(result?.message);
    if (result?.data?.id) onSelectBatch?.(result.data.id);
    else onRefreshBatches?.();
  });

  bindBatchActions(root, selected, ctx);
}

function batchQueueItem(batch, selected) {
  const active = selected?.id === batch.id ? ' active' : '';
  const statusTag = `<span class="tag ${batch.status === 'applied' ? 'green' : batch.status === 'rejected' ? 'rose' : 'warn'}">${escapeHtml(batch.status)}</span>`;
  return `
    <button type="button" class="admin-queue-item batch-queue-item${active}" data-id="${escapeHtml(batch.id)}">
      ${statusTag}
      <strong>${escapeHtml(batch.summary || batch.batch_type || 'batch')}</strong>
      <span class="muted">${escapeHtml(batch.id)}</span>
    </button>`;
}

function batchDetailHtml(batch, validation, { isLocalMode, isAdmin, canSubmitBatches }) {
  const items = batch.payload?.items || [];
  const preview = JSON.stringify(batch.payload || {}, null, 2).slice(0, 4000);
  const validationClass = validation?.valid ? 'admin-ok' : 'admin-error';

  return `
    <h3 class="gold">${escapeHtml(batch.summary || batch.batch_type)}</h3>
    <p>${escapeHtml(batch.batch_type)} · ${escapeHtml(batch.status)} · ${escapeHtml(batch.id)}</p>
    <p class="muted">${items.length} proposed change(s)</p>
    <div class="admin-warning ${validationClass}">${escapeHtml(validation?.summary_ar || '—')}</div>
    ${validation?.errors?.length ? `<ul class="source-list">${validation.errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>` : ''}
    <h4 class="gold" style="margin-top:16px">Payload preview</h4>
    <pre class="admin-patch-preview">${escapeHtml(preview)}</pre>
    <div class="admin-actions" style="margin-top:14px">
      ${canSubmitBatches && ['draft'].includes(batch.status) ? '<button type="button" class="btn sm" data-batch-action="submit">submit</button>' : ''}
      ${isAdmin && batch.status === 'submitted' ? '<button type="button" class="btn sm primary" data-batch-action="approve">approve</button><button type="button" class="btn sm" data-batch-action="reject">reject</button>' : ''}
      ${isAdmin && batch.status === 'approved' ? '<button type="button" class="btn sm" data-batch-action="applied">mark applied</button>' : ''}
    </div>
    <p class="muted" style="margin-top:10px;font-size:13px">${isLocalMode ? 'جلسة محلية — لا تُحدَّث جداول الإنتاج.' : 'الأزرار تسجّل الحالة فقط — التطبيق الفعلي يتطلب job مُتحكَّمًا.'}</p>
  `;
}

function bindBatchActions(root, selected, ctx) {
  if (!selected) return;
  root.querySelectorAll('[data-batch-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.batchAction;
      const statusMap = {
        submit: 'submitted',
        approve: 'approved',
        reject: 'rejected',
        applied: 'applied',
      };
      const status = statusMap[action];
      const msgEl = root.querySelector('#batch-validation-msg');
      const result = await ctx.repo.updateContentChangeBatchStatus?.(selected.id, status, '');
      msgEl.textContent = result?.message || result?.error || '—';
      msgEl.className = `admin-patch-preview ${result?.ok ? 'admin-ok' : 'admin-error'}`;
      ctx.onRefreshBatches?.();
      ctx.onToast?.(result?.message);
      ctx.onTabChange('batches');
    });
  });
}
