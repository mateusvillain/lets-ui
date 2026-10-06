import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

// The panels are slotted content: structure, not something a control mutates.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-accordion {...elementProps(props)}>
        <lui-accordion-item label="What is a design token?" open="">
          A named value, such as a colour or a spacing step, that components
          read instead of hardcoding it.
        </lui-accordion-item>
        <lui-accordion-item label="Can I switch brands at runtime?">
          Yes. Set data-brand on the root element and every token resolves
          again.
        </lui-accordion-item>
        <lui-accordion-item label="Is there a dark theme?" disabled="">
          Set data-theme to dark.
        </lui-accordion-item>
      </lui-accordion>
    </Stretch>
  );
}

export default {
  component: 'Accordion',
  variants: [
    { id: 'default', label: 'Default', props: { variant: 'default' } },
    { id: 'bordered', label: 'Bordered', props: { variant: 'bordered' } },
    {
      id: 'highlighted',
      label: 'Highlighted',
      props: { variant: 'highlighted' },
    },
    {
      id: 'multiple',
      label: 'Multiple open',
      props: { variant: 'bordered', multiple: true },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['default', 'bordered', 'highlighted'],
      defaultValue: 'default',
    },
    {
      kind: 'boolean',
      propName: 'multiple',
      label: 'Allow several open',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
