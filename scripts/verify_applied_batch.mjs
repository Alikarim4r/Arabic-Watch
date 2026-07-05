#!/usr/bin/env node
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ALLOWED_TABLES, ALLOWED_UPDATE_COLUMNS } from './lib/applyContentChangeBatch.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const batchPath = getArg('file');
const sqlPath = getArg('sql');

if (!batchPath || !sqlPath) {
  console.error('Usage: node scripts/verify_applied_batch.mjs --file <batch.json> --sql <generated.sql>');
  process.exit(1);
}

const batch = JSON.parse(readFileSync(batchPath, 'utf8'));
const sql = readFileSync(sqlPath, 'utf8');
const batchId = batch.id || batch.meta?.batch_id || 'unknown-batch';

const errors = [];
const warnings = [];

if (!/\bBEGIN\s*;/i.test(sql)) errors.push('SQL must contain BEGIN; transaction block');
if (!/\bCOMMIT\s*;/i.test(sql)) errors.push('SQL must contain COMMIT; transaction block');

if (!sql.includes(String(batchId))) {
  warnings.push(`SQL comments do not reference batch id ${batchId}`);
}

const dangerous = [
  { pattern: /\bDROP\b/i, label: 'DROP' },
  { pattern: /\bTRUNCATE\b/i, label: 'TRUNCATE' },
  { pattern: /\bDELETE\s+FROM\b/i, label: 'DELETE', allowInRollback: sqlPath.includes('rollback') },
];

for (const d of dangerous) {
  if (d.allowInRollback) continue;
  if (d.pattern.test(sql)) errors.push(`Dangerous statement not allowed: ${d.label}`);
}

if (/text_uthmani/i.test(sql)) {
  errors.push('SQL must not touch ayahs.text_uthmani or Quran text fields');
}

if (/UPDATE\s+public\.ayahs/i.test(sql) || /INSERT\s+INTO\s+public\.ayahs/i.test(sql)) {
  errors.push('SQL must not modify ayahs table in content batch apply');
}

const updateMatches = [...sql.matchAll(/UPDATE\s+public\.(\w+)\s+SET\s+([\s\S]*?);/gi)];
for (const match of updateMatches) {
  const table = match[1];
  let setClause = match[2];
  const whereIdx = setClause.search(/\bWHERE\b/i);
  if (whereIdx !== -1) setClause = setClause.slice(0, whereIdx);
  if (!ALLOWED_TABLES.has(table)) {
    errors.push(`UPDATE on disallowed table: ${table}`);
  }
  const columns = [...setClause.matchAll(/(\w+)\s*=/g)].map((m) => m[1]);
  for (const col of columns) {
    if (!ALLOWED_UPDATE_COLUMNS.has(col)) {
      errors.push(`UPDATE ${table} uses disallowed column: ${col}`);
    }
  }
}

if (/proposed_review_status\s*=\s*'approved'/i.test(sql) || /review_status\s*=\s*'approved'/i.test(sql)) {
  if (/evidence_status\s*=\s*'needs_precise_mapping'/i.test(sql)) {
    errors.push('SQL must not approve content without precise_evidence');
  }
  if (/evidence_confidence\s*=\s*'needs_review'/i.test(sql)) {
    errors.push('SQL must not approve content with evidence_confidence=needs_review');
  }
}

if (errors.length) {
  console.log('FAIL verify_applied_batch', sqlPath);
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}

console.log('PASS verify_applied_batch', sqlPath);
if (warnings.length) warnings.forEach((w) => console.warn('WARN', w));
process.exit(0);
