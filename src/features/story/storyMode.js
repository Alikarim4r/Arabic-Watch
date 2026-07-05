import { getStoryBundle, isFinalContent } from '../../lib/dataService.js';
import { escapeHtml, formatAyahRef, reviewBadgeHtml, getReviewBadge } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';
import { setState } from '../../lib/state.js';

/**
 * @param {HTMLElement} container
 * @param {string|null} selectedNodeId
 * @param {string|null} selectedEventId
 */
export async function renderStoryMode(container, selectedNodeId, selectedEventId) {
  container.innerHTML = `<section class="panel"><div id="story-root"></div></section>`;
  const root = container.querySelector('#story-root');
  renderStateBox(root, 'loading');

  try {
    const repo = await (await import('../../lib/dataService.js')).getRepository();
    const prophets = (await repo.getNodes()).filter((n) =>
      ['prophet', 'person'].includes(n.node_type)
    );

    if (!selectedNodeId) selectedNodeId = prophets[0]?.id || null;

    const bundle = selectedNodeId ? await getStoryBundle(selectedNodeId) : null;
    if (!bundle?.node) {
      renderStateBox(root, 'empty', 'اختر شخصية لبدء Story Mode.');
      return;
    }

    const { node, events, eventAyahs, themes } = bundle;
    let currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
    if (!currentEvent) {
      renderStateBox(root, 'empty', 'لا توجد أحداث مسجلة لهذه الشخصية بعد.');
      return;
    }

    const render = () => {
      const idx = events.findIndex((e) => e.id === currentEvent.id);
      const ayahs = eventAyahs.filter((a) => a.event_id === currentEvent.id);
      const themeChips = (currentEvent.theme_ids || [])
        .map((tid) => themes.find((t) => t.id === tid))
        .filter(Boolean);

      const draftBanner = !isFinalContent(currentEvent)
        ? `<div class="draft-banner">هذا المحتوى ليس تفسيرًا نهائيًا — ${getReviewBadge(currentEvent.review_status).label}.</div>`
        : '';

      root.innerHTML = `
        <div class="story-layout">
          <aside class="story-timeline">
            <h3 class="panel-title">${escapeHtml(node.name_ar)}</h3>
            <p class="muted">${escapeHtml(node.summary_ar || '')}</p>
            <div class="chip-row">${reviewBadgeHtml(node.review_status)}</div>
            <hr style="border-color:var(--line);margin:12px 0" />
            ${events
              .map(
                (ev) => `
              <button class="timeline-item ${ev.id === currentEvent.id ? 'active' : ''}" data-event="${ev.id}" type="button">
                <div class="order">${ev.event_order}</div>
                <div>${escapeHtml(ev.title_ar)}</div>
              </button>`
              )
              .join('')}
            <div class="chip-row" style="margin-top:12px">
              ${prophets
                .map(
                  (p) =>
                    `<button class="chip ${p.id === node.id ? 'active' : ''}" data-node="${p.id}" type="button">${escapeHtml(p.name_ar.split(' ')[0])}</button>`
                )
                .join('')}
            </div>
          </aside>
          <article class="story-detail panel">
            ${draftBanner}
            <h2>${escapeHtml(currentEvent.title_ar)}</h2>
            <p>${escapeHtml(currentEvent.summary_ar)}</p>
            <div class="chip-row">
              ${reviewBadgeHtml(currentEvent.review_status)}
              <span class="chip">${escapeHtml(currentEvent.certainty_level || 'quran_explicit')}</span>
            </div>

            <div class="ayah-card">
              <h4>الآيات المرتبطة</h4>
              ${
                ayahs.length
                  ? ayahs
                      .map(
                        (a) => `
                  <p><strong>${formatAyahRef(a.surah_id, a.ayah_from, a.ayah_to)}</strong>
                  <span class="muted"> — ${escapeHtml(a.relation_type)}</span></p>`
                      )
                      .join('')
                  : '<p class="muted">لا توجد آيات مرتبطة بعد.</p>'
              }
            </div>

            <div class="study-section">
              <h4>المحاور</h4>
              <div class="chip-row">
                ${
                  themeChips.length
                    ? themeChips.map((t) => `<span class="chip">${escapeHtml(t.name_ar)}</span>`).join('')
                    : '<span class="muted">—</span>'
                }
              </div>
            </div>

            <div class="study-section">
              <h4>دروس تعليمية</h4>
              <ul class="lesson-list">
                ${
                  (currentEvent.lessons_ar || []).length
                    ? currentEvent.lessons_ar.map((l) => `<li>${escapeHtml(l)}</li>`).join('')
                    : '<li class="muted">لا توجد دروس مراجعة بعد.</li>'
                }
              </ul>
            </div>

            <div class="study-section">
              <h4>المصادر</h4>
              <ul class="source-list">
                ${
                  (currentEvent.sources || []).length
                    ? currentEvent.sources
                        .map((s) => `<li>${escapeHtml(s.note_ar || s.source_id)}</li>`)
                        .join('')
                    : '<li class="muted">يحتاج مصدر — لا يُعرض كتفسير نهائي.</li>'
                }
              </ul>
            </div>

            <div class="story-nav">
              <button class="btn" id="story-prev" type="button" ${idx <= 0 ? 'disabled' : ''}>الحدث السابق</button>
              <button class="btn" id="story-study" type="button">فتح الدراسة</button>
              <button class="btn" id="story-next" type="button" ${idx >= events.length - 1 ? 'disabled' : ''}>الحدث التالي</button>
            </div>
          </article>
        </div>
      `;

      root.querySelectorAll('[data-event]').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentEvent = events.find((e) => e.id === btn.dataset.event);
          setState({ selectedEventId: currentEvent.id });
          render();
        });
      });

      root.querySelectorAll('[data-node]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          setState({ selectedNodeId: btn.dataset.node, selectedEventId: null });
          await renderStoryMode(container, btn.dataset.node, null);
        });
      });

      root.querySelector('#story-prev')?.addEventListener('click', () => {
        if (idx > 0) {
          currentEvent = events[idx - 1];
          setState({ selectedEventId: currentEvent.id });
          render();
        }
      });

      root.querySelector('#story-next')?.addEventListener('click', () => {
        if (idx < events.length - 1) {
          currentEvent = events[idx + 1];
          setState({ selectedEventId: currentEvent.id });
          render();
        }
      });

      root.querySelector('#story-study')?.addEventListener('click', () => {
        openStudyModal({ type: 'event', id: currentEvent.id, nodeId: node.id });
      });
    };

    render();
  } catch (err) {
    renderStateBox(root, 'error', err.message);
  }
}
