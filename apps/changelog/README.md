# Changelog

The public changelog of Let's UI: every release in the repository's
[`CHANGELOG.md`](../../CHANGELOG.md) as a timeline, with a page of full notes
per version, in English and Brazilian Portuguese.

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

Everything on the site is read from the root `CHANGELOG.md`, and its
translation [`CHANGELOG.pt-BR.md`](../../CHANGELOG.pt-BR.md), at build time.
Edit the Markdown, rebuild, and the site follows.

`src/lib/changelog.js` parses the file into releases. Each `## vX.Y.Z` (or
`## X.Y.Z`) heading is a release, and each `###` heading inside it a section.
A heading that is not a version, such as `## Unreleased`, is skipped.
Section headings are read in either language: Added / Adicionado, Changed /
Alterado, Fixed / Corrigido, Removed / Removido.

Each card on the timeline is derived from its release:

| Field       | Source                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Type tag    | **New** if Added has the most items, **Improvement** if Changed and Removed together do, else **Fix** — ties go to New then Improvement |
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

## Languages

English is the default and lives at the root; Portuguese lives under
`/pt/`, with the same paths below it:

| English              | Portuguese              |
| -------------------- | ----------------------- |
| `/`                  | `/pt/`                  |
| `/releases/`         | `/pt/releases/`         |
| `/releases/v1.13.0/` | `/pt/releases/v1.13.0/` |

The interface strings are in `src/lib/i18n.js`. The notes come from
`CHANGELOG.pt-BR.md`, which follows the original release by release: when a
release is added to `CHANGELOG.md`, add its translation there too. A release
missing from the translation still gets a Portuguese page, with the English
notes marked `lang="en"` and a line saying they are not translated yet, and
the root `pnpm test` checks that every translated release keeps the sections
and item counts of the original.

For search engines, each page declares `<html lang>`, a canonical URL and
`hreflang` alternates for both languages plus `x-default` (English).
`/sitemap.xml` lists every page with the same alternates, and `/robots.txt`
points to it. A page whose release is not translated yet points its canonical
at the English page and declares no alternates, so the two are not indexed as
duplicates. The absolute URLs come from `site` in `astro.config.mjs`
(`https://changelog.lets-ui.com`). There is no redirect by browser language:
the header links to the same page in the other language.

## Behaviour and accessibility

- The server renders every release. With JavaScript, the first five show, and
  **Load earlier releases** adds five at a time. It moves focus to the first new
  release and announces how many were loaded.
- The filters are toggle buttons with `aria-pressed`, one per release type
  that appears in the changelog, labelled as on the cards. Paging counts only
  the releases of the active type, so every type shows its first five even
  when they are old. A `role="status"` region announces how many releases are
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
| `src/lib/releases.js`               | Reading the files and the git tag dates at build time      |
| `src/lib/i18n.js`                   | Locales, localized paths and the interface strings         |
| `src/lib/markdown.js`               | Rendering titles, highlights and notes with `marked`       |
| `src/scripts/timeline.js`           | Filters, "Load earlier releases" and the announcements     |
| `src/components/ReleaseCard.astro`  | One release on the timeline                                |
| `src/views/Timeline.astro`          | The timeline                                               |
| `src/views/Release.astro`           | Full notes for one release                                 |
| `src/views/Archive.astro`           | Every release as a list                                    |
| `src/pages/`                        | One route per view and locale, plus the sitemap and robots |
| `src/styles/changelog.css`          | Layout, motion and the token mapping                       |

`src/lib/changelog.test.js` runs in the root `pnpm test`, against a fixture and
against the real `CHANGELOG.md`.
