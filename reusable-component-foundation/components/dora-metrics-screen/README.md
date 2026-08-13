# DORA metrics dashboard

Five-metric DORA dashboard with true/proxy/missing status, confidence, low-medium-high gauges, supporting statistics and explicit production-data contracts.

Requested coverage: DORA metrics

## Recommended reusable boundaries

- `DoraDashboard`
- `MetricCard`
- `MetricGauge`
- `MetricStatus`
- `SupportingStats`
- `DataContractTable`
- `MissingDataNotice`

## Current implementation symbols

- `normaliseDoraMetrics(...)` in `docs/reports/interactive-system-map.html`
- `renderDoraMetricsReport(...)` in `docs/reports/interactive-system-map.html`
- `renderDoraMetricCard(...)` in `docs/reports/interactive-system-map.html`
- `doraGaugeModel(...)` in `docs/reports/interactive-system-map.html`
- `renderDoraStatTable(...)` in `docs/reports/interactive-system-map.html`
- `doraMetricBoundaryDefaults(...)` in `docs/reports/interactive-system-map.html`
- `doraBandForMetric(...)` in `docs/reports/interactive-system-map.html`
- `doraMissingDataSummary(...)` in `docs/reports/interactive-system-map.html`
- `buildDoraMetrics(...)` in `server/lib/dora-metrics.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `docs/reports/interactive-system-map.html#doraMetrics`
- `/api/system-map`

## Required states

- true metric
- proxy
- missing data
- good
- watch
- risk
- low confidence
- high confidence

## Data contracts

- DORA metric
- dashboard gauge
- deployment event
- change event
- incident event
- service scope
- missing-data contract

## Styling references

- `docs/reports/interactive-system-map.html`

## Template data

Use `template-data/template-data.json#doraMetrics`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
