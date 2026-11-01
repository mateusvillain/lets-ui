---
'@lets-ui/styles': patch
'@lets-ui/components': patch
---

Move focus to the first enabled Dropdown Menu item when the menu opens. The item's state transition also animated the `visibility` it inherits from the panel, which kept it hidden on the opening frame, so focus stayed on the trigger
