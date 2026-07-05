import { escapeHtml } from '../../lib/utils.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { quranTextStatusBadgeHtml } from '../../lib/ayahDisplay.js';
import {
  buildExportPatch,
  EVIDENCE_GUIDANCE_AR,
  validatePatchEntry,
} from './evidenceValidation.js';
import {
  buildMappingQueue,
  getAllSessionPatches,
  getSessionPatch,
  saveSessionPatch,
  summarizeEvidenceStats,
} from './evidenceCuration.js';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderEvidenceCurationPanel(root, ctx) {
  const { events, nodes, themes, eventAyahs, tafsirSources, surahs, onToast, repo } = ctx;
  const stats = summarizeEvidenceStats(events, eventAyahs);
  const queue = buildMappingQueue(events, nodes, themes, eventAyahs);
  const selectedId = ctx.curationSelectedId || queue[0]?.id || null;
  const selected = queue.find((q) => q.id === selectedId) || queue[0] || null;
  const draft = getSessionPatch(selected?.id) || {};

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

  root.innerHTML = `
    <div class="admin-curation">
      <div class="admin-tabs">
        <button type="button" class="btn sm" data-tab="review">مراجعة عامة</button>
        <button type="button" class="btn sm primary" data-tab="curation">Evidence Curation</button>
      </div>

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
          حالة النص القرآني: ${quranImported ? '<span class="tag green">النص متوفر (6236)</span>' : '<span class="tag rose">النص غير مستورد</span>'}
        </p>
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
          <h3 class="gold">الأحداث التي تحتاج ربطًا دقيقًا بالآيات (${queue.length})</h3>
          <div class="admin-queue" id="curation-queue">
            ${queue.length ? queue.map((q) => curationQueueItem(q, selected)).join('') : '<p class="muted">لا توجد أحداث في قائمة الانتظار.</p>'}
          </div>
        </div>

        <div class="glass pad admin-detail" id="curation-form-wrap">
          ${selected ? curationFormHtml(selected, draft, tafsirSources, selectedTextStatus) : '<p class="muted">اختر حدثًا من القائمة.</p>'}
        </div>
      </div>

      <div class="glass pad admin-export-bar">
        <p class="muted">الجلسة: ${getAllSessionPatches().length} مسودة · لا يتم اعتماد تلقائي</p>
        <div class="admin-actions">
          <button type="button" class="btn sm" id="curation-save-draft">حفظ مسودة الجلسة</button>
          <button type="button" class="btn primary sm" id="curation-export-patch">تصدير JSON Patch</button>
        </div>
        <pre class="admin-patch-preview" id="curation-validation-msg"></pre>
      </div>
    </div>
  `;

  root.querySelector('[data-tab="review"]')?.addEventListener('click', () => {
    ctx.onTabChange('review');
  });

  root.querySelectorAll('.curation-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.onSelectEvent(btn.dataset.id);
    });
  });

  root.querySelector('#curation-save-draft')?.addEventListener('click', () => {
    if (!selected) return;
    const entry = readForm(root);
    const result = validatePatchEntry(entry, validationCtx);
    const msgEl = root.querySelector('#curation-validation-msg');
    if (!result.valid) {
      msgEl.textContent = result.errors.join('\n');
      msgEl.className = 'admin-patch-preview admin-error';
      return;
    }
    saveSessionPatch(selected.id, entry);
    msgEl.textContent = `تم حفظ مسودة الجلسة لـ ${selected.id} (غير معتمد)`;
    msgEl.className = 'admin-patch-preview admin-ok';
  });

  root.querySelector('#curation-export-patch')?.addEventListener('click', () => {
    const patches = getAllSessionPatches();
    const msgEl = root.querySelector('#curation-validation-msg');

    if (!patches.length && selected) {
      const current = readForm(root);
      if (current?.event_id) {
        const result = validatePatchEntry(current, validationCtx);
        if (!result.valid) {
          msgEl.textContent = result.errors.join('\n');
          msgEl.className = 'admin-patch-preview admin-error';
          return;
        }
        patches.push(current);
      }
    }

    if (!patches.length) {
      msgEl.textContent = 'لا توجد مسودات للتصدير — املأ النموذج واحفظ مسودة أولًا.';
      msgEl.className = 'admin-patch-preview admin-error';
      return;
    }

    for (const p of patches) {
      const result = validatePatchEntry(p, validationCtx);
      if (!result.valid) {
        msgEl.textContent = `${p.event_id}:\n${result.errors.join('\n')}`;
        msgEl.className = 'admin-patch-preview admin-error';
        return;
      }
    }

    const payload = buildExportPatch(patches);
    downloadJson(payload, `evidence_patch_${Date.now()}.json`);
    msgEl.textContent = `تم تصدير ${patches.length} mapping(s) — status: proposed (غير معتمد)`;
    msgEl.className = 'admin-patch-preview admin-ok';
  });
}

function curationQueueItem(item, selected) {
  const active = selected?.id === item.id ? ' active' : '';
  const noAyah = !item.ayahs?.length;
  return `
    <button type="button" class="admin-queue-item curation-queue-item${active}" data-id="${item.id}">
      <span class="muted">${escapeHtml(item.id)}</span>
      <strong>${escapeHtml(item.title_ar)}</strong>
      <span class="tag">${escapeHtml(item.node_name_ar)}</span>
      ${reviewBadgeHtml(item.review_status)}
      ${noAyah ? '<span class="tag rose">⚠ لا نطاق آيات</span>' : '<span class="tag rose quran-text-badge">النص غير مستورد</span>'}
    </button>`;
}

function curationFormHtml(item, draft, tafsirSources, textStatus) {
  const themeTags = (item.theme_names || []).map((t) => `<span class="tag green">${escapeHtml(t)}</span>`).join('');
  const ayahWarn = !item.ayahs?.length
    ? '<div class="admin-warning">⚠️ لا يوجد نطاق آيات — هذا الحدث محجوب عن العرض النهائي.</div>'
    : '';
  const textBadge = quranTextStatusBadgeHtml(textStatus);

  return `
    <h3 class="gold">${escapeHtml(item.title_ar)}</h3>
    <p class="muted">${escapeHtml(item.id)} · ${escapeHtml(item.node_name_ar)}</p>
    <p>${reviewBadgeHtml(item.review_status)} <span class="tag">${escapeHtml(item.evidence_status)}</span> <span class="tag">${escapeHtml(item.evidence_confidence)}</span> ${textBadge}</p>
    ${ayahWarn}
    <p style="margin-top:10px">${escapeHtml(item.summary_ar || '—')}</p>
    <div style="margin-top:8px">${themeTags || '<span class="muted">—</span>'}</div>

    <h4 class="gold" style="margin-top:18px">نموذج ربط الأدلة (مسودة)</h4>
    <form class="admin-curation-form" id="curation-form">
      <input type="hidden" name="event_id" value="${escapeHtml(item.id)}" />
      <label>surah_id <input name="surah_id" type="number" min="1" max="114" value="${draft.surah_id ?? ''}" required /></label>
      <label>ayah_from <input name="ayah_from" type="number" min="1" value="${draft.ayah_from ?? ''}" required /></label>
      <label>ayah_to <input name="ayah_to" type="number" min="1" value="${draft.ayah_to ?? ''}" required /></label>
      <label>relation_type
        <select name="relation_type" required>
          ${['main', 'supporting', 'parallel', 'contrast']
            .map(
              (v) =>
                `<option value="${v}" ${(draft.relation_type || 'main') === v ? 'selected' : ''}>${v}</option>`
            )
            .join('')}
        </select>
      </label>
      <label>evidence_note_ar <textarea name="evidence_note_ar" rows="2">${escapeHtml(draft.evidence_note_ar || '')}</textarea></label>
      <label>evidence_confidence
        <select name="evidence_confidence" required>
          ${['quran_explicit', 'tafsir_based', 'scholarly_inference', 'needs_review']
            .map(
              (v) =>
                `<option value="${v}" ${(draft.evidence_confidence || 'needs_review') === v ? 'selected' : ''}>${v}</option>`
            )
            .join('')}
        </select>
      </label>
      <label>source_id
        <select name="source_id">
          <option value="">—</option>
          ${tafsirSources.map((s) => `<option value="${s.id}" ${draft.source_id === s.id ? 'selected' : ''}>${escapeHtml(s.name_ar)}</option>`).join('')}
        </select>
      </label>
      <label>reviewer_note <textarea name="reviewer_note" rows="2">${escapeHtml(draft.reviewer_note || '')}</textarea></label>
      <label>proposed_review_status
        <select name="proposed_review_status">
          ${['pending', 'approved', 'needs_source']
            .map(
              (v) =>
                `<option value="${v}" ${(draft.proposed_review_status || 'pending') === v ? 'selected' : ''}>${v}</option>`
            )
            .join('')}
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
    proposed_review_status: fd.get('proposed_review_status') || 'pending',
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
