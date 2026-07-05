import { escapeHtml } from '../../lib/utils.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { summarizeReviewStats } from './reviewQueue.js';
import { renderQuickActionCards, bindQuickActionCards } from './reviewerNav.js';

/**
 * @param {HTMLElement} root
 * @param {Object} ctx
 */
export async function renderReviewerDashboard(root, ctx) {
  const {
    allRecords,
    auth,
    recentActions = [],
    recentPatches = [],
    recentBatches = [],
    onGotoTab,
  } = ctx;

  const stats = summarizeReviewStats(allRecords);
  const needsReviewConfidence = allRecords.filter((r) => r.evidence_confidence === 'needs_review').length;
  const safeFinal = allRecords.filter((r) => r.isFinal).length;
  const blocked = allRecords.filter((r) => !r.isFinal).length;

  root.innerHTML = `
    <section id="reviewer-dashboard" class="reviewer-dashboard">
      <div class="head" style="margin-bottom:16px">
        <span class="eyebrow">Reviewer Dashboard</span>
        <h2 class="gold">لوحة المراجع</h2>
        <p class="muted">نظرة عامة على قائمة المراجعة والأدلة والدفعات — لا يُعتمد المحتوى تلقائيًا.</p>
      </div>

      <div class="admin-stats admin-stats-6 glass pad">
        <div class="stat"><strong>${stats.total}</strong><span>إجمالي القائمة</span></div>
        <div class="stat warn"><strong>${stats.pending}</strong><span>pending</span></div>
        <div class="stat rose"><strong>${stats.needs_source}</strong><span>needs_source</span></div>
        <div class="stat warn"><strong>${stats.needs_precise_mapping || 0}</strong><span>needs_precise_mapping</span></div>
        <div class="stat rose"><strong>${needsReviewConfidence}</strong><span>needs_review</span></div>
        <div class="stat ok"><strong>${safeFinal}</strong><span>آمن للعرض النهائي</span></div>
        <div class="stat rose"><strong>${blocked}</strong><span>محجوب</span></div>
      </div>

      <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>

      <div class="glass pad" style="margin-top:16px">
        <p class="muted">الجلسة: ${escapeHtml(auth.user?.email || auth.user?.displayName || 'زائر')} · الدور: <strong>${escapeHtml(auth.role)}</strong> · ${auth.isMock ? 'وضع تجريبي' : 'Supabase'}</p>
      </div>

      <h3 class="gold" style="margin-top:20px">إجراءات سريعة</h3>
      ${renderQuickActionCards()}

      <div class="admin-curation-grid" style="margin-top:20px">
        <div class="glass pad">
          <h4 class="gold">آخر إجراءات المراجعة</h4>
          ${recentActions.length ? `<ul class="source-list admin-history">${recentActions.slice(0, 8).map(actionRow).join('')}</ul>` : '<p class="muted">لا توجد إجراءات بعد.</p>'}
        </div>
        <div class="glass pad">
          <h4 class="gold">آخر evidence patches</h4>
          ${recentPatches.length ? `<ul class="source-list">${recentPatches.slice(0, 5).map(patchRow).join('')}</ul>` : '<p class="muted">لا توجد patches في الجلسة.</p>'}
        </div>
        <div class="glass pad">
          <h4 class="gold">آخر دفعات المحتوى</h4>
          ${recentBatches.length ? `<ul class="source-list">${recentBatches.slice(0, 5).map(batchRow).join('')}</ul>` : '<p class="muted">لا توجد دفعات بعد.</p>'}
        </div>
      </div>
    </section>
  `;

  bindQuickActionCards(root, (tab) => onGotoTab?.(tab));
}

function actionRow(row) {
  return `<li><strong>${escapeHtml(row.action || '—')}</strong> · ${escapeHtml(row.record_type || '')}:${escapeHtml(row.record_id || '')}<br/><span class="muted">${escapeHtml(row.created_at || '')}</span></li>`;
}

function patchRow(row) {
  return `<li><span class="tag">${escapeHtml(row.status || 'draft')}</span> ${escapeHtml(row.id || '')}<br/><span class="muted">${escapeHtml(row.created_at || '')}</span></li>`;
}

function batchRow(row) {
  return `<li><span class="tag">${escapeHtml(row.status || 'draft')}</span> ${escapeHtml(row.summary || row.id || '')}</li>`;
}
