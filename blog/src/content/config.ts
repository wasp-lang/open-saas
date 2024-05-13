import { defineCollection } from 'astro:content';
import { i18nSchema, docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

export const collections = {
  docs: defineCollection({ schema: docsSchema({ extend: blogSchema() }) }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
