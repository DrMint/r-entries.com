import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";
import type { Plugin } from "unified";

/**
 * Rehype plugin that wraps images with alt text
 * in figure elements and adds figcaption.
 * Images without alt text are left unchanged.
 */
const rehypeImageFigures: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element, index, parent) => {
    // Only process img elements
    if (node.tagName !== "img") return;

    // If no alt text, leave the image as is
    if (!node.properties?.alt || typeof node.properties.alt !== "string")
      return;

    // Create the figure element
    const figure: Element = {
      type: "element",
      tagName: "figure",
      properties: {},
      children: [
        // The original image
        node,
        // The figcaption with the alt text
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [
            {
              type: "text",
              value: node.properties.alt,
            },
          ],
        },
      ],
    };

    // Replace the image with the figure
    if (parent && typeof index === "number") {
      parent.children[index] = figure;
    }
  });
};

export default rehypeImageFigures;
