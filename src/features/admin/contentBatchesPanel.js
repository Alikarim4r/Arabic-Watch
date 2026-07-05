import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { getAuthModeLabelAr } from '../../lib/authService.js';
import { summarizeBatchValidation } from '../../lib/contentChangeBatchValidation.js';
import { showToast } from '../../components/toast.js';

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
    onSelectBatch,
    onRefreshBatches,
    onToast,
    showConfirmDialog,
  } = ctx;

  const batches = (await repo.getContentChangeBatches?.()) || [];
  const selected = batches.find((b) => b.id === batchSelectedId) || batches[0] || null;
  const validation = selected ? summarizeBatchValidation(selected) : null;

  root.innerHTML = `
    <div class="admin-batches">
      ${isLocalMode ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>` : ''}

      <div class="glass pad admin-export-bar">
        <p class="muted">دفعات الترويج المُتحكَّم بها — لا تُطبَّق تلقائيًا على المحتوى العام.</p>
        <p class="admin-warning">التطبيق لا يغيّر جداول المحتوى مباشرة. يجب توليد SQL ومراجعته ثم تطبيقه يدويًا.</p>
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
      </div>

      <div class="glass pad admin-guidance admin-apply-guidance">
        <h3 class="gold">تطبيق الدفعات المعتمدة</h3>
        <p class="muted">واجهة الإدارة <strong>لا تُعدِّل</strong> جداول الإنتاج (<code>story_*</code>) مباشرة.</p>
        <ol class="admin-apply-steps">
          <li>المراجع يُنشئ دفعة ويُرسلها (<span class="tag warn">submitted</span>).</li>
          <li>المسؤول يعتمد الدفعة (<span class="tag green">approved</span>).</li>
          <li>المهندس يولّد SQL عبر <code>apply_content_change_batch.mjs</code>.</li>
          <li>يُطبَّق SQL يدويًا بعد <code>verify_applied_batch.mjs</code>.</li>
        </ol>
        ${selected ? renderApplyStatusPipeline(selected) : renderApplyStatusPipeline({ status: 'draft' })}
      </div>

      <div class="admin-curation-grid">
        <div class="glass pad admin-main">
          <h3 class="gold">دفعات المحتوى (${batches.length})</h3>
          <div class="admin-queue" id="batch-queue">
            ${batches.length ? batches.map((b) => batchQueueItem(b, selected)).join('') : '<div class="state-box">لا توجد دفعات بعد.</div>'}
          </div>
        </div>

        <div class="glass pad admin-detail" id="batch-detail">
          ${selected ? batchDetailHtml(selected, validation, { isLocalMode, isAdmin, canSubmitBatches }) : '<div class="state-box">اختر دفعة.</div>'}
        </div>
      </div>

      <div class="glass pad admin-export-bar">
        <div class="admin-actions">
          <button type="button" class="btn sm" id="batch-create-sample">إنشاء مسودة (جلسة)</button>
        </div>
        <pre class="admin-patch-preview" id="batch-validation-msg"></pre>
      </div>
    </div>
  `;

  root.querySelectorAll('.batch-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => onSelectBatch(btn.dataset.id));
  });

  root.querySelector('#batch-create-sample')?.addEventListener('click', async () => {
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
    const v = summarizeBatchValidation({ ...samplePayload, id: 'draft-check' });
    const msgEl = root.querySelector('#batch-validation-msg');
    if (!v.valid && samplePayload.status !== 'draft') {
      msgEl.textContent = v.errors.join('\n');
      msgEl.className = 'admin-patch-preview admin-error';
      showToast('فشل التحقق من الدفعة', 'error');
      return;
    }
    const result = await repo.submitContentChangeBatch?.(samplePayload);
    msgEl.textContent = result?.message || 'تم';
    msgEl.className = 'admin-patch-preview admin-ok';
    showToast(result?.message || 'تم إنشاء مسودة', 'success');
    onToast?.(result?.message);
    if (result?.data?.id) onSelectBatch?.(result.data.id);
    else onRefreshBatches?.();
  });

  bindBatchActions(root, selected, { ...ctx, showConfirmDialog });
}

const APPLY_PIPELINE_STEPS = [
  { key: 'draft', label_ar: 'مسودة', label_en: 'draft' },
  { key: 'submitted', label_ar: 'مُرسَل', label_en: 'submitted' },
  { key: 'approved', label_ar: 'معتمد', label_en: 'approved' },
  { key: 'sql_generated', label_ar: 'SQL مُولَّد', label_en: 'SQL generated' },
  { key: 'applied', label_ar: 'مُطبَّق', label_en: 'applied' },
  { key: 'rejected', label_ar: 'مرفوض', label_en: 'rejected' },
];

function pipelineStepIndex(status) {
  const map = { draft: 0, submitted: 1, approved: 2, sql_generated: 3, applied: 4, rejected: 5 };
  return map[status] ?? 0;
}

function renderApplyStatusPipeline(batch) {
  if (batch.status === 'rejected') {
    return `<div class="admin-apply-pipeline rejected"><span class="tag rose">rejected</span></div>`;
  }
  const current = pipelineStepIndex(batch.status);
  const steps = APPLY_PIPELINE_STEPS.filter((s) => s.key !== 'rejected');
  return `
    <div class="admin-apply-pipeline" aria-label="batch lifecycle">
      ${steps
        .map((step, idx) => {
          const done = idx < current || (batch.status === 'applied' && step.key === 'applied');
          const active = idx === current;
          const cls = ['admin-pipeline-step', done ? 'done' : '', active ? 'active' : '', batch.status === 'approved' && step.key === 'sql_generated' ? 'next' : '']
            .filter(Boolean)
            .join(' ');
          return `<span class="${cls}"><span class="admin-pipeline-dot"></span>${escapeHtml(step.label_ar)}<small>${escapeHtml(step.label_en)}</small></span>`;
        })
        .join('')}
    </div>`;
}

function batchQueueItem(batch, selected) {
  const active = selected?.id === batch.id ? ' active' : '';
  const v = summarizeBatchValidation(batch);
  return `
    <button type="button" class="admin-queue-item batch-queue-item${active}" data-id="${escapeHtml(batch.id)}">
      <span class="tag ${batchStatusClass(batch.status)}">${escapeHtml(batch.status)}</span>
      ${v.valid ? '<span class="tag green">valid</span>' : '<span class="tag rose">invalid</span>'}
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
    <label class="qsu-confirm-field">ملاحظة المراجع (مطلوبة للاعتماد/الرفض/applied)
      <textarea id="batch-reviewer-note" rows="2"></textarea>
    </label>
    <h4 class="gold" style="margin-top:16px">Payload preview</h4>
    <pre class="admin-patch-preview">${escapeHtml(preview)}</pre>
    <div class="admin-actions" style="margin-top:14px">
      ${canSubmitBatches && batch.status === 'draft' ? '<button type="button" class="btn sm" data-batch-action="submit">submit</button>' : ''}
      ${isAdmin && batch.status === 'submitted' ? '<button type="button" class="btn sm primary" data-batch-action="approve">approve</button><button type="button" class="btn sm" data-batch-action="reject">reject</button>' : ''}
      ${isAdmin && batch.status === 'approved' ? '<button type="button" class="btn sm" data-batch-action="applied">mark applied</button>' : ''}
    </div>
    <p class="muted" style="margin-top:10px;font-size:13px">${isLocalMode ? 'جلسة محلية — لا تُحدَّث جداول الإنتاج.' : 'الأزرار تسجّل الحالة فقط.'}</p>
    <div style="margin-top:12px">${renderApplyStatusPipeline(batch)}</div>
  `;
}

function batchStatusClass(status) {
  if (status === 'applied') return 'green';
  if (status === 'rejected') return 'rose';
  if (status === 'approved') return 'green';
  return 'warn';
}

function bindBatchActions(root, selected, ctx) {
  if (!selected) return;
  root.querySelectorAll('[data-batch-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.batchAction;
      const statusMap = { submit: 'submitted', approve: 'approved', reject: 'rejected', applied: 'applied' };
      const status = statusMap[action];
      const msgEl = root.querySelector('#batch-validation-msg');
      const note = root.querySelector('#batch-reviewer-note')?.value?.trim() || '';

      const validation = summarizeBatchValidation(selected);
      if (action === 'submit' && !validation.valid) {
        msgEl.textContent = validation.errors.join('\n');
        msgEl.className = 'admin-patch-preview admin-error';
        showToast('لا يمكن إرسال دفعة غير صالحة', 'error');
        return;
      }

      const needsNote = ['approve', 'reject', 'applied'].includes(action);
      if (ctx.showConfirmDialog) {
        const confirmed = await ctx.showConfirmDialog({
          title: 'تأكيد إجراء الدفعة',
          actionLabel: action,
          recordLabel: selected.id,
          currentStatus: selected.status,
          newStatus: status,
          affectsPublicFinal: action === 'approve' || action === 'applied',
          requireNote: needsNote,
        });
        if (!confirmed.confirmed) return;
        if (needsNote && !confirmed.reviewer_note) {
          showToast('ملاحظة المراجع مطلوبة', 'error');
          return;
        }
        const result = await ctx.repo.updateContentChangeBatchStatus?.(
          selected.id,
          status,
          confirmed.reviewer_note || note
        );
        msgEl.textContent = result?.message || result?.error || '—';
        msgEl.className = `admin-patch-preview ${result?.ok ? 'admin-ok' : 'admin-error'}`;
        showToast(result?.message || status, result?.ok ? 'success' : 'error');
        ctx.onRefreshBatches?.();
        return;
      }

      if (needsNote && !note) {
        showToast('ملاحظة المراجع مطلوبة', 'error');
        return;
      }
      const result = await ctx.repo.updateContentChangeBatchStatus?.(selected.id, status, note);
      msgEl.textContent = result?.message || result?.error || '—';
      msgEl.className = `admin-patch-preview ${result?.ok ? 'admin-ok' : 'admin-error'}`;
      ctx.onRefreshBatches?.();
    });
  });
}
