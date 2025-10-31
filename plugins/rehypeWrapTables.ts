import type { Root, Element, Parents } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
  // Collect all tables first to avoid mutation during iteration
  const replacements: Array<{
    parent: Parents;
    index: number;
    table: Element;
  }> = [];

  visit(tree, "element", (node: Element, index, parent: Parents | undefined) => {
    if (
      node.tagName === "table" &&
      parent &&
      typeof index === "number" &&
      (parent.type === "root" || parent.type === "element")
    ) {
      replacements.push({ parent, index, table: node });
    }
  });

  // Apply replacements in reverse order to avoid index shifting issues
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { parent, index, table } = replacements[i]!;
    
    // Create wrapper div
    const wrapper: Element = {
      type: "element",
      tagName: "div",
      properties: {
        className: ["table-wrapper"],
        "data-rehype-non-mdx": "",
      },
      children: [table],
    };

    // Replace table with wrapper in parent's children array
    parent.children[index] = wrapper;
  }
};

