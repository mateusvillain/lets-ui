---
'@lets-ui/components': patch
---

Fix the component subpath exports, such as `@lets-ui/components/alert`. They pointed at `dist/components/alert.js`, but the build writes each component to a folder of its own, `dist/components/alert/alert.js`, so every subpath import failed to resolve.
