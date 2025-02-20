import type { Root } from "hast";
import { visit } from "unist-util-visit";

export const rehypeNumberHeadings = () => (tree: Root) => {
  const numbers: number[] = [0, 0, 0, 0, 0, 0]; // For h1-h6

  visit(tree, "element", (node) => {
    // Only process h2-h6 elements
    if (!node.tagName.match(/^h[2-6]$/)) return;

    const depth = parseInt(node.tagName[1]!);

    // Reset all deeper levels
    for (let i = depth; i < numbers.length; i++) {
      numbers[i] = 0;
    }
    // Increment current level
    numbers[depth - 1]!++;

    // Build the number string (e.g., "1.2.3")
    const numberStr = numbers.slice(1, depth).join(".");

    node.properties["data-numbering"] = numberStr + ".";
  });
};
