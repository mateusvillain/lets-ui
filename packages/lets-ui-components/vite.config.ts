import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// Resolve the actual path to a tokens dist file in the workspace. The package
// exports map does not expose `./dist/*`, so Sass cannot follow the deep
// specifier on its own.
const TOKENS_PREFIX = '@lets-ui/tokens/dist/';

function tokensDistPath(url: string): string | null {
  if (!url.startsWith(TOKENS_PREFIX)) return null;

  const file = url.slice(TOKENS_PREFIX.length);
  if (file.includes('/') || !file.endsWith('.scss')) return null;

  return resolve(__dirname, 'node_modules/@lets-ui/tokens/dist', file);
}

// Inline the literal token values (breakpoints and column counts) as a virtual
// module, for the same reason as the icons CSS below: preserveModules would
// otherwise emit the JSON as its own file outside `dist/components`.
function inlineStaticTokensPlugin(): Plugin {
  const RESOLVED_ID = resolve(__dirname, 'src/tokens/static.js');
  const jsonPath = resolve(
    __dirname,
    'node_modules/@lets-ui/tokens/dist/letsui.tokens.static.json'
  );
  return {
    name: 'inline-static-tokens',
    enforce: 'pre',
    resolveId(source) {
      if (source === '@lets-ui/tokens/static') {
        return RESOLVED_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${readFileSync(jsonPath, 'utf-8').trim()};`;
      }
    },
  };
}

// Intercept lets-ui-icons CSS imports and serve them as virtual modules so
// Rollup's preserveModules does not output them under dist/node_modules.
function inlineIconsCssPlugin(): Plugin {
  const RESOLVED_ID = resolve(__dirname, 'src/styles/icon-css.js');
  const cssPath = resolve(
    __dirname,
    'node_modules/lets-ui-icons/dist/lets-ui-icons.css'
  );
  const iconsDir = resolve(__dirname, 'node_modules/lets-ui-icons/dist/icons');
  return {
    name: 'inline-icons-css',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('lets-ui-icons/dist/lets-ui-icons.css')) {
        return RESOLVED_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_ID) {
        // Replace relative url('icons/x.svg') with base64 data URIs so the
        // icons resolve correctly when the CSS is injected into shadow DOM.
        const css = readFileSync(cssPath, 'utf-8').replace(
          /url\('icons\/([^']+)'\)/g,
          (_, filename) => {
            const b64 = Buffer.from(
              readFileSync(resolve(iconsDir, filename), 'utf-8')
            ).toString('base64');
            return `url('data:image/svg+xml;base64,${b64}')`;
          }
        );
        return `export default ${JSON.stringify(css)}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [inlineStaticTokensPlugin(), inlineIconsCssPlugin()],
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
            // Redirect @lets-ui/tokens/dist/*.scss to the actual files
            findFileUrl(url: string) {
              const path = tokensDistPath(url);
              return path ? new URL(`file://${path}`) : null;
            },
          },
        ],
      },
    },
  },
});
