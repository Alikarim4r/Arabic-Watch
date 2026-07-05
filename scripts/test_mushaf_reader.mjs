#!/usr/bin/env node
/**
 * Node tests for Mushaf Reader modules.
 */
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const {
  loadMushafSettings,
  saveMushafSettings,
  DEFAULT_MUSHAF_SETTINGS,
  MUSHAF_SETTINGS_KEY,
} = await import(pathToFileURL(`${root}/src/features/mushaf/mushafSettings.js`).href);

const {
  getLastReadPosition,
  saveLastReadPosition,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getBookmarks,
  MUSHAF_LAST_READ_KEY,
  MUSHAF_BOOKMARKS_KEY,
} = await import(pathToFileURL(`${root}/src/features/mushaf/mushafBookmarks.js`).href);

const {
  formatAyahReferenceAr,
  getVisibleAyahRange,
  getNextSurahId,
  getPrevSurahId,
  shouldShowBismillah,
  computeSurahProgress,
} = await import(pathToFileURL(`${root}/src/features/mushaf/mushafNavigation.js`).href);

const { QURAN_TEXT_MISSING_AR } = await import(pathToFileURL(`${root}/src/lib/quranText.js`).href);

const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => {
    delete store[k];
  },
};

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.log('FAIL', msg);
    failed += 1;
  } else {
    console.log('PASS', msg);
  }
}

assert(loadMushafSettings().fontSize === DEFAULT_MUSHAF_SETTINGS.fontSize, 'default mushaf settings');
const saved = saveMushafSettings({ fontSize: 30 });
assert(saved.fontSize === 30, 'font size setting saves');
assert(JSON.parse(store[MUSHAF_SETTINGS_KEY]).fontSize === 30, 'font size in localStorage');

saveLastReadPosition({ surahId: 2, ayahFrom: 31, label: 'test' });
const last = getLastReadPosition();
assert(last?.surahId === 2 && last?.ayahFrom === 31, 'last read position saves');

addBookmark({ surahId: 12, ayahFrom: 4, ayahTo: 6, label: 'يوسف' });
assert(isBookmarked({ surahId: 12, ayahFrom: 4, ayahTo: 6 }), 'bookmark add');
removeBookmark({ surahId: 12, ayahFrom: 4, ayahTo: 6 });
assert(!isBookmarked({ surahId: 12, ayahFrom: 4, ayahTo: 6 }), 'bookmark remove');
assert(getBookmarks().length === 0, 'bookmarks empty after remove');

assert(
  formatAyahReferenceAr('البقرة', 31) === 'سورة البقرة — الآية 31',
  'Arabic ayah reference format'
);
assert(formatAyahReferenceAr('البقرة', 30, 37).includes('30'), 'range reference format');

const pageRange = getVisibleAyahRange(2, 286, 31, 'page');
assert(pageRange.ayahFrom === 31 && pageRange.ayahTo === 40, 'page mode chunk range');
const listRange = getVisibleAyahRange(2, 286, 31, 'list');
assert(listRange.ayahFrom === 1 && listRange.ayahTo === 286, 'list mode full surah');

assert(getNextSurahId(1) === 2 && getPrevSurahId(2) === 1, 'surah prev/next');
assert(shouldShowBismillah(2) === true && shouldShowBismillah(9) === false, 'bismillah rules');
assert(computeSurahProgress(143, 286) === 50, 'surah progress percent');

assert(QURAN_TEXT_MISSING_AR.includes('غير مستورد'), 'missing text placeholder Arabic');

const indexHtml = await import('fs').then((fs) =>
  fs.readFileSync(join(root, 'src/index.html'), 'utf8')
);
assert(indexHtml.includes('id="mushaf-mount"'), 'index.html mushaf mount');
assert(indexHtml.includes('mushaf.css'), 'index.html mushaf css');

const homeChrome = await import('fs').then((fs) =>
  fs.readFileSync(join(root, 'src/components/homeChrome.js'), 'utf8')
);
assert(homeChrome.includes('href="#mushaf"') && homeChrome.includes('المصحف'), 'nav link المصحف');

const ayahDisplay = await import('fs').then((fs) =>
  fs.readFileSync(join(root, 'src/lib/ayahDisplay.js'), 'utf8')
);
assert(ayahDisplay.includes('فتح في المصحف'), 'ayahDisplay mushaf button');

process.exit(failed ? 1 : 0);
