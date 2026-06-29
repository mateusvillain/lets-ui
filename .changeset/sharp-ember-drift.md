---
'@lets-ui/components': minor
'@lets-ui/styles': minor
'@lets-ui/tokens': minor
---

Replace named spacing sizes with direct numeric fluid tokens across all layout components (Box, Columns, Container, Flex, Grid, Inline, Sidebar, Stack, Switcher). Spacing props now accept numeric values (`gap="16"`, `padding="24"`, etc.) that resolve to the corresponding `--lui-spacing-fluid-{n}` CSS custom properties. Named aliases (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) remain supported for backward compatibility.
