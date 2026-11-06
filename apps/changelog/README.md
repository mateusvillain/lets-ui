# Changelog

The public changelog of Let's UI: every release in the repository's
[`CHANGELOG.md`](../../CHANGELOG.md) as a timeline, with a page of full notes
per version.

The interaction and layout follow the craft reference
[mateusvillain/changelog](https://github.com/mateusvillain/changelog), rebuilt
in Astro and styled with the Let's UI tokens.

## Running it

```bash
cd apps/changelog
pnpm install --ignore-workspace
pnpm dev
```

Or, from the repository root, `pnpm changelog`.

The site runs at <http://localhost:4325>. It takes its colours, type and
spacing from the tokens package's `dist/`, so build the tokens first on a
clean checkout:

```bash
pnpm install
pnpm --filter @lets-ui/tokens build
```

`pnpm build` writes a static site to `dist/`, and `pnpm preview` serves it.

## Where the content comes from

Everything on the site is read from the root `CHANGELOG.md` at build time.
Nothing is kept in a second file: edit the Markdown, rebuild, and the site
follows.

`src/lib/changelog.js` parses the file into releases. Each `## vX.Y.Z` (or
`## X.Y.Z`) heading is a release, and each `###` heading inside it a section.
A heading that is not a version, such as `## Unreleased`, is skipped.

Each card on the timeline is derived from its release:

| Field       | Source                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Type tag    | **New** if the release has an Added section, else **Improvement** if it has Changed or Removed, else **Fix**            |
| Title       | The first sentence of the lead item (the first Added item for New), cut at its first clause when it is long             |
| Description | The number of additions, changes, fixes and removals                                                                    |
| Highlights  | The first sentence of up to four items, additions first, then fixes, changes and removals, without the "by @user" credit |
| Date        | The date in the heading (`## 1.0.0 - 2024-05-01`) if there is one, else the date of the matching git tag `vX.Y.Z`         |

A release with no tag and no date in its heading shows no date. A checkout
without tags, such as a shallow CI clone, builds the same site without dates.
There are no authors or cover images, because the changelog has none.

The release page, `/releases/vX.Y.Z/`, renders the release's whole section as
written, every subsection and nested bullet, with its `###` headings as `<h2>`.
`/releases/` lists every release, for reaching the full history without
JavaScript.

## Behaviour and accessibility

- The server renders every release. With JavaScript, the first five show, and
  **Load earlier releases** adds five at a time. It moves focus to the first new
  release and announces how many were loaded.
- The **All / New / Improvement / Fix** filters are toggle buttons with
  `aria-pressed`. A `role="status"` region announces how many releases are
  shown. The filters need JavaScript, so they stay hidden without it, and the
  whole timeline shows instead.
- A skip link, a visible focus ring, one `<h3>` per release with its meta after
  it in the DOM, and type tags that carry their name as text, so colour is
  never the only cue.
- The entrance, the scroll-driven reveal and rail fill, and the filter view
  transition only run under `prefers-reduced-motion: no-preference`. In forced
  colours mode, the pressed filter, the rail and the tags keep visible edges.
- The theme follows the OS (`prefers-color-scheme`) through `data-theme`.

## Deploying

The site is not deployed yet. On Vercel, a project would mirror the Brand
Studio's, with less to build first:

| Setting          | Value                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Root Directory   | `apps/changelog`                                                                                                                  |
| Install Command  | `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @lets-ui/tokens build && cd apps/changelog && pnpm install --ignore-workspace --frozen-lockfile` |
| Build Command    | `pnpm build`                                                                                                                      |
| Output Directory | `dist`                                                                                                                            |

"Include source files outside of the Root Directory" must stay enabled: the
build reads `CHANGELOG.md` and the tokens from the repository root. Vercel
clones without tags, so the dates need a full fetch (for example
`git fetch --tags` at the start of the install command) to appear.

The `Changelog` job in `.github/workflows/ci.yml` runs the same sequence on
every pull request.

## Structure

| File                                | Role                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `src/lib/changelog.js`              | Parsing `CHANGELOG.md` and deriving each card (pure)       |
| `src/lib/releases.js`               | Reading the file and the git tag dates at build time       |
| `src/lib/markdown.js`               | Rendering titles, highlights and notes with `marked`       |
| `src/scripts/timeline.js`           | Filters, "Load earlier releases" and the announcements     |
| `src/components/ReleaseCard.astro`  | One release on the timeline                                |
| `src/pages/index.astro`             | The timeline                                               |
| `src/pages/releases/[version].astro` | Full notes for one release                                |
| `src/pages/releases/index.astro`    | Every release as a list                                    |
| `src/styles/changelog.css`          | Layout, motion and the token mapping                       |

`src/lib/changelog.test.js` runs in the root `pnpm test`, against a fixture and
against the real `CHANGELOG.md`.
