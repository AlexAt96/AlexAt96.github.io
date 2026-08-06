# Template Build Order

Build primitives and state/data adapters before the screens that compose them. Dependencies in each brief are the authoritative local order.

## 1. Foundation primitives

- [Dashboard tab bar](individual-templates/dashboard-tab-bar/TEMPLATE-BRIEF.md)
- [Dashboard KPI card](individual-templates/dashboard-kpi-card/TEMPLATE-BRIEF.md)
- [Dashboard line chart](individual-templates/dashboard-line-chart/TEMPLATE-BRIEF.md) — depends on `chart-empty-state`
- [Report pie chart](individual-templates/report-pie-chart/TEMPLATE-BRIEF.md)
- [Report bar chart](individual-templates/report-bar-chart/TEMPLATE-BRIEF.md)
- [Metadata bar chart](individual-templates/metadata-bar-chart/TEMPLATE-BRIEF.md)
- [Advanced-discovery pie chart](individual-templates/advanced-discovery-pie-chart/TEMPLATE-BRIEF.md)
- [Advanced-discovery distribution chart](individual-templates/advanced-discovery-distribution-chart/TEMPLATE-BRIEF.md)
- [Chart empty state](individual-templates/chart-empty-state/TEMPLATE-BRIEF.md)
- [Diagram toolbar](individual-templates/diagram-toolbar/TEMPLATE-BRIEF.md)
- [Kanban/list view toggle](individual-templates/phase-view-toggle/TEMPLATE-BRIEF.md)
- [Phase owner filter](individual-templates/phase-owner-filter/TEMPLATE-BRIEF.md)
- [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md)
- [Compact read-only table](individual-templates/compact-readonly-table/TEMPLATE-BRIEF.md)
- [Access test and confirmation control](individual-templates/access-test-control/TEMPLATE-BRIEF.md)
- [Feedback item card](individual-templates/feedback-item-card/TEMPLATE-BRIEF.md)
- [Generic wizard shell](individual-templates/wizard-shell/TEMPLATE-BRIEF.md)
- [ADF pipeline selector](individual-templates/adf-pipeline-selector/TEMPLATE-BRIEF.md)
- [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md)
- [Complexity factor control](individual-templates/complexity-factor-control/TEMPLATE-BRIEF.md)
- [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md)
- [Complexity band definition table](individual-templates/complexity-band-table/TEMPLATE-BRIEF.md)
- [Evidence progress bar](individual-templates/evidence-progress-bar/TEMPLATE-BRIEF.md)
- [Evidence status icon](individual-templates/evidence-status-icon/TEMPLATE-BRIEF.md)
- [Evidence follow-up summary](individual-templates/evidence-follow-up-summary/TEMPLATE-BRIEF.md)
- [BU report state tabs](individual-templates/bu-report-tabs/TEMPLATE-BRIEF.md)
- [Lineage caveat panel](individual-templates/lineage-caveat-panel/TEMPLATE-BRIEF.md)
- [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md)
- [DORA supporting-stat table](individual-templates/dora-supporting-stat-table/TEMPLATE-BRIEF.md)

## 2. Interaction controllers

- [Rationalisation import controller](individual-templates/rationalisation-import-controller/TEMPLATE-BRIEF.md)

## 3. Data-model builders

- [DORA metric data builder](individual-templates/dora-metric-builder/TEMPLATE-BRIEF.md)
- [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md)

## 4. Composed components

- [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md)
- [External-location dependency map](individual-templates/external-location-dependency-map/TEMPLATE-BRIEF.md) — depends on `diagram-toolbar`
- [Source/consumer dependency map](individual-templates/source-consumer-dependency-map/TEMPLATE-BRIEF.md) — depends on `diagram-toolbar`
- [Programme topology diagram](individual-templates/programme-topology-diagram/TEMPLATE-BRIEF.md)
- [Phase Kanban board](individual-templates/phase-kanban-board/TEMPLATE-BRIEF.md) — depends on `phase-view-toggle`, `phase-owner-filter`, `kanban-column-and-task-card`
- [Editable data table](individual-templates/editable-data-table/TEMPLATE-BRIEF.md)
- [Excel import/export panel](individual-templates/excel-import-export-panel/TEMPLATE-BRIEF.md)
- [Input traceability table](individual-templates/input-traceability-table/TEMPLATE-BRIEF.md)
- [Metadata results table](individual-templates/metadata-results-table/TEMPLATE-BRIEF.md)
- [Metadata disclosure editor](individual-templates/metadata-disclosure-editor/TEMPLATE-BRIEF.md)
- [RICE definition table](individual-templates/rice-definition-table/TEMPLATE-BRIEF.md)
- [ADF activity-factor table](individual-templates/adf-factor-table/TEMPLATE-BRIEF.md)
- [Workflow status-model table](individual-templates/status-model-table/TEMPLATE-BRIEF.md)
- [Technology-mapping metadata table](individual-templates/technology-mapping-table/TEMPLATE-BRIEF.md)
- [Environment access confirmation form](individual-templates/environment-access-form/TEMPLATE-BRIEF.md)
- [Knowledge/repository access form](individual-templates/knowledge-access-form/TEMPLATE-BRIEF.md)
- [Analysis access summary](individual-templates/analysis-access-summary/TEMPLATE-BRIEF.md) — depends on `access-test-control`
- [Document feedback panel](individual-templates/document-feedback-panel/TEMPLATE-BRIEF.md) — depends on `feedback-item-card`
- [Report feedback banner](individual-templates/report-feedback-banner/TEMPLATE-BRIEF.md)
- [Report feedback dialog](individual-templates/report-feedback-dialog/TEMPLATE-BRIEF.md)
- [Questionnaire answer wizard](individual-templates/questionnaire-answer-wizard/TEMPLATE-BRIEF.md) — depends on `wizard-shell`
- [Questionnaire answer review](individual-templates/questionnaire-answer-review/TEMPLATE-BRIEF.md) — depends on `wizard-shell`
- [Script-output upload wizard](individual-templates/script-output-wizard/TEMPLATE-BRIEF.md) — depends on `wizard-shell`
- [Multi-document upload wizard](individual-templates/multi-document-upload-wizard/TEMPLATE-BRIEF.md) — depends on `wizard-shell`
- [Metadata summary cards](individual-templates/metadata-summary-cards/TEMPLATE-BRIEF.md)
- [Metadata category overview](individual-templates/metadata-category-overview/TEMPLATE-BRIEF.md) — depends on `metadata-bar-chart`
- [Inventory resource table](individual-templates/inventory-resource-table/TEMPLATE-BRIEF.md)
- [Unity Catalog binding table](individual-templates/unity-catalog-binding-table/TEMPLATE-BRIEF.md)
- [ADF complexity charts](individual-templates/adf-complexity-charts/TEMPLATE-BRIEF.md)
- [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) — depends on `adf-activity-step-card`
- [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) — depends on `adf-activity-step-card`
- [ADF touchpoint graph](individual-templates/adf-touchpoint-graph/TEMPLATE-BRIEF.md)
- [Proposed topology table](individual-templates/proposed-topology-table/TEMPLATE-BRIEF.md)
- [Proposed topology flow diagram](individual-templates/topology-flow-diagram/TEMPLATE-BRIEF.md)
- [Proposed topology structure diagram](individual-templates/topology-structure-diagram/TEMPLATE-BRIEF.md)
- [Environment evidence matrix](individual-templates/environment-evidence-matrix/TEMPLATE-BRIEF.md) — depends on `evidence-progress-bar`, `evidence-status-icon`
- [Environment evidence task list](individual-templates/environment-evidence-task-list/TEMPLATE-BRIEF.md) — depends on `evidence-status-icon`
- [Evidence review row](individual-templates/evidence-review-row/TEMPLATE-BRIEF.md)
- [Evidence review modal](individual-templates/evidence-review-modal/TEMPLATE-BRIEF.md)
- [BU report section editor](individual-templates/bu-report-section-editor/TEMPLATE-BRIEF.md)
- [BU report summary table](individual-templates/bu-report-summary-table/TEMPLATE-BRIEF.md)
- [Decision recommendation panel](individual-templates/decision-recommendation-panel/TEMPLATE-BRIEF.md)
- [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md)
- [Decision savings progression chart](individual-templates/decision-savings-chart/TEMPLATE-BRIEF.md)
- [Decision waterfall chart](individual-templates/decision-waterfall-chart/TEMPLATE-BRIEF.md)
- [Decision RICE sequencing](individual-templates/decision-rice-sequencing/TEMPLATE-BRIEF.md)
- [Decision accounting overview](individual-templates/decision-accounting-overview/TEMPLATE-BRIEF.md)
- [Decision artifact hub](individual-templates/decision-artifact-hub/TEMPLATE-BRIEF.md)
- [ADF lineage touchpoint map](individual-templates/adf-lineage-touchpoint-map/TEMPLATE-BRIEF.md)
- [ADF full lineage map](individual-templates/adf-lineage-map/TEMPLATE-BRIEF.md)
- [Test coverage map](individual-templates/test-coverage-map/TEMPLATE-BRIEF.md)

## 5. Full screen templates

- [Dashboard page](individual-templates/dashboard-page/TEMPLATE-BRIEF.md) — depends on `dashboard-tab-bar`, `dashboard-kpi-card`, `dashboard-line-chart`, `project-plan-gantt`
- [Tool metadata setup page](individual-templates/tool-metadata-setup-page/TEMPLATE-BRIEF.md) — depends on `metadata-disclosure-editor`, `rice-definition-table`, `adf-factor-table`, `status-model-table`, `technology-mapping-table`
- [Metadata results page](individual-templates/metadata-results-page/TEMPLATE-BRIEF.md) — depends on `metadata-summary-cards`, `metadata-category-overview`, `inventory-resource-table`, `unity-catalog-binding-table`
- [ADF complexity page](individual-templates/adf-complexity-page/TEMPLATE-BRIEF.md) — depends on `adf-complexity-charts`, `adf-pipeline-selector`, `adf-pipeline-story`
- [BU sizing and complexity page](individual-templates/bu-complexity-page/TEMPLATE-BRIEF.md) — depends on `complexity-factor-control`, `complexity-score-control`, `complexity-band-table`
- [Environment rationalisation page](individual-templates/environment-rationalisation-page/TEMPLATE-BRIEF.md) — depends on `proposed-topology-table`, `topology-flow-diagram`, `topology-structure-diagram`, `rationalisation-import-controller`
- [Evidence review page](individual-templates/evidence-review-page/TEMPLATE-BRIEF.md) — depends on `evidence-review-row`, `evidence-review-modal`, `evidence-follow-up-summary`
- [BU report editor page](individual-templates/bu-report-editor-page/TEMPLATE-BRIEF.md) — depends on `bu-report-section-editor`, `bu-report-summary-table`, `report-feedback-banner`
- [Complete BU report read view](individual-templates/bu-report-read-view/TEMPLATE-BRIEF.md) — depends on `bu-report-tabs`, `report-feedback-banner`
- [Decision page layout](individual-templates/decision-page-layout/TEMPLATE-BRIEF.md) — depends on `decision-recommendation-panel`, `decision-scenario-configurator`, `decision-savings-chart`, `decision-waterfall-chart`, `decision-rice-sequencing`, `decision-accounting-overview`, `decision-artifact-hub`
- [ADF lineage explorer](individual-templates/adf-lineage-explorer/TEMPLATE-BRIEF.md) — depends on `adf-lineage-touchpoint-map`, `adf-lineage-map`
- [DORA dashboard](individual-templates/dora-dashboard/TEMPLATE-BRIEF.md) — depends on `dora-metric-card`, `dora-supporting-stat-table`
- [Test coverage dashboard](individual-templates/test-coverage-dashboard/TEMPLATE-BRIEF.md) — depends on `test-coverage-map`
