---
'@lets-ui/components': patch
---

Fix `lui-input` and `lui-textarea` not reflecting the typed value back to the host `value` property. Reading `event.target.value` from the re-emitted `input`/`change` events (the common controlled-binding pattern in React and friends) returned the initial value instead of what the user typed, silently dropping form data. The handlers now assign `this.value` before dispatching, the number stepper keeps `value` in sync, and `lui-textarea` binds `.value` on the internal `<textarea>` so programmatic updates also reach the DOM.
