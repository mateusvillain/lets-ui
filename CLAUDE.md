# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Unit tests
pnpm test

# Lint CSS/SCSS and Markdown
pnpm lint
pnpm lint:css      # Stylelint only
pnpm lint:md       # Markdownlint only

# Storybook development server (port 6006)
pnpm storybook

# Build static Storybook
pnpm build-storybook
```

Commits must follow the **Conventional Commits** spec (enforced via commitlint). See `.agent/skills/conventional-commit/` for guidance.

## Architecture

This is a **pnpm monorepo** (`pnpm-workspace.yaml`) for an open-source, framework-agnostic design system. Three packages:

- **`packages/lets-ui-tokens`** — Design tokens as JSON, compiled by [Terrazzo](https://terrazzo.app/) into CSS custom properties and a SCSS variable map. Supports light/dark themes and multi-brand via `data-theme` / `data-brand` attributes.
- **`packages/styles`** — Component SCSS files, plus the shared SCSS utilities they build on in `src/utilities/`: `_functions.scss` (semantic accessor functions), `_mixins.scss`, `_tokens.map.scss` (bridges Terrazzo output to component SCSS), `_grid.map.scss`, `_flex.scss`. Built with Sass → PostCSS/cssnano → `/dist/letsui.min.css`.
- **`packages/lets-ui-components`** — Web Components built on [Lit](https://lit.dev/), in TypeScript. Built with Vite.

Two apps live outside the pnpm workspace, each with its own lockfile, so a browser app never enters the published packages' dependency graph:

- **`apps/brand-studio`** — visual editor for the brand tokens, deployed to `studio.lets-ui.com` from Vercel (`vercel.json` at the root). It reaches the packages by relative path, so their `dist/` must be built before it.
- **`playground/`** — raw pages for manual testing. No CI; it is a test surface, not a deliverable.

### SCSS split rule

Components whose core behavior is **pure CSS** (layout primitives like `stack`, `switcher`, `sidebar`, `inline`, `center`) get two SCSS files:

1. `packages/styles/src/components/_name.scss` — CSS-only implementation, registered in `_components.scss`. Works without the Web Component.
2. `packages/lets-ui-components/src/components/name/name.scss` — shadow-DOM-specific rules (`:host`, `::slotted()`). Imports from utilities directly; does **not** re-import the global file.

Components whose core behavior is **JS-driven** (`float`, `scroll-area`) live only in the component package. Their overflow settings, positioning coordinates, and visual indicators are applied by JavaScript — a global CSS stub would be non-functional without the Web Component and adds no value. Do not add these to `packages/styles/src/components/_components.scss`.

Documentation and interactive testing live in `docs/` (Storybook stories + MDX) and `playground/` (raw HTML files).

## Token & Styling System

**Tokens are for values that vary — never hardcode one that does.** A value earns
a token when it changes across brands (`data-brand`), across themes
(`data-theme`), or across the semantic roles the system exposes. Colors,
spacing, and radii are almost always in this category: take them from the
functions below, never as literals.

The inverse is just as important: **a constant that never varies is not a
token.** A value that is the same in every brand, every theme, and every
context — the 8% / 16% of the interaction state layer, its transition timings —
belongs in code next to the logic that uses it. Wrapping it in a token buys no
flexibility and costs a custom property on every page plus a layer of
indirection between the value and its only consumer. The test is not "is this a
design value?" but "will this ever resolve differently?".

Component SCSS uses utility functions from `packages/styles/src/utilities/_functions.scss`:

| Function                   | Usage                                                    |
| -------------------------- | -------------------------------------------------------- |
| `bg($category, $variant)`  | Background colors (e.g. `bg(container, primary)`)        |
| `text($variant)`           | Text colors (e.g. `text(body)`, `text(inverse)`)         |
| `color($category, $scale)` | Primitive colors (e.g. `color(brand, 5)`)                |
| `radius($size)`            | Border radius (`xs`, `sm`, `md`, `lg`, `circle`, `none`) |
| `width($size)`             | Border width (`0`, `1`, `2`)                             |
| `fluid($px)`               | Fluid/responsive sizing                                  |
| `fixed($px)`               | Fixed pixel sizing                                       |

Token source files are in `packages/lets-ui-tokens/tokens/{brand,global}/`. Terrazzo compiles them into `packages/lets-ui-tokens/dist/` — `letsui.tokens.scss` (the generated map, do not edit manually) and `letsui.tokens.static.scss` (literal values for media query preludes and Sass loops, which cannot take a `var()`).

`packages/styles/src/utilities/_tokens.map.scss` is hand-authored and short: it names the semantic slots the component SCSS asks for and points each at a token. Edit it when a new semantic role appears — not to change a value.

## Web Components

Each interactive component in `packages/lets-ui-components/src/components/` is a TypeScript class extending Lit's `LitElement`. Pattern:

- Declare reactive props with the `@property()` decorator
- Return the markup from `render()`; Lit re-renders when a reactive prop changes
- Import the component's own `.scss` with `?inline` and pass it through `unsafeCSS` into `static styles`
- Use semantic HTML with ARIA attributes for accessibility; components that take part in forms set `static formAssociated = true` and drive `ElementInternals`
- Register in `src/index.ts`

## Agent Skills

`.agent/skills/` contains guided workflows for common tasks — use these when available:

- **`component-creator`** — Creating or updating SCSS components or Web Components; checks token coverage and blocks creation if tokens are missing
- **`documentation`** — Generating Storybook stories (`.stories.js`) and MDX docs (`.docs.mdx`)
- **`changelog-generator`** — Release workflow: SemVer bump, CHANGELOG.md, Git tags, GitHub release
- **`conventional-commit`** — Guided commit message formatting
- **`issue-creator`** — Creating GitHub issues with automatic label inference, assignee, and addition to the Let's UI Roadmap project with status Todo
