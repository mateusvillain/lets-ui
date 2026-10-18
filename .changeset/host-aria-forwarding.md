---
'@lets-ui/components': minor
---

Stop exposing component hosts as extra `generic` nodes in the accessibility tree. Breadcrumb, Button, Card, Checkbox, Code Block, Icon Button, Input, Link, Radio, Select, Shortcut, Switch, Textarea and Tooltip now take the `aria-*` attributes they accept into a property and remove them from the host; Modal and Drawer set their trigger's state through ARIA properties and no longer add a dangling `aria-controls` to it. Host attribute selectors such as `lui-button[aria-expanded="true"]` no longer match: read the property instead
