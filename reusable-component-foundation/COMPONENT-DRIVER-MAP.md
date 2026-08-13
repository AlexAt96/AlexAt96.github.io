# Component Driver Map

This is the direct answer to which code drives which individual component.

| Individual template | Function | Source file | Original lines | Role |
| --- | --- | --- | ---: | --- |
| [Dashboard page](individual-templates/dashboard-page/TEMPLATE-BRIEF.md) | `renderDashboard(...)` | `app/src/app.js` | 1786-1809 | UI renderer/controller |
| [Dashboard tab bar](individual-templates/dashboard-tab-bar/TEMPLATE-BRIEF.md) | `renderDashboardTabs(...)` | `app/src/app.js` | 1811-1826 | UI renderer/controller |
| [Dashboard KPI card](individual-templates/dashboard-kpi-card/TEMPLATE-BRIEF.md) | `renderDiscoveryKpiCard(...)` | `app/src/app.js` | 1894-1903 | UI renderer/controller |
| [Dashboard line chart](individual-templates/dashboard-line-chart/TEMPLATE-BRIEF.md) | `renderDiscoveryLineChart(...)` | `app/src/app.js` | 1929-1980 | UI renderer/controller |
| [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md) | `renderDashboardPlanTab(...)` | `app/src/app.js` | 2115-2181 | UI renderer/controller |
| [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md) | `renderDashboardPlanRow(...)` | `app/src/app.js` | 2183-2194 | UI renderer/controller |
| [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md) | `renderDashboardPlanBar(...)` | `app/src/app.js` | 2196-2217 | UI renderer/controller |
| [Project plan Gantt](individual-templates/project-plan-gantt/TEMPLATE-BRIEF.md) | `getDashboardPlanModel(...)` | `app/src/app.js` | 2241-2316 | UI renderer/controller |
| [Report pie chart](individual-templates/report-pie-chart/TEMPLATE-BRIEF.md) | `renderReportPieVisual(...)` | `app/src/app.js` | 7114-7159 | UI renderer/controller |
| [Report pie chart](individual-templates/report-pie-chart/TEMPLATE-BRIEF.md) | `renderReportPieSlice(...)` | `app/src/app.js` | 7161-7168 | UI renderer/controller |
| [Report bar chart](individual-templates/report-bar-chart/TEMPLATE-BRIEF.md) | `renderReportBarVisual(...)` | `app/src/app.js` | 7170-7205 | UI renderer/controller |
| [Metadata bar chart](individual-templates/metadata-bar-chart/TEMPLATE-BRIEF.md) | `renderMetadataBarChart(...)` | `app/src/app.js` | 14231-14255 | UI renderer/controller |
| [Advanced-discovery pie chart](individual-templates/advanced-discovery-pie-chart/TEMPLATE-BRIEF.md) | `renderAdvancedDiscoveryPieChart(...)` | `app/src/app.js` | 13235-13275 | UI renderer/controller |
| [Advanced-discovery distribution chart](individual-templates/advanced-discovery-distribution-chart/TEMPLATE-BRIEF.md) | `renderAdvancedDiscoveryDistributionChart(...)` | `app/src/app.js` | 13277-13306 | UI renderer/controller |
| [Advanced-discovery distribution chart](individual-templates/advanced-discovery-distribution-chart/TEMPLATE-BRIEF.md) | `getAdvancedDiscoveryChartRows(...)` | `app/src/app.js` | 13319-13333 | UI renderer/controller |
| [Chart empty state](individual-templates/chart-empty-state/TEMPLATE-BRIEF.md) | `renderAdvancedDiscoveryEmptyChart(...)` | `app/src/app.js` | 13308-13317 | UI renderer/controller |
| [External-location dependency map](individual-templates/external-location-dependency-map/TEMPLATE-BRIEF.md) | `buildExternalLocationGraph(...)` | `app/src/app.js` | 14722-14775 | UI renderer/controller |
| [External-location dependency map](individual-templates/external-location-dependency-map/TEMPLATE-BRIEF.md) | `renderExternalLocationDependencyMap(...)` | `app/src/app.js` | 14789-14872 | UI renderer/controller |
| [External-location dependency map](individual-templates/external-location-dependency-map/TEMPLATE-BRIEF.md) | `renderExternalLocationDiagram(...)` | `app/src/app.js` | 14636-14720 | UI renderer/controller |
| [Source/consumer dependency map](individual-templates/source-consumer-dependency-map/TEMPLATE-BRIEF.md) | `renderSourceConsumerDependencyDiagram(...)` | `app/src/app.js` | 15235-15255 | UI renderer/controller |
| [Source/consumer dependency map](individual-templates/source-consumer-dependency-map/TEMPLATE-BRIEF.md) | `renderSourceConsumerDependencyDiagramContent(...)` | `app/src/app.js` | 15302-15313 | UI renderer/controller |
| [Programme topology diagram](individual-templates/programme-topology-diagram/TEMPLATE-BRIEF.md) | `renderProgramTopologyDiagram(...)` | `app/src/app.js` | 17583-17597 | UI renderer/controller |
| [Diagram toolbar](individual-templates/diagram-toolbar/TEMPLATE-BRIEF.md) | `wireSourceConsumerDiagramActions(...)` | `app/src/app.js` | 15901-16072 | UI renderer/controller |
| [Kanban/list view toggle](individual-templates/phase-view-toggle/TEMPLATE-BRIEF.md) | `renderPhaseDashboardViewToggle(...)` | `app/src/app.js` | 3310-3317 | UI renderer/controller |
| [Kanban/list view toggle](individual-templates/phase-view-toggle/TEMPLATE-BRIEF.md) | `setPhaseDashboardView(...)` | `app/src/app.js` | 3953-3970 | UI renderer/controller |
| [Phase owner filter](individual-templates/phase-owner-filter/TEMPLATE-BRIEF.md) | `renderPhaseDashboardOwnerFilter(...)` | `app/src/app.js` | 3319-3337 | UI renderer/controller |
| [Phase owner filter](individual-templates/phase-owner-filter/TEMPLATE-BRIEF.md) | `getPhaseDashboardOwnerFilter(...)` | `app/src/app.js` | 3360-3367 | UI renderer/controller |
| [Phase Kanban board](individual-templates/phase-kanban-board/TEMPLATE-BRIEF.md) | `renderPhaseSectionList(...)` | `app/src/app.js` | 3381-3394 | UI renderer/controller |
| [Phase Kanban board](individual-templates/phase-kanban-board/TEMPLATE-BRIEF.md) | `renderPhaseCombinedKanbanBoard(...)` | `app/src/app.js` | 3396-3403 | UI renderer/controller |
| [Phase Kanban board](individual-templates/phase-kanban-board/TEMPLATE-BRIEF.md) | `refreshKanbanColumnCounts(...)` | `app/src/app.js` | 35331-35337 | UI renderer/controller |
| [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md) | `renderContributorKanbanColumn(...)` | `app/src/app.js` | 3984-3997 | UI renderer/controller |
| [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md) | `getSectionKanbanStatus(...)` | `app/src/app.js` | 3999-4007 | UI renderer/controller |
| [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md) | `renderSectionLink(...)` | `app/src/app.js` | 28281-28371 | UI renderer/controller |
| [Kanban column and task card](individual-templates/kanban-column-and-task-card/TEMPLATE-BRIEF.md) | `moveKanbanCardToStatusColumn(...)` | `app/src/app.js` | 35309-35321 | UI renderer/controller |
| [Editable data table](individual-templates/editable-data-table/TEMPLATE-BRIEF.md) | `renderEditDataTable(...)` | `app/src/app.js` | 6013-6033 | UI renderer/controller |
| [Editable data table](individual-templates/editable-data-table/TEMPLATE-BRIEF.md) | `copyEditableTableRow(...)` | `app/src/app.js` | 40080-40099 | UI renderer/controller |
| [Excel import/export panel](individual-templates/excel-import-export-panel/TEMPLATE-BRIEF.md) | `renderExcelImportExportComponent(...)` | `app/src/app.js` | 6035-6057 | UI renderer/controller |
| [Excel import/export panel](individual-templates/excel-import-export-panel/TEMPLATE-BRIEF.md) | `wireExcelImportExportComponent(...)` | `app/src/app.js` | 35077-35103 | UI renderer/controller |
| [Excel import/export panel](individual-templates/excel-import-export-panel/TEMPLATE-BRIEF.md) | `parseImportTableRowsFromFile(...)` | `app/src/app.js` | 40577-40585 | UI renderer/controller |
| [Compact read-only table](individual-templates/compact-readonly-table/TEMPLATE-BRIEF.md) | `renderMiniTable(...)` | `app/src/app.js` | 16976-16978 | UI renderer/controller |
| [Input traceability table](individual-templates/input-traceability-table/TEMPLATE-BRIEF.md) | `renderInputTraceabilityTable(...)` | `app/src/app.js` | 5319-5348 | UI renderer/controller |
| [Metadata results table](individual-templates/metadata-results-table/TEMPLATE-BRIEF.md) | `renderMetadataTableSection(...)` | `app/src/app.js` | 14589-14602 | UI renderer/controller |
| [Metadata results table](individual-templates/metadata-results-table/TEMPLATE-BRIEF.md) | `renderDataDictionaryTableSection(...)` | `app/src/app.js` | 6918-6931 | UI renderer/controller |
| [Tool metadata setup page](individual-templates/tool-metadata-setup-page/TEMPLATE-BRIEF.md) | `renderToolMetadata(...)` | `app/src/app.js` | 7651-7712 | UI renderer/controller |
| [Metadata disclosure editor](individual-templates/metadata-disclosure-editor/TEMPLATE-BRIEF.md) | `renderMetadataDisclosure(...)` | `app/src/app.js` | 7714-7741 | UI renderer/controller |
| [Metadata disclosure editor](individual-templates/metadata-disclosure-editor/TEMPLATE-BRIEF.md) | `saveToolMetadataSection(...)` | `app/src/app.js` | 35417-35435 | UI renderer/controller |
| [RICE definition table](individual-templates/rice-definition-table/TEMPLATE-BRIEF.md) | `renderRiceDefinitionsEditTable(...)` | `app/src/app.js` | 7917-7935 | UI renderer/controller |
| [ADF activity-factor table](individual-templates/adf-factor-table/TEMPLATE-BRIEF.md) | `renderAdfActivityFactorsEditTable(...)` | `app/src/app.js` | 7969-7979 | UI renderer/controller |
| [ADF activity-factor table](individual-templates/adf-factor-table/TEMPLATE-BRIEF.md) | `renderAdfActivityFactorEditCells(...)` | `app/src/app.js` | 7981-7992 | UI renderer/controller |
| [Workflow status-model table](individual-templates/status-model-table/TEMPLATE-BRIEF.md) | `renderPhaseStatusModelTable(...)` | `app/src/app.js` | 7994-8016 | UI renderer/controller |
| [Technology-mapping metadata table](individual-templates/technology-mapping-table/TEMPLATE-BRIEF.md) | `renderTechnologyMappingMetadataTable(...)` | `app/src/app.js` | 8046-8065 | UI renderer/controller |
| [Technology-mapping metadata table](individual-templates/technology-mapping-table/TEMPLATE-BRIEF.md) | `renderTechnologyMappingPriorityTable(...)` | `app/src/app.js` | 8067-8077 | UI renderer/controller |
| [Technology-mapping metadata table](individual-templates/technology-mapping-table/TEMPLATE-BRIEF.md) | `renderTechnologyMappingMetadataEditCells(...)` | `app/src/app.js` | 8113-8136 | UI renderer/controller |
| [Environment access confirmation form](individual-templates/environment-access-form/TEMPLATE-BRIEF.md) | `renderEnvironmentAccessTask(...)` | `app/src/app.js` | 9077-9121 | UI renderer/controller |
| [Environment access confirmation form](individual-templates/environment-access-form/TEMPLATE-BRIEF.md) | `getEnvironmentAccessConfirmationForRow(...)` | `app/src/app.js` | 8427-8441 | UI renderer/controller |
| [Environment access confirmation form](individual-templates/environment-access-form/TEMPLATE-BRIEF.md) | `getEnvironmentAccessPayload(...)` | `app/src/app.js` | 40217-40228 | UI renderer/controller |
| [Knowledge/repository access form](individual-templates/knowledge-access-form/TEMPLATE-BRIEF.md) | `renderKnowledgeAccessTask(...)` | `app/src/app.js` | 9035-9075 | UI renderer/controller |
| [Knowledge/repository access form](individual-templates/knowledge-access-form/TEMPLATE-BRIEF.md) | `getKnowledgeAccessPayload(...)` | `app/src/app.js` | 40204-40215 | UI renderer/controller |
| [Analysis access summary](individual-templates/analysis-access-summary/TEMPLATE-BRIEF.md) | `renderAnalysisAccessAndReferenceLinks(...)` | `app/src/app.js` | 8278-8319 | UI renderer/controller |
| [Analysis access summary](individual-templates/analysis-access-summary/TEMPLATE-BRIEF.md) | `renderAnalysisAccessProduct(...)` | `app/src/app.js` | 8321-8350 | UI renderer/controller |
| [Analysis access summary](individual-templates/analysis-access-summary/TEMPLATE-BRIEF.md) | `getEnvironmentAccessSummary(...)` | `app/src/app.js` | 8352-8368 | UI renderer/controller |
| [Access test and confirmation control](individual-templates/access-test-control/TEMPLATE-BRIEF.md) | `renderEnvironmentAccessTestControls(...)` | `app/src/app.js` | 8379-8396 | UI renderer/controller |
| [Access test and confirmation control](individual-templates/access-test-control/TEMPLATE-BRIEF.md) | `getEnvironmentAccessTestSummary(...)` | `app/src/app.js` | 8370-8377 | UI renderer/controller |
| [Access test and confirmation control](individual-templates/access-test-control/TEMPLATE-BRIEF.md) | `applyEnvironmentAccessSaveResult(...)` | `app/src/app.js` | 40193-40202 | UI renderer/controller |
| [Document feedback panel](individual-templates/document-feedback-panel/TEMPLATE-BRIEF.md) | `renderDocumentFeedbackSection(...)` | `app/src/app.js` | 4245-4254 | UI renderer/controller |
| [Document feedback panel](individual-templates/document-feedback-panel/TEMPLATE-BRIEF.md) | `renderPhaseFeedbackSection(...)` | `app/src/app.js` | 4256-4260 | UI renderer/controller |
| [Feedback item card](individual-templates/feedback-item-card/TEMPLATE-BRIEF.md) | `renderFeedbackSection(...)` | `app/src/app.js` | 4262-4278 | UI renderer/controller |
| [Feedback item card](individual-templates/feedback-item-card/TEMPLATE-BRIEF.md) | `renderFeedbackItem(...)` | `app/src/app.js` | 4280-4300 | UI renderer/controller |
| [Report feedback banner](individual-templates/report-feedback-banner/TEMPLATE-BRIEF.md) | `renderBuOutputDocumentFeedbackBanner(...)` | `app/src/app.js` | 24369-24398 | UI renderer/controller |
| [Report feedback banner](individual-templates/report-feedback-banner/TEMPLATE-BRIEF.md) | `wireBuOutputFeedbackDoneActions(...)` | `app/src/app.js` | 32573-32583 | UI renderer/controller |
| [Report feedback dialog](individual-templates/report-feedback-dialog/TEMPLATE-BRIEF.md) | `openBuOutputFeedbackDialog(...)` | `app/src/app.js` | 32721-32787 | UI renderer/controller |
| [Report feedback dialog](individual-templates/report-feedback-dialog/TEMPLATE-BRIEF.md) | `sendBuTechReportSectionFeedback(...)` | `app/src/app.js` | 37161-37197 | UI renderer/controller |
| [Generic wizard shell](individual-templates/wizard-shell/TEMPLATE-BRIEF.md) | `renderWizard(...)` | `app/src/app.js` | 9379-9417 | UI renderer/controller |
| [Generic wizard shell](individual-templates/wizard-shell/TEMPLATE-BRIEF.md) | `openAccessibleModal(...)` | `app/src/app.js` | 38676-38719 | UI renderer/controller |
| [Generic wizard shell](individual-templates/wizard-shell/TEMPLATE-BRIEF.md) | `closeAccessibleModal(...)` | `app/src/app.js` | 38721-38729 | UI renderer/controller |
| [Questionnaire answer wizard](individual-templates/questionnaire-answer-wizard/TEMPLATE-BRIEF.md) | `renderQuestionnaireAnswerWizard(...)` | `app/src/app.js` | 10075-10117 | UI renderer/controller |
| [Questionnaire answer wizard](individual-templates/questionnaire-answer-wizard/TEMPLATE-BRIEF.md) | `wireQuestionnaireAnswerWizard(...)` | `app/src/app.js` | 39120-39155 | UI renderer/controller |
| [Questionnaire answer wizard](individual-templates/questionnaire-answer-wizard/TEMPLATE-BRIEF.md) | `saveQuestionnaireAnswers(...)` | `app/src/app.js` | 39175-39199 | UI renderer/controller |
| [Questionnaire answer review](individual-templates/questionnaire-answer-review/TEMPLATE-BRIEF.md) | `renderQuestionnaireAnswersModal(...)` | `app/src/app.js` | 10119-10142 | UI renderer/controller |
| [Questionnaire answer review](individual-templates/questionnaire-answer-review/TEMPLATE-BRIEF.md) | `renderQuestionnaireAnswersView(...)` | `app/src/app.js` | 39322-39349 | UI renderer/controller |
| [Questionnaire answer review](individual-templates/questionnaire-answer-review/TEMPLATE-BRIEF.md) | `launchQuestionnaireEditorFromModal(...)` | `app/src/app.js` | 39253-39265 | UI renderer/controller |
| [Script-output upload wizard](individual-templates/script-output-wizard/TEMPLATE-BRIEF.md) | `renderScriptOutputWizard(...)` | `app/src/app.js` | 9516-9595 | UI renderer/controller |
| [Script-output upload wizard](individual-templates/script-output-wizard/TEMPLATE-BRIEF.md) | `getScriptRunCommand(...)` | `app/src/app.js` | 9597-9602 | UI renderer/controller |
| [Multi-document upload wizard](individual-templates/multi-document-upload-wizard/TEMPLATE-BRIEF.md) | `renderMultiDocumentUploadWizard(...)` | `app/src/app.js` | 9761-9811 | UI renderer/controller |
| [Multi-document upload wizard](individual-templates/multi-document-upload-wizard/TEMPLATE-BRIEF.md) | `renderTerraformExporterWizard(...)` | `app/src/app.js` | 9419-9514 | UI renderer/controller |
| [Metadata results page](individual-templates/metadata-results-page/TEMPLATE-BRIEF.md) | `renderMetadataReview(...)` | `app/src/app.js` | 13006-13059 | UI renderer/controller |
| [Metadata results page](individual-templates/metadata-results-page/TEMPLATE-BRIEF.md) | `getMetadataReviewModel(...)` | `app/src/app.js` | 14018-14034 | UI renderer/controller |
| [Metadata results page](individual-templates/metadata-results-page/TEMPLATE-BRIEF.md) | `getMetadataReviewSummary(...)` | `app/src/app.js` | 14036-14068 | UI renderer/controller |
| [Metadata summary cards](individual-templates/metadata-summary-cards/TEMPLATE-BRIEF.md) | `renderMetadataReviewStats(...)` | `app/src/app.js` | 14127-14139 | UI renderer/controller |
| [Metadata category overview](individual-templates/metadata-category-overview/TEMPLATE-BRIEF.md) | `renderMetadataSectionOverview(...)` | `app/src/app.js` | 14214-14229 | UI renderer/controller |
| [Metadata category overview](individual-templates/metadata-category-overview/TEMPLATE-BRIEF.md) | `renderMetadataReviewDisclosure(...)` | `app/src/app.js` | 14281-14297 | UI renderer/controller |
| [Inventory resource table](individual-templates/inventory-resource-table/TEMPLATE-BRIEF.md) | `renderDatabricksInventoryResourceTable(...)` | `app/src/app.js` | 14329-14362 | UI renderer/controller |
| [Inventory resource table](individual-templates/inventory-resource-table/TEMPLATE-BRIEF.md) | `renderDatabricksInventoryResourceTypePanel(...)` | `app/src/app.js` | 14375-14394 | UI renderer/controller |
| [Inventory resource table](individual-templates/inventory-resource-table/TEMPLATE-BRIEF.md) | `renderMetadataAttributeDetails(...)` | `app/src/app.js` | 13989-14005 | UI renderer/controller |
| [Unity Catalog binding table](individual-templates/unity-catalog-binding-table/TEMPLATE-BRIEF.md) | `renderUnityCatalogBindingTable(...)` | `app/src/app.js` | 14299-14327 | UI renderer/controller |
| [Unity Catalog binding table](individual-templates/unity-catalog-binding-table/TEMPLATE-BRIEF.md) | `renderUnityCatalogBindingStatus(...)` | `app/src/app.js` | 14604-14613 | UI renderer/controller |
| [ADF complexity page](individual-templates/adf-complexity-page/TEMPLATE-BRIEF.md) | `renderAdfComplexity(...)` | `app/src/app.js` | 11396-11496 | UI renderer/controller |
| [ADF complexity page](individual-templates/adf-complexity-page/TEMPLATE-BRIEF.md) | `getAdfComplexityModel(...)` | `app/src/app.js` | 11498-11541 | UI renderer/controller |
| [ADF complexity charts](individual-templates/adf-complexity-charts/TEMPLATE-BRIEF.md) | `renderBuAdfComplexityCharts(...)` | `app/src/app.js` | 12882-12909 | UI renderer/controller |
| [ADF complexity charts](individual-templates/adf-complexity-charts/TEMPLATE-BRIEF.md) | `getAdfActivityTypeRows(...)` | `app/src/app.js` | 12864-12880 | UI renderer/controller |
| [ADF pipeline selector](individual-templates/adf-pipeline-selector/TEMPLATE-BRIEF.md) | `renderAdfPipelineSelector(...)` | `app/src/app.js` | 12086-12101 | UI renderer/controller |
| [ADF pipeline selector](individual-templates/adf-pipeline-selector/TEMPLATE-BRIEF.md) | `getSelectedAdfPipelineFlow(...)` | `app/src/app.js` | 12081-12084 | UI renderer/controller |
| [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | `getAdfPipelineStepFlows(...)` | `app/src/app.js` | 11781-11840 | UI renderer/controller |
| [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | `orderAdfPipelineActivities(...)` | `app/src/app.js` | 11842-11877 | UI renderer/controller |
| [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | `getAdfActivityDependencyLevels(...)` | `app/src/app.js` | 11879-11907 | UI renderer/controller |
| [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | `renderAdfPipelineStory(...)` | `app/src/app.js` | 12103-12169 | UI renderer/controller |
| [ADF pipeline story and lane](individual-templates/adf-pipeline-story/TEMPLATE-BRIEF.md) | `renderAdfPipelineLaneSvg(...)` | `app/src/app.js` | 12229-12274 | UI renderer/controller |
| [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md) | `createAdfPipelineStep(...)` | `app/src/app.js` | 11909-11944 | UI renderer/controller |
| [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md) | `renderAdfPipelineStep(...)` | `app/src/app.js` | 12183-12227 | UI renderer/controller |
| [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md) | `renderAdfStepSummaryTable(...)` | `app/src/app.js` | 12310-12330 | UI renderer/controller |
| [ADF activity step card](individual-templates/adf-activity-step-card/TEMPLATE-BRIEF.md) | `renderAdfStepEndpointBlock(...)` | `app/src/app.js` | 12354-12363 | UI renderer/controller |
| [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) | `renderAdfStepDetailBranchMap(...)` | `app/src/app.js` | 12365-12384 | UI renderer/controller |
| [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) | `renderAdfStepDetailNode(...)` | `app/src/app.js` | 12386-12395 | UI renderer/controller |
| [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) | `renderAdfStepDatabricksBlock(...)` | `app/src/app.js` | 12397-12407 | UI renderer/controller |
| [ADF step detail map](individual-templates/adf-step-detail-map/TEMPLATE-BRIEF.md) | `renderAdfPipelineDetailLaneSvg(...)` | `app/src/app.js` | 12280-12308 | UI renderer/controller |
| [ADF touchpoint graph](individual-templates/adf-touchpoint-graph/TEMPLATE-BRIEF.md) | `buildAdfPipelineTouchpointGraph(...)` | `app/src/app.js` | 12498-12601 | UI renderer/controller |
| [ADF touchpoint graph](individual-templates/adf-touchpoint-graph/TEMPLATE-BRIEF.md) | `serializeAdfPipelineTouchpointGraph(...)` | `app/src/app.js` | 12603-12622 | UI renderer/controller |
| [ADF touchpoint graph](individual-templates/adf-touchpoint-graph/TEMPLATE-BRIEF.md) | `renderAdfPipelineTouchpointSvg(...)` | `app/src/app.js` | 12624-12688 | UI renderer/controller |
| [BU sizing and complexity page](individual-templates/bu-complexity-page/TEMPLATE-BRIEF.md) | `renderBuSizingComplexity(...)` | `app/src/app.js` | 10840-10939 | UI renderer/controller |
| [Complexity factor control](individual-templates/complexity-factor-control/TEMPLATE-BRIEF.md) | `renderBuComplexityFactorControl(...)` | `app/src/app.js` | 11030-11044 | UI renderer/controller |
| [Complexity factor control](individual-templates/complexity-factor-control/TEMPLATE-BRIEF.md) | `getComplexityFactorScore(...)` | `app/src/app.js` | 11089-11091 | UI renderer/controller |
| [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md) | `renderBuNumericComplexityControl(...)` | `app/src/app.js` | 11046-11057 | UI renderer/controller |
| [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md) | `renderBuCalculatedComplexityControl(...)` | `app/src/app.js` | 11059-11071 | UI renderer/controller |
| [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md) | `calculateBuSizeBand(...)` | `app/src/app.js` | 11073-11079 | UI renderer/controller |
| [Numeric/calculated complexity control](individual-templates/complexity-score-control/TEMPLATE-BRIEF.md) | `calculateBuComplexityBand(...)` | `app/src/app.js` | 11081-11083 | UI renderer/controller |
| [Complexity band definition table](individual-templates/complexity-band-table/TEMPLATE-BRIEF.md) | `renderBandDefinitionTable(...)` | `app/src/app.js` | 11010-11028 | UI renderer/controller |
| [Environment rationalisation page](individual-templates/environment-rationalisation-page/TEMPLATE-BRIEF.md) | `renderEnvironmentRationalisation(...)` | `app/src/app.js` | 20781-20869 | UI renderer/controller |
| [Environment rationalisation page](individual-templates/environment-rationalisation-page/TEMPLATE-BRIEF.md) | `getEnvironmentRationalisationModel(...)` | `app/src/app.js` | 21918-21965 | UI renderer/controller |
| [Proposed topology table](individual-templates/proposed-topology-table/TEMPLATE-BRIEF.md) | `renderProposedTopologyTable(...)` | `app/src/app.js` | 20942-20973 | UI renderer/controller |
| [Proposed topology flow diagram](individual-templates/topology-flow-diagram/TEMPLATE-BRIEF.md) | `renderProposedTopologyFlowDiagram(...)` | `app/src/app.js` | 21000-21285 | UI renderer/controller |
| [Proposed topology flow diagram](individual-templates/topology-flow-diagram/TEMPLATE-BRIEF.md) | `renderEnvironmentMigrationFlowDiagram(...)` | `app/src/app.js` | 21287-21491 | UI renderer/controller |
| [Proposed topology structure diagram](individual-templates/topology-structure-diagram/TEMPLATE-BRIEF.md) | `renderProposedTopologyStructureDiagram(...)` | `app/src/app.js` | 21537-21891 | UI renderer/controller |
| [Rationalisation import controller](individual-templates/rationalisation-import-controller/TEMPLATE-BRIEF.md) | `parseEnvironmentRationalisationImportFile(...)` | `app/src/app.js` | 40573-40575 | UI renderer/controller |
| [Rationalisation import controller](individual-templates/rationalisation-import-controller/TEMPLATE-BRIEF.md) | `applyEnvironmentRationalisationImportRows(...)` | `app/src/app.js` | 36850-36873 | UI renderer/controller |
| [Rationalisation import controller](individual-templates/rationalisation-import-controller/TEMPLATE-BRIEF.md) | `refreshProposedTopologyDiagrams(...)` | `app/src/app.js` | 36905-36910 | UI renderer/controller |
| [Environment evidence matrix](individual-templates/environment-evidence-matrix/TEMPLATE-BRIEF.md) | `renderCollectionEvidenceMatrix(...)` | `app/src/app.js` | 8162-8187 | UI renderer/controller |
| [Environment evidence matrix](individual-templates/environment-evidence-matrix/TEMPLATE-BRIEF.md) | `getCollectionEvidenceGroups(...)` | `app/src/app.js` | 8949-8982 | UI renderer/controller |
| [Environment evidence matrix](individual-templates/environment-evidence-matrix/TEMPLATE-BRIEF.md) | `getEvidenceGroupStatus(...)` | `app/src/app.js` | 9012-9016 | UI renderer/controller |
| [Evidence progress bar](individual-templates/evidence-progress-bar/TEMPLATE-BRIEF.md) | `renderCollectionEvidenceProgressBar(...)` | `app/src/app.js` | 8890-8910 | UI renderer/controller |
| [Evidence progress bar](individual-templates/evidence-progress-bar/TEMPLATE-BRIEF.md) | `formatEvidenceProgressPercent(...)` | `app/src/app.js` | 8912-8916 | UI renderer/controller |
| [Evidence status icon](individual-templates/evidence-status-icon/TEMPLATE-BRIEF.md) | `renderEvidenceStatusIcon(...)` | `app/src/app.js` | 9018-9022 | UI renderer/controller |
| [Environment evidence task list](individual-templates/environment-evidence-task-list/TEMPLATE-BRIEF.md) | `renderEnvironmentTaskList(...)` | `app/src/app.js` | 9024-9033 | UI renderer/controller |
| [Evidence review page](individual-templates/evidence-review-page/TEMPLATE-BRIEF.md) | `renderEvidenceReview(...)` | `app/src/app.js` | 10151-10206 | UI renderer/controller |
| [Evidence review page](individual-templates/evidence-review-page/TEMPLATE-BRIEF.md) | `getEvidenceReviewDocumentsForBu(...)` | `app/src/app.js` | 10447-10479 | UI renderer/controller |
| [Evidence review page](individual-templates/evidence-review-page/TEMPLATE-BRIEF.md) | `getEvidenceReviewAppArtifactsForBu(...)` | `app/src/app.js` | 10510-10624 | UI renderer/controller |
| [Evidence review row](individual-templates/evidence-review-row/TEMPLATE-BRIEF.md) | `renderEvidenceReviewRow(...)` | `app/src/app.js` | 10208-10250 | UI renderer/controller |
| [Evidence review row](individual-templates/evidence-review-row/TEMPLATE-BRIEF.md) | `createEvidenceReviewArtifact(...)` | `app/src/app.js` | 10626-10642 | UI renderer/controller |
| [Evidence review row](individual-templates/evidence-review-row/TEMPLATE-BRIEF.md) | `normaliseEvidenceReviewState(...)` | `app/src/app.js` | 10644-10654 | UI renderer/controller |
| [Evidence review modal](individual-templates/evidence-review-modal/TEMPLATE-BRIEF.md) | `renderEvidenceReviewModal(...)` | `app/src/app.js` | 10301-10445 | UI renderer/controller |
| [Evidence review modal](individual-templates/evidence-review-modal/TEMPLATE-BRIEF.md) | `wireEvidenceReviewActions(...)` | `app/src/app.js` | 35961-36090 | UI renderer/controller |
| [Evidence review modal](individual-templates/evidence-review-modal/TEMPLATE-BRIEF.md) | `validateEvidenceReviewModalForm(...)` | `app/src/app.js` | 36092-36104 | UI renderer/controller |
| [Evidence follow-up summary](individual-templates/evidence-follow-up-summary/TEMPLATE-BRIEF.md) | `renderEvidenceReviewFollowUpSummary(...)` | `app/src/app.js` | 10252-10261 | UI renderer/controller |
| [Evidence follow-up summary](individual-templates/evidence-follow-up-summary/TEMPLATE-BRIEF.md) | `renderEvidenceReviewBuAnswer(...)` | `app/src/app.js` | 10263-10282 | UI renderer/controller |
| [BU report editor page](individual-templates/bu-report-editor-page/TEMPLATE-BRIEF.md) | `renderBuTechReportInput(...)` | `app/src/app.js` | 22817-22843 | UI renderer/controller |
| [BU report editor page](individual-templates/bu-report-editor-page/TEMPLATE-BRIEF.md) | `getBuTechReportModel(...)` | `app/src/app.js` | 22845-22892 | UI renderer/controller |
| [BU report section editor](individual-templates/bu-report-section-editor/TEMPLATE-BRIEF.md) | `renderBuTechReportInputSection(...)` | `app/src/app.js` | 23066-23105 | UI renderer/controller |
| [BU report section editor](individual-templates/bu-report-section-editor/TEMPLATE-BRIEF.md) | `renderBuTechReportSectionEditableContent(...)` | `app/src/app.js` | 23131-23170 | UI renderer/controller |
| [BU report section editor](individual-templates/bu-report-section-editor/TEMPLATE-BRIEF.md) | `getBuTechReportTaskUrl(...)` | `app/src/app.js` | 23107-23119 | UI renderer/controller |
| [BU report summary table](individual-templates/bu-report-summary-table/TEMPLATE-BRIEF.md) | `renderBuTechReportSummaryTable(...)` | `app/src/app.js` | 23221-23262 | UI renderer/controller |
| [BU report summary table](individual-templates/bu-report-summary-table/TEMPLATE-BRIEF.md) | `renderBuTechReportEvidenceLinks(...)` | `app/src/app.js` | 23397-23408 | UI renderer/controller |
| [BU report state tabs](individual-templates/bu-report-tabs/TEMPLATE-BRIEF.md) | `renderBuTechReportTabs(...)` | `app/src/app.js` | 24780-24795 | UI renderer/controller |
| [BU report state tabs](individual-templates/bu-report-tabs/TEMPLATE-BRIEF.md) | `getBuTechReportTabHref(...)` | `app/src/app.js` | 24770-24778 | UI renderer/controller |
| [Complete BU report read view](individual-templates/bu-report-read-view/TEMPLATE-BRIEF.md) | `renderBuTechReport(...)` | `app/src/app.js` | 24728-24762 | UI renderer/controller |
| [Complete BU report read view](individual-templates/bu-report-read-view/TEMPLATE-BRIEF.md) | `renderBuTechReportClientReport(...)` | `app/src/app.js` | 26707-26745 | UI renderer/controller |
| [Complete BU report read view](individual-templates/bu-report-read-view/TEMPLATE-BRIEF.md) | `renderBuTechReportClientSection(...)` | `app/src/app.js` | 26747-26758 | UI renderer/controller |
| [Decision page layout](individual-templates/decision-page-layout/TEMPLATE-BRIEF.md) | `renderDecisionPage(...)` | `app/src/app.js` | 4407-4438 | UI renderer/controller |
| [Decision recommendation panel](individual-templates/decision-recommendation-panel/TEMPLATE-BRIEF.md) | `renderDecisionCgiRecommendationPanel(...)` | `app/src/app.js` | 27071-27097 | UI renderer/controller |
| [Decision recommendation panel](individual-templates/decision-recommendation-panel/TEMPLATE-BRIEF.md) | `renderDecisionCgiRecommendationRows(...)` | `app/src/app.js` | 27099-27113 | UI renderer/controller |
| [Decision recommendation panel](individual-templates/decision-recommendation-panel/TEMPLATE-BRIEF.md) | `getDecisionReadinessSignal(...)` | `app/src/app.js` | 27141-27150 | UI renderer/controller |
| [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md) | `renderDecisionScenarioConfigurator(...)` | `app/src/app.js` | 27663-27678 | UI renderer/controller |
| [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md) | `renderDecisionScenarioBu(...)` | `app/src/app.js` | 27680-27697 | UI renderer/controller |
| [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md) | `renderDecisionProductControl(...)` | `app/src/app.js` | 27699-27748 | UI renderer/controller |
| [Decision scenario configurator](individual-templates/decision-scenario-configurator/TEMPLATE-BRIEF.md) | `getDecisionScenarioSummary(...)` | `app/src/app.js` | 26933-27021 | UI renderer/controller |
| [Decision savings progression chart](individual-templates/decision-savings-chart/TEMPLATE-BRIEF.md) | `renderDecisionPrimaryChart(...)` | `app/src/app.js` | 27293-27303 | UI renderer/controller |
| [Decision savings progression chart](individual-templates/decision-savings-chart/TEMPLATE-BRIEF.md) | `renderDecisionSavingsChartSvg(...)` | `app/src/app.js` | 27327-27400 | UI renderer/controller |
| [Decision savings progression chart](individual-templates/decision-savings-chart/TEMPLATE-BRIEF.md) | `renderDecisionPrimaryChartLegend(...)` | `app/src/app.js` | 27305-27312 | UI renderer/controller |
| [Decision waterfall chart](individual-templates/decision-waterfall-chart/TEMPLATE-BRIEF.md) | `renderDecisionWaterfallChart(...)` | `app/src/app.js` | 27450-27521 | UI renderer/controller |
| [Decision waterfall chart](individual-templates/decision-waterfall-chart/TEMPLATE-BRIEF.md) | `getDecisionWaterfallSteps(...)` | `app/src/app.js` | 27436-27448 | UI renderer/controller |
| [Decision waterfall chart](individual-templates/decision-waterfall-chart/TEMPLATE-BRIEF.md) | `renderDecisionWaterfallBuContributions(...)` | `app/src/app.js` | 27577-27594 | UI renderer/controller |
| [Decision RICE sequencing](individual-templates/decision-rice-sequencing/TEMPLATE-BRIEF.md) | `renderDecisionRiceSequencingPanel(...)` | `app/src/app.js` | 27596-27616 | UI renderer/controller |
| [Decision RICE sequencing](individual-templates/decision-rice-sequencing/TEMPLATE-BRIEF.md) | `renderDecisionRiceRows(...)` | `app/src/app.js` | 27618-27628 | UI renderer/controller |
| [Decision RICE sequencing](individual-templates/decision-rice-sequencing/TEMPLATE-BRIEF.md) | `renderDecisionRiceRow(...)` | `app/src/app.js` | 27638-27652 | UI renderer/controller |
| [Decision accounting overview](individual-templates/decision-accounting-overview/TEMPLATE-BRIEF.md) | `renderDecisionAccountingOverview(...)` | `app/src/app.js` | 27750-27778 | UI renderer/controller |
| [Decision accounting overview](individual-templates/decision-accounting-overview/TEMPLATE-BRIEF.md) | `renderDecisionAccountingBars(...)` | `app/src/app.js` | 27780-27786 | UI renderer/controller |
| [Decision accounting overview](individual-templates/decision-accounting-overview/TEMPLATE-BRIEF.md) | `renderDecisionSavingsSummaryTable(...)` | `app/src/app.js` | 27829-27842 | UI renderer/controller |
| [Decision artifact hub](individual-templates/decision-artifact-hub/TEMPLATE-BRIEF.md) | `renderDecisionArtifactHub(...)` | `app/src/app.js` | 27925-27975 | UI renderer/controller |
| [Decision artifact hub](individual-templates/decision-artifact-hub/TEMPLATE-BRIEF.md) | `renderDecisionArtifactsTable(...)` | `app/src/app.js` | 27977-28004 | UI renderer/controller |
| [Decision artifact hub](individual-templates/decision-artifact-hub/TEMPLATE-BRIEF.md) | `renderDecisionTableSection(...)` | `app/src/app.js` | 27882-27887 | UI renderer/controller |
| [ADF lineage explorer](individual-templates/adf-lineage-explorer/TEMPLATE-BRIEF.md) | `getAdfLineageModel(...)` | `app/src/app.js` | 11543-11770 | UI renderer/controller |
| [ADF lineage explorer](individual-templates/adf-lineage-explorer/TEMPLATE-BRIEF.md) | `renderAdfLineageExplorer(...)` | `app/src/app.js` | 11983-12014 | UI renderer/controller |
| [ADF lineage explorer](individual-templates/adf-lineage-explorer/TEMPLATE-BRIEF.md) | `renderAdfLineageExplorerLaunch(...)` | `app/src/app.js` | 12016-12031 | UI renderer/controller |
| [ADF lineage touchpoint map](individual-templates/adf-lineage-touchpoint-map/TEMPLATE-BRIEF.md) | `renderAdfLineageTouchpointMap(...)` | `app/src/app.js` | 12419-12496 | UI renderer/controller |
| [ADF lineage touchpoint map](individual-templates/adf-lineage-touchpoint-map/TEMPLATE-BRIEF.md) | `buildAdfPipelineTouchpointGraph(...)` | `app/src/app.js` | 12498-12601 | UI renderer/controller |
| [ADF full lineage map](individual-templates/adf-lineage-map/TEMPLATE-BRIEF.md) | `renderAdfLineageMap(...)` | `app/src/app.js` | 12690-12737 | UI renderer/controller |
| [ADF full lineage map](individual-templates/adf-lineage-map/TEMPLATE-BRIEF.md) | `getAdfLineageLayout(...)` | `app/src/app.js` | 12739-12757 | UI renderer/controller |
| [ADF full lineage map](individual-templates/adf-lineage-map/TEMPLATE-BRIEF.md) | `dedupeAdfLineageEdges(...)` | `app/src/app.js` | 12784-12792 | UI renderer/controller |
| [Lineage caveat panel](individual-templates/lineage-caveat-panel/TEMPLATE-BRIEF.md) | `getAdfLineageCaveats(...)` | `app/src/app.js` | 12794-12799 | UI renderer/controller |
| [DORA dashboard](individual-templates/dora-dashboard/TEMPLATE-BRIEF.md) | `renderDoraMetricsReport(...)` | `docs/reports/interactive-system-map.html` | 8102-8150 | System Map UI renderer |
| [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md) | `renderDoraMetricCard(...)` | `docs/reports/interactive-system-map.html` | 8152-8171 | System Map UI renderer |
| [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md) | `doraGaugeModel(...)` | `docs/reports/interactive-system-map.html` | 8173-8191 | System Map UI renderer |
| [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md) | `doraMetricBoundaryDefaults(...)` | `docs/reports/interactive-system-map.html` | 8220-8246 | System Map UI renderer |
| [DORA metric card and gauge](individual-templates/dora-metric-card/TEMPLATE-BRIEF.md) | `doraBandForMetric(...)` | `docs/reports/interactive-system-map.html` | 8248-8255 | System Map UI renderer |
| [DORA supporting-stat table](individual-templates/dora-supporting-stat-table/TEMPLATE-BRIEF.md) | `renderDoraStatTable(...)` | `docs/reports/interactive-system-map.html` | 8208-8218 | System Map UI renderer |
| [DORA supporting-stat table](individual-templates/dora-supporting-stat-table/TEMPLATE-BRIEF.md) | `doraMissingDataSummary(...)` | `docs/reports/interactive-system-map.html` | 8288-8296 | System Map UI renderer |
| [DORA metric data builder](individual-templates/dora-metric-builder/TEMPLATE-BRIEF.md) | `buildDoraMetrics(...)` | `server/lib/dora-metrics.js` | 40-244 | DORA data-model builder |
| [Test coverage dashboard](individual-templates/test-coverage-dashboard/TEMPLATE-BRIEF.md) | `testTelemetryMetrics(...)` | `docs/reports/interactive-system-map.html` | 7664-7666 | System Map UI renderer |
| [Test coverage dashboard](individual-templates/test-coverage-dashboard/TEMPLATE-BRIEF.md) | `renderTestTelemetryReport(...)` | `docs/reports/interactive-system-map.html` | 7730-7788 | System Map UI renderer |
| [Test coverage map](individual-templates/test-coverage-map/TEMPLATE-BRIEF.md) | `renderTestCoverageDiagram(...)` | `docs/reports/interactive-system-map.html` | 7790-7827 | System Map UI renderer |
| [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md) | `buildRepoQualityMetrics(...)` | `server/lib/repo-quality-metrics.js` | 181-215 | Test and quality telemetry builder |
| [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md) | `buildTestCoverageAreas(...)` | `server/lib/repo-quality-metrics.js` | 998-1013 | Test and quality telemetry builder |
| [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md) | `testSuite(...)` | `server/lib/repo-quality-metrics.js` | 941-952 | Test and quality telemetry builder |
| [Test telemetry data builder](individual-templates/test-telemetry-builder/TEMPLATE-BRIEF.md) | `coverageArea(...)` | `server/lib/repo-quality-metrics.js` | 1015-1017 | Test and quality telemetry builder |
