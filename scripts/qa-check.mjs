import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

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

const { getEffectiveDataMode } = await import(
  pathToFileURL(join(root, 'src/config/env.js')).href
);
const { invalidateAuthCache, getAuthState, canAccessAdminReview } = await import(
  pathToFileURL(join(root, 'src/lib/authService.js')).href
);

invalidateAuthCache();
const envCfg = getEnvConfig();
if (envCfg.effectiveDataMode !== 'local') fail('default effective data mode', envCfg.effectiveDataMode);
else pass('app loads in local mode without env');

if (getEffectiveDataMode({ dataMode: 'supabase' }) !== 'local') {
  fail('supabase env missing fallback', 'expected local');
} else pass('repository fallback when Supabase env missing');

try {
  invalidateAuthCache();
  const auth = await getAuthState();
  if (!auth.isMock || auth.role !== 'viewer') fail('local auth defaults to viewer mock', auth.role);
  else pass('local auth mock viewer by default');

  invalidateAuthCache();
  const canAccess = await canAccessAdminReview();
  if (!canAccess) fail('local admin review demo access', '');
  else pass('local admin review accessible as demo');
} catch (err) {
  fail('auth service local mode', err.message);
}

try {
  const supaAttempt = await createRepository({
    dataMode: 'supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
  });
  const provider = await supaAttempt.getProvider();
  if (provider !== 'local') pass('supabase repository does not crash when env missing');
  else pass('supabase repository does not crash when env missing');

  const history = await supaAttempt.getReviewActionHistory?.('event', 'test');
  if (!Array.isArray(history)) fail('local review history method', '');
  else pass('review action session history API available locally');

  const patchResult = await supaAttempt.submitEvidencePatch?.({ meta: { status: 'proposed' }, mappings: [] });
  if (!patchResult?.ok) fail('local evidence patch session submit', '');
  else pass('evidence patch validation/session path still works locally');
} catch (err) {
  fail('supabase missing env handling', err.message);
}

try {
  const localRepo = await createRepository({ dataMode: 'local' });
  const batches = await localRepo.getContentChangeBatches?.();
  if (!Array.isArray(batches)) fail('getContentChangeBatches local', '');
  else pass('content change batches API available locally');

  const submitBatch = await localRepo.submitContentChangeBatch?.({
    batch_type: 'evidence_promotion',
    status: 'draft',
    summary: 'qa test batch',
    payload: { items: [{ change_type: 'review_action', record_type: 'event', event_id: 'musa_03__', proposed_review_status: 'pending', promote_as_final: false }] },
  });
  if (!submitBatch?.ok) fail('submitContentChangeBatch local session', '');
  else pass('content batch session submit works locally');

  const pendingFinal = events.filter((e) => e.review_status !== 'approved' && isFinalContent(e));
  if (pendingFinal.length) fail('pending events must not pass final gate', pendingFinal.map((e) => e.id));
  else pass('no pending/needs_precise_mapping appears as verified final');
} catch (err) {
  fail('content batch local tests', err.message);
}

function runNodeScript(scriptArgs, expectOk = true) {
  const result = spawnSync(process.execPath, scriptArgs, {
    cwd: root,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const ok = result.status === 0;
  const met = expectOk ? ok : !ok;
  if (!met) {
    fail(
      `script ${scriptArgs[1]}`,
      expectOk ? output || `exit ${result.status}` : `expected failure but exited 0: ${output}`
    );
  }
  return met;
}

const draftBatch = join(root, 'examples/content_change_batch.sample.json');
const approvedBatch = join(root, 'examples/content_change_batch.approved.sample.json');
const sampleSql = join(root, 'examples/apply_batch.sample.sql');

if (runNodeScript(['scripts/apply_content_change_batch.mjs', '--file', draftBatch], false)) {
  pass('apply_content_change_batch rejects non-approved batch');
} else fail('apply rejects non-approved batch', 'draft batch should fail');

if (
  runNodeScript([
    'scripts/apply_content_change_batch.mjs',
    '--file',
    approvedBatch,
    '--dry-run',
  ])
) {
  pass('apply_content_change_batch accepts approved sample in dry-run');
} else fail('apply dry-run approved sample', '');

if (
  runNodeScript([
    'scripts/apply_content_change_batch.mjs',
    '--file',
    approvedBatch,
    '--generate-sql',
    '--output',
    sampleSql,
  ])
) {
  pass('apply_content_change_batch generates SQL');
} else fail('apply generate SQL', '');

if (
  runNodeScript([
    'scripts/verify_applied_batch.mjs',
    '--file',
    approvedBatch,
    '--sql',
    sampleSql,
  ])
) {
  pass('verify_applied_batch passes on generated safe SQL');
} else fail('verify safe SQL', '');

const badSqlPath = join(root, 'supabase/generated/qa_bad_uthmani.sql');
writeFileSync(
  badSqlPath,
  `-- batch id: example-approved-batch-001
BEGIN;
UPDATE public.ayahs SET text_uthmani = 'bad' WHERE id = 1;
COMMIT;
`,
  'utf8'
);
if (runNodeScript(['scripts/verify_applied_batch.mjs', '--file', approvedBatch, '--sql', badSqlPath], false)) {
  pass('verify_applied_batch rejects SQL touching ayahs.text_uthmani');
} else fail('verify should reject text_uthmani SQL', '');
try {
  unlinkSync(badSqlPath);
} catch {
  /* ignore */
}

if (
  runNodeScript([
    'scripts/validate_content_change_batch.mjs',
    'examples/content_change_batch.sample.json',
  ])
) {
  pass('validate_content_change_batch still passes on draft sample');
} else fail('validate_content_change_batch', '');

try {
  const { sortReviewQueueByPriority, buildFilterChips, loadSavedReviewFilters, saveReviewFilters } = await import(
    pathToFileURL(join(root, 'src/features/admin/reviewQueue.js')).href
  );
  const { actionRequiresNote, actionRequiresConfirmation } = await import(
    pathToFileURL(join(root, 'src/features/admin/reviewActions.js')).href
  );
  const { formatAuthError } = await import(pathToFileURL(join(root, 'src/lib/authService.js')).href);
  const { renderAccessDeniedView } = await import(
    pathToFileURL(join(root, 'src/features/auth/accessDeniedView.js')).href
  );
  const { isLocalRuntime } = await import(pathToFileURL(join(root, 'src/config/env.js')).href);

  const sampleRecords = [
    { review_status: 'pending', evidence_status: 'needs_precise_mapping', title_ar: 'b' },
    { review_status: 'needs_source', evidence_status: 'needs_precise_mapping', title_ar: 'a' },
  ];
  const sorted = sortReviewQueueByPriority(sampleRecords);
  if (sorted[0].review_status !== 'needs_source') fail('review queue priority sort', sorted[0].review_status);
  else pass('review queue priority sort');

  const chips = buildFilterChips(events.map((e) => ({ ...e, recordType: 'event', isFinal: isFinalContent(e) })));
  if (!chips.length || chips.every((c) => c.count === 0)) fail('review filter chips', '');
  else pass('review queue filter chips build');

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

  saveReviewFilters({ q: 'qa-test-filter', recordType: 'event' });
  const loaded = loadSavedReviewFilters();
  if (loaded?.q !== 'qa-test-filter') fail('saved review filters persist', loaded?.q);
  else pass('saved review filters persist');

  if (!actionRequiresNote('approve') || !actionRequiresNote('reject')) fail('required note actions', '');
  else pass('review action note required for approve/reject');

  if (!actionRequiresConfirmation('approve')) fail('confirmation actions', '');
  else pass('review action confirmation required');

  const deniedHtml = renderAccessDeniedView({ role: 'viewer', user: { email: 'x@test.com' } });
  if (!deniedHtml.includes('access-denied-view')) fail('access denied view renders', '');
  else pass('access denied view renders');

  const friendly = formatAuthError('Invalid login credentials');
  if (friendly.includes('Invalid login')) fail('formatAuthError sanitizes', friendly);
  else pass('formatAuthError readable messages');

  invalidateAuthCache();
  const viewerAccess = await canAccessAdminReview();
  if (!viewerAccess && isLocalRuntime()) fail('local demo admin access', '');
  else pass('local demo reviewer access works');

  const { getAuthModeBadge, canManageReviewers, setLocalMockRole } = await import(
    pathToFileURL(join(root, 'src/lib/authService.js')).href
  );
  const badge = getAuthModeBadge();
  if (!badge.labelAr || !badge.key) fail('auth mode badge', badge.key);
  else pass('auth mode badge renders');

  setLocalMockRole('reviewer');
  invalidateAuthCache();
  const reviewerManage = await canManageReviewers();
  setLocalMockRole('admin');
  invalidateAuthCache();
  const adminManage = await canManageReviewers();
  setLocalMockRole(null);
  invalidateAuthCache();
  if (reviewerManage) fail('reviewer cannot manage reviewers', '');
  else pass('reviewer management placeholder is admin-only');
  if (!adminManage) fail('admin can see reviewer management in local demo', '');
  else pass('admin reviewer management allowed in local demo');

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (!pkg.scripts['qa:staging']) fail('qa:staging script missing', '');
  else pass('qa:staging command exists');

  if (!runNodeScript(['scripts/supabase_staging_smoke.mjs'], true)) {
    fail('staging smoke exits cleanly when env missing', '');
  } else pass('staging smoke script exits cleanly when env missing');
} catch (err) {
  fail('reviewer dashboard unit tests', err.message);
}

const batch01Path = join(root, 'examples/evidence_patch.batch_01.proposed.json');
const batch01ReviewPath = join(root, 'examples/evidence_patch.batch_01.review_template.json');
if (existsSync(batch01Path)) {
  const batch01 = JSON.parse(readFileSync(batch01Path, 'utf8'));
  const batch01Ids = new Set((batch01.mappings || []).map((m) => m.event_id));
  const batch01Approved = (batch01.mappings || []).filter((m) => m.proposed_review_status === 'approved');
  if (batch01Approved.length) fail('Batch 1 proposed patch has approved mappings', batch01Approved.map((m) => m.event_id));
  else pass('Batch 1 proposed patch has no approved mappings');

  const seedBatchEvents = events.filter((e) => batch01Ids.has(e.id));
  const seedBatchApproved = seedBatchEvents.filter((e) => e.review_status === 'approved');
  if (seedBatchApproved.length) fail('Batch 1 seed events must not be approved', seedBatchApproved.map((e) => e.id));
  else pass('Batch 1 seed events remain not approved');

  if (finalEvents.length !== 6) fail('public-final count unchanged', finalEvents.length);
  else pass('public-final safe event count remains 6');
}

if (existsSync(batch01ReviewPath)) {
  if (!runNodeScript(['scripts/validate_scholar_review_template.mjs', batch01ReviewPath], true)) {
    fail('validate_scholar_review_template', batch01ReviewPath);
  } else pass('validate_scholar_review_template on Batch 1 template');
}

const batch01RevisedPath = join(root, 'examples/evidence_patch.batch_01.revised.proposed.json');
if (existsSync(batch01ReviewPath)) {
  if (!runNodeScript(['scripts/compile_scholar_review_decisions.mjs'], true)) {
    fail('compile_scholar_review_decisions on blank template', '');
  } else pass('compile_scholar_review_decisions produces revised patch from blank template');
}

if (existsSync(batch01RevisedPath)) {
  if (!runNodeScript(['scripts/validate_revised_evidence_patch.mjs', batch01RevisedPath], true)) {
    fail('validate_revised_evidence_patch', batch01RevisedPath);
  } else pass('validate_revised_evidence_patch on Batch 1 revised patch');

  const revised = JSON.parse(readFileSync(batch01RevisedPath, 'utf8'));
  const revisedApproved = (revised.mappings || []).filter((m) => m.proposed_review_status === 'approved');
  if (revisedApproved.length) fail('Batch 1 revised patch must not auto-approve', revisedApproved.map((m) => m.event_id));
  else pass('Batch 1 revised patch has no auto-approved mappings');
}

if (!runNodeScript(['scripts/check_arabic_text_hygiene.mjs', '--strict'], true)) {
  fail('check_arabic_text_hygiene --strict', 'Arabic field errors including الخضr typo');
} else pass('check_arabic_text_hygiene --strict (no الخضr in data)');

const disclaimerPath = join(root, 'src/components/disclaimer.js');
if (existsSync(disclaimerPath)) {
  const disclaimerSrc = readFileSync(disclaimerPath, 'utf8');
  if (!disclaimerSrc.includes('هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة')) {
    fail('Arabic disclaimer text missing from disclaimer.js', '');
  } else pass('Arabic disclaimer preserved in UI component');
}

process.exit(failed ? 1 : 0);
