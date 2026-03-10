import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const postsCollection = defineCollection({
  loader: glob({ base: "src/content/posts", pattern: "**/*.mdx" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
});

const pagesCollection = defineCollection({
  loader: glob({ base: "src/content/pages", pattern: "**/*.mdx" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
};
