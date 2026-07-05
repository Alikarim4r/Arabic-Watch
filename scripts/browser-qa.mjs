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

  // Admin review evidence filters
  await page.goto('http://127.0.0.1:3456/#admin-review', { waitUntil: 'networkidle' });
  await page.waitForSelector('#admin-review .admin-grid', { timeout: 15000 });
  await page.selectOption('#admin-evidence-status', 'needs_precise_mapping');
  await page.waitForTimeout(300);
  if ((await page.locator('.admin-queue-item').count()) === 0) {
    errors.push(`[${name}] admin evidence filter needs_precise_mapping empty`);
  }
  await page.selectOption('#admin-evidence-status', 'precise_evidence');
  await page.waitForTimeout(300);
  if ((await page.locator('.admin-queue-item').count()) === 0) {
    errors.push(`[${name}] admin evidence filter precise_evidence empty`);
  }
  const disclaimer = await page.locator('#admin-review .admin-disclaimer').innerText();
  if (!disclaimer.includes('هذا ملخص تعليمي')) {
    errors.push(`[${name}] admin review missing Arabic disclaimer`);
  }

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
