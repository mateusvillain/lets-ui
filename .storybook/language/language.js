/**
 * Storybook language support.
 *
 * The editor's toolbar exposes one global for the language (`pt-BR` and
 * `en-US`). Blocks in stories and docs that declare a language — through the
 * `data-lang` attribute on a wrapped element — show only in that language;
 * everything else stays language-agnostic and appears in both.
 */

/** The global that holds the language. Matches the keys of `LANGUAGES`. */
export const LANGUAGE_GLOBAL = 'language';

/** Language used when the global is not set — the toolbar's default. */
export const DEFAULT_LANGUAGE = 'pt-BR';

/** Options for the toolbar selector in `preview.js`. */
export const LANGUAGES = [
  { value: 'pt-BR', title: 'Português (BR)' },
  { value: 'en-US', title: 'English' },
];

/** Attribute the preview sets on `<html>` with the active language. */
export const LANGUAGE_ATTRIBUTE = 'data-language';

/**
 * Reads the active language in a story or docs context.
 *
 * @param {Record<string, unknown>} globals The `context.globals` of the story.
 * @returns {'pt-BR' | 'en-US'}
 */
export function activeLanguage(globals = {}) {
  return globals[LANGUAGE_GLOBAL] ?? DEFAULT_LANGUAGE;
}
