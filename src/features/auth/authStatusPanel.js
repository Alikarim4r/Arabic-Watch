import { escapeHtml } from '../../lib/utils.js';
import { getAuthModeBadge, getAuthModeLabelAr } from '../../lib/authService.js';
import { isLocalRuntime } from '../../config/env.js';

/**
 * @param {{ auth: Object, loading?: boolean, error?: string }} ctx
 */
export function renderAuthStatusPanel(ctx) {
  const { auth, loading, error } = ctx;
  const local = isLocalRuntime();
  const badge = getAuthModeBadge();

  if (loading) {
    return `<div class="glass pad auth-status-panel"><p class="muted">جاري التحقق من الجلسة…</p></div>`;
  }

  return `
    <div class="glass pad auth-status-panel" id="auth-status-panel">
      <div class="auth-mode-badge-row">
        <span class="tag ${badge.className} auth-mode-badge" id="auth-mode-badge">${escapeHtml(badge.labelAr)}</span>
        <span class="muted">${escapeHtml(badge.label)}</span>
      </div>
      ${local ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>` : ''}
      <div class="auth-status-grid">
        <div>
          <span class="muted">المستخدم</span>
          <strong>${escapeHtml(auth.user?.displayName || auth.user?.email || 'زائر')}</strong>
        </div>
        <div>
          <span class="muted">الدور</span>
          <strong>${escapeHtml(auth.role || 'viewer')}</strong>
        </div>
        <div>
          <span class="muted">الجلسة</span>
          <strong>${local ? 'تجريبي محلي' : auth.user ? badge.labelAr : 'غير مسجّل'}</strong>
        </div>
      </div>
      ${error ? `<div class="admin-warning auth-error-msg">${escapeHtml(error)}</div>` : ''}
    </div>`;
}
