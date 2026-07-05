import { readFileSync, existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/seed_content.json'), 'utf8'));
const surahsPayload = JSON.parse(readFileSync(join(root, 'src/data/surahs.json'), 'utf8'));

const { configure, isFinalContent } = await import(pathToFileURL(join(root, 'src/lib/dataService.js')).href);
const { searchIndex } = await import(pathToFileURL(join(root, 'src/features/search/searchEngine.js')).href);
const { matchesAllTokens } = await import(pathToFileURL(join(root, 'src/lib/arabicNormalize.js')).href);
const { getEnvConfig } = await import(pathToFileURL(join(root, 'src/config/env.js')).href);
const { createRepository } = await import(
  pathToFileURL(join(root, 'src/data/repositories/repositoryFactory.js')).href
);
const { buildReviewQueue, summarizeReviewStats } = await import(
  pathToFileURL(join(root, 'src/features/admin/reviewQueue.js')).href
);

configure({ publicMode: true, dataMode: 'local' });

const nodes = seed.story_nodes || [];
const events = seed.story_events || [];
const themes = seed.themes || [];
const surahs = surahsPayload.surahs;

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

const unreviewedFinal = [...nodes, ...events, ...themes].filter(
  (x) => ['pending', 'needs_source'].includes(x.review_status) && isFinalContent(x)
);
if (unreviewedFinal.length) fail('pending not shown as final', unreviewedFinal.map((x) => x.id));
else pass('public mode excludes pending/needs_source from final content');

if (!matchesAllTokens('صبر', 'الصبر عند المكروه')) fail('arabic normalization', '');
else pass('arabic normalization');

const eventFilter = searchIndex({ nodes, events, themes, surahs, query: '', filters: { type: 'event' }, publicMode: true });
if (!eventFilter.every((r) => r.resultType === 'event')) fail('search event filter', '');
else pass('search event filter');

const pendingFilter = searchIndex({ nodes, events, themes, surahs, query: '', filters: { reviewStatus: 'pending' }, publicMode: true });
if (!pendingFilter.every((r) => r.review_status === 'pending')) fail('search review filter', '');
else pass('search review filter');

for (const ev of events) {
  if (ev.evidence_status === 'precise_evidence') {
    const ay = (seed.event_ayahs || []).filter((a) => a.event_id === ev.id);
    if (!ay.length) fail(`precise event ${ev.id} missing ayah`, 'missing');
  }
  if (ev.evidence_status === 'needs_precise_mapping') {
    const ay = (seed.event_ayahs || []).filter((a) => a.event_id === ev.id);
    if (ay.length) fail(`needs_precise_mapping event ${ev.id} has ayah`, 'forbidden fallback');
  }
}
pass('evidence ayah rules for events');

const finalEvents = events.filter((e) => isFinalContent(e));
const badFinalEvidence = finalEvents.filter(
  (e) => e.evidence_status !== 'precise_evidence' || e.evidence_confidence === 'needs_review'
);
if (badFinalEvidence.length) fail('final events require precise evidence', badFinalEvidence.map((e) => e.id));
else pass('final events require precise_evidence');

if (surahs.length !== 114) fail('surah count', surahs.length);
else pass('114 surahs in data');

const env = getEnvConfig();
if (env.dataMode !== 'local') fail('env default data mode', env.dataMode);
else pass('env defaults to local data mode');

// Mock fetch for repository factory tests in Node (404 when optional files missing)
globalThis.fetch = async (url) => {
  const rel = String(url).replace(/^\.\//, '');
  const file = join(root, 'src', rel);
  if (!existsSync(file)) {
    return { ok: false, status: 404, async json() { throw new Error(`missing ${rel}`); } };
  }
  return {
    ok: true,
    async json() {
      return JSON.parse(readFileSync(file, 'utf8'));
    },
  };
};

try {
  const localRepo = await createRepository({ dataMode: 'local' });
  const localNodes = await localRepo.getNodes();
  if (!localNodes.length) fail('local repository load', 'empty nodes');
  else pass('local repository loads seed JSON');

  const supaRepo = await createRepository({
    dataMode: 'supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
  });
  const supaNodes = await supaRepo.getNodes();
  if (!supaNodes.length) fail('supabase fallback repository', 'empty nodes');
  else pass('missing Supabase env falls back to local demo');
} catch (err) {
  fail('repository factory', err.message);
}

const queue = buildReviewQueue({
  nodes,
  events,
  themes,
  eventAyahs: seed.event_ayahs || [],
  tafsirSources: seed.tafsir_sources || [],
});
const stats = summarizeReviewStats(queue);
if (!queue.length || stats.total !== queue.length) fail('admin review queue build', '');
else pass('admin review queue builds records');
if (stats.pending + stats.needs_source < 1) fail('admin pending records exist', '');
else pass('admin queue includes pending/needs_source records');

const { validateQuranText } = await import(
  pathToFileURL(join(root, 'scripts/lib/quranTextValidation.mjs')).href
);
const sampleQuran = JSON.parse(
  readFileSync(join(root, 'src/data/quran/quran_text.sample.json'), 'utf8')
);
const sampleValidation = validateQuranText(sampleQuran, {
  fileLabel: 'quran_text.sample.json',
});
if (!sampleValidation.valid) fail('validate_quran_text sample', sampleValidation.errors.join('; '));
else pass('validate_quran_text passes on sample file');

try {
  const localRepo = await createRepository({ dataMode: 'local' });
  const ayah = await localRepo.getAyah(12, 4);
  if (ayah.available) fail('getAyah without import should not be available', '');
  else if (!ayah.placeholder_ar?.includes('غير مستورد')) fail('getAyah placeholder text', ayah.placeholder_ar);
  else pass('getAyah returns safe placeholder without Quran import');

  const range = await localRepo.getAyahRange(12, 4, 6);
  if (range.some((r) => r.available)) fail('getAyahRange without import', 'unexpected available');
  else pass('getAyahRange safe without Quran import');

  const imported = await localRepo.isQuranTextImported();
  if (imported) fail('isQuranTextImported without index', 'should be false');
  else pass('isQuranTextImported false without full import');

  const finalWithoutQuran = events.filter((e) => isFinalContent(e));
  if (finalWithoutQuran.length < 1) fail('public final gate without quran text', 'no final events');
  else pass('public final gate works without full Quran text');
} catch (err) {
  fail('quran repository methods', err.message);
}

process.exit(failed ? 1 : 0);
