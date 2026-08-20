import { chromium, devices } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src');
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = join(root, decodeURIComponent(url));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain' });
  res.end(readFileSync(file));
});

await new Promise((r) => server.listen(3456, r));

const errors = [];
const browser = await chromium.launch();
const contexts = [
  { name: 'desktop', context: await browser.newContext({ locale: 'ar-SA' }) },
  { name: 'mobile', context: await browser.newContext({ ...devices['iPhone 13'], locale: 'ar-SA' }) },
];

for (const { name, context } of contexts) {
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`[${name}] ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${name}] console: ${msg.text()}`);
  });

  const closeModal = async () => {
    if (!(await page.locator('.modal.show').count())) return;
    await page.locator('.modal.show .close').first().click({ force: true });
    await page.waitForTimeout(250);
    if (await page.locator('.modal.show').count()) {
      await page.locator('.modal.show').click({ position: { x: 8, y: 8 }, force: true });
      await page.waitForTimeout(250);
    }
  };

  await page.goto('http://127.0.0.1:3456/', { waitUntil: 'networkidle' });
  await page.waitForSelector('#universe2d', { timeout: 15000 });

  const quranImported = await page.evaluate(async () => {
    const res = await fetch('./data/quran/quran_text.index.json');
    const data = await res.json();
    return Boolean(data.is_full_quran && data.ayah_count === 6236);
  });

  // Story next/prev
  await page.click('#story-next');
  await page.waitForTimeout(300);
  await page.click('#story-prev');

  // Search
  await page.fill('#q', 'موسى');
  await page.waitForTimeout(400);
  const results = await page.locator('#results .result').count();
  if (results === 0) errors.push(`[${name}] search موسى returned 0`);

  // Study card
  await page.locator('.study-card').first().click();
  await page.waitForSelector('.modal.show');
  await closeModal();

  // Surah grid — linked nodes for سورة يوسف
  await page.locator('.surah[data-surah="12"]').click();
  await page.waitForTimeout(300);
  const surahDetail = await page.locator('#surahDetail').innerText();
  if (!surahDetail.includes('يوسف')) errors.push(`[${name}] surah grid missing linked node for surah 12`);

  // Graph surah filter
  await page.selectOption('#graph-surah', '12');
  await page.waitForTimeout(300);
  await page.click('#graph-reset');

  // Admin Review — reviewer dashboard & navigation
  await page.goto('http://127.0.0.1:3456/#admin-review', { waitUntil: 'networkidle' });
  await page.waitForSelector('#admin-review', { timeout: 15000 });
  const demoBanner = await page.locator('#admin-review .admin-demo-banner').first().innerText();
  if (!demoBanner.includes('وضع تجريبي محلي')) {
    errors.push(`[${name}] admin review missing local demo banner`);
  }
  const reviewerNav = await page.locator('[data-reviewer-tab="dashboard"]').count();
  if (reviewerNav < 1) errors.push(`[${name}] reviewer navigation missing`);

  await page.locator('[data-reviewer-tab="dashboard"]').click();
  await page.waitForTimeout(400);
  await page.waitForSelector('#reviewer-dashboard', { timeout: 10000 });
  const dashboardHeading = await page.locator('#reviewer-dashboard h2').innerText();
  if (!dashboardHeading.includes('لوحة المراجع')) {
    errors.push(`[${name}] reviewer dashboard missing heading`);
  }

  // Evidence Curation workbench
  await page.locator('[data-reviewer-tab="curation"]').click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.admin-curation', { timeout: 10000 });
  const curationQueue = await page.locator('.curation-queue-item').count();
  if (curationQueue === 0) errors.push(`[${name}] evidence curation queue empty`);
  await page.locator('.curation-queue-item').first().click();
  await page.waitForTimeout(200);
  await page.fill('#curation-form input[name="surah_id"]', '2');
  await page.fill('#curation-form input[name="ayah_from"]', '30');
  await page.fill('#curation-form input[name="ayah_to"]', '37');
  await page.selectOption('#curation-form select[name="evidence_confidence"]', 'needs_review');
  await page.selectOption('#curation-form select[name="proposed_review_status"]', 'pending');
  await page.click('#curation-save-draft');
  await page.waitForTimeout(300);
  const saveMsg = await page.locator('#curation-validation-msg').innerText();
  if (!saveMsg.includes('مسودة')) errors.push(`[${name}] curation save draft failed: ${saveMsg}`);
  await page.click('#curation-export-patch');
  await page.waitForTimeout(300);
  const exportMsg = await page.locator('#curation-validation-msg').innerText();
  if (!exportMsg.includes('تصدير') && !exportMsg.includes('مسودة')) {
    errors.push(`[${name}] curation export failed: ${exportMsg}`);
  }
  const curationDisclaimer = await page.locator('#admin-review .admin-disclaimer').first().innerText();
  if (!curationDisclaimer.includes('هذا ملخص تعليمي')) {
    errors.push(`[${name}] admin review missing Arabic disclaimer`);
  }
  const quranBadge = await page.locator('.admin-evidence-stats .muted').first().innerText();
  if (quranImported) {
    if (!quranBadge.includes('النص متوفر')) {
      errors.push(`[${name}] admin curation missing النص متوفر badge after import: ${quranBadge}`);
    }
  } else if (!quranBadge.includes('النص غير مستورد')) {
    errors.push(`[${name}] admin curation missing النص غير مستورد badge`);
  }

  // Owner Review Workspace
  await page.locator('[data-reviewer-tab="owner_review"]').click();
  await page.waitForTimeout(500);
  await page.waitForSelector('#owner-review-workspace', { timeout: 10000 });
  const ownerHeading = await page.locator('.admin-owner-header h3').innerText();
  if (!ownerHeading.includes('مراجعة المالك')) {
    errors.push(`[${name}] owner review workspace missing heading`);
  }
  const progressDashboard = await page.locator('#owner-progress-dashboard').count();
  if (progressDashboard < 1) errors.push(`[${name}] owner progress dashboard missing`);
  const progressTotal = await page.locator('.admin-stats-owner-progress .stat strong').first().innerText();
  if (progressTotal !== '48') errors.push(`[${name}] progress dashboard total expected 48, got ${progressTotal}`);
  const backupWarning = await page.locator('#owner-backup-warning').innerText();
  if (!backupWarning.includes('تصدير JSON')) {
    errors.push(`[${name}] owner backup warning missing`);
  }
  const validationAr = await page.locator('[data-validation-ar]').first().innerText();
  if (!validationAr.includes('قرار')) {
    errors.push(`[${name}] Arabic validation message missing: ${validationAr}`);
  }
  const safetyWarnings = await page.locator('#owner-safety-warnings').innerText();
  if (!safetyWarnings.includes('لا يُطبَّق')) {
    errors.push(`[${name}] owner safety warnings missing`);
  }
  const ownerQueueCount = await page.locator('.owner-queue-item').count();
  if (ownerQueueCount !== 48) {
    errors.push(`[${name}] owner review workspace expected 48 items, got ${ownerQueueCount}`);
  }
  const ownerWarning = await page.locator('.admin-owner-header .admin-warning.warn').first().innerText();
  if (!ownerWarning.includes('بانتظار مراجعة المالك')) {
    errors.push(`[${name}] owner review missing owner warning`);
  }
  const ownerDisclaimer = await page.locator('#owner-review-workspace .admin-disclaimer').innerText();
  if (!ownerDisclaimer.includes('هذا ملخص تعليمي')) {
    errors.push(`[${name}] owner review missing Arabic disclaimer`);
  }
  await page.selectOption('#owner-filter-batch', 'evidence_mapping_sprint_01');
  await page.waitForTimeout(400);
  const filteredOwnerCount = await page.locator('.owner-queue-item').count();
  if (filteredOwnerCount !== 10) {
    errors.push(`[${name}] owner review batch filter expected 10, got ${filteredOwnerCount}`);
  }
  await page.selectOption('#owner-filter-batch', '');
  await page.waitForTimeout(300);
  await page.locator('.owner-queue-item').first().click();
  await page.waitForTimeout(200);
  await page.selectOption('#owner-decision-select', 'needs_source');
  await page.fill('textarea[name="owner_note"]', 'qa owner note');
  await page.click('#owner-save-local');
  await page.waitForTimeout(400);
  const savedStatus = await page.locator('#owner-save-status').innerText();
  if (!savedStatus.includes('حفظ')) {
    errors.push(`[${name}] owner review local save status missing: ${savedStatus}`);
  }
  const stored = await page.evaluate(() => localStorage.getItem('qsu_owner_review_decisions'));
  if (!stored || !stored.includes('needs_source')) {
    errors.push(`[${name}] owner review localStorage autosave missing`);
  }
  await page.click('#owner-export-json');
  await page.waitForSelector('.qsu-confirm-overlay', { timeout: 5000 }).catch(() => null);
  if (await page.locator('.qsu-confirm-overlay').count()) {
    await page.click('#qsu-confirm-ok');
    await page.waitForTimeout(300);
  }
  await page.click('#owner-compile-revised');
  await page.waitForSelector('.qsu-confirm-overlay', { timeout: 5000 }).catch(() => null);
  if (await page.locator('.qsu-confirm-overlay').count()) {
    await page.click('#qsu-confirm-ok');
    await page.waitForTimeout(300);
  }
  const compilePreview = await page.locator('#owner-compile-preview').innerText();
  if (!compilePreview.includes('approved_proposed: 0')) {
    errors.push(`[${name}] owner compile should have 0 approved with undecided decisions: ${compilePreview}`);
  }
  await page.evaluate(() => localStorage.removeItem('qsu_owner_review_decisions'));

  // Content Batches tab
  await page.locator('[data-reviewer-tab="batches"]').click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.admin-batches', { timeout: 10000 });
  const batchesTab = await page.locator('.admin-main h3.gold').first().innerText();
  if (!batchesTab.includes('دفعات المحتوى')) {
    errors.push(`[${name}] content batches tab missing heading`);
  }
  const applyGuidance = await page.locator('.admin-apply-guidance h3.gold').innerText();
  if (!applyGuidance.includes('تطبيق الدفعات المعتمدة')) {
    errors.push(`[${name}] content batches missing controlled apply guidance panel`);
  }
  const pipelineSteps = await page.locator('.admin-apply-pipeline .admin-pipeline-step').count();
  if (pipelineSteps < 5) {
    errors.push(`[${name}] content batches missing apply status pipeline`);
  }
  await page.click('#batch-create-sample');
  await page.waitForTimeout(600);
  const batchCount = await page.locator('.batch-queue-item').count();
  if (batchCount < 1) {
    const batchMsg = await page.locator('#batch-validation-msg').innerText().catch(() => '');
    errors.push(`[${name}] content batch sample create failed: ${batchMsg || '(empty)'}`);
  }

  // Review Queue — confirmation + filters
  await page.locator('[data-reviewer-tab="review"]').click();
  await page.waitForTimeout(400);
  const filterChips = await page.locator('.filter-chips .filter-chip').count();
  if (filterChips < 1) errors.push(`[${name}] review queue filter chips missing`);
  await page.locator('.admin-queue-item').first().click();
  await page.waitForTimeout(200);
  await page.fill('#admin-note', 'qa test note for needs_source');
  await page.locator('#admin-detail [data-action="needs_source"]').click();
  await page.waitForSelector('.qsu-confirm-overlay', { timeout: 5000 });
  await page.fill('#qsu-confirm-reviewer-note', 'qa confirmation note');
  await page.click('#qsu-confirm-ok');
  await page.waitForTimeout(800);
  const detailText = await page.locator('#admin-detail').innerText();
  if (!detailText.includes('سجل إجراءات المراجعة')) {
    errors.push(`[${name}] admin review history panel missing after action`);
  }

  // Review History tab
  await page.locator('[data-reviewer-tab="history"]').click();
  await page.waitForTimeout(400);
  const historyPanel = await page.locator('.review-history-panel h3').innerText();
  if (!historyPanel.includes('سجل المراجعات')) {
    errors.push(`[${name}] review history panel missing`);
  }

  // Profile tab + sign-in UI
  await page.locator('[data-reviewer-tab="profile"]').click();
  await page.waitForTimeout(400);
  const profilePanel = await page.locator('.reviewer-profile-panel h3').innerText();
  if (!profilePanel.includes('إعدادات الحساب')) {
    errors.push(`[${name}] reviewer profile panel missing`);
  }
  const signInView = await page.locator('#sign-in-view').count();
  if (signInView < 1) errors.push(`[${name}] sign-in UI missing in profile`);

  // Saved filters persist
  await page.locator('[data-reviewer-tab="review"]').click();
  await page.waitForTimeout(300);
  await page.fill('#admin-q', 'yusuf');
  await page.click('#save-filters');
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#admin-review', { timeout: 15000 });
  await page.locator('[data-reviewer-tab="review"]').click();
  await page.waitForTimeout(400);
  const savedQ = await page.locator('#admin-q').inputValue();
  if (savedQ !== 'yusuf') errors.push(`[${name}] saved review filters did not persist`);

  // Story Mode Quran text display
  await page.goto('http://127.0.0.1:3456/#story', { waitUntil: 'networkidle' });
  await page.waitForSelector('#storySelect', { timeout: 10000 });
  await page.selectOption('#storySelect', 'yusuf');
  await page.waitForTimeout(500);
  if (quranImported) {
    const storyUthmani = await page.locator('#story-root .quran-uthmani').first().innerText();
    if (!storyUthmani || storyUthmani.length < 3) {
      errors.push(`[${name}] story mode missing imported Quran text`);
    }
  } else {
    const storyAyahFallback = await page.locator('#story-root .quran-missing-note').first().innerText();
    if (!storyAyahFallback.includes('غير مستورد')) {
      errors.push(`[${name}] story mode missing Quran text fallback`);
    }
  }

  // Study modal Quran text display
  await page.click('#story-open-study');
  await page.waitForSelector('.modal.show');
  if (quranImported) {
    const studyUthmani = await page.locator('.modal-body .quran-uthmani').first().innerText();
    if (!studyUthmani || studyUthmani.length < 3) {
      errors.push(`[${name}] study modal missing imported Quran text`);
    }
  } else {
    const studyFallback = await page.locator('.modal-body .quran-missing-note').first().innerText();
    if (!studyFallback.includes('غير مستورد')) {
      errors.push(`[${name}] study modal missing Quran text fallback`);
    }
  }
  const mushafBtnStudy = await page.locator('.modal-body [data-mushaf-open]').count();
  if (mushafBtnStudy < 1) errors.push(`[${name}] study modal missing فتح في المصحف button`);
  await closeModal();

  // Mushaf Reader section
  await page.goto('http://127.0.0.1:3456/#mushaf', { waitUntil: 'networkidle' });
  await page.waitForSelector('#mushaf', { timeout: 15000 });
  const mushafHeading = await page.locator('#mushaf h2').innerText();
  if (!mushafHeading.includes('قارئ المصحف')) {
    errors.push(`[${name}] mushaf section missing heading`);
  }
  const navMushaf = await page.locator('.nav a[href="#mushaf"]').count();
  if (navMushaf < 1) errors.push(`[${name}] nav missing المصحف link`);
  const importBadge = await page.locator('#mushaf-import-status').innerText();
  if (quranImported) {
    if (!importBadge.includes('النص القرآني مستورد')) {
      errors.push(`[${name}] mushaf missing imported badge: ${importBadge}`);
    }
    await page.fill('#mushaf-goto-surah', '2');
    await page.fill('#mushaf-goto-ayah', '255');
    await page.click('#mushaf-goto-quick');
    await page.waitForTimeout(500);
    const uthmani = await page.locator('.mushaf-ayah-available .mushaf-ayah-text').first().innerText();
    if (!uthmani || uthmani.length < 3) {
      errors.push(`[${name}] mushaf missing text_uthmani after import`);
    }
    const missingTop = await page.locator('#mushaf .mushaf-import-note').count();
    if (missingTop > 0) errors.push(`[${name}] mushaf shows import placeholder after full import`);
  } else {
    if (!importBadge.includes('غير مستورد')) {
      errors.push(`[${name}] mushaf missing not-imported badge: ${importBadge}`);
    }
    const missingNote = await page.locator('#mushaf .quran-missing-note').first().innerText();
    if (!missingNote.includes('غير مستورد')) {
      errors.push(`[${name}] mushaf missing Quran text placeholder`);
    }
    await page.selectOption('#mushaf-surah-select', '2');
    await page.waitForTimeout(400);
    const surahHeader = await page.locator('.mushaf-surah-title').innerText();
    if (!surahHeader.includes('البقرة')) {
      errors.push(`[${name}] mushaf surah selector failed: ${surahHeader}`);
    }
    await page.fill('#mushaf-goto-ayah', '31');
    await page.fill('#mushaf-goto-surah', '2');
    await page.click('#mushaf-goto-quick');
    await page.waitForTimeout(400);
    const refOnly = await page.locator('.mushaf-ayah-ref-only').first().innerText();
    if (!refOnly.includes('البقرة') || !refOnly.includes('31')) {
      errors.push(`[${name}] mushaf missing ayah reference placeholder: ${refOnly}`);
    }
  }
  await page.locator('#mushaf-font-size').fill('28');
  await page.waitForTimeout(200);
  const fontSize = await page.evaluate(() =>
    getComputedStyle(document.querySelector('#mushaf-reading-area')).getPropertyValue('--mushaf-font-size')
  );
  if (!fontSize.includes('28')) errors.push(`[${name}] mushaf font size setting failed: ${fontSize}`);
  await page.click('#mushaf-bookmark');
  await page.waitForTimeout(300);
  const bookmarkItems = await page.locator('.mushaf-bookmark-item').count();
  if (bookmarkItems < 1) errors.push(`[${name}] mushaf bookmark add failed`);
  await page.click('#mushaf-bookmark');
  await page.waitForTimeout(300);
  const lastReadStored = await page.evaluate(() => localStorage.getItem('qsu_mushaf_last_read'));
  if (!lastReadStored || !lastReadStored.includes('"surahId":2')) {
    errors.push(`[${name}] mushaf last read not saved`);
  }
  const disclaimerMushaf = await page.locator('#mushaf .mushaf-disclaimer').innerText();
  if (!disclaimerMushaf.includes('هذا ملخص تعليمي')) {
    errors.push(`[${name}] mushaf missing Arabic disclaimer`);
  }
  const globalDisclaimer = await page.locator('#disclaimer-mount').innerText();
  if (!globalDisclaimer.includes('هذا ملخص تعليمي')) {
    errors.push(`[${name}] global Arabic disclaimer missing`);
  }

  // Story mushaf open button
  await page.goto('http://127.0.0.1:3456/#story', { waitUntil: 'networkidle' });
  await page.waitForSelector('#storySelect', { timeout: 10000 });
  await page.selectOption('#storySelect', 'yusuf');
  await page.waitForTimeout(500);
  const storyMushafBtn = await page.locator('#story-root [data-mushaf-open]').count();
  if (storyMushafBtn < 1) errors.push(`[${name}] story mode missing فتح في المصحف button`);
  await page.locator('#story-root [data-mushaf-open]').first().click();
  await page.waitForTimeout(500);
  const mushafAfterStory = await page.locator('#mushaf').count();
  if (mushafAfterStory < 1) errors.push(`[${name}] فتح في المصحف did not open mushaf section`);

  // Story Mode evidence warnings
  await page.goto('http://127.0.0.1:3456/#story', { waitUntil: 'networkidle' });
  await page.waitForSelector('#storySelect', { timeout: 10000 });
  await page.selectOption('#storySelect', 'yusuf');
  await page.waitForTimeout(400);
  if ((await page.locator('#story-root .draft-banner').count()) > 0) {
    errors.push(`[${name}] yusuf precise approved event shows draft banner`);
  }
  await page.selectOption('#storySelect', 'musa');
  await page.waitForTimeout(300);
  await page.locator('#storyList button[data-idx="1"]').click();
  await page.waitForTimeout(300);
  if ((await page.locator('#story-root .draft-banner').count()) === 0) {
    errors.push(`[${name}] musa non-final event missing draft banner`);
  }
  if (await page.locator('#storySelect option[value="adam"]').count()) {
    await page.selectOption('#storySelect', 'adam');
    await page.waitForTimeout(400);
    if ((await page.locator('#story-root .draft-banner').count()) === 0) {
      errors.push(`[${name}] pending story missing draft banner`);
    }
  }

  // Study modal evidence warning
  await page.goto('http://127.0.0.1:3456/#study', { waitUntil: 'networkidle' });
  await page.locator('.study-card[data-id="ibrahim"]').click();
  await page.waitForSelector('.modal.show');
  const studyBody = await page.locator('.modal-body').innerText();
  if (!studyBody.includes('ربط آيات') && !studyBody.includes('مراجعة')) {
    errors.push(`[${name}] study modal missing evidence warning for ibrahim`);
  }
  await closeModal();

  // RTL
  const dir = await page.evaluate(() => document.documentElement.dir);
  if (dir !== 'rtl') errors.push(`[${name}] dir not rtl`);

  await context.close();
}

await browser.close();
server.close();

if (errors.length) {
  console.error('BROWSER QA FAILURES:');
  errors.forEach((e) => console.error(e));
  process.exit(1);
}
console.log('BROWSER QA PASSED');
process.exit(0);
