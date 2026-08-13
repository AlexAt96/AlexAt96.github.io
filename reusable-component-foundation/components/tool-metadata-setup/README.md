# Tool metadata setup

Editable programme metadata for RICE measures, ADF complexity factors, workflow statuses and technology mappings.

Requested coverage: Metadata setup

## Recommended reusable boundaries

- `MetadataSetupPage`
- `MetadataDisclosure`
- `DefinitionTable`
- `StatusModel`
- `SaveStatus`

## Current implementation symbols

- `renderToolMetadata(...)` in `app/src/app.js`
- `renderMetadataDisclosure(...)` in `app/src/app.js`
- `renderRiceDefinitionsEditTable(...)` in `app/src/app.js`
- `renderAdfActivityFactorsEditTable(...)` in `app/src/app.js`
- `renderPhaseStatusModelTable(...)` in `app/src/app.js`
- `renderTechnologyMappingMetadataTable(...)` in `app/src/app.js`
- `saveToolMetadataSection(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/admin.html?tab=tool-metadata`
- `/api/programme/rice-definitions`
- `/api/programme/adf-activity-factors`
- `/api/programme/status-reference`
- `/api/programme/technology-mappings`

## Required states

- collapsed
- expanded
- editing
- saving
- saved
- invalid
- locked

## Data contracts

- RICE metric definition
- ADF activity factor
- status reference
- technology mapping

## Styling references

- `app/styles/08-admin-integrations.css`
- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#toolMetadata`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
