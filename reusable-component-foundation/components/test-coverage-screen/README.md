# Test coverage map and quality telemetry

Coverage summary cards, suite inventory, cadence/status table, trigger-suite-area diagram and evidence-backed coverage-area gaps.

Requested coverage: Test coverage screens

## Recommended reusable boundaries

- `CoverageDashboard`
- `CoverageSummary`
- `SuiteTable`
- `CoverageAreaTable`
- `CoverageMap`
- `CoverageNode`
- `GapBadge`

## Current implementation symbols

- `renderTestCoverageDiagram(...)` in `docs/reports/interactive-system-map.html`
- `buildRepoQualityMetrics(...)` in `server/lib/repo-quality-metrics.js`
- `buildTestCoverageAreas(...)` in `server/lib/repo-quality-metrics.js`
- `coverageArea(...)` in `server/lib/repo-quality-metrics.js`
- `testSuite(...)` in `server/lib/repo-quality-metrics.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `docs/reports/interactive-system-map.html#testTelemetry`
- `/api/system-map`

## Required states

- covered
- gap
- available
- passing
- failing
- not run
- manual
- automated

## Data contracts

- test telemetry summary
- test suite
- coverage area
- cadence
- trigger
- evidence path
- gap scope

## Styling references

- `docs/reports/interactive-system-map.html`

## Template data

Use `template-data/template-data.json#testCoverage`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
