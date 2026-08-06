# Generic wizard shell

Parent capability: Questionnaire and multi-step wizard patterns
Template type: primitive

## Build this exact template

Provide an accessible modal shell, progress steps, navigation controls and submit action.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `renderWizard(...)` | `app/src/app.js` | 9379-9417 | `code/app--renderWizard.reference.js` |
| UI renderer/controller | `openAccessibleModal(...)` | `app/src/app.js` | 38676-38719 | `code/app--openAccessibleModal.reference.js` |
| UI renderer/controller | `closeAccessibleModal(...)` | `app/src/app.js` | 38721-38729 | `code/app--closeAccessibleModal.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- Wizard id
- Title
- Description
- Steps
- Hidden fields
- Submit label

## Outputs (events/callbacks)

- Back/next/submit/close events

## Behaviour to preserve

1. Provide an accessible modal shell, progress steps, navigation controls and submit action.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Back/next/submit/close events. Show the state change immediately.
- **Alternate state:** Show one meaningful alternate, empty, warning or disabled state.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- None; build as a foundation template.

## Styling sources

- `app/styles/05-collection-workflows.css`
- `app/styles/01-foundation.css`

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
