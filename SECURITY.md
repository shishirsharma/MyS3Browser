# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

We take the security of My S3 Browser seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **shishirsharma.in@gmail.com**

Include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- You will receive a response within 48 hours acknowledging your report
- We will investigate and validate the vulnerability
- We will work on a fix and keep you informed of progress
- Once the vulnerability is fixed, we will publish a security advisory
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Considerations

### Credential Storage

- AWS credentials are stored in Chrome's local storage API
- Credentials never leave your browser
- No data is transmitted to third-party servers
- All S3 operations are direct from browser to AWS

### Permissions

This extension requests the following permissions:
- `storage`: To securely store AWS credentials locally
- `tabs`: To manage extension popup behavior
- `https://*.amazonaws.com/*`: To communicate with AWS S3 services

### Best Practices

- Never share your AWS Access Key ID and Secret Access Key
- Use IAM roles with minimal required permissions for S3 operations
- Regularly rotate your AWS credentials
- Consider using AWS temporary credentials (STS) when possible
