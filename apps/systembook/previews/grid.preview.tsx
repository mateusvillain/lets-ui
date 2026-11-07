import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// Spans are clamped to the column count the brand tokens declare for the
// current breakpoint, so a cell can never overflow its row.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-grid {...elementProps(props)}>
        <lui-grid-item col="6" col-md="4">
          <Sample>col 6 / md 4</Sample>
        </lui-grid-item>
        <lui-grid-item col="6" col-md="4">
          <Sample>col 6 / md 4</Sample>
        </lui-grid-item>
        <lui-grid-item col="12" col-md="4">
          <Sample>col 12 / md 4</Sample>
        </lui-grid-item>
      </lui-grid>
    </Stretch>
  );
}

export default {
  component: 'Grid',
  variants: [
    { id: 'default', label: 'Default', props: {} },
    { id: 'flush', label: 'Flush', props: { flush: true } },
  ],
  controls: [
    {
      kind: 'boolean',
      propName: 'flush',
      label: 'Flush (no outer gutter)',
      defaultValue: false,
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['stretch', 'start', 'center', 'end'],
      defaultValue: 'stretch',
    },
  ],
} satisfies PreviewConfig;
