import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        // The Brand Studio lives outside the pnpm workspace, but its `src/lib`
        // is pure: pure functions, no DOM at import time. It runs here in Node
        // so the studio's invariants are checked on every PR.
        test: {
          name: 'brand-studio',
          environment: 'node',
          include: ['apps/brand-studio/src/lib/**/*.test.js'],
        },
      },
      {
        // Web Components behave through the real DOM — shadow roots, focus,
        // computed styles — so they run in a browser rather than a simulated
        // one. The components' own Vite config supplies the Sass load paths
        // and the Terrazzo importer the `?inline` stylesheets need.
        extends: './packages/lets-ui-components/vite.config.ts',
        test: {
          name: 'components',
          include: ['packages/lets-ui-components/src/**/*.test.js'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.js'],
        },
      },
    ],
  },
});
