---
'@lets-ui/components': minor
'@lets-ui/styles': minor
'@lets-ui/tokens': minor
---

Fix missing ARIA attributes across interactive components: link aria-describedby to error messages in checkbox, switch, and radio-group; propagate aria-invalid from radio-group to individual radio inputs; add tabindex="0" to active tabpanel per APG pattern; expose aria-expanded/aria-controls on dropdown-menu trigger and toggle submenu aria-expanded dynamically; apply aria-haspopup, aria-controls, and aria-expanded to slotted custom triggers in modal and drawer; add aria-describedby to drawer dialog pointing to body; add visually-hidden new-tab announcement to external link.
