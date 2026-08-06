# ADF pipeline charts, graphs and step explorer

ADF complexity charts plus pipeline selectors, dependency ordering, activity lanes, detailed step maps and source-to-Databricks lineage.

Requested coverage: ADF pipeline chart and graphs

## Recommended reusable boundaries

- `PipelineSelector`
- `PipelineStory`
- `PipelineLane`
- `ActivityNode`
- `StepDetails`
- `EndpointBlock`
- `ComplexityChart`

## Current implementation symbols

- `getAdfPipelineStepFlows(...)` in `app/src/app.js`
- `orderAdfPipelineActivities(...)` in `app/src/app.js`
- `getAdfActivityDependencyLevels(...)` in `app/src/app.js`
- `createAdfPipelineStep(...)` in `app/src/app.js`
- `renderAdfPipelineStepExplorer(...)` in `app/src/app.js`
- `renderAdfPipelineSelector(...)` in `app/src/app.js`
- `renderAdfPipelineStory(...)` in `app/src/app.js`
- `renderAdfPipelineStep(...)` in `app/src/app.js`
- `renderAdfPipelineLaneSvg(...)` in `app/src/app.js`
- `renderAdfStepDetailBranchMap(...)` in `app/src/app.js`
- `buildAdfPipelineTouchpointGraph(...)` in `app/src/app.js`
- `renderAdfPipelineTouchpointSvg(...)` in `app/src/app.js`
- `renderBuAdfComplexityCharts(...)` in `app/src/app.js`

The matching reference functions are copied into `code/`. They are extraction references from the current monolith, not drop-in modules: preserve their behaviour and data semantics while replacing global state and DOM coupling with explicit props, events and adapters.

## Routes and API surfaces

- `app/adf-lineage-explorer.html`
- `app/document.html?phase=team-analysis&section=adf-complexity-analysis&bu=:businessUnitId`

## Required states

- no pipeline
- pipeline selected
- step selected
- branching
- fan-in
- Databricks activity
- missing endpoint evidence

## Data contracts

- pipeline
- activity
- dependency
- dataset
- linked service
- copy flow
- Databricks notebook/job
- complexity summary

## Styling references

- `app/styles/06-analysis-workflows.css`
- `app/styles/11-system-map-visuals.css`

## Template data

Use `template-data/template-data.json#adfPipeline`.

## Extraction acceptance criteria

- No dependency on the original page-level global workspace object.
- Inputs, callbacks, permissions and loading/error states are explicit.
- Empty, partial, complete, validation and read-only states remain available.
- Keyboard operation, focus management, labels and reduced-motion behaviour are retained.
- Rendering logic is separated from API/storage adapters.
- Template data can render the component without the original application server.
