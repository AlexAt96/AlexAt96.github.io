import type { TemplateKey } from "./templates/types";
import {
  compassPatternComponentNames,
  compassPatternSourceFiles,
  type CompassPattern,
} from "./patternCatalogue";

export type PatternTechnicalProfile = {
  behaviour: readonly string[];
  accessibility: readonly string[];
};

export const compassAdapterEvents = ["onChange", "onSave", "onSubmit", "onNavigate", "onExport"] as const;

export const compassPatternTechnicalProfiles: Readonly<Record<TemplateKey, PatternTechnicalProfile>> = {
  dashboard: {
    behaviour: ["Summarises health, KPIs, trends and priority work without hiding source detail.", "Keeps populated, empty and completed views on the same stable information hierarchy.", "Treats drill-down navigation and exports as adapter events."],
    accessibility: ["KPI labels and values remain text, rather than being encoded by colour alone.", "Trend graphics include a readable label or equivalent data summary.", "Dashboard regions use headings that preserve a useful reading order."],
  },
  gantt: {
    behaviour: ["Moves and resizes tasks while preserving date bounds and dependencies.", "Keeps save, undo and imported-plan state explicit.", "Separates plan persistence from pointer and keyboard interactions."],
    accessibility: ["Task names, dates, owners and dependencies remain available outside the visual bars.", "Drag handles have labelled keyboard-operable alternatives.", "Save, validation and undo results are announced in text."],
  },
  workQueue: {
    behaviour: ["Filters, assigns and progresses work without losing the active selection.", "Maintains visible counts as filters and statuses change.", "Emits item-level changes for the host application to persist."],
    accessibility: ["Filter controls have explicit names and preserve a predictable tab order.", "Status is written in text as well as shown with a tone.", "Row actions identify the affected work item in their accessible name."],
  },
  charts: {
    behaviour: ["Renders line, bar, pie, distribution and waterfall views from labelled series.", "Handles empty, single-series and multi-series datasets.", "Keeps legends and export behaviour outside the drawing primitive."],
    accessibility: ["Every chart has a concise accessible name and a textual data equivalent.", "Legend labels do not rely on colour alone.", "Decorative grid lines and shapes stay out of the accessibility tree."],
  },
  compactCharts: {
    behaviour: ["Uses the same chart contracts as the comfortable layout at a denser card size.", "Preserves labels, legends and empty states when horizontal space is constrained.", "Allows the host to choose density without reshaping its data."],
    accessibility: ["Compact layout never removes the chart title or current value.", "A textual data equivalent remains available at every breakpoint.", "Touch and keyboard targets retain a usable minimum size."],
  },
  kanban: {
    behaviour: ["Switches between board and list views over one task collection.", "Filters by owner or phase and moves cards between status columns.", "Recomputes visible counts after every filter or status change."],
    accessibility: ["Board and list controls expose their selected state.", "Moving a card has a labelled non-drag action and a textual result.", "Empty columns remain named so the workflow structure is understandable."],
  },
  editableDataTable: {
    behaviour: ["Adds, copies, removes, filters, imports and exports editable rows.", "Validates cells and rows before save or export.", "Keeps locked rows immutable while retaining them in context."],
    accessibility: ["Headers remain programmatically associated with editable cells.", "Validation messages identify both the row and field in error.", "Add, copy and remove actions name the row they affect."],
  },
  readOnlyDataTable: {
    behaviour: ["Searches, sorts and exports a locked record set.", "Preserves a useful empty result when filters match no rows.", "Keeps pagination and filter state independent from the data source."],
    accessibility: ["Sort buttons expose direction through aria-sort or equivalent text.", "Search results and empty results are announced.", "Tabular headers remain associated with every data cell."],
  },
  csvImportExport: {
    behaviour: ["Guides template download, upload, mapping, validation, review and export in order.", "Blocks progression while required mappings or row errors remain.", "Returns approved rows through an adapter instead of writing directly to storage."],
    accessibility: ["Each numbered step retains a visible label and current-step state.", "File selection uses a native input with a persistent label.", "Mapping errors, progress and import results are announced in text."],
  },
  configurationForm: {
    behaviour: ["Groups typed configuration fields and validates them before save.", "Supports editing, saving, saved, invalid and locked states.", "Leaves secrets, persistence and server validation to the host adapter."],
    accessibility: ["Every control has a persistent label and useful error association.", "Required, invalid and locked states are exposed programmatically.", "Save progress and results are announced without moving focus."],
  },
  confirmationHandoff: {
    behaviour: ["Coordinates provider and verifier checklists through a two-person handoff.", "Records testing, returned issues and final verification as explicit stages.", "Keeps history append-only at the UI boundary."],
    accessibility: ["Actor, stage and checklist status are always written in text.", "Actions identify whether they apply to the provider or verifier.", "Stage changes are announced while focus remains on the initiating action."],
  },
  reportReviewFeedback: {
    behaviour: ["Supports requesting changes, responding, resolving and reopening feedback.", "Links every thread to a document section and actor.", "Keeps author and reviewer views over one feedback model."],
    accessibility: ["Review views use tab semantics with keyboard navigation.", "Thread status is textual and not colour-only.", "Composer errors and resolution changes are announced."],
  },
  questionnaire: {
    behaviour: ["Moves through a typed multi-step question definition.", "Validates required answers before progression and supports draft submission.", "Renders a locked response review from the same answer model."],
    accessibility: ["Step names and progress remain visible and programmatically determinable.", "Questions use native labels, fieldsets and error associations.", "Validation focuses or links to the first invalid answer."],
  },
  resultsStatistics: {
    behaviour: ["Keeps summary metrics, distributions and a filterable results table in sync.", "Retains the summary when a filter produces no rows.", "Exports the filtered result through the adapter boundary."],
    accessibility: ["Charts have text summaries and table equivalents.", "Filter result counts are announced.", "Table sorting and row links use descriptive accessible names."],
  },
  branchChart: {
    behaviour: ["Displays pipeline activities, dependencies and fan-in paths across lanes.", "Switches between graph and complexity views without changing the definition.", "Opens step detail from a stable selected activity."],
    accessibility: ["Activities and dependencies have readable text equivalents.", "Graph nodes are keyboard focusable in a logical sequence.", "Selected activity and view state are announced."],
  },
  calculator: {
    behaviour: ["Recalculates derived totals and bands as factor options change.", "Keeps evidence and contribution detail beside the score.", "Emits a complete assessment only when required factors are valid."],
    accessibility: ["Inputs have labels, units and current values.", "Score changes are announced without relying on animated graphics.", "Bands include descriptive text as well as colour."],
  },
  flowDiagram: {
    behaviour: ["Renders current-to-target nodes, connected paths and migration actions.", "Supports focus, path highlighting, collapse and reset controls.", "Keeps layout coordinates separate from domain records."],
    accessibility: ["Nodes and relationships have a structured text alternative.", "Focus and selected-path state are programmatically exposed.", "Pan, zoom, collapse and reset controls have explicit labels."],
  },
  structureDiagram: {
    behaviour: ["Renders hierarchy, promotion and backfill relationships.", "Filters and collapses branches while retaining the selected node.", "Separates topology data from computed layout."],
    accessibility: ["Hierarchy level and relationship direction are available in text.", "Nodes support keyboard selection in a predictable order.", "Collapsed state and selection changes are announced."],
  },
  evidenceMatrix: {
    behaviour: ["Cross-references environments, requirements and evidence status.", "Calculates progress across configurable columns.", "Links status cells to source evidence without embedding navigation logic."],
    accessibility: ["Row and column headers identify every matrix cell.", "Status icons include equivalent text.", "Progress values and missing evidence are announced clearly."],
  },
  evidenceTaskList: {
    behaviour: ["Turns missing evidence into owned, due and progressable tasks.", "Filters by owner, due state and completion.", "Emits task and evidence-link changes for persistence."],
    accessibility: ["Every task action names its task.", "Due, owner and status values remain textual.", "Filter result counts and status changes are announced."],
  },
  reviewList: {
    behaviour: ["Filters review artifacts by status, confidence and environment.", "Captures notes, follow-up questions, answers and resolution.", "Keeps upload versions and human decisions traceable."],
    accessibility: ["Confidence and review status are expressed in text.", "Follow-up controls are associated with the active artifact.", "Resolution and filter changes are announced."],
  },
  finalReport: {
    behaviour: ["Composes source-linked report sections into an author and reviewer workflow.", "Gates finalisation on approvals and resolved feedback.", "Exports the final lifecycle, sections and evidence metadata."],
    accessibility: ["Author and reviewer modes expose their selected state.", "Section navigation follows the report heading hierarchy.", "Approval, feedback and finalisation results are announced."],
  },
  costScenario: {
    behaviour: ["Recalculates cost, savings, readiness and recommendation as options change.", "Switches between progression and waterfall views over one scenario.", "Supports save, restore and export without owning persistence."],
    accessibility: ["Currency, signs and units are present in text.", "Charts include concise accessible labels and tabular values.", "Recommendation and save state changes are announced."],
  },
  dataLineage: {
    behaviour: ["Filters a node and edge graph by pipeline and selected relationship.", "Traces every upstream path to a chosen output.", "Exports source evidence independently from pan and zoom state."],
    accessibility: ["Nodes and edges are keyboard selectable with descriptive names.", "A structured inventory provides an equivalent to the spatial graph.", "Zoom, selection and trace results are announced."],
  },
  operationalReports: {
    behaviour: ["Calculates DORA-style metrics from scoped delivery and incident events.", "Filters by status while preserving provenance and missing-data context.", "Keeps metric calculation separate from presentation."],
    accessibility: ["Metric value, band and provenance are readable text.", "Gauges do not rely on angle or colour alone.", "Filter and missing-data results are announced."],
  },
  testRuns: {
    behaviour: ["Summarises suites, telemetry, coverage areas and visible gaps.", "Switches between coverage map and run telemetry views.", "Links evidence paths through host-provided navigation."],
    accessibility: ["Coverage percentages, run results and gaps are written in text.", "View controls expose their selected state.", "Tables and coverage visuals retain a logical keyboard reading order."],
  },
};

const examplePayloads: Readonly<Record<TemplateKey, Record<string, unknown>>> = {
  dashboard: { metrics: [{ id: "readiness", label: "Readiness", value: 72, unit: "%", trend: 8 }], phaseHealth: [{ id: "discovery", label: "Discovery", status: "In progress", progress: 72 }], priorityItems: [{ id: "task-18", title: "Resolve evidence gaps", owner: "Assurance team", status: "At risk" }] },
  gantt: { weeks: ["2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24"], tasks: [{ id: "design", label: "Solution design", owner: "Architecture", startWeek: 0, endWeek: 2, status: "In progress" }], dependencies: [{ from: "design", to: "review", type: "finish-to-start" }] },
  workQueue: { filters: { owner: "All owners", status: "Open" }, items: [{ id: "work-104", title: "Review architecture evidence", owner: "M. Jones", status: "In review", dueDate: "2026-08-12" }] },
  charts: { series: [{ id: "readiness", label: "Readiness", points: [{ label: "May", value: 42 }, { label: "Jun", value: 58 }, { label: "Jul", value: 72 }] }], legend: [{ seriesId: "readiness", label: "Readiness", tone: "primary" }] },
  compactCharts: { cards: [{ id: "coverage", label: "Evidence coverage", value: 84, unit: "%", change: 6, status: "Improving" }], comparisonPeriod: "Previous 30 days" },
  kanban: { columns: [{ id: "not-started", label: "Not started" }, { id: "in-progress", label: "In progress" }, { id: "review", label: "In review" }], cards: [{ id: "task-18", title: "Map control evidence", owner: "Assurance", phase: "Discovery", status: "in-progress" }] },
  editableDataTable: { columns: [{ key: "label", label: "Item", type: "text", required: true }, { key: "included", label: "Included", type: "boolean", required: false }], rows: [{ id: "item-1", label: "Discovery summary", included: true, locked: false }], validationErrors: [] },
  readOnlyDataTable: { columns: [{ key: "label", label: "Record", sortable: true }, { key: "status", label: "Status", sortable: true }], rows: [{ id: "record-1", label: "Architecture review", owner: "Technical reviewer", status: "In review", updated: "2026-08-04" }], page: { index: 1, size: 25, total: 1 } },
  csvImportExport: { step: "mapping", sourceColumns: ["Control", "Owner", "Status"], mappings: { Control: "controlName", Owner: "owner", Status: "status" }, previewRows: [{ controlName: "Access review", owner: "Security", status: "Ready" }], validationErrors: [] },
  configurationForm: { fields: [{ id: "workspace", label: "Workspace", type: "text", required: true }, { id: "retention", label: "Retention days", type: "number", required: true }], values: { workspace: "assurance-prod", retention: 90 }, state: "Editing" },
  confirmationHandoff: { stage: "Ready to verify", provider: { name: "Delivery lead", checklist: [{ id: "access", label: "Access granted", complete: true }] }, verifier: { name: "Assurance reviewer", checklist: [{ id: "test", label: "Access tested", complete: false }] }, history: [] },
  reportReviewFeedback: { document: { id: "RPT-001", version: 3 }, threads: [{ id: "feedback-7", section: "Executive summary", status: "Changes requested", messages: [{ actor: "Reviewer", body: "Link the recommendation to its evidence.", timestamp: "2026-08-06T09:30:00Z" }] }] },
  questionnaire: { currentStep: "scope", steps: [{ id: "scope", title: "Scope", questions: [{ id: "service", label: "Service name", type: "text", required: true }] }], answers: { service: "Customer portal" }, submissionStatus: "Draft" },
  resultsStatistics: { summary: { total: 128, complete: 103, warning: 19, blocked: 6 }, distribution: [{ label: "Complete", value: 103 }, { label: "Warning", value: 19 }, { label: "Blocked", value: 6 }], rows: [{ id: "result-1", label: "Access controls", status: "Complete", owner: "Security" }] },
  branchChart: { pipeline: { id: "customer-insight", name: "Customer insight daily" }, activities: [{ id: "extract", name: "Extract orders", kind: "Copy", level: 0 }, { id: "publish", name: "Publish model", kind: "Sink", level: 1 }], dependencies: [{ from: "extract", to: "publish" }] },
  calculator: { assessmentId: "assessment-42", factors: [{ id: "interfaces", label: "Interfaces", option: "4–7", score: 3 }, { id: "data", label: "Data complexity", option: "Medium", score: 2 }], total: 5, sizeBand: "Medium", complexityBand: "Moderate" },
  flowDiagram: { nodes: [{ id: "current-dev", label: "Current development", lane: "Current", status: "Assess" }, { id: "target-nonprod", label: "Target non-production", lane: "Target", status: "Proposed" }], edges: [{ from: "current-dev", to: "target-nonprod", label: "Migrate" }], selectedId: "current-dev" },
  structureDiagram: { nodes: [{ id: "nonprod", label: "Non-production", level: 0 }, { id: "preprod", label: "Pre-production", level: 1 }, { id: "prod", label: "Production", level: 2 }], edges: [{ from: "nonprod", to: "preprod", relation: "promotes-to" }, { from: "preprod", to: "prod", relation: "promotes-to" }] },
  evidenceMatrix: { columns: [{ id: "design", label: "Design evidence" }, { id: "security", label: "Security evidence" }], rows: [{ id: "customer-portal", label: "Customer portal", cells: { design: "Complete", security: "Missing" }, progress: 50 }] },
  evidenceTaskList: { filters: { owner: "All owners", status: "Open" }, tasks: [{ id: "evidence-14", title: "Add threat-model link", owner: "Security", dueDate: "2026-08-14", status: "In progress", evidenceHref: null }] },
  reviewList: { filters: { status: "Needs review", confidence: "All" }, artifacts: [{ id: "finding-18", title: "Security ownership is not assigned", version: 2, status: "Needs review", confidence: 0.96, environmentTags: ["Production"], notes: [] }] },
  finalReport: { lifecycle: "In review", sections: [{ id: "executive-summary", title: "Executive summary", body: "The change is feasible with controlled transition.", sourceTaskIds: ["task-18"], reviewStatus: "Approved" }], feedback: [], approvals: [{ role: "Technical reviewer", status: "Pending" }] },
  costScenario: { scope: "programme", options: [{ id: "retain", name: "Retain current estate", action: "Retain", included: true, readiness: "High", fiveYearNetSaving: 180000 }], summary: { benefit: 420000, changeCost: 160000, net: 260000, recommendation: "Proceed with conditions" } },
  dataLineage: { nodes: [{ id: "orders", label: "Order database", lane: "Source", owner: "Commerce", status: "Observed" }, { id: "customer-model", label: "Customer model", lane: "Product", owner: "Data platform", status: "Observed" }], edges: [{ from: "orders", to: "customer-model", label: "Customer transform", status: "Observed" }] },
  operationalReports: { serviceScope: "Customer portal", metrics: [{ id: "deployment-frequency", label: "Deployment frequency", value: 4.2, unit: "per week", band: "High", confidence: "Complete" }], period: { from: "2026-07-01", to: "2026-07-31" }, missingData: [] },
  testRuns: { summary: { suites: 18, passing: 16, failing: 2, coverage: 84 }, suites: [{ id: "accessibility", label: "Accessibility regression", result: "Passing", cadence: "Every pull request", evidencePath: "/evidence/a11y/latest" }], coverageAreas: [{ id: "forms", label: "Forms", covered: 91, gaps: 2 }] },
};

function pascalCase(value: string) {
  return value.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join("");
}

function typeFor(value: unknown, depth = 0): string {
  if (value === null) return "unknown | null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return value.length ? `ReadonlyArray<${typeFor(value[0], depth + 1)}>` : "ReadonlyArray<unknown>";
  if (typeof value === "object") {
    const indent = "  ".repeat(depth + 1);
    const closing = "  ".repeat(depth);
    const fields = Object.entries(value as Record<string, unknown>).map(([key, entry]) => `${indent}${JSON.stringify(key)}: ${typeFor(entry, depth + 1)};`);
    return `{\n${fields.join("\n")}\n${closing}}`;
  }
  return "unknown";
}

export function createCompassPatternExampleData(pattern: CompassPattern) {
  return {
    schemaVersion: "1.0",
    pattern: {
      id: pattern.id,
      title: pattern.title,
      templateKey: pattern.templateKey,
      component: compassPatternComponentNames[pattern.templateKey],
    },
    view: { mode: "default", scenarioId: "base", resetToken: 0 },
    data: examplePayloads[pattern.templateKey],
    supportedStates: pattern.states,
  };
}

export function createCompassPatternApi(pattern: CompassPattern) {
  const name = pascalCase(pattern.id);
  const componentName = compassPatternComponentNames[pattern.templateKey];
  const sourceFile = compassPatternSourceFiles[pattern.templateKey].replace(/\.tsx$/, "");
  const dataType = typeFor(examplePayloads[pattern.templateKey]);

  return `import { useState } from "react";
import { ${componentName} } from "./${sourceFile}";

export type DemoMode = "default" | "empty" | "readonly";
export type ScenarioId = "base" | "dcc-hackathon";

// Exact props accepted by the supplied interactive reference source.
export interface TemplateProps {
  mode: DemoMode;
  resetToken: number;
  scenarioId?: ScenarioId;
}

export type ${name}Data = ${dataType};

// Recommended product adapter: keep I/O outside the visual component.
export interface ${name}AdapterProps {
  data: ${name}Data;
  mode?: DemoMode;
  readOnly?: boolean;
  onChange?: (next: ${name}Data) => void;
  onSave?: (next: ${name}Data) => Promise<void> | void;
  onSubmit?: (next: ${name}Data) => Promise<void> | void;
  onNavigate?: (target: string) => void;
  onExport?: (format: "json" | "csv" | "pdf") => void;
}

export function ${name}ReferenceExample() {
  const [resetToken, setResetToken] = useState(0);

  return (
    <section aria-label=${JSON.stringify(`${pattern.title} example`)}>
      <${componentName}
        mode="default"
        resetToken={resetToken}
        scenarioId="base"
      />
      <button type="button" onClick={() => setResetToken((value) => value + 1)}>
        Reset example
      </button>
    </section>
  );
}

/*
 * The downloadable showroom source keeps safe fixture data inside the
 * reference component. When productising it, move that fixture behind the
 * ${name}AdapterProps.data boundary above and connect persistence, routing,
 * analytics and network calls in the host application.
 */`;
}
