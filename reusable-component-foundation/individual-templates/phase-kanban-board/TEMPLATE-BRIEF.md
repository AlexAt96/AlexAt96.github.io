# Phase Kanban board

Parent capability: Kanban, list and task cards
Template type: composite

## Build this exact template

Group phase tasks into status columns and coordinate column counts and empty states.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| UI renderer/controller | `renderPhaseSectionList(...)` | `app/src/app.js` | 3381-3394 | `code/app--renderPhaseSectionList.reference.js` |
| UI renderer/controller | `renderPhaseCombinedKanbanBoard(...)` | `app/src/app.js` | 3396-3403 | `code/app--renderPhaseCombinedKanbanBoard.reference.js` |
| UI renderer/controller | `refreshKanbanColumnCounts(...)` | `app/src/app.js` | 35331-35337 | `code/app--refreshKanbanColumnCounts.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- Phase
- Grouped tasks
- BU id
- Owner filter

## Outputs (events/callbacks)

- Rendered board/list
- Task navigation

## Behaviour to preserve

1. Group phase tasks into status columns and coordinate column counts and empty states.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Rendered board/list. Show the state change immediately.
- **Validation or empty:** Demonstrate missing/invalid input with useful inline guidance and no browser-native alert.
- **Read-only or complete:** Demonstrate the completed/locked form of the same component without hiding its context.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- [phase-view-toggle](../phase-view-toggle/TEMPLATE-BRIEF.md)
- [phase-owner-filter](../phase-owner-filter/TEMPLATE-BRIEF.md)
- [kanban-column-and-task-card](../kanban-column-and-task-card/TEMPLATE-BRIEF.md)

## Styling sources

- `app/styles/03-dashboard-planning.css`
- `app/styles/04-phase-documents.css`

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
