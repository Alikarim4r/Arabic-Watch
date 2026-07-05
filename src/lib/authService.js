import { getEnvConfig, isLocalRuntime } from '../config/env.js';
import { getSupabaseClient } from './supabaseClient.js';

/** @typedef {'viewer'|'reviewer'|'admin'} ReviewerRole */

const LOCAL_MOCK_ROLE_KEY = 'qsu_local_mock_role';

/** @type {{ user: Object|null, role: ReviewerRole, source: 'local_mock'|'supabase'|'anonymous', isMock: boolean, profileStatus?: string|null }|null} */
let cachedAuth = null;

/**
 * @returns {Promise<{ user: Object|null, role: ReviewerRole, source: 'local_mock'|'supabase'|'anonymous', isMock: boolean, profileStatus?: string|null }>}
 */
export async function getAuthState() {
  if (cachedAuth) return cachedAuth;

  if (isLocalRuntime()) {
    const mockRole = getLocalMockRole();
    cachedAuth = {
      user: mockRole
        ? {
            id: 'local-mock-user',
            email: 'local-mock@demo.local',
            displayName: 'Local Mock Reviewer',
          }
        : null,
      role: mockRole || 'viewer',
      source: 'local_mock',
      isMock: true,
      profileStatus: mockRole ? 'local_mock' : null,
    };
    return cachedAuth;
  }

  const client = await getSupabaseClient();
  if (!client) {
    cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false, profileStatus: null };
    return cachedAuth;
  }

  try {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user || null;
    if (!user) {
      cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false, profileStatus: null };
      return cachedAuth;
    }

    const profile = await fetchReviewerProfile(user.id);
    const role = resolveRoleFromProfile(profile);
    cachedAuth = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name || user.user_metadata?.display_name || user.email || user.id,
      },
      role,
      source: 'supabase',
      isMock: false,
      profileStatus: profile?.is_active === false ? 'inactive' : profile ? 'active' : 'missing',
    };
    return cachedAuth;
  } catch (err) {
    console.warn('[QSU] Auth state unavailable — treating as viewer.', err);
    cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false, profileStatus: null };
    return cachedAuth;
  }
}

/**
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  const state = await getAuthState();
  return state.user;
}

/**
 * @returns {Promise<ReviewerRole>}
 */
export async function getReviewerRole() {
  const state = await getAuthState();
  return state.role;
}

/**
 * @returns {Promise<boolean>}
 */
export async function isReviewer() {
  const role = await getReviewerRole();
  return role === 'reviewer' || role === 'admin';
}

/**
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  return (await getReviewerRole()) === 'admin';
}

/**
 * Reviewer tools — not available to viewer in Supabase mode.
 * Local demo mode is instructional only (always accessible with banner).
 * @returns {Promise<boolean>}
 */
export async function canAccessAdminReview() {
  if (isLocalRuntime()) return true;
  const state = await getAuthState();
  if (!state.user) return false;
  if (state.profileStatus === 'inactive') return false;
  return isReviewer();
}

/**
 * Admin-only reviewer management UI — never granted to reviewer role.
 * @returns {Promise<boolean>}
 */
export async function canManageReviewers() {
  if (isLocalRuntime()) {
    return (await getReviewerRole()) === 'admin';
  }
  return isAdmin();
}

/**
 * Local-only dev helper — clearly labeled mock, not production security.
 * @param {ReviewerRole|null} role
 */
export function setLocalMockRole(role) {
  if (!isLocalRuntime()) {
    console.warn('[QSU] setLocalMockRole ignored outside local mode.');
    return;
  }
  if (typeof localStorage !== 'undefined') {
    if (!role || role === 'viewer') localStorage.removeItem(LOCAL_MOCK_ROLE_KEY);
    else localStorage.setItem(LOCAL_MOCK_ROLE_KEY, role);
  }
  invalidateAuthCache();
}

/**
 * @returns {ReviewerRole|null}
 */
function getLocalMockRole() {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(LOCAL_MOCK_ROLE_KEY);
  if (raw === 'reviewer' || raw === 'admin') return raw;
  return null;
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  invalidateAuthCache();
  const client = await getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error: formatAuthError('Supabase not configured — local demo mode does not support production sign-in.'),
    };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: formatAuthError(error.message) };

  invalidateAuthCache();
  const profile = await fetchReviewerProfile(data.user.id);
  const role = resolveRoleFromProfile(profile);

  if (!profile) {
    await client.auth.signOut();
    invalidateAuthCache();
    return {
      ok: false,
      error: getNoRoleMessage(),
    };
  }

  if (profile.is_active === false) {
    await client.auth.signOut();
    invalidateAuthCache();
    return {
      ok: false,
      error: getInactiveReviewerMessage(),
    };
  }

  if (role === 'viewer') {
    return {
      ok: true,
      user: data.user,
      role,
      warning: 'تم تسجيل الدخول بدور viewer — لا يمكن الوصول إلى أدوات المراجعة.',
    };
  }

  return { ok: true, user: data.user, role };
}

export async function signOut() {
  invalidateAuthCache();
  if (isLocalRuntime()) {
    setLocalMockRole(null);
    return { ok: true };
  }
  const client = await getSupabaseClient();
  if (!client) return { ok: true };
  const { error } = await client.auth.signOut();
  if (error) return { ok: false, error: formatAuthError(error.message) };
  invalidateAuthCache();
  return { ok: true };
}

/**
 * @param {string} userId
 */
async function fetchReviewerProfile(userId) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('reviewer_profiles')
    .select('role, is_active, display_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * @param {{ role?: string, is_active?: boolean }|null} profile
 * @returns {ReviewerRole}
 */
function resolveRoleFromProfile(profile) {
  if (!profile || profile.is_active === false) return 'viewer';
  if (profile.role === 'admin' || profile.role === 'reviewer' || profile.role === 'viewer') {
    return profile.role;
  }
  return 'viewer';
}

export function formatAuthError(error) {
  if (!error) return 'حدث خطأ غير معروف أثناء تسجيل الدخول.';
  const msg = String(error).toLowerCase();
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (msg.includes('email not confirmed')) return 'يرجى تأكيد البريد الإلكتروني قبل تسجيل الدخول.';
  if (msg.includes('not configured')) return 'خدمة المصادقة غير مهيأة — الوضع المحلي نشط.';
  return 'تعذّر تسجيل الدخول. تحقق من البيانات وحاول مجددًا.';
}

export function getNoRoleMessage() {
  return 'لا يوجد ملف reviewer_profiles لهذا الحساب — تواصل مع المسؤول لتفعيل دور المراجع.';
}

export function getInactiveReviewerMessage() {
  return 'حساب المراجع غير نشط — تواصل مع المسؤول.';
}

/**
 * @returns {{ key: string, label: string, labelAr: string, className: string }}
 */
export function getAuthModeBadge() {
  const env = getEnvConfig();
  if (env.effectiveDataMode === 'local') {
    if (env.dataMode === 'supabase' && env.supabaseFallbackReason) {
      return {
        key: 'local-fallback',
        label: 'Local Demo (fallback)',
        labelAr: 'تجريبي محلي (fallback)',
        className: 'warn',
      };
    }
    return {
      key: 'local-demo',
      label: 'Local Demo',
      labelAr: 'وضع تجريبي محلي',
      className: 'warn',
    };
  }
  if (env.supabaseEnv === 'production') {
    return {
      key: 'supabase-production',
      label: 'Supabase Production',
      labelAr: 'Supabase إنتاج',
      className: 'rose',
    };
  }
  return {
    key: 'supabase-staging',
    label: 'Supabase Staging',
    labelAr: 'Supabase Staging',
    className: 'green',
  };
}

export function getSupabaseSignInInstructionsAr() {
  const badge = getAuthModeBadge();
  return `وضع ${badge.labelAr} — سجّل الدخول بحساب مُصرّح في reviewer_profiles. لا تُعدّل الأدوار من الواجهة.`;
}

export function invalidateAuthCache() {
  cachedAuth = null;
}

/**
 * @returns {string}
 */
export function getAuthModeLabelAr() {
  const env = getEnvConfig();
  const badge = getAuthModeBadge();
  if (env.effectiveDataMode === 'local') {
    return `${badge.labelAr} — لا توجد صلاحيات إنتاجية`;
  }
  if (env.dataMode === 'supabase' && env.supabaseFallbackReason) {
    return env.supabaseFallbackReason;
  }
  return `${badge.labelAr} — تتطلب المراجعة صلاحية reviewer/admin`;
}

/**
 * @param {{ role?: string, user?: Object|null, profileStatus?: string }} auth
 */
export function getAccessDeniedMessageAr(auth = {}) {
  if (!auth.user) return 'سجّل الدخول بحساب reviewer أو admin للوصول إلى لوحة المراجعة.';
  if (auth.profileStatus === 'inactive') return getInactiveReviewerMessage();
  if (auth.profileStatus === 'missing') return getNoRoleMessage();
  return 'صلاحية المراجعة مطلوبة — دور viewer لا يمكنه الوصول إلى أدوات المراجعة.';
}
