---
'@lets-ui/tokens': minor
'@lets-ui/styles': minor
---

Rebuild the brand primary, green and info (blue) palettes in OKLCH so white text on their containers reaches 4.5:1, and tint the hover and pressed states of filled components with the colour opposite their label, so the label gains contrast instead of losing it. The info palette's hue moves from the primary's indigo to a distinct cyan-blue so the two no longer read as the same colour once both reach contrast. Adds the `tint()` function and a `$tint` parameter to `states()`, `state-layer()` and `state-base()`
