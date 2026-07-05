import { renderDisclaimer } from './components/disclaimer.js';
import { renderHeader } from './components/header.js';
import { renderStateBox } from './components/loadingState.js';
import { getState, setState, subscribe } from './lib/state.js';
import { configure, getRepository } from './lib/dataService.js';
import { renderGraphView, destroyGraphView } from './features/graph/graphView.js';
import { renderStoryMode } from './features/story/storyMode.js';
import { renderSearchView } from './features/search/searchUI.js';
import { renderSurahGrid } from './features/surahs/surahGrid.js';

configure({ provider: 'local', publicMode: true });

const disclaimerMount = document.querySelector('#disclaimer-mount');
const headerMount = document.querySelector('#header-mount');
const viewMount = document.querySelector('#view-mount');

renderDisclaimer(disclaimerMount);

async function bootstrap() {
  renderStateBox(viewMount, 'loading');
  try {
    await getRepository();
    setState({ loading: false, error: null });
  } catch (err) {
    setState({ loading: false, error: err.message });
    renderStateBox(viewMount, 'error', err.message);
  }
}

function renderApp() {
  const state = getState();
  renderHeader(headerMount, {
    activeView: state.activeView,
    onNavigate: (view) => {
      if (view !== 'graph') destroyGraphView();
      setState({ activeView: view });
    },
  });

  viewMount.innerHTML = '';

  switch (state.activeView) {
    case 'graph':
      renderGraphView(viewMount);
      break;
    case 'story':
      renderStoryMode(viewMount, state.selectedNodeId, state.selectedEventId);
      break;
    case 'search':
      renderSearchView(viewMount, state.searchFilters, (filters) => {
        Object.assign(state.searchFilters, filters);
      });
      break;
    case 'surahs':
      renderSurahGrid(viewMount);
      break;
    default:
      renderHome(viewMount);
  }
}

function renderHome(container) {
  container.innerHTML = `
    <section class="panel">
      <h2 class="panel-title">مرحبًا في أطلس القصص القرآني</h2>
      <p>استكشف شبكة العلاقات بين الأنبياء والمحاور والأماكن، أو انتقل إلى Story Mode لقراءة الأحداث مرتبة بالآيات.</p>
      <div class="chip-row" style="margin-top:16px">
        <button class="btn" data-go="graph" type="button">الكون الشبكي</button>
        <button class="btn" data-go="story" type="button">Story Mode — يوسف</button>
        <button class="btn" data-go="search" type="button">البحث</button>
        <button class="btn" data-go="surahs" type="button">شبكة السور</button>
      </div>
      <div class="study-section">
        <h4>حالة المشروع</h4>
        <ul class="lesson-list">
          <li>البيانات محلية عبر JSON — جاهزة للربط مع Supabase.</li>
          <li>المحتوى غير المراجع يظهر بشارات واضحة وليس كتفسير نهائي.</li>
          <li>كل حدث مرتبط بسورة وآية/مدى آيات.</li>
        </ul>
      </div>
    </section>
  `;

  container.querySelector('[data-go="story"]').addEventListener('click', () => {
    setState({ activeView: 'story', selectedNodeId: 'yusuf', selectedEventId: null });
  });

  container.querySelectorAll('[data-go]').forEach((btn) => {
    if (btn.dataset.go === 'story') return;
    btn.addEventListener('click', () => setState({ activeView: btn.dataset.go }));
  });
}

let renderToken = '';

subscribe((state) => {
  const token = `${state.activeView}|${state.selectedNodeId}|${state.selectedEventId}|${state.graphPaused}`;
  if (token === renderToken && renderToken) return;
  renderToken = token;
  renderApp();
});
bootstrap();
