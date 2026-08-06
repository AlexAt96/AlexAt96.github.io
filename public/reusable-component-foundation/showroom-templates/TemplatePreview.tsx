"use client";

import type { ReactNode } from "react";
import type { TemplateKey, TemplateProps } from "./types";
import {
  ComfortableChartsTemplate,
  CompactChartsTemplate,
  DashboardOverviewTemplate,
  EditableDataTableTemplate,
  KanbanTemplate,
  ProjectPlanTemplate,
  ReadOnlyDataTableTemplate,
  WorkQueueTemplate,
} from "./PlanningTemplates";
import { ConfigurationFormTemplate, ConfirmationHandoffTemplate, QuestionnaireTemplate, ReportReviewFeedbackTemplate, ResultsStatisticsTemplate } from "./CollectionTemplates";
import { AdfPipelineTemplate, BuComplexityTemplate, EvidenceMatrixTemplate, EvidenceReviewTemplate, EvidenceTaskListTemplate, FlowDiagramTemplate, StructureDiagramTemplate } from "./AnalysisTemplates";
import { FinalBuReportTemplate, DecisionTemplate, DataLineageTemplate, DoraMetricsTemplate, TestCoverageTemplate } from "./OutcomeTemplates";
import { CsvImportExportTemplate } from "./ImportExportCsvTemplate";

const templates: Record<TemplateKey, (props: TemplateProps) => ReactNode> = {
  dashboard: DashboardOverviewTemplate,
  gantt: ProjectPlanTemplate,
  workQueue: WorkQueueTemplate,
  charts: ComfortableChartsTemplate,
  compactCharts: CompactChartsTemplate,
  kanban: KanbanTemplate,
  editableDataTable: EditableDataTableTemplate,
  readOnlyDataTable: ReadOnlyDataTableTemplate,
  csvImportExport: CsvImportExportTemplate,
  configurationForm: ConfigurationFormTemplate,
  confirmationHandoff: ConfirmationHandoffTemplate,
  reportReviewFeedback: ReportReviewFeedbackTemplate,
  questionnaire: QuestionnaireTemplate,
  resultsStatistics: ResultsStatisticsTemplate,
  branchChart: AdfPipelineTemplate,
  calculator: BuComplexityTemplate,
  flowDiagram: FlowDiagramTemplate,
  structureDiagram: StructureDiagramTemplate,
  evidenceMatrix: EvidenceMatrixTemplate,
  evidenceTaskList: EvidenceTaskListTemplate,
  reviewList: EvidenceReviewTemplate,
  finalReport: FinalBuReportTemplate,
  costScenario: DecisionTemplate,
  dataLineage: DataLineageTemplate,
  operationalReports: DoraMetricsTemplate,
  testRuns: TestCoverageTemplate,
};

export function TemplatePreview({ templateKey, ...props }: TemplateProps & { templateKey: TemplateKey }) {
  const Component = templates[templateKey];
  return <Component {...props} />;
}
