# Kanban, list and task cards

Role-grouped phase work rendered as toggled Kanban or list views with owner filtering, status columns and movable task cards.

Requested coverage: Kanban and list, including cards

## Recommended reusable boundaries

- `ViewToggle`
- `OwnerFilter`
- `KanbanBoard`
- `KanbanColumn`
- `TaskCard`
- `TaskList`
- `EmptyColumn`

## Current implementation symbols

- `renderPhaseDashboardViewToggle(...)` in `app/src/app.js`
- `renderPhaseDashboardOwnerFilter(...)` in `app/src/app.js`
- `renderPhaseSectionList(...)` in `app/src/app.js`
- `renderPhaseCombinedKanbanBoard(...)` in `app/src/app.js`
- `renderContributorKanbanColumn(...)` in `app/src/app.js`
- `getSectionKanbanStatus(...)` in `app/src/app.js`
- `setPhaseDashboardView(...)` in `app/src/app.js`
- `moveKanbanCardToStatusColumn(...)` in `app/src/app.js`
- `refreshKanbanColumnCounts(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/phase.html?phase=initiation`
- `app/phase.html?phase=team-analysis&bu=:businessUnitId`

## Required states

- not started
- draft
- in progress
- in review
- blocked
- completed
- filtered
- empty column

## Data contracts

- task card
- status column
- owner group
- phase
- business-unit context

## Styling references

- `app/styles/03-dashboard-planning.css`
- `app/styles/04-phase-documents.css`

## Template data

Use `template-data/template-data.json#kanban`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
