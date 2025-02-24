import type { Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Root } from "hast";
import type {} from "mdast-util-mdx";

export const rehypeMarkNonMDXNodes: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element) => {
    node.properties["data-rehype-non-mdx"] = "";
  });

  visit(tree, "mdxJsxTextElement", (node) => {
    node.attributes.push({
      type: "mdxJsxAttribute",
      name: "data-rehype-non-mdx",
      value: "",
    });
  });
};
