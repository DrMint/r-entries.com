import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeUnwrapImages from "rehype-unwrap-images";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeNumberHeadings } from "./src/utils/rehypeNumberHeadings";
import type { Element } from "hast";
import type { AstroUserConfig } from "astro";

const defaultSiteUrl = "http://localhost:4321";
const defaultBasePath = "/";
const defaultTrailingSlash = "always";

const siteUrl = process.env.SITE_URL ?? defaultSiteUrl;
const basePath = process.env.BASE_PATH ?? defaultBasePath;
const trailingSlash = process.env.TRAILING_SLASH as AstroUserConfig["trailingSlash"] ?? defaultTrailingSlash;

process.env.SITE_URL = siteUrl;
process.env.BASE_PATH = basePath;
process.env.TRAILING_SLASH = trailingSlash;

console.log(`
🔍 Environment Variables during build:
----------------------------------------
  SITE_URL: ${siteUrl}
  BASE_PATH: ${basePath}
  TRAILING_SLASH: ${trailingSlash}
----------------------------------------
`)

export default defineConfig({
  integrations: [mdx({ optimize: true }), sitemap()],
  trailingSlash: trailingSlash,
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
  site: siteUrl!,
  base: basePath!,
}); 