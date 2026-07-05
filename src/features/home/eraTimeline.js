import { escapeHtml } from '../../lib/utils.js';
import { openStudyModal } from '../study/studyModal.js';

const DEFAULT_ERAS = [
  { icon: '🌙', title_ar: 'التدبير الخفي', node_ids: ['yusuf'], summary_ar: 'من البئر إلى التمكين' },
  { icon: '⚡', title_ar: 'مواجهة الطغيان', node_ids: ['musa'], summary_ar: 'السلطة والنجاة والعلم' },
  { icon: '🔥', title_ar: 'بناء التوحيد', node_ids: ['ibrahim'], summary_ar: 'التوحيد والبيت والذرية' },
  { icon: '🚢', title_ar: 'صبر الدعوة', node_ids: ['nuh'], summary_ar: 'سنن الدعوة والتكذيب' },
  { icon: '⭐', title_ar: 'المعجزة والاصطفاء', node_ids: ['maryam', 'isa'], summary_ar: 'البشارة والطهر' },
  { icon: '🕊️', title_ar: 'اكتمال الرسالة', node_ids: ['muhammad'], summary_ar: 'الوحي الخاتم وبناء الأمة' },
];

/**
 * @param {HTMLElement} container
 * @param {Object[]} nodes
 * @param {Object[]} [eras]
 */
export function renderEraTimeline(container, nodes, eras = DEFAULT_ERAS) {
  container.innerHTML = `
    <section id="timeline">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">المسار الزمني</span>
          <h2>رحلة الأنبياء عبر العصور</h2>
        </div>
        <div class="glass pad">
          <div class="era-path" id="era-path"></div>
          <div class="card" id="era-detail" style="margin-top:16px"></div>
        </div>
      </div>
    </section>
  `;

  const pathEl = container.querySelector('#era-path');
  pathEl.innerHTML = eras
    .map(
      (era, i) => `
    <div class="era card" data-era="${i}">
      <span class="icon">${era.icon}</span>
      <h3>${escapeHtml(era.title_ar)}</h3>
      <div class="sub">${escapeHtml(era.summary_ar)}</div>
    </div>`
    )
    .join('');

  const showEra = (index) => {
    const era = eras[index];
    const linked = era.node_ids
      .map((id) => nodes.find((n) => n.id === id))
      .filter(Boolean);
    container.querySelector('#era-detail').innerHTML = `
      <h3>${era.icon} ${escapeHtml(era.title_ar)}</h3>
      <p class="muted">${escapeHtml(era.summary_ar)}</p>
      <div class="actions" style="justify-content:flex-start;margin-top:12px">
        ${linked
          .map(
            (n) =>
              `<button class="btn sm" type="button" data-open="${n.id}">${escapeHtml(n.name_ar)}</button>`
          )
          .join('')}
      </div>
    `;
    container.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', () => openStudyModal({ type: 'node', id: btn.dataset.open }));
    });
  };

  pathEl.querySelectorAll('[data-era]').forEach((el) => {
    el.addEventListener('click', () => showEra(Number(el.dataset.era)));
  });

  showEra(0);
}

/**
 * @param {HTMLElement} container
 * @param {Object[]} nodes
 */
export function renderStudyCards(container, nodes) {
  const prophets = nodes.filter((n) => ['prophet', 'person'].includes(n.node_type));
  container.innerHTML = `
    <section id="study">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">الدراسة العميقة</span>
          <h2>غرف الأنبياء والشخصيات</h2>
        </div>
        <div class="results study-cards-grid" id="study-cards"></div>
      </div>
    </section>
  `;

  const grid = container.querySelector('#study-cards');
  grid.innerHTML = prophets
    .map(
      (p) => `
    <div class="card study-card" data-id="${p.id}">
      <span class="tag">${escapeHtml(p.short_title_ar || 'قصة')}</span>
      <h3>${escapeHtml(p.name_ar)}</h3>
      <p class="sub">${escapeHtml(p.summary_ar || '')}</p>
    </div>`
    )
    .join('');

  grid.querySelectorAll('.study-card').forEach((card) => {
    card.addEventListener('click', () =>
      openStudyModal({ type: 'node', id: card.dataset.id })
    );
  });
}
