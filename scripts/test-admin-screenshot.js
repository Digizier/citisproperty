const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAdmin() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    sessionStorage.setItem('pb_admin_auth', 'true');
  });
  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Click sidebar tab "Properties Manager"
  const sidebarBtns = await page.$$('button');
  for (const b of sidebarBtns) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    if (txt.includes('Properties Manager')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Click "+ Add New Property" button
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const txt = await (await b.getProperty('textContent')).jsonValue();
    if (txt.includes('Add New Property')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(__dirname, '../public/audit-screenshots/latest-fixes/05-admin-add-modal-purpose-tabs.png'),
  });
  console.log('Saved admin add modal screenshot!');
  await browser.close();
}
testAdmin();
