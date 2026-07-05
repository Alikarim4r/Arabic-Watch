import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { validateQuranText } from './lib/quranTextValidation.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2] || join(root, 'src/data/quran/quran_text.sample.json');

let data;
try {
  data = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (err) {
  console.log('FAIL validate_quran_text', inputPath);
  console.log(' ', err.message);
  process.exit(1);
}

const result = validateQuranText(data, { fileLabel: inputPath });

if (result.isSample) {
  console.log('NOTE sample file status=sample_only_not_full_quran — not a full Quran import');
}

result.warnings.forEach((w) => console.log('WARN', w));

if (result.valid) {
  console.log('PASS validate_quran_text', inputPath);
  console.log('ayahs:', result.ayahCount);
  process.exit(0);
}

console.log('FAIL validate_quran_text', inputPath);
result.errors.forEach((e) => console.log(' ', e));
process.exit(1);
