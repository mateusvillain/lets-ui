import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-avatar {...elementProps(props)} />;
}

export default {
  component: 'Avatar',
  variants: [
    {
      id: 'initials',
      label: 'Initials',
      props: { name: 'Mateus Villain', variant: 'blue', size: 'lg' },
    },
    {
      id: 'status',
      label: 'With status',
      props: {
        name: 'Mateus Villain',
        variant: 'green',
        size: 'lg',
        status: 'online',
      },
    },
    {
      id: 'placeholder',
      label: 'Placeholder',
      props: { size: 'lg', 'aria-label': 'Anonymous user' },
    },
  ],
  controls: [
    { kind: 'text', propName: 'name', label: 'Name' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['gray', 'blue', 'green', 'orange', 'red', 'violet'],
      defaultValue: 'blue',
    },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'lg',
    },
    {
      kind: 'select',
      propName: 'radius',
      label: 'Shape',
      options: ['circle', 'rounded', 'square'],
      defaultValue: 'circle',
    },
    {
      kind: 'select',
      propName: 'status',
      label: 'Status',
      options: ['', 'online', 'away', 'busy', 'offline'],
      defaultValue: '',
    },
  ],
} satisfies PreviewConfig;
