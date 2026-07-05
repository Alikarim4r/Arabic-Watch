import { normalizeArabic } from '../../lib/arabicNormalize.js';
import { prefersReducedMotion } from '../../lib/utils.js';

const TYPE_COLORS = {
  prophet: '#f3d68a',
  person: '#c8d4ff',
  people: '#ffcf75',
  place: '#7fffd4',
  theme: '#d9a7ff',
  event_group: '#ffad82',
  surah: '#fff0b8',
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ nodes: Object[], links: Object[], paused?: boolean, onNodeClick?: Function }} options
 */
export function createGraphCanvas(canvas, options) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationId = 0;
  let paused = options.paused || prefersReducedMotion();
  let filters = {};

  const simNodes = options.nodes.map((n, i) => ({
    ...n,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: n.node_type === 'theme' ? 14 : 18,
    visible: true,
  }));

  const simLinks = options.links.map((l) => ({
    ...l,
    source: simNodes.find((n) => n.id === l.source_node_id),
    target: simNodes.find((n) => n.id === l.target_node_id),
  }));

  let dragged = null;
  let pan = { x: 0, y: 0 };
  let scale = 1;
  let pinchStart = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = Math.max(420, rect.height || 420);
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function resetLayout() {
    simNodes.forEach((node, i) => {
      const angle = (i / simNodes.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.28;
      node.x = width / 2 + Math.cos(angle) * r;
      node.y = height / 2 + Math.sin(angle) * r;
      node.vx = 0;
      node.vy = 0;
    });
    pan = { x: 0, y: 0 };
    scale = 1;
  }

  function applyFilters(next) {
    filters = { ...filters, ...next };
    const q = normalizeArabic(filters.query || '').toLowerCase();

    simNodes.forEach((node) => {
      let visible = true;
      if (filters.nodeType && node.node_type !== filters.nodeType) visible = false;
      if (filters.themeId) {
        const linked = options.links.some(
          (l) =>
            (l.source_node_id === node.id || l.target_node_id === node.id) &&
            (l.source_node_id === filters.themeId || l.target_node_id === filters.themeId)
        );
        if (node.id !== filters.themeId && !linked) visible = false;
      }
      if (filters.placeId) {
        const linked = options.links.some(
          (l) =>
            (l.source_node_id === node.id || l.target_node_id === node.id) &&
            (l.source_node_id === filters.placeId || l.target_node_id === filters.placeId)
        );
        if (node.id !== filters.placeId && !linked) visible = false;
      }
      if (filters.surahId) {
        const sid = Number(filters.surahId);
        visible = node.node_type === 'surah' ? node.name_ar.includes(String(sid)) || node.id.includes(String(sid)) : visible;
        if (node.node_type === 'prophet' || node.node_type === 'person') {
          visible = true;
        }
      }
      if (q) {
        const hay = normalizeArabic([node.name_ar, node.summary_ar, node.short_title_ar].join(' ')).toLowerCase();
        if (!hay.includes(q)) visible = false;
      }
      node.visible = visible;
    });
  }

  function tick() {
    if (!paused) {
      simNodes.forEach((node) => {
        if (!node.visible) return;
        simNodes.forEach((other) => {
          if (node === other || !other.visible) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.max(Math.hypot(dx, dy), 1);
          const force = 900 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        });
      });

      simLinks.forEach((link) => {
        if (!link.source?.visible || !link.target?.visible) return;
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const force = (dist - 120) * 0.003;
        link.source.vx += (dx / dist) * force;
        link.source.vy += (dy / dist) * force;
        link.target.vx -= (dx / dist) * force;
        link.target.vy -= (dy / dist) * force;
      });

      simNodes.forEach((node) => {
        if (!node.visible || node === dragged) return;
        node.vx += (width / 2 - node.x) * 0.0008;
        node.vy += (height / 2 - node.y) * 0.0008;
        node.vx *= 0.86;
        node.vy *= 0.86;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      });
    }

    draw();
    animationId = requestAnimationFrame(tick);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    simLinks.forEach((link) => {
      if (!link.source?.visible || !link.target?.visible) return;
      ctx.strokeStyle = 'rgba(243,214,138,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.stroke();
    });

    simNodes.forEach((node) => {
      if (!node.visible) return;
      const color = TYPE_COLORS[node.node_type] || '#f3d68a';
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.stroke();

      ctx.fillStyle = '#f6efdc';
      ctx.font = '12px Reem Kufi, Amiri, serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name_ar.split(' ')[0], node.x, node.y + node.radius + 14);
    });

    ctx.restore();
  }

  function nodeAt(x, y) {
    const px = (x - pan.x) / scale;
    const py = (y - pan.y) / scale;
    return simNodes.find(
      (node) => node.visible && Math.hypot(node.x - px, node.y - py) <= node.radius + 4
    );
  }

  function pointerPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (evt) => {
    canvas.setPointerCapture(evt.pointerId);
    const pos = pointerPos(evt);
    dragged = nodeAt(pos.x, pos.y) || null;
    if (!dragged) pinchStart = { ...pos, pan: { ...pan }, scale };
  });

  canvas.addEventListener('pointermove', (evt) => {
    const pos = pointerPos(evt);
    if (dragged) {
      dragged.x = (pos.x - pan.x) / scale;
      dragged.y = (pos.y - pan.y) / scale;
      dragged.vx = 0;
      dragged.vy = 0;
    } else if (pinchStart && evt.buttons) {
      pan.x = pinchStart.pan.x + (pos.x - pinchStart.x);
      pan.y = pinchStart.pan.y + (pos.y - pinchStart.y);
    }
  });

  canvas.addEventListener('pointerup', (evt) => {
    const pos = pointerPos(evt);
    if (dragged) {
      options.onNodeClick?.(dragged);
    } else if (!pinchStart || Math.hypot(pos.x - pinchStart.x, pos.y - pinchStart.y) < 4) {
      const hit = nodeAt(pos.x, pos.y);
      if (hit) options.onNodeClick?.(hit);
    }
    dragged = null;
    pinchStart = null;
  });

  canvas.addEventListener(
    'wheel',
    (evt) => {
      evt.preventDefault();
      const delta = evt.deltaY > 0 ? 0.92 : 1.08;
      scale = Math.max(0.6, Math.min(2.2, scale * delta));
    },
    { passive: false }
  );

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement);
  resize();
  resetLayout();
  tick();

  return {
    setFilters: applyFilters,
    resetLayout,
    togglePause() {
      paused = !paused;
      return paused;
    },
    destroy() {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    },
  };
}
