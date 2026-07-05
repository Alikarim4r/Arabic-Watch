import { escapeHtml } from '../../lib/utils.js';
import { isLocalRuntime } from '../../config/env.js';

/**
 * Admin-only read-only / mock reviewer management placeholder.
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderReviewerManagementPanel(root, ctx) {
  const reviewers = ctx.reviewerList || getDemoReviewers(ctx.auth);
  const local = isLocalRuntime();

  root.innerHTML = `
    <div class="glass pad reviewer-management">
      <h3 class="gold">إدارة المراجعين</h3>
      <p class="muted">${local ? 'عرض تجريبي — لا تُحدَّث الأدوار من الواجهة في الوضع المحلي.' : 'قراءة فقط — تغيير الأدوار يتطلب RLS/admin backend.'}</p>
      <div class="admin-queue">
        ${reviewers
          .map(
            (r) => `
          <div class="admin-queue-item" style="cursor:default">
            <strong>${escapeHtml(r.display_name || r.email)}</strong>
            <span class="tag">${escapeHtml(r.role)}</span>
            <span class="tag ${r.is_active === false ? 'rose' : 'green'}">${r.is_active === false ? 'غير نشط' : 'نشط'}</span>
            <span class="muted">آخر نشاط: ${escapeHtml(r.last_activity || '—')}</span>
            <div class="admin-actions">
              <button type="button" class="btn sm" disabled title="يتطلب RLS">activate</button>
              <button type="button" class="btn sm" disabled title="يتطلب RLS">deactivate</button>
              <button type="button" class="btn sm" disabled title="يتطلب RLS">change role</button>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;
}

function getDemoReviewers(auth) {
  return [
    {
      email: auth?.user?.email || 'reviewer@demo.local',
      display_name: auth?.user?.displayName || 'Demo Reviewer',
      role: auth?.role || 'reviewer',
      is_active: true,
      last_activity: new Date().toISOString(),
    },
    {
      email: 'admin@demo.local',
      display_name: 'Demo Admin',
      role: 'admin',
      is_active: true,
      last_activity: '—',
    },
  ];
}
