# Changelog

All notable changes to the Open SaaS template will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [wasp-v0.19-template] - 2025-11-13

This release includes major improvements to the Stripe payment integration, UI enhancements, developer experience improvements, and repository optimizations.

### Added

- **GitHub Action for automatic template releases** ([#511](https://github.com/wasp-lang/open-saas/pull/511)) - Automatically uploads compressed template to GitHub releases when tags are created
- **Binary file support in `dope.sh`** ([#525](https://github.com/wasp-lang/open-saas/pull/525)) - Added `*.copy` support for handling binary files in the app_diff
- **Enhanced account page** ([#506](https://github.com/wasp-lang/open-saas/pull/506)) - Always display subscription plan and credits information, improved payment details button visibility
- **Template requirements documentation** ([#528](https://github.com/wasp-lang/open-saas/pull/528)) - Added note about template requirements in README

### Changed

- **Major Stripe payment improvements** ([#550](https://github.com/wasp-lang/open-saas/pull/550), [#505](https://github.com/wasp-lang/open-saas/pull/505)) - Simplified webhook handling by generating invoices for one-time payments, refactored customer portal to use per-customer API generation, removed unnecessary payload parsing schema
- **Upgraded to Wasp v0.18.0** ([#500](https://github.com/wasp-lang/open-saas/pull/500)) - Migrated entire template to use Wasp v0.18.0
- **Refactored toast notifications** ([#472](https://github.com/wasp-lang/open-saas/pull/472)) - Replaced react-hot-toast with custom toast system using shadcn's toast component
- **Improved file upload system** ([#472](https://github.com/wasp-lang/open-saas/pull/472)) - Two-step process with S3 upload URL generation and file deletion support with confirmation dialog
- **Simplified checkout result page** ([#507](https://github.com/wasp-lang/open-saas/pull/507)) - Renamed CheckoutPage to CheckoutResultPage and streamlined the UI
- **Moved `dope.sh` to top level** ([#531](https://github.com/wasp-lang/open-saas/pull/531)) - Relocated dope.sh for broader usage across different apps
- **Removed Satoshi font from template** ([#526](https://github.com/wasp-lang/open-saas/pull/526)) - Removed unused Satoshi fonts, maintained only in opensaas-sh which uses them
- **Converted banners to SVG** ([#521](https://github.com/wasp-lang/open-saas/pull/521)) - Replaced PNG banners with SVG versions, reducing size from 6MB to 236KB (96% reduction)
- **Optimized template assets** ([#518](https://github.com/wasp-lang/open-saas/pull/518)) - Ran lossless optimization on all template images, achieving 28% overall size reduction
- **Updated Product Hunt badges** - Refreshed Product Hunt badges in README

### Fixed

- **E2E test timeouts** ([#537](https://github.com/wasp-lang/open-saas/pull/537)) - Fixed template e2e tests timing out due to dependency issues
- **Empty lines in deletions file** ([#536](https://github.com/wasp-lang/open-saas/pull/536)) - Fixed dope.sh handling of empty lines in deletions file
- **OpenSaas GitHub URL** ([#510](https://github.com/wasp-lang/open-saas/pull/510)) - Corrected GitHub URL in opensaas-sh app

### Developer Experience

- **Added Prettier configuration** ([#508](https://github.com/wasp-lang/open-saas/pull/508), [#509](https://github.com/wasp-lang/open-saas/pull/509)) - Added root prettier configuration and formatted entire codebase for consistency
- **Git ignored `opensaas-sh/app/` directory** ([#513](https://github.com/wasp-lang/open-saas/pull/513)) - Made opensaas-sh/app a separate git repository to improve developer experience
- **Git ignored LLM text files** ([#515](https://github.com/wasp-lang/open-saas/pull/515)) - Moved LLM txt file generation into build command and git ignored generated files
- **Naming consistency** ([#512](https://github.com/wasp-lang/open-saas/pull/512)) - Renamed all "OpenSaas" references to "Open SaaS" for consistency
- **Updated README** - Removed outdated note about ignoring app ([#520](https://github.com/wasp-lang/open-saas/pull/520))

### Contributors

Special thanks to all contributors who made this release possible:

- @FranjoMindek
- @cprecioso
- @infomiho
- @vincanger
- @sodic
- @Martinsos

---

## [wasp-v0.18-template] - 2025-09-12

Initial tagged release with Wasp v0.18.0 support.
