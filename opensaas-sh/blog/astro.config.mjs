import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.opensaas.sh',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'OpenSaaS.sh',
      description: 'Open SaaS is a free, open-source, full-stack SaaS starter kit for React + NodeJS.',
      customCss: ['./src/styles/tailwind.css'],
      logo: {
        src: '/src/assets/logo.webp',
        alt: 'Open SaaS',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            'data-domain': 'docs.opensaas.sh',
            'data-api': 'https://opensaas.sh/wasparadocs/wasp/event',
            src: 'https://opensaas.sh/wasparadocs/wasp/script.js',
          },
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: '/piggy.js',
          },
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/wasp-lang/open-saas/edit/main/opensaas-sh/blog',
      },
      components: {
        SiteTitle: './src/components/MyHeader.astro',
        ThemeSelect: './src/components/MyThemeSelect.astro',
        Head: './src/components/HeadWithOGImage.astro',
        PageTitle: './src/components/TitleWithBannerImage.astro',
      },
      social: {
        github: 'https://github.com/wasp-lang/open-saas',
        twitter: 'https://twitter.com/wasplang',
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
          autogenerate: { directory: '/guides/' },
        },
        {
          label: 'General',
          autogenerate: { directory: '/general/' },
        },
      ],
      plugins: [
        starlightBlog({
          title: 'Blog',
          customCss: ['./src/styles/tailwind.css'],
          authors: {
            vince: {
              name: 'Vince',
              title: 'Dev Rel @ Wasp',
              picture: '/CRAIG_ROCK.png', // Images in the `public` directory are supported.
              url: 'https://wasp.sh',
            },
            matija: {
              name: 'Matija',
              title: 'CEO @ Wasp',
              picture: '/matija.jpeg', // Images in the `public` directory are supported.
              url: 'https://wasp.sh',
            },
            milica: {
              name: 'Milica',
              title: 'Growth @ Wasp',
              picture: '/milica.jpg', // Images in the `public` directory are supported.
              url: 'https://wasp.sh',
            },
            martin: {
              name: 'Martin',
              title: 'CTO @ Wasp',
              picture: '/martin.jpg', // Images in the `public` directory are supported.
              url: 'https://wasp.sh',
            },
          },
        }),
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
