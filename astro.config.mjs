// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeUnwrapImages from "rehype-unwrap-images";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx({ optimize: true })],
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
});
