import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      cover: image(),
      coverAlt: z.string(),
      summary: z.string().optional(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = {
  posts: postsCollection,
};
