import { getStoryBundle, isFinalContent } from '../../lib/dataService.js';
import { escapeHtml, formatAyahRef, reviewBadgeHtml, getReviewBadge } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';

const STORY_ICONS = ['🌙', '🕳️', '🏛️', '🔥', '🌊', '👑', '🕯️', '⭐', '🕊️'];

/**
 * @param {HTMLElement} container
 */
export async function renderStoryMode(container) {
  container.innerHTML = `
    <section id="story">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">Story Mode</span>
          <h2>رحلة قصصية تفاعلية</h2>
          <p>اختر قصة وانتقل بين مراحلها كما لو كنت داخل متحف حي.</p>
        </div>
        <div class="glass pad">
          <div id="story-root"><div class="state-box">جاري التحميل…</div></div>
        </div>
      </div>
    </section>
  `;

  const root = container.querySelector('#story-root');
  const repo = await (await import('../../lib/dataService.js')).getRepository();
  const prophets = (await repo.getNodes()).filter((n) =>
    ['prophet', 'person'].includes(n.node_type)
  );

  let selectedNodeId = prophets.find((p) => p.id === 'yusuf')?.id || prophets[0]?.id;
  let storyIndex = 0;

  async function renderStory() {
    const bundle = await getStoryBundle(selectedNodeId);
    if (!bundle?.node) {
      renderStateBox(root, 'empty');
      return;
    }

    const { node, events, eventAyahs, themes } = bundle;
    if (!events.length) {
      renderStateBox(root, 'empty', 'لا توجد أحداث مسجلة بعد.');
      return;
    }

    storyIndex = Math.min(storyIndex, events.length - 1);
    const current = events[storyIndex];
    const ayahs = eventAyahs.filter((a) => a.event_id === current.id);
    const themeChips = (current.theme_ids || [])
      .map((tid) => themes.find((t) => t.id === tid))
      .filter(Boolean);

    const draftBanner = !isFinalContent(current)
      ? `<div class="draft-banner">محتوى ${getReviewBadge(current.review_status).label} — ليس تفسيرًا نهائيًا.</div>`
      : '';

    root.innerHTML = `
      <div class="search-box story-controls">
        <select id="storySelect">
          ${prophets.map((p) => `<option value="${p.id}" ${p.id === selectedNodeId ? 'selected' : ''}>${escapeHtml(p.name_ar)}</option>`).join('')}
        </select>
        <button class="btn primary" id="story-next" type="button">التالي</button>
        <button class="btn" id="story-prev" type="button">السابق</button>
      </div>
      <div class="story-stage">
        <div class="story-list" id="storyList">
          ${events
            .map(
              (ev, i) => `
            <button class="btn story-step-btn ${i === storyIndex ? 'primary' : ''}" data-idx="${i}" type="button">${i + 1}. ${escapeHtml(ev.title_ar)}</button>`
            )
            .join('')}
        </div>
        <div class="story-visual">
          ${draftBanner}
          <div class="story-icon">${STORY_ICONS[storyIndex % STORY_ICONS.length]}</div>
          <h3>${escapeHtml(current.title_ar)}</h3>
          <p>${escapeHtml(current.summary_ar)}</p>
          <div>${themeChips.map((t) => `<span class="tag green">${escapeHtml(t.name_ar)}</span>`).join('')}</div>
          <div class="ayah-card-inline">
            ${ayahs.map((a) => `<span class="tag blue">${formatAyahRef(a.surah_id, a.ayah_from, a.ayah_to)}</span>`).join('')}
            ${reviewBadgeHtml(current.review_status)}
          </div>
          <br />
          <button class="btn primary" id="story-open-study" type="button">فتح الدراسة الكاملة</button>
        </div>
      </div>
    `;

    root.querySelector('#storySelect').addEventListener('change', (e) => {
      selectedNodeId = e.target.value;
      storyIndex = 0;
      renderStory();
    });

    root.querySelector('#story-next').addEventListener('click', () => {
      storyIndex = (storyIndex + 1) % events.length;
      renderStory();
    });

    root.querySelector('#story-prev').addEventListener('click', () => {
      storyIndex = (storyIndex - 1 + events.length) % events.length;
      renderStory();
    });

    root.querySelectorAll('[data-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        storyIndex = Number(btn.dataset.idx);
        renderStory();
      });
    });

    root.querySelector('#story-open-study').addEventListener('click', () => {
      openStudyModal({ type: 'node', id: node.id });
    });
  }

  await renderStory();
}
