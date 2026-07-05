/**
 * @param {string} [status]
 * @returns {{ label: string, className: string }}
 */
export function getReviewBadge(status) {
  switch (status) {
    case 'approved':
      return { label: 'مراجَع', className: 'badge-approved' };
    case 'pending':
      return { label: 'قيد المراجعة', className: 'badge-pending' };
    case 'needs_source':
      return { label: 'يحتاج مصدر', className: 'badge-needs-source' };
    default:
      return { label: 'قيد المراجعة', className: 'badge-pending' };
  }
}

/**
 * @param {number} surahId
 * @param {number} from
 * @param {number} [to]
 */
export function formatAyahRef(surahId, from, to = from) {
  if (from === to) return `${surahId}:${from}`;
  return `${surahId}:${from}-${to}`;
}

/**
 * @param {TemplateStringsArray} strings
 * @param {...*} values
 */
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
}

/** @param {string} str */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Main narrative figures from the prototype RAW dataset (not secondary person_* nodes).
 * @param {{ id?: string, node_type?: string }} node
 */
export function isMainStoryNode(node) {
  if (!node) return false;
  if (node.node_type === 'prophet') return true;
  if (node.node_type === 'person' && node.id && !node.id.startsWith('person_')) return true;
  return false;
}

/**
 * @param {number|string} surahId
 * @param {Object[]} nodes
 * @param {Object[]} [links]
 */
export function getNodesForSurah(surahId, nodes, links = []) {
  const sid = Number(surahId);
  const surahNodeId = `surah_${sid}`;
  const linkedIds = new Set();

  nodes.forEach((n) => {
    if (isMainStoryNode(n) && Array.isArray(n.surah_ids) && n.surah_ids.includes(sid)) {
      linkedIds.add(n.id);
    }
  });

  links.forEach((l) => {
    if (l.relation_type !== 'narrated_in') return;
    if (l.target_node_id === surahNodeId) linkedIds.add(l.source_node_id);
    if (l.source_node_id === surahNodeId) linkedIds.add(l.target_node_id);
  });

  return nodes.filter((n) => isMainStoryNode(n) && linkedIds.has(n.id));
}

/**
 * @param {string} nodeType
 */
export function nodeTypeLabel(nodeType) {
  const map = {
    prophet: 'نبي',
    person: 'شخصية',
    people: 'قوم',
    place: 'مكان',
    theme: 'محور',
    event_group: 'مجموعة أحداث',
    surah: 'سورة',
  };
  return map[nodeType] || nodeType;
}
