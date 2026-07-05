import { getEnvConfig, getEffectiveDataMode } from '../../config/env.js';
import { loadLocalRepository } from './localRepository.js';
import { createSupabaseRepository } from './supabaseRepository.js';

/** @typedef {import('../../lib/repository.js').Repository} Repository */

/**
 * @param {{ dataMode?: 'local'|'supabase', supabaseUrl?: string, supabaseAnonKey?: string }} [overrides]
 * @returns {Promise<Repository>}
 */
export async function createRepository(overrides = {}) {
  const env = getEnvConfig();
  const mode = getEffectiveDataMode(overrides);

  if (env.supabaseFallbackReason && (overrides.dataMode || env.dataMode) === 'supabase') {
    console.warn(`[QSU] ${env.supabaseFallbackReason}`);
  }

  if (mode === 'supabase') {
    try {
      return await createSupabaseRepository({
        supabaseUrl: overrides.supabaseUrl || env.supabaseUrl,
        supabaseAnonKey: overrides.supabaseAnonKey || env.supabaseAnonKey,
      });
    } catch (err) {
      console.warn('[QSU] Supabase repository unavailable — using local JSON.', err);
      return loadLocalRepository();
    }
  }

  return loadLocalRepository();
}

export { loadLocalRepository } from './localRepository.js';
export { createSupabaseRepository } from './supabaseRepository.js';
