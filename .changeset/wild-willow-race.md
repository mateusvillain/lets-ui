---
'@lets-ui/components': patch
'@lets-ui/styles': patch
'@lets-ui/tokens': patch
---

Fix keyboard navigation in lui-radio-group by implementing an explicit arrow key handler and roving tabindex, replacing native browser delegation which is broken across shadow DOM boundaries. Disabled options are skipped, navigation wraps circularly, and role="radiogroup" is added to the fieldset to fix an aria-required A11y violation.
