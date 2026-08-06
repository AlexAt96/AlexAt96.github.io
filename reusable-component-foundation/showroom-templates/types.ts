import type { ScenarioId } from "../../scenarios";

export type DemoMode = "default" | "empty" | "readonly";

export type TemplateKey =
  | "dashboard"
  | "gantt"
  | "workQueue"
  | "charts"
  | "compactCharts"
  | "kanban"
  | "editableDataTable"
  | "readOnlyDataTable"
  | "csvImportExport"
  | "configurationForm"
  | "confirmationHandoff"
  | "reportReviewFeedback"
  | "questionnaire"
  | "resultsStatistics"
  | "branchChart"
  | "calculator"
  | "flowDiagram"
  | "structureDiagram"
  | "evidenceMatrix"
  | "evidenceTaskList"
  | "reviewList"
  | "finalReport"
  | "costScenario"
  | "dataLineage"
  | "operationalReports"
  | "testRuns";

export interface TemplateProps {
  mode: DemoMode;
  resetToken: number;
  scenarioId?: ScenarioId;
}

export interface TemplateEvent {
  type: "change" | "save" | "submit" | "export" | "navigate";
  message: string;
}
