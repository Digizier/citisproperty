const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

async function captureVideoFrames() {
  const videoPath = path.resolve(__dirname, '../Reference-Data/Features/video ( features all needed ).mp4').replace(/\\/g, '/');
  console.log('Video path:', videoPath);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; height:100vh;">
        <video id="vid" src="file:///${videoPath}" style="max-width:100%; max-height:100%;" autoplay muted></video>
      </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 2000));

  const timestamps = [3, 15, 30, 50, 70];
  for (const t of timestamps) {
    await page.evaluate((time) => {
      const v = document.getElementById('vid');
      if (v) v.currentTime = time;
    }, t);
    await new Promise(r => setTimeout(r, 1500));
    const dest = path.join(__dirname, `../public/audit-screenshots/client-video-frame-${t}s.png`);
    await page.screenshot({ path: dest });
    console.log(`Captured frame at ${t}s to ${dest}`);
  }

  await browser.close();
}

captureVideoFrames().catch(e => console.error('Error:', e));
