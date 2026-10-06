// Everything the preview iframe needs at runtime: the custom element
// definitions and the design tokens they resolve their colours against.
//
// This lives in its own module so `element.tsx` can pull it in lazily. The
// connector's discovery step bundles every `*.preview.tsx` for Node to read
// its default export, and Lit's `LitElement` extends `HTMLElement` — a static
// import here would blow up before the config could be read.
//
// The paths point at built output, so `pnpm build` has to run at the repo root
// before the connector does. Same contract as the Brand Studio.
import '../../../packages/lets-ui-components/dist/index.js';

// The stylesheet comes in as an asset URL rather than an `import`: esbuild
// walks this module while bundling for Node and has no CSS loader configured
// there, while Vite resolves the URL and emits the file into `assets/`.
const stylesheet = new URL(
  '../../../packages/styles/dist/letsui.min.css',
  import.meta.url
);

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = stylesheet.href;
document.head.append(link);

// Chrome for the iframe itself, not part of the design system: the artifact is
// embedded at whatever size the docs page gives it, so the component just sits
// centred with some breathing room.
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 24px;
    box-sizing: border-box;
  }

  /* The mount point carries the centring rather than the body: as a flex item
     it would otherwise shrink to its content, and a layout primitive asking
     for the full width (see \`Stretch\` in demo.tsx) would get the width of
     whatever happened to be inside it. */
  #root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 48px);
    box-sizing: border-box;
  }
`;
document.head.append(style);
