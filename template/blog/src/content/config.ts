import { defineCollection } from 'astro:content';
import { i18nSchema, docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';
import { z } from 'astro:content';

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: (context) => {
        const blogSchemaResult = blogSchema(context);
        return z.object({
          ...blogSchemaResult.shape,
          subtitle: z.string().optional(),
          hideBannerImage: z.boolean().optional(),
        });
      },
    }),
  }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
};
