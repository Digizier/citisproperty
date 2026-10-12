const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../public/audit-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000';

const pagesToTest = [
  { name: '01-home', url: '/' },
  { name: '02-properties-directory', url: '/properties' },
  { name: '03-property-detail', url: '/properties/5-marla-residential-plot-samundri-road' },
  { name: '04-plot-finder', url: '/plot-finder' },
  { name: '05-about', url: '/about' },
  { name: '06-contact', url: '/contact' },
  { name: '07-terms', url: '/terms-and-conditions' },
  { name: '08-privacy', url: '/privacy-policy' },
  { name: '09-admin-login', url: '/admin' },
  // Broken link check
  { name: '10-broken-nav-residential', url: '/properties/residential-plots' },
  { name: '11-broken-nav-commercial', url: '/properties/commercial-plots' },
  { name: '12-broken-nav-houses', url: '/properties/houses-villas' },
];

async function runAudit() {
  console.log('Launching browser at:', browserPath);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const auditResults = [];

  for (const pageInfo of pagesToTest) {
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.toString()));

    try {
      console.log(`Auditing: ${pageInfo.name} (${pageInfo.url})`);
      
      // 1. Desktop Viewport
      await page.setViewport({ width: 1440, height: 900 });
      const resp = await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      const status = resp ? resp.status() : 'unknown';

      await new Promise(r => setTimeout(r, 1000));

      const desktopImg = path.join(screenshotDir, `${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: desktopImg, fullPage: true });

      // Page Title and Key Elements
      const title = await page.title();
      const pageHeading = await page.$eval('h1, h2', el => el ? el.innerText.trim() : 'None').catch(() => 'None');
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300).replace(/\n+/g, ' '));

      // 2. Mobile Viewport
      await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
      await new Promise(r => setTimeout(r, 800));

      const mobileImg = path.join(screenshotDir, `${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: mobileImg, fullPage: true });

      auditResults.push({
        name: pageInfo.name,
        url: pageInfo.url,
        status,
        title,
        pageHeading,
        consoleErrors,
        pageErrors,
        bodySnippet: bodyText,
        desktopImg: path.basename(desktopImg),
        mobileImg: path.basename(mobileImg)
      });
    } catch (err) {
      console.error(`Error auditing ${pageInfo.name}:`, err.message);
      auditResults.push({
        name: pageInfo.name,
        url: pageInfo.url,
        error: err.message,
        consoleErrors,
        pageErrors
      });
    } finally {
      await page.close();
    }
  }

  // Also test Admin PIN Unlock and admin dashboard
  console.log('Testing Admin dashboard with PIN unlocking...');
  const adminPage = await browser.newPage();
  try {
    await adminPage.setViewport({ width: 1440, height: 900 });
    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    
    // Type PIN
    const pinInput = await adminPage.$('input[type="password"]');
    if (pinInput) {
      await pinInput.type('admin123');
      const submitBtn = await adminPage.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      
      const adminDashImg = path.join(screenshotDir, '09-admin-dashboard-unlocked.png');
      await adminPage.screenshot({ path: adminDashImg, fullPage: true });
      console.log('Admin dashboard unlocked and captured!');
    }
  } catch (err) {
    console.error('Error during admin test:', err.message);
  } finally {
    await adminPage.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '../public/audit-screenshots/report.json'),
    JSON.stringify(auditResults, null, 2)
  );
  console.log('Audit completed successfully. Results saved to public/audit-screenshots/report.json');
}

runAudit();
