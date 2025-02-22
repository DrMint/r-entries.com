import type { Element } from "hast";
import { visit } from "unist-util-visit";

export function rehypeExternalNofollow() {
  return (tree: any) => {
    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "a" &&
        typeof node.properties?.href === "string" &&
        /^https?:\/\//.test(node.properties.href) &&
        !node.properties.href.includes(process.env.SITE_URL!)
      ) {
        // Add nofollow to external links
        node.properties.rel = "nofollow";
      }
    });
  };
}
