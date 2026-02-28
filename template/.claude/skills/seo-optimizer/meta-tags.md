# Meta Tags Reference

## Required Meta Tags

These must be in the wasp config file (`main.wasp` or `main.wasp.ts`) under `app.head`:

```html
<!-- Basic -->
<meta charset="utf-8" />
<title>Your App Name - Tagline</title>
<meta name="description" content="One or two sentences describing your app. 150-160 characters ideal." />

<!-- Author -->
<meta name="author" content="Your Name or Company" />

<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Your App Name" />
<meta property="og:site_name" content="Your App Name" />
<meta property="og:url" content="https://yourdomain.com" />
<meta property="og:description" content="Same as meta description or slightly different for social." />
<meta property="og:image" content="https://yourdomain.com/og-image.png" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yourdomain.com/og-image.png" />
```

## Open Graph Image Requirements

- **Dimensions:** 1200 x 630 pixels (recommended)
- **Format:** PNG, JPG, or WebP
- **File size:** Under 1MB
- **Location:** `app/public/` directory
- **URL:** Must be absolute URL in production

## Placeholder Detection

Watch for these common placeholder values in Open SaaS:

| Placeholder | Replace With |
|-------------|--------------|
| `"My Open SaaS App"` | Your actual app name |
| `"Open SaaS"` | Your actual app name |
| `"your-saas-app.com"` | Your production domain |
| `"Your (App) Name"` | Your name or company |
| `"me@example.com"` | Your actual email |
| `"/public-banner.webp"` | Your custom OG image path |
app MyApp {
  wasp: { version: "^0.15.0" },
  title: "Acme SaaS - Project Management Made Simple",
  head: [
    "<meta charset='utf-8' />",
    "<meta name='viewport' content='width=device-width, initial-scale=1' />",
    "<meta name='description' content='Acme SaaS helps teams manage projects effortlessly. Track tasks, collaborate in real-time, and ship faster.' />",
    "<meta name='author' content='Acme Inc' />",

    "<meta property='og:type' content='website' />",
    "<meta property='og:title' content='Acme SaaS - Project Management Made Simple' />",
    "<meta property='og:site_name' content='Acme SaaS' />",
    "<meta property='og:url' content='https://acmesaas.com' />",
    "<meta property='og:description' content='Help teams manage projects effortlessly. Track tasks, collaborate, ship faster.' />",
    "<meta property='og:image' content='https://acmesaas.com/og-banner.png' />",

    "<meta name='twitter:card' content='summary_large_image' />",
    "<meta name='twitter:image' content='https://acmesaas.com/og-banner.png' />",

    "<link rel='icon' type='image/x-icon' href='/favicon.ico' />"
  ],
  // ...
}
```

## Testing Tools

After making changes, verify with:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [OpenGraph.xyz](https://www.opengraph.xyz/)
