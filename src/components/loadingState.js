/**
 * @param {HTMLElement} container
 * @param {'loading'|'empty'|'error'} type
 * @param {string} [message]
 */
export function renderStateBox(container, type, message = '') {
  const defaults = {
    loading: 'جاري تحميل المحتوى…',
    empty: 'لا توجد نتائج مطابقة.',
    error: 'حدث خطأ أثناء تحميل البيانات.',
  };

  container.innerHTML = `
    <div class="state-box ${type === 'error' ? 'error' : ''}">
      <p>${message || defaults[type]}</p>
    </div>
  `;
}
