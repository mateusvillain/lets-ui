---
'@lets-ui/components': patch
---

Modal and Drawer no longer set `aria-controls` on a trigger passed through the `trigger` slot: it pointed at an ID inside their shadow root, which a light DOM element cannot reference, so it was always dangling. The slotted trigger keeps `aria-haspopup` and `aria-expanded`, and the default `trigger-label` button keeps `aria-controls`. Modal and Drawer also move these attributes to a trigger swapped into the slot, clear them from the one it replaced, and skip `tabindex="-1"` and disabled descendants when picking the element that receives them
