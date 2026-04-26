/**
 * Headless smoke test for production build.
 *
 * Walks a list of routes that depend on dynamically-imported chunks
 * (lazy-loaded pages) and fails if:
 *   - a "Failed to fetch dynamically imported module" / ChunkLoadError fires
 *   - any console.error or uncaught pageerror occurs
 *   - the route returns a non-2xx HTTP status
 *
 * This catches the exact stale-chunk class of bug that caused
 * /compress-image to white-screen after deploy.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const ROUTES = [
  '/',
  '/compress-image',
  '/compress-pdf',
  '/merge-pdf',
  '/edit-pdf',
  '/sign-pdf',
  '/qr-code-generator',
  '/all-tools',
];

const STALE_CHUNK_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i;

const failures = [];

const browser = await chromium.launch();
const context = await browser.newContext();

for (const route of ROUTES) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  const url = `${BASE}${route}`;
  let status = 0;
  try {
    const resp = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    status = resp?.status() ?? 0;
  } catch (err) {
    failures.push(`${route}: navigation failed — ${err.message}`);
    await page.close();
    continue;
  }

  // Give lazy chunks a moment to resolve / reject.
  await page.waitForTimeout(1500);

  const stale = [...consoleErrors, ...pageErrors].filter((m) =>
    STALE_CHUNK_RE.test(m)
  );

  if (stale.length) {
    failures.push(
      `${route}: STALE CHUNK detected →\n  ${stale.join('\n  ')}`
    );
  } else if (pageErrors.length) {
    failures.push(
      `${route}: page error →\n  ${pageErrors.join('\n  ')}`
    );
  } else if (consoleErrors.length) {
    failures.push(
      `${route}: console.error →\n  ${consoleErrors.join('\n  ')}`
    );
  } else if (status < 200 || status >= 400) {
    failures.push(`${route}: HTTP ${status}`);
  } else {
    console.log(`✓ ${route} (HTTP ${status})`);
  }

  await page.close();
}

await browser.close();

if (failures.length) {
  console.error('\n❌ Smoke test failures:\n');
  failures.forEach((f) => console.error('  • ' + f));
  process.exit(1);
}

console.log(`\n✅ All ${ROUTES.length} routes passed smoke test.`);
