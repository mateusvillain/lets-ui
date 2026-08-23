---
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Add `href` support to Button so it can render as a link with button appearance. When `href` is set, `lui-button` renders an `<a>` instead of a `<button>`, keeping `variant`, `size` and `block` identical, and accepts `target`, `rel` and `download`. The CSS-only `.btn` classes now apply to `<a>` as well.

`target="_blank"` adds `noopener noreferrer`, and a `rel` you pass is merged into that protection rather than replacing it — `rel="nofollow"` yields `nofollow noopener noreferrer`, with duplicate tokens collapsed. `download` is accepted with or without a value, so `download` on its own keeps the server-provided filename.

With `disabled` or `loading` the `href` is dropped, so the element does not navigate by click, middle-click or "open in new tab", while `aria-disabled="true"` and `role="link"` keep it announced correctly. The two states differ in focus: `disabled` takes `tabindex="-1"` and leaves the tab order, matching a native disabled button, while `loading` is transient and takes `tabindex="0"` so a user already focused on the control keeps their place — without `href` an anchor is not focusable at all. Click dispatch matches the `<button>` path in both states: a disabled control fires no click at all, a loading one still reaches host listeners.
