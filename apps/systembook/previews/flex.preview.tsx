import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

// `lui-flex-item` is the child half of the primitive: it sets grow, shrink and
// basis on whatever it wraps.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-flex {...elementProps(props)}>
        <lui-flex-item grow="1">
          <Sample>grow 1</Sample>
        </lui-flex-item>
        <lui-flex-item grow="2">
          <Sample>grow 2</Sample>
        </lui-flex-item>
        <lui-flex-item>
          <Sample>auto</Sample>
        </lui-flex-item>
      </lui-flex>
    </Stretch>
  );
}

export default {
  component: 'Flex',
  variants: [
    { id: 'row', label: 'Row', props: { direction: 'row', gap: '16' } },
    {
      id: 'column',
      label: 'Column',
      props: { direction: 'column', gap: '16' },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'direction',
      label: 'Direction',
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      defaultValue: 'row',
    },
    {
      kind: 'select',
      propName: 'gap',
      label: 'Gap',
      options: ['4', '8', '16', '24', '32'],
      defaultValue: '16',
    },
    {
      kind: 'select',
      propName: 'align',
      label: 'Align',
      options: ['stretch', 'start', 'center', 'end', 'baseline'],
      defaultValue: 'stretch',
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
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      defaultValue: 'nowrap',
    },
  ],
} satisfies PreviewConfig;
