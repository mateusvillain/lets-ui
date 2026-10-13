import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import { LuiCodeBlock } from '../../index.js';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';

// Only the languages the stories use: the full build registers ~190 of them.
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

LuiCodeBlock.highlighter = (code, language) =>
  hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : null;

const BUTTON = `
  <script type="text/plain">
    <lui-button
      variant="primary"
      size="lg"
    >
      Save
    </lui-button>
  </script>
`;

const FILE = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M8 6 2 12l6 6M16 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default {
  title: 'Content/Code Block',
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'snippet'],
    },
    label: { control: 'text' },
    showLineNumbers: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    copy: { control: 'boolean' },
  },
};

const Template = ({ variant, label, showLineNumbers, showIcon, copy }) => `
  <lui-code-block
    variant="${variant}"
    label="${label}"
    ${showLineNumbers ? 'show-line-numbers' : ''}
    show-icon="${showIcon}"
    copy="${copy}"
    style="max-width: 452px;"
  >
    ${BUTTON}
  </lui-code-block>
`;

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
  label: 'Component.jsx',
  showLineNumbers: true,
  showIcon: true,
  copy: true,
};

export const Snippet = () => `
  <lui-code-block variant="snippet" label="bash" style="max-width: 452px;">
    npm install @lets-ui/styles @lets-ui/components
  </lui-code-block>
`;

export const SingleLine = () => `
  <lui-code-block style="max-width: 452px;">
    pnpm add @lets-ui/components
  </lui-code-block>
`;

export const MultiLine = () => `
  <lui-code-block label="theme.css" style="max-width: 452px;">
    :root {
      --lui-brand-color-primary-5: oklch(55% 0.2 270);
    }
  </lui-code-block>
`;

export const LineNumbers = () => `
  <lui-code-block label="main.js" show-line-numbers style="max-width: 452px;">
    import '@lets-ui/styles/dist/letsui.min.css';
    import '@lets-ui/components';

    const button = document.querySelector('lui-button');
    button.addEventListener('click', () => {
      console.log('clicked');
    });
    // Ten lines, so the numbers widen to two digits.
    // The gutter stays right-aligned.
    export {};
  </lui-code-block>
`;

export const NoCopyButton = () => `
  <lui-code-block label="Component.jsx" copy="false" style="max-width: 452px;">
    ${BUTTON}
  </lui-code-block>
`;

export const LongLines = () => `
  <lui-code-block label="install.sh" show-line-numbers style="max-width: 452px;">
    curl -fsSL https://example.com/install.sh | bash -s -- --prefix=/usr/local --with-components --with-tokens --verbose
    echo "Done"
  </lui-code-block>
`;

export const CustomIcon = () => `
  <lui-code-block label="Component.jsx" style="max-width: 452px;">
    ${FILE}
    ${BUTTON}
  </lui-code-block>
`;

export const CopyEvent = () => {
  setTimeout(() => {
    const block = document.querySelector('#copy-event-block');
    const output = document.querySelector('#copy-event-output');
    block?.addEventListener('lui-copy', (event) => {
      output.textContent = `lui-copy: ${event.detail.code.length} caracteres`;
    });
  });
  return `
    <lui-code-block id="copy-event-block" style="max-width: 452px;">
      npm run build
    </lui-code-block>
    <p id="copy-event-output" style="margin-top: 16px;">Clique em copiar.</p>
  `;
};

export const SyntaxHighlighting = () => `
  <div style="display: grid; gap: 16px; max-width: 520px;">
    <lui-code-block label="Component.html" language="html" show-line-numbers>
      <script type="text/plain">
        <!-- Primary action -->
        <lui-button variant="primary" size="lg" disabled>
          Save
        </lui-button>
      </script>
    </lui-code-block>
    <lui-code-block label="main.js" language="javascript" show-line-numbers>
      import { LuiCodeBlock } from '@lets-ui/components';

      // Registered once, for every block on the page.
      LuiCodeBlock.highlighter = (code, language) =>
        hljs.getLanguage(language)
          ? hljs.highlight(code, { language }).value
          : null;

      const retries = 3;
      export function load(url) {
        return fetch(url, { cache: 'no-store' });
      }
    </lui-code-block>
    <lui-code-block label="theme.css" language="css">
      .card:hover {
        border-radius: 8px;
        color: var(--lui-color-neutral-text-body);
      }
    </lui-code-block>
    <lui-code-block variant="snippet" label="bash" language="bash">
      npm install @lets-ui/styles @lets-ui/components
    </lui-code-block>
  </div>
`;

export const CSSClass = () => `
  <div class="code-block code-block--default" style="max-width: 452px;">
    <div class="code-block__header">
      <p class="code-block__label">Component.jsx</p>
    </div>
    <div class="code-block__body">
      <span class="code-block__lines" aria-hidden="true">1
2
3</span>
      <pre class="code-block__pre" role="region" aria-label="Code snippet"><code>&lt;lui-button variant="primary"&gt;
  Save
&lt;/lui-button&gt;</code></pre>
    </div>
  </div>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
