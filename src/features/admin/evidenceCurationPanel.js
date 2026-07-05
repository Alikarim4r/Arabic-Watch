import { escapeHtml } from '../../lib/utils.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { getAuthModeLabelAr } from '../../lib/authService.js';
import { quranTextStatusBadgeHtml } from '../../lib/ayahDisplay.js';
import { showToast } from '../../components/toast.js';
import {
  buildExportPatch,
  EVIDENCE_GUIDANCE_AR,
  validatePatchEntry,
} from './evidenceValidation.js';
import { submitEvidencePatch } from './reviewActions.js';
import {
  buildMappingQueue,
  EVIDENCE_SPRINT_BATCHES,
  filterMappingQueueByBatch,
  getAllSessionPatches,
  getDraftForEvent,
  saveDraftToStorage,
  saveSessionPatch,
  summarizeEvidenceStats,
} from './evidenceCuration.js';

const APPROX_MAPPING_WARNING =
  'لا تستخدم الربط التقريبي. يجب أن يكون الربط بالآيات واضحًا أو موثقًا.';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderEvidenceCurationPanel(root, ctx) {
  const { events, nodes, themes, eventAyahs, tafsirSources, surahs, onToast, repo, isLocalMode, canSubmitPatches, showConfirmDialog } = ctx;
  const stats = summarizeEvidenceStats(events, eventAyahs);
  const fullQueue = buildMappingQueue(events, nodes, themes, eventAyahs);
  const batchFilterId = ctx.curationBatchFilterId || null;
  const activeBatch = EVIDENCE_SPRINT_BATCHES.find((b) => b.id === batchFilterId) || null;
  const queue = filterMappingQueueByBatch(fullQueue, batchFilterId);
  const selectedId = ctx.curationSelectedId || queue[0]?.id || null;
  const selected = queue.find((q) => q.id === selectedId) || queue[0] || null;
  const draft = selected ? getDraftForEvent(selected.id) || {} : {};

  const eventIds = new Set(events.map((e) => e.id));
  const sourceIds = new Set(tafsirSources.map((s) => s.id));
  const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
  const validationCtx = { eventIds, sourceIds, surahMaxAyah };

  let selectedTextStatus = 'missing';
  if (selected && repo?.getAyahRangeTextStatus) {
    const surahId = Number(draft.surah_id || selected.ayahs?.[0]?.surah_id);
    const ayahFrom = Number(draft.ayah_from || selected.ayahs?.[0]?.ayah_from);
    const ayahTo = Number(draft.ayah_to || selected.ayahs?.[0]?.ayah_to);
    if (surahId && ayahFrom && ayahTo) {
      selectedTextStatus = await repo.getAyahRangeTextStatus(surahId, ayahFrom, ayahTo);
    }
  }

  const quranImported = repo?.isQuranTextImported ? await repo.isQuranTextImported() : false;
  const draftStatus = selected ? summarizeDraftStatus(selected, draft, validationCtx) : null;

  root.innerHTML = `
    <div class="admin-curation">
      ${isLocalMode ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>` : ''}

      <div class="admin-evidence-stats glass pad">
        <div class="admin-stats admin-stats-6">
          <div class="stat"><strong>${stats.totalEvents}</strong><span>إجمالي الأحداث</span></div>
          <div class="stat ok"><strong>${stats.preciseEvidence}</strong><span>precise_evidence</span></div>
          <div class="stat warn"><strong>${stats.needsPreciseMapping}</strong><span>needs_precise_mapping</span></div>
          <div class="stat rose"><strong>${stats.needsReviewConfidence}</strong><span>needs_review</span></div>
          <div class="stat ok"><strong>${stats.safeForPublicFinal}</strong><span>آمن للعرض النهائي</span></div>
          <div class="stat rose"><strong>${stats.blockedFromFinal}</strong><span>محجوب عن النهائي</span></div>
        </div>
        <p class="muted" style="margin-top:10px">
          حالة النص القرآني: ${quranImported ? '<span class="tag green">النص متوفر</span>' : '<span class="tag rose">النص غير مستورد</span>'}
        </p>
        <div class="admin-warning">${escapeHtml(APPROX_MAPPING_WARNING)}</div>
        ${activeBatch ? `<div class="admin-warning warn">مسودة Sprint فقط — ${escapeHtml(activeBatch.label_ar)} · <code>${escapeHtml(activeBatch.patchPath)}</code>${activeBatch.reviewTemplatePath ? ` · review: <code>${escapeHtml(activeBatch.reviewTemplatePath)}</code>` : ''}${activeBatch.scholarPackPath ? ` · pack: <code>${escapeHtml(activeBatch.scholarPackPath)}</code>` : ''} · proposed-only · لا يُدمج تلقائيًا</div>` : ''}
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
      </div>

      <div class="admin-curation-grid">
        <aside class="glass pad">
          <div class="admin-guidance">
            <h3 class="gold">${escapeHtml(EVIDENCE_GUIDANCE_AR.title)}</h3>
            <ul class="source-list">${EVIDENCE_GUIDANCE_AR.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
          </div>
        </aside>

        <div class="glass pad admin-main">
          <div class="admin-curation-filters" style="margin-bottom:12px">
            <span class="muted">تصفية:</span>
            <button type="button" class="btn sm curation-batch-filter ${!batchFilterId ? 'primary' : ''}" data-batch="">الكل (${fullQueue.length})</button>
            ${EVIDENCE_SPRINT_BATCHES.map(
              (b) =>
                `<button type="button" class="btn sm curation-batch-filter ${batchFilterId === b.id ? 'primary' : ''}" data-batch="${escapeHtml(b.id)}" title="${escapeHtml(b.patchPath)}">${escapeHtml(b.label_ar)} (${b.eventIds.length})</button>`
            ).join('')}
          </div>
          <h3 class="gold">الأحداث التي تحتاج ربطًا دقيقًا (${queue.length}${activeBatch ? ` · ${activeBatch.label_ar}` : ''})</h3>
          <div class="admin-queue" id="curation-queue">
            ${queue.length ? queue.map((q) => curationQueueItem(q, selected)).join('') : '<div class="state-box">لا توجد أحداث في قائمة الانتظار.</div>'}
          </div>
        </div>

        <div class="glass pad admin-detail curation-sticky-panel" id="curation-form-wrap">
          ${selected ? curationFormHtml(selected, draft, tafsirSources, selectedTextStatus, draftStatus) : '<div class="state-box">اختر حدثًا من القائمة.</div>'}
        </div>
      </div>

      <div class="glass pad admin-export-bar">
        <p class="muted">الجلسة: ${getAllSessionPatches().length} مسودة · autosave في localStorage</p>
        <div class="admin-actions">
          <button type="button" class="btn sm" id="curation-copy-event-id" ${selected ? '' : 'disabled'}>copy event_id</button>
          <button type="button" class="btn sm" id="curation-copy-patch">copy patch JSON</button>
          <button type="button" class="btn sm" id="curation-save-draft">حفظ مسودة</button>
          <button type="button" class="btn sm" id="curation-preview-patch">معاينة التحقق</button>
          <button type="button" class="btn primary sm" id="curation-export-patch">تصدير JSON Patch</button>
          ${!isLocalMode && canSubmitPatches ? '<button type="button" class="btn sm" id="curation-submit-patch">إرسال Patch</button>' : ''}
        </div>
        <pre class="admin-patch-preview" id="curation-validation-msg"></pre>
      </div>
    </div>
  `;

  root.querySelectorAll('.curation-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => ctx.onSelectEvent(btn.dataset.id));
  });

  root.querySelectorAll('.curation-batch-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const batchId = btn.dataset.batch || null;
      ctx.onBatchFilterChange?.(batchId);
    });
  });

  const autosave = debounce(() => {
    if (!selected) return;
    const entry = readForm(root);
    if (!entry?.event_id) return;
    saveSessionPatch(selected.id, entry);
    saveDraftToStorage(selected.id, entry);
    showToast('تم حفظ المسودة تلقائيًا', 'info', 2200);
  }, 900);

  root.querySelector('#curation-form')?.addEventListener('input', autosave);
  root.querySelector('#curation-form')?.addEventListener('change', autosave);

  root.querySelector('#curation-copy-event-id')?.addEventListener('click', async () => {
    if (!selected) return;
    await copyText(selected.id);
    showToast('تم نسخ event_id', 'success');
  });

  root.querySelector('#curation-copy-patch')?.addEventListener('click', async () => {
    const patches = collectPatches(root, selected, validationCtx);
    if (!patches.length) {
      showToast('لا توجد مسودة للنسخ', 'error');
      return;
    }
    await copyText(JSON.stringify(buildExportPatch(patches), null, 2));
    showToast('تم نسخ patch JSON', 'success');
  });

  root.querySelector('#curation-save-draft')?.addEventListener('click', () => saveDraftAction(root, selected, validationCtx, onToast));
  root.querySelector('#curation-preview-patch')?.addEventListener('click', () => previewPatch(root, selected, validationCtx));
  root.querySelector('#curation-export-patch')?.addEventListener('click', () => exportPatch(root, selected, validationCtx, onToast));

  root.querySelector('#curation-submit-patch')?.addEventListener('click', async () => {
    const patches = collectPatches(root, selected, validationCtx);
    const msgEl = root.querySelector('#curation-validation-msg');
    if (!patches.length) {
      msgEl.textContent = 'لا توجد مسودات للإرسال.';
      msgEl.className = 'admin-patch-preview admin-error';
      return;
    }
    if (showConfirmDialog) {
      const confirmed = await showConfirmDialog({
        title: 'تأكيد إرسال evidence patch',
        actionLabel: 'submit evidence patch',
        recordLabel: `${patches.length} mapping(s)`,
        requireNote: false,
        showEvidenceNote: true,
      });
      if (!confirmed.confirmed) return;
    }
    const payload = buildExportPatch(patches);
    const submitResult = await submitEvidencePatch(repo, payload);
    msgEl.textContent = submitResult.message || submitResult.error || '—';
    msgEl.className = `admin-patch-preview ${submitResult.ok ? 'admin-ok' : 'admin-error'}`;
    showToast(submitResult.message || 'تم الإرسال', submitResult.ok ? 'success' : 'error');
    onToast?.(submitResult.message);
  });
}

function summarizeDraftStatus(item, draft, ctx) {
  const entry = { ...draft, event_id: item.id };
  const validation = validatePatchEntry(entry, ctx);
  if (validation.valid && entry.proposed_review_status !== 'approved') {
    return { label: 'valid draft', className: 'admin-ok', detail: 'مسودة صالحة — proposed فقط' };
  }
  if (!entry.surah_id || !entry.ayah_from || !entry.ayah_to) {
    return { label: 'missing ayah range', className: 'admin-error', detail: 'نطاق الآيات غير مكتمل' };
  }
  if (!entry.source_id) {
    return { label: 'missing source', className: 'admin-error', detail: 'source_id مطلوب' };
  }
  if (entry.proposed_review_status === 'approved') {
    return { label: 'cannot approve yet', className: 'admin-error', detail: 'لا يمكن الاعتماد من الواجهة' };
  }
  if (!validation.valid) {
    return { label: 'validation errors', className: 'admin-error', detail: validation.errors.join(' · ') };
  }
  return { label: 'draft', className: 'warn', detail: '—' };
}

function curationQueueItem(item, selected) {
  const active = selected?.id === item.id ? ' active' : '';
  return `
    <button type="button" class="admin-queue-item curation-queue-item${active}" data-id="${item.id}">
      <span class="muted">${escapeHtml(item.id)}</span>
      <strong>${escapeHtml(item.title_ar)}</strong>
      ${reviewBadgeHtml(item.review_status)}
      <span class="tag rose">needs_precise_mapping</span>
    </button>`;
}

function curationFormHtml(item, draft, tafsirSources, textStatus, draftStatus) {
  const textBadge = quranTextStatusBadgeHtml(textStatus);
  return `
    <div class="curation-event-sticky">
      <h3 class="gold">${escapeHtml(item.title_ar)}</h3>
      <p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.node_name_ar)}</p>
      <p>${reviewBadgeHtml(item.review_status)} ${textBadge}</p>
      ${draftStatus ? `<div class="admin-warning ${draftStatus.className}">${escapeHtml(draftStatus.label)} — ${escapeHtml(draftStatus.detail)}</div>` : ''}
    </div>

    <h4 class="gold" style="margin-top:18px">نموذج ربط الأدلة (مسودة)</h4>
    <form class="admin-curation-form" id="curation-form">
      <input type="hidden" name="event_id" value="${escapeHtml(item.id)}" />
      <label>surah_id <input name="surah_id" type="number" min="1" max="114" value="${draft.surah_id ?? ''}" required /></label>
      <label>ayah_from <input name="ayah_from" type="number" min="1" value="${draft.ayah_from ?? ''}" required /></label>
      <label>ayah_to <input name="ayah_to" type="number" min="1" value="${draft.ayah_to ?? ''}" required /></label>
      <label>relation_type
        <select name="relation_type" required>
          ${['main', 'supporting', 'parallel', 'contrast'].map((v) => `<option value="${v}" ${(draft.relation_type || 'main') === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </label>
      <label>evidence_note_ar <textarea name="evidence_note_ar" rows="2">${escapeHtml(draft.evidence_note_ar || '')}</textarea></label>
      <label>evidence_confidence
        <select name="evidence_confidence" required>
          ${['quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review'].map((v) => `<option value="${v}" ${(draft.evidence_confidence || 'needs_review') === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </label>
      <label>source_id
        <select name="source_id">
          <option value="">—</option>
          ${tafsirSources.map((s) => `<option value="${s.id}" ${draft.source_id === s.id ? 'selected' : ''}>${escapeHtml(s.name_ar)}</option>`).join('')}
        </select>
      </label>
      <label>reviewer_note <textarea name="reviewer_note" rows="2">${escapeHtml(draft.reviewer_note || '')}</textarea></label>
      <label>internal_note <textarea name="internal_note" rows="2">${escapeHtml(draft.internal_note || '')}</textarea></label>
      <label>source_note <textarea name="source_note" rows="2">${escapeHtml(draft.source_note || '')}</textarea></label>
      <label>proposed_review_status
        <select name="proposed_review_status">
          ${['pending', 'needs_source'].map((v) => `<option value="${v}" ${(draft.proposed_review_status || 'pending') === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </label>
    </form>
    <p class="muted" style="font-size:13px;margin-top:10px">لا يتم اعتماد تلقائي — التصدير يولّد patch بحالة proposed فقط.</p>
  `;
}

function readForm(root) {
  const form = root.querySelector('#curation-form');
  if (!form) return null;
  const fd = new FormData(form);
  return {
    event_id: fd.get('event_id'),
    surah_id: Number(fd.get('surah_id')),
    ayah_from: Number(fd.get('ayah_from')),
    ayah_to: Number(fd.get('ayah_to')),
    relation_type: fd.get('relation_type'),
    evidence_note_ar: fd.get('evidence_note_ar'),
    evidence_confidence: fd.get('evidence_confidence'),
    source_id: fd.get('source_id'),
    reviewer_note: fd.get('reviewer_note'),
    internal_note: fd.get('internal_note'),
    source_note: fd.get('source_note'),
    proposed_review_status: fd.get('proposed_review_status') || 'pending',
  };
}

function collectPatches(root, selected, ctx) {
  const patches = getAllSessionPatches();
  if (!patches.length && selected) {
    const current = readForm(root);
    if (current?.event_id) {
      const result = validatePatchEntry(current, ctx);
      if (result.valid) patches.push(current);
    }
  }
  return patches;
}

function saveDraftAction(root, selected, ctx, onToast) {
  if (!selected) return;
  const entry = readForm(root);
  const result = validatePatchEntry(entry, ctx);
  const msgEl = root.querySelector('#curation-validation-msg');
  if (!result.valid) {
    msgEl.textContent = result.errors.join('\n');
    msgEl.className = 'admin-patch-preview admin-error';
    showToast('خطأ في التحقق', 'error');
    return;
  }
  saveSessionPatch(selected.id, entry);
  saveDraftToStorage(selected.id, entry);
  msgEl.textContent = `تم حفظ مسودة ${selected.id}`;
  msgEl.className = 'admin-patch-preview admin-ok';
  showToast('تم حفظ المسودة', 'success');
  onToast?.(msgEl.textContent);
}

function previewPatch(root, selected, ctx) {
  const msgEl = root.querySelector('#curation-validation-msg');
  const entry = readForm(root);
  const result = validatePatchEntry(entry, ctx);
  if (!result.valid) {
    msgEl.textContent = result.errors.join('\n');
    msgEl.className = 'admin-patch-preview admin-error';
    return;
  }
  msgEl.textContent = `معاينة صالحة لـ ${entry.event_id} — proposed فقط`;
  msgEl.className = 'admin-patch-preview admin-ok';
}

function exportPatch(root, selected, ctx, onToast) {
  const patches = collectPatches(root, selected, ctx);
  const msgEl = root.querySelector('#curation-validation-msg');
  if (!patches.length) {
    msgEl.textContent = 'لا توجد مسودات للتصدير.';
    msgEl.className = 'admin-patch-preview admin-error';
    return;
  }
  for (const p of patches) {
    const result = validatePatchEntry(p, ctx);
    if (!result.valid) {
      msgEl.textContent = `${p.event_id}:\n${result.errors.join('\n')}`;
      msgEl.className = 'admin-patch-preview admin-error';
      return;
    }
  }
  downloadJson(buildExportPatch(patches), `evidence_patch_${Date.now()}.json`);
  msgEl.textContent = `تم تصدير ${patches.length} mapping(s)`;
  msgEl.className = 'admin-patch-preview admin-ok';
  showToast('تم تصدير patch', 'success');
  onToast?.(msgEl.textContent);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
