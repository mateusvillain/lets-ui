import { addons } from 'storybook/preview-api';

import './language/language.css';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_ATTRIBUTE,
  LANGUAGE_GLOBAL,
  activeLanguage,
} from './language/language.js';
import { registerTranslation } from '../packages/lets-ui-components/src/utils/i18n.js';
import { ptBR } from '../packages/lets-ui-components/src/locales/pt-BR.js';

// The language switcher sets `<html lang>`, so with Portuguese registered the
// components' own text — validation messages, accessible names, "(optional)"
// — follows it too. English needs no registration: it is built in.
registerTranslation(ptBR);

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

/**
 * Wraps the story in an element carrying `dir`, rather than setting it on
 * `<html>`: on a docs page that would mirror the documentation's own text too.
 * `display: contents` keeps the wrapper out of the layout, and anything the
 * story renders — a drawer, a toast region — is still inside it, so it
 * inherits the direction.
 *
 * @param {string | Node} story What the story returned.
 * @param {unknown} direction The `direction` global.
 * @returns {string | Node}
 */
function withDirection(story, direction) {
  if (direction !== 'rtl') return story;
  if (typeof story === 'string') {
    return `<div dir="rtl" style="display: contents">${story}</div>`;
  }
  const wrapper = document.createElement('div');
  wrapper.dir = 'rtl';
  wrapper.style.display = 'contents';
  wrapper.append(story);
  return wrapper;
}

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
    direction: {
      name: 'Direction',
      description:
        'Direção de escrita das stories. Só os exemplos se espelham; o texto da documentação continua da esquerda para a direita.',
      toolbar: {
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR — esquerda para a direita' },
          { value: 'rtl', title: 'RTL — direita para a esquerda' },
        ],
        dynamicTitle: true,
      },
    },
  },

  // Modern replacements for the `defaultValue` fields above, which Storybook
  // ignores since v8. The language defaults here; theme and brand keep the
  // legacy fields until this config is migrated.
  initialGlobals: {
    language: DEFAULT_LANGUAGE,
    direction: 'ltr',
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

      return withDirection(Story(), context.globals.direction);
    },
  ],
};

export default preview;
