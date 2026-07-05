#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  buildApplyReport,
  generateApplySql,
  generateRollbackSql,
  validateBatchForApply,
} from './lib/applyContentChangeBatch.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const filePath = getArg('file');
const outputPath = getArg('output');
const dryRun = process.argv.includes('--dry-run');
const generateSql = process.argv.includes('--generate-sql') || !process.argv.includes('--report-only');
const generateRollback = process.argv.includes('--generate-rollback');
const strict = process.argv.includes('--strict');

if (!filePath) {
  console.error('Usage: node scripts/apply_content_change_batch.mjs --file <batch.json> [--dry-run] [--generate-sql] [--generate-rollback] [--output path.sql] [--strict]');
  process.exit(1);
}

const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;
const batch = JSON.parse(readFileSync(filePath, 'utf8'));

const ctx = {
  sourceIds: new Set((seed.tafsir_sources || []).map((s) => s.id)),
  eventIds: new Set((seed.story_events || []).map((e) => e.id)),
  surahMaxAyah: new Map(surahs.map((s) => [s.id, s.ayah_count])),
};

const validation = validateBatchForApply(batch, ctx, { strict });

if (!validation.valid) {
  console.error('FAIL apply_content_change_batch — validation failed');
  validation.errors.forEach((e) => console.error(' ', e));
  process.exit(1);
}

if (batch.status !== 'approved') {
  console.error('FAIL apply_content_change_batch — batch.status must be approved');
  process.exit(1);
}

const batchId = batch.id || batch.meta?.batch_id || 'unknown-batch';
const sqlResult = generateApplySql(batch, { dryRun, batchId });
const report = buildApplyReport(batch, validation, sqlResult);

console.log('PASS apply_content_change_batch validation');
console.log(report);

if (dryRun && !generateSql) {
  console.log('Dry run complete — no SQL files written.');
  process.exit(0);
}

if (generateSql) {
  const out =
    outputPath || join(root, 'supabase/generated', `apply_batch_${batchId.replace(/[^a-zA-Z0-9_-]/g, '_')}.sql`);
  mkdirSync(dirname(out), { recursive: true });
  if (!dryRun) {
    writeFileSync(out, sqlResult.sql, 'utf8');
    console.log('Wrote apply SQL:', out);
  } else {
    console.log('Dry run — SQL preview (not written):');
    console.log(sqlResult.sql.slice(0, 1200));
    if (sqlResult.sql.length > 1200) console.log('... [truncated preview]');
  }
}

if (generateRollback) {
  const rollback = generateRollbackSql(batch, { batchId });
  rollback.warnings.forEach((w) => console.warn('WARN', w));
  const rollbackOut =
    getArg('rollback-output') ||
    join(root, 'supabase/generated', `rollback_batch_${batchId.replace(/[^a-zA-Z0-9_-]/g, '_')}.sql`);
  mkdirSync(dirname(rollbackOut), { recursive: true });
  if (!dryRun) {
    writeFileSync(rollbackOut, rollback.sql, 'utf8');
    console.log('Wrote rollback SQL:', rollbackOut);
  } else {
    console.log('Dry run — rollback preview (not written)');
  }
}

process.exit(0);
