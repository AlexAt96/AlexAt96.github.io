# Data lineage and dependency explorer

ADF lineage explorer, source/consumer dependency maps, external connection flows, touchpoint graphs and source traceability contracts.

Requested coverage: Data lineage screen

## Recommended reusable boundaries

- `LineageExplorer`
- `LineageGraph`
- `LineageNode`
- `LineageEdge`
- `PipelineFilter`
- `DetailsDrawer`
- `CaveatList`
- `SourceTraceLink`

## Current implementation symbols

- `getAdfLineageModel(...)` in `app/src/app.js`
- `renderAdfLineageExplorer(...)` in `app/src/app.js`
- `renderAdfLineageTouchpointMap(...)` in `app/src/app.js`
- `buildAdfPipelineTouchpointGraph(...)` in `app/src/app.js`
- `renderAdfLineageMap(...)` in `app/src/app.js`
- `getAdfLineageLayout(...)` in `app/src/app.js`
- `renderSourceConsumerDependencyDiagram(...)` in `app/src/app.js`
- `buildExternalLocationGraph(...)` in `app/src/app.js`
- `renderExternalLocationDependencyMap(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/adf-lineage-explorer.html`
- `app/dependency-explorer.html`
- `/api/data-map`
- `/api/system-map`

## Required states

- no lineage
- partial
- complete
- pipeline focus
- activity focus
- source focus
- target focus
- evidence caveat

## Data contracts

- lineage node
- lineage edge
- pipeline
- activity
- dataset
- source trace rule
- evidence link
- layout

## Styling references

- `app/styles/11-system-map-visuals.css`
- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#dataLineage`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
