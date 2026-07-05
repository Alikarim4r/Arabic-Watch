import { getRepository, isFinalContent } from '../../lib/dataService.js';
import { escapeHtml, formatAyahRef, reviewBadgeHtml, nodeTypeLabel } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';

/** @type {HTMLElement|null} */
let overlay = null;

/**
 * @param {{ type: string, id: string, nodeId?: string }} target
 */
export async function openStudyModal(target) {
  closeStudyModal();

  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true"><div id="study-body">...</div></div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeStudyModal();
  });

  const body = overlay.querySelector('#study-body');
  const repo = await getRepository();

  try {
    if (target.type === 'node') {
      const node = await repo.getNodeById(target.id);
      body.innerHTML = renderNodeStudy(node);
    } else if (target.type === 'event') {
      const event = await repo.getEventById(target.id);
      const ayahs = (await repo.getEventAyahs()).filter((a) => a.event_id === target.id);
      const sources = await repo.getTafsirSources();
      body.innerHTML = renderEventStudy(event, ayahs, sources);
    } else if (target.type === 'surah') {
      const surahs = await repo.getSurahs();
      const surah = surahs.find((s) => String(s.id) === String(target.id));
      body.innerHTML = renderSurahStudy(surah);
    } else {
      body.innerHTML = `<p class="muted">لا توجد مادة مراجعة كافية لهذا السؤال بعد.</p>${closeBtn()}`;
    }

    overlay.querySelector('.modal-close')?.addEventListener('click', closeStudyModal);
  } catch (err) {
    body.innerHTML = `<p class="state-box error">${escapeHtml(err.message)}</p>${closeBtn()}`;
    overlay.querySelector('.modal-close')?.addEventListener('click', closeStudyModal);
  }
}

function closeBtn() {
  return `<button class="modal-close" type="button" aria-label="إغلاق">×</button>`;
}

function renderNodeStudy(node) {
  if (!node) return `<p>لا توجد مادة.</p>${closeBtn()}`;
  return `
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(node.name_ar)}</h2>
        <p class="muted">${escapeHtml(node.short_title_ar || nodeTypeLabel(node.node_type))}</p>
      </div>
      ${closeBtn()}
    </div>
    ${reviewBadgeHtml(node.review_status)}
    <p style="margin-top:12px">${escapeHtml(node.summary_ar || '')}</p>
    <div class="study-section">
      <h4>مراجع ومصادر</h4>
      <p class="muted">${node.source_status === 'cited' ? 'مرتبط بنص قرآني — راجع الآيات في Story Mode.' : 'يحتاج توثيق مصدر إضافي.'}</p>
    </div>
    <div class="study-section">
      <p class="disclaimer-banner" style="font-size:14px">${DISCLAIMER_AR}</p>
    </div>
  `;
}

function renderEventStudy(event, ayahs, sources) {
  if (!event) return `<p>لا توجد مادة.</p>${closeBtn()}`;
  const finalNote = isFinalContent(event)
    ? ''
    : `<div class="draft-banner">محتوى غير نهائي — ${event.review_status === 'needs_source' ? 'يحتاج مصدر' : 'قيد المراجعة'}.</div>`;

  const sourceRows = (event.sources || []).map((s) => {
    const src = sources.find((x) => x.id === s.source_id);
    return `<li>${escapeHtml(src?.name_ar || s.source_id)} — ${escapeHtml(s.note_ar || '')}</li>`;
  });

  return `
    <div class="modal-header">
      <div>
        <h2>${escapeHtml(event.title_ar)}</h2>
        ${reviewBadgeHtml(event.review_status)}
      </div>
      ${closeBtn()}
    </div>
    ${finalNote}
    <p>${escapeHtml(event.summary_ar)}</p>
    <div class="study-section">
      <h4>الآيات</h4>
      <ul class="source-list">${ayahs.map((a) => `<li>${formatAyahRef(a.surah_id, a.ayah_from, a.ayah_to)} (${escapeHtml(a.relation_type)})</li>`).join('') || '<li class="muted">—</li>'}</ul>
    </div>
    <div class="study-section">
      <h4>دروس</h4>
      <ul class="lesson-list">${(event.lessons_ar || []).map((l) => `<li>${escapeHtml(l)}</li>`).join('') || '<li class="muted">—</li>'}</ul>
    </div>
    <div class="study-section">
      <h4>المصادر والمراجع</h4>
      <ul class="source-list">${sourceRows.join('') || '<li class="muted">لا توجد مادة مراجعة كافية لهذا السؤال بعد.</li>'}</ul>
    </div>
    <div class="study-section"><p class="disclaimer-banner" style="font-size:14px">${DISCLAIMER_AR}</p></div>
  `;
}

function renderSurahStudy(surah) {
  if (!surah) return `<p>لا توجد مادة.</p>${closeBtn()}`;
  return `
    <div class="modal-header">
      <div><h2>${escapeHtml(surah.name_ar)}</h2><p class="muted">${surah.ayah_count} آية</p></div>
      ${closeBtn()}
    </div>
    <p>سورة ${surah.revelation_type === 'makkah' ? 'مكية' : 'مدنية'} — ${escapeHtml(surah.name_en || '')}</p>
    <div class="study-section">
      <h4>مراجع</h4>
      <p class="muted">اعتمد النص الرسمي من مصدر مرخّص قبل العرض النهائي.</p>
    </div>
    <div class="study-section"><p class="disclaimer-banner" style="font-size:14px">${DISCLAIMER_AR}</p></div>
  `;
}

export function closeStudyModal() {
  overlay?.remove();
  overlay = null;
}
