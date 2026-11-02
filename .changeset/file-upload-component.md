---
'@lets-ui/styles': minor
'@lets-ui/components': minor
---

Add the File Upload component: `<lui-file-upload>` Web Component and `.file-upload` CSS. A drop zone that opens the native picker, a list of the chosen files with name, size and a Remove button each, and local validation of `accept`, `max-size` and `max-files` that rejects an invalid file without dropping the valid ones. Form-associated (`name`, `required`), with `lui-change` and `lui-error` events. Sending, progress and retry are left to the app — the docs include a recipe.
