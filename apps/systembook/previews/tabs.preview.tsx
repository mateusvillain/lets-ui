import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

// Each `lui-tab` carries its label as an attribute and its panel as its own
// inner HTML; the component reads both on slot change and renders the real
// tablist itself.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-tabs {...elementProps(props)}>
        <lui-tab label="Overview" active="">
          <p>Tokens compiled from JSON into CSS custom properties.</p>
        </lui-tab>
        <lui-tab label="Usage">
          <p>Import the stylesheet and set data-brand on the root element.</p>
        </lui-tab>
        <lui-tab label="Changelog">
          <p>Every release records the tokens it added or renamed.</p>
        </lui-tab>
      </lui-tabs>
    </Stretch>
  );
}

export default {
  component: 'Tabs',
  variants: [
    { id: 'line', label: 'Line', props: { variant: 'line' } },
    {
      id: 'expand',
      label: 'Expanded',
      props: { variant: 'line', expand: true },
    },
  ],
  controls: [
    {
      kind: 'boolean',
      propName: 'expand',
      label: 'Fill the width',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
