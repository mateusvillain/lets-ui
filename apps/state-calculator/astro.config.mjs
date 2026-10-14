import { defineConfig } from 'astro/config';
import path from 'path';

export default defineConfig({
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
