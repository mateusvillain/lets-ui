import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',

    // Brand
    brandTitle: "Let's UI",
    brandUrl: '/',
    brandImage: '/docs/public/logo.svg',
    brandTarget: '_self',

    // Accent — brand.color.primary.{4,5}
    colorPrimary: '#8733ff',
    colorSecondary: '#6825db',

    // Shell — neutral.background + neutral.border tokens
    appBg: '#f9f9f9',
    appContentBg: '#ffffff',
    appHoverBg: '#edd6ff',
    appPreviewBg: '#ffffff',
    appBorderColor: '#c7cad4',
    appBorderRadius: 8,

    // Typography — brand.typography.font-family.body + neutral.text tokens
    fontBase:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif',
    fontCode:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
    textColor: '#282b33',
    textInverseColor: '#ffffff',
    textMutedColor: '#6c7081',

    // Toolbar — neutral tokens
    barBg: '#ffffff',
    barTextColor: '#545867',
    barHoverColor: '#8733ff',
    barSelectedColor: '#8733ff',

    // Buttons — neutral.background + neutral.border
    buttonBg: '#eeecf1',
    buttonBorder: '#c7cad4',

    // Toggles — neutral.border + brand.primary
    booleanBg: '#c7cad4',
    booleanSelectedBg: '#8733ff',

    // Inputs — neutral tokens + radius.sm
    inputBg: '#ffffff',
    inputBorder: '#c7cad4',
    inputTextColor: '#282b33',
    inputBorderRadius: 4,
  }),
});
