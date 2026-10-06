import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-link {...elementProps(props)} />;
}

export default {
  component: 'Link',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { label: 'Read the token guide', href: '#' },
    },
    {
      id: 'external',
      label: 'External',
      props: {
        label: 'Terrazzo documentation',
        href: 'https://terrazzo.app',
        target: '_blank',
        external: true,
      },
    },
    {
      id: 'disabled',
      label: 'Disabled',
      props: { label: 'Not available yet', href: '#', disabled: true },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Text' },
    { kind: 'text', propName: 'href', label: 'Href' },
    {
      kind: 'boolean',
      propName: 'external',
      label: 'External',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'visited',
      label: 'Visited',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
