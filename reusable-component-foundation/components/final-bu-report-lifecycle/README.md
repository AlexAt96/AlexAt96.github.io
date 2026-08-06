# Final BU report review, finalise, read and feedback states

Section-by-section report drafting, source/task links, review controls, client-readable output, completion/approval, export and feedback loops.

Requested coverage: Final BU report: finalise/review plus complete read/feedback state

## Recommended reusable boundaries

- `ReportEditor`
- `ReportSectionEditor`
- `SourceTaskLink`
- `ReviewNavigator`
- `FinaliseAction`
- `ClientReport`
- `ReportFeedback`
- `ApprovalBanner`

## Current implementation symbols

- `renderBuTechReportInput(...)` in `app/src/app.js`
- `getBuTechReportModel(...)` in `app/src/app.js`
- `renderBuTechReportInputSection(...)` in `app/src/app.js`
- `renderBuTechReportSummaryTable(...)` in `app/src/app.js`
- `renderBuTechReportEvidenceLinks(...)` in `app/src/app.js`
- `renderBuTechReport(...)` in `app/src/app.js`
- `renderBuTechReportTabs(...)` in `app/src/app.js`
- `renderBuTechReportClientReport(...)` in `app/src/app.js`
- `renderBuTechReportClientSection(...)` in `app/src/app.js`
- `renderBuOutputDocumentFeedbackBanner(...)` in `app/src/app.js`
- `wireBuTechReportActions(...)` in `app/src/app.js`
- `sendBuTechReportSectionFeedback(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=team-analysis&section=bu-tech-report-input&bu=:businessUnitId`
- `app/document.html?phase=outputs&section=bu-tech-report&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/bu-tech-report`
- `/api/business-units/:businessUnitId/outputs/approve`

## Required states

- draft
- review
- changes requested
- ready to finalise
- finalised
- complete read-only
- feedback open
- feedback resolved
- approved

## Data contracts

- report section
- saved narrative
- source task
- review control
- feedback
- approval
- client report
- export metadata

## Styling references

- `app/styles/07-outputs-decision.css`
- `app/styles/04-phase-documents.css`

## Template data

Use `template-data/template-data.json#finalBuReport`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
