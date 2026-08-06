# Metadata results and advanced discovery

Cross-BU and BU metadata review with KPI summaries, category disclosures, inventory tables, Unity Catalog bindings and advanced-discovery charts.

Requested coverage: Metadata results screen

## Recommended reusable boundaries

- `MetadataResultsPage`
- `MetadataKpis`
- `MetadataCategory`
- `ResourceTable`
- `AttributeDisclosure`
- `MetadataChart`
- `ExportAction`

## Current implementation symbols

- `renderMetadataReview(...)` in `app/src/app.js`
- `getMetadataReviewModel(...)` in `app/src/app.js`
- `getMetadataReviewSummary(...)` in `app/src/app.js`
- `renderMetadataReviewStats(...)` in `app/src/app.js`
- `renderDatabricksMetadataOverview(...)` in `app/src/app.js`
- `renderAdfMetadataOverview(...)` in `app/src/app.js`
- `renderDictionaryMetadataOverview(...)` in `app/src/app.js`
- `renderSizingMetadataOverview(...)` in `app/src/app.js`
- `renderMetadataReviewDisclosure(...)` in `app/src/app.js`
- `renderDatabricksInventoryResourceTable(...)` in `app/src/app.js`
- `renderUnityCatalogBindingTable(...)` in `app/src/app.js`
- `renderAdvancedDiscoveryMetadataTab(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=team-analysis&section=metadata-review`
- `app/document.html?phase=team-analysis&section=advanced-discovery`

## Required states

- no metadata
- partial parse
- complete parse
- cross-BU
- BU filtered
- expanded category
- exporting

## Data contracts

- inventory resource
- ADF metadata row
- dictionary column
- table sizing row
- storage path
- UC grant
- workspace binding

## Styling references

- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#metadataResults`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
