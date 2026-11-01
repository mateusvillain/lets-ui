---
'@lets-ui/styles': patch
'@lets-ui/components': patch
---

Fix keyboard focus in the Dropdown Menu. Opening the menu now focuses the first enabled item: its state transition also animated the `visibility` it inherits from the panel, which kept it hidden on the opening frame, so focus stayed on the trigger. Items are now out of the Tab order and reached with the arrow keys; Tab closes the menu and moves focus past the trigger, Shift+Tab before it
