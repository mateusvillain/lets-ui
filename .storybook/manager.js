import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_GLOBAL,
  normalizeLanguage,
} from './language/language.js';
import { localizedStoryName, localizedTitle } from './language/storyNames.js';

addons.setConfig({
  theme: create({
    base: 'light',

    // Brand
    brandTitle: "Let's UI",
    brandUrl: '/',
    brandImage: '/logo.svg',
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

/**
 * Translates the menu (groups, pages and story names) in the sidebar.
 *
 * Only the label is translated, through `sidebar.renderLabel`; the index itself
 * is left alone. Sidebar ids are derived from the title segments, so rewriting
 * the titles would change them on every language switch — and the sidebar keys
 * its expanded/collapsed state by id, so every translated group would come back
 * collapsed. Keeping the ids also keeps URLs, the selection and search stable.
 */
let language = DEFAULT_LANGUAGE;

const languageOf = (globals = {}) =>
  normalizeLanguage(
    globals.userGlobals?.[LANGUAGE_GLOBAL] ?? globals[LANGUAGE_GLOBAL]
  );

addons.setConfig({
  sidebar: {
    renderLabel: (item) => {
      if (item.type !== 'story' && item.type !== 'docs') {
        return localizedTitle(item.name, language);
      }
      const name = localizedStoryName(item.name, language, item.type);
      // A component with a single entry is shown as a leaf under the
      // component's name, which is a title segment rather than a story name.
      return name === item.name ? localizedTitle(item.name, language) : name;
    },
  },
});

addons.register('lets-ui/sidebar-language', (api) => {
  const channel = addons.getChannel();

  const onGlobals = (globals) => {
    const next = languageOf(globals);
    if (next === language) return;
    language = next;
    // Rebuilding the hash from the same index re-renders every label with the
    // new language; the ids do not change, so neither does the expanded state.
    const index = api.getIndex();
    if (index) api.setIndex(index);
  };

  language = languageOf(api.getGlobals?.());
  channel.on('setGlobals', onGlobals);
  channel.on('globalsUpdated', onGlobals);
});
