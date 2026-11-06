import { defineConfig } from 'astro/config';
import path from 'path';

export default defineConfig({
  // Absolute URLs for canonical, hreflang and the sitemap.
  site: 'https://changelog.lets-ui.com',
  trailingSlash: 'ignore',
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@lets-ui/tokens': path.resolve(
          '../../packages/lets-ui-tokens/dist/letsui.tokens.css'
        ),
      },
    },
  },
});
