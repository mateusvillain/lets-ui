import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe as group, expect, it } from 'vitest';

import {
  describe,
  firstSentence,
  headline,
  highlight,
  MAX_HIGHLIGHTS,
  parseChangelog,
  parseTagDates,
  promoteHeadings,
  translate,
  truncate,
  withTagDates,
} from './changelog.js';

const readRoot = (name) =>
  readFileSync(
    fileURLToPath(new URL(`../../../../${name}`, import.meta.url)),
    'utf8'
  );

const SAMPLE = `# Changelog

## Unreleased

### Added

- Not released yet.

## v2.1.0

### Added

- New \`lui-thing\` Web Component and CSS-only \`.thing\` styles for showing things, with a long explanation. A second sentence.
  - A nested detail that belongs to the full notes only.
- Second addition.

### Fixed

- Something broke. It works now.

## v2.0.1

### Fixed

- Fix a crash by @someone in [PR #12](https://github.com/x/y/pull/12)

---

<!-- An era note. -->

## 1.0.0 - 2024-05-01

### Changed

- Renamed a token.

### Removed

- An old mixin.
`;

group('parseChangelog', () => {
  const releases = parseChangelog(SAMPLE);

  it('reads every versioned heading, newest first, and skips Unreleased', () => {
    expect(releases.map((r) => r.version)).toEqual(['2.1.0', '2.0.1', '1.0.0']);
    expect(releases.map((r) => r.slug)).toEqual(['v2.1.0', 'v2.0.1', 'v1.0.0']);
  });

  it('keeps the full section, nested bullets included, for the notes page', () => {
    expect(releases[0].markdown).toContain(
      'A nested detail that belongs to the full notes only.'
    );
    expect(releases[0].markdown.startsWith('### Added')).toBe(true);
  });

  it('drops era rules and HTML comments from the body', () => {
    expect(releases[1].markdown).not.toContain('---');
    expect(releases[1].markdown).not.toContain('era note');
  });

  it('groups items by section, without nested bullets', () => {
    const [added, fixed] = releases[0].sections;
    expect(added.kind).toBe('added');
    expect(added.items).toHaveLength(2);
    expect(added.items[0]).not.toContain('nested detail');
    expect(fixed.items).toEqual(['Something broke. It works now.']);
  });

  it('gives a release the type of its section with the most items', () => {
    expect(releases.map((r) => r.type)).toEqual(['new', 'fix', 'improvement']);
  });

  it('favours fixes over a minor addition or change when they have more items', () => {
    const patch = parseChangelog(`# Changelog

## v1.13.1

### Added

- One minor addition.

### Fixed

- First fix.
- Second fix.
- Third fix.
`);
    expect(patch[0].type).toBe('fix');
  });

  it('takes a date from the heading when the notes have one, never inventing it', () => {
    expect(releases[0].date).toBeNull();
    expect(releases[2].date).toBe('2024-05-01');
  });

  it('derives the title from the lead item', () => {
    expect(releases[0].title).toBe(
      'New `lui-thing` Web Component and CSS-only `.thing` styles'
    );
    expect(releases[1].title).toBe('Fix a crash');
    expect(releases[2].title).toBe('Renamed a token');
  });

  it('lists highlights from the real items, additions first', () => {
    expect(releases[0].highlights).toEqual([
      'New `lui-thing` Web Component and CSS-only `.thing` styles for showing things, with a long explanation',
      'Second addition',
      'Something broke',
    ]);
  });

  it('summarises the counts in the description', () => {
    expect(releases[0].description).toBe(
      'This release has 2 additions and 1 fix.'
    );
    expect(releases[2].description).toBe(
      'This release has 1 change and 1 removal.'
    );
  });
});

group('the repository CHANGELOG.md', () => {
  const source = readRoot('CHANGELOG.md');
  const releases = parseChangelog(source);
  const headings = source.match(/^## v?\d+\.\d+\.\d+/gm);

  it('has a release for every version heading', () => {
    expect(releases).toHaveLength(headings.length);
  });

  it('gives every release a type, a title and at most four highlights', () => {
    for (const release of releases) {
      expect(release.type, release.tag).not.toBeNull();
      expect(release.title.length, release.tag).toBeGreaterThan(0);
      expect(release.highlights.length, release.tag).toBeGreaterThan(0);
      expect(release.highlights.length, release.tag).toBeLessThanOrEqual(
        MAX_HIGHLIGHTS
      );
    }
  });

  it('keeps every item of a release in its notes', () => {
    for (const release of releases) {
      const items = release.sections.flatMap((s) => s.items);
      for (const item of items)
        expect(release.markdown, release.tag).toContain(item.split(' ')[0]);
    }
  });
});

const SAMPLE_PT = `# Changelog

## v2.1.0

### Adicionado

- Novo Web Component \`lui-thing\` e estilos CSS-only \`.thing\` para mostrar coisas, com uma explicação longa. Uma segunda frase.
- Segunda adição.

### Corrigido

- Algo quebrou. Agora funciona.

## 1.0.0 - 2024-05-01

### Alterado

- Token renomeado por @someone em [PR #12](https://github.com/x/y/pull/12)

### Removido

- Um mixin antigo.
`;

group('a translated changelog', () => {
  const releases = parseChangelog(SAMPLE_PT, { locale: 'pt' });

  it('reads Portuguese section headings as the same kinds', () => {
    expect(releases[0].sections.map((s) => s.kind)).toEqual(['added', 'fixed']);
    expect(releases.map((r) => r.type)).toEqual(['new', 'improvement']);
  });

  it('derives the title, highlights and description in Portuguese', () => {
    expect(releases[0].title).toBe(
      'Novo Web Component `lui-thing` e estilos CSS-only `.thing`'
    );
    expect(releases[0].highlights).toContain('Algo quebrou');
    expect(releases[1].title).toBe('Token renomeado');
    expect(releases[0].description).toBe(
      'Esta versão traz 2 adições e 1 correção.'
    );
    expect(describe({ added: 0, changed: 1, fixed: 0, removed: 1 }, 'pt')).toBe(
      'Esta versão traz 1 alteração e 1 remoção.'
    );
  });

  it('keeps every release of the original, marking the untranslated ones', () => {
    const merged = translate(parseChangelog(SAMPLE), releases);
    expect(merged.map((r) => r.version)).toEqual(['2.1.0', '2.0.1', '1.0.0']);
    expect(merged.map((r) => Boolean(r.fallback))).toEqual([
      false,
      true,
      false,
    ]);
    expect(merged[0].title).toMatch(/^Novo/);
    expect(merged[1].title).toBe('Fix a crash');
  });
});

group('the repository CHANGELOG.pt-BR.md', () => {
  const original = parseChangelog(readRoot('CHANGELOG.md'));
  const translation = parseChangelog(readRoot('CHANGELOG.pt-BR.md'), {
    locale: 'pt',
  });
  const byVersion = new Map(original.map((r) => [r.version, r]));

  it('translates only versions the original has, in the same order', () => {
    const versions = original.map((r) => r.version);
    const order = translation.map((r) => versions.indexOf(r.version));
    expect(order).not.toContain(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('keeps the sections and item counts of every release it translates', () => {
    for (const release of translation) {
      const source = byVersion.get(release.version);
      expect(
        release.sections.map((s) => s.kind),
        release.tag
      ).toEqual(source.sections.map((s) => s.kind));
      expect(release.counts, release.tag).toEqual(source.counts);
      expect(release.type, release.tag).toBe(source.type);
    }
  });

  it('gives every release a title and highlights', () => {
    for (const release of translation) {
      expect(release.title.length, release.tag).toBeGreaterThan(0);
      expect(release.highlights.length, release.tag).toBeGreaterThan(0);
    }
  });
});

group('text helpers', () => {
  it('cuts the first sentence outside code spans', () => {
    expect(firstSentence('Use `a.b` here. Then more.')).toBe('Use `a.b` here');
  });

  it('strips the PR credit', () => {
    expect(firstSentence('Add a thing by @me in [PR #3](https://x)')).toBe(
      'Add a thing'
    );
    expect(firstSentence('Fix a thing in [PR #3](https://x)')).toBe(
      'Fix a thing'
    );
    expect(firstSentence('Corrige algo por @me em [PR #3](https://x)')).toBe(
      'Corrige algo'
    );
  });

  it('cuts a long title at its first clause, never inside brackets', () => {
    expect(
      headline(
        'Spacing props on every layout component (`a`, `b`, `c`) so authors write less CSS than before'
      )
    ).toBe('Spacing props on every layout component (`a`, `b`, `c`)');
  });

  it('keeps short highlights whole and shortens long ones at a word', () => {
    expect(highlight('Short one.')).toBe('Short one');
    const long = truncate(`${'word '.repeat(40)}end`, 30);
    expect(long.endsWith('…')).toBe(true);
    expect(long.length).toBeLessThanOrEqual(31);
  });

  it('describes nothing when there is nothing to count', () => {
    expect(describe({ added: 0, changed: 0, fixed: 0, removed: 0 })).toBe('');
  });

  it('moves headings up one level for the notes page', () => {
    expect(promoteHeadings('### Added\n#### Detail\n- `###` stays')).toBe(
      '## Added\n### Detail\n- `###` stays'
    );
  });

  it('dates releases from their tags', () => {
    const dates = parseTagDates(
      'v2.1.0 2026-01-02\nv2.0.1 2025-12-01\nbroken\n'
    );
    expect(dates).toEqual({ 'v2.1.0': '2026-01-02', 'v2.0.1': '2025-12-01' });
    const dated = withTagDates(parseChangelog(SAMPLE), dates);
    expect(dated.map((r) => r.date)).toEqual([
      '2026-01-02',
      '2025-12-01',
      '2024-05-01',
    ]);
  });
});
