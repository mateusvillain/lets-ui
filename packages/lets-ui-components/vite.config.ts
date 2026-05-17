import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// Resolve the actual path to the tokens SCSS file in the workspace
const tokensScssPath = resolve(
  __dirname,
  'node_modules/@lets-ui/tokens/dist/letsui.tokens.scss'
);

// Intercept lets-ui-icons CSS imports and serve them as virtual modules so
// Rollup's preserveModules does not output them under dist/node_modules.
function inlineIconsCssPlugin(): Plugin {
  const VIRTUAL_ID = '\0virtual:lets-ui-icons-css';
  return {
    name: 'inline-icons-css',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('lets-ui-icons/dist/lets-ui-icons.css')) {
        return VIRTUAL_ID;
      }
    },
    load(id) {
      if (id === VIRTUAL_ID) {
        const cssPath = resolve(
          __dirname,
          'node_modules/lets-ui-icons/dist/lets-ui-icons.css'
        );
        return `export default ${JSON.stringify(readFileSync(cssPath, 'utf-8'))}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [inlineIconsCssPlugin()],
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
