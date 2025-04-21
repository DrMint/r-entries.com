import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeNumberHeadings } from "./plugins/rehypeNumberHeadings";
import { rehypeImageFigures } from "./plugins/rehypeImageFigures";
import { rehypeExternalNofollow } from "./plugins/rehypeExternalNofollow";
import { rehypeMarkNonMDXNodes } from "./plugins/rehypeMarkNonMDXNodes";
import type { Element } from "hast";
import { loadEnv } from "./tools/loadEnv";
import rehypeCallouts from "rehype-callouts";
import rehypePrettyCode from "rehype-pretty-code";

const env = loadEnv();

export default defineConfig({
  integrations: [mdx({ optimize: true }), sitemap()],
  trailingSlash: env.TRAILING_SLASH,
  markdown: {
    remarkRehype: {
      footnoteLabel: "Footnotes",
    },
    syntaxHighlight: false,
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
      [
        rehypePrettyCode,
        {
          theme: {
            light: "light-plus",
            dark: "dark-plus",
          },
          keepBackground: false,
        },
      ],
      rehypeCallouts,
      rehypeUnwrapImages,
      rehypeImageFigures,
      [
        rehypeExternalNofollow,
        {
          target: "_blank",
          rel: ["nofollow", "noreferrer", "noopener"],
        },
      ],
      rehypeMarkNonMDXNodes,
    ],
  },
  server: {
    host: true,
    port: env.PORT,
  },
  devToolbar: {
    enabled: true,
  },
  site: env.SITE_URL,
  base: env.BASE_PATH,
});
