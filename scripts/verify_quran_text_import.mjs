#!/usr/bin/env node
/**
 * Verify imported Quran index integrity after scripts/import_quran_text.mjs.
 * Exits 0 in placeholder mode when no full import exists.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'src/data/quran/quran_text.index.json');
const fullPath = join(root, 'src/data/quran/quran_text.full.json');

const SAMPLE_KEYS = ['1:1', '2:255', '18:60', '36:1', '114:6'];

function fail(msg) {
  console.log('FAIL', msg);
  process.exit(1);
}

function pass(msg) {
  console.log('PASS', msg);
}

if (!existsSync(indexPath)) {
  fail('quran_text.index.json missing');
}

const index = JSON.parse(readFileSync(indexPath, 'utf8'));

if (!index.is_full_quran || index.ayah_count !== 6236) {
  console.log('NOTE no full Quran import — placeholder mode (expected until licensed file is added)');
  if (index.is_full_quran) fail(`is_full_quran true but ayah_count=${index.ayah_count}`);
  if (index.ayah_count && index.ayah_count !== 0) {
    fail(`partial index ayah_count=${index.ayah_count} without is_full_quran`);
  }
  pass('verify_quran_text_import — no import, stub index OK');
  process.exit(0);
}

if (!existsSync(fullPath)) {
  fail('is_full_quran index but quran_text.full.json missing');
}

const full = JSON.parse(readFileSync(fullPath, 'utf8'));

if (!Array.isArray(full.ayahs) || full.ayahs.length !== 6236) {
  fail(`full archive must have 6236 ayahs (got ${full.ayahs?.length ?? 0})`);
}
pass('total ayahs = 6236');

const keys = Object.keys(index.by_key || {});
if (keys.length !== 6236) {
  fail(`index by_key count ${keys.length} !== 6236`);
}
pass('index by_key has 6236 entries');

const seen = new Set();
for (const key of keys) {
  if (seen.has(key)) fail(`duplicate ayah_key in index: ${key}`);
  seen.add(key);
  const row = index.by_key[key];
  const expected = `${row.surah_id}:${row.ayah_number}`;
  if (key !== expected) fail(`ayah_key mismatch: ${key} vs ${expected}`);
  if (!row.text_uthmani || String(row.text_uthmani).trim() === '') {
    fail(`empty text_uthmani at ${key}`);
  }
}
pass('no duplicate ayah_key; all keys match surah_id:ayah_number');

for (const sampleKey of SAMPLE_KEYS) {
  const hit = index.by_key[sampleKey];
  if (!hit?.text_uthmani) fail(`sample lookup missing: ${sampleKey}`);
  const fullHit = full.ayahs.find((a) => a.ayah_key === sampleKey);
  if (!fullHit) fail(`full archive missing sample: ${sampleKey}`);
  if (hit.text_uthmani !== fullHit.text_uthmani) {
    fail(`text_uthmani altered in index for ${sampleKey}`);
  }
}
pass(`sample lookups OK: ${SAMPLE_KEYS.join(', ')}`);

for (const field of ['source_name', 'license', 'script_type', 'riwayah']) {
  if (!index.meta?.[field]) fail(`index meta.${field} missing after import`);
}
pass('index meta preserves source_name, license, script_type, riwayah');

console.log('PASS verify_quran_text_import');
console.log(' source:', full.meta?.source_name);
console.log(' license:', full.meta?.license);
console.log(' riwayah:', full.meta?.riwayah);
console.log(' script:', full.meta?.script_type);
process.exit(0);
