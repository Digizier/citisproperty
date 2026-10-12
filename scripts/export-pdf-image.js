const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function main() {
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('Using browser:', executablePath);
  const pdfFilePath = path.resolve('Reference-Data/Features/property bank (1).pdf');
  console.log('Reading PDF:', pdfFilePath);
  const pdfBuffer = fs.readFileSync(pdfFilePath);
  const base64Data = pdfBuffer.toString('base64');
  console.log('Base64 size:', Math.round(base64Data.length / 1024 / 1024), 'MB');

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2600, height: 1800, deviceScaleFactor: 1 });

  const htmlUrl = 'file:///' + path.resolve('scripts/render-pdf-canvas.html').replace(/\\/g, '/');
  console.log('Navigating to:', htmlUrl);
  await page.goto(htmlUrl, { waitUntil: 'domcontentloaded' });

  console.log('Calling renderPdf in browser...');
  await page.evaluate(async (b64) => {
    window.renderPdf(b64);
  }, base64Data);

  // Wait for RENDER_COMPLETE
  console.log('Waiting for RENDER_COMPLETE...');
  await page.waitForFunction(() => window.renderSuccess === true || window.renderError !== undefined, { timeout: 60000 });

  const error = await page.evaluate(() => window.renderError);
  if (error) {
    throw new Error('PDF render failed: ' + error);
  }

  console.log('Rendering completed, extracting canvas data URL...');
  const canvasElement = await page.$('#pdfCanvas');
  const box = await canvasElement.boundingBox();
  console.log('Canvas dimensions:', box.width, 'x', box.height);

  const outputPathPng = path.resolve('public/maps/citi-housing-master-plan-hd.png');
  await canvasElement.screenshot({ path: outputPathPng, type: 'png' });
  console.log('Saved PNG to:', outputPathPng);

  // Also take webp screenshot if possible
  const outputPathWebp = path.resolve('public/maps/citi-housing-master-plan-hd.webp');
  await canvasElement.screenshot({ path: outputPathWebp, type: 'webp', quality: 90 });
  console.log('Saved WebP to:', outputPathWebp);

  await browser.close();
  console.log('Finished successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
