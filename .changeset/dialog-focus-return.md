---
'@lets-ui/components': patch
---

Modal and Drawer return focus to the element that opened them when they close, by Escape, the close button, a backdrop click or a programmatic close. Removing an open dialog from the page also returns focus. When that element is gone, focus goes to the component's trigger. Focus that already moved outside the component stays put, and a dialog closed before its first frame no longer pulls focus into the hidden panel. Modal also locks and unlocks page scroll when `open` is set directly, not only through `openModal()` and `closeModal()`
