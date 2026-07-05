/**
 * Runtime environment configuration.
 * Supports Vite (import.meta.env), injected window.__QSU_ENV__, and safe defaults.
 */

/** @typedef {'local'|'supabase'} DataMode */

/**
 * @returns {{ dataMode: DataMode, supabaseUrl: string, supabaseAnonKey: string, isSupabaseConfigured: boolean }}
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

  return {
    dataMode,
    supabaseUrl,
    supabaseAnonKey,
    isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  };
}
