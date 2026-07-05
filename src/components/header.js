/**
 * @param {HTMLElement} container
 * @param {{ activeView: string, onNavigate: (view: string) => void }} props
 */
export function renderHeader(container, { activeView, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'graph', label: 'الكون الشبكي' },
    { id: 'story', label: 'Story Mode' },
    { id: 'search', label: 'البحث' },
    { id: 'surahs', label: 'السور' },
  ];

  container.innerHTML = `
    <header class="app-header">
      <div class="orn">✦ ✦ ✦</div>
      <h1 class="app-title">Quran Story Universe</h1>
      <p class="app-subtitle">أطلس القصص القرآني</p>
      <nav class="nav-tabs" aria-label="التنقل الرئيسي">
        ${tabs
          .map(
            (tab) => `
          <button class="nav-tab ${activeView === tab.id ? 'active' : ''}"
            data-view="${tab.id}" type="button">${tab.label}</button>`
          )
          .join('')}
      </nav>
    </header>
  `;

  container.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => onNavigate(btn.dataset.view));
  });
}
