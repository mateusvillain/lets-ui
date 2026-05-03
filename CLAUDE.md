# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

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

This is a **pnpm monorepo** (`pnpm-workspace.yaml`) for an open-source, framework-agnostic design system. Four packages:

- **`packages/lets-ui-tokens`** — Design tokens as JSON, compiled by [Terrazzo](https://terrazzo.app/) into CSS custom properties and a SCSS variable map. Supports light/dark themes and multi-brand via `data-theme` / `data-brand` attributes.
- **`packages/utilities`** — Shared SCSS utilities: `_functions.scss` (semantic accessor functions), `_mixins.scss`, `_tokens.map.scss` (bridges Terrazzo output to component SCSS).
- **`packages/styles`** — Component SCSS files using utility functions. Built with Sass → PostCSS/cssnano → `/dist/letsui.min.css`.
- **`packages/lets-ui-components`** — Vanilla JS Web Components (custom elements, no framework). Built via a Node.js script.

Documentation and interactive testing live in `docs/` (Storybook stories + MDX) and `playground/` (raw HTML files).

## Token & Styling System

**All design values must come from tokens — no hardcoded colors, spacing, or radii.**

Component SCSS uses utility functions from `packages/utilities/src/_functions.scss`:

| Function                   | Usage                                                    |
| -------------------------- | -------------------------------------------------------- |
| `bg($category, $variant)`  | Background colors (e.g. `bg(container, primary)`)        |
| `text($variant)`           | Text colors (e.g. `text(body)`, `text(inverse)`)         |
| `color($category, $scale)` | Primitive colors (e.g. `color(brand, 5)`)                |
| `radius($size)`            | Border radius (`xs`, `sm`, `md`, `lg`, `circle`, `none`) |
| `width($size)`             | Border width (`0`, `1`, `2`)                             |
| `fluid($px)`               | Fluid/responsive sizing                                  |
| `fixed($px)`               | Fixed pixel sizing                                       |

Token source files are in `packages/lets-ui-tokens/tokens/{brand,global}/`. The compiled SCSS token map is `packages/utilities/src/_tokens.map.scss` (~9000 lines — do not edit manually).

## Web Components

Each interactive component in `packages/lets-ui-components/src/components/` is a vanilla JS class extending `HTMLElement`. Pattern:

- Declare `static get observedAttributes()` for reactive props
- Implement `connectedCallback()` for initial render
- Implement `attributeChangedCallback()` for updates
- Use semantic HTML with ARIA attributes for accessibility
- Register in `src/index.js`

## Agent Skills

`.agent/skills/` contains guided workflows for common tasks — use these when available:

- **`component-creator`** — Creating or updating SCSS components or Web Components; checks token coverage and blocks creation if tokens are missing
- **`documentation`** — Generating Storybook stories (`.stories.js`) and MDX docs (`.docs.mdx`)
- **`changelog-generator`** — Release workflow: SemVer bump, CHANGELOG.md, Git tags, GitHub release
- **`conventional-commit`** — Guided commit message formatting
- **`issue-creator`** — Creating GitHub issues with automatic label inference, assignee, and addition to the Let's UI Roadmap project with status Todo
