---
'@lets-ui/components': minor
'@lets-ui/styles': minor
'@lets-ui/tokens': minor
---

- New `type` prop on `lui-button` (`button` | `submit` | `reset`, default `button`) for native form semantics.
- New `block` boolean prop on `lui-button` — stretches the button to full container width.
- New `loading` boolean prop on `lui-button` — shows an animated spinner, sets `aria-busy="true"`, and blocks interaction with `cursor: wait`.
- New `loading-text` prop on `lui-button` — label displayed while `loading` is active; falls back to `label` when omitted.
- New `prefix` and `suffix` named slots on `lui-button` for leading/trailing icons; default slot falls back to the `label` attribute.
- New `autofocus` boolean prop on `lui-button`.
- Form integration (`ElementInternals`) for `lui-button` — adds `name`, `value`, and `form` props; submit and reset are handled via a click listener so the inner `<button type="button">` never accidentally submits; `formDisabledCallback` keeps `disabled` in sync with the owning `<form>`.
- Form integration for `lui-checkbox` — adds `name`, `value`, `form`, and `required` props; validity is managed via `ElementInternals`; new `error` and `error-text` props render an inline error message below the control; slot support replaces the hardcoded `<span>` label.
- Form integration for `lui-input` — adds `name`, `form`, and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.
- Form integration for `lui-radio` — adds `ElementInternals` support; sibling deselection is now coordinated through the enclosing `lui-radio-group`; slot support replaces the hardcoded label `<span>`.
- New `lui-radio-group` component — wraps `lui-radio` elements with a shared `name`; manages `label`, `size`, `hint`, `required`, `disabled`, `error`, and `error-text`; form value and validity are handled via `ElementInternals`.
- Form integration for `lui-select` — adds `name`, `form`, and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.
- Form integration for `lui-switch` — adds `name`, `value`, `form`, and `required` props; new `error` and `error-text` props render an inline error message; slot support replaces the hardcoded label `<span>`.
- Form integration for `lui-textarea` — adds `name`, `form`, and `required` props; `formDisabledCallback` and `formResetCallback` keep state consistent with the owning `<form>`.
