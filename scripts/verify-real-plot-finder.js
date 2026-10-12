const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

function startStaticServer(port = 4321) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath.endsWith('/')) {
      reqPath += 'index.html';
    } else if (!path.extname(reqPath)) {
      reqPath += '/index.html';
    }

    const filePath = path.join(path.resolve('out'), reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Static server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('Using browser binary:', executablePath);
  const server = await startStaticServer(4321);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const screenshotDir = path.resolve('public/verification-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // ========================================================
  // 1. Desktop Zameen-Style Plot Finder Initial View
  // ========================================================
  console.log('\n--- 1. Testing Desktop Plot Finder Initial View (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4321/plot-finder/', { waitUntil: 'networkidle0' });
  await wait(1500);

  // Check Dropdown options
  const cityOptions = await page.$$eval('select', (selects) =>
    Array.from(selects[0]?.options || []).map((o) => o.text)
  );
  console.log('City options:', cityOptions);

  const societyOptions = await page.$$eval('select', (selects) =>
    Array.from(selects[1]?.options || []).map((o) => o.text)
  );
  console.log('Society options:', societyOptions);

  const blockOptions = await page.$$eval('select', (selects) =>
    Array.from(selects[2]?.options || []).map((o) => o.text)
  );
  console.log('Block options:', blockOptions);

  // Verify that stray disjoint PDF buttons do NOT exist
  const strayPdfButtons = await page.$$eval('a, button', (elements) =>
    elements
      .map((e) => e.textContent || '')
      .filter((t) => t.includes('Official Master Plan PDF') || t.includes('Inspect Full Vector CAD'))
  );
  console.log('Stray PDF buttons found (must be 0):', strayPdfButtons.length);
  if (strayPdfButtons.length > 0) {
    throw new Error('Stray PDF buttons are still present on the page!');
  }

  await page.screenshot({
    path: path.join(screenshotDir, '01-plot-finder-zameen-desktop.png'),
  });
  console.log('Saved 01-plot-finder-zameen-desktop.png');

  // ========================================================
  // 2. Search Plot #88 and Inspect Floating Card
  // ========================================================
  console.log('\n--- 2. Searching Plot #88 ---');
  const plotInput = await page.$('input[placeholder*="12, 45, 88"]');
  if (plotInput) {
    await page.evaluate(() => {
      const el = document.querySelector('input[placeholder*="12, 45, 88"]');
      if (el) {
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await plotInput.type('88');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
  }
  await wait(1500);

  // Verify Floating Plot Card Details
  const plotTitle = await page.$eval('h3', (el) => el.textContent || '');
  console.log('Selected plot header:', plotTitle);

  await page.screenshot({
    path: path.join(screenshotDir, '02-plot-finder-plot-88-selected.png'),
  });
  console.log('Saved 02-plot-finder-plot-88-selected.png');

  // ========================================================
  // 3. Search with hash symbol (#12) to verify query normalization
  // ========================================================
  console.log('\n--- 3. Searching Plot #12 with hash symbol (#12) ---');
  if (plotInput) {
    await page.evaluate(() => {
      const el = document.querySelector('input[placeholder*="12, 45, 88"]');
      if (el) {
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await plotInput.type('#12');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
  }
  await wait(1500);

  const plot12Title = await page.$eval('h3', (el) => el.textContent || '');
  console.log('Selected plot 12 header:', plot12Title);

  await page.screenshot({
    path: path.join(screenshotDir, '03-plot-finder-plot-12-selected.png'),
  });
  console.log('Saved 03-plot-finder-plot-12-selected.png');

  // ========================================================
  // 4. Test Card Dismiss and Reopen
  // ========================================================
  console.log('\n--- 4. Testing Floating Card Dismiss & Re-open ---');
  const closeCardBtn = await page.$('button[title="Close Card"]');
  if (closeCardBtn) {
    await closeCardBtn.click();
    await wait(800);
    console.log('Card dismissed.');
  }

  await page.screenshot({
    path: path.join(screenshotDir, '04-plot-finder-map-unobstructed.png'),
  });
  console.log('Saved 04-plot-finder-map-unobstructed.png');

  // Click Re-open button
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Show Plot #12 Details')) {
      await btn.click();
      await wait(800);
      console.log('Card re-opened.');
      break;
    }
  }

  // ========================================================
  // 5. Test Layer Switcher: Satellite & Hybrid
  // ========================================================
  console.log('\n--- 5. Testing Layer Switcher: Satellite & Hybrid ---');
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Satellite View')) {
      await btn.click();
      break;
    }
  }
  await wait(2000);
  await page.screenshot({
    path: path.join(screenshotDir, '05-plot-finder-satellite-view.png'),
  });
  console.log('Saved 05-plot-finder-satellite-view.png');

  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Hybrid Overlay')) {
      await btn.click();
      break;
    }
  }
  await wait(1500);
  await page.screenshot({
    path: path.join(screenshotDir, '06-plot-finder-hybrid-view.png'),
  });
  console.log('Saved 06-plot-finder-hybrid-view.png');

  // Switch back to Blueprint
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Master Plan Blueprint')) {
      await btn.click();
      break;
    }
  }
  await wait(1000);

  // ========================================================
  // 6. Test Mobile Viewport (390x844)
  // ========================================================
  console.log('\n--- 6. Testing Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4321/plot-finder/', { waitUntil: 'networkidle0' });
  await wait(1500);

  await page.screenshot({
    path: path.join(screenshotDir, '07-plot-finder-mobile-view.png'),
  });
  console.log('Saved 07-plot-finder-mobile-view.png');

  // Tap Plot #45 in matching list on mobile
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.trim() === '#45') {
      await btn.click();
      await wait(1000);
      break;
    }
  }

  await page.screenshot({
    path: path.join(screenshotDir, '08-plot-finder-mobile-plot-45.png'),
  });
  console.log('Saved 08-plot-finder-mobile-plot-45.png');

  // ========================================================
  // 7. Test Admin Panel: Plot & Society Map Manager
  // ========================================================
  console.log('\n--- 7. Testing /admin/ Tab 3 Plot & Society Map ---');
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await page.goto('http://localhost:4321/admin/', { waitUntil: 'networkidle0' });
  await wait(1000);

  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('admin123');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
  }
  await wait(2000);

  // Navigate to Plot & Society Map tab
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Plot & Society Map')) {
      await btn.click();
      break;
    }
  }
  await wait(2000);

  await page.screenshot({
    path: path.join(screenshotDir, '09-admin-plot-society-manager.png'),
  });
  console.log('Saved 09-admin-plot-society-manager.png');

  // Click "Add New Plot" to open pinpoint modal
  console.log('Opening Add New Plot pinpoint modal...');
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Add New Plot')) {
      await btn.click();
      break;
    }
  }
  await wait(1000);
  await page.evaluate(() => window.scrollBy(0, 750));
  await wait(1000);

  await page.screenshot({
    path: path.join(screenshotDir, '10-admin-add-plot-pinpoint-modal.png'),
  });
  console.log('Saved 10-admin-add-plot-pinpoint-modal.png');

  await browser.close();
  server.close();

  const realErrors = consoleErrors.filter(
    (e) => !e.includes('favicon') && !e.includes('maps.google.com')
  );
  console.log('\n--- Verification Summary ---');
  console.log('Console errors:', realErrors);
  if (realErrors.length > 0) {
    throw new Error('Console errors encountered: ' + JSON.stringify(realErrors));
  }
  console.log('All automated verification checks PASSED successfully!');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
