#!/usr/bin/env node

/**
 * Launch Puppeteer Chrome with the extension loaded
 * Use this to get the extension ID for screenshot capture
 *
 * Usage:
 *   npm run launch-extension
 *   Then run: npm run screenshots -- <EXTENSION_ID>
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.resolve(__dirname, '../dist');

async function launchExtension() {
  console.log('🚀 Launching Chrome with extension...\n');

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

  console.log('✅ Chrome is now open!\n');
  console.log('📋 To get the extension ID:\n');
  console.log('   1️⃣  In the Chrome window, go to: chrome://extensions/');
  console.log('   2️⃣  Find "My S3 Browser" extension');
  console.log('   3️⃣  Copy the extension ID (32 character code)\n');
  console.log('📸 Then capture screenshots:\n');
  console.log('   npm run screenshots -- <EXTENSION_ID>\n');
  console.log('   Example: npm run screenshots -- omcpfahpedkpnpkilgdihjefahjdjojb\n');
  console.log('⏳ Waiting... (Press Ctrl+C when done)\n');

  // Keep browser open
  await new Promise(() => {});
}

launchExtension().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
