import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../docs/**/*.mdx', '../docs/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: '@storybook/html-vite',
  staticDirs: ['../docs/public'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      css: {
        preprocessorOptions: {
          scss: {
            loadPaths: [resolve(__dirname, '..')],
          },
        },
      },
    });
  },
};
export default config;
