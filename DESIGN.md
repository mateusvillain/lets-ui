# Let's UI — Design System Criteria

This document defines the governing criteria for the Let's UI design system: its principles, architectural decisions, token governance, component contracts, accessibility requirements, and quality standards. Use it as the source of truth when adding or evaluating any part of the system.

---

## Principles

1. **Token-first** — Every visual value (color, spacing, radius, shadow, typography) must come from a token. Hardcoded values are rejected.
2. **Framework-agnostic** — Components work in vanilla HTML, React, Vue, Angular, Svelte, or any other environment without adapters.
3. **CSS-first for layout** — Layout primitives are implemented as pure CSS and work without JavaScript. Web Components add convenience, not required logic.
4. **Separation of concerns** — Tokens, styles, and components are independent packages. A consumer can use only CSS without the Web Component layer, or only tokens without the opinionated styles.
5. **Semantic over structural** — APIs expose semantic intent (`variant="caution"`, `size="sm"`) not visual implementation (`color="orange"`, `padding="4px"`).
6. **Accessibility by default** — ARIA attributes, keyboard navigation, focus management, and form integration are part of the component contract, not afterthoughts.

---

## Package Architecture

| Package                       | npm name              | Purpose                              | Build output                                        |
| ----------------------------- | --------------------- | ------------------------------------ | --------------------------------------------------- |
| `packages/lets-ui-tokens`     | `@lets-ui/tokens`     | Design tokens (source of truth)      | `dist/letsui.tokens.css`, `dist/letsui.tokens.scss` |
| `packages/styles`             | `@lets-ui/styles`     | Component CSS (token-consuming SCSS) | `dist/letsui.min.css`                               |
| `packages/lets-ui-components` | `@lets-ui/components` | Web Components (Lit + TypeScript)    | `dist/index.js` + per-component files               |

The dependency chain is strictly one-directional:

```text
lets-ui-tokens
    ↓
@lets-ui/styles
    ↓
@lets-ui/components
```

No package may import from a sibling at the same level or higher.

---

## Token System

### Source format

Tokens are authored as JSON files inside `packages/lets-ui-tokens/tokens/` and compiled by [Terrazzo](https://terrazzo.app/).

```text
tokens/
  global/
    primitive.json       # Raw scale values (spacing, border widths, opacity, type weights)
    semantic.json        # High-level meaning (primary/caution/danger colors, elevations, focus rings)
    component.json       # Component-specific overrides
    theme/
      colors.light.json
      colors.dark.json
  brand/
    lets-ui/
      foundation.json    # Brand primitives (fonts, radius, weights)
      colors.light.json
      colors.dark.json
```

### Naming convention

All token keys follow `lui.{category}.{subcategory}.{variant}` in kebab-case nesting:

- `lui.color.bg.primary.default`
- `lui.color.text.body`
- `lui.border.radius.md`
- `lui.elevation.floating`

Never introduce tokens outside this namespace.

### Token categories

| Category                    | Variants                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Color — primitive           | `brand`, `blue`, `gray`, `green`, `orange`, `red`, `violet` (scales 1–8), `black` (with alpha)                            |
| Color — semantic background | `primary`, `secondary`, `caution`, `info`, `danger`, `success`, `neutral` × `surface` / `container` / `hover` / `pressed` |
| Color — semantic text       | `heading`, `body`, `caption`, `inverse`, `error`                                                                          |
| Color — semantic icon       | `primary`, `secondary`, `caution`, `info`, `danger`, `success`, `neutral` (+ inverse)                                     |
| Color — semantic border     | `default`, `hover`, `pressed` per semantic variant; `subtle`                                                              |
| Color — focus ring          | `primary`, `secondary`, `danger`, `success`, `neutral`                                                                    |
| Border width                | `0`, `1`, `2`, `4` (px)                                                                                                   |
| Border radius               | `xs` (2px), `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `circle`                                                    |
| Spacing — fixed             | `0`, `8`, `16`, `24`, `32`, `40` (px)                                                                                     |
| Spacing — fluid             | Clamp-based responsive values from 2 px to 80 px                                                                          |
| Typography — size           | `3xs` → `3xl` with `clamp()` formulas                                                                                     |
| Typography — weight         | `light` (300), `regular` (400), `medium` (500), `semibold` (600), `bold` (700)                                            |
| Typography — line-height    | `sm` (1.125), `md` (1.2), `lg` (1.5)                                                                                      |
| Typography — tracking       | `tightest` (−2px) → `widest` (2px)                                                                                        |
| Elevation                   | `base`, `hovered`, `floating`, `overlay` (multi-layer box-shadows)                                                        |
| Opacity                     | `disabled` (0.4), scale 0–100                                                                                             |

### Theme and brand support

Terrazzo compiles 8 selector blocks:

1. `:root` — default (light mode)
2. `@media (prefers-color-scheme: dark)` — OS dark mode
3. `[data-theme="light"]` / `[data-theme="dark"]` — explicit overrides
4. `[data-brand="lets-ui"]` — brand application (auto light/dark via `prefers-color-scheme`)
5. `[data-brand="lets-ui"][data-theme="light"]` / `[data-brand="lets-ui"][data-theme="dark"]` — explicit brand + theme

Apply `data-theme` and `data-brand` on `<html>` or any subtree root.

### Adding a new token

1. Determine whether it belongs in `primitive`, `semantic`, or `component` scope.
2. Add it to the appropriate JSON file.
3. Run `pnpm build` inside `packages/lets-ui-tokens` to regenerate `dist/`.
4. The SCSS token map (`packages/utilities/src/_tokens.map.scss`) is auto-generated — never edit it manually.
5. Update `packages/styles` SCSS functions if the new token requires a new accessor.

---

## SCSS Architecture

### File structure (`packages/styles/src/`)

```text
index.scss               # Entry: imports tokens, foundations, components, utilities, reset
foundations/             # CSS layers for global primitives
  _border.scss
  _color.scss
  _elevation.scss
  _layout.scss
  _opacity.scss
  _spacing.scss
  _typography.scss
components/              # One file per component
  _components.scss       # Barrel: @forward all component files
  _button.scss
  _input.scss
  …
utilities/
  _flex.scss             # Flex utility classes
  _grid.map.scss         # Responsive grid config, shared by `.grid` and `<lui-grid>`
```

### Utility accessor functions

All SCSS must consume tokens through functions defined in `packages/utilities/src/_functions.scss`. Never reference a CSS custom property directly from a component file.

| Function       | Signature                      | Example                  |
| -------------- | ------------------------------ | ------------------------ |
| `bg()`         | `bg($category, $variant?)`     | `bg(container, primary)` |
| `text()`       | `text($variant)`               | `text(body)`             |
| `color()`      | `color($category, $scale)`     | `color(brand, 5)`        |
| `icon()`       | `icon($variant)`               | `icon(caution)`          |
| `stroke()`     | `stroke($variant, $category?)` | `stroke(danger, hover)`  |
| `state()`      | `state($state, $bg?)`          | `state(hover)`           |
| `focus-ring()` | `focus-ring($variant)`         | `focus-ring(primary)`    |
| `radius()`     | `radius($size)`                | `radius(md)`             |
| `width()`      | `width($size)`                 | `width(1)`               |
| `elevation()`  | `elevation($layer)`            | `elevation(floating)`    |
| `opacity()`    | `opacity($category)`           | `opacity(disabled)`      |
| `fixed()`      | `fixed($px)`                   | `fixed(16)`              |
| `fluid()`      | `fluid($px)`                   | `fluid(24)`              |
| `breakpoint()` | `breakpoint($name)`            | `breakpoint(md)`         |

### Mixins

| Mixin               | Signature                                   | Purpose                                   |
| ------------------- | ------------------------------------------- | ----------------------------------------- |
| `flex()`            | `flex($dir, $align, $justify, $gap, $wrap)` | Flexbox shorthand                         |
| `states()`          | `states($focus-visible, $focus?)`           | Hover / active / disabled / focus states  |
| `state-layer()`     | `state-layer($bg?)`                         | Interaction overlay only, without focus   |
| `state-base()`      | `state-base($bg)`                           | Resting background for a state layer      |
| `state-timing()`    | `state-timing($state)`                      | Per-direction timing for the overlay      |
| `state-tint()`      | `state-tint($tint)`                         | On-colour override for the overlay        |
| `center()`          | `center($axis)`                             | `both` / `x` / `y` alignment              |
| `center-absolute()` | —                                           | Absolute centering via transform          |
| `sr-only()`         | —                                           | Visually hidden, screen-reader accessible |

### Interaction states

Hover and active are **not** colors picked per brand, variant or theme. They
are one translucent state layer painted on top of whatever background a
component already has, at 8% (hover) and 16% (active) — and the colour of that
layer is the component's own content colour, the on-colour of its background.

Nothing is measured to decide whether to lighten or darken. A component that
declares `color` and `--lui-bg` together has already stated both halves of the
pair, so the layer just reads `currentColor`. Direction follows from the
contrast the pair is required to have: the content colour is the luminous
opposite of the background, so mixing it in lightens a dark surface and darkens
a light one — with no luminance test, no threshold to flip across, and nothing
to work out about the surface a transparent component happens to sit on.
Magnitude follows too: at 4.5:1 or better, 8% of the content colour is always a
visible move. A fixed black-or-white tint had no such guarantee — 8% black over
a near-black button was imperceptible.

A component declares its resting colour through the `--lui-bg` custom property
instead of `background-color`, and the state rules mix the tint into it with
`color-mix()`:

```scss
.thing {
  @include state-layer(bg(container, primary));

  &:hover {
    background-color: state(hover);

    @include state-timing(hover);
  }
  &:active {
    background-color: state(pressed);

    @include state-timing(pressed);
  }
}
```

Over an opaque base, mixing the tint in at 8% is identical to compositing it on
top; over a transparent base it resolves to the tint at exactly that alpha. So
the model really is an overlay — one that knows which way to move — just
expressed as a colour.

**Expressing it as a colour is the whole point.** `background-color`
interpolates natively in every engine. The obvious alternative — an animated
custom property inside a `background-image` gradient — animates in Chromium and
Firefox but _not_ in WebKit, which resolves `var()` inside an image once per
style change rather than once per animation frame. Safari would jump straight to
the end value. Anything that must animate has to end up in a real animatable
property, not behind a `var()` in an image.

Most components should use `states()` instead, which wraps `state-layer` with
the timing, disabled and focus handling. Interaction costs **zero tokens**:
the tint is a colour the component already declares, and the 8% / 16% amounts
never vary by theme or brand, so they sit in `$state-amounts` in
`_functions.scss`, alongside the timings, next to the logic that consumes them.

Where the element's `color` is not the on-colour the state should use, override
it with the `state-tint($tint)` mixin. Two cases exist today, both because the
element paints no text of its own: a checked checkbox / radio / switch, whose
mark colour is the real on-colour (declared once in `_selection.scss`), and
`icon-button`, whose icon arrives through a slot.

### Timing

A transition reads its timing from the state being entered, so `state-timing()`
overrides `--lui-state-duration` / `--lui-state-easing` inside `:hover` and
`:active` to give each direction its own pace out of a single `transition`
declaration:

| Direction      | Duration | Easing     | Set by    |
| -------------- | -------- | ---------- | --------- |
| rest → hover   | 140ms    | `ease-out` | `:hover`  |
| hover → active | 40ms     | `linear`   | `:active` |
| active → hover | 140ms    | `ease-out` | `:hover`  |
| hover → rest   | 220ms    | `ease-out` | base rule |

The press is the short one on purpose: mousedown to mouseup is roughly 80ms, so
a slower transition never reaches the pressed tint during a real click. The
exits are the slowest, which stops a cursor sweeping across a toolbar from
flickering. CSS cannot tell "hovered from rest" apart from "hovered after
releasing a press", so both entering-hover directions share one duration.

Two consequences to keep in mind when writing component SCSS:

- Set the resting background with `state-layer($bg)` or `state-base($bg)`, never
  with `background-color` directly. A rule that sets `background-color` on a
  component with a state layer competes with the state rules on specificity and
  usually wins, killing hover. Overriding `--lui-bg` instead — as the selected
  card tab and the checked inputs do — costs no specificity fight at all.
- The layer tints the element's own background, so a variant that looks
  different at rest needs no extra state rules at all.
- Declare `color` on the same element that gets the state layer. An element that
  inherits its text colour tints with whatever an ancestor happened to set.

---

## Component SCSS Split Rule

Every component falls into one of two categories:

### Pure-CSS components

Core behavior is achievable with CSS alone (layout primitives and most UI elements). Requires **two** SCSS files:

1. `packages/styles/src/components/_name.scss` — Standalone implementation. Registered in `_components.scss`. Works without the Web Component.
2. `packages/lets-ui-components/src/components/name/name.scss` — Shadow DOM implementation. Uses `:host` and `::slotted()`. Imports utilities directly; does **not** re-import the global file to avoid duplication.

List: `alert`, `body`, `box`, `breadcrumb`, `button`, `card`, `center`, `checkbox`, `container`, `divider`, `drawer`, `dropdown-menu`, `field`, `flex`, `grid`, `heading`, `icon-button`, `image`, `inline`, `input`, `link`, `modal`, `navbar`, `radio`, `radio-group`, `select`, `shortcut`, `sidebar`, `stack`, `switch`, `switcher`, `tabs`, `tag`, `textarea`, `tooltip`.

### JS-driven components

Core behavior requires JavaScript (dynamic positioning, overflow, scroll). These live **only** in the component package. Do not add them to `packages/styles/src/components/_components.scss` — a global CSS stub without the script is non-functional.

List: `float`, `scroll-area`.

---

## Web Component Contract

All components extend `LitElement` and must satisfy the following contract.

### Structure

```text
packages/lets-ui-components/src/components/{name}/
  {name}.ts            # Component class
  {name}.scss          # Shadow DOM styles (imported with ?inline)
  {Name}.stories.js    # Storybook stories
  {Name}.docs.mdx      # MDX documentation
```

### Class requirements

- Extend `LitElement`.
- Declare all reactive properties with `@property({ reflect: true })` so attributes stay in sync.
- Custom element tag: `lui-{name}` (kebab-case, always prefixed with `lui-`).
- Register with a guard: `if (!customElements.get('lui-name')) customElements.define('lui-name', LuiName)`.
- Use semantic native HTML inside shadow DOM (`<button>`, `<input>`, `<a>`, etc.).

### Form-associated components

Components that participate in form submission (`button`, `checkbox`, `input`, `radio`, `select`, `switch`, `textarea`) must:

- Declare `static formAssociated = true`.
- Call `this.attachInternals()` and expose the `ElementInternals` API.
- Propagate `value`, `name`, `disabled`, `required`, and `validity`.

### Accessibility requirements (per component)

| Requirement         | How                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------- |
| Keyboard navigation | All interactive elements reachable by Tab; actions activated by Enter/Space            |
| Focus ring          | Apply `focus-ring()` mixin on `:focus-visible`, never `:focus` alone                   |
| Screen readers      | Use `aria-label` when visible label is absent; use `aria-describedby` for hints/errors |
| Disabled state      | Set both `disabled` attribute and `aria-disabled="true"` where appropriate             |
| Loading state       | Set `aria-busy="true"` during async operations                                         |
| Error state         | Connect error message via `aria-describedby`; set `aria-invalid="true"`                |
| Color alone         | Never convey status with color only — pair with icon or text                           |

### Observed attribute naming

Attribute names are kebab-case and map to camelCase properties automatically by Lit:

- `error-text` → `errorText`
- `optional-text` → `optionalText`
- `force-state` → `forceState`

Boolean attributes follow the HTML spec: presence means true, absence means false.

---

## Component Inventory

### Layout & Structural

| Component       | Tag                         | Type                |
| --------------- | --------------------------- | ------------------- |
| Box             | `lui-box`                   | Pure CSS + WC       |
| Center          | `lui-center`                | Pure CSS + WC       |
| Container       | `lui-container`             | Pure CSS + WC       |
| Flex / FlexItem | `lui-flex`, `lui-flex-item` | Pure CSS + WC       |
| Grid / GridItem | `lui-grid`, `lui-grid-item` | Pure CSS + WC       |
| Inline          | `lui-inline`                | Pure CSS + WC       |
| Sidebar         | `lui-sidebar`               | Pure CSS + WC       |
| Stack           | `lui-stack`                 | Pure CSS + WC       |
| Switcher        | `lui-switcher`              | Pure CSS + WC       |
| Float           | `lui-float`                 | JS-driven (WC only) |
| Body            | `lui-body`                  | Pure CSS + WC       |

### Interactive & Form

| Component             | Tag                               | Form-associated |
| --------------------- | --------------------------------- | --------------- |
| Button                | `lui-button`                      | Yes             |
| Icon Button           | `lui-icon-button`                 | Yes             |
| Checkbox              | `lui-checkbox`                    | Yes             |
| Input                 | `lui-input`                       | Yes             |
| Radio / RadioGroup    | `lui-radio`, `lui-radio-group`    | Yes             |
| Select / NativeSelect | `lui-select`, `lui-native-select` | Yes             |
| Switch                | `lui-switch`                      | Yes             |
| Textarea              | `lui-textarea`                    | Yes             |

### Content & Navigation

| Component         | Tag                                     |
| ----------------- | --------------------------------------- |
| Alert             | `lui-alert`                             |
| Breadcrumb / Item | `lui-breadcrumb`, `lui-breadcrumb-item` |
| Card              | `lui-card`                              |
| Divider           | `lui-divider`                           |
| Heading           | `lui-heading`                           |
| Image             | `lui-image`                             |
| Link              | `lui-link`                              |
| Tabs / Tab        | `lui-tabs`, `lui-tab`                   |

### Overlay & Utility

| Component                      | Tag                                                      |
| ------------------------------ | -------------------------------------------------------- |
| Modal                          | `lui-modal`                                              |
| Drawer                         | `lui-drawer`                                             |
| Dropdown Menu / Item / Divider | `lui-dropdown-menu`, `lui-menu-item`, `lui-menu-divider` |
| Tag                            | `lui-tag`                                                |
| Shortcut                       | `lui-shortcut`                                           |
| Tooltip                        | `lui-tooltip`                                            |
| Scroll Area                    | `lui-scroll-area`                                        |

---

## Storybook & Documentation

### Story categories (canonical order)

1. Get started — Welcome, Designers, Developers, Changelog
2. Foundations — Color, Spacing, Border, Typography, Elevation
3. Actionable — Buttons, Icon Buttons
4. Navigation — Links, Breadcrumb, Tabs, Dropdown Menu
5. Form and options — Input, Textarea, Checkbox, Radio, Select, Switch
6. Content — Card, Alert, Tag, Divider, Heading, Image, Body
7. Layout — Container, Flex, Grid, Stack, Sidebar, Box, Center, Inline, Switcher, Float
8. Miscellaneous — Modal, Drawer, Tooltip, Shortcut
9. Utilities — Functions, Mixins, Flex

New components must be added to the correct category, not dumped at the end.

### Story file requirements (`.stories.js`)

- Export a default metadata object with `title`, `tags: ['autodocs']`, and `argTypes`.
- `argTypes` must describe every public property with a `control` type (text, select, boolean, number).
- Export at least a `Default` story showing the most common usage.
- Export separate named stories for each meaningful variant group (sizes, states, variants).
- Stories import: `@lets-ui/tokens/dist/letsui.tokens.css`, `@lets-ui/styles/dist/letsui.min.css`, and `@lets-ui/components/dist/index.js`.

### MDX docs requirements (`.docs.mdx`)

- Component description (one paragraph max).
- When-to-use / when-not-to-use guidance.
- At least one `<Canvas>` block showing the `Default` story.
- `<Controls />` for live prop editing.
- Variant and state showcases with `<Canvas>` blocks.
- Accessibility notes.

---

## Build Pipeline

### Full build order

```bash
pnpm -r build
# 1. @lets-ui/tokens  → tz build           → dist/letsui.tokens.{css,scss}
# 2. @lets-ui/styles  → sass + postcss     → dist/letsui.min.css
# 3. @lets-ui/components → vite build      → dist/**/*.js
```

### Adding a component to the build

- **Styles package**: add `@forward 'components/name'` in `packages/styles/src/components/_components.scss` (pure-CSS components only).
- **Components package**: add export in `packages/lets-ui-components/src/index.ts` with the guard registration.
- **Components package `package.json`**: add a named export `"./component-name": "./dist/components/name.js"`.

---

## Versioning & Release

- Versions follow **SemVer** across all packages simultaneously (monorepo lock-step).
- Every user-facing change needs a Changeset entry (`pnpm changeset`).
- Release notes are generated into `CHANGELOG.md`.
- Git tags: `v{major}.{minor}.{patch}`.
- Commits must follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`, `test:`.

---

## Linting & Code Quality

| Tool         | Scope           | Config                                                             |
| ------------ | --------------- | ------------------------------------------------------------------ |
| stylelint    | CSS / SCSS      | `.stylelintrc.json` (extends `stylelint-config-standard-scss`)     |
| markdownlint | Markdown        | `.markdownlint.json`                                               |
| commitlint   | Commit messages | `commitlint.config.js` (extends `@commitlint/config-conventional`) |
| ESLint       | JS / TS         | `eslint.config.js` (flat config)                                   |
| Prettier     | All file types  | `.prettierrc`                                                      |

Pre-commit hooks (Husky + lint-staged) run Prettier and linters on staged files before every commit. Hooks must not be skipped (`--no-verify` is prohibited in CI).

---

## Adding a New Component — Checklist

Use the `.agent/skills/component-creator` workflow for guided creation. At minimum:

- [ ] All required tokens exist in `packages/lets-ui-tokens`. If not, add them first and rebuild.
- [ ] SCSS file created in `packages/styles/src/components/` (pure-CSS components) and registered in `_components.scss`.
- [ ] Shadow DOM SCSS created in the component directory (does not re-import global).
- [ ] LitElement class with `@property({ reflect: true })` for every public attribute.
- [ ] `static formAssociated = true` + `ElementInternals` for form components.
- [ ] Keyboard navigation verified manually.
- [ ] ARIA attributes correct for the element's role.
- [ ] `.stories.js` with `argTypes` covering all properties.
- [ ] `.docs.mdx` with description, Canvas blocks, and accessibility notes.
- [ ] Named export added to `packages/lets-ui-components/package.json`.
- [ ] Added to the correct Storybook category.
- [ ] Changeset entry created.

---

## Playground

The `/playground` directory is an Astro static site used for raw integration testing of Web Components outside Storybook. Pages mirror component categories:

| Page                      | Content                  |
| ------------------------- | ------------------------ |
| `index.astro`             | Introduction             |
| `layout.astro`            | Layout primitives        |
| `forms.astro`             | Form components          |
| `vanillacomponents.astro` | Full component showcase  |
| `switcher.astro`          | Switcher demo            |
| `float.astro`             | Float positioning demo   |
| `scroll-area.astro`       | Scroll area demo         |
| `host.astro`              | Body / host demo         |
| `validation.astro`        | Form validation patterns |

Add a playground page when a new component's behavior is hard to demonstrate in a static Storybook story.
