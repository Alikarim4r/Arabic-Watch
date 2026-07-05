#!/usr/bin/env node
/**
 * Optional live Supabase staging smoke checks (anon key only).
 * Does NOT run in npm run qa — use npm run qa:staging when credentials exist.
 * Exits 0 with SKIP when env is missing (safe for optional CI steps).
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    out[key] = val;
  }
  return out;
}

function loadStagingEnv() {
  const fromFile = {
    ...parseEnvFile(join(root, '.env')),
    ...parseEnvFile(join(root, '.env.staging')),
  };
  return {
    url: process.env.VITE_SUPABASE_URL || fromFile.VITE_SUPABASE_URL || '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || fromFile.VITE_SUPABASE_ANON_KEY || '',
    dataMode: process.env.VITE_DATA_MODE || fromFile.VITE_DATA_MODE || 'supabase',
  };
}

function isPublicFinalEvent(row) {
  if (row.review_status !== 'approved') return false;
  if (!row.source_status || row.source_status === 'none' || row.source_status === 'needs_source') {
    return false;
  }
  if (row.evidence_status !== 'precise_evidence') return false;
  if (row.evidence_confidence === 'needs_review') return false;
  return true;
}

const REQUIRED_OBJECTS = [
  { name: 'surahs', type: 'table' },
  { name: 'story_events', type: 'table' },
  { name: 'reviewer_profiles', type: 'table' },
  { name: 'review_actions', type: 'table' },
  { name: 'content_change_batches', type: 'table' },
  { name: 'content_review_queue_content_view', type: 'view' },
];

const env = loadStagingEnv();

if (!env.url || !env.anonKey) {
  console.log('SKIP supabase_staging_smoke — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set.');
  console.log('Set credentials in .env.staging (never commit) and run: npm run qa:staging');
  process.exit(0);
}

console.log('SUPABASE STAGING SMOKE');
console.log('URL:', env.url.replace(/^(https:\/\/)[^.]+/, '$1***'));

const client = createClient(env.url, env.anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failed = 0;
const pass = (msg) => console.log('PASS', msg);
const fail = (msg, detail = '') => {
  console.log('FAIL', msg, detail);
  failed++;
};

for (const obj of REQUIRED_OBJECTS) {
  const { error } = await client.from(obj.name).select('*', { head: true, count: 'exact' });
  if (error && /permission denied|does not exist|relation/i.test(error.message)) {
    fail(`object accessible: ${obj.name}`, error.message);
  } else {
    pass(`object reachable: ${obj.name}`);
  }
}

const { data: surahs, error: surahErr } = await client.from('surahs').select('id').limit(5);
if (surahErr) fail('anonymous surahs read', surahErr.message);
else if (!surahs?.length) fail('anonymous surahs read', 'empty — seed may be missing');
else pass('anonymous surahs public read');

const { data: events, error: eventsErr } = await client.from('story_events').select('*').limit(200);
if (eventsErr) {
  fail('anonymous story_events read', eventsErr.message);
} else {
  const nonFinal = (events || []).filter((row) => !isPublicFinalEvent(row));
  if (nonFinal.length) {
    fail(
      'anonymous story_events exposes non-final rows',
      nonFinal.slice(0, 3).map((r) => `${r.id}:${r.review_status}`).join(', ')
    );
  } else {
    pass('anonymous story_events only public-final rows (or empty)');
  }
}

const { error: insertErr } = await client.from('review_actions').insert({
  record_type: 'event',
  record_id: 'smoke_test',
  action: 'approve',
  previous_status: 'pending',
  new_status: 'approved',
  payload: { smoke: true },
});

if (!insertErr) {
  fail('anonymous review_actions insert blocked', 'insert succeeded unexpectedly');
} else {
  pass('anonymous review_actions insert blocked');
}

const { error: profileInsertErr } = await client.from('reviewer_profiles').insert({
  user_id: '00000000-0000-0000-0000-000000000001',
  display_name: 'smoke',
  role: 'admin',
});

if (!profileInsertErr) {
  fail('anonymous reviewer_profiles insert blocked', 'insert succeeded unexpectedly');
} else {
  pass('anonymous reviewer_profiles insert blocked');
}

console.log(failed ? '\nSTAGING SMOKE FAILED' : '\nSTAGING SMOKE PASSED');
process.exit(failed ? 1 : 0);
