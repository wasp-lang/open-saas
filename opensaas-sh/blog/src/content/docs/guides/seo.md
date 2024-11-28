---
title: SEO
banner:
  content: |
    🆕 Open SaaS is now running on <b><a href='https://wasp-lang.dev'>Wasp v0.15</a></b>! <br/>⚙️<br/>If you're running an older version and would like to upgrade, please follow the <a href="https://wasp-lang.dev/docs/migration-guides/migrate-from-0-14-to-0-15">migration instructions.</a>
---

This guides explains how to improve SEO for of your app

## Landing Page Meta Tags

Wasp gives you the ability to add meta tags to your landing page HTML via the `main.wasp` file's `head` property:

```js {8-11}
app SaaSTemplate {
  wasp: {
    version: "^0.13.0"
  },
  title: "Open SaaS",
  head: [
        "<meta property='og:type' content='website' />",
        "<meta property='og:url' content='https://opensaas.sh' />",
        "<meta property='og:title' content='Open SaaS' />",
        "<meta property='og:description' content='Free, open-source SaaS boilerplate starter for React & NodeJS.' />",
        "<meta property='og:image' content='https://opensaas.sh/public-banner.webp' />",
        //...
  ],
  //...
```

Change the above highlighted meta tags to match your app. Wasp will inject these tags into the HTML of your `index.html` file, which is the Landing Page (`app/src/client/landing-page/LandingPage.tsx`), in this case.

## Other Pages Meta Tags

React Helmet Async is a React library that allows you to modify `<head>` directly from your React component, in a dynamic fashion. Therefore, it can also be used to set meta tags.

:::note
Since Wasp is SPA, React Helmet Async updates `<head>` via client-side JS after initial serve, meaning that web crawlers that don't evaluate JS won't pick up the modifications to the `<head>` you did.
:::


The first step is to install it:

```bash
# Using npm
npm install react-helmet-async
```

Next, you need to wrap your main App component (`app/src/client/App.tsx`) with `HelmetProvider`:

```jsx 
//Add the react-helmet-async import
import { HelmetProvider } from 'react-helmet-async';

//Wrap the main App component
export default function App() {
  return (
    <HelmetProvider>
      <>
        <div className='min-h-screen dark:text-white dark:bg-boxdark-2'>
          {isAdminDashboard ? (
            <Outlet />
          ) : (
              {shouldDisplayAppNavBar && <AppNavBar />}
              <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
                <Outlet />
              </div>
          )}
        </div>
        <CookieConsentBanner />
      </>
    </HelmetProvider>
  );
}
```

Now, you can set page-specific meta tags  in your React components.

```jsx {6-33)
//...
import { Helmet } from 'react-helmet-async';

export function MyCustomPage() {
  return (
    <div>
      <Helmet>
        <title>My Custom Page Title</title>
        <meta
          name='description'
          content='This is the meta description of my page.'
        />
        <link rel='canonical' href='https://example.com/my-custom-page' />
        <meta name="robots" content="noindex, nofollow" />


        {/* Open Graph / Facebook */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://example.com/my-custom-page' />
        <meta property='og:title' content='My Custom Page Title' />
        <meta
          property='og:description'
          content='This is the Open Graph description of my page.'
        />
        <meta property='og:image' content='https://example.com/my-custom-page-og-image.jpg' />

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:url' content='https://example.com/my-custom-page' />
        <meta name='twitter:title' content='My Custom Page Title' />
        <meta
          name='twitter:description'
          content='This is the Twitter description of my page.'
        />
        <meta name='twitter:image' content='https://example.com/my-custom-page-twitter-image.jpg' />
      </Helmet>
    </div>
  );
}

```

:::tip[Good SEO practice]
There are certain pages that it is good SEO practice not to index, for example:

- Pages that do not add value (login, signup, password reset, ....).
- Legal pages: Privacy Policy, Cookies Policy, Terms and Conditions.
- Situational pages (e.g. page made for a specific campaign).
:::

## Structured data and Schema markup

:::note[Tip]
Crawlers do all the work of analyzing and understanding the content of your pages, and they will thank you if you include structured data to help them understand what your content is about!🤗.
:::

You can add structured data for each page.

```jsx {14-22}
//...
import { Helmet, HelmetProvider } from 'react-helmet-async';

export function MyCustomPage() {
  return (
    <div>
      <Helmet>
        <title>My Custom Page Title</title>
        <meta
          name='description'
          content='This is the meta description of my page.'/>
        <link rel='canonical' href='https://example.com/my-custom-page' />
        //...

        <script type='application/ld+json'>{`
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "title",
    "url": "https://yoururl.com",
    "description": "Description",
    }
  }
`}  </script>

      </Helmet>
      //...
```


These resources provide the information needed to get the most out of structured data:
- [Introduction to structured data markup](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

After you have a small notion about them, you can go deeper by adding custom functions depending on your app (FAQs, Rating, Review, Software Application...):
- [ALL structured data functions](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)


:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter, and offer it all to you for free!

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::

## Docs & Blog Meta Tags

Astro, being a static-site generator, will automatically inject relevant information provided in the `blog/astro.config.mjs` file, as well as in the frontmatter of `.md` files into the pages HTML:

```yaml
---
title: 'My First Blog Post'
pubDate: 2022-07-01
description: 'This is the first post of my new Astro blog.'
author: 'Astro Learner'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'
tags: ["astro", "blogging", "learning in public"]
---
```

Improving your SEO is as simple as adding these properties to your docs and blog content!

## A Word on SSR & SEO

Open SaaS and Wasp do not currently have a SSR option (although it is coming soon!), but that does not mean that Open SaaS apps are at a disadvantage with regards to SEO.

That's because the meta tags for the landing page (described above), plus the Astro docs/blog provided with Open SaaS are more than enough! Not to mention, Google is also able to crawl websites with JavaScript activated, making SSR unnecessary. 

For example, try searching "Open SaaS" on Google and you'll see this App, which was built with this template, as the first result! 
![open-saas-google-search](/seo/open-saas-google.png)
