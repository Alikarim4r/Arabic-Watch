import { normalizeArabic } from '../../lib/arabicNormalize.js';
import { prefersReducedMotion } from '../../lib/utils.js';

const TYPE_COLORS = {
  prophet: '#c5a059',
  person: '#f43f5e',
  people: '#f43f5e',
  place: '#a78bfa',
  theme: '#34d399',
  event_group: '#38bdf8',
  surah: '#38bdf8',
};

const TYPE_RADIUS = {
  prophet: 14,
  person: 8,
  people: 8,
  place: 8,
  theme: 8,
  surah: 8,
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ nodes: Object[], links: Object[], paused?: boolean, onNodeClick?: Function }} options
 */
export function createGraphCanvas(canvas, options) {
  const ctx = canvas.getContext('2d');
  let clientW = 0;
  let clientH = 0;
  let animId = 0;
  let moving = !options.paused && !prefersReducedMotion();
  let filters = {};
  let scale = 1;
  let ox = 0;
  let oy = 0;
  let drag = null;
  let pan = null;
  let pointerDown = null;
  let clickedNode = null;
  let didDrag = false;

  const simNodes = options.nodes.map((n) => ({
    ...n,
    label: n.name_ar,
    x: (Math.random() - 0.5) * 900,
    y: (Math.random() - 0.5) * 620,
    vx: 0,
    vy: 0,
    visible: true,
  }));

  const simLinks = options.links
    .map((l) => [l.source_node_id, l.target_node_id])
    .filter(([a, b]) => simNodes.find((n) => n.id === a) && simNodes.find((n) => n.id === b));

  const onMove = (e) => {
    const p = pointer(e);
    if (pointerDown && clickedNode && !didDrag) {
      const moved = Math.hypot(p.x - pointerDown.x, p.y - pointerDown.y);
      if (moved > 8) didDrag = true;
    }
    if (drag) {
      const w = world(p.x, p.y);
      drag.x = w.x;
      drag.y = w.y;
      drag.vx = 0;
      drag.vy = 0;
    } else if (pan) {
      ox = pan.ox + (e.clientX - pan.x) / scale;
      oy = pan.oy + (e.clientY - pan.y) / scale;
    }
  };

  const onUp = (e) => {
    const p = pointer(e);
    if (pointerDown && clickedNode && !didDrag && !pan) {
      options.onNodeClick?.(clickedNode);
    }
    drag = null;
    pan = null;
    pointerDown = null;
    clickedNode = null;
    didDrag = false;
  };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    clientW = rect.width;
    clientH = rect.height;
    canvas.width = clientW * devicePixelRatio;
    canvas.height = clientH * devicePixelRatio;
    canvas.style.width = `${clientW}px`;
    canvas.style.height = `${clientH}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function screen(n) {
    return {
      x: clientW / 2 + (n.x + ox) * scale,
      y: clientH / 2 + (n.y + oy) * scale,
    };
  }

  function world(x, y) {
    return {
      x: (x - clientW / 2) / scale - ox,
      y: (y - clientH / 2) / scale - oy,
    };
  }

  function color(type) {
    return TYPE_COLORS[type] || '#fff';
  }

  function radius(type) {
    return TYPE_RADIUS[type] || 8;
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
        const sid = String(filters.surahId);
        if (node.node_type === 'surah') {
          visible = node.id.includes(sid) || node.name_ar.includes(sid);
        } else if (!['prophet', 'person'].includes(node.node_type)) {
          visible = false;
        }
      }
      if (q) {
        const hay = normalizeArabic([node.name_ar, node.summary_ar, node.short_title_ar].join(' ')).toLowerCase();
        if (!hay.includes(q)) visible = false;
      }
      node.visible = visible;
    });
  }

  function step() {
    if (moving) {
      simNodes.forEach((n) => {
        n.vx *= 0.86;
        n.vy *= 0.86;
      });

      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          if (!a.visible || !b.visible) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.max(35, Math.hypot(dx, dy));
          const f = 850 / (d * d);
          a.vx += (dx / d) * f;
          a.vy += (dy / d) * f;
          b.vx -= (dx / d) * f;
          b.vy -= (dy / d) * f;
        }
      }

      simLinks.forEach(([aId, bId]) => {
        const a = simNodes.find((n) => n.id === aId);
        const b = simNodes.find((n) => n.id === bId);
        if (!a?.visible || !b?.visible) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const f = (d - 115) * 0.008;
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      });

      simNodes.forEach((n) => {
        if (n !== drag && n.visible) {
          n.x += n.vx;
          n.y += n.vy;
        }
      });
    }

    draw();
    animId = requestAnimationFrame(step);
  }

  function draw() {
    ctx.clearRect(0, 0, clientW, clientH);

    simLinks.forEach(([aId, bId]) => {
      const a = simNodes.find((n) => n.id === aId);
      const b = simNodes.find((n) => n.id === bId);
      if (!a?.visible || !b?.visible) return;
      const A = screen(a);
      const B = screen(b);
      ctx.strokeStyle = 'rgba(255,255,255,.09)';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    });

    simNodes.forEach((n) => {
      if (!n.visible) return;
      const p = screen(n);
      const r = radius(n.node_type);
      ctx.shadowBlur = n.node_type === 'prophet' ? 18 : 8;
      ctx.shadowColor = color(n.node_type);
      ctx.fillStyle = color(n.node_type);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = `${n.node_type === 'prophet' ? '700 13px' : '11px'} Cairo, sans-serif`;
      ctx.textAlign = 'center';
      const label = n.label.length > 14 ? n.label.split(' ')[0] : n.label;
      ctx.fillText(label, p.x, p.y - r - 7);
    });
  }

  function hit(x, y) {
    const w = world(x, y);
    return simNodes.find((n) => {
      if (!n.visible) return false;
      const hitR = radius(n.node_type);
      return Math.hypot(n.x - w.x, n.y - w.y) < hitR / scale + 4;
    });
  }

  function pointer(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - r.top;
    return { x, y };
  }

  const onDown = (e) => {
    if (e.target !== canvas) return;
    e.preventDefault();
    const p = pointer(e);
    pointerDown = p;
    didDrag = false;
    const n = hit(p.x, p.y);
    if (n) {
      clickedNode = n;
      drag = n;
    } else {
      pan = { x: e.clientX, y: e.clientY, ox, oy };
    }
  };

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.1 : 0.9);
    },
    { passive: false }
  );

  function zoom(f) {
    scale = Math.max(0.35, Math.min(3, scale * f));
  }

  function resetLayout() {
    scale = 1;
    ox = 0;
    oy = 0;
    simNodes.forEach((n) => {
      n.x = (Math.random() - 0.5) * 900;
      n.y = (Math.random() - 0.5) * 620;
      n.vx = 0;
      n.vy = 0;
    });
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  step();

  return {
    setFilters: applyFilters,
    resetLayout,
    zoomIn: () => zoom(1.15),
    zoomOut: () => zoom(0.85),
    togglePause() {
      moving = !moving;
      return !moving;
    },
    destroy() {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    },
  };
}
