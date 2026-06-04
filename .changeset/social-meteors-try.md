---
'@lets-ui/components': minor
'@lets-ui/styles': minor
'@lets-ui/tokens': minor
---

### Added

- Extend `lui-link` with full anchor attribute coverage: `target` (default `_self`), `rel` (auto `noopener noreferrer` when `target="_blank"`), `download`, `hreflang`, and `referrerpolicy`.
- New `external` boolean prop on `lui-link` — renders an inline SVG icon and automatically sets `target="_blank"` and `rel="noopener noreferrer"`.
- New `size` prop on `lui-link` with `lg`, `md`, and `sm` values following the same typographic scale as `lui-body`; omitting it inherits `font-size` from context.
- New `disabled` boolean prop on `lui-link` — removes `href`, sets `aria-disabled="true"`, and keeps the element focusable via `tabindex="0"`.
- New `visited` boolean prop on `lui-link` — opt-in `:visited` styling, off by default to avoid unintentional exposure of browsing history.

### Fixed

- Remove trailing whitespace from `class` attribute of `lui-link` when `size` is not set.
- Resolve `disabled` state on `lui-link` not applying `cursor: not-allowed` due to `pointer-events: none` blocking the cursor; navigation is now prevented by removing `href` instead.
- Correct `aria-disabled` binding on `lui-link` — the Lit boolean attribute (`?`) was rendering `aria-disabled=""` instead of `aria-disabled="true"`, preventing CSS selector from matching.
- Prevent hover underline from appearing on `lui-link` while `disabled` is active by scoping `:hover` to `:not([aria-disabled="true"])`.
- Crop SVG `viewBox` on the external icon of `lui-link` to match the surrounding text size.
