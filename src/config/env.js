/**
 * Runtime environment configuration.
 * Supports Vite (import.meta.env), injected window.__QSU_ENV__, and safe defaults.
 */

/** @typedef {'local'|'supabase'} DataMode */

/**
 * @returns {{ dataMode: DataMode, effectiveDataMode: DataMode, supabaseUrl: string, supabaseAnonKey: string, isSupabaseConfigured: boolean, supabaseFallbackReason: string|null }}
 */
export function getEnvConfig() {
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env || {} : {};
  const injected =
    typeof window !== 'undefined' && window.__QSU_ENV__ ? window.__QSU_ENV__ : {};

  const dataModeRaw =
    injected.VITE_DATA_MODE || viteEnv.VITE_DATA_MODE || 'local';
  const dataMode = dataModeRaw === 'supabase' ? 'supabase' : 'local';

  const supabaseUrl = String(
    injected.VITE_SUPABASE_URL || viteEnv.VITE_SUPABASE_URL || ''
  ).trim();
  const supabaseAnonKey = String(
    injected.VITE_SUPABASE_ANON_KEY || viteEnv.VITE_SUPABASE_ANON_KEY || ''
  ).trim();

  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
  let effectiveDataMode = dataMode;
  let supabaseFallbackReason = null;

  if (dataMode === 'supabase' && !isSupabaseConfigured) {
    effectiveDataMode = 'local';
    supabaseFallbackReason = 'VITE_DATA_MODE=supabase but Supabase URL/key missing — using local JSON fallback.';
  }

  return {
    dataMode,
    effectiveDataMode,
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured,
    supabaseFallbackReason,
  };
}

/**
 * Resolved runtime data mode after credential checks.
 * @param {{ dataMode?: DataMode }} [overrides]
 * @returns {DataMode}
 */
export function getEffectiveDataMode(overrides = {}) {
  const env = getEnvConfig();
  const requested = overrides.dataMode || env.dataMode;
  if (requested === 'supabase' && !env.isSupabaseConfigured) {
    return 'local';
  }
  return requested;
}

/**
 * @returns {boolean}
 */
export function isSupabaseRuntime() {
  return getEnvConfig().effectiveDataMode === 'supabase';
}

/**
 * @returns {boolean}
 */
export function isLocalRuntime() {
  return getEnvConfig().effectiveDataMode === 'local';
}
