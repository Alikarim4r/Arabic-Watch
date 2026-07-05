export const DISCLAIMER_AR =
  'هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.';

/**
 * @param {HTMLElement} container
 */
export function renderDisclaimer(container) {
  container.innerHTML = `
    <div class="disclaimer-banner" role="note" aria-label="تنبيه المحتوى">
      ${DISCLAIMER_AR}
    </div>
  `;
}
