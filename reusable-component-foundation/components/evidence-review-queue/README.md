# Evidence review queue

Review queue spanning uploaded versions and app-created artifacts, with filters, reviewer notes, follow-up questions, BU answers and confidence/status handling.

Requested coverage: Evidence review queue

## Recommended reusable boundaries

- `ReviewQueue`
- `ReviewFilters`
- `ReviewRow`
- `ReviewStatus`
- `ReviewDialog`
- `FollowUpSummary`
- `EvidenceLink`

## Current implementation symbols

- `renderEvidenceReview(...)` in `app/src/app.js`
- `renderEvidenceReviewRow(...)` in `app/src/app.js`
- `renderEvidenceReviewFollowUpSummary(...)` in `app/src/app.js`
- `renderEvidenceReviewBuAnswer(...)` in `app/src/app.js`
- `renderEvidenceReviewModal(...)` in `app/src/app.js`
- `getEvidenceReviewDocumentsForBu(...)` in `app/src/app.js`
- `getEvidenceReviewAppArtifactsForBu(...)` in `app/src/app.js`
- `createEvidenceReviewArtifact(...)` in `app/src/app.js`
- `normaliseEvidenceReviewState(...)` in `app/src/app.js`
- `wireEvidenceReviewActions(...)` in `app/src/app.js`
- `validateEvidenceReviewModalForm(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=team-analysis&section=evidence-review&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/evidence-review`

## Required states

- not reviewed
- in review
- accepted
- question raised
- more info needed
- further investigation
- confirmed
- rejected

## Data contracts

- review artifact
- upload version
- review status
- confidence
- review notes
- follow-up question
- BU answer
- environment tags

## Styling references

- `app/styles/06-analysis-workflows.css`
- `app/styles/05-collection-workflows.css`

## Template data

Use `template-data/template-data.json#evidenceReviewQueue`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
