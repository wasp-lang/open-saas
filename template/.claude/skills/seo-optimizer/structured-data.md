# Structured Data (JSON-LD) Templates

Structured data helps search engines understand your content and can enable rich results in search.

## How to Add JSON-LD to Open SaaS

Add as a `<script>` tag in the main wasp config file (`main.wasp` or `main.wasp.ts`) `app.head`:

```html
<script type='application/ld+json'>{ ... }</script>
```

**Note:** JSON must be on a single line or escaped properly in the wasp string.

## Organization Schema

Use this for your company/app info. Helps with knowledge panel in search results.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your App Name",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "description": "Brief description of your company/app",
  "sameAs": [
    "https://twitter.com/yourhandle",
    "https://github.com/yourorg",
    "https://linkedin.com/company/yourcompany"
  ]
}
```

## WebSite Schema

Enables sitelinks search box in Google results.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your App Name",
  "url": "https://yourdomain.com"
}
```

## FAQPage Schema

If your landing page has an FAQ section, this can show FAQ rich results in Google.

**Template:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Your App?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your App is a SaaS platform that..."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer plans starting at..."
      }
    }
  ]
}
```

**Generating from contentSections.tsx:**

Read the FAQs array from [`../../../app/src/landing-page/contentSections.tsx`](../../../app/src/landing-page/contentSections.tsx) and generate the schema:

```typescript
// contentSections.tsx has:
export const faqs = [
  { id: 1, question: '...', answer: '...' },
  // ...
]
```

Transform to JSON-LD `mainEntity` array.

## SoftwareApplication Schema

Good for SaaS products, can show ratings and pricing in search.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Your App Name",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

## Testing Structured Data

After adding, verify with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

## Common Issues

**JSON parsing errors:**
- Escape quotes properly: `\"` not `"`
- No trailing commas in arrays/objects
- Must be valid JSON on single line in wasp string

**Schema not detected:**
- Ensure `type="application/ld+json"` is set
- Check JSON is valid
- Wait for Google to recrawl (can take days)
