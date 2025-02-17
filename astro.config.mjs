// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeUnwrapImages from "rehype-unwrap-images";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx({ optimize: true }), sitemap()],
  trailingSlash: "never",
  markdown: {
    rehypePlugins: [rehypeUnwrapImages],
  },
  experimental: {
    svg: true,
  },
  server: {
    host: true,
  },
  site: "http://localhost:4321",
});
