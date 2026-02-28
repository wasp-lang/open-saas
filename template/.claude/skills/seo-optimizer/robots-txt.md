# robots.txt Template

## Location

Create at: `app/public/robots.txt`

This file tells search engine crawlers which pages to index and which to ignore.

## Standard Template for SaaS Apps

```txt
# robots.txt for SaaS Application

User-agent: *
Allow: /

# Disallow authenticated app routes
Disallow: /demo-app
Disallow: /account
Disallow: /admin
Disallow: /checkout

# Disallow API routes (if exposed)
Disallow: /api/
Disallow: /operations/

# Sitemap (if you have one)
Sitemap: https://yourdomain.com/sitemap.xml
```

## What to Allow

**Allow crawling:**
- `/` - Landing page
- `/pricing` - Pricing page
- `/login` - Login page (for SEO, users searching "yourapp login")
- `/signup` - Signup page
- Blog pages (if on same domain)

## What to Disallow

**Block crawling:**
- `/demo-app` - Authenticated app pages
- `/account` - User account pages
- `/admin` - Admin dashboard
- `/checkout` - Payment/checkout flows
- `/api/` - API endpoints
- `/operations/` - Wasp operations

## Sitemap Reference

If your app has a sitemap (Astro blog generates one automatically):
```txt
Sitemap: https://yourdomain.com/sitemap.xml
```

For the main Wasp app, you may need to generate a sitemap separately or use a service.

## Important Notes

1. **robots.txt is public** - Don't use it to hide sensitive URLs (they can still be discovered)
2. **Not a security measure** - It's a suggestion to crawlers, not enforcement
3. **Crawl-delay** - Avoid unless you have server capacity issues
4. **Test changes** - Use [Google's robots.txt Tester](https://support.google.com/webmasters/answer/6062598)

## Common Mistakes

**Too restrictive:**
```txt
# BAD - blocks everything
User-agent: *
Disallow: /
```

**Missing trailing slashes:**
```txt
# This blocks /admin but not /administrator
Disallow: /admin

# Use this to block all paths starting with /admin
Disallow: /admin
```

## After Creating

1. Verify file is accessible at `https://yourdomain.com/robots.txt`
2. Check in [Google Search Console](https://search.google.com/search-console) for crawl errors
3. Submit sitemap if you have one
