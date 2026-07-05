import { renderDisclaimer, DISCLAIMER_AR } from './components/disclaimer.js';
import { renderHero, renderStickyNav, renderFooter, renderMethodology } from './components/homeChrome.js';
import { renderStateBox } from './components/loadingState.js';
import { configure, getRepository } from './lib/dataService.js';
import { renderGraphView } from './features/graph/graphView.js';
import { renderStoryMode } from './features/story/storyMode.js';
import { renderSearchView } from './features/search/searchUI.js';
import { renderSurahGrid } from './features/surahs/surahGrid.js';
import { renderEraTimeline, renderStudyCards } from './features/home/eraTimeline.js';

configure({ provider: 'local', publicMode: true });

/** @type {null | (() => Promise<void>)} */
let rerenderStory = null;

document.addEventListener('qsu:select-story', (e) => {
  rerenderStory?.(e.detail?.nodeId);
});

async function bootstrap() {
  const main = document.querySelector('#app-main');
  const loading = document.createElement('div');
  loading.className = 'wrap';
  loading.innerHTML = '<div class="state-box">جاري تحميل الأطلس…</div>';
  main.prepend(loading);

  try {
    const repo = await getRepository();
    const [nodes, events, eventAyahs, themes] = await Promise.all([
      repo.getNodes(),
      repo.getEvents(),
      repo.getEventAyahs(),
      repo.getThemes(),
    ]);

    loading.remove();

    renderDisclaimer(document.querySelector('#disclaimer-mount'));
    renderHero(document.querySelector('#hero-mount'), {
      prophetCount: nodes.filter((n) => ['prophet', 'person'].includes(n.node_type)).length,
      themeCount: themes.length,
      ayahRefCount: eventAyahs.length,
    });
    renderStickyNav(document.querySelector('#nav-mount'));
    renderMethodology(document.querySelector('#method-mount'));

    await Promise.all([
      renderGraphView(document.querySelector('#universe-mount')),
      renderStoryMode(document.querySelector('#story-mount'), (fn) => {
        rerenderStory = fn;
      }),
      renderSearchView(document.querySelector('#search-mount')),
      renderSurahGrid(document.querySelector('#surahs-mount')),
    ]);

    renderEraTimeline(document.querySelector('#timeline-mount'), nodes);
    renderStudyCards(document.querySelector('#study-mount'), nodes);
    renderFooter(document.querySelector('#footer-mount'));
  } catch (err) {
    console.error(err);
    loading.remove();
    renderStateBox(main, 'error', err.message);
  }
}

bootstrap();

export { DISCLAIMER_AR };
