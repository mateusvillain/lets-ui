import GithubSlugger from 'github-slugger';

import { LANGUAGES } from './language.js';

/**
 * Gives the headings of each `<Lang>` block ids slugged per language.
 *
 * Storybook slugs headings with `rehype-slug`, which keeps a single counter per
 * page. A docs page carries the same section twice — once per `<Lang>` block —
 * and headings that read the same in both languages (`## Trigger`, `## Slots`,
 * `# Dropdown Menu`) came out as `trigger` and `trigger-1`, so the English
 * anchor depended on the Portuguese text above it.
 *
 * This plugin runs before `rehype-slug` (Storybook appends it after the
 * project's plugins) and slugs with one counter per language, so both sides
 * get `trigger`. `rehype-slug` leaves headings that already have an id alone.
 * The ids only stay unique in the page because `<Lang>` mounts the active
 * language alone.
 *
 * Headings outside any `<Lang>` show in both languages, so they take a slug
 * from every counter, and no localized heading can reuse their id.
 */
export default function rehypeLangSlug() {
  return (tree) => {
    const sluggers = new Map(
      LANGUAGES.map(({ value }) => [value, new GithubSlugger()])
    );

    const visit = (node, language) => {
      const scope = langOf(node) ?? language;

      if (isHeading(node) && !node.properties?.id) {
        const text = toText(node);
        const ids = sluggers.has(scope)
          ? [sluggers.get(scope).slug(text)]
          : [...sluggers.values()].map((slugger) => slugger.slug(text));
        node.properties = { ...node.properties, id: ids[0] };
      }

      for (const child of node.children ?? []) visit(child, scope);
    };

    visit(tree, undefined);
  };
}

/** The `lang` of a `<Lang>` element, or `undefined` for any other node. */
function langOf(node) {
  if (node.type !== 'mdxJsxFlowElement' || node.name !== 'Lang') return;
  const attribute = node.attributes?.find(
    (item) => item.type === 'mdxJsxAttribute' && item.name === 'lang'
  );
  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}

function isHeading(node) {
  return node.type === 'element' && /^h[1-6]$/.test(node.tagName);
}

/** Same text extraction as `hast-util-to-string`, which `rehype-slug` uses. */
function toText(node) {
  if ('children' in node) return node.children.map(toText).join('');
  return 'value' in node ? node.value : '';
}
