# Editable and read-only data tables

Editable row grids, add/copy/remove controls, Excel import/export handoff, compact read-only tables, traceability tables and report tables.

Requested coverage: Data tables, both input and rendering

## Recommended reusable boundaries

- `DataTable`
- `EditableDataTable`
- `ColumnHeader`
- `EditableRow`
- `TableToolbar`
- `ImportExportPanel`
- `EmptyTable`

## Current implementation symbols

- `renderEditDataTable(...)` in `app/src/app.js`
- `renderMiniTable(...)` in `app/src/app.js`
- `renderInputTraceabilityTable(...)` in `app/src/app.js`
- `renderMetadataTableSection(...)` in `app/src/app.js`
- `renderDataDictionaryTableSection(...)` in `app/src/app.js`
- `copyEditableTableRow(...)` in `app/src/app.js`
- `wireMetadataTableActions(...)` in `app/src/app.js`
- `parseImportTableRowsFromFile(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html`
- `app/input-centre.html`
- `/api/business-units/:businessUnitId/*`

## Required states

- empty
- view
- edit
- row added
- row copied
- row removed
- validation error
- import preview
- locked

## Data contracts

- column definition
- editable row
- render row
- validation errors
- pagination/filter metadata
- import aliases

## Styling references

- `app/styles/01-foundation.css`
- `app/styles/05-collection-workflows.css`
- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#tables`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
