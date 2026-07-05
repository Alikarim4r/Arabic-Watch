import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { validateContentChangeBatch } from './lib/contentChangeBatchValidation.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const batchPath = process.argv[2] || join(root, 'examples/content_change_batch.sample.json');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;

let batch;
try {
  batch = JSON.parse(readFileSync(batchPath, 'utf8'));
} catch (err) {
  console.log('FAIL validate_content_change_batch', batchPath);
  console.log(' ', err.message);
  process.exit(1);
}

const ctx = {
  sourceIds: new Set((seed.tafsir_sources || []).map((s) => s.id)),
  eventIds: new Set((seed.story_events || []).map((e) => e.id)),
  surahMaxAyah: new Map(surahs.map((s) => [s.id, s.ayah_count])),
};

const result = validateContentChangeBatch(batch, ctx);

if (batch.meta?.status === 'sample') {
  console.log('NOTE sample batch status=sample — not production content');
}

result.warnings.forEach((w) => console.log('WARN', w));

if (result.valid) {
  console.log('PASS validate_content_change_batch', batchPath);
  console.log('items:', result.itemCount);
  process.exit(0);
}

console.log('FAIL validate_content_change_batch', batchPath);
result.errors.forEach((e) => console.log(' ', e));
process.exit(1);
