import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  trailingComma: "es5",
  overrides: [
    {
      files: ["**/*.mdx"],
      options: {
        embeddedLanguageFormatting: "off",
        proseWrap: "preserve",
      },
    },
  ],
});
