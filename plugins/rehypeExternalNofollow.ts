import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";

interface Options {
  target?: "_blank" | "_self";
  rel?: string[];
}

export const rehypeExternalNofollow: Plugin<[Options | undefined], Root> =
  (options) => (tree) => {
    const target = options?.target;
    const rel = options?.rel ?? ["nofollow"];

    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "a" &&
        typeof node.properties?.href === "string" &&
        /^https?:\/\//.test(node.properties.href) &&
        !node.properties.href.includes(process.env.SITE_URL!)
      ) {
        if (target) {
          node.properties.target = target;
        }
        node.properties.rel = rel;
      }
    });
  };
