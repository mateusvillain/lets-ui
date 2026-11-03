import { addons } from 'storybook/preview-api';

import './language/language.css';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_ATTRIBUTE,
  LANGUAGE_GLOBAL,
  activeLanguage,
} from './language/language.js';

/**
 * Docs (`.mdx`) pages are not wrapped by the preview decorators, so the language
 * has to reach them otherwise. Two mechanisms keep `<html data-language>` up to
 * date there:
 *
 * - On load, the iframe URL carries the persisted globals (`globals=language:en-US`),
 *   which are parsed below; the preview store itself receives no event at init.
 * - When the toolbar changes the global, the manager sends `updateGlobals` with a
 *   delta, and the preview answers with `globalsUpdated`, which always carries the
 *   full globals — both `userGlobals` (user's choice) and the merged `globals`.
 *
 * Stories additionally stay in sync through the decorator below, which runs on
 * every re-render. Language scoping itself is attribute-based: the
 * `language.css` rules hide every `[data-lang]` block that does not match
 * `<html data-language>`.
 *
 * @param {Record<string, unknown>} [globals]
 */
function applyLanguageGlobals(globals = {}) {
  const language = activeLanguage(globals.userGlobals ?? globals);
  document.documentElement.setAttribute(LANGUAGE_ATTRIBUTE, language);
  document.documentElement.lang = language;
}

/** Parses the `globals` URL parameter (`key:value;key:value`). */
function persistedLanguage() {
  const raw = new URLSearchParams(window.location.search).get('globals');
  if (!raw) return {};
  const pair = raw
    .split(';')
    .map((part) => part.split(':'))
    .find(([key]) => key === LANGUAGE_GLOBAL);
  return pair ? { [LANGUAGE_GLOBAL]: pair[1] } : {};
}

applyLanguageGlobals(persistedLanguage());
addons.getChannel().on('globalsUpdated', applyLanguageGlobals);

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
          'Typography',
          ['Heading', 'Body', 'Shortcut'],
          'Layout',
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
    language: {
      name: 'Language',
      description:
        'Idioma das stories e da documentação que optarem por se localizar via `data-lang`.',
      toolbar: {
        icon: 'globe',
        items: LANGUAGES,
      },
    },
  },

  // Modern replacements for the `defaultValue` fields above, which Storybook
  // ignores since v8. The language defaults here; theme and brand keep the
  // legacy fields until this config is migrated.
  initialGlobals: {
    language: DEFAULT_LANGUAGE,
  },

  decorators: [
    (Story, context) => {
      const { theme } = context.globals;
      const { brand } = context.globals;
      const language = activeLanguage(context.globals);

      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-brand', brand);
      document.documentElement.setAttribute(LANGUAGE_ATTRIBUTE, language);
      document.documentElement.lang = language;

      return Story();
    },
  ],
};

export default preview;
