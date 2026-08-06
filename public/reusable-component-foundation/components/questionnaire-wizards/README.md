# Questionnaire and multi-step wizard patterns

Accessible multi-step modal wizards for product questionnaires, script outputs, Terraform metadata and multi-document uploads.

Requested coverage: Questionnaire wizards

## Recommended reusable boundaries

- `Wizard`
- `WizardStep`
- `QuestionField`
- `WizardProgress`
- `WizardNavigation`
- `AnswerReview`
- `SubmissionConfirmation`

## Current implementation symbols

- `renderWizard(...)` in `app/src/app.js`
- `renderQuestionnaireResponse(...)` in `app/src/app.js`
- `renderQuestionnaireAnswerWizard(...)` in `app/src/app.js`
- `renderQuestionnaireAnswersModal(...)` in `app/src/app.js`
- `wireQuestionnaireAnswerWizard(...)` in `app/src/app.js`
- `saveQuestionnaireAnswers(...)` in `app/src/app.js`
- `renderTerraformExporterWizard(...)` in `app/src/app.js`
- `renderScriptOutputWizard(...)` in `app/src/app.js`
- `renderMultiDocumentUploadWizard(...)` in `app/src/app.js`
- `openAccessibleModal(...)` in `app/src/app.js`
- `closeAccessibleModal(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=bu-data-collection&section=questionnaire-response&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/questionnaire/products`
- `/api/business-units/:businessUnitId/questionnaire/responses`

## Required states

- closed
- step active
- step complete
- validation error
- draft saved
- submitted
- read-only answers

## Data contracts

- wizard definition
- step
- question
- answer
- product context
- submission status

## Styling references

- `app/styles/05-collection-workflows.css`
- `app/styles/01-foundation.css`

## Template data

Use `template-data/template-data.json#questionnaire`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
