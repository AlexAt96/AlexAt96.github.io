# Graphs and chart primitives

Reusable SVG/CSS line, bar, pie, distribution, waterfall and KPI visual patterns used across dashboards, reports and decisions.

Requested coverage: Graphs and charts

## Recommended reusable boundaries

- `LineChart`
- `BarChart`
- `PieChart`
- `DistributionChart`
- `WaterfallChart`
- `ChartLegend`
- `EmptyChart`

## Current implementation symbols

- `renderDiscoveryLineChart(...)` in `app/src/app.js`
- `renderReportPieVisual(...)` in `app/src/app.js`
- `renderReportPieSlice(...)` in `app/src/app.js`
- `renderReportBarVisual(...)` in `app/src/app.js`
- `renderMetadataBarChart(...)` in `app/src/app.js`
- `renderAdvancedDiscoveryPieChart(...)` in `app/src/app.js`
- `renderAdvancedDiscoveryDistributionChart(...)` in `app/src/app.js`
- `renderCostBuComparisonChart(...)` in `app/src/app.js`
- `renderCostBridgeChart(...)` in `app/src/app.js`
- `renderDecisionSavingsChartSvg(...)` in `app/src/app.js`
- `renderDecisionWaterfallChart(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/index.html`
- `app/document.html`
- `app/decision.html`

## Required states

- populated
- empty
- single series
- multi-series
- positive
- warning
- negative

## Data contracts

- label/value rows
- time series
- stacked series
- waterfall steps
- chart legend

## Styling references

- `app/styles/03-dashboard-planning.css`
- `app/styles/06-analysis-workflows.css`
- `app/styles/07-outputs-decision.css`

## Template data

Use `template-data/template-data.json#charts`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
