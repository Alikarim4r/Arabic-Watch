import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { validateQuranText } from './lib/quranTextValidation.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const inputPath = args.find((a) => !a.startsWith('--'));

if (!inputPath) {
  console.error('Usage: node scripts/import_quran_text.mjs <path-to-quran.json> [--force]');
  process.exit(1);
}

const indexPath = join(root, 'src/data/quran/quran_text.index.json');
const fullImportPath = join(root, 'src/data/quran/quran_text.full.json');

let data;
try {
  data = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (err) {
  console.error('FAIL import_quran_text — cannot read input file');
  console.error(' ', err.message);
  process.exit(1);
}

const isSample = data.meta?.status === 'sample_only_not_full_quran';
const validation = validateQuranText(data, {
  fileLabel: inputPath,
  requireFullQuran: !isSample,
});

if (!validation.valid) {
  console.error('FAIL import_quran_text — validation failed');
  validation.errors.forEach((e) => console.error(' ', e));
  process.exit(1);
}

if (isSample) {
  console.error('FAIL import_quran_text — sample files cannot be imported as production Quran text');
  console.error(' Provide a licensed full Quran JSON file (6236 ayahs) without sample status.');
  process.exit(1);
}

if (existsSync(fullImportPath) && !force) {
  console.error('FAIL import_quran_text — full Quran file already exists');
  console.error(` ${fullImportPath}`);
  console.error(' Pass --force to overwrite.');
  process.exit(1);
}

const byKey = {};
const surahIndex = {};

for (const ayah of data.ayahs) {
  const key = ayah.ayah_key;
  byKey[key] = {
    surah_id: ayah.surah_id,
    ayah_number: ayah.ayah_number,
    ayah_key: ayah.ayah_key,
    text_uthmani: ayah.text_uthmani,
    text_simple: ayah.text_simple || '',
    juz: ayah.juz,
    page: ayah.page,
  };
  const sid = String(ayah.surah_id);
  if (!surahIndex[sid]) surahIndex[sid] = [];
  surahIndex[sid].push(key);
}

for (const keys of Object.values(surahIndex)) {
  keys.sort((a, b) => {
    const [, aNum] = a.split(':').map(Number);
    const [, bNum] = b.split(':').map(Number);
    return aNum - bNum;
  });
}

const importedAt = new Date().toISOString();
const indexPayload = {
  meta: {
    ...data.meta,
    imported_at: importedAt,
  },
  imported_at: importedAt,
  ayah_count: data.ayahs.length,
  is_full_quran: data.ayahs.length === 6236,
  by_key: byKey,
  surah_index: surahIndex,
};

writeFileSync(fullImportPath, JSON.stringify(data, null, 2), 'utf8');
writeFileSync(indexPath, JSON.stringify(indexPayload, null, 2), 'utf8');

console.log('PASS import_quran_text');
console.log(' source:', inputPath);
console.log(' index :', indexPath);
console.log(' full  :', fullImportPath);
console.log(' ayahs :', data.ayahs.length);
console.log(' license:', data.meta.license);
console.log(' text_uthmani was copied verbatim — no normalization applied.');
