import { getRepository, isFinalContent, getStoryBundle, getEvidenceWarningAr } from '../../lib/dataService.js';
import { escapeHtml, formatAyahRef, getNodesForSurah, nodeTypeLabel } from '../../lib/utils.js';
import { renderAyahRangeHtml, bindMushafOpenButtons } from '../../lib/ayahDisplay.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';

/** @type {HTMLElement|null} */
let overlay = null;

/**
 * @param {{ type: string, id: string, nodeId?: string }} target
 */
export async function openStudyModal(target) {
  closeStudyModal();

  overlay = document.createElement('div');
  overlay.className = 'modal show';
  overlay.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true"><div id="study-body">...</div></div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeStudyModal();
  });

  const body = overlay.querySelector('#study-body');
  const repo = await getRepository();

  try {
    if (target.type === 'node' || target.type === 'prophet' || target.type === 'person') {
      const node = await repo.getNodeById(target.id);
      const bundle = await getStoryBundle(target.id);
      body.innerHTML = await renderRichNodeStudy(node, bundle, repo);
    } else if (target.type === 'event') {
      const event = await repo.getEventById(target.id);
      const ayahs = (await repo.getEventAyahs()).filter((a) => a.event_id === target.id);
      const sources = await repo.getTafsirSources();
      body.innerHTML = await renderEventStudy(event, ayahs, sources, repo);
    } else if (target.type === 'surah') {
      const surahs = await repo.getSurahs();
      const surah = surahs.find((s) => String(s.id) === String(target.id));
      const [nodes, links] = await Promise.all([repo.getNodes(), repo.getLinks()]);
      body.innerHTML = renderSurahStudy(surah, nodes, links);
    } else if (target.type === 'theme') {
      const themes = await repo.getThemes();
      const theme = themes.find((t) => t.id === target.id);
      const node = await repo.getNodeById(target.id);
      body.innerHTML = renderThemeStudy(theme || node);
    } else {
      body.innerHTML = `<div class="modal-body"><p class="muted">لا توجد مادة مراجعة كافية لهذا السؤال بعد.</p>${closeBtn()}</div>`;
    }

    overlay.querySelector('.close')?.addEventListener('click', closeStudyModal);
    overlay.querySelector('[data-goto-story]')?.addEventListener('click', () => {
      const nodeId = target.id;
      closeStudyModal();
      document.dispatchEvent(new CustomEvent('qsu:select-story', { detail: { nodeId } }));
      document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
    });
    bindMushafOpenButtons(body);
  } catch (err) {
    body.innerHTML = `<div class="modal-body"><p class="state-box error">${escapeHtml(err.message)}</p>${closeBtn()}</div>`;
    overlay.querySelector('.close')?.addEventListener('click', closeStudyModal);
  }
}

function closeBtn() {
  return `<button class="close" type="button">إغلاق ✕</button>`;
}

async function renderRichNodeStudy(node, bundle, repo) {
  if (!node) return `<div class="modal-body"><p>لا توجد مادة.</p>${closeBtn()}</div>`;

  const { events, eventAyahs, themes, tafsirSources } = bundle;
  const [allNodes, links] = await Promise.all([repo.getNodes(), repo.getLinks()]);
  const draftNote = !isFinalContent(node)
    ? `<div class="draft-banner">${reviewBadgeHtml(node.review_status)} — محتوى تعليمي غير نهائي.</div>`
    : '';

  const linkedThemeIds = links
    .filter((l) => l.source_node_id === node.id && l.relation_type === 'embodies_theme')
    .map((l) => l.target_node_id);
  const themeTags = themes
    .filter(
      (t) =>
        linkedThemeIds.includes(t.id) || events.some((e) => e.theme_ids?.includes(t.id))
    )
    .map((t) => `<span class="tag green">${escapeHtml(t.name_ar)}</span>`)
    .join('');

  const relatedPeople = links
    .filter((l) => l.source_node_id === node.id && l.relation_type === 'related_to')
    .map((l) => allNodes.find((n) => n.id === l.target_node_id))
    .filter(Boolean);
  const relatedPlaces = links
    .filter((l) => l.source_node_id === node.id && l.relation_type === 'located_in')
    .map((l) => allNodes.find((n) => n.id === l.target_node_id))
    .filter(Boolean);

  const peopleTags = relatedPeople
    .map((p) => `<span class="tag rose">${escapeHtml(p.name_ar)}</span>`)
    .join('');
  const placeTags = relatedPlaces
    .map((p) => `<span class="tag blue">${escapeHtml(p.name_ar)}</span>`)
    .join('');

  const eventSteps = events
    .map((ev, i) => {
      const warn = getEvidenceWarningAr(ev);
      return `
    <div class="step"><b>${i + 1}.</b> ${escapeHtml(ev.title_ar)} ${reviewBadgeHtml(ev.review_status)}${warn ? `<span class="tag rose">⚠</span>` : ''}</div>`;
    })
    .join('');

  const ayahBlockParts = [];
  for (const ev of events) {
    const refs = eventAyahs.filter((a) => a.event_id === ev.id);
    const evWarn = getEvidenceWarningAr(ev);
    if (!refs.length) {
      ayahBlockParts.push(
        `<div class="ayah draft-banner"><p>${escapeHtml(evWarn || 'لا يوجد ربط آيات دقيق لهذا الحدث.')}</p></div>`
      );
      continue;
    }
    for (const a of refs) {
      const quranHtml = await renderAyahRangeHtml(repo, a.surah_id, a.ayah_from, a.ayah_to);
      ayahBlockParts.push(`
      <div class="ayah-evidence-block">
        <small>${formatAyahRef(a.surah_id, a.ayah_from, a.ayah_to)} — ${escapeHtml(a.relation_type)}</small>
        ${quranHtml}
        <p>${escapeHtml(a.evidence_note_ar || a.note_ar || ev.summary_ar || '')}</p>
        ${evWarn ? `<p class="muted">${escapeHtml(evWarn)}</p>` : ''}
      </div>`);
    }
  }
  const ayahBlocks = ayahBlockParts.join('');

  const draftLessons = (node.lessons_ar || [])
    .map((l) => `<li>${escapeHtml(l)} <span class="tag rose">مسودة</span></li>`)
    .join('');

  const sourceCards = (tafsirSources || [])
    .map(
      (s) => `
    <div class="tafsir">
      <b>${escapeHtml(s.name_ar)}</b>
      <p class="muted">${escapeHtml(s.license_note || '')}</p>
      ${s.is_approved ? '<span class="tag green">مصدر مسجّل</span>' : '<span class="tag rose">يحتاج مراجعة</span>'}
    </div>`
    )
    .join('');

  const conclusion = node.network_conclusion_ar || networkConclusion(node.id);
  const conclusionDraft =
    node.network_conclusion_review_status && node.network_conclusion_review_status !== 'approved'
      ? `<div class="draft-banner">${reviewBadgeHtml(node.network_conclusion_review_status)} — استنتاج تعليمي غير نهائي.</div>`
      : '';

  const storyBtn =
    events.length > 0
      ? `<button class="btn primary" type="button" data-goto-story style="margin-top:14px">افتح Story Mode</button>`
      : '';

  return `
    <div class="modal-head">
      <h2>${escapeHtml(node.name_ar)}</h2>
      ${closeBtn()}
    </div>
    <div class="modal-body">
      ${draftNote}
      <div class="grid g2">
        <div>
          <h3 class="gold">المحور</h3>
          <p>${escapeHtml(node.short_title_ar || node.summary_ar || '')}</p>
          <div>${themeTags || '<span class="muted">—</span>'}</div>
          ${
            peopleTags || placeTags
              ? `<h3 class="gold" style="margin-top:18px">الشخصيات والأماكن</h3>
          <div>${peopleTags}${placeTags}</div>`
              : ''
          }
          <h3 class="gold" style="margin-top:18px">خط الأحداث</h3>
          <div class="timeline">${eventSteps || '<p class="muted">—</p>'}</div>
        </div>
        <div>
          <h3 class="gold">النوع والمراجعة</h3>
          <p><span class="tag">${escapeHtml(nodeTypeLabel(node.node_type))}</span> ${reviewBadgeHtml(node.review_status)}</p>
          ${storyBtn}
        </div>
      </div>
      <h3 class="gold" style="margin-top:18px">الآيات والمواضع</h3>
      ${ayahBlocks || '<p class="muted">لا توجد آيات مرتبطة بعد.</p>'}
      ${
        draftLessons
          ? `<h3 class="gold">دروس تعليمية (مسودة)</h3><ul class="lesson-list">${draftLessons}</ul>`
          : ''
      }
      <h3 class="gold">المصادر والمراجع</h3>
      <div class="tafsirs">${sourceCards || '<p class="muted">لا توجد مادة مراجعة كافية بعد.</p>'}</div>
      <h3 class="gold" style="margin-top:18px">الاستنتاج الشبكي</h3>
      ${conclusionDraft}
      <div class="card">${escapeHtml(conclusion)}</div>
      <p class="disclaimer-banner" style="margin-top:16px;font-size:14px">${DISCLAIMER_AR}</p>
    </div>
  `;
}

function networkConclusion(id) {
  const map = {
    musa: 'شبكة موسى تجمع بين الحفظ الإلهي، الإعداد النفسي، مواجهة الطغيان، وتربية الأمة — وفق ما ورد في القرآن.',
    yusuf: 'شبكة يوسف تكشف كيف يتحول الابتلاء إلى تمكين وعدل — دون تجاوز النص القرآني.',
    ibrahim: 'شبكة إبراهيم تنقل التوحيد من الحجة إلى مشروع أمة وبيت — يحتاج بعض الأحداث مراجعة مصدر.',
    muhammad: 'شبكة محمد ﷺ تمثل اكتمال الرسالة وبناء الأمة — محتوى مراجع جزئياً.',
  };
  return map[id] || 'هذه العقدة نموذجٌ تعليمي داخل شبكة القصص القرآني — راجع الآيات والمصادر قبل الاعتماد النهائي.';
}

async function renderEventStudy(event, ayahs, sources, repo) {
  if (!event) return `<div class="modal-body"><p>لا توجد مادة.</p>${closeBtn()}</div>`;
  const finalNote = !isFinalContent(event)
    ? `<div class="draft-banner">${escapeHtml(getEvidenceWarningAr(event) || `محتوى غير نهائي — ${event.review_status === 'needs_source' ? 'يحتاج مصدر' : 'قيد المراجعة'}.`)}</div>`
    : '';

  const ayahSections = [];
  for (const a of ayahs) {
    ayahSections.push(await renderAyahRangeHtml(repo, a.surah_id, a.ayah_from, a.ayah_to));
  }

  const sourceRows = (event.sources || []).map((s) => {
    const src = sources.find((x) => x.id === s.source_id);
    return `<li>${escapeHtml(src?.name_ar || s.source_id)} — ${escapeHtml(s.note_ar || '')}</li>`;
  });

  return `
    <div class="modal-head">
      <h2>${escapeHtml(event.title_ar)}</h2>
      ${closeBtn()}
    </div>
    <div class="modal-body">
      ${finalNote}
      ${reviewBadgeHtml(event.review_status)}
      <p style="margin-top:12px">${escapeHtml(event.summary_ar)}</p>
      <h3 class="gold" style="margin-top:18px">الآيات</h3>
      ${ayahSections.join('') || '<p class="muted">—</p>'}
      <h3 class="gold">دروس تعليمية</h3>
      <ul class="lesson-list">${(event.lessons_ar || []).map((l) => `<li>${escapeHtml(l)}</li>`).join('') || '<li class="muted">—</li>'}</ul>
      <h3 class="gold">المصادر</h3>
      <ul class="source-list">${sourceRows.join('') || '<li class="muted">لا توجد مادة مراجعة كافية لهذا السؤال بعد.</li>'}</ul>
      <p class="disclaimer-banner" style="margin-top:16px;font-size:14px">${DISCLAIMER_AR}</p>
    </div>
  `;
}

function renderSurahStudy(surah, nodes = [], links = []) {
  if (!surah) return `<div class="modal-body"><p>لا توجد مادة.</p>${closeBtn()}</div>`;
  const linked = getNodesForSurah(surah.id, nodes, links);
  return `
    <div class="modal-head">
      <h2>${escapeHtml(surah.name_ar)}</h2>
      ${closeBtn()}
    </div>
    <div class="modal-body">
      <p>${surah.ayah_count} آية — ${surah.revelation_type === 'makkah' ? 'مكية' : 'مدنية'}</p>
      ${
        linked.length
          ? `<h3 class="gold" style="margin-top:18px">العقد المرتبطة</h3>
      <ul class="source-list">${linked.map((n) => `<li>${escapeHtml(n.name_ar)} — ${escapeHtml(n.short_title_ar || n.summary_ar || '')}</li>`).join('')}</ul>`
          : '<p class="muted">لا توجد عقد قصصية كبرى مصنّفة لهذه السورة بعد المراجعة.</p>'
      }
      <p class="disclaimer-banner" style="margin-top:16px;font-size:14px">${DISCLAIMER_AR}</p>
    </div>
  `;
}

function renderThemeStudy(theme) {
  if (!theme) return `<div class="modal-body"><p>لا توجد مادة.</p>${closeBtn()}</div>`;
  const draft = theme.review_status && theme.review_status !== 'approved'
    ? `<div class="draft-banner">${reviewBadgeHtml(theme.review_status)} — محتوى تعليمي غير نهائي.</div>`
    : '';
  return `
    <div class="modal-head">
      <h2>${escapeHtml(theme.name_ar)}</h2>
      ${closeBtn()}
    </div>
    <div class="modal-body">
      ${draft}
      ${reviewBadgeHtml(theme.review_status || 'pending')}
      <p style="margin-top:12px">${escapeHtml(theme.description_ar || theme.summary_ar || '')}</p>
      <p class="disclaimer-banner" style="margin-top:16px;font-size:14px">${DISCLAIMER_AR}</p>
    </div>
  `;
}

export function closeStudyModal() {
  overlay?.remove();
  overlay = null;
}
