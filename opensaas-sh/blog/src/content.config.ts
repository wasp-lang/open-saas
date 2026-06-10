import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";
import { blogSchema } from "starlight-blog/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: (context) => {
        const blogSchemaResult = blogSchema(context);
        return z.object({
          ...blogSchemaResult.shape,
          subtitle: z.string().optional(),
          hideBannerImage: z.boolean().optional(),
          keywords: z.array(z.string()).optional(),
        });
      },
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
