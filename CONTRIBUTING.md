# Contributing to My S3 Browser

Thank you for your interest in contributing to My S3 Browser! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code samples)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (Chrome version, OS, extension version)

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating issues.

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain why this feature would be useful** to most users
- **Provide examples** of how it would work

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Pull Requests

1. **Fork the repository** and create your branch from `master`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser
- Git

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MyS3Browser.git
cd MyS3Browser

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── manifest.json              # MV3 manifest
├── background/                # Service worker
├── app/                       # Vue 3 application
│   ├── components/           # UI components
│   ├── modals/              # Modal dialogs
│   ├── views/               # Main views
│   ├── stores/              # Pinia stores
│   ├── services/            # AWS S3 service
│   └── router/              # Vue Router
├── types/                    # TypeScript types
└── assets/                   # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types/interfaces
- Avoid `any` type when possible

### Vue 3

- Use Composition API with `<script setup>`
- Use `ref` and `reactive` for state
- Prefer `computed` over methods for derived state
- Use `defineProps` and `defineEmits` for component communication

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use meaningful variable names
- Add comments for complex logic

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add file preview feature`
- `fix: resolve upload issue with large files`
- `docs: update README with new features`
- `style: format code with prettier`
- `refactor: simplify S3 service logic`
- `test: add tests for upload modal`
- `chore: update dependencies`

## Testing

### Manual Testing

1. Load the extension in Chrome (`chrome://extensions`)
2. Test all modified features
3. Check browser console for errors
4. Test with different AWS regions and bucket configurations

### Test Checklist

- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] UI is responsive and looks good
- [ ] Works with multiple credentials
- [ ] Error handling works properly

## Documentation

- Update README.md for user-facing changes
- Update TESTING.md for testing procedures
- Add JSDoc comments for complex functions
- Update CHANGELOG.md with your changes

## Review Process

1. All pull requests require review
2. Address review comments promptly
3. Keep the PR focused on a single issue/feature
4. Ensure CI checks pass (if applicable)
5. Squash commits before merging (if requested)

## Questions?

- Open an issue for questions
- Tag it with `question` label
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in the project. Thank you for helping make My S3 Browser better!
