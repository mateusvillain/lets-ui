import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

const STEPS = [
  { label: 'Account', description: 'Your details' },
  { label: 'Address', description: 'Shipping' },
  { label: 'Payment', description: 'Card or PIX' },
  { label: 'Review', description: 'Confirm the order' },
];

// The steps are slotted structure, so they live here and not in a control.
// `demo` is not an attribute of lui-stepper: `numbers` drops the step texts
// and `loading` marks the current step as loading.
export function Preview({ demo, ...props }: Record<string, unknown>) {
  const current = Number(props['current-step'] ?? 1);

  return (
    <Stretch>
      <lui-stepper {...elementProps(props)}>
        {STEPS.map((step, index) => (
          <lui-step
            key={step.label}
            label={demo === 'numbers' ? undefined : step.label}
            description={demo === 'numbers' ? undefined : step.description}
            loading={
              demo === 'loading' && index + 1 === current ? '' : undefined
            }
          />
        ))}
      </lui-stepper>
    </Stretch>
  );
}

export default {
  component: 'Stepper',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { 'current-step': '2', label: 'Checkout' },
    },
    {
      id: 'vertical',
      label: 'Vertical',
      props: {
        'current-step': '2',
        label: 'Checkout',
        orientation: 'vertical',
      },
    },
    {
      id: 'labels-bottom',
      label: 'Labels below',
      props: {
        'current-step': '2',
        label: 'Checkout',
        'label-placement': 'bottom',
      },
    },
    {
      id: 'numbers',
      label: 'Numbers only',
      props: { 'current-step': '3', label: 'Checkout', demo: 'numbers' },
    },
    {
      id: 'loading',
      label: 'Loading',
      props: { 'current-step': '2', label: 'Checkout', demo: 'loading' },
    },
  ],
  controls: [
    {
      kind: 'select',
      propName: 'current-step',
      label: 'Current step',
      options: ['1', '2', '3', '4'],
      defaultValue: '2',
    },
    {
      kind: 'select',
      propName: 'orientation',
      label: 'Orientation',
      options: ['horizontal', 'vertical'],
      defaultValue: 'horizontal',
    },
    {
      kind: 'select',
      propName: 'label-placement',
      label: 'Label placement',
      options: ['end', 'bottom'],
      defaultValue: 'end',
    },
    {
      kind: 'boolean',
      propName: 'linear',
      label: 'Linear',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
