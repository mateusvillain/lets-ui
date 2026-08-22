---
'@lets-ui/tokens': minor
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Replace per-variant hover/pressed background tokens with a single interaction state layer. Hover and active are now one brand-agnostic tint — black in light themes, white in dark — mixed into a component's own resting background at 8% (hover) and 16% (active), exposed through the `state($state)` function and the `state-layer($bg)` mixin. Over an opaque background the mix is identical to compositing the tint on top; over a transparent one it resolves to the tint at exactly that alpha.

Adding a brand no longer requires any state tokens, and `navbar` links drop the `filter: brightness()` approach for the same overlay used everywhere else.

Each direction of the transition has its own pace, applied by the `state-timing($state)` mixin: 140ms `ease-out` entering hover, 40ms `linear` entering active, and 220ms `ease-out` returning to rest. The short press matters — a click lasts around 80ms, so a slower transition would never reach the pressed tint.

## Migration

- The `--lui-color-{primary,secondary,danger,success,neutral}-background-{hover,pressed}` custom properties give way to a single token, `--lui-color-interaction-tint`. The 8% and 16% amounts never vary by theme or brand, so they are SCSS constants in `_functions.scss` rather than tokens.
- Components with a state layer declare their resting background through `--lui-bg` (via the `state-layer($bg)` / `state-base($bg)` mixins) instead of `background-color`.
- The `hover($variant)` and `pressed($variant)` SCSS functions give way to `state(hover)` / `state(pressed)`.
- The `states()` mixin no longer takes the variant as its first argument: `states($variant, $focus-visible, $focus?)` becomes `states($focus-visible, $focus?)`.
