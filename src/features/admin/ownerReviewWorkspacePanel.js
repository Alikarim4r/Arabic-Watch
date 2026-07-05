import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { getAuthModeLabelAr } from '../../lib/authService.js';
import { showToast } from '../../components/toast.js';
import {
  OWNER_DECISION_OPTIONS,
  OWNER_TEMPLATE_PATH,
  OWNER_BACKUP_WARNING_AR,
  OWNER_BROWSER_TIP_AR,
  OWNER_EXPORT_SAFETY_WARNINGS_AR,
  DECISION_LABELS_AR,
  buildOwnerReviewCsv,
  buildOwnerReviewExportTemplate,
  canProposeOwnerApproved,
  compileOwnerReviewDecisions,
  extractOwnerFields,
  filterOwnerMappings,
  formatAyahRange,
  getEntryValidationPreview,
  getValidationMessageAr,
  mergeOwnerDecisions,
  readOwnerDecisionStore,
  summarizeWorkspaceStats,
  validateOwnerReviewTemplateForExport,
  writeOwnerDecisionStore,
} from './ownerReviewLogic.js';

const OWNER_WARNING_AR =
  'كل هذه المقترحات بانتظار مراجعة المالك، وليست معتمدة. لا يُطبَّق شيء على المحتوى النهائي من هذه الواجهة.';

const BATCH_LABELS = {
  evidence_mapping_sprint_01: 'دفعة 1',
  evidence_mapping_sprint_02: 'دفعة 2',
  evidence_mapping_sprint_03: 'دفعة 3',
  evidence_mapping_sprint_04: 'دفعة 4',
  evidence_mapping_sprint_05: 'دفعة 5',
};

/** @type {Object|null} */
let baseTemplateCache = null;

/** @type {Record<string, Object>} */
let sessionOverrides = {};

/** @type {boolean} */
let dirty = false;

/** @type {string|null} */
let lastSavedAt = null;

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderOwnerReviewWorkspacePanel(root, ctx) {
  const {
    tafsirSources,
    surahs,
    isLocalMode,
    ownerReviewSelectedId,
    ownerReviewFilters,
    onSelectOwnerItem,
    onOwnerFiltersChange,
    onToast,
    showConfirmDialog,
  } = ctx;

  const sourceIds = new Set(tafsirSources.map((s) => s.id));
  const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));
  const validationCtx = { sourceIds, surahMaxAyah };

  if (!baseTemplateCache) {
    root.innerHTML = `<div class="admin-owner-review"><div class="state-box">جاري تحميل قالب مراجعة المالك…</div></div>`;
    try {
      const res = await fetch(OWNER_TEMPLATE_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      baseTemplateCache = await res.json();
      const store = readOwnerDecisionStore();
      sessionOverrides = { ...store.overrides };
      lastSavedAt = store.savedAt;
    } catch (e) {
      root.innerHTML = `<div class="admin-owner-review"><div class="state-box admin-error">تعذّر تحميل القالب: ${escapeHtml(e.message)}</div></div>`;
      return;
    }
  }

  const filters = ownerReviewFilters || {};
  const working = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
  const filtered = filterOwnerMappings(working.mappings, { ...filters, ctx: validationCtx });
  const stats = summarizeWorkspaceStats(working.mappings, validationCtx);
  const selectedId = ownerReviewSelectedId || filtered[0]?.event_id || working.mappings[0]?.event_id;
  const selected = working.mappings.find((m) => m.event_id === selectedId) || filtered[0] || null;
  const selectedPreview = selected ? getEntryValidationPreview(selected, validationCtx) : null;
  const selectedIdx = selected ? filtered.findIndex((m) => m.event_id === selected.event_id) : -1;
  const globalIdx = selected ? working.mappings.findIndex((m) => m.event_id === selected.event_id) : -1;

  const batchIds = [...new Set(working.mappings.map((m) => m.batch_id))];
  const progressPct = stats.total ? Math.round(((stats.total - stats.undecided) / stats.total) * 100) : 0;

  root.innerHTML = `
    <div class="admin-owner-review" id="owner-review-workspace" dir="rtl">
      ${isLocalMode ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>` : ''}

      <div class="glass pad admin-owner-header">
        <div class="owner-header-row">
          <div>
            <h3 class="gold">مراجعة المالك — كل الدفعات (48)</h3>
            <p class="muted owner-help-text">${escapeHtml(OWNER_BROWSER_TIP_AR)}</p>
          </div>
          <div class="owner-progress-ring" aria-label="تقدّم المراجعة">
            <strong>${progressPct}%</strong>
            <span>مُراجع</span>
          </div>
        </div>
        <div class="admin-warning warn">${escapeHtml(OWNER_WARNING_AR)}</div>
        <div class="admin-warning rose owner-backup-warning" id="owner-backup-warning">${escapeHtml(OWNER_BACKUP_WARNING_AR)}</div>
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
      </div>

      <div class="glass pad admin-owner-progress" id="owner-progress-dashboard">
        <h4 class="gold">لوحة تقدّم المراجعة</h4>
        <div class="admin-stats admin-stats-owner-progress">
          <div class="stat"><strong>${stats.total}</strong><span>إجمالي الربط</span></div>
          <div class="stat muted"><strong>${stats.undecided}</strong><span>لم يُحدَّد</span></div>
          <div class="stat"><strong>${stats.approve_after_source_check}</strong><span>موافقة بعد مصدر</span></div>
          <div class="stat warn"><strong>${stats.needs_source}</strong><span>يحتاج مصدر</span></div>
          <div class="stat"><strong>${stats.revise_ayah_range}</strong><span>تصحيح آيات</span></div>
          <div class="stat"><strong>${stats.rename_event}</strong><span>إعادة تسمية</span></div>
          <div class="stat"><strong>${stats.split_event}</strong><span>تقسيم</span></div>
          <div class="stat rose"><strong>${stats.rejected}</strong><span>مرفوض</span></div>
          <div class="stat ${stats.invalid ? 'rose' : 'ok'}"><strong>${stats.invalid}</strong><span>قرارات غير صالحة</span></div>
          <div class="stat ok"><strong>${stats.readyForCompilation}</strong><span>جاهز للتجميع</span></div>
        </div>
        <p class="muted" id="owner-save-status">
          ${lastSavedAt ? `آخر حفظ: ${escapeHtml(new Date(lastSavedAt).toLocaleString('ar-SA'))}` : 'لم يُحفظ بعد'}
          ${dirty ? ' · <span class="tag rose" id="owner-unsaved-badge">تغييرات غير محفوظة</span>' : ''}
        </p>
      </div>

      <div class="admin-owner-toolbar glass pad">
        <label class="owner-search-label">بحث <span class="muted">(/)</span>
          <input type="search" id="owner-search" placeholder="معرّف الحدث · العنوان · النبي · الآية" value="${escapeHtml(filters.q || '')}" autocomplete="off" />
        </label>
        <label>الدفعة
          <select id="owner-filter-batch">
            <option value="">الكل</option>
            ${batchIds.map((b) => `<option value="${escapeHtml(b)}" ${filters.batchId === b ? 'selected' : ''}>${escapeHtml(BATCH_LABELS[b] || b)}</option>`).join('')}
          </select>
        </label>
        <label>القرار
          <select id="owner-filter-decision">
            <option value="">الكل</option>
            ${OWNER_DECISION_OPTIONS.map((d) => `<option value="${d}" ${filters.decision === d ? 'selected' : ''}>${escapeHtml(DECISION_LABELS_AR[d] || d)}</option>`).join('')}
          </select>
        </label>
        <label>المخاطر
          <select id="owner-filter-risk">
            <option value="">الكل</option>
            ${['high', 'medium', 'low'].map((r) => `<option value="${r}" ${filters.riskLevel === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </label>
        <label>الصحة
          <select id="owner-filter-validity">
            <option value="">الكل</option>
            <option value="valid" ${filters.validity === 'valid' ? 'selected' : ''}>صالح</option>
            <option value="invalid" ${filters.validity === 'invalid' ? 'selected' : ''}>غير صالح</option>
          </select>
        </label>
        <div class="admin-actions owner-nav-actions">
          <button type="button" class="btn sm" id="owner-prev" ${selectedIdx <= 0 ? 'disabled' : ''} title="السابق (k)">◀ السابق</button>
          <span class="muted owner-nav-pos">${globalIdx >= 0 ? `${globalIdx + 1} / ${stats.total}` : '—'}</span>
          <button type="button" class="btn sm" id="owner-next" ${selectedIdx < 0 || selectedIdx >= filtered.length - 1 ? 'disabled' : ''} title="التالي (j)">التالي ▶</button>
        </div>
      </div>

      <div class="admin-owner-grid">
        <div class="glass pad admin-main owner-list-panel">
          <h4 class="gold">قائمة الربط (${filtered.length})</h4>
          <div class="owner-queue-header muted">
            <span>الحدث</span><span>النبي</span><span>الآية</span><span>الحالة</span>
          </div>
          <div class="admin-queue owner-queue" id="owner-queue">
            ${filtered.length ? filtered.map((m, i) => ownerQueueItem(m, selected, validationCtx, i)).join('') : '<div class="state-box">لا توجد نتائج.</div>'}
          </div>
        </div>

        <div class="glass pad admin-detail owner-detail-panel" id="owner-detail-panel">
          ${selected ? ownerFormHtml(selected, selectedPreview, tafsirSources) : '<div class="state-box">اختر عنصرًا من القائمة للمراجعة.</div>'}
        </div>
      </div>

      <div class="glass pad admin-export-bar owner-export-bar">
        <div class="owner-safety-warnings" id="owner-safety-warnings">
          <h4 class="gold">تذكير قبل التصدير أو التجميع</h4>
          <ul class="owner-safety-list">
            ${OWNER_EXPORT_SAFETY_WARNINGS_AR.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}
          </ul>
        </div>
        <div class="admin-actions owner-export-actions">
          <button type="button" class="btn sm" id="owner-save-local" title="حفظ (s)">💾 حفظ محلي</button>
          <button type="button" class="btn sm" id="owner-export-json">⬇ تصدير JSON</button>
          <button type="button" class="btn sm" id="owner-import-json">⬆ استيراد JSON</button>
          <button type="button" class="btn sm" id="owner-export-csv">⬇ تصدير CSV</button>
          <button type="button" class="btn primary sm" id="owner-compile-revised">إنشاء Revised Proposed Patch</button>
        </div>
        <details class="owner-advanced-export">
          <summary class="muted">خيارات متقدمة (نسخ JSON)</summary>
          <div class="admin-actions" style="margin-top:8px">
            <button type="button" class="btn sm" id="owner-copy-item">نسخ عنصر JSON</button>
            <button type="button" class="btn sm" id="owner-copy-all">نسخ كل القرارات JSON</button>
          </div>
        </details>
        <input type="file" id="owner-import-file" accept="application/json,.json" hidden />
        <pre class="admin-patch-preview" id="owner-compile-preview"></pre>
      </div>
    </div>
  `;

  bindOwnerWorkspaceEvents(root, {
    filtered,
    working,
    selected,
    validationCtx,
    onSelectOwnerItem,
    onOwnerFiltersChange,
    onToast,
    showConfirmDialog,
  });
}

function ownerQueueItem(item, selected, ctx, index) {
  const preview = getEntryValidationPreview(item, ctx);
  const messageAr = getValidationMessageAr(preview);
  const active = selected?.event_id === item.event_id ? ' active' : '';
  const riskClass = item.risk_level === 'high' ? 'rose' : item.risk_level === 'medium' ? 'warn' : '';
  const statusClass = preview.invalid ? 'rose' : preview.status === 'undecided' ? 'muted' : 'green';
  return `
    <button type="button" class="admin-queue-item owner-queue-item${active}" data-event-id="${escapeHtml(item.event_id)}" title="${escapeHtml(messageAr)}">
      <span class="owner-q-title"><strong>${escapeHtml(item.title_ar)}</strong><span class="muted">${escapeHtml(item.event_id)}</span></span>
      <span class="owner-q-node">${escapeHtml(item.node_name_ar)}</span>
      <span class="owner-q-ayah tag">${escapeHtml(formatAyahRange(item))}</span>
      <span class="owner-q-status tag ${statusClass}" data-validation-ar>${escapeHtml(messageAr)}</span>
      ${item.risk_level === 'high' ? `<span class="tag rose owner-q-risk">⚠</span>` : ''}
    </button>`;
}

function ownerFormHtml(item, preview, tafsirSources) {
  const finalOptions = ['', 'pending', 'needs_source'];
  if (canProposeOwnerApproved(item, item)) finalOptions.push('approved');
  const messageAr = getValidationMessageAr(preview);
  const previewClass = preview.invalid ? 'admin-error' : preview.status === 'valid' || preview.status === 'undecided' ? 'admin-ok' : 'warn';

  return `
    <div class="owner-item-header">
      <h3 class="gold">${escapeHtml(item.title_ar)}</h3>
      <p class="muted">${escapeHtml(item.event_id)} · ${escapeHtml(item.node_name_ar)} · ${escapeHtml(BATCH_LABELS[item.batch_id] || item.batch_id)}</p>
    </div>

    <section class="owner-section owner-section-proposed">
      <h4 class="gold">البيانات المقترحة (للقراءة فقط)</h4>
      <p class="owner-summary">${escapeHtml(item.summary_ar)}</p>
      <dl class="owner-meta-dl">
        <div><dt>نطاق الآية المقترح</dt><dd>${escapeHtml(formatAyahRange(item))}</dd></div>
        <div><dt>نوع الربط</dt><dd>${escapeHtml(item.relation_type)}</dd></div>
        <div><dt>ملاحظة الدليل</dt><dd>${escapeHtml(item.evidence_note_ar)}</dd></div>
        <div><dt>ملاحظة المراجع</dt><dd>${escapeHtml(item.reviewer_note)}</dd></div>
      </dl>
      ${item.risk_level ? `<p><span class="tag ${item.risk_level === 'high' ? 'rose' : 'warn'}">مستوى المخاطر: ${escapeHtml(item.risk_level)}</span></p>` : ''}
      ${item.overlap_warning ? `<div class="admin-warning warn owner-overlap-warning">${escapeHtml(item.overlap_warning)}</div>` : ''}
    </section>

    <section class="owner-section owner-section-validation">
      <div class="admin-warning ${previewClass}" id="owner-validation-preview" data-validation-ar>
        <strong>معاينة التحقق:</strong> ${escapeHtml(messageAr)}
        ${preview.issues.length ? `<br><span class="muted">${escapeHtml(preview.issues.join(' · '))}</span>` : ''}
      </div>
    </section>

    <section class="owner-section owner-section-decisions">
      <h4 class="gold">قرار المالك</h4>
      <form class="admin-curation-form owner-decision-form" id="owner-decision-form">
        <input type="hidden" name="event_id" value="${escapeHtml(item.event_id)}" />
        <label>قرار المالك
          <select name="owner_decision" id="owner-decision-select">
            ${OWNER_DECISION_OPTIONS.map((d) => `<option value="${d}" ${(String(item.owner_decision || '').trim() || 'undecided') === d ? 'selected' : ''}>${escapeHtml(DECISION_LABELS_AR[d] || d)}</option>`).join('')}
          </select>
        </label>
        <div class="owner-correction-grid">
          <label>سورة مصححة <input name="corrected_surah_id" type="number" min="1" max="114" value="${item.corrected_surah_id ?? ''}" placeholder="1–114" /></label>
          <label>من آية <input name="corrected_ayah_from" type="number" min="1" value="${item.corrected_ayah_from ?? ''}" /></label>
          <label>إلى آية <input name="corrected_ayah_to" type="number" min="1" value="${item.corrected_ayah_to ?? ''}" /></label>
        </div>
        <label>عنوان مصحح <input name="corrected_event_title" type="text" value="${escapeHtml(item.corrected_event_title || '')}" /></label>
        <label>المصدر
          <select name="source_id">
            <option value="">— اختر مصدرًا —</option>
            ${tafsirSources.map((s) => `<option value="${s.id}" ${item.source_id === s.id ? 'selected' : ''}>${escapeHtml(s.name_ar)}</option>`).join('')}
          </select>
        </label>
        <label>ملاحظة المالك <textarea name="owner_note" rows="4" placeholder="وثّق سبب القرار…">${escapeHtml(item.owner_note || '')}</textarea></label>
        <label>الحالة الموصى بها نهائيًا
          <select name="final_recommended_status" id="owner-final-status">
            ${finalOptions.map((v) => `<option value="${v}" ${(item.final_recommended_status || '') === v ? 'selected' : ''}>${v || '—'}</option>`).join('')}
          </select>
        </label>
      </form>
      <p class="muted owner-form-note">لا يُعتمد تلقائيًا — التصدير والتجميع يولّدان مقترحات فقط.</p>
    </section>
  `;
}

function readOwnerForm(root) {
  const form = root.querySelector('#owner-decision-form');
  if (!form) return null;
  const fd = new FormData(form);
  return extractOwnerFields({
    owner_decision: fd.get('owner_decision'),
    corrected_surah_id: fd.get('corrected_surah_id'),
    corrected_ayah_from: fd.get('corrected_ayah_from'),
    corrected_ayah_to: fd.get('corrected_ayah_to'),
    corrected_event_title: fd.get('corrected_event_title'),
    source_id: fd.get('source_id'),
    owner_note: fd.get('owner_note'),
    final_recommended_status: fd.get('final_recommended_status'),
  });
}

function persistCurrentForm(root, eventId) {
  const fields = readOwnerForm(root);
  if (!fields || !eventId) return;
  sessionOverrides[eventId] = fields;
  dirty = true;
  updateSaveStatus(root);
}

function saveLocalDraft(root, onToast) {
  lastSavedAt = writeOwnerDecisionStore(sessionOverrides, { mappingCount: 48 });
  dirty = false;
  updateSaveStatus(root);
  showToast('تم حفظ قرارات المالك محليًا', 'success');
  onToast?.('saved');
}

function updateSaveStatus(root) {
  const el = root.querySelector('#owner-save-status');
  if (!el) return;
  el.innerHTML = `${lastSavedAt ? `آخر حفظ: ${new Date(lastSavedAt).toLocaleString('ar-SA')}` : 'لم يُحفظ بعد'}${dirty ? ' · <span class="tag rose" id="owner-unsaved-badge">تغييرات غير محفوظة</span>' : ''}`;
}

function bindOwnerWorkspaceEvents(root, opts) {
  const { filtered, working, selected, validationCtx, onSelectOwnerItem, onOwnerFiltersChange, onToast, showConfirmDialog } = opts;

  const autosave = debounce(() => {
    if (!selected) return;
    persistCurrentForm(root, selected.event_id);
    lastSavedAt = writeOwnerDecisionStore(sessionOverrides, { mappingCount: 48 });
    dirty = false;
    updateSaveStatus(root);
    showToast('حفظ تلقائي', 'info', 1800);
  }, 800);

  root.querySelector('#owner-decision-form')?.addEventListener('input', autosave);
  root.querySelector('#owner-decision-form')?.addEventListener('change', () => {
    persistCurrentForm(root, selected?.event_id);
    refreshFinalStatusOptions(root, selected?.event_id, validationCtx);
  });

  root.querySelectorAll('.owner-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      persistCurrentForm(root, selected?.event_id);
      onSelectOwnerItem(btn.dataset.eventId);
    });
  });

  const applyFilters = () => {
    persistCurrentForm(root, selected?.event_id);
    onOwnerFiltersChange?.({
      q: root.querySelector('#owner-search')?.value || '',
      batchId: root.querySelector('#owner-filter-batch')?.value || '',
      decision: root.querySelector('#owner-filter-decision')?.value || '',
      riskLevel: root.querySelector('#owner-filter-risk')?.value || '',
      validity: root.querySelector('#owner-filter-validity')?.value || '',
    });
  };

  root.querySelector('#owner-search')?.addEventListener('input', debounce(applyFilters, 300));
  root.querySelector('#owner-filter-batch')?.addEventListener('change', applyFilters);
  root.querySelector('#owner-filter-decision')?.addEventListener('change', applyFilters);
  root.querySelector('#owner-filter-risk')?.addEventListener('change', applyFilters);
  root.querySelector('#owner-filter-validity')?.addEventListener('change', applyFilters);

  root.querySelector('#owner-prev')?.addEventListener('click', () => navigateOwner(root, filtered, selected, -1, onSelectOwnerItem));
  root.querySelector('#owner-next')?.addEventListener('click', () => navigateOwner(root, filtered, selected, 1, onSelectOwnerItem));

  root.querySelector('#owner-save-local')?.addEventListener('click', () => {
    persistCurrentForm(root, selected?.event_id);
    saveLocalDraft(root, onToast);
  });

  root.querySelector('#owner-export-json')?.addEventListener('click', async () => {
    persistCurrentForm(root, selected?.event_id);
    if (showConfirmDialog) {
      const confirmed = await showConfirmDialog({
        title: 'تصدير قرارات المالك',
        actionLabel: 'تصدير JSON — لا يُطبَّق على المحتوى',
        recordLabel: '48 mapping(s)',
        requireNote: false,
      });
      if (!confirmed.confirmed) return;
    }
    const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
    const exportDoc = buildOwnerReviewExportTemplate(merged);
    const validation = validateOwnerReviewTemplateForExport(exportDoc, validationCtx);
    if (!validation.valid) {
      showToast(`تصدير مع تحذيرات: ${validation.errors[0]}`, 'error', 4000);
    }
    downloadFile('owner_review_decisions.json', JSON.stringify(exportDoc, null, 2));
    showToast('تم تصدير JSON — احتفظ بنسخة احتياطية', 'success');
  });

  root.querySelector('#owner-export-csv')?.addEventListener('click', () => {
    persistCurrentForm(root, selected?.event_id);
    const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
    downloadFile('owner_review_decisions.csv', buildOwnerReviewCsv(merged));
    showToast('تم تصدير CSV', 'success');
  });

  root.querySelector('#owner-copy-item')?.addEventListener('click', async () => {
    if (!selected) return;
    persistCurrentForm(root, selected.event_id);
    const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
    const item = merged.mappings.find((m) => m.event_id === selected.event_id);
    await copyText(JSON.stringify(item, null, 2));
    showToast('تم نسخ عنصر JSON', 'success');
  });

  root.querySelector('#owner-copy-all')?.addEventListener('click', async () => {
    persistCurrentForm(root, selected?.event_id);
    const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
    const exportDoc = buildOwnerReviewExportTemplate(merged);
    await copyText(JSON.stringify(exportDoc, null, 2));
    showToast('تم نسخ كل القرارات', 'success');
  });

  root.querySelector('#owner-import-json')?.addEventListener('click', () => {
    root.querySelector('#owner-import-file')?.click();
  });

  root.querySelector('#owner-import-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importOwnerDecisions(data);
      dirty = true;
      showToast('تم استيراد القرارات', 'success');
      onSelectOwnerItem(selected?.event_id || working.mappings[0]?.event_id);
    } catch (err) {
      showToast(`فشل الاستيراد: ${err.message}`, 'error');
    }
    e.target.value = '';
  });

  root.querySelector('#owner-compile-revised')?.addEventListener('click', async () => {
    persistCurrentForm(root, selected?.event_id);
    if (showConfirmDialog) {
      const confirmed = await showConfirmDialog({
        title: 'إنشاء Revised Proposed Patch',
        actionLabel: 'تجميع مقترح مُنقَّح — تنزيل فقط',
        recordLabel: '48 mapping(s)',
        requireNote: false,
      });
      if (!confirmed.confirmed) return;
    }
    const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
    const compiled = compileOwnerReviewDecisions(merged, validationCtx);
    const preview = root.querySelector('#owner-compile-preview');
    preview.textContent = [
      `compiled: ${compiled.mappings.length} mappings`,
      `rejected: ${compiled.meta.rejected_proposals?.length || 0}`,
      `approved_proposed: ${compiled.approvedCount} (not applied)`,
      `undecided: ${compiled.meta.summary?.undecided ?? '—'}`,
      compiled.warnings.length ? `warnings:\n${compiled.warnings.join('\n')}` : '',
      '— not applied to seed —',
    ]
      .filter(Boolean)
      .join('\n');
    preview.className = 'admin-patch-preview admin-ok';
    downloadFile(
      'evidence_patch.all_batches.revised.proposed.json',
      JSON.stringify({ meta: compiled.meta, mappings: compiled.mappings }, null, 2)
    );
    showToast('تم إنشاء Revised Proposed Patch (تنزيل فقط)', 'success');
  });

  bindOwnerKeyboard(root, {
    filtered,
    selected,
    onSelectOwnerItem,
    onSave: () => {
      persistCurrentForm(root, selected?.event_id);
      saveLocalDraft(root, onToast);
    },
    onSearchFocus: () => root.querySelector('#owner-search')?.focus(),
    onClosePanel: () => root.querySelector('#owner-detail-panel')?.classList.toggle('collapsed'),
  });
}

function refreshFinalStatusOptions(root, eventId, ctx) {
  if (!eventId) return;
  const merged = mergeOwnerDecisions(baseTemplateCache, sessionOverrides);
  const item = merged.mappings.find((m) => m.event_id === eventId);
  if (!item) return;
  const select = root.querySelector('#owner-final-status');
  if (!select) return;
  const current = select.value;
  const options = ['', 'pending', 'needs_source'];
  if (canProposeOwnerApproved(item, item)) options.push('approved');
  select.innerHTML = options.map((v) => `<option value="${v}" ${current === v ? 'selected' : ''}>${v || '—'}</option>`).join('');
  if (current === 'approved' && !options.includes('approved')) {
    select.value = '';
    sessionOverrides[eventId] = { ...sessionOverrides[eventId], final_recommended_status: '' };
  }
}

function navigateOwner(root, filtered, selected, delta, onSelect) {
  persistCurrentForm(root, selected?.event_id);
  const idx = filtered.findIndex((m) => m.event_id === selected?.event_id);
  const next = filtered[idx + delta];
  if (next) onSelect(next.event_id);
}

function importOwnerDecisions(data) {
  const mappings = data.mappings || (Array.isArray(data) ? data : []);
  mappings.forEach((entry) => {
    if (!entry.event_id) return;
    sessionOverrides[entry.event_id] = extractOwnerFields(entry);
  });
}

function bindOwnerKeyboard(root, { filtered, selected, onSelectOwnerItem, onSave, onSearchFocus, onClosePanel }) {
  const handler = (e) => {
    if (!document.querySelector('#owner-review-workspace')) return;
    const tag = e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === 'j' && !typing) {
      e.preventDefault();
      navigateOwner(root, filtered, selected, 1, onSelectOwnerItem);
    } else if (e.key === 'k' && !typing) {
      e.preventDefault();
      navigateOwner(root, filtered, selected, -1, onSelectOwnerItem);
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      onSearchFocus();
    } else if (e.key === 's' && !typing) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      onClosePanel();
    }
  };
  if (root._ownerKeyHandler) document.removeEventListener('keydown', root._ownerKeyHandler);
  root._ownerKeyHandler = handler;
  document.addEventListener('keydown', handler);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
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
  document.body.removeChild(ta);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], {
    type: filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Reset cache for tests */
export function resetOwnerReviewWorkspaceCache() {
  baseTemplateCache = null;
  sessionOverrides = {};
  dirty = false;
  lastSavedAt = null;
}
