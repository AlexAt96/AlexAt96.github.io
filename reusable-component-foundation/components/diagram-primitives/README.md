# Diagram and dependency-map primitives

Node/edge maps, topology flows, source-consumer dependencies, external-location diagrams and zoom/export interaction patterns.

Requested coverage: Diagrams

## Recommended reusable boundaries

- `DiagramCanvas`
- `NodeCard`
- `Edge`
- `Lane`
- `DiagramToolbar`
- `DiagramLegend`
- `DiagramDetailsPanel`

## Current implementation symbols

- `renderExternalLocationDiagram(...)` in `app/src/app.js`
- `renderExternalLocationDependencyMap(...)` in `app/src/app.js`
- `renderSourceConsumerDependencyDiagram(...)` in `app/src/app.js`
- `renderSourceConsumerDependencyDiagramContent(...)` in `app/src/app.js`
- `renderProgramTopologyDiagram(...)` in `app/src/app.js`
- `renderProposedTopologyFlowDiagram(...)` in `app/src/app.js`
- `renderEnvironmentMigrationFlowDiagram(...)` in `app/src/app.js`
- `renderProposedTopologyStructureDiagram(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/dependency-explorer.html`
- `app/adf-lineage-explorer.html`
- `app/document.html?phase=team-analysis&section=external-location-mapping`

## Required states

- empty
- partial
- complete
- selected node
- focused edge
- zoomed
- exported

## Data contracts

- nodes
- edges
- lanes
- node metadata
- evidence links
- layout coordinates

## Styling references

- `app/styles/06-analysis-workflows.css`
- `app/styles/11-system-map-visuals.css`

## Template data

Use `template-data/template-data.json#diagrams`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
