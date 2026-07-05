import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const patchPath = process.argv[2] || join(root, 'examples/evidence_patch.sample.json');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;
const patch = JSON.parse(readFileSync(patchPath, 'utf8'));

const { validatePatchFile } = await import(
  pathToFileURL(join(root, 'src/features/admin/evidenceValidation.js')).href
);

const eventIds = new Set((seed.story_events || []).map((e) => e.id));
const sourceIds = new Set((seed.tafsir_sources || []).map((s) => s.id));
const surahMaxAyah = new Map(surahs.map((s) => [s.id, s.ayah_count]));

const result = validatePatchFile(patch.mappings || [], { eventIds, sourceIds, surahMaxAyah });

if (patch.meta?.status === 'example') {
  console.log('NOTE sample file status=example — not production content');
}

if (patch.meta?.status === 'proposed') {
  console.log('NOTE patch status=proposed — not production content; human review required');
}

if (result.valid) {
  console.log('PASS validate_evidence_patch', patchPath);
  console.log('mappings:', patch.mappings.length);
  process.exit(0);
}

console.log('FAIL validate_evidence_patch', patchPath);
result.errors.forEach((e) => console.log(' ', e));
process.exit(1);
