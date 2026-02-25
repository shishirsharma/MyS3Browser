#!/usr/bin/env node

/**
 * Puppeteer script to capture extension screenshots
 * This script launches Chrome with the extension and captures key screens
 *
 * Usage:
 *   npm run screenshots
 *
 * Manual steps if script fails:
 *   1. Load unpacked extension from /dist folder
 *   2. Use Windows Snipping Tool or Mac Screenshot
 *   3. Save to /screenshots folder
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const EXTENSION_PATH = path.resolve(__dirname, '../dist');
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function findExtensionId(page) {
  try {
    await page.goto('chrome://extensions/', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Try to find extension ID from page
    const extensionIds = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[id^="extension-"]'));
      return items.map(item => item.id.replace('extension-', ''));
    });

    return extensionIds.length > 0 ? extensionIds[0] : null;
  } catch (e) {
    return null;
  }
}

async function takeScreenshots() {
  console.log('🚀 Puppeteer Screenshot Capture Tool\n');
  console.log('📋 Setup:');
  console.log('   ✓ Extension path:', EXTENSION_PATH);
  console.log('   ✓ Output directory:', OUTPUT_DIR);
  console.log('   ✓ Viewport size: 1280x800\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--load-extension=${EXTENSION_PATH}`,
      `--disable-extensions-except=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('⏳ Waiting for Chrome to load extension...');
    await page.waitForTimeout(3000);

    // Find extension ID
    let extensionId = await findExtensionId(page);

    if (!extensionId) {
      console.log('\n⚠️  Could not auto-detect extension ID');
      console.log('   Trying to find through service worker...\n');

      const pages = await browser.pages();
      for (const p of pages) {
        const url = p.url();
        if (url.includes('chrome-extension://') && !url.includes('chrome://')) {
          extensionId = url.match(/chrome-extension:\/\/([^\/]+)\//)?.[1];
          if (extensionId) break;
        }
      }
    }

    if (!extensionId) {
      throw new Error('Could not find extension ID. Manual capture required.');
    }

    console.log(`✅ Found extension ID: ${extensionId}\n`);

    const extensionUrl = `chrome-extension://${extensionId}/src/app/index.html`;

    console.log('📍 Navigating to extension popup...');
    await page.goto(extensionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Screenshot 1: Main browser view (no credentials state)
    console.log('📸 Capturing: Main browser (no credentials)...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '1-main-browser.png'),
      fullPage: true,
    });

    // Screenshot 2: Help modal - File Operations
    console.log('📸 Capturing: Help modal...');
    try {
      const helpBtn = await page.$('button[title*="Help"]');
      if (helpBtn) {
        await helpBtn.click();
        await page.waitForTimeout(800);

        // Click on Features tab
        const featuresTab = await page.$('button:has-text("Features")');
        if (featuresTab) {
          await featuresTab.click();
          await page.waitForTimeout(500);
        }

        await page.screenshot({
          path: path.join(OUTPUT_DIR, '2-help-features.png'),
          fullPage: true,
        });

        // Close modal
        const closeBtn = await page.$('.btn-close');
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('   ⚠️  Could not capture help modal:', e.message);
    }

    // Screenshot 3: Getting Started tab
    console.log('📸 Capturing: Help - Getting Started...');
    try {
      const helpBtn = await page.$('button[title*="Help"]');
      if (helpBtn) {
        await helpBtn.click();
        await page.waitForTimeout(800);

        const gettingStartedTab = await page.$('button:has-text("Getting Started")');
        if (gettingStartedTab) {
          await gettingStartedTab.click();
          await page.waitForTimeout(500);
        }

        await page.screenshot({
          path: path.join(OUTPUT_DIR, '3-help-getting-started.png'),
          fullPage: true,
        });

        const closeBtn = await page.$('.btn-close');
        if (closeBtn) await closeBtn.click();
      }
    } catch (e) {
      console.log('   ⚠️  Could not capture Getting Started:', e.message);
    }

    console.log('\n✅ Screenshot capture complete!\n');
    console.log('📁 Output files:');
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`   ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n💡 Next steps:');
    console.log('   1. Review screenshots in /screenshots folder');
    console.log('   2. Resize to 1280x800 or 640x400 for Chrome Web Store');
    console.log('   3. Upload to Chrome Web Store listing');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Manual capture fallback:');
    console.log('   1. Load unpacked extension from /dist folder');
    console.log('   2. Use Windows Snipping Tool (Win+Shift+S)');
    console.log('   3. Or use Mac Screenshot (Cmd+Shift+4)');
    console.log('   4. Save images to /screenshots folder');
  } finally {
    console.log('\n🔌 Closing browser...');
    await browser.close();
  }
}

// Run the script
takeScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
