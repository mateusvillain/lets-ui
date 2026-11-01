import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

import { DEFAULT_LANGUAGE, LANGUAGE_GLOBAL } from './language/language.js';
import { localizedStoryName } from './language/storyNames.js';

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
 * Translates the story names in the sidebar.
 *
 * Story names are baked into `index.json`, so the language toolbar cannot change
 * them on its own. This addon keeps a pristine copy of the index, rewrites the
 * `name` of every entry through `storyNames.js` and hands the result back to the
 * manager, which rebuilds the sidebar. Ids, titles and the current selection are
 * untouched: only what is displayed changes.
 */
addons.register('lets-ui/sidebar-language', (api) => {
  const channel = addons.getChannel();
  let sourceIndex;
  let appliedLanguage;
  let localized = false;

  const apply = (globals = {}) => {
    const language =
      globals.userGlobals?.[LANGUAGE_GLOBAL] ??
      globals[LANGUAGE_GLOBAL] ??
      DEFAULT_LANGUAGE;
    if (!sourceIndex || language === appliedLanguage) return;
    appliedLanguage = language;
    // The index already carries the names for the default language, so the
    // first render in it needs no rewrite at all.
    if (!localized && language === DEFAULT_LANGUAGE) return;
    localized = language !== DEFAULT_LANGUAGE;

    const entries = {};
    for (const [id, entry] of Object.entries(sourceIndex.entries)) {
      entries[id] = {
        ...entry,
        name: localizedStoryName(entry.name, language),
      };
    }

    api.setIndex({ v: sourceIndex.v, entries });
  };

  fetch('index.json')
    .then((response) => response.json())
    .then((index) => {
      sourceIndex = index;
      apply(api.getGlobals());
    })
    .catch(() => {
      // No index to rewrite: the sidebar keeps the names from the story files.
    });

  channel.on('setGlobals', apply);
  channel.on('globalsUpdated', apply);
});
