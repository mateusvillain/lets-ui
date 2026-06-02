---
'@lets-ui/components': patch
'@lets-ui/tokens': patch
'@lets-ui/styles': patch
---

- `lui-heading`: fixes semantic HTML tag rendering based on the selected variant (`title` → `<h1>`, `subtitle` → `<h2>`, `headline` → `<h3>`, `subheadline` → `<h4>`, `block-title` → `<h5>`, and `overtitle` → `<h6>`). The `as` prop remains available for manual overrides.
- `lui-body`: fixes the default rendering to use a `<p>` element while still respecting the `as` prop.
- `lui-heading` and `lui-body`: fixes the CSS reset application order inside the Shadow DOM, ensuring typography styles are not unintentionally overridden.
