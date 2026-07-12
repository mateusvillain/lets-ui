---
'@lets-ui/tokens': minor
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Add new Toast component for transient, non-blocking notifications: the `<lui-toast>` web component plus CSS-only `.toast` / `.toast-region` styles. Supports `default`, `success`, and `danger` variants with variant-appropriate ARIA live-region roles, configurable auto-dismiss `duration` (default 5000ms, `0` disables) that pauses on hover and keyboard focus, always-persistent `danger` toasts, Escape-to-dismiss, custom icon and action slots, a `lui-close` event, and slide/fade animations that respect `prefers-reduced-motion`.
