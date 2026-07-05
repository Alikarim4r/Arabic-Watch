/** @typedef {'info'|'success'|'error'|'warn'} ToastType */

/** @type {HTMLElement|null} */
let container = null;

export function initToastContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement('div');
  container.id = 'qsu-toast-container';
  container.className = 'qsu-toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

/**
 * @param {string} message
 * @param {ToastType} [type]
 * @param {number} [durationMs]
 */
export function showToast(message, type = 'info', durationMs = 4200) {
  if (!message) return;
  initToastContainer();
  const el = document.createElement('div');
  el.className = `qsu-toast qsu-toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 320);
  }, durationMs);
}
