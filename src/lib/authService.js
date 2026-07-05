import { getEnvConfig, isLocalRuntime } from '../config/env.js';
import { getSupabaseClient } from './supabaseClient.js';

/** @typedef {'viewer'|'reviewer'|'admin'} ReviewerRole */

const LOCAL_MOCK_ROLE_KEY = 'qsu_local_mock_role';

/** @type {{ user: Object|null, role: ReviewerRole, source: 'local_mock'|'supabase'|'anonymous' }|null} */
let cachedAuth = null;

/**
 * @returns {Promise<{ user: Object|null, role: ReviewerRole, source: 'local_mock'|'supabase'|'anonymous', isMock: boolean }>}
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
    };
    return cachedAuth;
  }

  const client = await getSupabaseClient();
  if (!client) {
    cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false };
    return cachedAuth;
  }

  try {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user || null;
    if (!user) {
      cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false };
      return cachedAuth;
    }

    const role = await fetchReviewerRole(user.id);
    cachedAuth = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name || user.email || user.id,
      },
      role,
      source: 'supabase',
      isMock: false,
    };
    return cachedAuth;
  } catch (err) {
    console.warn('[QSU] Auth state unavailable — treating as viewer.', err);
    cachedAuth = { user: null, role: 'viewer', source: 'anonymous', isMock: false };
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
 * @returns {Promise<boolean>}
 */
export async function canAccessAdminReview() {
  if (isLocalRuntime()) return true;
  return isReviewer();
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
      error: 'Supabase not configured — local demo mode does not support production sign-in.',
    };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  invalidateAuthCache();
  return { ok: true, user: data.user };
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
  if (error) return { ok: false, error: error.message };
  invalidateAuthCache();
  return { ok: true };
}

/**
 * @param {string} userId
 * @returns {Promise<ReviewerRole>}
 */
async function fetchReviewerRole(userId) {
  const client = await getSupabaseClient();
  if (!client) return 'viewer';

  const { data, error } = await client
    .from('reviewer_profiles')
    .select('role, is_active')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data || data.is_active === false) return 'viewer';
  if (data.role === 'admin' || data.role === 'reviewer' || data.role === 'viewer') {
    return data.role;
  }
  return 'viewer';
}

export function invalidateAuthCache() {
  cachedAuth = null;
}

/**
 * @returns {string}
 */
export function getAuthModeLabelAr() {
  const env = getEnvConfig();
  if (env.effectiveDataMode === 'local') {
    return 'وضع تجريبي محلي — لا توجد صلاحيات إنتاجية';
  }
  if (env.dataMode === 'supabase' && env.supabaseFallbackReason) {
    return env.supabaseFallbackReason;
  }
  return 'وضع Supabase — تتطلب المراجعة صلاحية reviewer/admin';
}
