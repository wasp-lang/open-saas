import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog'

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
      title: 'My Docs',
      components: {
        MarkdownContent: 'starlight-blog/overrides/MarkdownContent.astro',
        Sidebar: 'starlight-blog/overrides/Sidebar.astro',
        ThemeSelect: 'starlight-blog/overrides/ThemeSelect.astro',
      },
      social: {
        github: 'https://github.com/withastro/starlight',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/start/introduction/' },
            { label: 'Getting Started', link: '/start/getting-started/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            {
              label: 'Auth ',
              link: '/guides/auth/',
              items: [
                { label: 'Turtle', link: '/guides/components/' },
                { label: 'Internationalization (i18n)', link: '/guides/i18n/' },
              ],
            },
            { label: 'Stripe Integration', link: '/guides/stripe-integration/' },
            { label: 'Stripe Testing', link: '/guides/stripe-testing/' },
          ],
        },
        {
          label: 'General',
          items: [
            { label: 'User Permissions', link: 'general/user-permissions/' },
          ],
        }
      ],
    }),
  ],
});
