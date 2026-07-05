import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import {
  ARABIC_FIELD_NAMES,
  ARABIC_THEN_LATIN,
  HAS_LATIN,
  KHIDR_LATIN_TYPO,
  MOJIBAKE_PATTERNS,
  MOSTLY_ARABIC_ZERO_LATIN_FIELDS,
  ZERO_LATIN_ARABIC_FIELDS,
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
  const letters = text.replace(/[\s\d\p{P}]/gu, '');
  if (!letters.length) return false;
  const arabic = (letters.match(/[\u0600-\u06FF]/g) || []).length;
  return arabic / letters.length >= 0.7;
}

function latinCodepoints(value) {
  return [...value]
    .filter((ch) => /[a-zA-Z]/.test(ch))
    .map((ch) => `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

function checkArabicString(value, fieldName, file, fieldPath, isDataFile) {
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

  const isKnownArabicField =
    ZERO_LATIN_ARABIC_FIELDS.has(fieldName) ||
    MOSTLY_ARABIC_ZERO_LATIN_FIELDS.has(fieldName) ||
    ARABIC_FIELD_NAMES.has(fieldName) ||
    fieldName.endsWith('_ar');

  if (!isKnownArabicField) return;

  // Tier 1: title/name fields — zero Latin anywhere (catches الخضr in title_ar)
  if (ZERO_LATIN_ARABIC_FIELDS.has(fieldName) && HAS_LATIN.test(trimmed)) {
    errors.push(
      `${file} :: ${fieldPath} — Latin letter in Arabic field (A–Z/a–z forbidden): "${trimmed}" [${latinCodepoints(trimmed).join(', ')}]`
    );
    return;
  }

  // Explicit الخض + Latin typo anywhere in scanned Arabic fields
  if (KHIDR_LATIN_TYPO.test(trimmed)) {
    errors.push(
      `${file} :: ${fieldPath} — typo «الخض» + Latin letter (use Arabic ر U+0631): "${trimmed}"`
    );
    return;
  }

  // Latin immediately after Arabic letter (embedded typo e.g. الخضr)
  if (!ZERO_LATIN_ARABIC_FIELDS.has(fieldName) && ARABIC_THEN_LATIN.test(trimmed)) {
    errors.push(
      `${file} :: ${fieldPath} — Latin letter directly after Arabic (e.g. الخضr): "${trimmed}"`
    );
    return;
  }

  // Tier 2: mostly-Arabic note fields — zero Latin in seed/precise data only
  if (
    isDataFile &&
    MOSTLY_ARABIC_ZERO_LATIN_FIELDS.has(fieldName) &&
    isMostlyArabic(trimmed) &&
    HAS_LATIN.test(trimmed)
  ) {
    errors.push(
      `${file} :: ${fieldPath} — Latin in mostly-Arabic ${fieldName}: "${trimmed}" [${latinCodepoints(trimmed).join(', ')}]`
    );
  }
}

function walk(value, file, isDataFile, path = '') {
  if (value == null) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, file, isDataFile, `${path}[${i}]`));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const next = path ? `${path}.${key}` : key;
      if (ARABIC_FIELD_NAMES.has(key) || key.endsWith('_ar')) {
        if (typeof child === 'string') checkArabicString(child, key, file, next, isDataFile);
        else if (Array.isArray(child)) {
          child.forEach((item, i) => {
            if (typeof item === 'string') checkArabicString(item, key, file, `${next}[${i}]`, isDataFile);
          });
        }
      }
      walk(child, file, isDataFile, next);
    }
  }
}

function scanJsonFile(file, isDataFile) {
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    walk(data, file.replace(`${root}/`, ''), isDataFile);
  } catch (err) {
    errors.push(`${file} — invalid JSON: ${err.message}`);
  }
}

function scanMarkdownFile(file) {
  const rel = file.replace(`${root}/`, '');
  const content = readFileSync(file, 'utf8');
  if (KHIDR_LATIN_TYPO.test(content)) {
    warnings.push(`${rel} — documents literal «الخضr» typo pattern (verify not in JSON data)`);
  }
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
  scanJsonFile(file, false);
}

for (const file of listFiles(DOC_GLOB_DIR, '.md')) {
  scanMarkdownFile(file);
}

console.log('Arabic text hygiene scan');
console.log(' strict:', strict);
console.log(' zero-Latin fields:', [...ZERO_LATIN_ARABIC_FIELDS].join(', '));
console.log(' data files:', DATA_PATHS.map((p) => p.replace(`${root}/`, '')).join(', '));

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
