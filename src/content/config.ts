import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      pretitle: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      cover: image(),
      summary: z.string().optional(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = {
  posts: postsCollection,
};
