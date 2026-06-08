---
'@lets-ui/styles': patch
'@lets-ui/components': patch
'@lets-ui/tokens': patch
---

- Remove `display: contents` reset from `_host.scss` that was applied globally to all web component tags.
- Remove `.dropdown-menu__trigger { display: contents }` rule.
