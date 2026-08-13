# Decision screen and scenario layout

Executive recommendation, scenario configuration, savings progression/waterfall charts, sequencing, accounting overview, options table and artifact hub.

Requested coverage: Decision screen and layout

## Recommended reusable boundaries

- `DecisionPage`
- `RecommendationPanel`
- `ScenarioConfigurator`
- `SavingsChart`
- `WaterfallChart`
- `SequencingTable`
- `OptionsTable`
- `ArtifactHub`

## Current implementation symbols

- `renderDecisionPage(...)` in `app/src/app.js`
- `renderDecisionCgiRecommendationPanel(...)` in `app/src/app.js`
- `renderDecisionExecutiveSummary(...)` in `app/src/app.js`
- `renderDecisionScenarioConfigurator(...)` in `app/src/app.js`
- `getDecisionScenarioSummary(...)` in `app/src/app.js`
- `renderDecisionPrimaryChart(...)` in `app/src/app.js`
- `renderDecisionSavingsChartSvg(...)` in `app/src/app.js`
- `renderDecisionWaterfallChart(...)` in `app/src/app.js`
- `renderDecisionRiceSequencingPanel(...)` in `app/src/app.js`
- `renderDecisionAccountingOverview(...)` in `app/src/app.js`
- `renderDecisionSavingsSummaryTable(...)` in `app/src/app.js`
- `renderDecisionTableSection(...)` in `app/src/app.js`
- `renderDecisionArtifactHub(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/decision.html`
- `/api/programme/open-decisions`
- `app/document.html?phase=decision`

## Required states

- baseline
- scenario changed
- unsaved scenario
- recommended
- conditional
- not recommended
- decision ready
- blocked

## Data contracts

- BU decision model
- scenario action
- savings point
- waterfall contribution
- RICE sequence
- recommendation
- artifact link

## Styling references

- `app/styles/07-outputs-decision.css`

## Template data

Use `template-data/template-data.json#decision`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
