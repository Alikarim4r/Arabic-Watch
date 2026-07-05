import { escapeHtml } from '../../lib/utils.js';
import { isLocalRuntime } from '../../config/env.js';
import { renderReviewerManagementPanel } from './reviewerManagementPanel.js';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderReviewerProfilePanel(root, ctx) {
  const {
    auth,
    profile,
    stats = {},
    isAdmin,
    loading,
    error,
    onRetry,
  } = ctx;
  const local = isLocalRuntime();

  if (loading) {
    root.innerHTML = `<div class="state-box">جاري تحميل الملف…</div>`;
    return;
  }

  if (error) {
    root.innerHTML = `
      <div class="state-box error">
        <p>${escapeHtml(error)}</p>
        <button type="button" class="btn sm" id="profile-retry">إعادة المحاولة</button>
      </div>`;
    root.querySelector('#profile-retry')?.addEventListener('click', () => onRetry?.());
    return;
  }

  const p = profile || {
    email: auth.user?.email || 'demo@local',
    display_name: auth.user?.displayName || 'Local Demo Reviewer',
    role: auth.role,
    is_active: true,
  };

  root.innerHTML = `
    <div class="reviewer-profile-panel">
      <h3 class="gold">إعدادات الحساب</h3>
      ${local ? '<p class="muted admin-local-note">ملف تجريبي — لا يُعدّل أدوار الإنتاج من الواجهة.</p>' : ''}

      <div class="glass pad admin-stats" style="margin-top:12px">
        <div class="stat"><strong>${escapeHtml(p.display_name || p.email || '—')}</strong><span>الاسم</span></div>
        <div class="stat"><strong>${escapeHtml(p.email || '—')}</strong><span>البريد</span></div>
        <div class="stat"><strong>${escapeHtml(p.role || auth.role)}</strong><span>الدور</span></div>
        <div class="stat ${p.is_active === false ? 'rose' : 'ok'}"><strong>${p.is_active === false ? 'غير نشط' : 'نشط'}</strong><span>الحالة</span></div>
      </div>

      <div class="admin-stats admin-stats-6 glass pad" style="margin-top:16px">
        <div class="stat"><strong>${stats.actionCount || 0}</strong><span>إجراءات مراجعة</span></div>
        <div class="stat ok"><strong>${stats.approvedCount || 0}</strong><span>اعتماد</span></div>
        <div class="stat rose"><strong>${stats.rejectedCount || 0}</strong><span>رفض/تعديل</span></div>
        <div class="stat"><strong>${stats.patchCount || 0}</strong><span>patches</span></div>
        <div class="stat muted"><strong>${escapeHtml(stats.lastActivity || '—')}</strong><span>آخر نشاط</span></div>
      </div>

      <p class="muted" style="margin-top:12px">لا يمكن تعديل دور الإنتاج من الواجهة إلا بواسطة مسؤول النظام وRLS.</p>

      ${isAdmin ? '<div id="reviewer-management-mount" style="margin-top:20px"></div>' : ''}
    </div>
  `;

  if (isAdmin) {
    const mount = root.querySelector('#reviewer-management-mount');
    if (mount) await renderReviewerManagementPanel(mount, ctx);
  }
}
