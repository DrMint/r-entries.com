import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export const getPosts = async (options?: {
  tag?: string;
  sort?: "date" | "title";
  order?: "asc" | "desc";
  maxCount?: number;
}) => {
  let posts = await getCollection("posts");
  posts = posts.filter((post) => !post.data.draft);

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

export const getPost = async (slug: string) => {
  const post = await getEntry("posts", slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
};

export const getAdjacentImages = async (image: CollectionEntry<"images">) => {
  const images = await getImages({ sort: "date", order: "desc" });

  const currentImageIndex = images.findIndex((e) => e.id === image.id);
  const previousImageIndex = currentImageIndex + 1;
  const nextImageIndex = currentImageIndex - 1;

  const previousImage = images[previousImageIndex];
  const nextImage = images[nextImageIndex];

  return { previousImage, nextImage };
};

export const getAdjacentPosts = async (post: CollectionEntry<"posts">) => {
  const posts = await getPosts({ sort: "date", order: "desc" });

  const currentPostIndex = posts.findIndex((p) => p.id === post.id);
  const previousPostIndex = currentPostIndex + 1;
  const nextPostIndex = currentPostIndex - 1;

  const previousPost = posts[previousPostIndex];
  const nextPost = posts[nextPostIndex];

  return { previousPost, nextPost };
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

export const getPage = async (slug: string) => {
  const page = await getEntry("pages", slug);
  if (!page) throw new Error(`Page not found: ${slug}`);
  return page;
};

export const getImages = async (options?: {
  tag?: string;
  sort?: "date" | "title";
  order?: "asc" | "desc";
  maxCount?: number;
}) => {
  let images = await getCollection("images");

  if (!options) return images;
  const { tag, sort, order, maxCount } = options;

  if (tag) images = images.filter((image) => image.data.tags?.includes(tag));
  if (sort === "date")
    images = images.sort(
      (a, b) => a.data.date.valueOf() - b.data.date.valueOf()
    );
  if (sort === "title")
    images = images.sort((a, b) => a.data.title.localeCompare(b.data.title));
  if (order === "desc") images = images.reverse();
  if (maxCount) images = images.slice(0, maxCount);

  return images;
};

export const getImage = async (slug: string) => {
  const image = await getEntry("images", slug);
  if (!image) throw new Error(`Image not found: ${slug}`);
  return image;
};
