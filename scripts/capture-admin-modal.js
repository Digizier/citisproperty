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
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath.endsWith('/')) reqPath += 'index.html';
    else if (!path.extname(reqPath)) reqPath += '/index.html';
    const filePath = path.join(path.resolve('out'), reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('404');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const server = await startStaticServer(4321);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1400 });

  await page.goto('http://localhost:4321/admin/', { waitUntil: 'networkidle0' });
  await wait(1000);

  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.type('admin123');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
  }
  await wait(2000);

  // Switch to Tab 3
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Plot & Society Map')) {
      await btn.click();
      break;
    }
  }
  await wait(2000);

  // Click Add New Plot
  for (const btn of await page.$$('button')) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Add New Plot')) {
      await btn.click();
      break;
    }
  }
  await wait(2000);

  const screenshotPath = path.resolve('public/verification-screenshots/admin-pinpoint-canvas-modal.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Saved admin-pinpoint-canvas-modal.png');

  await browser.close();
  server.close();
}

main().catch(console.error);
