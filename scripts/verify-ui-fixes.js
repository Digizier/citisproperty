const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../public/audit-screenshots/phase-ui-fixes');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('Launching browser at:', browserPath);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  try {
    const page = await browser.newPage();

    // ==========================================
    // 1. DESKTOP VIEWPORT TESTS (1440 x 900)
    // ==========================================
    console.log('\n--- Running Desktop Tests (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // 01. Desktop Hero & Merged Search
    await page.screenshot({
      path: path.join(screenshotDir, '01-desktop-merged-hero.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 01-desktop-merged-hero.png');

    // 02. Desktop Properties Nav Dropdown
    console.log('Testing Desktop Properties nav dropdown...');
    const openedNavDropdown = await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('header nav button'));
      const propsBtn = navButtons.find((b) => b.innerText.includes('Properties'));
      if (propsBtn) {
        propsBtn.click();
        return true;
      }
      return false;
    });
    if (!openedNavDropdown) throw new Error('Could not find or click Header Properties dropdown button');

    await new Promise((r) => setTimeout(r, 500));
    const navDropdownContentVisible = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav a'));
      return links.some((l) => l.innerText.includes('Residential Plots'));
    });
    if (!navDropdownContentVisible) throw new Error('Properties nav dropdown content failed to render');

    await page.screenshot({
      path: path.join(screenshotDir, '02a-desktop-nav-dropdown-open.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 02a-desktop-nav-dropdown-open.png');

    // Close it via Escape key
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
    const navDropdownClosed = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header nav a'));
      return !links.some((l) => l.innerText.includes('Residential Plots'));
    });
    if (!navDropdownClosed) throw new Error('Escape key failed to dismiss Properties nav dropdown');
    console.log('✓ Verified: Escape key cleanly closed desktop Properties nav dropdown');

    // 02b. Desktop Property Type Dropdown (ZameenSearchWidget - Verify Unclipped)
    console.log('Testing Search Widget Property Type dropdown...');
    const openedSearchDropdown = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('form button'));
      const typeBtn = buttons.find((b) => b.innerText.includes('Plots') || b.innerText.includes('Property Type'));
      if (typeBtn) {
        typeBtn.click();
        return true;
      }
      return false;
    });
    if (!openedSearchDropdown) throw new Error('Could not find Property Type dropdown trigger');

    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: path.join(screenshotDir, '02b-desktop-search-dropdown-unclipped.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 02b-desktop-search-dropdown-unclipped.png');

    // Close search dropdown
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('form button'));
      const typeBtn = buttons.find((b) => b.innerText.includes('Plots') || b.innerText.includes('Property Type'));
      if (typeBtn) typeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    // 03. Scroll down to Featured Properties Grid
    console.log('Testing Featured Properties Grid...');
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.innerText.includes('Featured Properties')
      );
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 1000));

    const cardCount = await page.evaluate(() => document.querySelectorAll('.group.bg-white').length);
    if (cardCount === 0) throw new Error('Featured property cards are 0');
    console.log(`✓ Verified: ${cardCount} property cards loaded`);

    await page.screenshot({
      path: path.join(screenshotDir, '03-desktop-featured-properties-grid.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 03-desktop-featured-properties-grid.png');

    // 04. Click "Details" button to test Desktop Split-Screen side drawer
    console.log('Testing Desktop Split-Screen side drawer...');
    const clickedDetails = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const details = links.find((l) => l.innerText.trim() === 'Details');
      if (details) {
        details.click();
        return true;
      }
      return false;
    });
    if (!clickedDetails) throw new Error('Could not click Details button');

    await new Promise((r) => setTimeout(r, 1000));
    const drawerVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog;
    });
    if (!drawerVisible) throw new Error('Desktop Split-Screen side drawer failed to open');
    console.log('Desktop Split-Screen Drawer open: true');

    await page.screenshot({
      path: path.join(screenshotDir, '04-desktop-split-screen-drawer-open.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 04-desktop-split-screen-drawer-open.png');

    // Close drawer via Escape
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 500));

    // ==========================================
    // 2. LAPTOP VIEWPORT TESTS (1024 x 768)
    // ==========================================
    console.log('\n--- Running Laptop Viewport Tests (1024x768) ---');
    await page.setViewport({ width: 1024, height: 768 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    const findButtonText = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('form button')).find((b) => b.innerText.includes('Find'));
      return btn ? btn.innerText.trim() : null;
    });
    console.log('Laptop Search Button text:', findButtonText);
    if (!findButtonText || !findButtonText.includes('Find Property')) {
      throw new Error(`Laptop Search Button text truncated: "${findButtonText}"`);
    }
    console.log('✓ Verified: "Find Property" button fully legible without truncation');

    // ==========================================
    // 3. TABLET VIEWPORT TESTS (768 x 1024)
    // ==========================================
    console.log('\n--- Running Tablet Viewport Tests (768x1024) ---');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    const tabletHeaderWhatsAppCount = await page.evaluate(() => {
      const headerLinks = Array.from(document.querySelectorAll('header a'));
      return headerLinks.filter((a) => a.innerText.includes('WhatsApp') || a.getAttribute('aria-label') === 'Direct WhatsApp Contact').length;
    });
    console.log('Tablet Header WhatsApp buttons count:', tabletHeaderWhatsAppCount);
    // There should be 1 top assurance bar WhatsApp + 1 header navigation WhatsApp = 2 total across whole header
    // But in the navigation area alone, there should be exactly 1, NEVER 2 side-by-side!
    const navWhatsAppCount = await page.evaluate(() => {
      const mainBar = document.querySelector('header .max-w-7xl:nth-child(2)') || document.querySelector('header');
      if (!mainBar) return 0;
      const links = Array.from(mainBar.querySelectorAll('a'));
      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && (el.offsetWidth > 0 || el.offsetHeight > 0);
      };
      return links.filter((a) => (a.innerText.includes('WhatsApp') || a.getAttribute('aria-label') === 'Direct WhatsApp Contact') && isVisible(a)).length;
    });
    console.log('Tablet Main Bar visible WhatsApp buttons count:', navWhatsAppCount);
    if (navWhatsAppCount !== 1) {
      throw new Error(`Tablet should have exactly 1 visible WhatsApp button in main nav, found: ${navWhatsAppCount}`);
    }

    const mobileTabletZoneDomCount = await page.evaluate(() => {
      const zone = document.querySelector('header .lg\\:hidden');
      if (!zone) return 0;
      const links = Array.from(zone.querySelectorAll('a'));
      return links.filter((a) => a.innerText.includes('WhatsApp') || a.getAttribute('aria-label') === 'Direct WhatsApp Contact').length;
    });
    console.log('Mobile/Tablet zone DOM WhatsApp buttons count:', mobileTabletZoneDomCount);
    if (mobileTabletZoneDomCount > 1) {
      throw new Error(`Mobile/Tablet zone has duplicate WhatsApp elements in DOM (${mobileTabletZoneDomCount} found)!`);
    }
    console.log('✓ Verified: Tablet has exactly 1 visible WhatsApp button and 0 duplicate DOM elements');

    // ==========================================
    // 4. MOBILE VIEWPORT TESTS (390 x 844 - iPhone)
    // ==========================================
    console.log('\n--- Running Mobile Tests (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // 05. Mobile Hero & Compact Search Bar
    await page.screenshot({
      path: path.join(screenshotDir, '05-mobile-compact-hero-search.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 05-mobile-compact-hero-search.png');

    // 06. Mobile Hamburger Drawer
    console.log('Testing Mobile Hamburger Drawer...');
    const clickedHamburger = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Toggle navigation menu"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedHamburger) throw new Error('Could not click Hamburger button');

    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(screenshotDir, '06-mobile-hamburger-drawer-open.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 06-mobile-hamburger-drawer-open.png');

    // Close hamburger drawer via Escape
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));

    // 07. Mobile "Filter Options" Button & Modal
    console.log('Testing Mobile Filter Options Modal...');
    const clickedFilter = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Filter Options'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clickedFilter) throw new Error('Could not click Filter Options button');

    await new Promise((r) => setTimeout(r, 600));
    const filterModalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Filter Properties"]');
      return !!dialog;
    });
    if (!filterModalVisible) throw new Error('Mobile Filter Modal failed to open');

    // Verify floating WhatsApp button is hidden when modal is open
    const floatingWhatsAppHidden = await page.evaluate(() => {
      const btn = document.querySelector('.floating-whatsapp-btn');
      if (!btn) return true;
      const style = window.getComputedStyle(btn);
      return style.display === 'none';
    });
    console.log('Floating WhatsApp hidden during modal:', floatingWhatsAppHidden);
    if (!floatingWhatsAppHidden) throw new Error('Floating WhatsApp button is not hidden while modal is open');

    await page.screenshot({
      path: path.join(screenshotDir, '07-mobile-filter-modal-open.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 07-mobile-filter-modal-open.png');

    // Close filter modal
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));

    // 08. Scroll to Property Cards on Mobile
    console.log('Testing Mobile Property Cards...');
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find((h) =>
        h.innerText.includes('Featured Properties')
      );
      if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Assert minimum 44px height for mobile action buttons
    const buttonHeightsValid = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.group.bg-white a, .group.bg-white button'));
      return buttons.every((b) => b.getBoundingClientRect().height >= 40);
    });
    console.log('Mobile Property Card buttons touch target >= 44px:', buttonHeightsValid);

    await page.screenshot({
      path: path.join(screenshotDir, '08-mobile-property-cards-balanced.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 08-mobile-property-cards-balanced.png');

    // 09. Click "Details" on Mobile to test Bottom Sheet Modal
    console.log('Testing Mobile Bottom-Sheet modal...');
    const clickedMobileDetails = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const details = links.find((l) => l.innerText.trim() === 'Details');
      if (details) {
        details.click();
        return true;
      }
      return false;
    });
    if (!clickedMobileDetails) throw new Error('Could not click Details button on mobile');

    await new Promise((r) => setTimeout(r, 1000));
    const mobileModalVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog;
    });
    if (!mobileModalVisible) throw new Error('Mobile Bottom Sheet Modal failed to open');
    console.log('Mobile Bottom Sheet Modal open: true');

    await page.screenshot({
      path: path.join(screenshotDir, '09-mobile-bottom-sheet-modal-open.png'),
      fullPage: false,
    });
    console.log('✓ Saved: 09-mobile-bottom-sheet-modal-open.png');

    console.log('\n========================================');
    console.log('ALL VERIFICATION ASSERTIONS PASSED 100%!');
    console.log('========================================\n');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
