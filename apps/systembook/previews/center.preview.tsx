import type { PreviewConfig } from '@systembook/schema';
import { Sample, Stretch } from './demo';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-center {...elementProps(props)}>
        <Sample>Centred content</Sample>
      </lui-center>
    </Stretch>
  );
}

export default {
  component: 'Center',
  variants: [
    {
      id: 'both',
      label: 'Both axes',
      props: { axis: 'both', 'min-height': '200px', 'max-width': '320px' },
    },
    {
      id: 'horizontal',
      label: 'Horizontal',
      props: { axis: 'horizontal', 'max-width': '320px' },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'axis',
      label: 'Axis',
      options: ['both', 'horizontal', 'vertical'],
      defaultValue: 'both',
    },
    { kind: 'text', propName: 'min-height', label: 'Min height' },
    { kind: 'text', propName: 'max-width', label: 'Max width' },
  ],
} satisfies PreviewConfig;
