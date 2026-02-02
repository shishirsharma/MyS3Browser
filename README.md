# My S3 Browser

A modern Chrome extension for browsing and managing Amazon S3 buckets, built with Vue 3, TypeScript, and AWS SDK v3.

## Features

- Browse S3 buckets and folders
- Upload files to S3
- Download files with pre-signed URLs
- Create folders
- Delete files and folders
- Search within current folder
- Pagination for large folders
- Multiple AWS credential profiles
- Manifest V3 compliant

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **AWS SDK**: v3 (modular)
- **UI**: Bootstrap 5 + Bootstrap Icons
- **State**: Pinia
- **Manifest**: V3

## Development

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start Vite in watch mode. The extension will be built to the `dist/` folder.

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` folder

The extension will automatically reload when you make changes during development.

### Build for Production

```bash
npm run build
```

The production-ready extension will be in the `dist/` folder.

## Usage

1. Click the extension icon to open My S3 Browser
2. Add your AWS credentials:
   - Click the credentials dropdown
   - Select "Add New Credential"
   - Enter your Access Key ID, Secret Access Key, and Region
3. Select a bucket from the bucket dropdown
4. Browse, upload, download, and manage your S3 files

## Security

- Credentials are stored securely in Chrome's local storage
- All S3 operations go directly from your browser to AWS
- No data is sent to third-party servers

## Migration from Angular 4

This is a complete rebuild from Angular 4 to Vue 3:
- Migrated from Manifest V2 to V3 (Chrome requirement)
- Updated from AWS SDK v2 to v3
- Modern TypeScript and build tooling
- Improved UI with Bootstrap 5

## License

MIT

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/shishirsharma/MyS3Browser).
