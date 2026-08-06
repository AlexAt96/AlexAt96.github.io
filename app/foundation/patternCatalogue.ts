import catalogueJson from "../../public/reusable-component-foundation/component-catalogue.json";
import type { TemplateKey } from "./templates/types";

type SourceCatalogueItem = (typeof catalogueJson.components)[number];

export type CompassPattern = {
  id: string;
  sourceId: string;
  templateKey: TemplateKey;
  title: string;
  summary: string;
  boundaries: string[];
  states: string[];
  dataContracts: string[];
};

function pattern(
  sourceKey: SourceCatalogueItem["templateKey"],
  id: string,
  templateKey: TemplateKey,
  title?: string,
  summary?: string,
  boundaries?: string[],
): CompassPattern {
  const source = catalogueJson.components.find((item) => item.templateKey === sourceKey);
  if (!source) throw new Error(`Missing source capability: ${sourceKey}`);

  return {
    id,
    sourceId: source.id,
    templateKey,
    title: title ?? source.title,
    summary: summary ?? source.summary,
    boundaries: boundaries ?? [...source.boundaries],
    states: [...source.states],
    dataContracts: [...source.dataContracts],
  };
}

export const compassPatterns: readonly CompassPattern[] = [
  pattern("dashboard", "dashboard", "dashboard", "Dashboard", "A clear overview with KPI cards, health summaries, trends and priority signals.", ["Dashboard", "KpiCard", "HealthSummary", "TrendCard"]),
  pattern("dashboard", "gantt-chart", "gantt", "Gantt chart", "A standalone planning grid with draggable dates, resizable bars, dependencies and save or undo controls.", ["PlanningGrid", "GanttBar", "DependencyLine", "PlanSettings"]),
  pattern("dashboard", "work-queue", "workQueue", "Work queue", "A focused queue for filtering, assigning and progressing work.", ["WorkQueue", "QueueRow", "OwnerFilter", "StatusAction"]),
  pattern("charts", "charts", "charts", "Charts", "Spacious line, bar, pie, distribution and waterfall chart patterns.", ["ChartGrid", "ChartCard", "ChartLegend", "AccessibleDataTable"]),
  pattern("charts", "compact-charts", "compactCharts", "Compact charts", "Dense chart cards for dashboards and narrow analytical surfaces.", ["CompactChartGrid", "ChartCard", "ChartLegend", "AccessibleDataTable"]),
  pattern("kanban", "board-and-list", "kanban", "Board and list", "Switchable board and list views with filtering, status changes and live counts."),
  pattern("tables", "editable-data-table", "editableDataTable", "Editable data table", "Add, copy, remove, validate, filter, import and export rows in one editable table.", ["EditableTable", "RowEditor", "ValidationSummary", "ImportPreview", "TableActions"]),
  pattern("tables", "read-only-data-table", "readOnlyDataTable", "Read-only data table", "A separate searchable, sortable and exportable table for locked or published records.", ["ReadOnlyTable", "TableFilter", "SortControl", "ExportAction", "EmptyTable"]),
  pattern("tables", "csv-import-export-wizard", "csvImportExport", "CSV import / export wizard", "A four-step pattern for templates, upload, column mapping, row validation, review and safe export.", ["CsvWizard", "TemplateDownload", "FileDropzone", "ColumnMapper", "RowValidation", "ExportBuilder"]),
  pattern("toolMetadata", "configuration-form", "configurationForm", "Configuration form", "A focused setup form with typed fields, validation, saved and locked states.", ["ConfigurationForm", "FieldGroup", "ValidationSummary", "SaveAction"]),
  pattern("accessConfirmation", "confirmation-handoff", "confirmationHandoff", "Confirmation handoff", "A two-person checklist for sending, testing, returning and verifying a completed handoff.", ["ConfirmationHandoff", "ProviderChecklist", "VerifierChecklist", "HandoffHistory"]),
  pattern("documentFeedback", "report-review-feedback", "reportReviewFeedback", "Report review and feedback", "A two-actor review loop for requesting changes, responding, resolving and reopening feedback.", ["ReportPreview", "FeedbackComposer", "ReviewOverview", "ResolutionAction"]),
  pattern("questionnaire", "questionnaire", "questionnaire", "Questionnaire", "A guided multi-step questionnaire with validation, draft, submit and read-only response states."),
  pattern("metadataResults", "results-statistics", "resultsStatistics", "Results statistics", "One filterable results table with persistent summary and distribution charts.", ["ResultsSummary", "StatisticsChart", "ResultsTable", "FilterBar", "ExportAction"]),
  pattern("adfPipeline", "branch-chart", "branchChart", "Branch chart", "An interactive Git-style branch and fan-in chart with step details and complexity views.", ["BranchChart", "BranchLane", "DependencyConnector", "StepDetails", "ComplexityChart"]),
  pattern("buComplexity", "calculator", "calculator", "Calculator", "A configurable scoring calculator with live totals, bands, evidence and graphical breakdowns.", ["Calculator", "FactorInput", "ScoreBand", "ContributionChart", "SaveAction"]),
  pattern("environmentRationalisation", "flow-diagram", "flowDiagram", "Flow diagram", "An interactive current-to-target flow renderer with focus, connected paths and collapse controls.", ["FlowDiagram", "FlowNode", "FlowEdge", "DiagramControls", "DetailsPanel"]),
  pattern("environmentRationalisation", "structure-diagram", "structureDiagram", "Structure diagram", "An interactive hierarchy and promotion-path renderer with focus, filtering and collapse controls.", ["StructureDiagram", "HierarchyNode", "PromotionEdge", "DiagramControls", "DetailsPanel"]),
  pattern("environmentEvidenceMatrix", "evidence-matrix", "evidenceMatrix", "Evidence matrix", "A coverage matrix with requirement, status and progress across configurable columns.", ["EvidenceMatrix", "EvidenceColumn", "EvidenceCell", "StatusIcon", "ProgressBar"]),
  pattern("environmentEvidenceMatrix", "evidence-list", "evidenceTaskList", "Evidence list", "An actionable list for missing evidence, owners, due dates and task progression.", ["EvidenceList", "TaskFilter", "TaskRow", "OwnerAction", "EvidenceLink"]),
  pattern("evidenceReviewQueue", "review-list", "reviewList", "Review list", "A filterable review list with confidence, notes, follow-up and resolution controls."),
  pattern("finalBuReport", "final-report", "finalReport", "Final report", "A composed final report with source-linked sections, lifecycle controls and approval."),
  pattern("decision", "cost-scenario-analysis", "costScenario", "Cost scenario analysis", "A live scenario calculator with configurable options, cost progression and decision outputs."),
  pattern("dataLineage", "data-lineage", "dataLineage", "Data lineage", "An interactive dependency map with complete upstream source traces, evidence and transformation paths."),
  pattern("doraMetrics", "operational-reports", "operationalReports", "Operational reports", "Operational performance reports with explicit provenance, confidence and data contracts."),
  pattern("testCoverage", "test-runs", "testRuns", "Test runs and coverage", "Interactive test runs, suite telemetry, coverage paths and visible quality gaps."),
] as const;

export const compassPatternGroups: Readonly<Record<TemplateKey, string>> = {
  dashboard: "Plan & monitor",
  gantt: "Plan & monitor",
  workQueue: "Plan & monitor",
  charts: "Visualise",
  compactCharts: "Visualise",
  kanban: "Plan & monitor",
  editableDataTable: "Collect & configure",
  readOnlyDataTable: "Collect & configure",
  csvImportExport: "Collect & configure",
  configurationForm: "Collect & configure",
  confirmationHandoff: "Evidence & review",
  reportReviewFeedback: "Evidence & review",
  questionnaire: "Collect & configure",
  resultsStatistics: "Analyse",
  branchChart: "Analyse",
  calculator: "Analyse",
  flowDiagram: "Visualise",
  structureDiagram: "Visualise",
  evidenceMatrix: "Evidence & review",
  evidenceTaskList: "Evidence & review",
  reviewList: "Evidence & review",
  finalReport: "Decide & report",
  costScenario: "Decide & report",
  dataLineage: "Visualise",
  operationalReports: "Measure quality",
  testRuns: "Measure quality",
};

export const compassPatternIcons: Readonly<Record<TemplateKey, string>> = {
  dashboard: "⌂",
  gantt: "⇥",
  workQueue: "☷",
  charts: "↗",
  compactCharts: "▥",
  kanban: "▦",
  editableDataTable: "✎",
  readOnlyDataTable: "▤",
  csvImportExport: "⇅",
  configurationForm: "⚙",
  confirmationHandoff: "✓",
  reportReviewFeedback: "◌",
  questionnaire: "?",
  resultsStatistics: "⌘",
  branchChart: "⑂",
  calculator: "∑",
  flowDiagram: "⇄",
  structureDiagram: "◇",
  evidenceMatrix: "▦",
  evidenceTaskList: "☷",
  reviewList: "◎",
  finalReport: "□",
  costScenario: "◆",
  dataLineage: "⌁",
  operationalReports: "◔",
  testRuns: "◫",
};

export const compassPatternSourceFiles: Readonly<Record<TemplateKey, string>> = {
  dashboard: "PlanningTemplates.tsx",
  gantt: "PlanningTemplates.tsx",
  workQueue: "PlanningTemplates.tsx",
  charts: "PlanningTemplates.tsx",
  compactCharts: "PlanningTemplates.tsx",
  kanban: "PlanningTemplates.tsx",
  editableDataTable: "PlanningTemplates.tsx",
  readOnlyDataTable: "PlanningTemplates.tsx",
  csvImportExport: "ImportExportCsvTemplate.tsx",
  configurationForm: "CollectionTemplates.tsx",
  confirmationHandoff: "CollectionTemplates.tsx",
  reportReviewFeedback: "CollectionTemplates.tsx",
  questionnaire: "CollectionTemplates.tsx",
  resultsStatistics: "CollectionTemplates.tsx",
  branchChart: "AnalysisTemplates.tsx",
  calculator: "AnalysisTemplates.tsx",
  flowDiagram: "AnalysisTemplates.tsx",
  structureDiagram: "AnalysisTemplates.tsx",
  evidenceMatrix: "AnalysisTemplates.tsx",
  evidenceTaskList: "AnalysisTemplates.tsx",
  reviewList: "AnalysisTemplates.tsx",
  finalReport: "OutcomeTemplates.tsx",
  costScenario: "OutcomeTemplates.tsx",
  dataLineage: "OutcomeTemplates.tsx",
  operationalReports: "OutcomeTemplates.tsx",
  testRuns: "OutcomeTemplates.tsx",
};

/** The concrete export a developer imports from the downloadable source file. */
export const compassPatternComponentNames: Readonly<Record<TemplateKey, string>> = {
  dashboard: "DashboardOverviewTemplate",
  gantt: "ProjectPlanTemplate",
  workQueue: "WorkQueueTemplate",
  charts: "ComfortableChartsTemplate",
  compactCharts: "CompactChartsTemplate",
  kanban: "KanbanTemplate",
  editableDataTable: "EditableDataTableTemplate",
  readOnlyDataTable: "ReadOnlyDataTableTemplate",
  csvImportExport: "CsvImportExportTemplate",
  configurationForm: "ConfigurationFormTemplate",
  confirmationHandoff: "ConfirmationHandoffTemplate",
  reportReviewFeedback: "ReportReviewFeedbackTemplate",
  questionnaire: "QuestionnaireTemplate",
  resultsStatistics: "ResultsStatisticsTemplate",
  branchChart: "AdfPipelineTemplate",
  calculator: "BuComplexityTemplate",
  flowDiagram: "FlowDiagramTemplate",
  structureDiagram: "StructureDiagramTemplate",
  evidenceMatrix: "EvidenceMatrixTemplate",
  evidenceTaskList: "EvidenceTaskListTemplate",
  reviewList: "EvidenceReviewTemplate",
  finalReport: "FinalBuReportTemplate",
  costScenario: "DecisionTemplate",
  dataLineage: "DataLineageTemplate",
  operationalReports: "DoraMetricsTemplate",
  testRuns: "TestCoverageTemplate",
};

/** CSS Modules follow the same family split as their React implementation. */
export const compassPatternStyleFiles: Readonly<Record<TemplateKey, string>> = Object.fromEntries(
  Object.entries(compassPatternSourceFiles).map(([key, file]) => [key, file.replace(/\.tsx$/, ".module.css")]),
) as Record<TemplateKey, string>;

export const compassPatternGroupNames = [
  "All patterns",
  ...Array.from(new Set(compassPatterns.map((item) => compassPatternGroups[item.templateKey]))),
] as const;

export function getCompassPattern(templateKey: TemplateKey) {
  return compassPatterns.find((item) => item.templateKey === templateKey);
}
