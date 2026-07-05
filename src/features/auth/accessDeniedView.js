import { escapeHtml } from '../../lib/utils.js';
import { getAccessDeniedMessageAr } from '../../lib/authService.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';

/**
 * @param {{ user?: Object|null, role?: string, message?: string, profileStatus?: string }} auth
 */
export function renderAccessDeniedView(auth = {}) {
  const message = auth.message || getAccessDeniedMessageAr(auth);
  return `
    <div class="glass pad admin-access-denied" id="access-denied-view">
      <h3 class="gold">صلاحية المراجعة مطلوبة</h3>
      <p>${escapeHtml(message)}</p>
      <p class="muted">المستخدم الحالي: ${escapeHtml(auth.user?.email || auth.user?.displayName || 'غير مسجّل')} · الدور: ${escapeHtml(auth.role || 'viewer')}</p>
      <p class="muted">في وضع Supabase، يلزم صف في reviewer_profiles بدور reviewer أو admin وحالة نشطة.</p>
      <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
    </div>`;
}
