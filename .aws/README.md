# AWS Credentials for Testing/Screenshots

This directory stores local AWS credentials for testing the extension and capturing screenshots.

**⚠️ IMPORTANT: This directory is NEVER committed to git**

## Setup

1. Copy the example file:
```bash
cp credentials.example credentials
```

2. Edit `credentials` and add your test AWS credentials:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = us-east-1
bucket = your-test-bucket
```

3. Use for screenshots:
```bash
npm run launch-extension
npm run screenshots -- <EXTENSION_ID>
```

## Format

The credentials file uses INI format similar to AWS CLI:
- `aws_access_key_id` - Your AWS access key
- `aws_secret_access_key` - Your AWS secret key
- `region` - AWS region (default: us-east-1)
- `bucket` - S3 bucket to use for testing

## Security

✅ **Safe** - credentials file is in .gitignore and never committed
✅ **Local only** - only stored on your machine
✅ **Test credentials** - use test/throwaway AWS credentials

## Never commit this file!

The `.gitignore` prevents accidental commits, but be extra careful:
- Use test AWS credentials only
- Rotate credentials regularly
- Never share the `credentials` file
