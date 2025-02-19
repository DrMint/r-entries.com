import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeUnwrapImages from "rehype-unwrap-images";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeNumberHeadings } from "./src/utils/rehypeNumberHeadings";
import type { Element } from "hast";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV!, process.cwd(), "");

export default defineConfig({
  integrations: [mdx({ optimize: true }), sitemap()],
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      rehypeNumberHeadings,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          content: (node: Element) => ({
            type: "text",
            value: node.properties["data-numbering"],
          }),
          properties: {
            className: ["anchor-link"],
            "aria-hidden": "true",
            tabindex: "-1",
          },
        },
      ],
      rehypeUnwrapImages,
    ],
  },
  experimental: {
    svg: true,
  },
  server: {
    host: true,
  },
  devToolbar: {
    enabled: true,
  },
  site: env.SITE_URL!,
  base: env.BASE_PATH!,
}); 