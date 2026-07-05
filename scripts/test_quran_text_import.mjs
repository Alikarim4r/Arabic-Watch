#!/usr/bin/env node
/**
 * QA tests for Quran text import pipeline (imported or placeholder mode).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const { validateQuranText } = await import(
  pathToFileURL(join(root, 'scripts/lib/quranTextValidation.mjs')).href
);
const { createQuranTextAccessors } = await import(
  pathToFileURL(join(root, 'src/lib/quranText.js')).href
);
const { configure, isFinalContent } = await import(
  pathToFileURL(join(root, 'src/lib/dataService.js')).href
);

configure({ publicMode: true, dataMode: 'local' });

const indexPath = join(root, 'src/data/quran/quran_text.index.json');
const samplePath = join(root, 'src/data/quran/quran_text.sample.json');
const importScriptPath = join(root, 'scripts/import_quran_text.mjs');
const licensedPaths = [
  join(root, 'imports/quran/quran_text.json'),
  join(root, 'imports/quran/hafs_uthmani.json'),
  join(root, 'src/data/quran/quran_text.full.json'),
];

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.log('FAIL', msg);
    failed += 1;
  } else {
    console.log('PASS', msg);
  }
}

const sample = JSON.parse(readFileSync(samplePath, 'utf8'));
const sampleValidation = validateQuranText(sample, { fileLabel: 'quran_text.sample.json' });
assert(sampleValidation.valid, 'validate_quran_text passes on sample file');

const importSrc = readFileSync(importScriptPath, 'utf8');
assert(
  importSrc.includes('text_uthmani: ayah.text_uthmani') && !/\.normalize\s*\(/.test(importSrc),
  'import script copies text_uthmani verbatim (no normalize)'
);

const licensedFound = licensedPaths.filter((p) => existsSync(p));
if (licensedFound.length === 0) {
  assert(true, 'no licensed source file in workspace (expected for Phase 25 stop)');
  const missingReport = join(root, 'docs/quran_text_missing_source_report.md');
  assert(existsSync(missingReport), 'quran_text_missing_source_report.md exists');
  const report = readFileSync(missingReport, 'utf8');
  assert(report.includes('No import performed'), 'missing source report documents no import');
} else {
  assert(false, `licensed file present but Phase 25 should import via verify script: ${licensedFound[0]}`);
}

const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const quranImported = Boolean(index.is_full_quran && index.ayah_count === 6236);

if (quranImported) {
  const verify = spawnSync(process.execPath, ['scripts/verify_quran_text_import.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert(verify.status === 0, `verify_quran_text_import: ${verify.stdout}${verify.stderr}`);

  const access = createQuranTextAccessors(index);
  assert(access.isFullQuranImported(), 'isFullQuranImported true after import');

  for (const [sid, an] of [
    [1, 1],
    [2, 255],
    [18, 60],
    [36, 1],
    [114, 6],
  ]) {
    const ayah = access.getAyah(sid, an);
    assert(ayah.available && ayah.text_uthmani, `sample getAyah ${sid}:${an} available`);
  }
} else {
  const access = createQuranTextAccessors(index);
  assert(!access.isFullQuranImported(), 'isFullQuranImported false without import');

  const ayah = access.getAyah(2, 255);
  assert(!ayah.available && ayah.placeholder_ar?.includes('غير مستورد'), 'placeholder mode getAyah safe');
  assert(access.isFullQuranImported() === quranImported, 'isQuranTextImported matches index state');
}

const events = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8')).story_events || [];
const finalEvents = events.filter((e) => isFinalContent(e));
assert(finalEvents.length === 6, 'public final gate remains strict (6 events)');
const pendingFinal = events.filter((e) => e.review_status !== 'approved' && isFinalContent(e));
assert(pendingFinal.length === 0, 'no pending events pass final gate');

const disclaimer = readFileSync(join(root, 'src/components/disclaimer.js'), 'utf8');
assert(
  disclaimer.includes('هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة'),
  'Arabic disclaimer preserved'
);

const ayahDisplay = readFileSync(join(root, 'src/lib/ayahDisplay.js'), 'utf8');
assert(ayahDisplay.includes('فتح في المصحف'), 'Story/Study mushaf link helper exists');

process.exit(failed ? 1 : 0);
