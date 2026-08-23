import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import sass from "@terrazzo/plugin-sass";

export default defineConfig({
  tokens: ["./letsui.resolver.json"],
  outDir: "./dist/",
  plugins: [
    css({
      filename: "letsui.tokens.css",
      permutations: [
        {
          input: {},
          prepare: (cssOutput) => `:root {\ncolor-scheme: light dark;\n${cssOutput}\n}`,
        },

        // Brand foundation
        {
          input: { brandFoundation: "lets-ui" },
          include: [
            "lui.brand.**"
          ],
          exclude: ["lui.brand.color.**"],
          prepare: (cssOutput) => `[data-brand="lets-ui"] {\n${cssOutput}\n}`,
        },

        // Default dark mode
        {
          input: { mode: "dark" },
          include: [
            "lui.color.blue.**",
            "lui.color.gray.**",
            "lui.color.green.**",
            "lui.color.orange.**",
            "lui.color.red.**",
            "lui.color.violet.**",
            "lui.color.black.**"
          ],
          prepare: (cssOutput) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n${cssOutput}\n  }\n}`,
        },

        // Auto brand theme
        {
          input: { brandColor: "lets-ui-light" },
          include: ["lui.brand.color.**"],
          prepare: (cssOutput) => `@media (prefers-color-scheme: light) {\n  [data-brand="lets-ui"] {\n    color-scheme: light;\n${cssOutput}\n  }\n}`,
        },
        {
          input: { brandColor: "lets-ui-dark" },
          include: ["lui.brand.color.**"],
          prepare: (cssOutput) => `@media (prefers-color-scheme: dark) {\n  [data-brand="lets-ui"] {\n    color-scheme: dark;\n${cssOutput}\n  }\n}`,
        },

        // Explicit themes
        {
          input: { mode: "light" },
          include: [
            "lui.color.blue.**",
            "lui.color.gray.**",
            "lui.color.green.**",
            "lui.color.orange.**",
            "lui.color.red.**",
            "lui.color.violet.**",
            "lui.color.black.**"
          ],
          prepare: (cssOutput) => `[data-theme="light"] {\n  color-scheme: light;\n${cssOutput}\n}`,
        },
        {
          input: { mode: "dark" },
          include: [
            "lui.color.blue.**",
            "lui.color.gray.**",
            "lui.color.green.**",
            "lui.color.orange.**",
            "lui.color.red.**",
            "lui.color.violet.**",
            "lui.color.black.**"
          ],
          prepare: (cssOutput) => `[data-theme="dark"] {\n  color-scheme: dark;\n${cssOutput}\n}`,
        },

        // Brand overrides
        {
          input: { brandColor: "lets-ui-light" },
          include: ["lui.brand.color.**"],
          prepare: (cssOutput) => `[data-brand="lets-ui"][data-theme="light"] {\n  color-scheme: light;\n${cssOutput}\n}`,
        },
        {
          input: { brandColor: "lets-ui-dark" },
          include: ["lui.brand.color.**"],
          prepare: (cssOutput) => `[data-brand="lets-ui"][data-theme="dark"] {\n  color-scheme: dark;\n${cssOutput}\n}`,
        },
      ],
    }),
    sass({
      filename: "letsui.tokens.scss",
    }),
  ],
});
