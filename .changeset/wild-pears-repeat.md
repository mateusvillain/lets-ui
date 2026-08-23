---
'@lets-ui/components': patch
---

Fix `lui-input` and `lui-textarea` not reflecting the typed value back to the host `value` property. Reading `event.target.value` from the re-emitted `input`/`change` events (the common controlled-binding pattern in React and friends) returned the initial value instead of what the user typed, silently dropping form data. The handlers now assign `this.value` before dispatching, the number stepper keeps `value` in sync, and `lui-textarea` binds `.value` on the internal `<textarea>` so programmatic updates also reach the DOM.

The `.value` bindings go through `live()`. lit-html dirty-checks a binding against the last value it committed rather than against the DOM, so a consumer correcting the value inside its own `input` handler — input filtering, or a controlled binding re-rendering with unchanged state — never reached the element, and since the form value is read from the DOM, the rejected text was submitted anyway.

Number inputs no longer invent values. Clearing a `required` number field wrote `0` back into it, so the form submitted `0` and `checkValidity()` reported success while the value was missing; `form.reset()` left a `1` on screen that `el.value` did not report; and clamping ran on every keystroke, making a bounded field impossible to fill (`min="1900" max="2100"` turned a typed `2024` into `2100`). Clamping now happens on commit, an empty field stays empty, and stepping up from empty still yields `1`.

`_applyStep` clears `error` and syncs the form value before dispatching, so a `change` listener reading `FormData` or `checkValidity()` no longer sees the previous value.
