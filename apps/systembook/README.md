# SystemBook docs

Documentation for Let's UI, written as Markdown in this repository and built
into a static site by [SystemBook](https://github.com/mateusvillain/systembook)
(static mode, `@systembook/cli`). There is no server and no database: the
content is reviewed in the same pull request as the code.

- **`docs/`** — the content. Folders are the hierarchy
  (`menu/section/page`), files are pages. Format reference:
  [static-format.md](https://github.com/mateusvillain/systembook/blob/main/docs/static-format.md).
- **`previews/`** — one `*.preview.tsx` per component. The CLI builds each
  variant into an isolated iframe, and the docs embed it with
  `<ComponentEmbed component="Button" variant="primary" />`, so a page shows
  the component this repository actually builds.
- **`systembook.config.ts`** — site name and the closed list of `status` tags.

## Layout

| Menu | Section | Source |
| --- | --- | --- |
| Get started | Overview, Developers | Introduction, Principles, Installation |
| Foundations | Visual, Accessibility, Content | Color, Typography, Spacing, Border, Elevation; the accessibility contract; the writing guide |
| Components | Actionable, Navigation, Form and options, Content, Typography, Layout | one folder per component, with four tabs |
| Utilities | SCSS | Functions, Mixins, Flex |

Every component is a folder (`components/<section>/<name>/`) whose `index.mdx`
is the page and whose other files are tabs, in this order:

| File | Tab | Holds |
| --- | --- | --- |
| `index.mdx` | Overview | What it is, when to use and not use it, anatomy, variants, sizes, states, related components |
| `usage.mdx` | Usage | Do and don't, writing, placement, behavior, best practices |
| `accessibility.mdx` | Accessibility | Keyboard, screen reader, visual requirements, what design must guarantee |
| `code.mdx` | Code | Properties, events and code examples |

The Accessibility tabs follow `A11Y.md` at the repository root, which is the
contract: when a component's behavior changes there, change it here too.

Each menu and section can carry a `_menu.yml` / `_section.yml` with `title` and
`order`.

## Working on it

This app is deliberately **outside the pnpm workspace** and installs from its
own lockfile, so React and the CLI never enter the published packages'
dependency graph.

```bash
pnpm install && pnpm build        # at the repository root, first
cd apps/systembook
pnpm install --ignore-workspace

pnpm docs:dev                     # http://localhost:4000, reloads on save
pnpm docs:check                   # content, links, images and previews
pnpm docs:build                   # static site in systembook-dist/
pnpm exec tsc --noEmit            # typecheck the previews
```

`previews/runtime.ts` imports the packages' `dist/` output by relative path, so
the workspace has to be built first. A preview for a tag that is not listed in
`previews/custom-elements.d.ts` has to be added there too, or the typecheck
fails.

## How the previews are wired

A preview file exports the `Preview` component mounted inside the iframe and a
`PreviewConfig` describing its variants and controls. The Let's UI components
are custom elements, so two pieces of glue sit next to them:

- **`previews/element.tsx`** — `elementProps()` normalises the props a preview
  receives into attributes a custom element can read (React would serialise
  `false` as `disabled="false"`, which Lit reads as true), and triggers the
  browser-only load of the runtime.
- **`previews/runtime.ts`** — registers the custom elements and pulls in
  `letsui.min.css`. It is loaded through a dynamic import because the CLI's
  discovery pass bundles every preview for **Node**, and `LitElement` needs a
  DOM.
- **`previews/demo.tsx`** — `Sample` and `Stretch`, placeholder content for the
  layout primitives. Not part of the design system.

Components with slotted content (`Tabs`, `Accordion`, `Table`, the layout
primitives) declare it in `Preview`, not through a control: the slot is
structure, and controls only change props.

## Content limits

The format accepts only what the SystemBook editor can represent, and fails the
build otherwise: headings up to `###`, no blockquotes (use `<Callout>`), no raw
HTML, no horizontal rules, and only `<Callout>`, `<ComponentEmbed>` and
`<DosDonts>` as components. `<ComponentEmbed>` needs a variant that exists in a
`*.preview.tsx`.

## Publishing

`systembook build` writes a self-contained site to `systembook-dist/`. See
[Publicar o modo estático](https://github.com/mateusvillain/systembook/blob/main/docs/deploy-static.md)
for GitHub Pages, Vercel and Netlify. On any host, `/_systembook/previews/*`
must answer `Access-Control-Allow-Origin: *`.
