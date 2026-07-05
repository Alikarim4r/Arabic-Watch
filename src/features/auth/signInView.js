import { escapeHtml } from '../../lib/utils.js';
import { getAuthModeLabelAr } from '../../lib/authService.js';
import { isLocalRuntime } from '../../config/env.js';

/**
 * @param {{ loading?: boolean, error?: string, auth?: Object }} [ctx]
 */
export function renderSignInView(ctx = {}) {
  const local = isLocalRuntime();
  const { loading, error, auth } = ctx;

  if (local) {
    return `
      <div class="glass pad sign-in-view" id="sign-in-view">
        <h3 class="gold">تسجيل الدخول (وضع تجريبي)</h3>
        <div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>
        <p class="muted">في الوضع المحلي لا توجد صلاحيات إنتاجية. اختر دورًا تجريبيًا للاختبار:</p>
        <div class="admin-actions">
          <button type="button" class="btn sm" data-mock-role="viewer">viewer</button>
          <button type="button" class="btn sm primary" data-mock-role="reviewer">reviewer</button>
          <button type="button" class="btn sm" data-mock-role="admin">admin</button>
          <button type="button" class="btn sm" data-mock-role="clear">مسح الدور</button>
        </div>
        <p class="muted" style="margin-top:10px">الدور الحالي: <strong>${escapeHtml(auth?.role || 'viewer')}</strong></p>
      </div>`;
  }

  return `
    <div class="glass pad sign-in-view" id="sign-in-view">
      <h3 class="gold">تسجيل الدخول</h3>
      <p class="muted">${escapeHtml(getAuthModeLabelAr())}</p>
      <form class="sign-in-form" id="sign-in-form">
        <label>البريد الإلكتروني<input type="email" name="email" required autocomplete="username" ${loading ? 'disabled' : ''} /></label>
        <label>كلمة المرور<input type="password" name="password" required autocomplete="current-password" ${loading ? 'disabled' : ''} /></label>
        ${error ? `<div class="admin-warning auth-error-msg">${escapeHtml(error)}</div>` : ''}
        <div class="admin-actions">
          <button type="submit" class="btn sm primary" ${loading ? 'disabled' : ''}>${loading ? 'جاري الدخول…' : 'دخول'}</button>
          ${auth?.user ? '<button type="button" class="btn sm" id="sign-out-btn">خروج</button>' : ''}
        </div>
      </form>
    </div>`;
}

/**
 * @param {HTMLElement} root
 * @param {{ onSignIn: Function, onSignOut: Function, onMockRole: Function }} handlers
 */
export function bindSignInView(root, handlers) {
  root.querySelector('#sign-in-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await handlers.onSignIn?.(String(fd.get('email') || ''), String(fd.get('password') || ''));
  });

  root.querySelector('#sign-out-btn')?.addEventListener('click', () => handlers.onSignOut?.());

  root.querySelectorAll('[data-mock-role]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.mockRole;
      handlers.onMockRole?.(role === 'clear' ? null : role);
    });
  });
}
