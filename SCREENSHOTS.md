# Taking Screenshots for Chrome Web Store

This guide explains how to capture screenshots for the Chrome Web Store listing.

## Automated Method (Puppeteer)

The easiest way to capture screenshots:

```bash
# Make sure the extension is built first
npm run build

# Then capture screenshots
npm run screenshots
```

This will:
1. ✅ Launch Chrome with the extension loaded
2. ✅ Automatically capture key screens:
   - Main browser view
   - Help modal - Features tab
   - Help modal - Getting Started tab
3. ✅ Save images to `/screenshots` folder

### Requirements
- Chrome installed
- Puppeteer dependency (included in `package.json`)

### Output
Screenshots will be saved as:
- `1-main-browser.png`
- `2-help-features.png`
- `3-help-getting-started.png`

---

## Manual Method (If Puppeteer fails)

If the automated script doesn't work, you can capture manually:

### Steps:

1. **Load the extension**
   ```bash
   npm run build
   ```
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `/dist` folder

2. **Open the extension popup**
   - Click the extension icon in Chrome
   - It opens the file browser

3. **Take screenshots using:**
   - **Windows**: `Win + Shift + S` (Snipping Tool)
   - **Mac**: `Cmd + Shift + 4` (Screenshot)
   - **Linux**: `Print` key or `Shift + Print`

4. **Save to `/screenshots` folder**
   ```
   screenshots/
   ├── 1-main-browser.png
   ├── 2-help-features.png
   └── 3-help-getting-started.png
   ```

---

## What to Screenshot

### Screenshot 1: Main Browser View
- Shows the file list with folders and files
- Displays the new action buttons:
  - 📥 Download
  - ✏️ Rename/Move
  - 🔗 Copy Link
  - 🗑️ Delete
- **Best case**: Shows at least one file with visible action buttons

### Screenshot 2: Help Modal - Features
- Click **?** (Help) button in top right
- Click **Features** tab
- Shows all available features including new File Operations

### Screenshot 3: Help Modal - Getting Started
- Click **?** (Help) button in top right
- Click **Getting Started** tab
- Shows how to use file action buttons

---

## Optimizing for Chrome Web Store

### Required Sizes:
- **Recommended**: 1280x800 (landscape)
- **Alternative**: 640x400 (landscape)

### Optimization:
1. Capture at 1280x800
2. If too large, resize to 640x400
3. Compress PNG using:
   ```bash
   # Using ImageMagick
   convert input.png -quality 85 output.png

   # Or using online tools like TinyPNG
   ```

### Upload Order:
The Chrome Web Store displays screenshots in this order, so arrange them strategically:
1. Main feature (file browser)
2. Secondary feature (help/features)
3. Tertiary feature (getting started)

---

## Troubleshooting

### Script hangs or times out
- Close all Chrome windows
- Run: `npm run screenshots` again
- Or use the manual method

### Extension doesn't load
- Ensure `npm run build` completed successfully
- Check that `/dist` folder exists
- Verify `dist/manifest.json` exists

### Screenshots are blank/white
- Wait a moment for content to load
- Extension UI loads asynchronously
- The script waits 2 seconds per screen

### Can't find extension in chrome://extensions
- Make sure you ran `npm run build`
- The extension is in `/dist` not `/src`
- Reload the page with `F5`

---

## Tips

- ✅ Show files with clear names (not placeholder text)
- ✅ Highlight new features (Rename, Copy, Share buttons)
- ✅ Use consistent viewport size (1280x800)
- ✅ Clean background (remove any sensitive data)
- ❌ Don't include real credentials or sensitive filenames

---

## Chrome Web Store Listing

Once you have screenshots:
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Edit your extension listing
3. Upload screenshots under "Additional images"
4. Size: 1280x800 or 640x400
5. Recommended: 3-5 screenshots

---

For more info, see:
- [Chrome Web Store Developer Guide](https://developer.chrome.com/docs/webstore/)
- [Screenshot Requirements](https://developer.chrome.com/docs/webstore/required-asserts/)
