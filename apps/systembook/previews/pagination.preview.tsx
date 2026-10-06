import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-pagination {...elementProps(props)} />;
}

export default {
  component: 'Pagination',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { 'current-page': 5, 'total-pages': 20 },
    },
    {
      id: 'few-pages',
      label: 'Few pages',
      props: { 'current-page': 2, 'total-pages': 5 },
    },
  ],
  controls: [
    {
      kind: 'text',
      propName: 'current-page',
      label: 'Current page',
    },
    { kind: 'text', propName: 'total-pages', label: 'Total pages' },
    {
      kind: 'select',
      propName: 'sibling-count',
      label: 'Siblings',
      options: ['0', '1', '2'],
      defaultValue: '1',
    },
  ],
} satisfies PreviewConfig;
