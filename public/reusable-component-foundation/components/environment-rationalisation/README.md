# Environment rationalisation and proposed topology

Editable migrate/merge/decommission decisions, target environments, proposed topology tables and live migration/structure diagrams.

Requested coverage: Environment rationalisation

## Recommended reusable boundaries

- `RationalisationTable`
- `ActionSelect`
- `MergeTargetSelect`
- `TopologyTable`
- `MigrationFlowDiagram`
- `StructureDiagram`
- `ImportExportPanel`

## Current implementation symbols

- `renderEnvironmentRationalisation(...)` in `app/src/app.js`
- `renderProposedTopologyTable(...)` in `app/src/app.js`
- `renderProposedTopologyFlowDiagram(...)` in `app/src/app.js`
- `renderEnvironmentMigrationFlowDiagram(...)` in `app/src/app.js`
- `renderProposedTopologyStructureDiagram(...)` in `app/src/app.js`
- `getEnvironmentRationalisationModel(...)` in `app/src/app.js`
- `normaliseEnvironmentRationalisationAction(...)` in `app/src/app.js`
- `wireEnvironmentRationalisationActions(...)` in `app/src/app.js`
- `refreshProposedTopologyDiagrams(...)` in `app/src/app.js`
- `parseEnvironmentRationalisationImportFile(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=team-analysis&section=proposed-environment-rationalisation&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/environment-rationalisation`

## Required states

- current
- migrate
- merge
- decommission
- target incomplete
- diagram refreshed
- saved

## Data contracts

- environment rationalisation row
- migration action
- merge target
- proposed environment
- topology structure
- diagram node/edge

## Styling references

- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#environmentRationalisation`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
