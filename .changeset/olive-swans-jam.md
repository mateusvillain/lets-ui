---
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Add `href` support to Button so it can render as a link with button appearance. When `href` is set, `lui-button` renders an `<a>` instead of a `<button>`, keeping `variant`, `size` and `block` identical, and accepts `target`, `rel` (auto `noopener noreferrer` for `target="_blank"`) and `download`. With `disabled` or `loading` the `href` is dropped, so the element neither navigates nor takes focus, while `aria-disabled` and `role="link"` keep it announced correctly. The CSS-only `.btn` classes now apply to `<a>` as well.
