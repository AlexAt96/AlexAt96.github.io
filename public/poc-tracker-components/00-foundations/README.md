# Visual system

Load files in this order:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
```

`tokens.css` is the contract. It includes palette, typography, spacing, radii, elevation, motion, control size, and light/dark values. `base.css` applies accessible defaults. `components.css` supplies reusable classes for panels, buttons, fields, pills, notices, metrics, progress, and tables.

Set dark mode with `document.documentElement.dataset.theme = "dark"`. If the host already has a theme system, map its theme attribute to these variables rather than duplicating component rules.

Use semantic modifier classes such as `poc-pill--success` and `poc-notice--warning`; do not select status colours based on display text.

