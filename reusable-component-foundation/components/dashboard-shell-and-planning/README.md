# Dashboard shell, KPI cards and planning

Programme dashboard with KPI cards, phase health, work queues, tabs, planning rows, Gantt-style bars and persisted plan settings.

Requested coverage: Dashboard

## Recommended reusable boundaries

- `DashboardShell`
- `KpiCard`
- `PhaseHealthSummary`
- `PlanningGrid`
- `GanttBar`
- `PlanSettingsForm`

## Current implementation symbols

- `renderDashboard(...)` in `app/src/app.js`
- `renderDashboardTabs(...)` in `app/src/app.js`
- `renderDashboardStatisticsTab(...)` in `app/src/app.js`
- `renderDiscoveryKpiCard(...)` in `app/src/app.js`
- `renderDiscoveryLineChart(...)` in `app/src/app.js`
- `renderDashboardPlanTab(...)` in `app/src/app.js`
- `renderDashboardPlanRow(...)` in `app/src/app.js`
- `renderDashboardPlanBar(...)` in `app/src/app.js`
- `getDashboardPlanModel(...)` in `app/src/app.js`
- `persistDashboardPlanSettings(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/index.html`
- `/api/workspace`
- `/api/programme/screens/project-plan-setup`

## Required states

- loading
- empty
- healthy
- at-risk
- blocked
- draft plan
- saved plan
- undo available

## Data contracts

- dashboard KPI model
- phase instances
- work items
- project plan settings
- Gantt dependencies

## Styling references

- `app/styles/03-dashboard-planning.css`
- `app/styles/01-foundation.css`

## Template data

Use `template-data/template-data.json#dashboard`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
