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

let cleanupStars = null;

async function bootstrap() {
  const main = document.querySelector('#app-main');
  main.innerHTML = '<div class="wrap"><div class="state-box">جاري تحميل الأطلس…</div></div>';

  try {
    const repo = await getRepository();
    const [nodes, events, eventAyahs, themes] = await Promise.all([
      repo.getNodes(),
      repo.getEvents(),
      repo.getEventAyahs(),
      repo.getThemes(),
    ]);

    renderDisclaimer(document.querySelector('#disclaimer-mount'));
    cleanupStars = renderHero(document.querySelector('#hero-mount'), {
      prophetCount: nodes.filter((n) => ['prophet', 'person'].includes(n.node_type)).length,
      themeCount: themes.length,
      ayahRefCount: eventAyahs.length,
    });
    renderStickyNav(document.querySelector('#nav-mount'));
    renderMethodology(document.querySelector('#method-mount'));

    main.innerHTML = '';
    const mounts = {
      universe: document.createElement('div'),
      story: document.createElement('div'),
      timeline: document.createElement('div'),
      search: document.createElement('div'),
      surahs: document.createElement('div'),
      study: document.createElement('div'),
    };

    Object.values(mounts).forEach((el) => main.appendChild(el));

    await Promise.all([
      renderGraphView(mounts.universe),
      renderStoryMode(mounts.story),
      renderSearchView(mounts.search),
      renderSurahGrid(mounts.surahs),
    ]);

    renderEraTimeline(mounts.timeline, nodes);
    renderStudyCards(mounts.study, nodes);
    renderFooter(document.querySelector('#footer-mount'));
  } catch (err) {
    console.error(err);
    main.innerHTML = '';
    renderStateBox(main, 'error', err.message);
  }
}

bootstrap();

export { DISCLAIMER_AR };
