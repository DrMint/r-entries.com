import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export const getPosts = async (options?: QueryOptions) => {
  const posts = await getCollection("posts", (post) => !post.data.draft);
  return queryEntries(posts, options);
};

export const getPost = async (slug: string) => {
  const post = await getEntry("posts", slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
};

export const getAdjacentPosts = async (post: CollectionEntry<"posts">) => {
  const posts = await getPosts({ sort: "date", order: "desc" });
  const { previous, next } = getAdjacent(post, posts);
  return { previousPost: previous, nextPost: next };
};

export const getImages = async (options?: QueryOptions) => {
  const images = await getCollection("images");
  return queryEntries(images, options);
};

export const getImage = async (slug: string) => {
  const image = await getEntry("images", slug);
  if (!image) throw new Error(`Image not found: ${slug}`);
  return image;
};

export const getAdjacentImages = async (image: CollectionEntry<"images">) => {
  const images = await getImages({ sort: "date", order: "desc" });
  const { previous, next } = getAdjacent(image, images);
  return { previousImage: previous, nextImage: next };
};

export const getPage = async (slug: string) => {
  const page = await getEntry("pages", slug);
  if (!page) throw new Error(`Page not found: ${slug}`);
  return page;
};

export const getTags = async (options?: {
  sort?: "prevalence" | "name";
  order?: "asc" | "desc";
  collection?: "posts" | "images";
}) => {
  const tagNames = new Map<string, number>();

  if (!options?.collection || options.collection === "posts") {
    const posts = await getPosts();
    posts
      .flatMap((post) => post.data.tags ?? [])
      .forEach((tag) => tagNames.set(tag, (tagNames.get(tag) ?? 0) + 1));
  }

  if (!options?.collection || options.collection === "images") {
    const images = await getImages();
    images
      .flatMap((image) => image.data.tags ?? [])
      .forEach((tag) => tagNames.set(tag, (tagNames.get(tag) ?? 0) + 1));
  }

  let tags = Array.from(tagNames.entries()).map(([tag, count]) => ({
    tag,
    count,
  }));

  if (!options) return tags;
  const { sort, order } = options;

  if (sort === "prevalence") tags = tags.sort((a, b) => a.count - b.count);
  if (sort === "name") tags = tags.sort((a, b) => a.tag.localeCompare(b.tag));
  if (order === "desc") tags = tags.reverse();

  return tags;
};

type QueryOptions = {
  tag?: string;
  sort?: "date" | "title";
  order?: "asc" | "desc";
  maxCount?: number;
};

const queryEntries = <
  T extends {
    data: { title: string; date: Date; tags?: string[] | undefined };
  },
>(
  entries: T[],
  options?: QueryOptions
) => {
  if (!options) return entries;
  const { tag, sort, order, maxCount } = options;

  // getCollection may return a cached array, and sort/reverse mutate in place
  let result = [...entries];
  if (tag) result = result.filter((entry) => entry.data.tags?.includes(tag));
  if (sort === "date")
    result.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  if (sort === "title")
    result.sort((a, b) => a.data.title.localeCompare(b.data.title));
  if (order === "desc") result.reverse();
  if (maxCount) result = result.slice(0, maxCount);
  return result;
};

const getAdjacent = <T extends { id: string }>(item: T, collection: T[]) => {
  const currentIndex = collection.findIndex((c) => c.id === item.id);
  if (currentIndex === -1) return { previous: undefined, next: undefined };

  const previous: T | undefined = collection[currentIndex + 1];
  const next: T | undefined = collection[currentIndex - 1];

  return { previous, next };
};
