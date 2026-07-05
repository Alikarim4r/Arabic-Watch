import { getGraphData } from '../../lib/dataService.js';
import { escapeHtml, nodeTypeLabel, reviewBadgeHtml } from '../../lib/utils.js';
import { renderStateBox } from '../../components/loadingState.js';
import { createGraphCanvas } from './graphCanvas.js';
import { openStudyModal } from '../study/studyModal.js';
import { setState, getState } from '../../lib/state.js';

/** @type {ReturnType<createGraphCanvas>|null} */
let graphInstance = null;

/**
 * @param {HTMLElement} container
 */
export async function renderGraphView(container) {
  const state = getState();
  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">الكون الشبكي للقصص</h2>
      <div class="graph-toolbar">
        <input id="graph-search" type="search" placeholder="بحث داخل الشبكة…" value="${escapeHtml(state.graphFilters.query || '')}" />
        <select id="graph-type"><option value="">كل الأنواع</option></select>
        <select id="graph-surah"><option value="">كل السور</option></select>
        <select id="graph-theme"><option value="">كل المحاور</option></select>
        <select id="graph-place"><option value="">كل الأماكن</option></select>
        <button class="btn" id="graph-reset" type="button">إعادة ترتيب</button>
        <button class="btn" id="graph-pause" type="button">${state.graphPaused ? 'تشغيل الحركة' : 'إيقاف الحركة'}</button>
      </div>
      <div class="graph-layout">
        <div>
          <div class="graph-canvas-wrap">
            <canvas id="graph-canvas"></canvas>
          </div>
        </div>
        <aside id="graph-panel" class="graph-side-panel empty">
          <p>اضغط على عقدة لعرض التفاصيل</p>
        </aside>
      </div>
    </section>
  `;

  try {
    const { nodes, links, themes } = await getGraphData();
    populateSelect(container.querySelector('#graph-type'), uniqueTypes(nodes));
    populateSelect(container.querySelector('#graph-theme'), themes.map((t) => ({ value: t.id, label: t.name_ar })));
    populateSelect(
      container.querySelector('#graph-place'),
      nodes.filter((n) => n.node_type === 'place').map((n) => ({ value: n.id, label: n.name_ar }))
    );

    const surahNodes = nodes.filter((n) => n.node_type === 'surah');
    const eventSurahIds = new Set([12, 28, 20, 21, 2, 71, 11, 3, 19, 96]);
    populateSelect(
      container.querySelector('#graph-surah'),
      [...eventSurahIds].map((id) => ({ value: String(id), label: `سورة ${id}` }))
    );

    const canvas = container.querySelector('#graph-canvas');
    graphInstance = createGraphCanvas(canvas, {
      nodes,
      links,
      paused: state.graphPaused,
      onNodeClick: (node) => renderGraphPanel(container.querySelector('#graph-panel'), node),
    });

    bindGraphControls(container, nodes, links);
  } catch (err) {
    renderStateBox(container.querySelector('.graph-layout'), 'error', err.message);
  }
}

function populateSelect(select, items) {
  items.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.value || item;
    opt.textContent = item.label || nodeTypeLabel(item) || item;
    select.appendChild(opt);
  });
}

function uniqueTypes(nodes) {
  return [...new Set(nodes.map((n) => n.node_type))].map((t) => ({
    value: t,
    label: nodeTypeLabel(t),
  }));
}

function bindGraphControls(container, nodes, links) {
  const applyFilters = () => {
    const filters = {
      query: container.querySelector('#graph-search').value,
      nodeType: container.querySelector('#graph-type').value,
      surahId: container.querySelector('#graph-surah').value,
      themeId: container.querySelector('#graph-theme').value,
      placeId: container.querySelector('#graph-place').value,
    };
    setState({ graphFilters: filters });
    graphInstance?.setFilters(filters);
  };

  container.querySelector('#graph-search').addEventListener('input', applyFilters);
  ['#graph-type', '#graph-surah', '#graph-theme', '#graph-place'].forEach((sel) => {
    container.querySelector(sel).addEventListener('change', applyFilters);
  });

  container.querySelector('#graph-reset').addEventListener('click', () => graphInstance?.resetLayout());
  container.querySelector('#graph-pause').addEventListener('click', (e) => {
    const paused = graphInstance?.togglePause();
    setState({ graphPaused: paused });
    e.currentTarget.textContent = paused ? 'تشغيل الحركة' : 'إيقاف الحركة';
  });

  applyFilters();
}

/**
 * @param {HTMLElement} panel
 * @param {Object} node
 */
function renderGraphPanel(panel, node) {
  panel.classList.remove('empty');
  panel.innerHTML = `
    <h3>${escapeHtml(node.name_ar)}</h3>
    <p class="muted">${escapeHtml(node.summary_ar || '')}</p>
    <div class="chip-row">
      <span class="chip">${escapeHtml(nodeTypeLabel(node.node_type))}</span>
      ${reviewBadgeHtml(node.review_status)}
    </div>
    <div class="chip-row" style="margin-top:14px">
      <button class="btn" type="button" id="graph-open-story">Story Mode</button>
      <button class="btn" type="button" id="graph-open-study">دراسة</button>
    </div>
  `;

  panel.querySelector('#graph-open-story').addEventListener('click', () => {
    setState({ activeView: 'story', selectedNodeId: node.id });
  });
  panel.querySelector('#graph-open-study').addEventListener('click', () => {
    openStudyModal({ type: 'node', id: node.id });
  });
}

export function destroyGraphView() {
  graphInstance?.destroy();
  graphInstance = null;
}
