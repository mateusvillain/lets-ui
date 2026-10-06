import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The items are read from the slot and re-rendered as a real `<ol>`: the last
// one carries `active` and becomes the `aria-current="page"` entry.
export function Preview(props: Record<string, unknown>) {
  return (
    <lui-breadcrumb {...elementProps(props)}>
      <lui-breadcrumb-item href="#">Home</lui-breadcrumb-item>
      <lui-breadcrumb-item href="#">Foundations</lui-breadcrumb-item>
      <lui-breadcrumb-item active="">Colour</lui-breadcrumb-item>
    </lui-breadcrumb>
  );
}

export default {
  component: 'Breadcrumb',
  variants: [{ id: 'default', label: 'Default', props: {} }],
  controls: [
    { kind: 'text', propName: 'aria-label', label: 'Accessible name' },
  ],
} satisfies PreviewConfig;
