/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        order: [
          'Get started',
          ['Welcome', 'Designers', 'Developers', 'Changelog'],
          'Foundations',
          'Actionable',
          'Navigation',
          'Form and options',
          'Content',
          'Miscellaneous',
          'Utilities',
          ['Functions', 'Mixins', 'Flex'],
        ],
      },
    },

    a11y: {
      test: 'todo',
    },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Modo de cor',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
    brand: {
      name: 'Brand',
      description: 'Marca',
      defaultValue: 'lets-ui',
      toolbar: {
        icon: 'circlehollow',
        items: [{ value: 'lets-ui', title: "Let's UI" }],
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      const { brand } = context.globals;

      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-brand', brand);

      return Story();
    },
  ],
};

export default preview;
