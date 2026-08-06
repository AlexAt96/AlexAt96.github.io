# Business-unit sizing and complexity analysis

BU size/complexity scoring, factor controls, calculated bands, ADF contribution, RICE lineage and topology context.

Requested coverage: BU complexity analysis

## Recommended reusable boundaries

- `ComplexityAssessment`
- `FactorControl`
- `NumericMeasure`
- `CalculatedMeasure`
- `BandBadge`
- `ScoreSummary`
- `DefinitionTable`

## Current implementation symbols

- `renderBuSizingComplexity(...)` in `app/src/app.js`
- `renderBuComplexityFactorControl(...)` in `app/src/app.js`
- `renderBuNumericComplexityControl(...)` in `app/src/app.js`
- `renderBuCalculatedComplexityControl(...)` in `app/src/app.js`
- `calculateBuSizeBand(...)` in `app/src/app.js`
- `calculateBuComplexityBand(...)` in `app/src/app.js`
- `getComplexityFactorScore(...)` in `app/src/app.js`
- `getBuSizingAdfBand(...)` in `app/src/app.js`
- `getBuSizingAdfScore(...)` in `app/src/app.js`
- `renderBandDefinitionTable(...)` in `app/src/app.js`
- `getRiceScoreLineageTooltip(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/document.html?phase=team-analysis&section=bu-sizing-complexity-scoring&bu=:businessUnitId`
- `/api/business-units/:businessUnitId/sizing-assessment`

## Required states

- not assessed
- draft
- calculated
- low
- medium
- high
- very high
- saved
- locked

## Data contracts

- sizing assessment
- complexity factor
- factor option
- derived score
- size band
- complexity band
- ADF contribution

## Styling references

- `app/styles/06-analysis-workflows.css`

## Template data

Use `template-data/template-data.json#buComplexity`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
