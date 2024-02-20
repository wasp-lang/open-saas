import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://opensaas.sh',
  integrations: [
    starlightBlog({
      title: 'Blog',
      customCss: ['./src/styles/tailwind.css'],
      authors: {
        vince: {
          name: 'Vince',
          title: 'Dev Rel @ Wasp',
          picture: '/CRAIG_ROCK.png', // Images in the `public` directory are supported.
          url: 'https://wasp-lang.dev',
        },
      },
    }),
    starlight({
      title: 'OpenSaaS.sh',
      description: 'Open SaaS is a free, open-source, full-stack SaaS starter kit for React + NodeJS.',
      customCss: ['./src/styles/tailwind.css'],
      logo: {
        src: '/src/assets/logo.png',
        alt: 'Open SaaS',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://www.googletagmanager.com/gtag/js?id=G-8QGM76GR3Q',
          },
        },
        {
          tag: 'script',
          content: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-8QGM76GR3Q');
          `,
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/wasp-lang/open-saas/edit/deployed-version/blog',
      },
      components: {
        SiteTitle: './src/components/MyHeader.astro',
        MarkdownContent: 'starlight-blog/overrides/MarkdownContent.astro',
        Sidebar: 'starlight-blog/overrides/Sidebar.astro',
        // ThemeSelect: 'starlight-blog/overrides/ThemeSelect.astro',
      },
      social: {
        github: 'https://github.com/wasp-lang/open-saas',
        twitter: 'https://twitter.com/wasp_lang',
        discord: 'https://discord.gg/aCamt5wCpS',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Getting Started', link: '/start/getting-started/' },
            { label: 'Guided Tour', link: '/start/guided-tour/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Authentication', link: '/guides/authentication/' },
            { label: 'Authorization', link: '/guides/authorization/' },
            { label: 'Stripe Integration', link: '/guides/stripe-integration/' },
            { label: 'Stripe Testing', link: '/guides/stripe-testing/' },
            { label: 'Analytics', link: '/guides/analytics/' },
            { label: 'Email Sending', link: '/guides/email-sending/' },
            { label: 'File Uploading', link: '/guides/file-uploading/' },
            { label: 'Deploying', link: '/guides/deploying/' },
          ],
        },
        {
          label: 'General',
          items: [
            { label: 'Admin Dashboard', link: '/general/admin-dashboard/' },
            { label: 'User Overview', link: '/general/user-overview/' },
          ],
        },
      ],
    }), 
    tailwind({applyBaseStyles: false})
  ],
});
