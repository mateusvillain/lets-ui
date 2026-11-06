import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

// React renders the code as a text node, so `<` reaches lui-code-block as
// text and needs no `<script type="text/plain">` wrapper. The component
// trims the blank edges and the common indentation.
const COMPONENT = `
<lui-button
  variant="primary"
  size="lg"
>
  Save
</lui-button>
`;

const INSTALL = 'npm install @lets-ui/styles @lets-ui/components';

const LONG = `
import { LuiCodeBlock } from '@lets-ui/components';

LuiCodeBlock.highlighter = (code, language) => hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : null;
`;

// `demo` is not an attribute of lui-code-block: it picks the sample code.
export function Preview({ demo, ...props }: Record<string, unknown>) {
  const code =
    demo === 'install' ? INSTALL : demo === 'long' ? LONG : COMPONENT;

  return (
    <Stretch>
      <lui-code-block {...elementProps(props)}>{code}</lui-code-block>
    </Stretch>
  );
}

export default {
  component: 'CodeBlock',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { variant: 'default', label: 'Component.html' },
    },
    {
      id: 'snippet',
      label: 'Snippet',
      props: { variant: 'snippet', label: 'bash', demo: 'install' },
    },
    {
      id: 'line-numbers',
      label: 'Line numbers',
      props: {
        variant: 'default',
        label: 'Component.html',
        'show-line-numbers': true,
      },
    },
    {
      id: 'long-lines',
      label: 'Long lines',
      props: { variant: 'default', label: 'main.js', demo: 'long' },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['default', 'snippet'],
      defaultValue: 'default',
    },
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'boolean',
      propName: 'show-line-numbers',
      label: 'Line numbers',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
