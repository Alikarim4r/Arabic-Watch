import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';

/**
 * @param {{ user?: Object|null, role?: string, message?: string }} auth
 */
export function renderAccessDeniedView(auth = {}) {
  return `
    <div class="glass pad admin-access-denied" id="access-denied-view">
      <h3 class="gold">صلاحية المراجعة مطلوبة</h3>
      <p>${escapeHtml(auth.message || 'وضع Supabase نشط — يلزم حساب reviewer أو admin للوصول إلى أدوات المراجعة.')}</p>
      <p class="muted">المستخدم الحالي: ${escapeHtml(auth.user?.email || auth.user?.displayName || 'غير مسجّل')} · الدور: ${escapeHtml(auth.role || 'viewer')}</p>
      <p class="muted">سجّل الدخول بحساب مُصرّح أو تواصل مع المسؤول لتفعيل دور المراجع.</p>
      <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
    </div>`;
}
