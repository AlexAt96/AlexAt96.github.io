# Compass UI complete source export

This package contains the working React and TypeScript source for the reusable Compass template workbench, its 26 UI patterns, shared components, CSS Modules, design tokens and variable font files.

## Contents

- `app/foundation/`: workbench page, gallery and all template implementations.
- `styling/typography.css`: Source Sans 3 font faces and semantic type tokens.
- `styling/colours.css`: semantic surface, text, brand and status colours.
- `fonts/`: upright and italic Source Sans 3 variable fonts.

## Using the templates

Copy the `app/foundation` directory into a React or Next.js project, retain the CSS Module imports and provide routes for any linked handoff documents. The templates receive local data and keep storage, network and analytics concerns outside the reusable UI boundary.

Import the styling tokens from your app entry point when you want to use the exported visual system independently:

```css
@import "./styling/typography.css";
@import "./styling/colours.css";
```

The downloadable source is a starting point rather than a published package, so project-specific routing and data adapters remain yours to connect.
