# Access confirmation and analysis verification

Collection-team access confirmation, knowledge/repository links, Databricks/Azure flags, analysis-team working/issue tests and save confirmation feedback.

Requested coverage: Access confirmation flow and confirmation feedback

## Recommended reusable boundaries

- `AccessConfirmationForm`
- `AccessFlag`
- `AccessTestControl`
- `AccessSummary`
- `ConfirmationBanner`
- `SaveToast`

## Current implementation symbols

- `renderEnvironmentAccessTask(...)` in `app/src/app.js`
- `renderKnowledgeAccessTask(...)` in `app/src/app.js`
- `renderAnalysisAccessAndReferenceLinks(...)` in `app/src/app.js`
- `renderAnalysisAccessProduct(...)` in `app/src/app.js`
- `getEnvironmentAccessSummary(...)` in `app/src/app.js`
- `getEnvironmentAccessTestSummary(...)` in `app/src/app.js`
- `renderEnvironmentAccessTestControls(...)` in `app/src/app.js`
- `saveCollectionAccessForm(...)` in `app/src/app.js`
- `applyEnvironmentAccessSaveResult(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=bu-data-collection&section=environment-access&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/environment-access`
- `/api/business-units/:businessUnitId/environment-access-test`

## Required states

- not confirmed
- partially confirmed
- confirmed
- analysis untested
- working
- issue
- saving
- saved

## Data contracts

- environment access confirmation
- knowledge repository access
- access test result
- reviewer identity
- confirmation timestamp

## Styling references

- `app/styles/05-collection-workflows.css`
- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#accessConfirmation`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
