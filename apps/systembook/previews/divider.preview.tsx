import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-divider {...elementProps(props)} />
    </Stretch>
  );
}

export default {
  component: 'Divider',
  variants: [
    { id: 'plain', label: 'Plain', props: { orientation: 'horizontal' } },
    {
      id: 'labelled',
      label: 'With label',
      props: { orientation: 'horizontal', label: 'or' },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'select',
      propName: 'orientation',
      label: 'Orientation',
      options: ['horizontal', 'vertical'],
      defaultValue: 'horizontal',
    },
  ],
} satisfies PreviewConfig;
