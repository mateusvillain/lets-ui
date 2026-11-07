import type { PreviewConfig } from '@systembook/schema';
import { elementProps } from './element';

export function Preview(props: Record<string, unknown>) {
  return <lui-otp-input {...elementProps(props)} />;
}

export default {
  component: 'OtpInput',
  variants: [
    {
      id: 'default',
      label: 'Default',
      props: {
        type: 'number',
        label: 'Verification code',
        'show-label': true,
        hint: 'Enter the 6-digit code sent by SMS.',
      },
    },
    {
      id: 'separator',
      label: 'With separator',
      props: {
        type: 'number',
        label: 'Verification code',
        'show-label': true,
        separator: '3',
      },
    },
    {
      id: 'length',
      label: 'Four characters',
      props: {
        type: 'number',
        length: '4',
        label: 'PIN',
        'show-label': true,
      },
    },
    {
      id: 'error',
      label: 'Error',
      props: {
        type: 'number',
        label: 'Verification code',
        'show-label': true,
        value: '482',
        error: true,
        'error-text': 'The code is incomplete.',
      },
    },
    {
      id: 'disabled',
      label: 'Disabled',
      props: {
        type: 'number',
        label: 'Verification code',
        'show-label': true,
        disabled: true,
      },
    },
  ],
  controls: [
    { kind: 'text', propName: 'label', label: 'Label' },
    {
      kind: 'boolean',
      propName: 'show-label',
      label: 'Show label',
      defaultValue: true,
    },
    { kind: 'text', propName: 'hint', label: 'Hint' },
    {
      kind: 'select',
      propName: 'type',
      label: 'Type',
      options: ['text', 'number'],
      defaultValue: 'number',
    },
    {
      kind: 'select',
      propName: 'length',
      label: 'Length',
      options: ['4', '6', '8'],
      defaultValue: '6',
    },
    {
      kind: 'select',
      propName: 'separator',
      label: 'Separator',
      options: ['', '2', '3', '4', '2,4'],
      defaultValue: '',
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
