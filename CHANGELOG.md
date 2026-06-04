# Changelog

## v1.4.0

### Added

- Extend `lui-link` with full anchor attribute coverage: `target` (default `_self`), `rel` (auto `noopener noreferrer` when `target="_blank"`), `download`, `hreflang`, and `referrerpolicy`.
- New `external` boolean prop on `lui-link` — renders an inline SVG icon and automatically sets `target="_blank"` and `rel="noopener noreferrer"`.
- New `size` prop on `lui-link` with `lg`, `md`, and `sm` values following the same typographic scale as `lui-body`; omitting it inherits `font-size` from context.
- New `disabled` boolean prop on `lui-link` — removes `href`, sets `aria-disabled="true"`, and keeps the element focusable via `tabindex="0"`.
- New `visited` boolean prop on `lui-link` — opt-in `:visited` styling, off by default to avoid unintentional exposure of browsing history.
- New `type` prop on `lui-button` (`button` | `submit` | `reset`, default `button`) for native form semantics.
- New `block` boolean prop on `lui-button` — stretches the button to full container width.
- New `loading` boolean prop on `lui-button` — shows an animated spinner, sets `aria-busy="true"`, and blocks interaction with `cursor: wait`.
- New `loading-text` prop on `lui-button` — label displayed while `loading` is active; falls back to `label` when omitted.
- New `prefix` and `suffix` named slots on `lui-button` for leading/trailing icons; default slot falls back to the `label` attribute.
- New `autofocus` boolean prop on `lui-button`.
- Form integration (`ElementInternals`) for `lui-button` — adds `name` and `value` props; submit and reset are handled via a click listener so the inner `<button type="button">` never accidentally submits; `formDisabledCallback` keeps `disabled` in sync with the owning `<form>`.
- Form integration for `lui-checkbox` — adds `name`, `value`, and `required` props; validity is managed via `ElementInternals`; new `error` and `error-text` props render an inline error message below the control; slot support replaces the hardcoded `<span>` label.
- Form integration for `lui-input` — adds `name` and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.
- Form integration for `lui-radio` — adds `ElementInternals` support; sibling deselection is now coordinated through the enclosing `lui-radio-group`; slot support replaces the hardcoded label `<span>`.
- New `lui-radio-group` component — wraps `lui-radio` elements with a shared `name`; manages `label`, `size`, `hint`, `required`, `disabled`, `error`, and `error-text`; form value and validity are handled via `ElementInternals`.
- Form integration for `lui-select` — adds `name` and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.
- Form integration for `lui-switch` — adds `name`, `value`, and `required` props; new `error` and `error-text` props render an inline error message; slot support replaces the hardcoded label `<span>`.
- Form integration for `lui-textarea` — adds `name` and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.

### Fixed

- Remove trailing whitespace from `class` attribute of `lui-link` when `size` is not set.
- Resolve `disabled` state on `lui-link` not applying `cursor: not-allowed` due to `pointer-events: none` blocking the cursor; navigation is now prevented by removing `href` instead.
- Correct `aria-disabled` binding on `lui-link` — the Lit boolean attribute (`?`) was rendering `aria-disabled=""` instead of `aria-disabled="true"`, preventing CSS selector from matching.
- Prevent hover underline from appearing on `lui-link` while `disabled` is active by scoping `:hover` to `:not([aria-disabled="true"])`.
- Crop SVG `viewBox` on the external icon of `lui-link` to match the surrounding text size.

## v1.3.0

### Added

- Add slot support to `lui-link`, keeping the `label` attribute as fallback by @mateusvillain in [PR #51](https://github.com/mateusvillain/lets-ui/pull/51)
- Extract `_typography-reset.scss` partial targeting only `h1`–`h6`, `p`, and `div` — replaces the global `_reset.scss` inside Shadow DOM components, reducing unnecessary reset rules by @mateusvillain in [PR #49](https://github.com/mateusvillain/lets-ui/pull/49)

### Fixed

- Fix `lui-heading` to render the correct semantic HTML tag based on the selected variant (`title` → `<h1>`, `subtitle` → `<h2>`, `headline` → `<h3>`, `subheadline` → `<h4>`, `block-title` → `<h5>`, `overtitle` → `<h6>`); the `as` prop remains available for manual overrides by @mateusvillain in [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)
- Fix `lui-body` to default to `<p>` instead of `<div>`, while still respecting the `as` prop by @mateusvillain in [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)
- Fix CSS reset import order inside the Shadow DOM for `lui-heading` and `lui-body`, ensuring typography styles are not unintentionally overridden by the reset by @mateusvillain in [PR #48](https://github.com/mateusvillain/lets-ui/pull/48)

## v1.2.0

### Added

- Migrate all Web Components from Vanilla JS to Lit + TypeScript with per-component shadow DOM styles by @mateusvillain in [PR #43](https://github.com/mateusvillain/lets-ui/pull/43)
- Add slot support and `bold` prop to `lui-heading` and `lui-body` for flexible text rendering by @mateusvillain in [PR #47](https://github.com/mateusvillain/lets-ui/pull/47)
- Add slot support to `lui-icon-button`, allowing custom content inside the component by @mateusvillain in [PR #45](https://github.com/mateusvillain/lets-ui/pull/45)

### Changed

- Add Renovate configuration by @mateusvillain in [PR #10](https://github.com/mateusvillain/lets-ui/pull/10)
- Centralize `display: contents;` utility into `_host.scss` by @mateusvillain in [PR #32](https://github.com/mateusvillain/lets-ui/pull/32)

### Fixed

- Fix Tooltip Storybook stories by @mateusvillain in [PR #34](https://github.com/mateusvillain/lets-ui/pull/34)
- Fix Modal Storybook stories and docs page by @mateusvillain in [PR #36](https://github.com/mateusvillain/lets-ui/pull/36)
- Remove merge conflict markers by @mateusvillain in [PR #38](https://github.com/mateusvillain/lets-ui/pull/38)

## v1.1.1

### Fixed

- Fix color mode switching in [PR #40](https://github.com/mateusvillain/lets-ui/pull/40)
- Fix color contrast in light and dark mode in [PR #40](https://github.com/mateusvillain/lets-ui/pull/40)

## v1.1.0

### Added

- Add `lui-image` web component by @mateusvillain in [PR #33](https://github.com/mateusvillain/lets-ui/pull/33)
- Add `lui-heading` and `lui-body` web components by @mateusvillain in [PR #30](https://github.com/mateusvillain/lets-ui/pull/30)

### Changed

- Add Renovate configuration by @mateusvillain in [PR #10](https://github.com/mateusvillain/lets-ui/pull/10)
- Centralize `display: contents;` utility into `_host.scss` by @mateusvillain in [PR #32](https://github.com/mateusvillain/lets-ui/pull/32)

### Fixed

- Fix Tooltip Storybook stories by @mateusvillain in [PR #34](https://github.com/mateusvillain/lets-ui/pull/34)
- Fix Modal Storybook stories and docs page by @mateusvillain in [PR #36](https://github.com/mateusvillain/lets-ui/pull/36)
- Remove merge conflict markers by @mateusvillain in [PR #38](https://github.com/mateusvillain/lets-ui/pull/38)

## v1.0.0

### Added

- `@lets-ui/tokens` — Design tokens as CSS custom properties and SCSS variables with light/dark theme support and multi-brand via `data-theme` / `data-brand` attributes.
- `@lets-ui/styles` — Component SCSS compiled to `letsui.min.css`, covering all design system components.
- `@lets-ui/components` — Vanilla JS Web Components (custom elements, no framework) for all design system components: Alert, Breadcrumb, Button, Card, Checkbox, Divider, Drawer, Dropdown Menu, Icon Button, Input, Link, Modal, Radio, Select, Shortcut, Switch, Tabs, Tag, Textarea, Tooltip.

### Changed

- Migrated monorepo to fixed versioning via Changesets — all packages share a unified version number.
- Replaced tag-based release workflow with Changesets GitHub Action (automated "Version Packages" PR flow).

---

<!-- Historical entries below are from the pre-monorepo era (single package, versions 0.x). -->

## 0.19.0

### Added

- Added `xl` border-radius token
- Added global color tokens for light and dark modes
- Added brand color tokens for light and dark modes
- Added brand foundation tokens
- Added brand-based foundation separation to config
- Included Sass files in package distribution

### Changed

- Updated light and dark color schemes
- Reorganized token structure for themes
- Updated resolver file structure

## 0.18.0

### Changed

- Updated `terrazzo.config.mjs` to support data-theme and data-brand
- Updated `letsui.resolver.json` to support data-theme and data-brand
- Updated `colors.json` to support data-theme and data-brand

## 0.17.2

### Fixed

- Corrected spacing variables generation

## 0.17.1

### Changed

- Updated component semantics to follow the BEM methodology (`Alert`, `Button`, `Card`, `Checkbox`, `Text Field`, `Modal`, `Select`, and `Tag`).
- Updated body text styles in the typography SCSS map to follow the BEM naming convention.
- Updated documentation to reflect the new component and typography semantics.

## 0.17.0

### Added

- `Modal` component
- `Modal` documentation

## 0.16.0

### Changed

- Renamed `accent` token to `primary`
- Renamed `border-radius-1xs` token to `border-radius-xs`

## 0.15.0

### Added

- Created the `Tooltip` component.
- Added overlay color for interface overlays to the color map.
- Created a new state mixin to standardize component states.
- Applied the state mixin to `Link` and `Icon Button` components.

### Removed

- Removed the `Header` component.

## 0.14.0

### Added

- Created a `disabled` state **mixin** for consistent disabled styles.
- Added `surface` and `container` variants for the `Tag` component.

### Changed

- Moved `Checkbox` and `Select` components into their own files.
- Updated `Button` padding for `large` and `medium` sizes to use **fluid** spacing.
- Improved Sass structure and rules in `form.scss` for better maintainability.

## 0.13.2

### Changed

- Adjusted the hover and active states of the `Navbar` component.

## 0.13.1

### Changed

- Adjusted the `font` mixin in the `Tag` component and form components.
- Removed the `scales` map from `typography.scss` and moved it to `tokens.map`.
- Reduced the `navbar` height to match the `header` size.

## 0.13.0

### Changed

- Migrated from Style Dictionary to Terrazzo
- Defined new breakpoints and increased the grid size

### Added

- Created a resolver file to support themes and brands
- Added `functions`, `maps` and `mixins` directories

### Removed

- Removed grid tokens

## 0.12.0

### Added

- Created `border.scss` and `spacing.scss` files with utility classes for borders and spacing
- Added new `fluid` and `scale` spacing options

### Changed

- Improved `flexbox.scss` code for better readability and maintenance
- Updated typographic scales using `clamp()` for better responsiveness

### Removed

- Removed `border-width` tokens with values of `8px`, `12px`, and `16px` due to low usage or inconsistency with the rest of the scale

## 0.11.0

### Added

- New modular scale system using [modularscale-sass](https://github.com/modularscale/modularscale-sass)

### Fixed

- Correct path to variables.css in style files

## 0.10.0

### Added

- Elevation tokens (Base, Floating, Overlay)
- Card component

## 0.9.0

### Added

- New variants for tag: Primary, Danger, Success, Neutral

## 0.8.2

### Added

- Button now has `.scss` file

## 0.8.1

### Added

- Brand design tokens structure: primary and secondary colors (light/dark), font-family for headings and body, font-size for desktop and mobile, default border-radius.

### Removed

- Classes for brand color and font-family from `baseline.css`.

## 0.8.0

### Added

- Style Dictionary + Tokens Studio + GitHub connections
- All tokens in `.json` files
- Header component

## 0.7.0

### Changed

- Grid structure now has 12 columns by default with new classes for large, medium, and small devices.

## 0.6.0

### Changed

- Hover, active and focus microinteraction

## 0.5.0

### Added

- Baseline file to import all styles and components

## 0.4.0

### Added

- Navbar
- Grid for large and small screens

## 0.3.0

### Added

- Icon Button
- Icon font-family for tests

## 0.2.0

### Added

- Breadcrumb, Checkbox, Radio Button, Text field, Select

## 0.1.0

### Added

- Initial project structure: Button, Link, Tag components; primitive spacing, color, border, and typography tokens; reset CSS and flexbox styles.
