const puppeteer = require('puppeteer-core');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000';

const routes = [
  '/',
  '/properties',
  '/properties/5-marla-residential-plot-samundri-road',
  '/plot-finder',
  '/about',
  '/contact',
  '/terms-and-conditions',
  '/privacy-policy',
  '/admin'
];

async function crawlLinks() {
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox']
  });

  const allLinks = new Set();
  const deadLinks = [];

  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      const pageLinks = await page.$$eval('a', els => els.map(a => a.getAttribute('href')).filter(Boolean));
      for (const l of pageLinks) {
        if (!l.startsWith('tel:') && !l.startsWith('mailto:') && !l.startsWith('https://wa.me') && !l.startsWith('http://') && !l.startsWith('https://')) {
          allLinks.add(l);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      await page.close();
    }
  }

  console.log('Internal links found:', Array.from(allLinks));

  // Now test each internal link
  const page = await browser.newPage();
  for (const link of allLinks) {
    const testUrl = link.startsWith('/') ? `${BASE_URL}${link}` : `${BASE_URL}/${link}`;
    try {
      const res = await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 8000 });
      const status = res.status();
      const text = await page.evaluate(() => document.body.innerText);
      const isNotFound = text.includes('Property Not Found') || text.includes('Listing Not Found') || text.includes('404') || status === 404;
      if (isNotFound) {
        deadLinks.push({ link, status, reason: 'Page displays not found or 404 error' });
      }
    } catch (e) {
      deadLinks.push({ link, error: e.message });
    }
  }

  await browser.close();

  console.log('\n--- DEAD / BROKEN INTERNAL LINKS ---');
  console.log(JSON.stringify(deadLinks, null, 2));
}

crawlLinks();
