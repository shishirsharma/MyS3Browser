# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-01-XX

### Changed
- Complete rebuild from Angular 4 to Vue 3 with Composition API
- Migrated from Chrome Extension Manifest V2 to V3
- Updated from AWS SDK v2 to v3 (modular packages)
- Upgraded TypeScript from 2.3 to 5.3
- Migrated build system from Angular CLI to Vite 5
- Updated UI from Bootstrap 4 to Bootstrap 5
- Replaced Angular services with Pinia state management
- Implemented service worker for Manifest V3 background functionality
- Added Vue Router 4 for navigation

### Added
- TypeScript strict mode support
- Modern development workflow with Vite hot module replacement
- Comprehensive documentation (CONTRIBUTING.md, TESTING.md, VERIFICATION.md)
- GitHub Pages documentation site

### Security
- Updated all dependencies to latest secure versions
- Reduced vulnerabilities from 182 to 34

## [0.1.x] - Legacy

Previous versions built with Angular 4 and Manifest V2.

[0.2.0]: https://github.com/shishirsharma/MyS3Browser/releases/tag/v0.2.0
