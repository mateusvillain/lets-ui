---
'@lets-ui/components': patch
---

Modal and Drawer now move the trigger's `aria-haspopup` and `aria-expanded` to a trigger swapped into the `trigger` slot, clear them from the one it replaced, and skip `tabindex="-1"` and disabled descendants when picking the element that receives them
