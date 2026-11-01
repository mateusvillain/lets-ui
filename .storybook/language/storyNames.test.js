import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';

import {
  storyNamesEn,
  storyNamesPt,
  untranslatedStoryNames,
} from './storyNames.js';

const root = fileURLToPath(new URL('../..', import.meta.url));

// Same story globs as `main.js`.
const storyFiles = globSync(
  [
    'docs/**/*.stories.{js,jsx,mjs,ts,tsx}',
    'packages/lets-ui-components/src/components/**/*.stories.{js,jsx,mjs,ts,tsx}',
  ],
  { cwd: root }
);

/**
 * Every story name, read with the parser Storybook uses to build `index.json`,
 * so `storyName`, CSF3 `name` and export keys (`AllSizes` → "All Sizes") come
 * out exactly as the sidebar shows them.
 */
const storyNames = new Set(
  storyFiles.flatMap((file) => {
    const code = readFileSync(`${root}/${file}`, 'utf8');
    const csf = loadCsf(code, { fileName: file, makeTitle: (title) => title });
    return csf.parse().stories.map((story) => story.name);
  })
);

const lists = {
  storyNamesEn: new Set(Object.keys(storyNamesEn)),
  storyNamesPt: new Set(Object.keys(storyNamesPt)),
  untranslatedStoryNames,
};

describe('story names', () => {
  it('finds the story files', () => {
    expect(storyFiles.length).toBeGreaterThan(0);
  });

  it('has every story name in exactly one list', () => {
    const misplaced = [...storyNames]
      .map((name) => ({
        name,
        lists: Object.keys(lists).filter((list) => lists[list].has(name)),
      }))
      .filter((entry) => entry.lists.length !== 1);
    expect(misplaced).toEqual([]);
  });

  it.each(Object.keys(lists))('has no stale names in %s', (list) => {
    const stale = [...lists[list]].filter((name) => !storyNames.has(name));
    expect(stale).toEqual([]);
  });
});
