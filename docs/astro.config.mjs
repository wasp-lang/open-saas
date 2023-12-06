import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
  site: 'https://opensaas.sh',
  integrations: [
    starlightBlog({
      title: 'Blog',
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
      logo: {
        src: '/src/assets/logo.png',
        alt: 'Open SaaS',
      },
      editLink: {
        baseUrl: 'https://github.com/wasp-lang/open-saas/edit/main',
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
            { label: 'Deploying', link: '/guides/deploying/' },
          ],
        },
        {
          label: 'General',
          items: [
            { label: 'Admin Dashboard', link: '/general/admin-dashboard/' },
            { label: 'User Permissions', link: '/general/user-permissions/' },
          ],
        },
      ],
    }),
  ],
});
