# Metadata disclosure editor

Parent capability: Tool metadata setup
Template type: composite

## Build this exact template

Wrap one metadata editor in a collapsible section with status, description and save controls.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `renderMetadataDisclosure(...)` | `app/src/app.js` | 7714-7741 | `code/app--renderMetadataDisclosure.reference.js` |
| UI renderer/controller | `saveToolMetadataSection(...)` | `app/src/app.js` | 35417-35435 | `code/app--saveToolMetadataSection.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- section key
- title
- summary
- metadata
- status
- editor content
- save label

## Outputs (events/callbacks)

- Save request
- Saved/error status

## Behaviour to preserve

1. Wrap one metadata editor in a collapsible section with status, description and save controls.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Save request. Show the state change immediately.
- **Validation or empty:** Demonstrate missing/invalid input with useful inline guidance and no browser-native alert.
- **Read-only or complete:** Demonstrate the completed/locked form of the same component without hiding its context.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- None; build as a foundation template.

## Styling sources

- `app/styles/08-admin-integrations.css`
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
