# Test telemetry data builder

Parent capability: Test coverage map and quality telemetry
Template type: backend

## Build this exact template

Scan scripts, CI and test files into suite status, coverage-area and gap records.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| Test and quality telemetry builder | `buildRepoQualityMetrics(...)` | `server/lib/repo-quality-metrics.js` | 181-215 | `code/repo-quality-metrics--buildRepoQualityMetrics.reference.js` |
| Test and quality telemetry builder | `buildTestCoverageAreas(...)` | `server/lib/repo-quality-metrics.js` | 998-1013 | `code/repo-quality-metrics--buildTestCoverageAreas.reference.js` |
| Test and quality telemetry builder | `testSuite(...)` | `server/lib/repo-quality-metrics.js` | 941-952 | `code/repo-quality-metrics--testSuite.reference.js` |
| Test and quality telemetry builder | `coverageArea(...)` | `server/lib/repo-quality-metrics.js` | 1015-1017 | `code/repo-quality-metrics--coverageArea.reference.js` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- package scripts
- CI configuration
- Tracked test/tool files
- Latest quality evidence

## Outputs (events/callbacks)

- Test telemetry payload

## Behaviour to preserve

1. Scan scripts, CI and test files into suite status, coverage-area and gap records.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Test telemetry payload. Show the state change immediately.
- **Edge case:** Run an invalid, missing-data or boundary input and expose the structured result/error.

## API adapter boundary

- No direct API is required in the reusable component. Use callbacks and local mock data.

## Dependencies

- None; build as a foundation template.

## Styling sources

- `docs/reports/interactive-system-map.html`

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
