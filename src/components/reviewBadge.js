import { getReviewBadge } from '../lib/utils.js';

/**
 * @param {string} [status]
 */
export function reviewBadgeHtml(status) {
  const { label, className } = getReviewBadge(status);
  return `<span class="badge ${className}">${label}</span>`;
}

/**
 * @param {HTMLElement} el
 * @param {string} [status]
 */
export function mountReviewBadge(el, status) {
  el.innerHTML = reviewBadgeHtml(status);
}
