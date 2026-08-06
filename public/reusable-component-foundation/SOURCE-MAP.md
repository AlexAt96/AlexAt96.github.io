# Source Map

The source snapshot preserves the files used to identify behaviour, styling, APIs and data lineage, with trailing end-of-file whitespace normalised for clean version control. Per-pack `code/*.reference.*` files are focused extracts generated from the function names in `component-catalogue.json`.

## Shared source snapshot

- `source-snapshot/app/src/app.js`
- `source-snapshot/app/src/view-helpers.js`
- `source-snapshot/app/index.html`
- `source-snapshot/app/phase.html`
- `source-snapshot/app/document.html`
- `source-snapshot/app/decision.html`
- `source-snapshot/app/admin.html`
- `source-snapshot/app/bu.html`
- `source-snapshot/app/input-centre.html`
- `source-snapshot/app/new-project.html`
- `source-snapshot/app/adf-lineage-explorer.html`
- `source-snapshot/app/dependency-explorer.html`
- `source-snapshot/app/styles/01-foundation.css`
- `source-snapshot/app/styles/02-shell-navigation.css`
- `source-snapshot/app/styles/03-dashboard-planning.css`
- `source-snapshot/app/styles/04-phase-documents.css`
- `source-snapshot/app/styles/05-collection-workflows.css`
- `source-snapshot/app/styles/06-analysis-workflows.css`
- `source-snapshot/app/styles/07-outputs-decision.css`
- `source-snapshot/app/styles/08-admin-integrations.css`
- `source-snapshot/app/styles/09-input-runner.css`
- `source-snapshot/app/styles/11-system-map-visuals.css`
- `source-snapshot/app/styles/12-responsive-overrides.css`
- `source-snapshot/app/styles/main.css`
- `source-snapshot/server/server.js`
- `source-snapshot/server/routes/admin-routes.js`
- `source-snapshot/server/routes/business-unit-routes.js`
- `source-snapshot/server/routes/business-unit-screen-routes.js`
- `source-snapshot/server/routes/input-centre-routes.js`
- `source-snapshot/server/routes/programme-routes.js`
- `source-snapshot/server/routes/workspace-routes.js`
- `source-snapshot/server/lib/dora-metrics.js`
- `source-snapshot/server/lib/repo-quality-metrics.js`
- `source-snapshot/server/lib/system-map-builder.js`
- `source-snapshot/server/lib/system-map-lineage-registry.js`
- `source-snapshot/server/lib/app-api-protection-evidence.js`
- `source-snapshot/server/lib/app-api-protection-workspace.js`
- `source-snapshot/docs/reports/interactive-system-map.html`
- `source-snapshot/docs/source/COMPONENT_CATALOGUE.md`
- `source-snapshot/docs/source/WORKFLOW_STEPS_AND_STATUS.md`
- `source-snapshot/docs/source/DATA_LINEAGE.md`
- `source-snapshot/docs/source/DATA_MAP_AND_SCHEMA.md`
- `source-snapshot/docs/source/FUNCTIONAL_SPEC.md`
- `source-snapshot/docs/source/TECH_SPEC.md`
- `source-snapshot/docs/source/ROLE_PERMISSIONS_MATRIX.md`
- `source-snapshot/docs/assets/diagrams/screen-link-map.mmd`
- `source-snapshot/docs/assets/diagrams/screen-link-map.svg`
- `source-snapshot/docs/assets/diagrams/data-flow-summary.svg`
- `source-snapshot/package.json`
- `source-snapshot/tools/check-static.cjs`
- `source-snapshot/tools/check-system-map.cjs`
- `source-snapshot/tools/check-consistency.cjs`
- `source-snapshot/tools/run-server-smoke.cjs`
- `source-snapshot/tools/persistence-test.cjs`

## Extraction note

Function extracts run from a named function declaration to the next declaration at the same indentation level. They may therefore contain adjacent constants or event wiring needed to understand the reference. The full source snapshot is authoritative whenever an extract lacks context.
