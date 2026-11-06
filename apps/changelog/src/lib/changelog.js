/**
 * Turns the repository's `CHANGELOG.md` (Keep a Changelog) into releases.
 *
 * Pure: a string goes in, plain objects come out. No file system, no DOM and
 * no Markdown renderer, so the root Vitest run can check it without this
 * app's dependencies installed.
 *
 * Everything a card shows is derived from the notes themselves: the type, the
 * title, the description and the highlights. Nothing is written by hand, so
 * editing `CHANGELOG.md` and rebuilding is the only way to change the site.
 */

/** Section headings, normalised to the kinds the site knows. */
const KINDS = {
  added: 'added',
  changed: 'changed',
  deprecated: 'changed',
  removed: 'removed',
  fixed: 'fixed',
  security: 'fixed',
};

/** Card type tags, as in the issue's content mapping. */
export const TYPE_LABELS = {
  new: 'New',
  improvement: 'Improvement',
  fix: 'Fix',
};

/** Which section a card leads with, per type. */
const LEAD = {
  new: ['added'],
  improvement: ['changed', 'removed'],
  fix: ['fixed'],
};

/** Order the highlights are taken in: what is new first, then fixes. */
const HIGHLIGHT_ORDER = ['added', 'fixed', 'changed', 'removed'];

export const MAX_HIGHLIGHTS = 4;
const TITLE_SOFT_LIMIT = 64;
const TITLE_HARD_LIMIT = 90;
const HIGHLIGHT_LIMIT = 150;

const RELEASE_HEADING =
  /^##\s+\[?v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?(?:\s+[-–—]\s+(\d{4}-\d{2}-\d{2}))?\s*$/;
const SECTION_HEADING = /^###\s+(.+?)\s*$/;
const ITEM = /^[-*+]\s+(.*)$/;
const ATTRIBUTION = /\s+(?:by @[\w-]+\s+)?in \[PR #\d+\]\([^)]*\)\.?\s*$/;

/**
 * @typedef {{ heading: string, kind: string | null, items: string[] }} Section
 * @typedef {{
 *   version: string,
 *   tag: string,
 *   slug: string,
 *   date: string | null,
 *   markdown: string,
 *   sections: Section[],
 *   counts: Record<string, number>,
 *   type: 'new' | 'improvement' | 'fix' | null,
 *   title: string,
 *   description: string,
 *   highlights: string[],
 * }} Release
 */

/**
 * @param {string} source The full `CHANGELOG.md`.
 * @returns {Release[]} Newest first, in the file's order.
 */
export function parseChangelog(source) {
  const lines = source.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  const releases = [];
  let current = null;

  for (const line of lines) {
    if (/^##\s/.test(line)) {
      const match = line.match(RELEASE_HEADING);
      // A heading that is not a version, such as "Unreleased", ends the
      // previous release and is skipped: it has no tag and no page.
      current = match
        ? { version: match[1], date: match[2] ?? null, body: [] }
        : null;
      if (current) releases.push(current);
      continue;
    }
    current?.body.push(line);
  }

  return releases.map(({ version, date, body }) => {
    const markdown = trimBody(body);
    const sections = parseSections(markdown);
    return summarise({
      version,
      tag: `v${version}`,
      slug: `v${version}`,
      date,
      markdown,
      sections,
    });
  });
}

/** Drops blank edges and the `---` rules that separate eras in the file. */
function trimBody(lines) {
  const kept = [...lines];
  const isEdge = (line) => line.trim() === '' || /^-{3,}\s*$/.test(line.trim());
  while (kept.length && isEdge(kept[0])) kept.shift();
  while (kept.length && isEdge(kept.at(-1))) kept.pop();
  return kept.join('\n');
}

/** Splits a release body into its `###` sections and top-level items. */
export function parseSections(markdown) {
  const sections = [];
  let section = null;
  let item = null;

  for (const line of markdown.split('\n')) {
    const heading = line.match(SECTION_HEADING);
    if (heading) {
      const name = heading[1].trim();
      section = {
        heading: name,
        kind: KINDS[name.toLowerCase()] ?? null,
        items: [],
      };
      sections.push(section);
      item = null;
      continue;
    }
    if (!section) continue;

    const bullet = line.match(ITEM);
    if (bullet) {
      item = [bullet[1]];
      section.items.push(item);
    } else if (item && /^\S/.test(line) && line.trim() !== '') {
      // A lazy continuation of the item's first paragraph.
      item.push(line.trim());
    } else if (line.trim() === '' || /^\s+[-*+]\s/.test(line)) {
      // Nested lists and blank lines belong to the full notes, not to the
      // item's own text.
      if (item) item.done = true;
    } else if (item && !item.done) {
      item.push(line.trim());
    }
  }

  return sections.map((s) => ({
    ...s,
    items: s.items.map((lines) => lines.join(' ')),
  }));
}

function summarise(release) {
  const counts = { added: 0, changed: 0, removed: 0, fixed: 0 };
  for (const section of release.sections) {
    if (section.kind) counts[section.kind] += section.items.length;
  }

  const type = counts.added
    ? 'new'
    : counts.changed || counts.removed
      ? 'improvement'
      : counts.fixed
        ? 'fix'
        : null;

  const itemsOf = (kinds) =>
    kinds.flatMap((kind) =>
      release.sections.filter((s) => s.kind === kind).flatMap((s) => s.items)
    );

  const lead = type ? itemsOf(LEAD[type])[0] : release.sections[0]?.items[0];
  const highlights = itemsOf(HIGHLIGHT_ORDER)
    .slice(0, MAX_HIGHLIGHTS)
    .map(highlight);

  return {
    ...release,
    counts,
    type,
    title: lead ? headline(lead) : release.tag,
    description: describe(counts),
    highlights,
  };
}

/** "This release has 1 addition, 2 changes and 4 fixes." */
export function describe(counts) {
  const parts = [
    plural(counts.added, 'addition', 'additions'),
    plural(counts.changed, 'change', 'changes'),
    plural(counts.fixed, 'fix', 'fixes'),
    plural(counts.removed, 'removal', 'removals'),
  ].filter(Boolean);
  if (!parts.length) return '';
  const list =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return `This release has ${list}.`;
}

function plural(count, one, many) {
  return count ? `${count} ${count === 1 ? one : many}` : '';
}

/** The item's first sentence, without the "by @user in PR #n" or "in PR #n" credit. */
export function firstSentence(text) {
  const clean = text.replace(ATTRIBUTION, '').trim();
  const end = boundaries(clean, /[.!?](?=\s+[A-Z`*"(_[])/g)[0];
  const sentence = end === undefined ? clean : clean.slice(0, end + 1);
  return sentence.replace(/[.!?:]$/, '').trim();
}

/** A highlight: the item's first sentence, shortened only when it is long. */
export function highlight(text) {
  return truncate(firstSentence(text), HIGHLIGHT_LIMIT);
}

/**
 * A card title: the lead item's first sentence, cut at its first clause when
 * long. "New `lui-progress-bar` Web Component and CSS-only `.progress-bar`
 * styles for showing how much of a task is done" becomes "New
 * `lui-progress-bar` Web Component and CSS-only `.progress-bar` styles".
 */
export function headline(text) {
  const sentence = firstSentence(text);
  if (visibleLength(sentence) <= TITLE_SOFT_LIMIT) return sentence;

  const cut = boundaries(
    sentence,
    /(?:: | [—–] |, | for | so | because | when | which | that | instead of | with )/g
  ).find((index) => visibleLength(sentence.slice(0, index)) >= 24);
  const clause = cut === undefined ? sentence : sentence.slice(0, cut).trim();
  return truncate(clause, TITLE_HARD_LIMIT);
}

/** Cuts at a word boundary outside code spans and adds an ellipsis. */
export function truncate(text, limit) {
  if (visibleLength(text) <= limit) return text;
  const spaces = boundaries(text, / /g).filter(
    (index) => visibleLength(text.slice(0, index)) <= limit - 1
  );
  const end = spaces.at(-1) ?? text.length;
  return `${balance(text.slice(0, end).replace(/[\s,;:(—–-]+$/, ''))}…`;
}

/** Closes emphasis left open by a cut. */
function balance(text) {
  let out = text;
  if ((out.match(/\*\*/g) ?? []).length % 2) out += '**';
  return out;
}

/** Length as read: without code and emphasis markers or link targets. */
function visibleLength(text) {
  return text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '')
    .length;
}

/** Indexes where `pattern` matches outside code spans, links and brackets. */
function boundaries(text, pattern) {
  const protectedRanges = [];
  for (const m of text.matchAll(
    /`[^`]*`|\[[^\]]*\]\([^)]*\)|\*\*[^*]*\*\*|\([^()]*\)/g
  )) {
    protectedRanges.push([m.index, m.index + m[0].length]);
  }
  const inside = (i) => protectedRanges.some(([a, b]) => i > a && i < b);
  return [...text.matchAll(pattern)]
    .map((m) => m.index)
    .filter((i) => !inside(i));
}

/**
 * Lowers every heading one level, so a release's `###` sections sit under the
 * page's `<h1>` as `<h2>`.
 */
export function promoteHeadings(markdown) {
  return markdown.replace(
    /^(#{2,6})(\s)/gm,
    (_, hashes, space) => `${hashes.slice(1)}${space}`
  );
}

/** `{ "v1.2.0": "2025-01-31" }` from `git for-each-ref` output. */
export function parseTagDates(output) {
  const dates = {};
  for (const line of output.split('\n')) {
    const [name, date] = line.trim().split(/\s+/);
    if (name && /^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) dates[name] = date;
  }
  return dates;
}

/** Fills in each release's date from its tag, unless the notes have one. */
export function withTagDates(releases, tagDates) {
  return releases.map((release) => ({
    ...release,
    date: release.date ?? tagDates[release.tag] ?? null,
  }));
}
