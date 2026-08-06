# Environment evidence matrix

Per-environment evidence coverage, required/optional inputs, status icons, progress calculations and links to missing collection tasks.

Requested coverage: Environment evidence matrix

## Recommended reusable boundaries

- `EvidenceMatrix`
- `EnvironmentColumn`
- `EvidenceGroup`
- `EvidenceCell`
- `StatusIcon`
- `ProgressBar`
- `MissingEvidenceLink`

## Current implementation symbols

- `renderCollectionDashboard(...)` in `app/src/app.js`
- `renderCollectionEvidenceMatrix(...)` in `app/src/app.js`
- `getCollectionProductEvidenceProgress(...)` in `app/src/app.js`
- `getCollectionProductsEvidenceProgress(...)` in `app/src/app.js`
- `renderCollectionEvidenceProgressBar(...)` in `app/src/app.js`
- `getCollectionEvidenceGroups(...)` in `app/src/app.js`
- `getEvidenceGroupStatus(...)` in `app/src/app.js`
- `renderEvidenceStatusIcon(...)` in `app/src/app.js`
- `renderEnvironmentTaskList(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/phase.html?phase=bu-data-collection&bu=:businessUnitId`
- `app/document.html?phase=bu-data-collection&section=environment-task-list&bu=:businessUnitId`

## Required states

- missing
- required
- optional
- partial
- submitted
- reviewed
- not applicable

## Data contracts

- environment
- evidence group
- evidence item
- requirement rule
- status
- source link
- progress

## Styling references

- `app/styles/05-collection-workflows.css`

## Template data

Use `template-data/template-data.json#environmentEvidenceMatrix`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
