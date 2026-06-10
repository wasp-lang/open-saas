# Changelog

All notable changes to the Open SaaS `template/app` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [wasp-v0.19-template] - 2025-11-24

This release adds Polar.sh as a new payment provider, significantly improves the Stripe integration, and includes UI and file upload improvements.

### Added

- **Polar.sh payment integration** ([#461](https://github.com/wasp-lang/open-saas/pull/461)) - Added support for [Polar.sh](https://polar.sh) as a new payment provider alongside Stripe and Lemon Squeezy
- **Enhanced account page** ([#506](https://github.com/wasp-lang/open-saas/pull/506)) - Always display subscription plan and credits information; the "Manage payment details" button is now always visible when available, not just during active subscriptions

### Changed

- **Stripe payment improvements** ([#550](https://github.com/wasp-lang/open-saas/pull/550), [#505](https://github.com/wasp-lang/open-saas/pull/505)) - Simplified webhook handling by generating Stripe invoices for one-time payments (allowing both one-time and subscription payments to be handled under the single `invoice.paid` event); customer portal now generated per-customer via API instead of a shared public link; removed unnecessary payload parsing schema
- **Stripe variable naming and logic cleanup** ([#570](https://github.com/wasp-lang/open-saas/pull/570)) - Removed redundant `stripe` prefix from variables inside Stripe-specific files; streamlined status mapping logic; unknown errors now return HTTP 500
- **Abstracted common payment logic** ([#569](https://github.com/wasp-lang/open-saas/pull/569)) - Extracted shared payment processing logic from Stripe into reusable functions, making it easier to support multiple providers uniformly; moved `src/payment/stripe/user.ts` to `src/payment/user.ts`
- **Moved shadcn UI components to client folder** ([#551](https://github.com/wasp-lang/open-saas/pull/551)) - Shadcn `components/ui` and `lib/utils` moved from `src/` to `src/client/` for better project organisation
- **Refactored toast notifications** ([#472](https://github.com/wasp-lang/open-saas/pull/472)) - Replaced `react-hot-toast` with a custom toast system built on shadcn's toast component
- **Improved file upload system** ([#472](https://github.com/wasp-lang/open-saas/pull/472)) - File uploads now use a two-step process (generate S3 URL, then save to DB); added file deletion support with a confirmation dialog and S3 cleanup
- **Simplified checkout result page** ([#507](https://github.com/wasp-lang/open-saas/pull/507)) - Renamed `CheckoutPage` to `CheckoutResultPage` and simplified its content
- **Removed Satoshi font** ([#526](https://github.com/wasp-lang/open-saas/pull/526)) - Removed Satoshi font files that were unused in the template
- **Replaced banner images with SVG** ([#521](https://github.com/wasp-lang/open-saas/pull/521)) - Converted landing page banners from PNG to SVG, reducing their combined size from ~6 MB to ~236 KB
- **Optimized static assets** ([#518](https://github.com/wasp-lang/open-saas/pull/518)) - Ran lossless compression on all template images, achieving ~28% overall size reduction

### Contributors

Special thanks to all contributors who made this release possible:

- @FranjoMindek
- @cprecioso
- @infomiho
- @vincanger
- @sodic
- @Genyus
- @Martinsos

---

## [wasp-v0.18-template] - 2025-09-12

Initial tagged release based on Wasp v0.18.0.
