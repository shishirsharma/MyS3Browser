---
layout: default
title: Privacy Policy
---

# Privacy Policy

*Last updated: February 4, 2026*

This privacy policy describes how My S3 Browser handles your data.

## What We Collect

My S3 Browser stores the following data locally on your device using Chrome's built-in `storage` API:

- **AWS Access Key ID** — entered by you when configuring a credential profile.
- **AWS Secret Access Key** — entered by you when configuring a credential profile.
- **AWS Region** — the region you select for each credential profile.
- **Credential profile names** — labels you assign to each set of credentials.

No other data is collected.

## How Your Data Is Used

Your stored credentials are used solely to make API requests directly from your browser to Amazon Web Services (AWS). When you browse buckets, upload files, or download files, your browser communicates with AWS directly using the credentials you provided.

## What We Do Not Do

- We do not transmit your credentials or any other data to our servers or any third-party servers.
- We do not log, track, or analyze your S3 activity.
- We do not share any data with third parties.
- We do not use cookies or any tracking mechanisms.

## Data Storage

All data is stored exclusively in Chrome's `chrome.storage.local` API on your local machine. This storage is scoped to the extension and is not accessible to websites or other extensions. You can clear this data at any time by removing your credential profiles from within the extension, or by clearing your Chrome extension data in `chrome://settings`.

## Changes to This Policy

If this privacy policy is updated, the new version will be published here. Material changes will also be noted in the extension's release notes.

## Contact

If you have questions about this privacy policy, open an issue at [github.com/shishirsharma/MyS3Browser/issues](https://github.com/shishirsharma/MyS3Browser/issues).
