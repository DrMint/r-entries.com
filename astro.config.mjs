// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeUnwrapImages from "rehype-unwrap-images";

import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx({ optimize: true }), sitemap()],
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          content: {
            type: "text",
            value: "#",
          },
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
    enabled: false,
  },
  site: "http://localhost:4321",
});
