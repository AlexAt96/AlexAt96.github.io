# Rationalisation import controller

Parent capability: Environment rationalisation and proposed topology
Template type: controller

## Build this exact template

Parse spreadsheet rows, map them into rationalisation records and refresh every diagram.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `parseEnvironmentRationalisationImportFile(...)` | `app/src/app.js` | 40573-40575 | `code/app--parseEnvironmentRationalisationImportFile.reference.js` |
| UI renderer/controller | `applyEnvironmentRationalisationImportRows(...)` | `app/src/app.js` | 36850-36873 | `code/app--applyEnvironmentRationalisationImportRows.reference.js` |
| UI renderer/controller | `refreshProposedTopologyDiagrams(...)` | `app/src/app.js` | 36905-36910 | `code/app--refreshProposedTopologyDiagrams.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- Uploaded spreadsheet
- Current form

## Outputs (events/callbacks)

- Mapped rows
- Validation errors
- Diagram refresh

## Behaviour to preserve

1. Parse spreadsheet rows, map them into rationalisation records and refresh every diagram.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Mapped rows. Show the state change immediately.
- **Edge case:** Run an invalid, missing-data or boundary input and expose the structured result/error.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- None; build as a foundation template.

## Styling sources

- `app/styles/06-analysis-workflows.css`

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
