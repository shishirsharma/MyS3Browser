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

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXTENSION_PATH = path.resolve(__dirname, '../dist');
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to replace deprecated waitForTimeout
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to read AWS credentials from .aws/credentials file
async function readCredentials() {
  const credentialsPath = path.resolve(__dirname, '../.aws/credentials');
  try {
    if (!fs.existsSync(credentialsPath)) {
      console.log('⚠️  No .aws/credentials file found');
      return null;
    }

    const content = fs.readFileSync(credentialsPath, 'utf-8');
    const credentials = {};

    // Parse INI format
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('[')) continue;

      const [key, value] = trimmed.split('=').map(s => s.trim());
      if (key && value) {
        credentials[key] = value;
      }
    }

    if (credentials.aws_access_key_id && credentials.aws_secret_access_key) {
      console.log('✅ Loaded credentials from .aws/credentials');
      return credentials;
    }
  } catch (e) {
    console.log('⚠️  Could not read credentials:', e.message);
  }
  return null;
}

async function findExtensionId(page) {
  try {
    await page.goto('chrome://extensions/', { waitUntil: 'networkidle2' });
    await delay(1000);

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
  console.log('   ✓ Viewport size: 1280x1200\n');

  let browser;
  let isExistingBrowser = false;

  // Try to connect to existing Chrome instance first
  console.log('⏳ Attempting to connect to existing Chrome instance...');
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/...',
      timeout: 2000,
    }).catch(() => null);

    if (!browser) {
      // Try alternative endpoint format
      const response = await fetch('http://127.0.0.1:9222/json/version', { timeout: 2000 }).catch(() => null);
      if (response) {
        const data = await response.json();
        browser = await puppeteer.connect({
          browserWSEndpoint: data.webSocketDebuggerUrl,
          timeout: 2000,
        }).catch(() => null);
      }
    }

    if (browser) {
      console.log('✅ Connected to existing Chrome instance!\n');
      isExistingBrowser = true;
    }
  } catch (e) {
    console.log('⚠️  Could not connect to existing instance, launching new one...\n');
  }

  // Launch new Chrome instance if no existing connection
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--load-extension=${EXTENSION_PATH}`,
        `--disable-extensions-except=${EXTENSION_PATH}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--remote-debugging-port=9222',
      ],
      defaultViewport: null,
    });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1200 });

    console.log('⏳ Waiting for Chrome to load extension...');
    await delay(3000);

    // Find extension ID - check for command line argument first
    let extensionId = process.argv[2];

    if (!extensionId) {
      console.log('⏳ Auto-detecting extension ID...');

      // Try multiple methods to find the extension ID

      // Method 1: Find through service worker pages
      const pages = await browser.pages();
      for (const p of pages) {
        const url = p.url();
        if (url.includes('chrome-extension://') && !url.includes('chrome://')) {
          extensionId = url.match(/chrome-extension:\/\/([^\/]+)\//)?.[1];
          if (extensionId) {
            console.log('✅ Found extension ID from service worker');
            break;
          }
        }
      }

      // Method 2: Parse chrome://extensions/ page
      if (!extensionId) {
        const extPage = await browser.newPage();
        try {
          await extPage.goto('chrome://extensions/', { waitUntil: 'domcontentloaded' });
          await delay(1000);

          extensionId = await extPage.evaluate(() => {
            // Find the extension element
            const items = document.querySelectorAll('cr-view-manager div[id^="extension-"]');
            if (items.length > 0) {
              const id = items[0].id.replace('extension-', '');
              return id;
            }
            return null;
          });

          if (extensionId) {
            console.log('✅ Found extension ID from chrome://extensions/');
          }
        } catch (e) {
          console.log('⚠️  Could not query chrome://extensions/');
        } finally {
          await extPage.close();
        }
      }
    } else {
      console.log(`✅ Using provided extension ID: ${extensionId}`);
    }

    if (!extensionId) {
      console.error('\n❌ Error: Could not auto-detect extension ID');
      console.log('\n💡 To provide the extension ID manually:');
      console.log('   1. Go to chrome://extensions/');
      console.log('   2. Find your extension ID (e.g., "abc123def456...")');
      console.log('   3. Run: npm run screenshots -- <EXTENSION_ID>');
      console.log('\n   Example: npm run screenshots -- gcaipbplcgiomkpkhimfbdbjgofcbkpf');
      throw new Error('Extension ID required');
    }

    console.log(`✅ Found extension ID: ${extensionId}\n`);

    const extensionUrl = `chrome-extension://${extensionId}/src/app/index.html`;

    console.log('📍 Navigating to extension popup...');
    await page.goto(extensionUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(2000);

    // Try to load credentials and add them to extension
    const credentials = await readCredentials();
    if (credentials) {
      console.log('🔐 Adding credentials to extension...');
      try {
        // Click the credential dropdown to add new credential
        const addBtn = await page.$('button[title*="credential"], button:has-text("Add"), .btn-primary');
        if (addBtn) {
          await addBtn.click();
          await delay(500);

          // Fill in the form
          const accessKeyInput = await page.$('input[placeholder*="Access"], input[placeholder*="access"]');
          const secretKeyInput = await page.$('input[placeholder*="Secret"], input[placeholder*="secret"]');
          const regionInput = await page.$('input[placeholder*="Region"], input[placeholder*="region"]');
          const bucketInput = await page.$('input[placeholder*="Bucket"], input[placeholder*="bucket"]');

          if (accessKeyInput) {
            await accessKeyInput.type(credentials.aws_access_key_id, { delay: 50 });
          }
          if (secretKeyInput) {
            await secretKeyInput.type(credentials.aws_secret_access_key, { delay: 50 });
          }
          if (regionInput && credentials.region) {
            await regionInput.type(credentials.region, { delay: 50 });
          }
          if (bucketInput && credentials.bucket) {
            await bucketInput.type(credentials.bucket, { delay: 50 });
          }

          // Save credentials
          const saveBtn = await page.$('button:has-text("Save"), button.btn-primary');
          if (saveBtn) {
            await saveBtn.click();
            await delay(2000);
            console.log('✅ Credentials added successfully');
          }
        }
      } catch (e) {
        console.log('⚠️  Could not auto-add credentials:', e.message);
      }
    }

    await delay(2000);

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
        await delay(1000);

        // Click on Features tab - find by content using evaluateHandle
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('.nav-link'));
          const featuresBtn = buttons.find(btn => btn.textContent.includes('Features'));
          if (featuresBtn) featuresBtn.click();
        });
        await delay(500);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, '2-help-features.png'),
          fullPage: true,
        });

        // Close modal
        const closeBtn = await page.$('.btn-close');
        if (closeBtn) await closeBtn.click();
        await delay(500);
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
        await delay(1000);

        // Click on Getting Started tab
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('.nav-link'));
          const gettingStartedBtn = buttons.find(btn => btn.textContent.includes('Getting Started'));
          if (gettingStartedBtn) gettingStartedBtn.click();
        });
        await delay(500);

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
    if (isExistingBrowser) {
      console.log('\n✅ Keeping existing Chrome instance open for you to use.');
      console.log('   (Press Ctrl+C in the launch window to close Chrome)\n');
    } else {
      console.log('\n🔌 Closing browser...');
      await browser.close();
    }
  }
}

// Run the script
try {
  await takeScreenshots();
} catch (err) {
  console.error('Fatal error:', err);
  process.exit(1);
}
