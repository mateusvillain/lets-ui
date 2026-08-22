---
'@lets-ui/tokens': minor
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Replace three colliding grid systems with one driven by the breakpoint. The legacy 12-column `.col-{bp}-{n}` in `foundations/_grid.scss`, the breakpoint-agnostic `.grid` / `.columns` in `components/`, and the `<lui-grid>` / `<lui-columns>` web components all declared overlapping class names — two SCSS files both defined `.grid`, so bundle order decided which one won.

Column count, gap and inline margin now come from the breakpoint, and the author only picks how many columns an item spans:

| Breakpoint      | Columns | Gap | Margin                    |
| --------------- | ------- | --- | ------------------------- |
| 1xs (< 768px)   | 4       | 16  | 16                        |
| sm (>= 768px)   | 8       | 16  | 32                        |
| md (>= 1024px)  | 8       | 16  | 40                        |
| lg (>= 1280px)  | 12      | 24  | 40                        |
| 1xl (>= 1440px) | 12      | 24  | max-width 1360px, centred |

The config lives in `utilities/_grid.map.scss` and is shared by the global `.grid` and the `<lui-grid>` shadow-DOM styles, so the two cannot drift.

Column spans are named as flat utilities rather than BEM modifiers of a `grid-item` block, matching how the repo already names utilities (`.flex-row`, `.justify-between`):

```text
before:  class="grid-item grid-item--1xs-full grid-item--sm-4 grid-item--lg-4"
after:   class="col-full col-sm-4 col-lg-4"
```

`.grid > *` now carries the `min-width: 0` and the one-column default, so a child spanning a single column needs no class at all. The container keeps BEM (`.grid--flush`, `.grid--align-start`), where it really is a component modifier.

## Migration

- `.col-{bp}-{n}` from the old 12-column system is gone. The name is reused by the new system with different column counts per breakpoint, so audit any markup still using it.
- `.grid-item` and `.grid-item--{bp}-{n}` give way to `.col-{n}` (base) and `.col-{bp}-{n}`.
- `.grid--gap-{n}` is gone — the gap comes from the breakpoint.
- `.columns`, `.column`, `<lui-columns>` and `<lui-column>` are removed. Use `.grid` / `<lui-grid>` with column spans.
- `<lui-grid>` no longer takes `columns`, `rows`, `gap`, `gap-x`, `gap-y` or `justify`.
- On `<lui-grid-item>`, `col-span` / `row-span` / `col-start` / `col-end` give way to `col`, `col-sm`, `col-md`, `col-lg` and `col-1xl`.

`.layout`, `.sidebar`, `.main-content` and the `.show-{bp}` / `.hide-{bp}` helpers are unchanged, moved to `foundations/_layout.scss`.
