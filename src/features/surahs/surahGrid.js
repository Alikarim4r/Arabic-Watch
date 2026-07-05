import { getRepository } from '../../lib/dataService.js';
import { escapeHtml } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';

/**
 * @param {HTMLElement} container
 */
export async function renderSurahGrid(container) {
  container.innerHTML = `
    <section id="surahs">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">المصحف الموضوعي</span>
          <h2>ملاحة 114 سورة</h2>
        </div>
        <div class="glass pad">
          <div class="surah-grid" id="surahGrid"></div>
          <div class="card" id="surahDetail" style="margin-top:18px"></div>
        </div>
      </div>
    </section>
  `;

  const grid = container.querySelector('#surahGrid');
  renderStateBox(grid, 'loading');

  try {
    const repo = await getRepository();
    const surahs = await repo.getSurahs();
    const nodes = await repo.getNodes();

    grid.innerHTML = surahs
      .sort((a, b) => a.id - b.id)
      .map(
        (s) => `
      <div class="surah" data-surah="${s.id}">
        <strong>${s.id}</strong>
        <span>${escapeHtml(s.name_ar)}</span>
      </div>`
      )
      .join('');

    const selectSurah = (n, scroll = true) => {
      grid.querySelectorAll('.surah').forEach((el) => {
        el.classList.toggle('active', Number(el.dataset.surah) === n);
      });

      const linked = nodes.filter((node) => {
        const eventSurahs = [12, 28, 20, 21, 2, 71, 11, 3, 19, 96];
        return eventSurahs.includes(n) && ['prophet', 'person'].includes(node.node_type);
      });

      container.querySelector('#surahDetail').innerHTML = `
        <h3>سورة ${escapeHtml(surahs.find((s) => s.id === n)?.name_ar || '')} <span class="tag blue">${n}</span></h3>
        ${
          linked.length
            ? `<p class="muted">العقد المرتبطة:</p><div class="results">${linked
                .map(
                  (p) => `
              <div class="card" data-node="${p.id}">
                <h3>${escapeHtml(p.name_ar)}</h3>
                <p>${escapeHtml(p.short_title_ar || p.summary_ar || '')}</p>
              </div>`
                )
                .join('')}</div>`
            : '<p class="muted">لا توجد عقد قصصية كبرى مصنّفة لهذه السورة في النسخة الحالية — يمكن إضافتها بعد المراجعة.</p>'
        }
        <div class="actions" style="justify-content:flex-start;margin-top:12px">
          <button class="btn sm primary" type="button" id="open-surah-study">فتح الدراسة</button>
        </div>
      `;

      container.querySelectorAll('[data-node]').forEach((card) => {
        card.addEventListener('click', () =>
          openStudyModal({ type: 'node', id: card.dataset.node })
        );
      });

      container.querySelector('#open-surah-study')?.addEventListener('click', () => {
        openStudyModal({ type: 'surah', id: String(n) });
      });

      if (scroll) container.querySelector('#surahDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    grid.querySelectorAll('.surah').forEach((el) => {
      el.addEventListener('click', () => selectSurah(Number(el.dataset.surah)));
    });

    selectSurah(12, false);
  } catch (err) {
    renderStateBox(grid, 'error', err.message);
  }
}
