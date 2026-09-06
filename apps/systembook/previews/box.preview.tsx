import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-box {...elementProps(props)}>Content inside the box</lui-box>;
}

export default {
  component: 'Box',
  variants: [
    {
      id: 'surface',
      label: 'Surface',
      props: {
        padding: '24',
        background: 'neutral/surface',
        'border-radius': 'md',
      },
    },
    {
      id: 'outlined',
      label: 'Outlined',
      props: {
        padding: '24',
        'border-radius': 'md',
        'border-width': '1',
        'border-color': 'neutral/default',
      },
    },
  ],
  controls: [
    // Spacing takes a fluid token step; background and border colour take the
    // semantic `{category}/{variant}` aliases the layout resolvers accept.
    {
      kind: 'select',
      propName: 'padding',
      label: 'Padding',
      options: ['0', '8', '16', '24', '32', '48'],
      defaultValue: '24',
    },
    {
      kind: 'select',
      propName: 'background',
      label: 'Background',
      options: [
        'neutral/surface',
        'neutral/container',
        'primary/surface',
        'primary/container',
        'success/surface',
        'danger/surface',
      ],
      defaultValue: 'neutral/surface',
    },
    {
      kind: 'select',
      propName: 'border-radius',
      label: 'Radius',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'circle'],
      defaultValue: 'md',
    },
    {
      kind: 'select',
      propName: 'border-width',
      label: 'Border width',
      options: ['0', '1', '2', '4'],
      defaultValue: '0',
    },
  ],
} satisfies PreviewConfig;
