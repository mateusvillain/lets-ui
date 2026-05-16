import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Resolve the actual path to the tokens SCSS file in the workspace
const tokensScssPath = resolve(
  __dirname,
  'node_modules/@lets-ui/tokens/dist/letsui.tokens.scss'
);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', /^lit\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [
          resolve(__dirname, '../../'),
          resolve(__dirname, 'node_modules'),
          resolve(__dirname, '../../node_modules'),
        ],
        importers: [
          {
            // Redirect @lets-ui/tokens/dist/letsui.tokens.scss to the actual file
            findFileUrl(url: string) {
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
});
