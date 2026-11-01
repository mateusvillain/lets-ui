import { useSyncExternalStore } from 'react';

import { DEFAULT_LANGUAGE, LANGUAGE_ATTRIBUTE } from './language.js';

/**
 * Language-scoped block for docs (`.mdx`) pages and stories.
 *
 * Renders its children only while `lang` is the active toolbar language; the
 * other language's block is not mounted at all. Both languages usually share
 * headings (`## Trigger`, `## Slots`, …), and `rehypeLangSlug` gives each
 * language its own ids, so both sides get `#trigger`. Mounting only one side
 * keeps those ids unique in the page, and the outline and anchors match the
 * language being read.
 *
 * Docs pages are not wrapped by the preview decorators, so the active language
 * is read from `<html data-language>`. `preview.js` sets it from the `globals`
 * URL parameter on load and from the `globalsUpdated` channel event whenever the
 * toolbar changes; this component re-renders when the attribute changes.
 *
 * ```mdx
 * import { Lang } from '@docs-lang/Lang.jsx';
 *
 * <Lang lang="pt-BR">
 *   ## Quando usar
 *
 *   Use o Button para ações...
 * </Lang>
 *
 * <Lang lang="en-US">
 *   ## When to use
 *
 *   Use the Button for actions...
 * </Lang>
 * ```
 *
 * @type {import('react').FC<{
 *   lang: 'pt-BR' | 'en-US';
 *   children?: import('react').ReactNode;
 * }>}
 */
export default function Lang({ lang, children }) {
  const active = useSyncExternalStore(subscribe, readLanguage, readLanguage);
  if (lang !== active) return null;
  // `data-lang` stays so `language.css` applies to the block like to any other.
  return <div data-lang={lang}>{children}</div>;
}

/** Reads the active language from `<html data-language>`. */
function readLanguage() {
  return (
    document.documentElement.getAttribute(LANGUAGE_ATTRIBUTE) ??
    DEFAULT_LANGUAGE
  );
}

/** Notifies React whenever `<html data-language>` changes. */
function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [LANGUAGE_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

// A named export keeps `import { Lang } from '.../Lang.jsx'` working alongside
// the default one when the MDX compiler re-writes imports.
export { Lang };
