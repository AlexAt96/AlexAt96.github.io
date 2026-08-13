# ADF activity step card

Parent capability: ADF pipeline charts, graphs and step explorer
Template type: primitive

## Build this exact template

Show one activity, its action, endpoints, Databricks details and evidence state.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `createAdfPipelineStep(...)` | `app/src/app.js` | 11909-11944 | `code/app--createAdfPipelineStep.reference.js` |
| UI renderer/controller | `renderAdfPipelineStep(...)` | `app/src/app.js` | 12183-12227 | `code/app--renderAdfPipelineStep.reference.js` |
| UI renderer/controller | `renderAdfStepSummaryTable(...)` | `app/src/app.js` | 12310-12330 | `code/app--renderAdfStepSummaryTable.reference.js` |
| UI renderer/controller | `renderAdfStepEndpointBlock(...)` | `app/src/app.js` | 12354-12363 | `code/app--renderAdfStepEndpointBlock.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- Activity
- Lineage
- Level
- Branch lane

## Outputs (events/callbacks)

- Step focus/navigation

## Behaviour to preserve

1. Show one activity, its action, endpoints, Databricks details and evidence state.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Step focus/navigation. Show the state change immediately.
- **Alternate state:** Show one meaningful alternate, empty, warning or disabled state.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- None; build as a foundation template.

## Styling sources

- `app/styles/06-analysis-workflows.css`
- `app/styles/11-system-map-visuals.css`

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
