import { getRepository } from '../../lib/dataService.js';
import { escapeHtml } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { openStudyModal } from '../study/studyModal.js';

/**
 * @param {HTMLElement} container
 */
export async function renderSurahGrid(container) {
  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">المصحف الموضوعي — شبكة السور</h2>
      <p class="muted" style="margin-bottom:12px">اضغط على سورة للانتقال إلى الأحداث المرتبطة أو الدراسة.</p>
      <div id="surah-grid" class="grid-cards"></div>
    </section>
  `;

  const grid = container.querySelector('#surah-grid');
  renderStateBox(grid, 'loading');

  try {
    const surahs = await (await getRepository()).getSurahs();
    if (!surahs.length) {
      renderStateBox(grid, 'empty');
      return;
    }

    grid.innerHTML = surahs
      .sort((a, b) => a.id - b.id)
      .map(
        (s) => `
      <button class="card-btn ${s.featured ? 'featured' : ''}" data-surah="${s.id}" type="button">
        <div class="num">${s.id}</div>
        <div class="name">${escapeHtml(s.name_ar)}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">${s.ayah_count} آية</div>
      </button>`
      )
      .join('');

    grid.querySelectorAll('[data-surah]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openStudyModal({ type: 'surah', id: btn.dataset.surah });
      });
    });
  } catch (err) {
    renderStateBox(grid, 'error', err.message);
  }
}
