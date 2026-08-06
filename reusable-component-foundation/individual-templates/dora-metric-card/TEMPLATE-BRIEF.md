# DORA metric card and gauge

Parent capability: DORA metrics dashboard
Template type: primitive

## Build this exact template

Show one DORA value, true/proxy/missing status, confidence and low-medium-high gauge.

The result must be a standalone interactive component demo like the Architecture Upload Wizard reference: safe mock data, preserved behaviour, clearer presentation where helpful, technical details and downloadable code.

## Code that drives this component

| Role | Function | Source | Original lines | Focused extract |
| --- | --- | --- | ---: | --- |
| System Map UI renderer | `renderDoraMetricCard(...)` | `docs/reports/interactive-system-map.html` | 8152-8171 | `code/interactive-system-map--renderDoraMetricCard.reference.html` |
| System Map UI renderer | `doraGaugeModel(...)` | `docs/reports/interactive-system-map.html` | 8173-8191 | `code/interactive-system-map--doraGaugeModel.reference.html` |
| System Map UI renderer | `doraMetricBoundaryDefaults(...)` | `docs/reports/interactive-system-map.html` | 8220-8246 | `code/interactive-system-map--doraMetricBoundaryDefaults.reference.html` |
| System Map UI renderer | `doraBandForMetric(...)` | `docs/reports/interactive-system-map.html` | 8248-8255 | `code/interactive-system-map--doraBandForMetric.reference.html` |

Start with those focused extracts. Use the full source snapshot only for helpers they call.

## Inputs (props/template controls)

- DORA metric definition/result

## Outputs (events/callbacks)

- Metric card
- Gauge position/band/tone

## Behaviour to preserve

1. Show one DORA value, true/proxy/missing status, confidence and low-medium-high gauge.
2. Render explicit empty, populated and read-only states.
3. Expose app/server interaction through callbacks or adapters rather than global state.

## Interactive demo scenarios

- **Default populated:** Render the supplied mock data and show the normal ready state.
- **Primary interaction:** Exercise the main output: Metric card. Show the state change immediately.
- **Alternate state:** Show one meaningful alternate, empty, warning or disabled state.

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
