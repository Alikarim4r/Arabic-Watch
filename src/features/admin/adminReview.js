import { getRepository, getDataMode, isFinalContent } from '../../lib/dataService.js';
import { getEnvConfig, isLocalRuntime, isSupabaseRuntime } from '../../config/env.js';
import {
  canAccessAdminReview,
  formatAuthError,
  getAuthModeLabelAr,
  getAuthState,
  invalidateAuthCache,
  isAdmin,
  isReviewer,
  setLocalMockRole,
  signIn,
  signOut,
} from '../../lib/authService.js';
import { escapeHtml, formatAyahRef } from '../../lib/utils.js';
import { reviewBadgeHtml } from '../../components/reviewBadge.js';
import { DISCLAIMER_AR } from '../../components/disclaimer.js';
import { showToast, initToastContainer } from '../../components/toast.js';
import { showConfirmDialog } from '../../components/confirmDialog.js';
import { renderAccessDeniedView } from '../auth/accessDeniedView.js';
import { renderAuthStatusPanel } from '../auth/authStatusPanel.js';
import { bindSignInView, renderSignInView } from '../auth/signInView.js';
import {
  applyChipFilter,
  buildFilterChips,
  buildReviewQueue,
  filterReviewQueue,
  getNonFinalRecords,
  loadSavedReviewFilters,
  resolveSourceLabels,
  saveReviewFilters,
  sortReviewQueueByPriority,
  summarizeReviewStats,
} from './reviewQueue.js';
import {
  applyMockOverrides,
  actionRequiresConfirmation,
  actionRequiresNote,
  loadReviewActionHistory,
  renderReviewHistoryHtml,
  saveMockOverride,
  submitReviewAction,
} from './reviewActions.js';
import { renderEvidenceCurationPanel } from './evidenceCurationPanel.js';
import { renderContentBatchesPanel } from './contentBatchesPanel.js';
import { renderReviewerDashboard } from './reviewerDashboard.js';
import { renderReviewHistoryPanel } from './reviewHistoryPanel.js';
import { renderReviewerProfilePanel } from './reviewerProfilePanel.js';
import { bindReviewerNav, renderReviewerNav } from './reviewerNav.js';

/** @type {Object|null} */
let state = null;

/**
 * @param {HTMLElement} container
 */
export async function renderAdminReview(container) {
  initToastContainer();
  container.innerHTML = `
    <section id="admin-review" class="admin-review">
      <div class="wrap">
        <div class="head">
          <span class="eyebrow">حوكمة المحتوى</span>
          <h2>لوحة المراجع (Reviewer Dashboard)</h2>
          <p>مراجعة السجلات قبل النشر النهائي — لا يُعتمد المحتوى تلقائيًا.</p>
        </div>
        <div id="admin-review-root"><div class="state-box">جاري تحميل لوحة المراجع…</div></div>
      </div>
    </section>
  `;

  const root = container.querySelector('#admin-review-root');

  try {
    const repo = await getRepository();
    const [nodes, events, themes, eventAyahs, tafsirSources, surahs] = await Promise.all([
      repo.getNodes(),
      repo.getEvents(),
      repo.getThemes(),
      repo.getEventAyahs(),
      repo.getTafsirSources(),
      repo.getSurahs(),
    ]);

    const env = getEnvConfig();
    const auth = await getAuthState();
    const canAccess = await canAccessAdminReview();

    if (!canAccess) {
      root.innerHTML = renderSignInShell(auth, { accessDenied: true });
      bindAuthShell(root, { repo: null });
      return;
    }

    const savedFilters = loadSavedReviewFilters();
    state = {
      repo,
      auth,
      env,
      nodes,
      events,
      themes,
      eventAyahs,
      tafsirSources,
      surahs,
      allRecords: buildReviewQueue({ nodes, events, themes, eventAyahs, tafsirSources }),
      activeTab: 'dashboard',
      curationSelectedId: null,
      batchSelectedId: null,
      historyFilters: {},
      authLoading: false,
      authError: '',
      panelError: '',
      panelLoading: false,
      activeChip: '',
      filters: savedFilters || {
        recordType: '',
        reviewStatus: '',
        sourceStatus: '',
        sourceId: '',
        nodeType: '',
        evidenceStatus: '',
        evidenceConfidence: '',
        onlyNotFinal: false,
        q: '',
      },
      selectedId: null,
      selectedType: null,
    };

    await renderAdminPanel(root);
  } catch (err) {
    root.innerHTML = `<div class="state-box error">${escapeHtml(err.message)}<br/><button type="button" class="btn sm" id="admin-retry">إعادة المحاولة</button></div>`;
    root.querySelector('#admin-retry')?.addEventListener('click', () => renderAdminReview(container));
  }
}

function renderSignInShell(auth, { accessDenied = false } = {}) {
  return `
    ${renderAuthStatusPanel({ auth, error: state?.authError })}
    ${renderSignInView({ auth, loading: state?.authLoading, error: state?.authError })}
    ${accessDenied ? renderAccessDeniedView({ user: auth.user, role: auth.role }) : ''}
  `;
}

function bindAuthShell(root, { repo }) {
  bindSignInView(root, {
    onSignIn: async (email, password) => {
      state = state || {};
      state.authLoading = true;
      state.authError = '';
      const result = await signIn(email, password);
      state.authLoading = false;
      if (!result.ok) {
        state.authError = formatAuthError(result.error);
        showToast(state.authError, 'error');
        return;
      }
      invalidateAuthCache();
      showToast('تم تسجيل الدخول بنجاح', 'success');
      if (repo) await renderAdminPanel(root.closest('#admin-review-root') || root);
      else location.reload();
    },
    onSignOut: async () => {
      await signOut();
      invalidateAuthCache();
      showToast('تم تسجيل الخروج', 'info');
      location.reload();
    },
    onMockRole: (role) => {
      setLocalMockRole(role);
      invalidateAuthCache();
      showToast(role ? `دور تجريبي: ${role}` : 'تم مسح الدور التجريبي', 'info');
      location.reload();
    },
  });
}

async function refreshAuth() {
  invalidateAuthCache();
  state.auth = await getAuthState();
}

async function renderAdminPanel(root) {
  if (!state) return;

  const canAccess = await canAccessAdminReview();
  if (!canAccess) {
    root.innerHTML = renderSignInShell(state.auth, { accessDenied: true });
    bindAuthShell(root, { repo: state.repo });
    return;
  }

  const demoBanner = isLocalRuntime()
    ? `<div class="draft-banner admin-demo-banner">${escapeHtml(getAuthModeLabelAr())}</div>`
    : `<div class="admin-warning">${escapeHtml(getAuthModeLabelAr())}</div>`;

  root.innerHTML = `
    ${demoBanner}
    ${renderAuthStatusPanel({ auth: state.auth, error: state.authError })}
    ${renderReviewerNav(state.activeTab, { isAdmin: await isAdmin() })}
    <div id="admin-active-panel"></div>
  `;

  bindReviewerNav(root, (tab) => {
    state.activeTab = tab;
    renderAdminPanel(root);
  });

  const panel = root.querySelector('#admin-active-panel');
  if (!panel) return;

  switch (state.activeTab) {
    case 'dashboard':
      await renderDashboardPanel(panel);
      break;
    case 'curation':
      await renderEvidenceCurationPanel(panel, buildSubCtx());
      break;
    case 'batches':
      await renderContentBatchesPanel(panel, buildSubCtx());
      break;
    case 'history':
      await renderHistoryPanel(panel);
      break;
    case 'profile':
      await renderProfilePanel(panel);
      break;
    case 'review':
    default:
      await renderReviewQueuePanel(panel);
      break;
  }
}

function buildSubCtx() {
  return {
    repo: state.repo,
    auth: state.auth,
    isLocalMode: isLocalRuntime(),
    isSupabaseMode: isSupabaseRuntime(),
    canSubmitPatches: isLocalRuntime() || state.auth.role === 'reviewer' || state.auth.role === 'admin',
    canSubmitBatches: isLocalRuntime() || state.auth.role === 'reviewer' || state.auth.role === 'admin',
    isAdmin: state.auth.role === 'admin',
    events: state.events,
    nodes: state.nodes,
    themes: state.themes,
    eventAyahs: state.eventAyahs,
    tafsirSources: state.tafsirSources,
    surahs: state.surahs,
    curationSelectedId: state.curationSelectedId,
    batchSelectedId: state.batchSelectedId,
    onTabChange: (tab) => {
      state.activeTab = tab;
      renderAdminPanel(document.querySelector('#admin-review-root'));
    },
    onSelectEvent: (id) => {
      state.curationSelectedId = id;
      renderAdminPanel(document.querySelector('#admin-review-root'));
    },
    onSelectBatch: (id) => {
      state.batchSelectedId = id;
      renderAdminPanel(document.querySelector('#admin-review-root'));
    },
    onRefreshBatches: () => renderAdminPanel(document.querySelector('#admin-review-root')),
    onToast: (msg) => showToast(msg, 'success'),
    showConfirmDialog,
  };
}

async function renderDashboardPanel(panel) {
  const recentActions = (await state.repo.getAllReviewActionHistory?.(12)) || [];
  const recentPatches = (await state.repo.getEvidencePatchSubmissions?.(8)) || [];
  const recentBatches = (await state.repo.getContentChangeBatches?.()) || [];
  await renderReviewerDashboard(panel, {
    allRecords: applyMockOverrides(state.allRecords),
    auth: state.auth,
    recentActions,
    recentPatches,
    recentBatches,
    onGotoTab: (tab) => {
      state.activeTab = tab;
      renderAdminPanel(document.querySelector('#admin-review-root'));
    },
  });
}

async function renderHistoryPanel(panel) {
  state.panelLoading = true;
  await renderReviewHistoryPanel(panel, { history: [], loading: true });
  const history = (await state.repo.getAllReviewActionHistory?.(200)) || [];
  state.panelLoading = false;
  await renderReviewHistoryPanel(panel, {
    history,
    loading: false,
    filters: state.historyFilters,
    onFilterChange: (f) => {
      state.historyFilters = f;
      renderHistoryPanel(panel);
    },
    onRetry: () => renderHistoryPanel(panel),
  });
}

async function renderProfilePanel(panel) {
  const history = (await state.repo.getAllReviewActionHistory?.(500)) || [];
  const patches = (await state.repo.getEvidencePatchSubmissions?.(100)) || [];
  const profile = (await state.repo.getReviewerProfile?.()) || null;
  const stats = {
    actionCount: history.length,
    approvedCount: history.filter((h) => h.action === 'approve').length,
    rejectedCount: history.filter((h) => ['reject', 'request_revision'].includes(h.action)).length,
    patchCount: patches.length,
    lastActivity: history[0]?.created_at || null,
  };
  await renderReviewerProfilePanel(panel, {
    auth: state.auth,
    profile,
    stats,
    isAdmin: await isAdmin(),
    reviewerList: (await state.repo.getReviewerProfiles?.()) || [],
    loading: false,
    onRetry: () => renderProfilePanel(panel),
  });

  const signInMount = document.createElement('div');
  signInMount.style.marginTop = '16px';
  panel.appendChild(signInMount);
  signInMount.innerHTML = renderSignInView({ auth: state.auth, loading: state.authLoading, error: state.authError });
  bindSignInView(signInMount, {
    onSignIn: async (email, password) => {
      state.authLoading = true;
      const result = await signIn(email, password);
      state.authLoading = false;
      if (!result.ok) {
        state.authError = formatAuthError(result.error);
        showToast(state.authError, 'error');
      } else {
        await refreshAuth();
        showToast('تم تسجيل الدخول', 'success');
      }
      renderProfilePanel(panel);
    },
    onSignOut: async () => {
      await signOut();
      await refreshAuth();
      showToast('تم تسجيل الخروج', 'info');
      renderAdminPanel(document.querySelector('#admin-review-root'));
    },
    onMockRole: (role) => {
      setLocalMockRole(role);
      invalidateAuthCache();
      showToast(role ? `دور: ${role}` : 'مسح الدور', 'info');
      location.reload();
    },
  });
}

async function renderReviewQueuePanel(panel) {
  let records = applyMockOverrides(state.allRecords);
  records = sortReviewQueueByPriority(filterReviewQueue(records, state.filters));
  if (state.activeChip) records = applyChipFilter(records, state.activeChip);

  const stats = summarizeReviewStats(applyMockOverrides(state.allRecords));
  const chips = buildFilterChips(applyMockOverrides(state.allRecords));
  const nonFinal = getNonFinalRecords(applyMockOverrides(state.allRecords));
  const selected =
    records.find((r) => r.id === state.selectedId && r.recordType === state.selectedType) ||
    records[0] ||
    null;

  if (selected) {
    state.selectedId = selected.id;
    state.selectedType = selected.recordType;
  }

  const selectedIndex = selected ? records.findIndex((r) => r.id === selected.id && r.recordType === selected.recordType) : -1;

  let historyHtml = '<p class="muted">—</p>';
  if (selected && state.repo.getReviewActionHistory) {
    const history = await loadReviewActionHistory(state.repo, selected.recordType, selected.id);
    historyHtml = renderReviewHistoryHtml(history, { localMode: isLocalRuntime() });
  }

  panel.innerHTML = `
    <div class="admin-grid">
      <aside class="glass pad admin-sidebar">
        <div class="admin-stats">
          <div class="stat"><strong>${stats.total}</strong><span>إجمالي</span></div>
          <div class="stat ok"><strong>${stats.approved}</strong><span>مراجَع</span></div>
          <div class="stat warn"><strong>${stats.pending}</strong><span>قيد المراجعة</span></div>
          <div class="stat rose"><strong>${stats.needs_source}</strong><span>يحتاج مصدر</span></div>
        </div>
        <div class="filter-chips">
          ${chips.map((c) => `<button type="button" class="btn sm filter-chip ${state.activeChip === c.key ? 'primary' : ''}" data-chip="${c.key}">${escapeHtml(c.label_ar)} (${c.count})</button>`).join('')}
          ${state.activeChip ? '<button type="button" class="btn sm" id="clear-chip">مسح</button>' : ''}
        </div>
        <p class="disclaimer-banner admin-disclaimer">${DISCLAIMER_AR}</p>
        <h3 class="gold">تصفية</h3>
        <div class="admin-filters">
          <input type="search" id="admin-q" placeholder="بحث record_id / title / node…" value="${escapeHtml(state.filters.q)}" />
          <select id="admin-type">
            <option value="">كل الأنواع</option>
            <option value="node" ${state.filters.recordType === 'node' ? 'selected' : ''}>عقدة</option>
            <option value="event" ${state.filters.recordType === 'event' ? 'selected' : ''}>حدث</option>
            <option value="theme" ${state.filters.recordType === 'theme' ? 'selected' : ''}>محور</option>
          </select>
          <select id="admin-review-status">
            <option value="">كل حالات المراجعة</option>
            <option value="pending" ${state.filters.reviewStatus === 'pending' ? 'selected' : ''}>pending</option>
            <option value="needs_source" ${state.filters.reviewStatus === 'needs_source' ? 'selected' : ''}>needs_source</option>
            <option value="approved" ${state.filters.reviewStatus === 'approved' ? 'selected' : ''}>approved</option>
          </select>
          <label class="admin-check"><input type="checkbox" id="admin-not-final" ${state.filters.onlyNotFinal ? 'checked' : ''} /> غير نهائي فقط</label>
          <button type="button" class="btn sm" id="save-filters">حفظ التصفية</button>
        </div>
        <p class="muted" style="font-size:12px">اختصارات: j/k التالي/السابق · / بحث · Esc إغلاق</p>
        <h3 class="gold" style="margin-top:16px">غير قابل للعرض النهائي (${nonFinal.length})</h3>
      </aside>

      <div class="admin-main glass pad">
        <div class="admin-queue-head">
          <h3 class="gold">قائمة المراجعة (${records.length})</h3>
          <div class="admin-actions">
            <button type="button" class="btn sm" id="prev-record" ${selectedIndex <= 0 ? 'disabled' : ''}>السابق</button>
            <button type="button" class="btn sm" id="next-record" ${selectedIndex >= records.length - 1 ? 'disabled' : ''}>التالي</button>
          </div>
        </div>
        <div class="admin-queue" id="admin-queue">
          ${records.length ? records.map((r) => queueItemHtml(r, selected)).join('') : '<div class="state-box">لا توجد سجلات مطابقة.</div>'}
        </div>
      </div>

      <div class="admin-detail glass pad" id="admin-detail">
        ${selected ? detailHtml(selected, historyHtml) : '<div class="state-box">اختر سجلًا للمراجعة.</div>'}
      </div>
    </div>
  `;

  bindReviewQueueEvents(panel, records, selectedIndex);
}

function queueItemHtml(record, selected) {
  const active =
    selected && selected.id === record.id && selected.recordType === record.recordType ? ' active' : '';
  return `
    <button type="button" class="admin-queue-item${active}" data-id="${record.id}" data-type="${record.recordType}">
      <span class="tag">${escapeHtml(record.recordType)}</span>
      ${reviewBadgeHtml(record.review_status)}
      <strong>${escapeHtml(record.title_ar)}</strong>
      <span class="muted">${escapeHtml(record.id)}</span>
    </button>`;
}

function detailHtml(record, historyHtml) {
  const sources = resolveSourceLabels(state.tafsirSources, record.source_ids);
  const finalLabel = isFinalContent(record.raw || record)
    ? '<span class="tag green">نهائي في الوضع العام</span>'
    : '<span class="tag rose">غير نهائي في الوضع العام</span>';

  return `
    <h3 class="gold">${escapeHtml(record.title_ar)}</h3>
    <p>${reviewBadgeHtml(record.review_status)} ${finalLabel}</p>
    <p class="muted">${escapeHtml(record.id)} · ${escapeHtml(record.recordType)}</p>
    <p style="margin-top:12px">${escapeHtml(record.summary_ar || '—')}</p>

    <h4 class="gold" style="margin-top:18px">ملاحظات المراجع</h4>
    <textarea id="admin-note" rows="2" placeholder="reviewer_note (مطلوب للاعتماد/الرفض)">${escapeHtml(record.mockOverride?.note || '')}</textarea>
    <label class="qsu-confirm-field">ملاحظة داخلية<textarea id="admin-internal-note" rows="2"></textarea></label>
    <label class="qsu-confirm-field">ملاحظة المصدر<textarea id="admin-source-note" rows="2"></textarea></label>
    <label class="qsu-confirm-field">ملاحظة الأدلة<textarea id="admin-evidence-note" rows="2"></textarea></label>

    <div class="admin-actions">
      <button type="button" class="btn primary sm" data-action="approve">اعتماد</button>
      <button type="button" class="btn sm" data-action="needs_source">يحتاج مصدر</button>
      <button type="button" class="btn sm" data-action="reject">رفض</button>
      <button type="button" class="btn sm" data-action="request_revision">طلب تعديل</button>
    </div>

    <h4 class="gold" style="margin-top:18px">سجل إجراءات المراجعة</h4>
    ${historyHtml}
  `;
}

function bindReviewQueueEvents(root, records, selectedIndex) {
  const rerender = () => renderAdminPanel(document.querySelector('#admin-review-root'));

  const applyFilters = () => {
    state.filters.q = root.querySelector('#admin-q')?.value || '';
    state.filters.recordType = root.querySelector('#admin-type')?.value || '';
    state.filters.reviewStatus = root.querySelector('#admin-review-status')?.value || '';
    state.filters.onlyNotFinal = root.querySelector('#admin-not-final')?.checked || false;
    rerender();
  };

  ['#admin-q', '#admin-type', '#admin-review-status', '#admin-not-final'].forEach((sel) => {
    root.querySelector(sel)?.addEventListener('input', applyFilters);
    root.querySelector(sel)?.addEventListener('change', applyFilters);
  });

  root.querySelector('#save-filters')?.addEventListener('click', () => {
    saveReviewFilters(state.filters);
    showToast('تم حفظ التصفية', 'success');
  });

  root.querySelectorAll('[data-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeChip = btn.dataset.chip;
      rerender();
    });
  });
  root.querySelector('#clear-chip')?.addEventListener('click', () => {
    state.activeChip = '';
    rerender();
  });

  root.querySelectorAll('.admin-queue-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedId = btn.dataset.id;
      state.selectedType = btn.dataset.type;
      rerender();
    });
  });

  root.querySelector('#prev-record')?.addEventListener('click', () => {
    if (selectedIndex > 0) {
      const prev = records[selectedIndex - 1];
      state.selectedId = prev.id;
      state.selectedType = prev.recordType;
      rerender();
    }
  });

  root.querySelector('#next-record')?.addEventListener('click', () => {
    if (selectedIndex < records.length - 1) {
      const next = records[selectedIndex + 1];
      state.selectedId = next.id;
      state.selectedType = next.recordType;
      rerender();
    }
  });

  const onKey = (e) => {
    if (document.querySelector('.qsu-confirm-overlay')) return;
    if (e.target.matches('textarea, input, select')) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === 'j') root.querySelector('#next-record')?.click();
    if (e.key === 'k') root.querySelector('#prev-record')?.click();
    if (e.key === '/') {
      e.preventDefault();
      root.querySelector('#admin-q')?.focus();
    }
  };
  if (state._keyHandler) document.removeEventListener('keydown', state._keyHandler);
  state._keyHandler = onKey;
  document.addEventListener('keydown', onKey);

  root.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const selected = records.find((r) => r.id === state.selectedId && r.recordType === state.selectedType);
      if (!selected) return;
      const action = btn.dataset.action;
      const notes = {
        reviewer_note: root.querySelector('#admin-note')?.value?.trim() || '',
        internal_note: root.querySelector('#admin-internal-note')?.value?.trim() || '',
        source_note: root.querySelector('#admin-source-note')?.value?.trim() || '',
        evidence_note: root.querySelector('#admin-evidence-note')?.value?.trim() || '',
      };

      if (actionRequiresConfirmation(action)) {
        const nextStatus = action === 'approve' ? 'approved' : action === 'needs_source' ? 'needs_source' : 'pending';
        const confirmed = await showConfirmDialog({
          title: 'تأكيد إجراء المراجعة',
          actionLabel: action,
          recordLabel: `${selected.recordType}:${selected.id}`,
          currentStatus: selected.review_status,
          newStatus: nextStatus,
          affectsPublicFinal: action === 'approve',
          requireNote: actionRequiresNote(action),
          showInternalNote: true,
          showSourceNote: true,
          showEvidenceNote: true,
        });
        if (!confirmed.confirmed) return;
        notes.reviewer_note = confirmed.reviewer_note || notes.reviewer_note;
        notes.internal_note = confirmed.internal_note || notes.internal_note;
        notes.source_note = confirmed.source_note || notes.source_note;
        notes.evidence_note = confirmed.evidence_note || notes.evidence_note;
      }

      if (actionRequiresNote(action) && !notes.reviewer_note) {
        showToast('ملاحظة المراجع مطلوبة لهذا الإجراء', 'error');
        return;
      }

      if (isLocalRuntime()) saveMockOverride(selected, action, notes.reviewer_note);
      const result = await submitReviewAction(state.repo, {
        record: selected,
        action,
        notes,
        reviewerName: state.auth.user?.displayName || state.auth.user?.email || 'reviewer',
      });
      showToast(result.message || `تم تسجيل «${action}»`, result.ok ? 'success' : 'error');
      rerender();
    });
  });
}
