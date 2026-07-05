import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));

const { configure, isFinalContent } = await import(pathToFileURL(join(root, 'src/lib/dataService.js')).href);
const { searchIndex } = await import(pathToFileURL(join(root, 'src/features/search/searchEngine.js')).href);
const { matchesAllTokens } = await import(pathToFileURL(join(root, 'src/lib/arabicNormalize.js')).href);

configure({ publicMode: true });

const nodes = seed.story_nodes || [];
const events = seed.story_events || [];
const themes = seed.themes || [];
const surahs = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8')).surahs;

let failed = 0;
const pass = (name) => console.log('PASS', name);
const fail = (name, detail) => {
  console.log('FAIL', name, detail);
  failed++;
};

const badFinal = [...nodes, ...events].filter((x) => isFinalContent(x) && x.review_status !== 'approved');
if (badFinal.length) fail('isFinalContent approved check', badFinal.map((x) => x.id));
else pass('isFinalContent requires approved review_status');

const noneFinal = [...nodes, ...events].filter((x) => isFinalContent(x) && x.source_status === 'none');
if (noneFinal.length) fail('isFinalContent source none', noneFinal.map((x) => x.id));
else pass('isFinalContent rejects source_status none');

if (!matchesAllTokens('صبر', 'الصبر عند المكروه')) fail('arabic normalization', '');
else pass('arabic normalization');

const eventFilter = searchIndex({ nodes, events, themes, surahs, query: '', filters: { type: 'event' }, publicMode: true });
if (!eventFilter.every((r) => r.resultType === 'event')) fail('search event filter', '');
else pass('search event filter');

const pendingFilter = searchIndex({ nodes, events, themes, surahs, query: '', filters: { reviewStatus: 'pending' }, publicMode: true });
if (!pendingFilter.every((r) => r.review_status === 'pending')) fail('search review filter', '');
else pass('search review filter');

for (const ev of events) {
  const ay = (seed.event_ayahs || []).filter((a) => a.event_id === ev.id);
  if (!ay.length) fail(`event ${ev.id} has ayah`, 'missing');
}
pass('all events have ayah links');

if (surahs.length !== 114) fail('surah count', surahs.length);
else pass('114 surahs in data');

process.exit(failed ? 1 : 0);
