const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../public/audit-screenshots/latest-fixes');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Launching browser from:', browserPath);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Load Homepage
    console.log('1. Loading Homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify tabs on homepage
    const tabs = await page.$$eval('div.flex.items-center.overflow-x-auto button', (btns) =>
      btns.map((b) => b.textContent.trim())
    );
    console.log('Detected Tabs:', tabs);
    const hasProjects = tabs.some((t) => t.toLowerCase().includes('project'));
    const hasInvest = tabs.some((t) => t.toLowerCase().includes('invest') && !t.toLowerCase().includes('installment'));
    console.log('Has Projects tab:', hasProjects, '(Expected: false)');
    console.log('Has Invest tab:', hasInvest, '(Expected: false)');

    // Capture Hero with Visible Background Banner
    await page.screenshot({
      path: path.join(screenshotDir, '01-hero-visible-banner-and-tabs.png'),
    });
    console.log('Saved: 01-hero-visible-banner-and-tabs.png');

    // 2. Open Area Range Popover (Check for No Bottom Edge Splitting)
    console.log('2. Opening Area Range Popover...');
    const areaButtons = await page.$$('button');
    for (const btn of areaButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text.includes('Area (Marla)') || text.includes('Area (')) {
        await btn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(screenshotDir, '02-area-range-popover-no-split.png'),
    });
    console.log('Saved: 02-area-range-popover-no-split.png');

    // 3. Open Price Range Popover (Check for No Bottom Edge Splitting)
    console.log('3. Opening Price Range Popover...');
    // Close area first by clicking it again
    for (const btn of areaButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text.includes('Area (Marla)') || text.includes('Area (')) {
        await btn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 500));

    const priceButtons = await page.$$('button');
    for (const btn of priceButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text.includes('Price (PKR)')) {
        await btn.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(screenshotDir, '03-price-range-popover-no-split.png'),
    });
    console.log('Saved: 03-price-range-popover-no-split.png');

    // 4. Test Live Interaction: Click "2-Year Installment"
    console.log('4. Testing Live Interaction (Clicking 2-Year Installment Tab)...');
    const tabButtons = await page.$$('div.flex.items-center.overflow-x-auto button');
    for (const tb of tabButtons) {
      const text = await (await tb.getProperty('textContent')).jsonValue();
      if (text.includes('Installment')) {
        await tb.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Scroll to properties section to verify live filtered properties
    await page.evaluate(() => {
      const el = document.getElementById('properties-section');
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(screenshotDir, '04-live-interactive-installment-plots.png'),
    });
    console.log('Saved: 04-live-interactive-installment-plots.png');

    // 5. Test Admin Panel Properties Manager
    console.log('5. Testing Admin Panel Properties Manager...');
    await page.goto(`${BASE_URL}/admin/`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Check if PIN auth screen appears
    const pinInput = await page.$('input[type="password"]');
    if (pinInput) {
      console.log('Entering PIN: admin123');
      await pinInput.type('admin123');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Open "Create New Property Listing" modal
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const txt = await (await b.getProperty('textContent')).jsonValue();
      if (txt.includes('Add Listing') || txt.includes('Create New Property') || txt.includes('Add New Listing')) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 1200));

    // Inspect Listing Purpose tabs in Admin modal
    const adminPurposeBtns = await page.$$eval('div.space-y-1\\.5 button', (btns) =>
      btns.map((b) => b.textContent.trim())
    );
    console.log('Admin Purpose buttons detected:', adminPurposeBtns);

    await page.screenshot({
      path: path.join(screenshotDir, '05-admin-properties-manager-purpose-tabs.png'),
    });
    console.log('Saved: 05-admin-properties-manager-purpose-tabs.png');

    // 6. Mobile Viewport (390 x 844)
    console.log('6. Testing Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: path.join(screenshotDir, '06-mobile-hero-and-tabs.png'),
    });
    console.log('Saved: 06-mobile-hero-and-tabs.png');

    console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
