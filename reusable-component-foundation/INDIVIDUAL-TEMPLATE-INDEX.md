# Individual Interactive Template Index

Build one row at a time. Each link opens a self-contained implementation brief with exact source drivers and mock data.

| # | Individual template | Type | Parent capability | Primary source driver |
| ---: | --- | --- | --- | --- |
| 1 | [Dashboard page](individual-templates/dashboard-page/TEMPLATE-BRIEF.md) | screen | Dashboard shell, KPI cards and planning | `renderDashboard(...)` |
| 2 | [Dashboard tab bar](individual-templates/dashboard-tab-bar/TEMPLATE-BRIEF.md) | primitive | Dashboard shell, KPI cards and planning | `renderDashboardTabs(...)` |
| 3 | [Dashboard KPI card](individual-templates/dashboard-kpi-card/TEMPLATE-BRIEF.md) | primitive | Dashboard shell, KPI cards and planning | `renderDiscoveryKpiCard(...)` |
| 4 | [Dashboard line chart](individual-templates/dashboard-line-chart/TEMPLATE-BRIEF.md) | primitive | Dashboard shell, KPI cards and planning | `renderDiscoveryLineChart(...)` |
| 5 | [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md) | composite | Dashboard shell, KPI cards and planning | `renderDashboardPlanTab(...)` |
| 6 | [Report pie chart](individual-templates/report-pie-chart/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderReportPieVisual(...)` |
| 7 | [Report bar chart](individual-templates/report-bar-chart/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderReportBarVisual(...)` |
| 8 | [Metadata bar chart](individual-templates/metadata-bar-chart/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderMetadataBarChart(...)` |
| 9 | [Advanced-discovery pie chart](individual-templates/advanced-discovery-pie-chart/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderAdvancedDiscoveryPieChart(...)` |
| 10 | [Advanced-discovery distribution chart](individual-templates/advanced-discovery-distribution-chart/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderAdvancedDiscoveryDistributionChart(...)` |
| 11 | [Chart empty state](individual-templates/chart-empty-state/TEMPLATE-BRIEF.md) | primitive | Graphs and chart primitives | `renderAdvancedDiscoveryEmptyChart(...)` |
| 12 | [External-location dependency map](individual-templates/external-location-dependency-map/TEMPLATE-BRIEF.md) | composite | Diagram and dependency-map primitives | `buildExternalLocationGraph(...)` |
| 13 | [Source/consumer dependency map](individual-templates/source-consumer-dependency-map/TEMPLATE-BRIEF.md) | composite | Diagram and dependency-map primitives | `renderSourceConsumerDependencyDiagram(...)` |
| 14 | [Programme topology diagram](individual-templates/programme-topology-diagram/TEMPLATE-BRIEF.md) | composite | Diagram and dependency-map primitives | `renderProgramTopologyDiagram(...)` |
| 15 | [Diagram toolbar](individual-templates/diagram-toolbar/TEMPLATE-BRIEF.md) | primitive | Diagram and dependency-map primitives | `wireSourceConsumerDiagramActions(...)` |
| 16 | [Kanban/list view toggle](individual-templates/phase-view-toggle/TEMPLATE-BRIEF.md) | primitive | Kanban, list and task cards | `renderPhaseDashboardViewToggle(...)` |
| 17 | [Phase owner filter](individual-templates/phase-owner-filter/TEMPLATE-BRIEF.md) | primitive | Kanban, list and task cards | `renderPhaseDashboardOwnerFilter(...)` |
| 18 | [Phase Kanban board](individual-templates/phase-kanban-board/TEMPLATE-BRIEF.md) | composite | Kanban, list and task cards | `renderPhaseSectionList(...)` |
| 19 | [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md) | primitive | Kanban, list and task cards | `renderContributorKanbanColumn(...)` |
| 20 | [Editable data table](individual-templates/editable-data-table/TEMPLATE-BRIEF.md) | composite | Editable and read-only data tables | `renderEditDataTable(...)` |
| 21 | [Excel import/export panel](individual-templates/excel-import-export-panel/TEMPLATE-BRIEF.md) | composite | Editable and read-only data tables | `renderExcelImportExportComponent(...)` |
| 22 | [Compact read-only table](individual-templates/compact-readonly-table/TEMPLATE-BRIEF.md) | primitive | Editable and read-only data tables | `renderMiniTable(...)` |
| 23 | [Input traceability table](individual-templates/input-traceability-table/TEMPLATE-BRIEF.md) | composite | Editable and read-only data tables | `renderInputTraceabilityTable(...)` |
| 24 | [Metadata results table](individual-templates/metadata-results-table/TEMPLATE-BRIEF.md) | composite | Editable and read-only data tables | `renderMetadataTableSection(...)` |
| 25 | [Tool metadata setup page](individual-templates/tool-metadata-setup-page/TEMPLATE-BRIEF.md) | screen | Tool metadata setup | `renderToolMetadata(...)` |
| 26 | [Metadata disclosure editor](individual-templates/metadata-disclosure-editor/TEMPLATE-BRIEF.md) | composite | Tool metadata setup | `renderMetadataDisclosure(...)` |
| 27 | [RICE definition table](individual-templates/rice-definition-table/TEMPLATE-BRIEF.md) | composite | Tool metadata setup | `renderRiceDefinitionsEditTable(...)` |
| 28 | [ADF activity-factor table](individual-templates/adf-factor-table/TEMPLATE-BRIEF.md) | composite | Tool metadata setup | `renderAdfActivityFactorsEditTable(...)` |
| 29 | [Workflow status-model table](individual-templates/status-model-table/TEMPLATE-BRIEF.md) | composite | Tool metadata setup | `renderPhaseStatusModelTable(...)` |
| 30 | [Technology-mapping metadata table](individual-templates/technology-mapping-table/TEMPLATE-BRIEF.md) | composite | Tool metadata setup | `renderTechnologyMappingMetadataTable(...)` |
| 31 | [Environment access confirmation form](individual-templates/environment-access-form/TEMPLATE-BRIEF.md) | composite | Access confirmation and analysis verification | `renderEnvironmentAccessTask(...)` |
| 32 | [Knowledge/repository access form](individual-templates/knowledge-access-form/TEMPLATE-BRIEF.md) | composite | Access confirmation and analysis verification | `renderKnowledgeAccessTask(...)` |
| 33 | [Analysis access summary](individual-templates/analysis-access-summary/TEMPLATE-BRIEF.md) | composite | Access confirmation and analysis verification | `renderAnalysisAccessAndReferenceLinks(...)` |
| 34 | [Access test and confirmation control](individual-templates/access-test-control/TEMPLATE-BRIEF.md) | primitive | Access confirmation and analysis verification | `renderEnvironmentAccessTestControls(...)` |
| 35 | [Document feedback panel](individual-templates/document-feedback-panel/TEMPLATE-BRIEF.md) | composite | Document review and feedback loop | `renderDocumentFeedbackSection(...)` |
| 36 | [Feedback item card](individual-templates/feedback-item-card/TEMPLATE-BRIEF.md) | primitive | Document review and feedback loop | `renderFeedbackSection(...)` |
| 37 | [Report feedback banner](individual-templates/report-feedback-banner/TEMPLATE-BRIEF.md) | composite | Document review and feedback loop | `renderBuOutputDocumentFeedbackBanner(...)` |
| 38 | [Report feedback dialog](individual-templates/report-feedback-dialog/TEMPLATE-BRIEF.md) | composite | Document review and feedback loop | `openBuOutputFeedbackDialog(...)` |
| 39 | [Generic wizard shell](individual-templates/wizard-shell/TEMPLATE-BRIEF.md) | primitive | Questionnaire and multi-step wizard patterns | `renderWizard(...)` |
| 40 | [Questionnaire answer wizard](individual-templates/questionnaire-answer-wizard/TEMPLATE-BRIEF.md) | composite | Questionnaire and multi-step wizard patterns | `renderQuestionnaireAnswerWizard(...)` |
| 41 | [Questionnaire answer review](individual-templates/questionnaire-answer-review/TEMPLATE-BRIEF.md) | composite | Questionnaire and multi-step wizard patterns | `renderQuestionnaireAnswersModal(...)` |
| 42 | [Script-output upload wizard](individual-templates/script-output-wizard/TEMPLATE-BRIEF.md) | composite | Questionnaire and multi-step wizard patterns | `renderScriptOutputWizard(...)` |
| 43 | [Multi-document upload wizard](individual-templates/multi-document-upload-wizard/TEMPLATE-BRIEF.md) | composite | Questionnaire and multi-step wizard patterns | `renderMultiDocumentUploadWizard(...)` |
| 44 | [Metadata results page](individual-templates/metadata-results-page/TEMPLATE-BRIEF.md) | screen | Metadata results and advanced discovery | `renderMetadataReview(...)` |
| 45 | [Metadata summary cards](individual-templates/metadata-summary-cards/TEMPLATE-BRIEF.md) | composite | Metadata results and advanced discovery | `renderMetadataReviewStats(...)` |
| 46 | [Metadata category overview](individual-templates/metadata-category-overview/TEMPLATE-BRIEF.md) | composite | Metadata results and advanced discovery | `renderMetadataSectionOverview(...)` |
| 47 | [Inventory resource table](individual-templates/inventory-resource-table/TEMPLATE-BRIEF.md) | composite | Metadata results and advanced discovery | `renderDatabricksInventoryResourceTable(...)` |
| 48 | [Unity Catalog binding table](individual-templates/unity-catalog-binding-table/TEMPLATE-BRIEF.md) | composite | Metadata results and advanced discovery | `renderUnityCatalogBindingTable(...)` |
| 49 | [ADF complexity page](individual-templates/adf-complexity-page/TEMPLATE-BRIEF.md) | screen | ADF pipeline charts, graphs and step explorer | `renderAdfComplexity(...)` |
| 50 | [ADF complexity charts](individual-templates/adf-complexity-charts/TEMPLATE-BRIEF.md) | composite | ADF pipeline charts, graphs and step explorer | `renderBuAdfComplexityCharts(...)` |
| 51 | [ADF pipeline selector](individual-templates/adf-pipeline-selector/TEMPLATE-BRIEF.md) | primitive | ADF pipeline charts, graphs and step explorer | `renderAdfPipelineSelector(...)` |
| 52 | [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | composite | ADF pipeline charts, graphs and step explorer | `getAdfPipelineStepFlows(...)` |
| 53 | [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md) | primitive | ADF pipeline charts, graphs and step explorer | `createAdfPipelineStep(...)` |
| 54 | [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) | composite | ADF pipeline charts, graphs and step explorer | `renderAdfStepDetailBranchMap(...)` |
| 55 | [ADF touchpoint graph](individual-templates/adf-touchpoint-graph/TEMPLATE-BRIEF.md) | composite | ADF pipeline charts, graphs and step explorer | `buildAdfPipelineTouchpointGraph(...)` |
| 56 | [BU sizing and complexity page](individual-templates/bu-complexity-page/TEMPLATE-BRIEF.md) | screen | Business-unit sizing and complexity analysis | `renderBuSizingComplexity(...)` |
| 57 | [Complexity factor control](individual-templates/complexity-factor-control/TEMPLATE-BRIEF.md) | primitive | Business-unit sizing and complexity analysis | `renderBuComplexityFactorControl(...)` |
| 58 | [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md) | primitive | Business-unit sizing and complexity analysis | `renderBuNumericComplexityControl(...)` |
| 59 | [Complexity band definition table](individual-templates/complexity-band-table/TEMPLATE-BRIEF.md) | primitive | Business-unit sizing and complexity analysis | `renderBandDefinitionTable(...)` |
| 60 | [Environment rationalisation page](individual-templates/environment-rationalisation-page/TEMPLATE-BRIEF.md) | screen | Environment rationalisation and proposed topology | `renderEnvironmentRationalisation(...)` |
| 61 | [Proposed topology table](individual-templates/proposed-topology-table/TEMPLATE-BRIEF.md) | composite | Environment rationalisation and proposed topology | `renderProposedTopologyTable(...)` |
| 62 | [Proposed topology flow diagram](individual-templates/topology-flow-diagram/TEMPLATE-BRIEF.md) | composite | Environment rationalisation and proposed topology | `renderProposedTopologyFlowDiagram(...)` |
| 63 | [Proposed topology structure diagram](individual-templates/topology-structure-diagram/TEMPLATE-BRIEF.md) | composite | Environment rationalisation and proposed topology | `renderProposedTopologyStructureDiagram(...)` |
| 64 | [Rationalisation import controller](individual-templates/rationalisation-import-controller/TEMPLATE-BRIEF.md) | controller | Environment rationalisation and proposed topology | `parseEnvironmentRationalisationImportFile(...)` |
| 65 | [Environment evidence matrix](individual-templates/environment-evidence-matrix/TEMPLATE-BRIEF.md) | composite | Environment evidence matrix | `renderCollectionEvidenceMatrix(...)` |
| 66 | [Evidence progress bar](individual-templates/evidence-progress-bar/TEMPLATE-BRIEF.md) | primitive | Environment evidence matrix | `renderCollectionEvidenceProgressBar(...)` |
| 67 | [Evidence status icon](individual-templates/evidence-status-icon/TEMPLATE-BRIEF.md) | primitive | Environment evidence matrix | `renderEvidenceStatusIcon(...)` |
| 68 | [Environment evidence task list](individual-templates/environment-evidence-task-list/TEMPLATE-BRIEF.md) | composite | Environment evidence matrix | `renderEnvironmentTaskList(...)` |
| 69 | [Evidence review page](individual-templates/evidence-review-page/TEMPLATE-BRIEF.md) | screen | Evidence review queue | `renderEvidenceReview(...)` |
| 70 | [Evidence review row](individual-templates/evidence-review-row/TEMPLATE-BRIEF.md) | composite | Evidence review queue | `renderEvidenceReviewRow(...)` |
| 71 | [Evidence review modal](individual-templates/evidence-review-modal/TEMPLATE-BRIEF.md) | composite | Evidence review queue | `renderEvidenceReviewModal(...)` |
| 72 | [Evidence follow-up summary](individual-templates/evidence-follow-up-summary/TEMPLATE-BRIEF.md) | primitive | Evidence review queue | `renderEvidenceReviewFollowUpSummary(...)` |
| 73 | [BU report editor page](individual-templates/bu-report-editor-page/TEMPLATE-BRIEF.md) | screen | Final BU report review, finalise, read and feedback states | `renderBuTechReportInput(...)` |
| 74 | [BU report section editor](individual-templates/bu-report-section-editor/TEMPLATE-BRIEF.md) | composite | Final BU report review, finalise, read and feedback states | `renderBuTechReportInputSection(...)` |
| 75 | [BU report summary table](individual-templates/bu-report-summary-table/TEMPLATE-BRIEF.md) | composite | Final BU report review, finalise, read and feedback states | `renderBuTechReportSummaryTable(...)` |
| 76 | [BU report state tabs](individual-templates/bu-report-tabs/TEMPLATE-BRIEF.md) | primitive | Final BU report review, finalise, read and feedback states | `renderBuTechReportTabs(...)` |
| 77 | [Complete BU report read view](individual-templates/bu-report-read-view/TEMPLATE-BRIEF.md) | screen | Final BU report review, finalise, read and feedback states | `renderBuTechReport(...)` |
| 78 | [Decision page layout](individual-templates/decision-page-layout/TEMPLATE-BRIEF.md) | screen | Decision screen and scenario layout | `renderDecisionPage(...)` |
| 79 | [Decision recommendation panel](individual-templates/decision-recommendation-panel/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionCgiRecommendationPanel(...)` |
| 80 | [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionScenarioConfigurator(...)` |
| 81 | [Decision savings progression chart](individual-templates/decision-savings-chart/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionPrimaryChart(...)` |
| 82 | [Decision waterfall chart](individual-templates/decision-waterfall-chart/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionWaterfallChart(...)` |
| 83 | [Decision RICE sequencing](individual-templates/decision-rice-sequencing/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionRiceSequencingPanel(...)` |
| 84 | [Decision accounting overview](individual-templates/decision-accounting-overview/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionAccountingOverview(...)` |
| 85 | [Decision artifact hub](individual-templates/decision-artifact-hub/TEMPLATE-BRIEF.md) | composite | Decision screen and scenario layout | `renderDecisionArtifactHub(...)` |
| 86 | [ADF lineage explorer](individual-templates/adf-lineage-explorer/TEMPLATE-BRIEF.md) | screen | Data lineage and dependency explorer | `getAdfLineageModel(...)` |
| 87 | [ADF lineage touchpoint map](individual-templates/adf-lineage-touchpoint-map/TEMPLATE-BRIEF.md) | composite | Data lineage and dependency explorer | `renderAdfLineageTouchpointMap(...)` |
| 88 | [ADF full lineage map](individual-templates/adf-lineage-map/TEMPLATE-BRIEF.md) | composite | Data lineage and dependency explorer | `renderAdfLineageMap(...)` |
| 89 | [Lineage caveat panel](individual-templates/lineage-caveat-panel/TEMPLATE-BRIEF.md) | primitive | Data lineage and dependency explorer | `getAdfLineageCaveats(...)` |
| 90 | [DORA dashboard](individual-templates/dora-dashboard/TEMPLATE-BRIEF.md) | screen | DORA metrics dashboard | `renderDoraMetricsReport(...)` |
| 91 | [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md) | primitive | DORA metrics dashboard | `renderDoraMetricCard(...)` |
| 92 | [DORA supporting-stat table](individual-templates/dora-supporting-stat-table/TEMPLATE-BRIEF.md) | primitive | DORA metrics dashboard | `renderDoraStatTable(...)` |
| 93 | [DORA metric data builder](individual-templates/dora-metric-builder/TEMPLATE-BRIEF.md) | backend | DORA metrics dashboard | `buildDoraMetrics(...)` |
| 94 | [Test coverage dashboard](individual-templates/test-coverage-dashboard/TEMPLATE-BRIEF.md) | screen | Test coverage map and quality telemetry | `testTelemetryMetrics(...)` |
| 95 | [Test coverage map](individual-templates/test-coverage-map/TEMPLATE-BRIEF.md) | composite | Test coverage map and quality telemetry | `renderTestCoverageDiagram(...)` |
| 96 | [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md) | backend | Test coverage map and quality telemetry | `buildRepoQualityMetrics(...)` |
