import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getUrl } from "src/utils/navigation";
import { WEBSITE_NAME, DEFAULT_DESCRIPTION } from "src/constants";
import { experimental_AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/mdx";

const renderers = await loadRenderers([getContainerRenderer()]);
const container = await experimental_AstroContainer.create({ renderers });

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("posts");
  return rss({
    title: WEBSITE_NAME,
    description: DEFAULT_DESCRIPTION,
    site: context.site!,
    stylesheet: getUrl("/rss/styles.xsl", true),
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: getUrl(`/posts/${post.slug}/`),
        categories: post.data.tags,
        content: await container.renderToString((await post.render()).Content),
      }))
    ),
  });
};
