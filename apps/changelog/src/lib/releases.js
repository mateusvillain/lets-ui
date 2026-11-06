/**
 * Build-time loader: reads the root `CHANGELOG.md` and dates each release by
 * its git tag. Runs only in Astro's frontmatter, never in the browser.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseChangelog, parseTagDates, withTagDates } from './changelog.js';

const CHANGELOG = fileURLToPath(
  new URL('../../../../CHANGELOG.md', import.meta.url)
);

let cache;

/**
 * The tag's creator date: the tagger date of an annotated tag, the commit
 * date of a lightweight one. A checkout without tags (a shallow CI clone) or
 * without git simply has no dates, and the site omits them.
 */
function readTagDates() {
  try {
    const output = execFileSync(
      'git',
      [
        'for-each-ref',
        'refs/tags',
        '--format=%(refname:short) %(creatordate:short)',
      ],
      {
        cwd: fileURLToPath(new URL('.', import.meta.url)),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );
    return parseTagDates(output);
  } catch {
    return {};
  }
}

/** @returns {import('./changelog.js').Release[]} */
export function loadReleases() {
  cache ??= withTagDates(
    parseChangelog(readFileSync(CHANGELOG, 'utf8')),
    readTagDates()
  );
  return cache;
}
