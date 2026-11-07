import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

// The calendar is positioned out of flow, so the centred preview page would
// centre the field alone and push the open calendar past the bottom edge.
// Reserving its height keeps the whole popover inside the frame.
const CALENDAR_HEIGHT = 340;

export function Preview(props: Record<string, unknown>) {
  const picker = <lui-date-picker {...elementProps(props)} />;

  if (!props.open) return picker;

  return <div style={{ paddingBottom: CALENDAR_HEIGHT }}>{picker}</div>;
}

export default {
  component: 'DatePicker',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: { label: 'Due date', value: '2026-01-16', size: 'lg' },
    },
    {
      id: 'open',
      label: 'Open',
      props: { label: 'Due date', value: '2026-01-16', size: 'lg', open: true },
    },
    {
      id: 'range',
      label: 'Range',
      props: {
        label: 'Stay',
        range: true,
        value: '2026-01-16/2026-01-21',
        size: 'lg',
      },
    },
    {
      id: 'editable',
      label: 'Editable',
      props: { label: 'Date of birth', editable: true, size: 'lg' },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Due date',
        required: true,
        error: true,
        'error-text': 'Choose a due date.',
        size: 'lg',
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'value', label: 'Value (ISO 8601)' },
    { kind: 'text', propName: 'min', label: 'Min' },
    { kind: 'text', propName: 'max', label: 'Max' },
    { kind: 'text', propName: 'locale', label: 'Locale' },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['lg', 'md'],
      defaultValue: 'lg',
    },
    { kind: 'boolean', propName: 'range', label: 'Range', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'editable',
      label: 'Editable',
      defaultValue: false,
    },
    { kind: 'boolean', propName: 'error', label: 'Error', defaultValue: false },
    {
      kind: 'boolean',
      propName: 'disabled',
      label: 'Disabled',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
