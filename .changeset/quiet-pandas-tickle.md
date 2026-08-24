---
'@lets-ui/tokens': minor
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Derive the interaction state layer from each component's own content colour instead of a per-theme tint. Hover and active still mix 8% / 16% into a component's resting background, but the colour they mix in is now `currentColor` — the on-colour of that background — rather than black in light themes and white in dark ones.

A single tint per theme could not serve two components in the same theme that need opposite directions: 8% black over a near-black button is imperceptible, while a transparent button with dark text in that same theme does need darkening. Reading the content colour resolves both without measuring anything. Because a component's content and background are already required to contrast, the tint is always the luminous opposite of the surface — so the layer lightens what is dark and darkens what is light, with no luminance test, no threshold to flip across, and no need to know which surface a transparent component sits on. The contrast requirement also guarantees the move is visible, which a fixed tint did not.

## Migration

- `--lui-color-interaction-tint` is removed. There is no interaction token any more: the tint is a colour the component already declares, and the 8% / 16% amounts remain SCSS constants in `_functions.scss`.
- The `state-tint()` SCSS function is removed. Its replacement is the `state-tint($tint)` mixin, which sets `--lui-state-tint` for the cases where an element's `color` is not the on-colour its states should use.
- Declare `color` on the same element that receives the state layer. An element that inherits its text colour now tints with whatever an ancestor set. Two components were adjusted for this: checked checkbox / radio / switch declare the colour their mark is painted with, and `icon-button` declares the colour of its slotted icon.
