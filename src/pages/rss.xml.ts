import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getUrl } from "src/utils/navigation";
import { WEBSITE_NAME, DEFAULT_DESCRIPTION } from "src/constants";
import { getImages, getPosts } from "src/utils/collections";

export const GET: APIRoute = async (context) => {
  const posts = await getPosts({ includingNested: true });
  const images = await getImages();

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      link: getUrl(`/posts/${post.id}`),
      categories: post.data.tags,
      content: "TODO",
    })),
    ...images.map((image) => ({
      title: image.data.title,
      pubDate: image.data.date,
      link: getUrl(`/images/${image.id}`),
      content: "TODO",
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: WEBSITE_NAME,
    description: DEFAULT_DESCRIPTION,
    site: context.site!,
    stylesheet: getUrl("/rss/styles.xsl", true),
    items,
  });
};
