import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
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
        });
      },
    }),
  }),
};
