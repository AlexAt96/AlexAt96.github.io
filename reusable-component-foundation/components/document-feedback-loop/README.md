# Document review and feedback loop

Document comments, programme and BU feedback, return-to-author tasks, completion acknowledgement and app-native confirmation/toast behaviour.

Requested coverage: Document feedback loop

## Recommended reusable boundaries

- `FeedbackBanner`
- `FeedbackThread`
- `FeedbackItem`
- `FeedbackComposer`
- `ResolveAction`
- `FeedbackBadge`

## Current implementation symbols

- `renderDocumentFeedbackSection(...)` in `app/src/app.js`
- `renderPhaseFeedbackSection(...)` in `app/src/app.js`
- `renderFeedbackSection(...)` in `app/src/app.js`
- `renderFeedbackItem(...)` in `app/src/app.js`
- `renderBuOutputDocumentFeedbackBanner(...)` in `app/src/app.js`
- `getOpenTaskFeedback(...)` in `app/src/app.js`
- `getOpenFeedbackItemsForPhase(...)` in `app/src/app.js`
- `buildFeedbackItemFromScreen(...)` in `app/src/app.js`
- `openBuOutputFeedbackDialog(...)` in `app/src/app.js`
- `wireBuOutputFeedbackDoneActions(...)` in `app/src/app.js`
- `sendBuTechReportSectionFeedback(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html`
- `/api/programme/screens/:sectionKey/report-commentary`
- `/api/business-units/:businessUnitId/bu-tech-report`

## Required states

- no feedback
- open feedback
- changes requested
- author response
- resolved
- reopened

## Data contracts

- feedback item
- document key
- section key
- comment
- author
- reviewer
- status
- timestamps

## Styling references

- `app/styles/04-phase-documents.css`
- `app/styles/07-outputs-decision.css`

## Template data

Use `template-data/template-data.json#documentFeedback`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
