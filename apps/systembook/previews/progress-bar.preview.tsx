import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

// The bar fills the width it is given, so it gets the whole iframe instead of
// shrinking to its label in the centred preview page.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-progress-bar {...elementProps(props)} />
    </Stretch>
  );
}

export default {
  component: 'ProgressBar',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        value: 40,
        label: 'Uploading files',
        caption: '8 of 20 files',
      },
    },
    {
      id: 'inline',
      label: 'Inline label',
      props: {
        value: 3,
        max: 4,
        'value-text': '3 of 4 steps',
        'label-placement': 'inline',
        label: 'Steps',
      },
    },
    {
      id: 'success',
      label: 'Success',
      props: {
        value: 100,
        variant: 'success',
        label: 'Uploading files',
        caption: 'Upload complete',
      },
    },
    {
      id: 'danger',
      label: 'Danger',
      props: {
        value: 65,
        variant: 'danger',
        label: 'Uploading files',
        caption: 'Upload failed: connection lost',
      },
    },
    {
      id: 'custom-unit',
      label: 'Custom unit',
      props: {
        value: 3.2,
        max: 10,
        'value-text': '3.2 GB of 10 GB',
        label: 'Storage',
      },
    },
    {
      id: 'indeterminate',
      label: 'Indeterminate',
      props: { label: 'Loading', caption: 'Preparing the import' },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    { kind: 'text', propName: 'value', label: 'Value (empty = indeterminate)' },
    { kind: 'text', propName: 'max', label: 'Max' },
    { kind: 'text', propName: 'value-text', label: 'Value text' },
    { kind: 'text', propName: 'caption', label: 'Caption' },
    {
      kind: 'select',
      propName: 'variant',
      label: 'Variant',
      options: ['primary', 'success', 'caution', 'danger'],
      defaultValue: 'primary',
    },
    {
      kind: 'select',
      propName: 'size',
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    {
      kind: 'select',
      propName: 'label-placement',
      label: 'Label placement',
      options: ['top', 'inline'],
      defaultValue: 'top',
    },
    {
      kind: 'boolean',
      propName: 'hide-label',
      label: 'Hide label',
      defaultValue: false,
    },
    {
      kind: 'boolean',
      propName: 'hide-value',
      label: 'Hide value',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
