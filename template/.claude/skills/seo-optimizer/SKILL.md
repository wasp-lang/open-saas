---
name: seo-optimizer
description: interactive SEO audit and fixes for your Open SaaS app.
---

# seo-optimizer

Interactive SEO audit for your Open SaaS app. Finds issues and offers fixes one at a time.

## Before Starting

1. Read the wasp config file (`main.wasp` or `main.wasp.ts`) to check current meta tag configuration
2. If placeholders detected, ask user for their app name and production domain

## Audit Sequence

Run these checks in order. For each issue found: explain → ask user for input → generate fix → apply → move to next.

### Step 1: Critical Meta Tags

Check the wasp config file `app.head` for placeholder values:

| Placeholder | Field |
|-------------|-------|
| "My Open SaaS App" or contains "Open SaaS" | title, og:title |
| "your-saas-app.com" | og:url |
| "Your (App) Name" | author |
| "me@example.com" | author email |
| Generic descriptions | description, og:description |

For each placeholder found:
1. Ask user: "What should [field] be?"
2. Generate the corrected meta tag
3. Apply the fix to main.wasp
4. Move to next issue

### Step 2: Open Graph Validation

Verify Open Graph tags are complete and consistent:

**Required OG tags:**
- `og:type` (should be "website")
- `og:title` (should match app title)
- `og:description` (should match meta description)
- `og:url` (should be production domain)
- `og:image` (should point to actual banner image)
- `og:site_name`

**Twitter Card tags:**
- `twitter:card` (summary_large_image recommended)
- `twitter:image`

If any are missing or inconsistent → offer to fix.

### Step 3: Technical SEO

Check [`../../../app/public/`](../../../app/public/) for:

**robots.txt:**
- If missing → offer to create using [robots-txt.md](./robots-txt.md) template
- If exists → verify it allows search engine crawling

**favicon:**
- Verify favicon.ico exists
- If missing → warn user

### Step 4: Structured Data (Optional)

Ask: "Would you like to add structured data (JSON-LD) for better search results?"

If yes, offer to generate:
1. **Organization schema** - Company/app info
2. **FAQPage schema** - If FAQ section exists (reads from contentSections.tsx)

See [structured-data.md](./structured-data.md) for templates.

## File Paths

| File | What to Check |
|------|---------------|
| the wasp config file (`main.wasp` or `main.wasp.ts`) | `app.head` meta tags |
| `app/public/` | robots.txt, favicon.ico |
| `src/landing-page/contentSections.tsx` | FAQ data for schema generation |

## Completion

After all fixes applied, summarize:
- What was fixed
- What user should verify manually (e.g., OG image looks correct)
- Recommend testing with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Documentation

Fetch guide URLs directly:
- https://docs.opensaas.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
