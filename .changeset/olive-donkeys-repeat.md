---
'@lets-ui/components': patch
---

Reflect `name` to an attribute on the form-associated components (`lui-input`, `lui-textarea`, `lui-select`, `lui-checkbox`, `lui-switch`, `lui-radio-group`, `lui-button`). The `FormData` of a form-associated element looks the field up by the `name` **attribute**, while React (and similar frameworks) set `name` as a **property** because the element declares it — so `<lui-input name="email" />` produced no attribute and the field silently vanished from `new FormData(form)`. Setting `name` as a property now reflects to the attribute and the field is submitted, with no `ref={(el) => el?.setAttribute('name', …)}` workaround needed. An unset `name` leaves no `name=""` in the DOM.
