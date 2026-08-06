# Compass UI complete source export

This package contains the working React and TypeScript source for the reusable Compass template library, its 26 UI patterns, shared components, CSS Modules, design tokens and variable font files.

## Contents

- `app/CompassPatternSections.tsx` and `.module.css`: 26 individually embedded main-showroom pattern sections.
- `app/CompassPatternWorkbench.tsx` and `.module.css`: the four-tab developer handoff with source, fixtures and contracts.
- `app/foundation/patternCatalogue.ts` and `patternTechnicalDetails.ts`: the shared catalogue, exact exports, behaviour, accessibility and representative payloads.
- `app/foundation/`: the standalone reference page and all template implementations.
- `public/reusable-component-foundation/`: the catalogue and JSON fixtures imported by the working templates.
- `app/globals.css`: host-level semantic tokens and showroom framing.
- `styling/typography.css`: Source Sans 3 font faces and semantic type tokens.
- `styling/colours.css`: semantic surface, text, brand and status colours.
- `fonts/`: upright and italic Source Sans 3 variable fonts.

## Using the templates

Copy the `app/foundation` directory, both `app/CompassPattern*` components, `app/scenarios.ts`, `app/site-paths.ts` and the included `public/reusable-component-foundation` fixtures into a React or Next.js project. Retain the CSS Module imports and provide routes for any linked handoff documents. The patterns use safe local data and keep storage, network and analytics concerns outside the reusable UI boundary.

The embedded gallery inherits the host application’s semantic Compass variables and passes its canvas, surfaces, text, borders, accent, information and status colours into every template through `--template-*` tokens. Without those variables, the standalone reference palette is used.

Import the styling tokens from your app entry point when you want to use the exported visual system independently:

```css
@import "./styling/typography.css";
@import "./styling/colours.css";
```

The downloadable source is a starting point rather than a published package, so project-specific routing and data adapters remain yours to connect. It includes the JSON fixtures and scenario types referenced by the templates; the Component Workbench documents the exact reference props and a separate recommended product adapter for each pattern.
