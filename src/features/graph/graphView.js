import { getGraphData } from '../../lib/dataService.js';
import { escapeHtml, nodeTypeLabel } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { createGraphCanvas } from './graphCanvas.js';
import { openStudyModal } from '../study/studyModal.js';
import { triggerSearch } from '../search/searchUI.js';
import { setState, getState } from '../../lib/state.js';

/** @type {ReturnType<createGraphCanvas>|null} */
let graphInstance = null;

/**
 * @param {HTMLElement} container
 */
export async function renderGraphView(container) {
  const state = getState();

  container.innerHTML = `
    <section id="universe">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">الكون التفاعلي</span>
          <h2>شبكة الأنبياء والسور والموضوعات</h2>
          <p>اسحب الشبكة، كبّر وصغّر، واضغط على العقد لفتح الدراسة أو الانتقال.</p>
        </div>
        <div id="universeWrap" class="glass">
          <canvas id="universe2d"></canvas>
          <div class="mode-badge">Canvas Physics Graph</div>
          <div class="controls">
            <button type="button" id="graph-zoom-in">＋</button>
            <button type="button" id="graph-zoom-out">−</button>
            <button type="button" id="graph-reset">⟲</button>
            <button type="button" id="graph-pause" class="${state.graphPaused ? '' : 'active'}">${state.graphPaused ? '▶ الحركة' : '⏯ الحركة'}</button>
          </div>
          <div class="legend">
            <div><span class="dot d1"></span>نبي</div>
            <div><span class="dot d2"></span>سورة</div>
            <div><span class="dot d3"></span>موضوع</div>
            <div><span class="dot d4"></span>شخصية</div>
            <div><span class="dot d5"></span>مكان</div>
          </div>
        </div>
        <div class="graph-filters pad" style="margin-top:14px">
          <div class="search-box graph-search-box">
            <input id="graph-search" type="search" placeholder="بحث داخل الشبكة…" value="${escapeHtml(state.graphFilters.query || '')}" />
            <select id="graph-type"><option value="">كل الأنواع</option></select>
            <select id="graph-theme"><option value="">كل المحاور</option></select>
            <select id="graph-place"><option value="">كل الأماكن</option></select>
            <select id="graph-surah"><option value="">كل السور</option></select>
          </div>
        </div>
      </div>
    </section>
  `;

  try {
    const { nodes, links, themes } = await getGraphData();
    fillSelect(container.querySelector('#graph-type'), uniqueTypes(nodes));
    fillSelect(container.querySelector('#graph-theme'), themes.map((t) => ({ v: t.id, l: t.name_ar })));
    fillSelect(
      container.querySelector('#graph-place'),
      nodes.filter((n) => n.node_type === 'place').map((n) => ({ v: n.id, l: n.name_ar }))
    );
    fillSelect(
      container.querySelector('#graph-surah'),
      [12, 28, 20, 2, 71, 11, 3, 19, 96].map((id) => ({ v: String(id), l: `سورة ${id}` }))
    );

    const canvas = container.querySelector('#universe2d');
    graphInstance = createGraphCanvas(canvas, {
      nodes,
      links,
      paused: state.graphPaused,
      onNodeClick: (node) => {
        if (node.node_type === 'theme') {
          triggerSearch(node.name_ar);
          document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if (['prophet', 'person', 'place', 'surah'].includes(node.node_type)) {
          openStudyModal({ type: 'node', id: node.id });
        }
      },
    });

    bindControls(container);
  } catch (err) {
    renderStateBox(container.querySelector('#universeWrap'), 'error', err.message);
  }
}

function fillSelect(sel, items) {
  items.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.v || item.value || item;
    opt.textContent = item.l || item.label || nodeTypeLabel(item) || item;
    sel.appendChild(opt);
  });
}

function uniqueTypes(nodes) {
  return [...new Set(nodes.map((n) => n.node_type))].map((t) => ({
    v: t,
    l: nodeTypeLabel(t),
  }));
}

function bindControls(container) {
  const apply = () => {
    const filters = {
      query: container.querySelector('#graph-search').value,
      nodeType: container.querySelector('#graph-type').value,
      themeId: container.querySelector('#graph-theme').value,
      placeId: container.querySelector('#graph-place').value,
      surahId: container.querySelector('#graph-surah').value,
    };
    setState({ graphFilters: filters });
    graphInstance?.setFilters(filters);
  };

  container.querySelector('#graph-search').addEventListener('input', apply);
  ['#graph-type', '#graph-theme', '#graph-place', '#graph-surah'].forEach((s) => {
    container.querySelector(s).addEventListener('change', apply);
  });

  container.querySelector('#graph-zoom-in').addEventListener('click', () => graphInstance?.zoomIn());
  container.querySelector('#graph-zoom-out').addEventListener('click', () => graphInstance?.zoomOut());
  container.querySelector('#graph-reset').addEventListener('click', () => graphInstance?.resetLayout());
  container.querySelector('#graph-pause').addEventListener('click', (e) => {
    const paused = graphInstance?.togglePause();
    setState({ graphPaused: paused });
    e.currentTarget.classList.toggle('active', !paused);
    e.currentTarget.textContent = paused ? '▶ الحركة' : '⏯ الحركة';
  });

  apply();
}

export function destroyGraphView() {
  graphInstance?.destroy();
  graphInstance = null;
}
