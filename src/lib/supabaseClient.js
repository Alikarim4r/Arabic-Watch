import { getEnvConfig } from '../config/env.js';

/** @type {import('@supabase/supabase-js').SupabaseClient|null} */
let client = null;

/** @type {Promise<import('@supabase/supabase-js').SupabaseClient|null>|null} */
let clientPromise = null;

/**
 * Lazily create a Supabase client when credentials exist.
 * Uses dynamic import so local mode works without bundler/npm resolution in browser.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient|null>}
 */
export async function getSupabaseClient() {
  const env = getEnvConfig();
  if (env.effectiveDataMode !== 'supabase' || !env.isSupabaseConfigured) {
    return null;
  }

  if (client) return client;
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return client;
    } catch (err) {
      console.warn('[QSU] Failed to load Supabase client module.', err);
      return null;
    } finally {
      clientPromise = null;
    }
  })();

  return clientPromise;
}

/**
 * Reset cached client (tests only).
 */
export function resetSupabaseClientForTests() {
  client = null;
  clientPromise = null;
}
