/**
 * Build-time loader: reads the root `CHANGELOG.md`, and its translation for
 * other locales, and dates each release by its git tag. Runs only in Astro's
 * frontmatter, never in the browser.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  parseChangelog,
  parseTagDates,
  translate,
  withTagDates,
} from './changelog.js';
import { DEFAULT_LOCALE, LOCALES } from './i18n.js';

const ROOT = new URL('../../../../', import.meta.url);

const cache = new Map();

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

function read(locale) {
  const file = fileURLToPath(new URL(LOCALES[locale].source, ROOT));
  if (!existsSync(file)) return [];
  return parseChangelog(readFileSync(file, 'utf8'), { locale });
}

/**
 * Every release of `CHANGELOG.md`, in `locale`. A release missing from the
 * translation keeps its English notes, marked `fallback`.
 *
 * @returns {import('./changelog.js').Release[]}
 */
export function loadReleases(locale = DEFAULT_LOCALE) {
  if (!cache.has(locale)) {
    const base = read(DEFAULT_LOCALE);
    const releases =
      locale === DEFAULT_LOCALE ? base : translate(base, read(locale));
    cache.set(locale, withTagDates(releases, readTagDates()));
  }
  return cache.get(locale);
}

/** Whether every locale has its own notes for the release at `index`. */
export function isTranslated(index) {
  return Object.keys(LOCALES).every(
    (locale) => !loadReleases(locale)[index].fallback
  );
}

/** `getStaticPaths` for the release pages of `locale`. */
export function releasePaths(locale) {
  const releases = loadReleases(locale);
  return releases.map((release, index) => ({
    params: { version: release.slug },
    props: {
      locale,
      release,
      latest: index === 0,
      newer: releases[index - 1] ?? null,
      older: releases[index + 1] ?? null,
      translated: isTranslated(index),
    },
  }));
}
