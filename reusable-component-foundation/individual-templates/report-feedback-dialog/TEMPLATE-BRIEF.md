# Report feedback dialog

Parent capability: Document review and feedback loop
Template type: composite

## Build this exact template

Collect a section-specific review comment and send it back to the report author.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `openBuOutputFeedbackDialog(...)` | `app/src/app.js` | 32721-32787 | `code/app--openBuOutputFeedbackDialog.reference.js` |
| UI renderer/controller | `sendBuTechReportSectionFeedback(...)` | `app/src/app.js` | 37161-37197 | `code/app--sendBuTechReportSectionFeedback.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- BU id
- Document key
- Section definition

## Outputs (events/callbacks)

- Feedback comment
- Request-changes event
- Saved/error status

## Behaviour to preserve

1. Collect a section-specific review comment and send it back to the report author.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Feedback comment. Show the state change immediately.
- **Validation or empty:** Demonstrate missing/invalid input with useful inline guidance and no browser-native alert.
- **Read-only or complete:** Demonstrate the completed/locked form of the same component without hiding its context.

## API adapter boundary

- `PUT /api/business-units/:businessUnitId/bu-tech-report`

## Dependencies

- None; build as a foundation template.

## Styling sources

- `app/styles/04-phase-documents.css`
- `app/styles/07-outputs-decision.css`

## Safe mock data

Use `template-data.json` in this folder. It is copied from the relevant synthetic capability data and must be enough to run the demo offline.

## Allowed improvements

- Improve spacing, visual hierarchy, responsive layout, labels and progressive disclosure.
- Adapt the presentation to the Component Library design tokens.
- Add clearer progress, count, status and confirmation feedback.
- Split the implementation into smaller internal primitives when useful.

## Do not change

- Do not remove behaviours, states, fields, validation, feedback or navigation represented by the drivers.
- Do not make controls decorative or inert; the demo must actually respond.
- Do not copy global workspace, query-string, localStorage or fetch calls into the reusable view layer.
- Do not use real customer data, credentials or uploaded files.

## Done when

- The template is individually discoverable in the component library.
- The default mock-data demo works without the Migration Compass server.
- All listed demo scenarios are selectable or easy to reproduce.
- Inputs and outputs are typed/documented.
- Technical details and downloadable code are available.
- Interaction and accessibility tests cover the primary flow.
