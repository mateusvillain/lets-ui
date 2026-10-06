import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-stack {...elementProps(props)}>
        <Sample>First</Sample>
        <Sample>Second</Sample>
        <Sample>Third</Sample>
      </lui-stack>
    </Stretch>
  );
}

export default {
  component: 'Stack',
  variants: [
    { id: 'default', label: 'Default', props: { gap: '16' } },
    { id: 'tight', label: 'Tight', props: { gap: '4' } },
    {
      id: 'centered',
      label: 'Centered',
      props: { gap: '16', align: 'center' },
    },
  ],
  controls: [
    // Spacing takes a fluid token step (2–80); an unlisted number falls back
    // to raw pixels.
    {
      kind: 'select',
      propName: 'gap',
      label: 'Gap',
      options: ['4', '8', '16', '24', '32', '48'],
      defaultValue: '16',
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['stretch', 'start', 'center', 'end'],
      defaultValue: 'stretch',
    },
    {
      kind: 'select',
      propName: 'justify',
      label: 'Justify',
      options: ['start', 'center', 'end', 'between', 'around'],
      defaultValue: 'start',
    },
  ],
} satisfies PreviewConfig;
