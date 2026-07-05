import { prefersReducedMotion } from '../lib/utils.js';

/**
 * @param {HTMLCanvasElement} canvas
 */
export function initStarsCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animId = 0;
  const reduced = prefersReducedMotion();

  function resize() {
    const hero = canvas.closest('.hero');
    canvas.width = window.innerWidth;
    canvas.height = hero?.offsetHeight || window.innerHeight;
    stars = Array.from({ length: 135 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      v: Math.random() * 0.25 + 0.05,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(243,215,124,.75)';
    stars.forEach((o) => {
      if (!reduced) {
        o.y += o.v;
        if (o.y > canvas.height) o.y = 0;
      }
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!reduced) animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}

/**
 * @param {HTMLElement} container
 * @param {{ prophetCount: number, themeCount: number, ayahRefCount: number }} stats
 */
export function renderHero(container, stats) {
  container.innerHTML = `
    <header class="hero" id="top">
      <canvas id="stars-canvas" aria-hidden="true"></canvas>
      <div class="hero-inner">
        <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div class="hero-badge">✦ Quran Story Universe · نسخة مطورة</div>
        <h1>أطلس الشبكات القصصية في القرآن</h1>
        <p class="subtitle">متحف رقمي تفاعلي يجمع الكون الشبكي، Story Mode، بحثًا دلاليًا، مصحفًا موضوعيًا، ودراسة موثقة — مع أداء سريع ومناسب للجوال.</p>
        <div class="actions">
          <a class="btn primary" href="#universe">ادخل الكون القصصي</a>
          <a class="btn" href="#story">Story Mode</a>
          <a class="btn" href="#search">المحرك الذكي</a>
          <a class="btn" href="#surahs">المصحف الموضوعي</a>
        </div>
        <div class="stats">
          <div class="stat"><strong>${stats.prophetCount}</strong><span>شخصية ونبي</span></div>
          <div class="stat"><strong>114</strong><span>سورة</span></div>
          <div class="stat"><strong>${stats.themeCount}</strong><span>مفهوم</span></div>
          <div class="stat"><strong>${stats.ayahRefCount}</strong><span>موضع آيات</span></div>
        </div>
      </div>
    </header>
  `;

  const canvas = container.querySelector('#stars-canvas');
  return initStarsCanvas(canvas);
}

/**
 * @param {HTMLElement} container
 */
export function renderStickyNav(container) {
  container.innerHTML = `
    <nav class="nav">
      <div class="wrap">
        <a href="#top" class="brand">🌌 Quran Story Universe</a>
        <div class="links">
          <a href="#method">المنهج</a>
          <a href="#universe">الكون</a>
          <a href="#story">القصة</a>
          <a href="#timeline">الزمن</a>
          <a href="#search">البحث</a>
          <a href="#surahs">السور</a>
          <a href="#mushaf">المصحف</a>
          <a href="#study">الدراسة</a>
          <a href="#admin-review">المراجعة</a>
        </div>
      </div>
    </nav>
  `;
}

/**
 * @param {HTMLElement} container
 */
export function renderFooter(container) {
  container.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <span class="gold">Quran Story Universe</span>
        — نسخة مطورة · لا تغني عن المصحف وكتب التفسير المعتمدة
      </div>
    </footer>
  `;
}

/**
 * @param {HTMLElement} container
 */
export function renderMethodology(container) {
  container.innerHTML = `
    <section id="method">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">المنهجية</span>
          <h2>القصة القرآنية شبكة لا تكرار</h2>
          <p>منصة معرفية: عقد، روابط، أحداث، مواضع، مصادر، ومسارات قصصية — مع مراجعة علمية قبل النشر النهائي.</p>
        </div>
        <div class="grid g3">
          <div class="glass pad">
            <h3 class="gold" style="font-family:var(--fontA);font-size:28px">1. طبقة الحدث</h3>
            <p>تتبع الأحداث زمنياً داخل كل قصة مع نافذة دراسة مستقلة ومراجع.</p>
          </div>
          <div class="glass pad">
            <h3 class="gold" style="font-family:var(--fontA);font-size:28px">2. طبقة الشبكة</h3>
            <p>ربط النبي بالسور والموضوعات والشخصيات والأماكن.</p>
          </div>
          <div class="glass pad">
            <h3 class="gold" style="font-family:var(--fontA);font-size:28px">3. طبقة الاستكشاف</h3>
            <p>بحث ذكي، مصحف موضوعي، وStory Mode — دون تفسير مختلق.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
