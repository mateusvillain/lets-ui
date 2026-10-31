---
'@lets-ui/components': minor
'@lets-ui/styles': minor
---

Add Command Palette (`lui-command-palette` and the CSS-only `.command-palette`), a keyboard-driven search dialog that opens on ⌘K / Ctrl+K. Results are declared with the data-only `lui-command-group`, `lui-command-item` and `lui-command-tag` children: grouped sections, filter tags, icon or avatar leading slots, caption, description and shortcut. It filters as you type, ignoring case and accents, or leaves the search to the application with `no-filter` and the `lui-search` event; activating an item emits `lui-select`. A `trigger` slot opens it on click. While open, the rest of the page is inert, focus is trapped and returns to the opener on close, and the result count is announced once typing pauses.
