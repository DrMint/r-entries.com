import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
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
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
};
