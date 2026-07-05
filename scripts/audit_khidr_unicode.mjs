import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { KHIDR_LATIN_TYPO } from './lib/scholarDecisionConstants.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));

const EXPECTED_KHIDR = 'الخضر';
const EXPECTED_CODEPOINTS = [
  ['ا', 0x0627],
  ['ل', 0x0644],
  ['خ', 0x062e],
  ['ض', 0x0636],
  ['ر', 0x0631],
];

function formatCodepoints(s) {
  return [...s]
    .map((ch) => `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}

function auditValue(label, value) {
  console.log(`\n## ${label}`);
  console.log('value:', JSON.stringify(value));
  console.log('codepoints:', formatCodepoints(value));
  const latinLetters = [...value].filter((ch) => /[a-zA-Z]/.test(ch));
  if (latinLetters.length) {
    console.log(
      'LATIN FOUND:',
      latinLetters.map((ch) => `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(', ')
    );
  } else {
    console.log('latin letters: none');
  }
  if (KHIDR_LATIN_TYPO.test(value)) {
    console.log('FAIL: contains الخض + Latin letter typo pattern');
  }
}

console.log('# Unicode audit — Al-Khidr (الخضر) titles');
console.log('\nExpected correct Arabic:', EXPECTED_KHIDR);
console.log(
  'Expected sequence:',
  EXPECTED_CODEPOINTS.map(([ch, cp]) => `${ch} U+${cp.toString(16).toUpperCase().padStart(4, '0')}`).join(' ')
);
console.log('Incorrect Latin r would be: r U+0072');

const musa09 = seed.story_events.find((e) => e.id === 'musa_09__');
const khidrPerson = seed.story_nodes.find((n) => n.name_ar?.includes('الخض'));

if (musa09) {
  auditValue('musa_09__.title_ar', musa09.title_ar);
  auditValue('musa_09__.summary_ar (contains الخضر)', musa09.summary_ar);
}
if (khidrPerson) {
  auditValue(`story_nodes.${khidrPerson.id}.name_ar`, khidrPerson.name_ar);
}

let issues = 0;
for (const e of seed.story_events) {
  if (e.title_ar && /[a-zA-Z]/.test(e.title_ar)) {
    console.log(`\nFAIL story_events.${e.id}.title_ar contains Latin: ${JSON.stringify(e.title_ar)}`);
    issues++;
  }
  if (e.title_ar && KHIDR_LATIN_TYPO.test(e.title_ar)) {
    console.log(`\nFAIL story_events.${e.id}.title_ar has الخضr typo`);
    issues++;
  }
}
for (const n of seed.story_nodes) {
  if (n.name_ar && /[a-zA-Z]/.test(n.name_ar)) {
    console.log(`\nFAIL story_nodes.${n.id}.name_ar contains Latin: ${JSON.stringify(n.name_ar)}`);
    issues++;
  }
}

if (musa09?.title_ar !== EXPECTED_KHIDR) {
  console.log(`\nFAIL musa_09__.title_ar must equal ${JSON.stringify(EXPECTED_KHIDR)}`);
  issues++;
} else {
  console.log(`\nPASS musa_09__.title_ar === ${JSON.stringify(EXPECTED_KHIDR)}`);
}

if (issues) {
  console.log(`\nFAIL audit_khidr_unicode (${issues} issue(s))`);
  process.exit(1);
}

console.log('\nPASS audit_khidr_unicode — seed uses Arabic ر (U+0631), not Latin r (U+0072)');
process.exit(0);
