import { escapeHtml } from '../../lib/utils.js';

/** @typedef {'dashboard'|'review'|'curation'|'batches'|'history'|'profile'} ReviewerTab */

/**
 * @param {ReviewerTab} activeTab
 * @param {{ isAdmin?: boolean }} [options]
 */
export function renderReviewerNav(activeTab, options = {}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', label_ar: 'لوحة التحكم' },
    { id: 'review', label: 'Review Queue', label_ar: 'قائمة المراجعة' },
    { id: 'curation', label: 'Evidence Curation', label_ar: 'ربط الآيات' },
    { id: 'batches', label: 'Content Batches', label_ar: 'دفعات المحتوى' },
    { id: 'history', label: 'Review History', label_ar: 'سجل المراجعات' },
    { id: 'profile', label: 'Profile', label_ar: 'إعدادات الحساب' },
  ];

  return `
    <nav class="reviewer-nav admin-tabs" aria-label="reviewer navigation">
      ${tabs
        .map(
          (t) =>
            `<button type="button" class="btn sm ${activeTab === t.id ? 'primary' : ''}" data-reviewer-tab="${t.id}" title="${escapeHtml(t.label)}">${escapeHtml(t.label_ar)}</button>`
        )
        .join('')}
    </nav>`;
}

/**
 * @param {HTMLElement} root
 * @param {(tab: ReviewerTab) => void} onTabChange
 */
export function bindReviewerNav(root, onTabChange) {
  root.querySelectorAll('[data-reviewer-tab]').forEach((btn) => {
    btn.addEventListener('click', () => onTabChange(btn.dataset.reviewerTab));
  });
}

/**
 * Quick action cards for dashboard.
 */
export function renderQuickActionCards() {
  const cards = [
    { tab: 'review', title: 'مراجعة الأحداث', desc: 'قائمة المراجعة والتصفية' },
    { tab: 'curation', title: 'ربط الآيات', desc: 'Evidence Curation Workbench' },
    { tab: 'review', title: 'مراجعة المصادر', desc: 'سجلات needs_source' },
    { tab: 'batches', title: 'دفعات المحتوى', desc: 'ترويج مُتحكَّم به' },
    { tab: 'history', title: 'سجل المراجعات', desc: 'آخر الإجراءات المسجّلة' },
    { tab: 'profile', title: 'إعدادات الحساب', desc: 'الملف والجلسة' },
  ];

  return `
    <div class="reviewer-quick-actions">
      ${cards
        .map(
          (c) =>
            `<button type="button" class="glass pad reviewer-action-card" data-goto-tab="${c.tab}">
              <strong class="gold">${escapeHtml(c.title)}</strong>
              <span class="muted">${escapeHtml(c.desc)}</span>
            </button>`
        )
        .join('')}
    </div>`;
}

/**
 * @param {HTMLElement} root
 * @param {(tab: string) => void} onGoto
 */
export function bindQuickActionCards(root, onGoto) {
  root.querySelectorAll('[data-goto-tab]').forEach((btn) => {
    btn.addEventListener('click', () => onGoto(btn.dataset.gotoTab));
  });
}
