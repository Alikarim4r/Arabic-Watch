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
