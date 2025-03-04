import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export const getPosts = async (options?: {
  tag?: string;
  sort?: "date" | "title";
  order?: "asc" | "desc";
  maxCount?: number;
  includingNested?: boolean;
}) => {
  let posts = await getCollection("posts");
  if (!options?.includingNested) {
    posts = posts.filter((post) => !post.slug.includes("/"));
  }

  if (!options) return posts;
  const { tag, sort, order, maxCount } = options;

  if (tag) posts = posts.filter((post) => post.data.tags?.includes(tag));
  if (sort === "date")
    posts = posts.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  if (sort === "title")
    posts = posts.sort((a, b) => a.data.title.localeCompare(b.data.title));
  if (order === "desc") posts = posts.reverse();
  if (maxCount) posts = posts.slice(0, maxCount);
  return posts;
};

export const getPostsTree = async () => {
  const allPosts = await getPosts({ includingNested: true });
  const posts = allPosts.filter((post) => !post.slug.includes("/"));
  const nestedPosts = allPosts.filter((post) => post.slug.includes("/"));

  return posts.map((post) => ({
    ...post,
    nestedPosts: nestedPosts.filter((p) => p.slug.startsWith(post.slug)),
  }));
};

export const getAdjacentPosts = async (post: CollectionEntry<"posts">) => {
  const posts = await getPosts({ sort: "date", order: "desc" });

  const previousPost = posts.find(
    (otherPost) => otherPost.data.date.valueOf() < post.data.date.valueOf()
  );

  const nextPost = posts.findLast(
    (otherPost) => otherPost.data.date.valueOf() > post.data.date.valueOf()
  );

  return { previousPost, nextPost };
};

export const getTags = async (options?: {
  sort?: "prevalence" | "name";
  order?: "asc" | "desc";
}) => {
  const posts = await getPosts({ includingNested: true });
  const tagNames = new Set(posts.flatMap((post) => post.data.tags ?? []));

  let tags = [...tagNames].map((tag) => ({
    tag,
    count: posts.filter((post) => post.data.tags?.includes(tag)).length,
  }));

  if (!options) return tags;
  const { sort, order } = options;

  if (sort === "prevalence") tags = tags.sort((a, b) => a.count - b.count);
  if (sort === "name") tags = tags.sort((a, b) => a.tag.localeCompare(b.tag));
  if (order === "desc") tags = tags.reverse();

  return tags;
};

export const getPage = async (slug: string) => {
  const page = await getEntry("pages", slug);
  if (!page) throw new Error(`Page not found: ${slug}`);
  return page;
};
