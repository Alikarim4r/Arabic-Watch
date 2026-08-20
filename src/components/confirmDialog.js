import { escapeHtml } from '../lib/utils.js';

/**
 * @typedef {Object} ConfirmDialogOptions
 * @property {string} title
 * @property {string} actionLabel
 * @property {string} [recordLabel]
 * @property {string} [currentStatus]
 * @property {string} [newStatus]
 * @property {boolean} [affectsPublicFinal]
 * @property {boolean} [requireNote]
 * @property {string} [noteLabel]
 * @property {boolean} [showInternalNote]
 * @property {boolean} [showSourceNote]
 * @property {boolean} [showEvidenceNote]
 */

/**
 * @param {ConfirmDialogOptions} options
 * @returns {Promise<{ confirmed: boolean, reviewer_note?: string, internal_note?: string, source_note?: string, evidence_note?: string }>}
 */
export function showConfirmDialog(options) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'qsu-confirm-overlay';
    overlay.innerHTML = `
      <div class="qsu-confirm-dialog glass pad" role="dialog" aria-modal="true">
        <h3 class="gold">${escapeHtml(options.title)}</h3>
        <p><strong>${escapeHtml(options.actionLabel)}</strong></p>
        ${options.recordLabel ? `<p class="muted">السجل: ${escapeHtml(options.recordLabel)}</p>` : ''}
        ${
          options.currentStatus || options.newStatus
            ? `<p class="muted">الحالة: ${escapeHtml(options.currentStatus || '—')} → ${escapeHtml(options.newStatus || '—')}</p>`
            : ''
        }
        ${
          options.affectsPublicFinal
            ? '<div class="admin-warning">⚠️ هذا الإجراء قد يؤثر على إمكانية العرض النهائي في الوضع العام — لا يُطبَّق تلقائيًا على جداول المحتوى.</div>'
            : ''
        }
        <label class="qsu-confirm-field">
          ${escapeHtml(options.noteLabel || 'ملاحظة المراجع')}
          ${options.requireNote ? ' <span class="tag rose">مطلوب</span>' : ''}
          <textarea id="qsu-confirm-reviewer-note" rows="3" placeholder="اكتب سبب القرار…"></textarea>
        </label>
        ${
          options.showInternalNote
            ? `<label class="qsu-confirm-field">ملاحظة داخلية (اختياري)<textarea id="qsu-confirm-internal-note" rows="2"></textarea></label>`
            : ''
        }
        ${
          options.showSourceNote
            ? `<label class="qsu-confirm-field">ملاحظة المصدر (اختياري)<textarea id="qsu-confirm-source-note" rows="2"></textarea></label>`
            : ''
        }
        ${
          options.showEvidenceNote
            ? `<label class="qsu-confirm-field">ملاحظة الأدلة (اختياري)<textarea id="qsu-confirm-evidence-note" rows="2"></textarea></label>`
            : ''
        }
        <div class="admin-actions">
          <button type="button" class="btn sm primary" id="qsu-confirm-ok">تأكيد</button>
          <button type="button" class="btn sm" id="qsu-confirm-cancel">إلغاء</button>
        </div>
      </div>
    `;

    const cleanup = (result) => {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') cleanup({ confirmed: false });
    };

    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);

    overlay.querySelector('#qsu-confirm-cancel')?.addEventListener('click', () => cleanup({ confirmed: false }));
    overlay.querySelector('#qsu-confirm-ok')?.addEventListener('click', () => {
      const reviewer_note = overlay.querySelector('#qsu-confirm-reviewer-note')?.value?.trim() || '';
      if (options.requireNote && !reviewer_note) {
        overlay.querySelector('#qsu-confirm-reviewer-note')?.focus();
        return;
      }
      cleanup({
        confirmed: true,
        reviewer_note,
        internal_note: overlay.querySelector('#qsu-confirm-internal-note')?.value?.trim() || '',
        source_note: overlay.querySelector('#qsu-confirm-source-note')?.value?.trim() || '',
        evidence_note: overlay.querySelector('#qsu-confirm-evidence-note')?.value?.trim() || '',
      });
    });
  });
}
