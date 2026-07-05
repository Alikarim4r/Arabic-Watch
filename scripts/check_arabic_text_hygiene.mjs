import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import {
  ARABIC_FIELD_NAMES,
  ARABIC_THEN_LATIN,
  HAS_LATIN,
  MOJIBAKE_PATTERNS,
} from './lib/scholarDecisionConstants.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const failOnWarn = process.argv.includes('--fail-on-warn');

const DATA_PATHS = [
  join(root, 'src/data/seed_content.json'),
  join(root, 'src/data/precise_event_evidence.json'),
];

const EXAMPLE_GLOB_DIR = join(root, 'examples');
const DOC_GLOB_DIR = join(root, 'docs');

const errors = [];
const warnings = [];

function isMostlyArabic(text) {
  const letters = text.replace(/\s/g, '');
  if (!letters.length) return false;
  const arabic = (letters.match(/[\u0600-\u06FF]/g) || []).length;
  return arabic / letters.length >= 0.5;
}

function checkArabicString(value, fieldName, file, fieldPath) {
  if (typeof value !== 'string') return;
  const trimmed = value.trim();

  if (!trimmed && fieldName === 'title_ar') {
    errors.push(`${file} :: ${fieldPath} — empty Arabic title`);
    return;
  }

  if (!trimmed) return;

  if (/\s{2,}/.test(value)) {
    warnings.push(`${file} :: ${fieldPath} — repeated whitespace`);
  }

  for (const pattern of MOJIBAKE_PATTERNS) {
    if (pattern.test(value)) {
      warnings.push(`${file} :: ${fieldPath} — possible mojibake/replacement character`);
    }
  }

  const shouldCheckLatin =
    fieldName === 'title_ar' ||
    fieldName === 'name_ar' ||
    fieldName === 'summary_ar' ||
    fieldName === 'short_title_ar' ||
    fieldName === 'corrected_event_title' ||
    fieldName === 'proposed_title_ar' ||
    (fieldName === 'evidence_note_ar' && isMostlyArabic(trimmed)) ||
    ((fieldName === 'reviewer_note' || fieldName === 'scholar_note') &&
      trimmed &&
      isMostlyArabic(trimmed));

  if (!shouldCheckLatin) return;

  if (ARABIC_THEN_LATIN.test(trimmed)) {
    errors.push(`${file} :: ${fieldPath} — Latin letter after Arabic (e.g. الخضr): "${trimmed}"`);
    return;
  }

  if (/الخضr/.test(trimmed)) {
    errors.push(`${file} :: ${fieldPath} — confirmed typo «الخضr» (Latin r); should be «الخضر»: "${trimmed}"`);
  }

  if (isMostlyArabic(trimmed) && HAS_LATIN.test(trimmed) && fieldName !== 'note_ar') {
    const latinWords = trimmed.match(/[a-zA-Z]+/g) || [];
    const allowedInArabic = new Set([
      'JSON',
      'SQL',
      'QA',
      'API',
      'ID',
      'event',
      'ayahs',
      'seed',
      'prototype',
      'Phase',
      'Sprint',
      'Batch',
      'Supabase',
      'approved',
      'pending',
      'precise',
      'evidence',
      'metadata',
      'main',
      'supporting',
      'promote',
      'relation',
      'type',
      'review',
      'status',
      'NOT',
    ]);
    const suspicious = latinWords.filter((w) => !allowedInArabic.has(w));
    if (suspicious.length && fieldName === 'title_ar') {
      warnings.push(
        `${file} :: ${fieldPath} — Latin inside Arabic title: ${suspicious.join(', ')}`
      );
    }
  }
}

function walk(value, file, path = '') {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, file, `${path}[${i}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const next = path ? `${path}.${key}` : key;
      if (ARABIC_FIELD_NAMES.has(key) || key.endsWith('_ar')) {
        if (typeof child === 'string') checkArabicString(child, key, file, next);
        else if (Array.isArray(child)) {
          child.forEach((item, i) => {
            if (typeof item === 'string') checkArabicString(item, key, file, `${next}[${i}]`);
          });
        }
      }
      walk(child, file, next);
    }
    return;
  }
}

function scanJsonFile(file, asError) {
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    walk(data, file.replace(`${root}/`, ''));
  } catch (err) {
    (asError ? errors : warnings).push(`${file} — invalid JSON: ${err.message}`);
  }
}

function scanMarkdownFile(file) {
  const rel = file.replace(`${root}/`, '');
  const content = readFileSync(file, 'utf8');
  if (content.includes('الخضr')) {
    warnings.push(`${rel} — documents typo pattern الخضr (verify not in data)`);
  }
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('|') && ARABIC_THEN_LATIN.test(line)) {
      warnings.push(`${rel}:${i + 1} — Arabic+Latin in table row`);
    }
  });
}

function listFiles(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) continue;
    if (extname(full) === ext) out.push(full);
  }
  return out;
}

for (const file of DATA_PATHS) {
  scanJsonFile(file, true);
}

for (const file of listFiles(EXAMPLE_GLOB_DIR, '.json')) {
  scanJsonFile(file, strict);
}

for (const file of listFiles(DOC_GLOB_DIR, '.md')) {
  scanMarkdownFile(file);
}

console.log('Arabic text hygiene scan');
console.log(' strict:', strict);
console.log(' data files:', DATA_PATHS.map((p) => p.replace(`${root}/`, '')).join(', '));
console.log(' examples:', listFiles(EXAMPLE_GLOB_DIR, '.json').length, 'json files');
console.log(' docs:', listFiles(DOC_GLOB_DIR, '.md').length, 'md files');

if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log(' ', w));
}

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.forEach((e) => console.log(' ', e));
  console.log('\nFAIL check_arabic_text_hygiene');
  process.exit(1);
}

console.log('\nPASS check_arabic_text_hygiene');
if (failOnWarn && warnings.length) {
  console.log('FAIL check_arabic_text_hygiene — warnings treated as errors');
  process.exit(1);
}
process.exit(0);
