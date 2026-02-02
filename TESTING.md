# Testing My S3 Browser in Chrome

This guide walks you through loading and testing your S3 Browser Chrome extension.

## Prerequisites

- Chrome browser installed
- Extension built successfully (run `npm run build` if not already done)
- AWS credentials (Access Key ID and Secret Access Key)

---

## Step 1: Open Chrome Extensions Page

1. Open Chrome browser
2. Type in the address bar: `chrome://extensions`
3. Press Enter

---

## Step 2: Enable Developer Mode

1. Look for the **"Developer mode"** toggle in the top-right corner
2. Turn it **ON** (it should turn blue)
3. You'll see additional buttons appear: "Load unpacked", "Pack extension", "Update"

---

## Step 3: Load Your Extension

1. Click the **"Load unpacked"** button
2. Navigate to your project folder: `/home/shishir/src/MyS3Browser`
3. Select the **`dist`** folder (⚠️ Important: not the root folder!)
4. Click **"Select"** or **"Open"**

---

## Step 4: Verify Extension Loaded

You should now see "My S3 Browser" in your extensions list with:
- ✅ **Name**: My S3 Browser
- ✅ **Version**: 0.2.0
- ✅ **Icon**: Cloud icon
- ✅ **Status**: Enabled (toggle should be ON)
- ✅ **ID**: A unique extension ID

---

## Step 5: Open the Extension

### Option A: Click the Extension Icon

1. Look for the extension icon in your Chrome toolbar (top-right, near the address bar)
2. If you don't see it, click the **puzzle piece icon** (Extensions menu)
3. Find "My S3 Browser" in the list
4. Click the **pin icon** to pin it to your toolbar (optional but recommended)
5. Click the **My S3 Browser icon** to open the extension

### Option B: Inspect Service Worker (for debugging)

1. Go to `chrome://extensions`
2. Find "My S3 Browser" in the list
3. Click **"service worker"** link (under "Inspect views")
4. This opens the DevTools console for the background service worker

---

## Step 6: First Time Setup - Add AWS Credentials

When you open the extension for the first time:

1. You'll see: **"No Credentials Configured"**
2. Click the **"Add Credential"** button
3. Fill in the credential form:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Name** * | Friendly name for this credential | "My AWS Account" or "Production" |
   | **Access Key ID** * | Your AWS access key | AKIAIOSFODNN7EXAMPLE |
   | **Secret Access Key** * | Your AWS secret key | wJalrXUtnFEMI/K7MDENG/bPxRfiCY... |
   | **Region** * | AWS region | us-east-1, eu-west-1, etc. |
   | **Default Bucket** | (Optional) Auto-select this bucket | my-bucket-name |

4. Click **"Save"**
5. Your credential will be saved securely in Chrome's local storage

---

## Step 7: Browse Your S3 Buckets

After saving credentials:

1. **Buckets should load automatically**
   - Check the buckets dropdown in the navbar (bucket icon)
   - You should see a list of your S3 buckets

2. **Select a bucket**
   - Click the buckets dropdown
   - Select a bucket from the list
   - Files and folders will load

3. **Navigate the interface**
   - Use breadcrumbs at the top to see your current location
   - Click folders to navigate into them
   - Click breadcrumb segments to go back

---

## Step 8: Test Core Features

### ✅ Upload a File

1. Click the **upload button** (⬆️ icon) in the navbar
2. Click **"Select File"** and choose a file from your computer
3. (Optional) Enter a custom filename
4. Click **"Upload"**
5. Wait for the upload to complete
6. The file should appear in the current folder

### ✅ Create a Folder

1. Click the **create folder button** (📁+ icon) in the navbar
2. Enter a folder name (e.g., "test-folder")
3. Click **"Create"**
4. The folder should appear in the list

### ✅ Download a File

1. Find a file in the list
2. Click the **download button** (⬇️ icon) next to the file
3. The file should download to your computer's Downloads folder

### ✅ Delete a File

1. Find a file in the list
2. Click the **delete button** (🗑️ icon) next to the file
3. Confirm the deletion in the popup
4. The file should disappear from the list

### ✅ Delete a Folder

1. Find a folder in the list
2. Click the **delete button** (🗑️ icon) next to the folder
3. Confirm the deletion
4. The folder should disappear

### ✅ Search Files

1. Use the **search box** in the navbar
2. Type a filename or part of a filename
3. The list should filter to show only matching items
4. Clear the search to see all items again

### ✅ Pagination

1. If you have more than 100 items in a folder:
   - **Next** button appears at the bottom
   - Click to see the next page
   - **Previous** button lets you go back

### ✅ Multiple Credentials

1. Click the **credentials dropdown** (🔑 icon) in the navbar
2. Click **"Add New Credential"**
3. Add another AWS account
4. Switch between credentials using the dropdown
5. Buckets should reload when switching

### ✅ Help Modal

1. Click the **help button** (❓ icon) in the navbar
2. The help modal should open
3. Review features and links
4. Close the modal

---

## Complete Test Checklist

Use this checklist to ensure everything works:

- [ ] Extension loads in Chrome without errors
- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens new tab with the app
- [ ] Can add AWS credentials
- [ ] Credentials dropdown shows saved credentials
- [ ] Buckets dropdown shows S3 buckets
- [ ] Can select a bucket
- [ ] Files and folders display correctly
- [ ] Can navigate into folders
- [ ] Breadcrumbs work for navigation
- [ ] Can upload a file
- [ ] Upload progress shows
- [ ] Uploaded file appears in list
- [ ] Can download a file
- [ ] Can delete a file
- [ ] Can create a folder
- [ ] Can delete a folder
- [ ] Search filters files correctly
- [ ] Clear search shows all items
- [ ] Pagination works (if >100 items)
- [ ] Can add multiple credentials
- [ ] Can switch between credentials
- [ ] Help modal opens and displays correctly
- [ ] No errors in browser console (press F12)
- [ ] No errors in service worker console

---

## Troubleshooting

### Extension Won't Load

**Error**: "Manifest file is missing or unreadable"
- **Solution**: Make sure you selected the `dist` folder, not the project root
- Path should be: `/home/shishir/src/MyS3Browser/dist`

**Error**: Extension doesn't appear after loading
- **Solution**: Rebuild the extension
  ```bash
  cd /home/shishir/src/MyS3Browser
  npm run build
  ```
- Then reload: Go to `chrome://extensions` → click the refresh icon on your extension

### Can't See Buckets

**Problem**: Buckets dropdown is empty or shows "No buckets available"

**Possible causes**:
1. **Invalid credentials** → Verify your Access Key ID and Secret Access Key
2. **Wrong region** → Try a different region or use the region where your buckets exist
3. **No S3 permissions** → Check your IAM user has `s3:ListAllMyBuckets` permission
4. **Network issue** → Check your internet connection

**How to debug**:
1. Press **F12** to open browser console
2. Look for error messages (red text)
3. Common errors:
   - `InvalidAccessKeyId` → Wrong access key
   - `SignatureDoesNotMatch` → Wrong secret key
   - `AccessDenied` → No permissions

### Upload Fails

**Problem**: File upload shows error

**Possible causes**:
1. **No write permission** → IAM user needs `s3:PutObject` permission
2. **Bucket policy** → Check bucket policy allows uploads
3. **File too large** → Try a smaller file first
4. **CORS issue** → S3 bucket may need CORS configuration

### Service Worker Issues

**Problem**: Extension icon does nothing when clicked

**Solution**:
1. Go to `chrome://extensions`
2. Find "My S3 Browser"
3. Click **"service worker"** link
4. Check the console for errors
5. Look for messages like:
   - ✅ "My S3 Browser installed" → Good!
   - ❌ Any red errors → Needs fixing

**Service worker inactive**:
1. Click **"Reload"** button on the extension card
2. Try clicking the extension icon again

### Console Errors

**How to check for errors**:

1. **Browser Console** (for app errors):
   - Open the extension in a tab
   - Press **F12** to open DevTools
   - Click **"Console"** tab
   - Look for red errors

2. **Service Worker Console** (for background errors):
   - Go to `chrome://extensions`
   - Click **"service worker"** link under your extension
   - Check the console for errors

**Common errors**:
- `Failed to load resource` → Asset path issue, try rebuilding
- `Cannot read property of undefined` → Code bug, check browser console
- `CORS error` → S3 bucket needs CORS configuration

---

## Development Mode

To make changes and test them:

1. **Start development server**:
   ```bash
   cd /home/shishir/src/MyS3Browser
   npm run dev
   ```

2. **The extension rebuilds automatically** when you save changes

3. **Reload the extension**:
   - Go to `chrome://extensions`
   - Click the refresh icon on "My S3 Browser"
   - Or use keyboard shortcut: Ctrl+R on the extensions page

4. **Refresh the extension tab** (if already open):
   - Press **F5** or **Ctrl+R** in the extension tab

---

## Rebuilding the Extension

If you make changes or encounter issues:

```bash
# Navigate to project directory
cd /home/shishir/src/MyS3Browser

# Clean rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build

# Load the updated extension
# Go to chrome://extensions and click the refresh icon
```

---

## AWS IAM Permissions Required

Your IAM user needs these permissions at minimum:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::*"
      ]
    }
  ]
}
```

**Note**: For production, restrict `Resource` to specific buckets.

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Document any bugs found
2. ✅ Test with real AWS credentials and data
3. ✅ Test with large files (>10MB)
4. ✅ Test with folders containing >100 items
5. ✅ Test error scenarios (invalid credentials, no permissions, etc.)
6. ✅ Prepare for Chrome Web Store submission
7. ✅ Create screenshots and promotional materials
8. ✅ Write detailed extension description

---

## Support

- **GitHub Issues**: https://github.com/shishirsharma/MyS3Browser/issues
- **Documentation**: See README.md and VERIFICATION.md
- **Chrome Extensions**: https://developer.chrome.com/docs/extensions/

---

## Success! 🎉

If you can complete all items in the test checklist, your S3 Browser extension is working correctly and ready for use!

The migration from Angular 4 + Manifest V2 to Vue 3 + Manifest V3 is complete.
