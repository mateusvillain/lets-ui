import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-inline {...elementProps(props)}>
        <Sample>Design</Sample>
        <Sample>Tokens</Sample>
        <Sample>Components</Sample>
        <Sample>Documentation</Sample>
      </lui-inline>
    </Stretch>
  );
}

export default {
  component: 'Inline',
  variants: [
    { id: 'default', label: 'Default', props: { gap: '8' } },
    { id: 'spread', label: 'Spread', props: { gap: '8', justify: 'between' } },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'gap',
      label: 'Gap',
      options: ['4', '8', '16', '24', '32'],
      defaultValue: '8',
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      defaultValue: 'center',
    },
    {
      kind: 'select',
      propName: 'justify',
      label: 'Justify',
      options: ['start', 'center', 'end', 'between', 'around'],
      defaultValue: 'start',
    },
    {
      kind: 'select',
      propName: 'wrap',
      label: 'Wrap',
      options: ['wrap', 'nowrap'],
      defaultValue: 'wrap',
    },
  ],
} satisfies PreviewConfig;
