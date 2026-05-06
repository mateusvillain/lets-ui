import remarkGfm from 'remark-gfm';

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../docs/**/*.mdx', '../docs/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/html-vite',
  docs: {
    mdxPluginOptions: {
      mdxCompileOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  },
};
export default config;
