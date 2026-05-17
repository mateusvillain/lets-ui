import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkGfm from 'remark-gfm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    '../docs/**/*.mdx',
    '../docs/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../packages/lets-ui-components/src/components/**/*.mdx',
    '../packages/lets-ui-components/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
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
    const componentsModules = resolve(
      __dirname,
      '../packages/lets-ui-components/node_modules'
    );
    // @lets-ui/tokens/dist/letsui.tokens.scss is not in the package exports map,
    // so Sass can't resolve it via the exports field. Redirect it to the actual file,
    // mirroring the custom importer in packages/lets-ui-components/vite.config.ts.
    const tokensScssPath = resolve(
      __dirname,
      '../packages/lets-ui-tokens/dist/letsui.tokens.scss'
    );
    const scss = config.css?.preprocessorOptions?.scss ?? {};
    const existingAlias = Array.isArray(config.resolve?.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve?.alias ?? {}).map(
          ([find, replacement]) => ({
            find,
            replacement,
          })
        );

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: [
          ...existingAlias,
          // lit is installed only in the components package; expose it to the Storybook Vite instance
          { find: 'lit', replacement: `${componentsModules}/lit` },
          { find: /^lit\/(.+)$/, replacement: `${componentsModules}/lit/$1` },
        ],
      },
      css: {
        ...config.css,
        preprocessorOptions: {
          ...config.css?.preprocessorOptions,
          scss: {
            ...scss,
            loadPaths: [...(scss.loadPaths ?? []), resolve(__dirname, '..')],
            importers: [
              ...(scss.importers ?? []),
              {
                findFileUrl(url) {
                  if (url === '@lets-ui/tokens/dist/letsui.tokens.scss') {
                    return new URL(`file://${tokensScssPath}`);
                  }
                  return null;
                },
              },
            ],
          },
        },
      },
    };
  },
};
export default config;
