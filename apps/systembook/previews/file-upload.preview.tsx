import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return (
    <div style={{ width: 400, maxWidth: '100%' }}>
      <lui-file-upload {...elementProps(props)} />
    </div>
  );
}

export default {
  component: 'FileUpload',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        label: 'Receipt',
        'zone-title': 'Upload file',
        description: 'Drop the file here or click to browse',
        accept: '.pdf,.png',
        'max-size': '5242880',
      },
    },
    {
      id: 'multiple',
      label: 'Multiple files',
      props: {
        label: 'Attachments',
        'zone-title': 'Upload files',
        description: 'Drop the files here or click to browse',
        accept: '.pdf,.png,.jpg',
        'max-size': '5242880',
        'max-files': '3',
        multiple: true,
        optional: true,
      },
    },
    {
      id: 'drag-active',
      label: 'Dragging files',
      props: {
        label: 'Receipt',
        'zone-title': 'Upload file',
        description: 'Drop the file here or click to browse',
        accept: '.pdf,.png',
        'force-state': 'drag-active',
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        label: 'Receipt',
        'zone-title': 'Upload file',
        description: 'Drop the file here or click to browse',
        accept: '.pdf,.png',
        required: true,
        error: true,
        'error-text': 'Attach the receipt to continue.',
      },
    },
    {
      id: 'disabled',
      label: 'Disabled',
      props: {
        label: 'Receipt',
        'zone-title': 'Upload file',
        description: 'Drop the file here or click to browse',
        accept: '.pdf,.png',
        disabled: true,
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'zone-title', label: 'Zone title' },
    { kind: 'text', propName: 'description', label: 'Description' },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    { kind: 'text', propName: 'accept', label: 'Accept' },
    {
      kind: 'boolean',
      propName: 'multiple',
      label: 'Multiple',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'optional',
      label: 'Optional',
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
