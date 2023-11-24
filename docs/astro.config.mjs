import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlightBlog({
      title: 'The Best Blog Ever',
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
      title: 'Open SaaS Docs',
      // root: '/start/introdcution/',
      // site: 'https://www.my-site.dev', // TODO: Change this to your site
      editLink: {
        baseUrl: 'https://github.com/withastro/starlight/edit/main/', // TODO: change
      },
      components: {
        MarkdownContent: 'starlight-blog/overrides/MarkdownContent.astro',
        Sidebar: 'starlight-blog/overrides/Sidebar.astro',
        ThemeSelect: 'starlight-blog/overrides/ThemeSelect.astro',
      },
      social: {
        github: 'https://github.com/wasp-lang',
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
          items: [{ label: 'User Permissions', link: 'general/user-permissions/' }],
        },
      ],
    }),
  ],
});
