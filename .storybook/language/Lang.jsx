/**
 * Language-scoped block for docs (`.mdx`) pages and stories.
 *
 * Wraps content in a `data-lang` element that the `language.css` rules show
 * only when the active toolbar language matches. Docs pages are not wrapped
 * by the preview decorators, so the active language reaches them through the
 * `SET_GLOBALS`/`UPDATE_GLOBALS` channel listeners in `preview.js`, which
 * keep `<html data-language>` up to date.
 *
 * ```mdx
 * import { Lang } from '../../.storybook/language/Lang.jsx';
 *
 * <Lang lang="pt-BR">
 *   ## Quando usar
 *
 *   Use o Button para ações...
 * </Lang>
 * ```
 *
 * Blocks stay in source order per language: keep one `Lang` per language side
 * by side, each with the same headings, so the outline and anchors match.
 *
 * @type {import('react').FC<{
 *   lang: 'pt-BR' | 'en-US';
 *   children?: import('react').ReactNode;
 * }>}
 */
export default function Lang({ lang, children }) {
  return <div data-lang={lang}>{children}</div>;
}

// A named export keeps `import { Lang } from '.../Lang.jsx'` working alongside
// the default one when the MDX compiler re-writes imports.
export { Lang };
