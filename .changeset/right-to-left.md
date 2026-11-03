---
'@lets-ui/components': minor
'@lets-ui/styles': minor
---

Support right-to-left layouts. Components follow the `dir` of their closest ancestor and update when it changes: the horizontal arrow keys swap in `lui-tabs`, `lui-radio-group`, `lui-dropdown-menu` and the `lui-date-picker` calendar; directional icons mirror (pagination, calendar and submenu arrows, the external-link icon); `lui-switch`, `lui-drawer`, `lui-float` and the dropdown submenu move to the other side; `lui-scroll-area` reads its edges right when a right-to-left viewport scrolls; margins, borders and text alignment use logical properties. `lui-code-block` stays left to right.

New: an optional `$dir` (`'ltr'` or `'rtl'`) on translations, set on every shipped dictionary, for an application's language switcher to set `<html dir>` from — components keep reading the `dir` attribute. `position="start"` and `"end"` on `lui-tooltip`, the `--top-start`, `--top-end`, `--bottom-start` and `--bottom-end` toast-region modifiers, and `s` / `e` spacing utilities (`.m-s-fixed-8`, `.p-e-fluid-16`) for the start and end of the line.

Fix the toast region's `--top-right`, `--bottom-right`, `--top-left` and `--bottom-left` landing on the opposite side, and the centred region drifting off centre, on right-to-left pages.
