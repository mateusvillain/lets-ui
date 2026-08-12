---
'@lets-ui/styles': patch
'@lets-ui/components': patch
---

Fix `<lui-heading>` and `<lui-body>` ignoring margin, padding, border and size on the host element. The document-level rules `lui-heading { display: contents }` and `lui-body { display: contents }` in `@lets-ui/styles` were overriding the components' own `:host { display: block }` (a type selector in the document beats `:host` for the host element), so the elements generated no box. Both now declare `display: block`, matching the components, and `[hidden]` is honoured on the host in the document and in the shadow root.
