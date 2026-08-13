"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import dashboardSeed from "../../../public/reusable-component-foundation/individual-templates/dashboard-page/template-data.json";
import chartSeed from "../../../public/reusable-component-foundation/individual-templates/advanced-discovery-pie-chart/template-data.json";
import kanbanSeed from "../../../public/reusable-component-foundation/individual-templates/phase-kanban-board/template-data.json";
import {
  AccessibleModal,
  ActionButton,
  Badge,
  EmptyState,
  InlineNotice,
  Metric,
  Panel,
  Segmented,
  downloadJson,
  downloadText,
} from "./shared";
import type { TemplateProps } from "./types";
import styles from "./PlanningTemplates.module.css";

type PlanRow = {
  id: string;
  label: string;
  owner: string;
  startWeek: number;
  endWeek: number;
  status: string;
  dependencies: { id: string; type: string }[];
};

type TableRow = {
  id: string;
  label: string;
  category: string;
  included: boolean;
  locked: boolean;
};

type ReadOnlyRow = {
  id: string;
  label: string;
  category: string;
  owner: string;
  updated: string;
  status: "Active" | "In review" | "Complete";
  volume: number;
};

type PlanningScenarioId = NonNullable<TemplateProps["scenarioId"]>;

type DashboardCopy = {
  initialNotice: string;
  restoredNotice: string;
  emptyNotice: string;
  resetNotice: string;
  overviewEmptyTitle: string;
  overviewEmptyCopy: string;
  overviewLoadLabel: string;
  healthTitle: string;
  healthEyebrow: string;
  trendTitle: string;
  trendEyebrow: string;
  trendAriaLabel: string;
  planNoun: string;
  planEmptyTitle: string;
  planEmptyCopy: string;
  planLoadLabel: string;
  planSavedNotice: string;
  queueTitle: string;
  queueEyebrow: string;
  queueSearchLabel: string;
  queueSearchPlaceholder: string;
  queueEmptyTitle: string;
  queueEmptyCopy: string;
  queueNoMatchTitle: string;
  queueNoMatchCopy: string;
  queueItemSingular: string;
  queueItemPlural: string;
  queueExportFile: string;
  overviewSelectionSuffix: string;
  settingsTitle: string;
  settingsDescription: string;
  importTitle: string;
  importDescription: string;
  pattern: Record<"overview" | "plan" | "queue", { eyebrow: string; title: string; detail: string }>;
};

type ChartCopy = {
  emptyTitle: Record<"comfortable" | "compact", string>;
  emptyCopy: string;
  emptyAction: string;
  comfortableTitle: string;
  comfortableDetail: string;
  compactTitle: string;
  compactDetail: string;
  trendTitle: string;
  trendEyebrow: string;
  trendAccessibleTitle: string;
  trendAccessibleDescription: string;
  trendCaption: string;
  distributionTitle: string;
  distributionEyebrow: string;
  distributionAriaPrefix: string;
  distributionCaption: string;
  throughputTitle: string;
  throughputEyebrow: string;
  throughputAriaPrefix: string;
  throughputCaption: string;
  breakdownTitle: string;
  breakdownEyebrow: string;
  breakdownCaption: string;
  waterfallTitle: string;
  waterfallEyebrow: string;
  waterfallBadge: string;
  waterfallAriaPrefix: string;
  waterfallCaption: string;
};

type KanbanCopy = {
  initialNotice: string;
  resetNotice: string;
  eyebrow: string;
  title: string;
  itemNoun: string;
  ownerLabel: string;
  readonlyNotice: string;
  emptyColumnTitle: string;
  emptyColumnCopy: string;
  listTitle: string;
  listEyebrow: string;
  noOwnerMatches: string;
  navigationNoticeSuffix: string;
};

type EditableTableCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  panelTitle: string;
  panelEyebrow: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyCopy: string;
  importTitle: string;
  importDescription: string;
  importPlaceholder: string;
  exportFileName: string;
  initialNotice: string;
  restoredNotice: string;
};

type ReadOnlyTableCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  finalNotice: string;
  visibleLabel: string;
  completeLabel: string;
  categoryLabel: string;
  categoryDetail: string;
  volumeLabel: string;
  volumeDetail: string;
  panelTitle: string;
  panelEyebrow: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyCopy: string;
  loadLabel: string;
  loadedNotice: string;
  itemColumn: string;
  categoryColumn: string;
  ownerColumn: string;
  updatedColumn: string;
  statusColumn: string;
  volumeColumn: string;
  exportFileName: string;
  referenceNotice: string;
  emptyNotice: string;
};

type PlanningScenarioFixture = {
  dashboard: { seed: typeof dashboardSeed; copy: DashboardCopy };
  charts: { seed: typeof chartSeed; copy: ChartCopy };
  kanban: { seed: typeof kanbanSeed; copy: KanbanCopy };
  editableTable: { rows: TableRow[]; copy: EditableTableCopy };
  readOnlyTable: { rows: ReadOnlyRow[]; copy: ReadOnlyTableCopy };
};

const BASE_EDITABLE_TABLE_ROWS: TableRow[] = [
  { id: "item-1", label: "Discovery summary", category: "Deliverable", included: true, locked: true },
  { id: "item-2", label: "Architecture review", category: "Decision", included: true, locked: false },
  { id: "item-3", label: "Supporting evidence", category: "Evidence", included: false, locked: false },
];

const BASE_READ_ONLY_TABLE_ROWS: ReadOnlyRow[] = [
  { id: "record-1", label: "Discovery summary", category: "Deliverable", owner: "Project lead", updated: "2026-07-28", status: "Complete", volume: 18 },
  { id: "record-2", label: "Architecture review", category: "Decision", owner: "Technical reviewer", updated: "2026-07-30", status: "In review", volume: 7 },
  { id: "record-3", label: "Supporting evidence", category: "Evidence", owner: "Delivery team", updated: "2026-08-01", status: "Active", volume: 42 },
  { id: "record-4", label: "Readiness checklist", category: "Activity", owner: "Programme office", updated: "2026-08-02", status: "Complete", volume: 12 },
  { id: "record-5", label: "Outcome register", category: "Decision", owner: "Project lead", updated: "2026-08-04", status: "Active", volume: 9 },
];

const DCC_DASHBOARD_SEED: typeof dashboardSeed = {
  project: { id: "dcc-assurance-018", name: "Customer portal documentation assurance", status: "In review", reportingDate: "2026-08-06" },
  kpis: [
    { id: "standards", label: "Standards mapped", value: 4, detail: "238 requirements in scope", tone: "good" },
    { id: "coverage", label: "Evidence coverage", value: 82, unit: "%", detail: "143 source links retained", tone: "watch" },
    { id: "findings", label: "Awaiting review", value: 4, detail: "of 27 AI findings", tone: "risk" },
  ],
  planRows: [
    { id: "assurance-1", label: "Map assurance standards", owner: "Assurance lead", startWeek: 1, endWeek: 1, status: "Completed", dependencies: [] },
    { id: "assurance-2", label: "Upload documentation pack", owner: "Document owners", startWeek: 1, endWeek: 2, status: "Completed", dependencies: [{ id: "assurance-1", type: "finish-start" }] },
    { id: "assurance-3", label: "Run AI evidence scan", owner: "Assurance service", startWeek: 2, endWeek: 3, status: "In progress", dependencies: [{ id: "assurance-2", type: "finish-start" }] },
    { id: "assurance-4", label: "Review source-linked findings", owner: "Morgan Jones", startWeek: 3, endWeek: 4, status: "In review", dependencies: [{ id: "assurance-3", type: "finish-start" }] },
    { id: "assurance-5", label: "Publish assurance decision", owner: "Assurance lead", startWeek: 4, endWeek: 5, status: "Not started", dependencies: [{ id: "assurance-4", type: "finish-start" }] },
  ],
};

const DCC_CHART_SEED: typeof chartSeed = {
  lineSeries: [
    { label: "Scan", value: 34 },
    { label: "Triage", value: 58 },
    { label: "Review", value: 74 },
    { label: "Current", value: 82 },
  ],
  distribution: [
    { label: "Approved", value: 18, color: "#22c55e" },
    { label: "In review", value: 4, color: "#f2a200" },
    { label: "Evidence gaps", value: 5, color: "#e31937" },
  ],
  waterfall: [
    { label: "Initial estimate", value: 164000 },
    { label: "Evidence reused", value: -38000 },
    { label: "Gap remediation", value: 22000 },
    { label: "Assured estimate", value: 148000 },
  ],
};

const DCC_KANBAN_SEED: typeof kanbanSeed = {
  columns: [
    { id: "todo", label: "To review", statuses: ["Not started", "Draft"] },
    { id: "doing", label: "Human review", statuses: ["In progress", "In review"] },
    { id: "done", label: "Resolved", statuses: ["Completed"] },
  ],
  cards: [
    { id: "finding-1", title: "Name the accountable security owner", status: "In review", owner: "Morgan Jones", badges: ["ISO 27001", "AI finding"], href: "#finding-1" },
    { id: "finding-2", title: "Attach contrast test evidence", status: "Not started", owner: "Aisha Khan", badges: ["WCAG 2.2", "Evidence gap"], href: "#finding-2" },
    { id: "finding-3", title: "Confirm the human escalation route", status: "Completed", owner: "Morgan Jones", badges: ["NIST AI RMF"], href: "#finding-3" },
    { id: "finding-4", title: "Link recovery control evidence", status: "Draft", owner: "Cyber security", badges: ["DCC HACK-01"], href: "#finding-4" },
  ],
};

const DCC_EDITABLE_TABLE_ROWS: TableRow[] = [
  { id: "iso-5-3", label: "Security roles and responsibilities", category: "Decision", included: true, locked: true },
  { id: "wcag-1-4-3", label: "Minimum text contrast evidence", category: "Evidence", included: true, locked: false },
  { id: "nist-govern-1-2", label: "Named human accountability", category: "Decision", included: true, locked: false },
  { id: "dcc-h1", label: "Every finding retains a source link", category: "Evidence", included: true, locked: false },
];

const DCC_READ_ONLY_TABLE_ROWS: ReadOnlyRow[] = [
  { id: "iso-27001", label: "ISO/IEC 27001:2022", category: "Security", owner: "Security assurance", updated: "2026-08-06", status: "Complete", volume: 93 },
  { id: "wcag-22", label: "WCAG 2.2 AA", category: "Accessibility", owner: "Accessibility lead", updated: "2026-08-06", status: "Complete", volume: 55 },
  { id: "gds-service", label: "GDS Service Standard", category: "Service delivery", owner: "Service design", updated: "2026-08-05", status: "Complete", volume: 14 },
  { id: "nist-ai-rmf", label: "NIST AI RMF 1.0", category: "AI governance", owner: "AI governance", updated: "2026-08-05", status: "In review", volume: 72 },
  { id: "dcc-hack-01", label: "DCC Assurance Profile · HACK-01", category: "Internal profile", owner: "DCC assurance team", updated: "2026-08-06", status: "Active", volume: 18 },
];

const PLANNING_FIXTURES: Record<PlanningScenarioId, PlanningScenarioFixture> = {
  base: {
    dashboard: { seed: dashboardSeed, copy: {
      initialNotice:"Template data loaded", restoredNotice:"Template reset to starter data", emptyNotice:"Empty state ready", resetNotice:"Plan reset to template defaults",
      overviewEmptyTitle:"No programme activity yet", overviewEmptyCopy:"Connect a project-plan data source or load generic starter data to populate this overview pattern.", overviewLoadLabel:"Load sample data",
      healthTitle:"Delivery health", healthEyebrow:"Live plan", trendTitle:"Completion trend", trendEyebrow:"Weekly progress", trendAriaLabel:"Completion rose from 20 to 72 percent over four weeks",
      planNoun:"delivery plan", planEmptyTitle:"No tasks in this plan", planEmptyCopy:"Import a JSON plan or reset the template to load generic starter tasks.", planLoadLabel:"Load starter tasks", planSavedNotice:"Plan saved locally at this template boundary",
      queueTitle:"Current work queue", queueEyebrow:"Status-driven workflow", queueSearchLabel:"Search work", queueSearchPlaceholder:"Task, owner or status", queueEmptyTitle:"Queue is empty", queueEmptyCopy:"Tasks appear here as they are added to the project plan.",
      queueNoMatchTitle:"No matching tasks", queueNoMatchCopy:"Try another task, owner or status search.", queueItemSingular:"task", queueItemPlural:"tasks", queueExportFile:"template-work-queue.json", overviewSelectionSuffix:"selected for host navigation",
      settingsTitle:"Plan settings", settingsDescription:"Adjust the reusable timeline without changing task content.", importTitle:"Import a project plan", importDescription:"Paste a planRows JSON array, validate it, then review before applying.",
      pattern:{ overview:{eyebrow:"Portfolio overview",title:"Programme snapshot",detail:"Metrics, health and progress in one reusable summary"}, plan:{eyebrow:"Project plan",title:"Interactive delivery timeline",detail:"Drag, resize, import and manage task dependencies"}, queue:{eyebrow:"Work queue",title:"Delivery work queue",detail:"Search, inspect and progress work through status"} },
    } },
    charts: { seed: chartSeed, copy: {
      emptyTitle:{ comfortable:"No comfortable chart data available", compact:"No compact chart data available" }, emptyCopy:"Connect a series and category labels to render an accessible visual with an equivalent data table.", emptyAction:"Connect data",
      comfortableTitle:"Comfortable analytics", comfortableDetail:"Roomy comparison layout for focused analysis", compactTitle:"Compact analytics", compactDetail:"Dense multi-chart layout for operational dashboards",
      trendTitle:"Completion trend", trendEyebrow:"Line chart", trendAccessibleTitle:"Weekly completion trend", trendAccessibleDescription:"Completion rises", trendCaption:"Weekly completion data",
      distributionTitle:"Evidence mix", distributionEyebrow:"Pie chart", distributionAriaPrefix:"Evidence mix", distributionCaption:"Evidence mix data",
      throughputTitle:"Weekly throughput", throughputEyebrow:"Bar chart", throughputAriaPrefix:"Weekly throughput", throughputCaption:"Weekly throughput data",
      breakdownTitle:"Evidence distribution", breakdownEyebrow:"Distribution chart", breakdownCaption:"Evidence distribution data",
      waterfallTitle:"Cost bridge", waterfallEyebrow:"Waterfall chart", waterfallBadge:"Five-year view", waterfallAriaPrefix:"Cost bridge", waterfallCaption:"Cost bridge data",
    } },
    kanban: { seed: kanbanSeed, copy: { initialNotice:"Workflow ready", resetNotice:"Workflow reset", eyebrow:"Compass workflow", title:"Planning backlog", itemNoun:"tasks", ownerLabel:"Owner", readonlyNotice:"This board is read-only. Filtering and view controls remain available.", emptyColumnTitle:"No cards", emptyColumnCopy:"Cards move here when their status matches.", listTitle:"Backlog list", listEyebrow:"Same workflow, alternate view", noOwnerMatches:"No tasks match this owner.", navigationNoticeSuffix:"navigation emitted to the host" } },
    editableTable: { rows: BASE_EDITABLE_TABLE_ROWS, copy: { eyebrow:"Compass data pattern", title:"Editable item register", detail:"Add, validate and manage generic structured rows", panelTitle:"Item configuration", panelEyebrow:"Editable data table", searchPlaceholder:"Label or category", emptyTitle:"No items configured", emptyCopy:"Add a row manually or preview an import before applying it to this reusable table.", importTitle:"Import table data", importDescription:"Paste JSON or CSV, preview the rows and validation state, then apply.", importPlaceholder:'label,category,included\nDiscovery summary,Deliverable,true', exportFileName:"editable-items-template.csv", initialNotice:"Table ready", restoredNotice:"Table reset" } },
    readOnlyTable: { rows: BASE_READ_ONLY_TABLE_ROWS, copy: { eyebrow:"Compass data pattern", title:"Read-only results register", detail:"Search, sort and export a stable generic dataset", finalNotice:"This snapshot is finalised. Presentation controls and export remain available without exposing edit actions.", visibleLabel:"Visible records", completeLabel:"Complete", categoryLabel:"Categories", categoryDetail:"Generic groupings", volumeLabel:"Total volume", volumeDetail:"Across all records", panelTitle:"Structured results", panelEyebrow:"Sortable read-only data table", searchPlaceholder:"Label, category, owner or status", emptyTitle:"No reference records", emptyCopy:"Connect a read-only dataset, or load generic rows to inspect the populated pattern.", loadLabel:"Load sample rows", loadedNotice:"Generic reference rows loaded", itemColumn:"Item", categoryColumn:"Category", ownerColumn:"Owner", updatedColumn:"Updated", statusColumn:"Status", volumeColumn:"Volume", exportFileName:"read-only-items-view.csv", referenceNotice:"Reference data ready", emptyNotice:"No reference rows connected" } },
  },
  "dcc-hackathon": {
    dashboard: { seed: DCC_DASHBOARD_SEED, copy: {
      initialNotice:"DCC assurance data loaded", restoredNotice:"DCC assurance data restored", emptyNotice:"Empty assurance state ready", resetNotice:"Assurance plan reset to DCC data",
      overviewEmptyTitle:"No assurance activity yet", overviewEmptyCopy:"Select standards and upload documents to populate this assurance overview.", overviewLoadLabel:"Load DCC assurance data",
      healthTitle:"Assurance health", healthEyebrow:"Assurance run DCC-018", trendTitle:"Evidence coverage", trendEyebrow:"Review progress", trendAriaLabel:"Evidence coverage rose from 34 to 82 percent across the assurance workflow",
      planNoun:"assurance plan", planEmptyTitle:"No assurance tasks in this plan", planEmptyCopy:"Import an assurance plan or load the DCC standards-to-decision workflow.", planLoadLabel:"Load assurance tasks", planSavedNotice:"Assurance plan saved",
      queueTitle:"Assurance review queue", queueEyebrow:"Source-linked workflow", queueSearchLabel:"Search assurance work", queueSearchPlaceholder:"Finding, reviewer or status", queueEmptyTitle:"Assurance queue is empty", queueEmptyCopy:"Findings appear here after uploaded documents are scanned against selected standards.",
      queueNoMatchTitle:"No matching assurance tasks", queueNoMatchCopy:"Try another finding, reviewer or status search.", queueItemSingular:"assurance task", queueItemPlural:"assurance tasks", queueExportFile:"dcc-assurance-work-queue.json", overviewSelectionSuffix:"selected for assurance review",
      settingsTitle:"Assurance plan settings", settingsDescription:"Adjust the assurance timeline without changing task content.", importTitle:"Import an assurance plan", importDescription:"Paste an assurance planRows JSON array, validate it, then review before applying.",
      pattern:{ overview:{eyebrow:"Documentation assurance",title:"Assurance run snapshot",detail:"Standards, evidence coverage and human review in one clear summary"}, plan:{eyebrow:"Assurance plan",title:"Standards-to-decision timeline",detail:"Plan standards mapping, document scans, reviews and approval dependencies"}, queue:{eyebrow:"Review queue",title:"Documentation assurance work",detail:"Search, inspect and progress source-linked findings through human review"} },
    } },
    charts: { seed: DCC_CHART_SEED, copy: {
      emptyTitle:{ comfortable:"No comfortable assurance chart data available", compact:"No compact assurance chart data available" }, emptyCopy:"Run uploaded documents against at least one standard to produce accessible coverage charts and data tables.", emptyAction:"Run assurance",
      comfortableTitle:"Assurance analytics", comfortableDetail:"Roomy comparison layout for standards coverage and evidence gaps", compactTitle:"Assurance signals", compactDetail:"Dense multi-chart view for assurance runs and human review",
      trendTitle:"Evidence coverage", trendEyebrow:"Assurance progress", trendAccessibleTitle:"Assurance evidence coverage", trendAccessibleDescription:"Evidence coverage rises", trendCaption:"Assurance evidence coverage data",
      distributionTitle:"Finding decisions", distributionEyebrow:"Decision mix", distributionAriaPrefix:"Finding decisions", distributionCaption:"Finding decision data",
      throughputTitle:"Review progress", throughputEyebrow:"Workflow chart", throughputAriaPrefix:"Review progress", throughputCaption:"Assurance review progress data",
      breakdownTitle:"Standards coverage", breakdownEyebrow:"Coverage distribution", breakdownCaption:"Standards coverage data",
      waterfallTitle:"Remediation cost bridge", waterfallEyebrow:"Assurance scenario", waterfallBadge:"Current estimate", waterfallAriaPrefix:"Remediation cost bridge", waterfallCaption:"Remediation cost data",
    } },
    kanban: { seed: DCC_KANBAN_SEED, copy: { initialNotice:"Assurance findings ready", resetNotice:"DCC findings restored", eyebrow:"DCC assurance workflow", title:"Finding review board", itemNoun:"findings", ownerLabel:"Reviewer", readonlyNotice:"This assurance board is read-only. Filters and view controls remain available.", emptyColumnTitle:"No findings", emptyColumnCopy:"Findings move here when their human-review status matches.", listTitle:"Finding review list", listEyebrow:"Same assurance workflow, alternate view", noOwnerMatches:"No findings match this reviewer.", navigationNoticeSuffix:"selected for assurance review" } },
    editableTable: { rows: DCC_EDITABLE_TABLE_ROWS, copy: { eyebrow:"Standards management", title:"Editable requirement register", detail:"Map, validate and govern assurance requirements", panelTitle:"Requirement configuration", panelEyebrow:"Editable standards data", searchPlaceholder:"Requirement or evidence type", emptyTitle:"No requirements configured", emptyCopy:"Add a requirement manually or preview a standards import before applying it.", importTitle:"Import standard requirements", importDescription:"Paste JSON or CSV, preview the requirements and mapping validation, then apply.", importPlaceholder:'label,category,included\nSecurity roles and responsibilities,Decision,true', exportFileName:"dcc-assurance-requirements.csv", initialNotice:"DCC requirement register ready", restoredNotice:"DCC requirements restored" } },
    readOnlyTable: { rows: DCC_READ_ONLY_TABLE_ROWS, copy: { eyebrow:"Standards library", title:"Published assurance standards", detail:"Search, sort and export the standards available to assurance runs", finalNotice:"This standards snapshot is finalised. Search and export remain available without exposing edit actions.", visibleLabel:"Visible standards", completeLabel:"Mapped", categoryLabel:"Domains", categoryDetail:"Assurance groupings", volumeLabel:"Requirements", volumeDetail:"Across all standards", panelTitle:"Standards library", panelEyebrow:"Sortable governed reference data", searchPlaceholder:"Standard, domain, custodian or mapping status", emptyTitle:"No standards available", emptyCopy:"Connect the governed standards library or load the DCC hackathon standards.", loadLabel:"Load DCC standards", loadedNotice:"DCC standards library loaded", itemColumn:"Standard", categoryColumn:"Domain", ownerColumn:"Custodian", updatedColumn:"Updated", statusColumn:"Mapping", volumeColumn:"Requirements", exportFileName:"dcc-standards-library.csv", referenceNotice:"Standards library ready", emptyNotice:"No standards library connected" } },
  },
};

const clonePlan = (seed: typeof dashboardSeed): PlanRow[] => seed.planRows.map((row) => ({
  ...row,
  dependencies: row.dependencies.map((dependency) => ({ ...dependency })),
}));
const cloneTableRows = (rows: TableRow[]): TableRow[] => rows.map((row) => ({ ...row }));
const cloneReadOnlyRows = (rows: ReadOnlyRow[], complete = false): ReadOnlyRow[] => rows.map((row) => ({ ...row, status: complete ? "Complete" : row.status }));

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

function normalisePlanImport(value: unknown, weeks: number): PlanRow[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === "object" && "planRows" in value
      ? (value as { planRows: unknown }).planRows
      : null;
  if (!Array.isArray(source) || source.length === 0) throw new Error("Add at least one task in a planRows array.");

  return source.map((candidate, index) => {
    if (!candidate || typeof candidate !== "object") throw new Error(`Task ${index + 1} is not an object.`);
    const row = candidate as Record<string, unknown>;
    const label = String(row.label ?? "").trim();
    if (!label) throw new Error(`Task ${index + 1} needs a label.`);
    const startWeek = clamp(Number(row.startWeek) || 1, 1, weeks);
    const endWeek = clamp(Number(row.endWeek) || startWeek, startWeek, weeks);
    const dependencies = Array.isArray(row.dependencies)
      ? row.dependencies.flatMap((dependency) => {
          if (typeof dependency === "string") return [{ id: dependency, type: "finish-start" }];
          if (dependency && typeof dependency === "object" && "id" in dependency) {
            return [{ id: String((dependency as Record<string, unknown>).id), type: String((dependency as Record<string, unknown>).type ?? "finish-start") }];
          }
          return [];
        })
      : [];
    return {
      id: String(row.id ?? `task-${Date.now()}-${index}`),
      label,
      owner: String(row.owner ?? "Unassigned"),
      status: String(row.status ?? "Not started"),
      startWeek,
      endWeek,
      dependencies,
    };
  });
}

function planTone(status: string) {
  if (status === "Completed") return styles.planGood;
  if (status === "In progress" || status === "In review") return styles.planActive;
  return styles.planNeutral;
}

type DashboardPattern = "overview" | "plan" | "queue";

function DashboardPatternTemplate({ mode, resetToken, scenarioId = "base", pattern }: TemplateProps & { pattern: DashboardPattern }) {
  const readOnly = mode === "readonly";
  const fixture = PLANNING_FIXTURES[scenarioId].dashboard;
  const [rows, setRows] = useState<PlanRow[]>(() => mode === "empty" ? [] : clonePlan(fixture.seed));
  const [history, setHistory] = useState<PlanRow[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(fixture.seed.planRows[1]?.id ?? null);
  const [notice, setNotice] = useState(fixture.copy.initialNotice);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [timelineWeeks, setTimelineWeeks] = useState(5);
  const [draftWeeks, setDraftWeeks] = useState(5);
  const [showDependencies, setShowDependencies] = useState(true);
  const [draftDependencies, setDraftDependencies] = useState(true);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importPreview, setImportPreview] = useState<PlanRow[] | null>(null);
  const [queueQuery, setQueueQuery] = useState("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<null | {
    id: string;
    kind: "move" | "left" | "right";
    originX: number;
    baseStart: number;
    baseEnd: number;
    trackWidth: number;
  }>(null);

  useEffect(() => {
    const fresh = mode === "empty" ? [] : clonePlan(fixture.seed);
    // resetToken is an explicit host-to-template reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(fresh);
    setHistory([]);
    setSelectedId(fresh[0]?.id ?? null);
    setNotice(mode === "empty" ? fixture.copy.emptyNotice : fixture.copy.restoredNotice);
  }, [fixture, mode, resetToken]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const weekWidth = drag.trackWidth / timelineWeeks;
      const delta = Math.round((event.clientX - drag.originX) / Math.max(weekWidth, 1));
      setRows((current) => current.map((row) => {
        if (row.id !== drag.id) return row;
        if (drag.kind === "move") {
          const duration = drag.baseEnd - drag.baseStart;
          const startWeek = clamp(drag.baseStart + delta, 1, timelineWeeks - duration);
          return { ...row, startWeek, endWeek: startWeek + duration };
        }
        if (drag.kind === "left") return { ...row, startWeek: clamp(drag.baseStart + delta, 1, drag.baseEnd) };
        return { ...row, endWeek: clamp(drag.baseEnd + delta, drag.baseStart, timelineWeeks) };
      }));
    };
    const end = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setNotice("Schedule updated — changes are ready to save");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [timelineWeeks]);

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null;
  const queueRows = rows.filter((row) => `${row.label} ${row.owner} ${row.status}`.toLowerCase().includes(queueQuery.toLowerCase()));

  const commitRows = (next: PlanRow[], message: string) => {
    if (readOnly) return;
    setHistory((current) => [...current, rows].slice(-20));
    setRows(next);
    setNotice(message);
  };

  const updateRow = (id: string, updater: (row: PlanRow) => PlanRow, message: string) => {
    commitRows(rows.map((row) => row.id === id ? updater(row) : row), message);
  };

  const startDrag = (event: ReactPointerEvent, row: PlanRow, kind: "move" | "left" | "right") => {
    if (readOnly) return;
    event.preventDefault();
    event.stopPropagation();
    const trackWidth = timelineRef.current?.getBoundingClientRect().width ?? 600;
    setHistory((current) => [...current, rows].slice(-20));
    setSelectedId(row.id);
    dragRef.current = { id: row.id, kind, originX: event.clientX, baseStart: row.startWeek, baseEnd: row.endWeek, trackWidth };
  };

  const nudgeTask = (row: PlanRow, operation: "move" | "left" | "right", delta: number) => {
    updateRow(row.id, (current) => {
      if (operation === "move") {
        const duration = current.endWeek - current.startWeek;
        const startWeek = clamp(current.startWeek + delta, 1, timelineWeeks - duration);
        return { ...current, startWeek, endWeek: startWeek + duration };
      }
      if (operation === "left") return { ...current, startWeek: clamp(current.startWeek + delta, 1, current.endWeek) };
      return { ...current, endWeek: clamp(current.endWeek + delta, current.startWeek, timelineWeeks) };
    }, `${row.label} rescheduled`);
  };

  const onTaskKeyDown = (event: ReactKeyboardEvent, row: PlanRow) => {
    if (readOnly || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    nudgeTask(row, event.altKey ? "left" : event.shiftKey ? "right" : "move", delta);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous || readOnly) return;
    setRows(previous);
    setHistory((current) => current.slice(0, -1));
    setNotice("Last schedule change undone");
  };

  const resetPlan = () => {
    if (readOnly) return;
    setHistory((current) => [...current, rows].slice(-20));
    const fresh = clonePlan(fixture.seed);
    setRows(fresh);
    setSelectedId(fresh[0]?.id ?? null);
    setNotice(fixture.copy.resetNotice);
  };

  const previewPlanImport = () => {
    try {
      const parsed = normalisePlanImport(JSON.parse(importText), timelineWeeks);
      setImportPreview(parsed);
      setImportError("");
    } catch (error) {
      setImportPreview(null);
      setImportError(error instanceof Error ? error.message : "That JSON could not be read.");
    }
  };

  const applyPlanImport = () => {
    if (!importPreview) return;
    commitRows(importPreview, `${importPreview.length} imported tasks are ready to save`);
    setSelectedId(importPreview[0]?.id ?? null);
    setImportOpen(false);
    setImportText("");
    setImportPreview(null);
  };

  const overview = <div className={styles.dashboardStack}>
    <div className={styles.metricNavigation}>
      {(mode === "empty" ? [] : fixture.seed.kpis).map((kpi) => <div className={styles.metricNavCard} key={kpi.id}>
        <Metric label={kpi.label} value={`${kpi.value}${"unit" in kpi ? kpi.unit ?? "" : ""}`} detail={kpi.detail} tone={kpi.tone} />
        <button
          type="button"
          onClick={() => {
            setNotice(`${kpi.label} ${fixture.copy.overviewSelectionSuffix}`);
          }}
          aria-label={`Open ${kpi.label} detail`}
        >View detail <b aria-hidden="true">→</b></button>
      </div>)}
    </div>
    {rows.length === 0 ? <EmptyState title={fixture.copy.overviewEmptyTitle} copy={fixture.copy.overviewEmptyCopy} action={!readOnly ? <ActionButton variant="primary" onClick={() => setRows(clonePlan(fixture.seed))}>{fixture.copy.overviewLoadLabel}</ActionButton> : undefined} /> : <div className={styles.overviewGrid}>
      <Panel title={fixture.copy.healthTitle} eyebrow={fixture.copy.healthEyebrow} action={<Badge>{rows.filter((row) => row.status !== "Completed").length} active</Badge>}>
        <div className={styles.healthList}>{rows.map((row) => <button key={row.id} type="button" aria-pressed={selectedId === row.id} onClick={() => { setSelectedId(row.id); setNotice(`${row.label} ${fixture.copy.overviewSelectionSuffix}`); }}>
          <i className={planTone(row.status)} />
          <span><strong>{row.label}</strong><small>{row.owner} · W{row.startWeek}–W{row.endWeek}</small></span>
          <Badge>{row.status}</Badge>
        </button>)}</div>
      </Panel>
      <Panel title={fixture.copy.trendTitle} eyebrow={fixture.copy.trendEyebrow}>
        <div className={styles.miniTrend} role="img" aria-label={fixture.copy.trendAriaLabel}>
          <svg viewBox="0 0 420 190" aria-hidden="true"><path d="M24 150H396M24 105H396M24 60H396" /><polyline points="24,142 148,104 272,74 396,49" /><circle cx="24" cy="142" r="5" /><circle cx="148" cy="104" r="5" /><circle cx="272" cy="74" r="5" /><circle cx="396" cy="49" r="5" /></svg>
          <div>{PLANNING_FIXTURES[scenarioId].charts.seed.lineSeries.map((point) => <span key={point.label}><b>{point.value}%</b><small>{point.label}</small></span>)}</div>
        </div>
      </Panel>
    </div>}
  </div>;

  const plan = <div className={styles.planLayout}>
    <Panel title={`${timelineWeeks}-week ${fixture.copy.planNoun}`} eyebrow="Pointer and keyboard enabled" action={<div className={styles.panelActions}>
      <ActionButton variant="ghost" disabled={readOnly || history.length === 0} onClick={undo}>Undo</ActionButton>
      <ActionButton variant="secondary" disabled={readOnly} onClick={() => { setDraftWeeks(timelineWeeks); setDraftDependencies(showDependencies); setSettingsOpen(true); }}>Settings</ActionButton>
    </div>}>
      <div className={styles.planToolbar}>
        <div><ActionButton variant="secondary" disabled={readOnly} onClick={() => setImportOpen(true)}>Import</ActionButton><ActionButton variant="secondary" disabled={readOnly} onClick={resetPlan}>Reset</ActionButton></div>
        <span aria-live="polite">{notice}</span>
        <ActionButton variant="primary" disabled={readOnly} onClick={() => setNotice(fixture.copy.planSavedNotice)}>Save plan</ActionButton>
      </div>
      {readOnly && <div className={styles.insetNotice}><InlineNotice tone="warning">Read-only mode keeps planning controls visible while preventing data changes.</InlineNotice></div>}
      {rows.length === 0 ? <div className={styles.planEmpty}><EmptyState title={fixture.copy.planEmptyTitle} copy={fixture.copy.planEmptyCopy} action={!readOnly ? <ActionButton variant="primary" onClick={resetPlan}>{fixture.copy.planLoadLabel}</ActionButton> : undefined} /></div> : <div className={styles.ganttScroll}>
        <div className={styles.gantt} style={{ "--week-count": timelineWeeks } as CSSProperties}>
          <div className={styles.ganttHeader}><span>Task</span><div>{Array.from({ length: timelineWeeks }, (_, index) => <b key={index}>W{index + 1}</b>)}</div></div>
          {rows.map((row) => <div className={`${styles.ganttRow} ${selectedId === row.id ? styles.selectedTask : ""}`} key={row.id}>
            <button className={styles.taskLabel} type="button" onClick={() => setSelectedId(row.id)} aria-pressed={selectedId === row.id}>
              <span><strong>{row.label}</strong><small>{row.owner}</small></span><Badge>{row.status}</Badge>
            </button>
            <div className={styles.weekTrack} ref={row.id === rows[0]?.id ? timelineRef : undefined}>
              {Array.from({ length: timelineWeeks }, (_, index) => <i key={index} aria-hidden="true" />)}
              {showDependencies && row.dependencies.length > 0 && <span className={styles.dependencyLead} style={{ left: `${((row.startWeek - 1) / timelineWeeks) * 100}%` }} aria-hidden="true">←</span>}
              <button
                className={`${styles.taskBar} ${planTone(row.status)}`}
                style={{ left: `${((row.startWeek - 1) / timelineWeeks) * 100}%`, width: `${((row.endWeek - row.startWeek + 1) / timelineWeeks) * 100}%` }}
                type="button"
                disabled={readOnly}
                aria-label={`${row.label}, week ${row.startWeek} to ${row.endWeek}. Arrow keys move; Shift plus arrows resize the end; Alt plus arrows resize the start.`}
                onPointerDown={(event) => startDrag(event, row, "move")}
                onKeyDown={(event) => onTaskKeyDown(event, row)}
                onClick={() => setSelectedId(row.id)}
              >
                <i className={styles.leftHandle} onPointerDown={(event) => startDrag(event, row, "left")} aria-hidden="true" />
                <span>{row.endWeek - row.startWeek + 1}w</span>
                <i className={styles.rightHandle} onPointerDown={(event) => startDrag(event, row, "right")} aria-hidden="true" />
              </button>
            </div>
          </div>)}
        </div>
      </div>}
    </Panel>
    {selectedRow && <aside className={styles.taskInspector} aria-label="Selected task controls">
      <header><small>Selected task</small><strong>{selectedRow.label}</strong><Badge>{selectedRow.status}</Badge></header>
      <label>Owner<input value={selectedRow.owner} disabled={readOnly} onChange={(event) => updateRow(selectedRow.id, (row) => ({ ...row, owner: event.target.value }), "Task owner updated")} /></label>
      <label>Status<select value={selectedRow.status} disabled={readOnly} onChange={(event) => updateRow(selectedRow.id, (row) => ({ ...row, status: event.target.value }), "Task status updated")}><option>Not started</option><option>In progress</option><option>In review</option><option>Completed</option></select></label>
      <div className={styles.nudgeGrid}>
        <span>Move task</span><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "move", -1)}>← Earlier</ActionButton><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "move", 1)}>Later →</ActionButton>
        <span>Resize start</span><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "left", -1)}>← Extend</ActionButton><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "left", 1)}>Trim →</ActionButton>
        <span>Resize end</span><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "right", -1)}>← Trim</ActionButton><ActionButton disabled={readOnly} onClick={() => nudgeTask(selectedRow, "right", 1)}>Extend →</ActionButton>
      </div>
      <div className={styles.dependencies}><span>Dependencies</span>{selectedRow.dependencies.length === 0 && <small>No dependencies</small>}{selectedRow.dependencies.map((dependency) => <div key={dependency.id}><span>{rows.find((row) => row.id === dependency.id)?.label ?? dependency.id}</span><button type="button" disabled={readOnly} aria-label={`Remove dependency ${dependency.id}`} onClick={() => updateRow(selectedRow.id, (row) => ({ ...row, dependencies: row.dependencies.filter((item) => item.id !== dependency.id) }), "Dependency removed")}>×</button></div>)}
        <select aria-label="Add dependency" value="" disabled={readOnly} onChange={(event) => {
          const dependencyId = event.target.value;
          if (!dependencyId) return;
          updateRow(selectedRow.id, (row) => ({ ...row, dependencies: [...row.dependencies, { id: dependencyId, type: "finish-start" }] }), "Dependency added");
        }}><option value="">Add dependency…</option>{rows.filter((row) => row.id !== selectedRow.id && !selectedRow.dependencies.some((dependency) => dependency.id === row.id)).map((row) => <option value={row.id} key={row.id}>{row.label}</option>)}</select>
      </div>
    </aside>}
  </div>;

  const queue = <Panel title={fixture.copy.queueTitle} eyebrow={fixture.copy.queueEyebrow} action={<ActionButton variant="secondary" onClick={() => downloadJson(fixture.copy.queueExportFile, rows)}>Export queue</ActionButton>}>
    <div className={styles.queueToolbar}><label><span>{fixture.copy.queueSearchLabel}</span><input value={queueQuery} onChange={(event) => setQueueQuery(event.target.value)} placeholder={fixture.copy.queueSearchPlaceholder} /></label><strong>{queueRows.length} {queueRows.length === 1 ? fixture.copy.queueItemSingular : fixture.copy.queueItemPlural}</strong></div>
    {queueRows.length === 0 ? <div className={styles.queueEmpty}><EmptyState title={rows.length === 0 ? fixture.copy.queueEmptyTitle : fixture.copy.queueNoMatchTitle} copy={rows.length === 0 ? fixture.copy.queueEmptyCopy : fixture.copy.queueNoMatchCopy} /></div> : <div className={styles.queueList}>{queueRows.map((row) => <article key={row.id}>
      <button type="button" aria-pressed={selectedId === row.id} onClick={() => { setSelectedId(row.id); setNotice(`${row.label} selected`); }}><i className={planTone(row.status)} /><span><strong>{row.label}</strong><small>{row.owner} · W{row.startWeek}–W{row.endWeek}</small></span></button>
      <select aria-label={`Status for ${row.label}`} value={row.status} disabled={readOnly} onChange={(event) => updateRow(row.id, (candidate) => ({ ...candidate, status: event.target.value }), `${row.label} moved to ${event.target.value}`)}><option>Not started</option><option>In progress</option><option>In review</option><option>Completed</option></select>
    </article>)}</div>}
  </Panel>;

  const patternCopy = fixture.copy.pattern[pattern];

  return <div className={styles.templateRoot}>
    <header className={styles.templateHeader}><div><small>{patternCopy.eyebrow}</small><h3>{patternCopy.title}</h3><span>{patternCopy.detail} · Updated {fixture.seed.project.reportingDate}</span></div><Badge>{readOnly ? "Read only" : fixture.seed.project.status}</Badge></header>
    <div>{pattern === "overview" ? overview : pattern === "plan" ? plan : queue}</div>
    <p className={styles.srOnly} aria-live="polite">{notice}</p>

    {settingsOpen && <AccessibleModal title={fixture.copy.settingsTitle} description={fixture.copy.settingsDescription} onClose={() => setSettingsOpen(false)} footer={<><ActionButton variant="ghost" onClick={() => setSettingsOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" onClick={() => {
      setTimelineWeeks(draftWeeks);
      setShowDependencies(draftDependencies);
      setRows((current) => current.map((row) => ({ ...row, startWeek: clamp(row.startWeek, 1, draftWeeks), endWeek: clamp(row.endWeek, clamp(row.startWeek, 1, draftWeeks), draftWeeks) })));
      setSettingsOpen(false);
      setNotice("Plan settings saved");
    }}>Apply settings</ActionButton></>}>
      <div className={styles.modalForm}><label>Timeline length<span>Number of working weeks</span><input type="number" min="3" max="12" value={draftWeeks} onChange={(event) => setDraftWeeks(clamp(Number(event.target.value), 3, 12))} /></label><label className={styles.checkLabel}><input type="checkbox" checked={draftDependencies} onChange={(event) => setDraftDependencies(event.target.checked)} /><span><strong>Show dependencies</strong><small>Display predecessor markers on the Gantt.</small></span></label></div>
    </AccessibleModal>}

    {importOpen && <AccessibleModal title={fixture.copy.importTitle} description={fixture.copy.importDescription} onClose={() => setImportOpen(false)} footer={<><ActionButton variant="ghost" onClick={() => setImportOpen(false)}>Cancel</ActionButton><ActionButton variant="secondary" onClick={previewPlanImport}>Preview import</ActionButton><ActionButton variant="primary" disabled={!importPreview} onClick={applyPlanImport}>Apply {importPreview?.length ?? 0} tasks</ActionButton></>}>
      <div className={styles.importForm}><label>Plan JSON<textarea value={importText} onChange={(event) => { setImportText(event.target.value); setImportPreview(null); setImportError(""); }} placeholder={'[{"id":"task-1","label":"Discovery","startWeek":1,"endWeek":2}]'} /></label>{importError && <InlineNotice tone="danger">{importError}</InlineNotice>}{importPreview && <InlineNotice tone="success">Preview ready: {importPreview.map((row) => row.label).join(", ")}</InlineNotice>}</div>
    </AccessibleModal>}
  </div>;
}

export function OverviewTemplate(props: TemplateProps) {
  return <DashboardPatternTemplate {...props} pattern="overview" />;
}

// Gallery-facing name keeps the dashboard origin clear while OverviewTemplate
// remains the concise reusable-component export.
export function DashboardOverviewTemplate(props: TemplateProps) {
  return <OverviewTemplate {...props} />;
}

export function ProjectPlanTemplate(props: TemplateProps) {
  return <DashboardPatternTemplate {...props} pattern="plan" />;
}

export function WorkQueueTemplate(props: TemplateProps) {
  return <DashboardPatternTemplate {...props} pattern="queue" />;
}

function AccessibleData({ caption, rows }: { caption: string; rows: { label: string; value: number }[] }) {
  return <table className={styles.srOnly}><caption>{caption}</caption><thead><tr><th>Category</th><th>Value</th></tr></thead><tbody>{rows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.value}</td></tr>)}</tbody></table>;
}

function ChartPatternTemplate({ mode, resetToken, scenarioId = "base", density }: TemplateProps & { density: "comfortable" | "compact" }) {
  const fixture = PLANNING_FIXTURES[scenarioId].charts;
  const [labelsVisible, setLabelsVisible] = useState(true);
  const chartId = useId();
  useEffect(() => {
    // resetToken is an explicit host-to-template reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabelsVisible(true);
  }, [fixture, resetToken]);

  if (mode === "empty") return <div className={`${styles.templateRoot} ${density === "compact" ? styles.compactCharts : ""}`}><div className={styles.chartEmpty}><EmptyState title={fixture.copy.emptyTitle[density]} copy={fixture.copy.emptyCopy} action={<ActionButton variant="primary">{fixture.copy.emptyAction}</ActionButton>} /></div></div>;

  const line = fixture.seed.lineSeries;
  const maximum = Math.max(...line.map((point) => point.value), 1);
  const linePoints = line.map((point, index) => `${28 + index * (324 / Math.max(line.length - 1, 1))},${160 - (point.value / maximum) * 120}`).join(" ");
  const distributionTotal = fixture.seed.distribution.reduce((total, item) => total + item.value, 0);
  const pieStops = fixture.seed.distribution.map((item, index, items) => {
    const start = items.slice(0, index).reduce((total, entry) => total + entry.value, 0);
    const end = start + item.value;
    return `${item.color} ${(start / distributionTotal) * 100}% ${(end / distributionTotal) * 100}%`;
  }).join(", ");
  const waterfallMax = Math.max(...fixture.seed.waterfall.map((item) => Math.abs(item.value)), 1);

  return <div className={`${styles.templateRoot} ${density === "compact" ? styles.compactCharts : ""}`}>
    <div className={styles.chartToolbar}><div><small>{density} density</small><strong>{density === "comfortable" ? fixture.copy.comfortableTitle : fixture.copy.compactTitle}</strong><span>{density === "comfortable" ? fixture.copy.comfortableDetail : fixture.copy.compactDetail}</span></div><Badge>{density === "comfortable" ? "2-column" : "3-column"} pattern</Badge><label className={styles.switchLabel}><input type="checkbox" checked={labelsVisible} onChange={(event) => setLabelsVisible(event.target.checked)} /><span>Show values</span></label></div>
    <div className={styles.chartGrid}>
      <Panel title={fixture.copy.trendTitle} eyebrow={fixture.copy.trendEyebrow} className={styles.chartWide} action={<Badge>Weekly</Badge>}>
        <figure className={styles.lineFigure}><svg viewBox="0 0 380 190" role="img" aria-labelledby={`${chartId}-line-title ${chartId}-line-description`}><title id={`${chartId}-line-title`}>{fixture.copy.trendAccessibleTitle}</title><desc id={`${chartId}-line-description`}>{fixture.copy.trendAccessibleDescription} from {line[0].value} to {line.at(-1)?.value} percent.</desc><path className={styles.gridLines} d="M28 160H352M28 120H352M28 80H352M28 40H352" /><path className={styles.areaLine} d={`M${linePoints} L352,160 L28,160 Z`} /><polyline className={styles.primaryLine} points={linePoints} />{line.map((point, index) => { const x = 28 + index * (324 / Math.max(line.length - 1, 1)); const y = 160 - (point.value / maximum) * 120; return <g key={point.label}><circle cx={x} cy={y} r="5" /><text x={x} y={y - 13} textAnchor="middle">{labelsVisible ? `${point.value}%` : ""}</text><text x={x} y="180" textAnchor="middle">{point.label}</text></g>; })}</svg><AccessibleData caption={fixture.copy.trendCaption} rows={line} /></figure>
      </Panel>
      <Panel title={fixture.copy.distributionTitle} eyebrow={fixture.copy.distributionEyebrow} action={<Badge>{distributionTotal} items</Badge>}>
        <div className={styles.pieLayout}><div className={styles.donutChart} style={{ "--pie": `conic-gradient(${pieStops})` } as CSSProperties} role="img" aria-label={`${fixture.copy.distributionAriaPrefix}: ${fixture.seed.distribution.map((item) => `${item.label} ${item.value}`).join(", ")}`}><span><strong>{distributionTotal}</strong><small>total</small></span></div><div className={styles.chartLegend}>{fixture.seed.distribution.map((item) => <div key={item.label}><i style={{ background: item.color }} /><span>{item.label}</span>{labelsVisible && <strong>{Math.round(item.value / distributionTotal * 100)}%</strong>}</div>)}</div><AccessibleData caption={fixture.copy.distributionCaption} rows={fixture.seed.distribution} /></div>
      </Panel>
      <Panel title={fixture.copy.throughputTitle} eyebrow={fixture.copy.throughputEyebrow}>
        <div className={styles.verticalBars} role="img" aria-label={`${fixture.copy.throughputAriaPrefix}: ${line.map((item) => `${item.label} ${item.value}`).join(", ")}`}>{line.map((item) => <div key={item.label}><span style={{ height: `${Math.max(8, item.value / maximum * 100)}%` }}>{labelsVisible && <b>{item.value}</b>}</span><small>{item.label}</small></div>)}</div><AccessibleData caption={fixture.copy.throughputCaption} rows={line} />
      </Panel>
      <Panel title={fixture.copy.breakdownTitle} eyebrow={fixture.copy.breakdownEyebrow}>
        <div className={styles.distributionChart}>{fixture.seed.distribution.map((item) => <div key={item.label}><header><span><i style={{ background: item.color }} />{item.label}</span>{labelsVisible && <strong>{item.value}</strong>}</header><div><span style={{ width: `${item.value / Math.max(...fixture.seed.distribution.map((entry) => entry.value)) * 100}%`, background: item.color }} /></div></div>)}</div><AccessibleData caption={fixture.copy.breakdownCaption} rows={fixture.seed.distribution} />
      </Panel>
      <Panel title={fixture.copy.waterfallTitle} eyebrow={fixture.copy.waterfallEyebrow} className={styles.chartWide} action={<Badge>{fixture.copy.waterfallBadge}</Badge>}>
        <div className={styles.waterfallChart} role="img" aria-label={`${fixture.copy.waterfallAriaPrefix}: ${fixture.seed.waterfall.map((item) => `${item.label} ${item.value}`).join(", ")}`}>{fixture.seed.waterfall.map((item, index) => <div key={item.label} className={item.value < 0 ? styles.negativeBar : index === fixture.seed.waterfall.length - 1 ? styles.totalBar : styles.positiveBar}><span>{labelsVisible && <b>{item.value < 0 ? "−" : ""}£{Math.round(Math.abs(item.value) / 1000)}k</b>}<i style={{ height: `${Math.max(18, Math.abs(item.value) / waterfallMax * 100)}%` }} /></span><small>{item.label}</small></div>)}</div><AccessibleData caption={fixture.copy.waterfallCaption} rows={fixture.seed.waterfall} />
      </Panel>
    </div>
  </div>;
}

export function ComfortableChartsTemplate(props: TemplateProps) {
  return <ChartPatternTemplate {...props} density="comfortable" />;
}

export function CompactChartsTemplate(props: TemplateProps) {
  return <ChartPatternTemplate {...props} density="compact" />;
}

type KanbanCard = (typeof kanbanSeed.cards)[number];

export function KanbanTemplate({ mode, resetToken, scenarioId = "base" }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = PLANNING_FIXTURES[scenarioId].kanban;
  const [cards, setCards] = useState<KanbanCard[]>(() => mode === "empty" ? [] : fixture.seed.cards.map((card) => ({ ...card, badges: [...card.badges] })));
  const [view, setView] = useState<"board" | "list">("board");
  const [owner, setOwner] = useState("All owners");
  const [notice, setNotice] = useState(fixture.copy.initialNotice);

  useEffect(() => {
    // resetToken is an explicit host-to-template reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(mode === "empty" ? [] : fixture.seed.cards.map((card) => ({ ...card, badges: [...card.badges] })));
    setView("board");
    setOwner("All owners");
    setNotice(fixture.copy.resetNotice);
  }, [fixture, mode, resetToken]);

  const owners = ["All owners", ...Array.from(new Set(cards.map((card) => card.owner)))];
  const visibleCards = cards.filter((card) => owner === "All owners" || card.owner === owner);
  const allStatuses = fixture.seed.columns.flatMap((column) => column.statuses);
  const columnForStatus = (status: string) => fixture.seed.columns.find((column) => column.statuses.includes(status))?.id ?? fixture.seed.columns[0].id;
  const updateStatus = (id: string, status: string) => {
    if (readOnly) return;
    setCards((current) => current.map((card) => card.id === id ? { ...card, status } : card));
    setNotice(`${cards.find((card) => card.id === id)?.title ?? "Task"} moved to ${status}`);
  };
  const openTask = (card: KanbanCard) => setNotice(`${card.title} ${fixture.copy.navigationNoticeSuffix}`);
  const activeCount = visibleCards.filter((card) => columnForStatus(card.status) !== "done").length;
  const completeCount = visibleCards.filter((card) => columnForStatus(card.status) === "done").length;

  return <div className={styles.templateRoot}>
    <div className={styles.kanbanToolbar}><div><small>{fixture.copy.eyebrow}</small><strong>{fixture.copy.title}</strong><span aria-live="polite">{notice}</span></div><div className={styles.kanbanStats} aria-label="Visible work summary"><span><b>{visibleCards.length}</b>Visible</span><span><b>{activeCount}</b>Active</span><span><b>{completeCount}</b>Done</span></div><label><span>{fixture.copy.ownerLabel}</span><select value={owner} onChange={(event) => setOwner(event.target.value)}>{owners.map((option) => <option key={option}>{option}</option>)}</select></label><Segmented label="Backlog view" value={view} onChange={setView} options={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} disabled={false} /></div>
    {readOnly && <div className={styles.insetNotice}><InlineNotice tone="warning">{fixture.copy.readonlyNotice}</InlineNotice></div>}
    {view === "board" ? <div className={styles.kanbanBoard}>{fixture.seed.columns.map((column) => {
      const columnCards = visibleCards.filter((card) => columnForStatus(card.status) === column.id);
      return <section className={styles.kanbanColumn} key={column.id}><header><span><i data-column={column.id} />{column.label}</span><b aria-label={`${columnCards.length} cards`}>{columnCards.length}</b></header><div>{columnCards.length === 0 ? <div className={styles.columnEmpty}><i aria-hidden="true">◇</i><strong>{fixture.copy.emptyColumnTitle}</strong><small>{fixture.copy.emptyColumnCopy}</small></div> : columnCards.map((card) => <article className={styles.kanbanCard} key={card.id}>
        <div className={styles.cardTopline}><div className={styles.cardBadges}>{card.badges.map((badge) => <Badge key={badge} tone="neutral">{badge}</Badge>)}</div><span>{card.id.toUpperCase()}</span></div>
        <button className={styles.cardTitle} type="button" onClick={() => openTask(card)}>{card.title}<span aria-hidden="true">↗</span></button>
        <div className={styles.cardOwner}><i>{card.owner.slice(0, 1)}</i><span><small>{fixture.copy.ownerLabel}</small><strong>{card.owner}</strong></span></div>
        <div className={styles.cardFooter}><label><span>Status</span><select aria-label={`Status for ${card.title}`} value={card.status} disabled={readOnly} onChange={(event) => updateStatus(card.id, event.target.value)}>{allStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><button type="button" onClick={() => openTask(card)}>Open</button></div>
      </article>)}</div></section>;
    })}</div> : <Panel title={fixture.copy.listTitle} eyebrow={fixture.copy.listEyebrow} action={<Badge>{visibleCards.length} {fixture.copy.itemNoun}</Badge>}><div className={`${styles.listTable} ${styles.backlogList}`}><table><thead><tr><th>Task</th><th>{fixture.copy.ownerLabel}</th><th>Labels</th><th>Status</th><th><span className={styles.srOnly}>Open task</span></th></tr></thead><tbody>{visibleCards.map((card) => <tr key={card.id}><td><button className={styles.listTaskLink} type="button" onClick={() => openTask(card)}><small>{card.id.toUpperCase()}</small><strong>{card.title}</strong></button></td><td><span className={styles.listOwner}><i>{card.owner.slice(0, 1)}</i>{card.owner}</span></td><td><div className={styles.cardBadges}>{card.badges.map((badge) => <Badge key={badge} tone="neutral">{badge}</Badge>)}</div></td><td><select aria-label={`Status for ${card.title}`} value={card.status} disabled={readOnly} onChange={(event) => updateStatus(card.id, event.target.value)}>{allStatuses.map((status) => <option key={status}>{status}</option>)}</select></td><td><button className={styles.openTaskButton} type="button" onClick={() => openTask(card)} aria-label={`Open ${card.title}`}>→</button></td></tr>)}{visibleCards.length === 0 && <tr><td colSpan={5}><div className={styles.listEmpty}>{fixture.copy.noOwnerMatches}</div></td></tr>}</tbody></table></div></Panel>}
  </div>;
}

function validateTableRows(rows: TableRow[]) {
  const errors = new Map<string, string>();
  const labels = new Map<string, number>();
  rows.forEach((row) => {
    const normalised = row.label.trim().toLowerCase();
    if (normalised) labels.set(normalised, (labels.get(normalised) ?? 0) + 1);
  });
  rows.forEach((row) => {
    if (!row.label.trim()) errors.set(row.id, "Item label is required.");
    else if ((labels.get(row.label.trim().toLowerCase()) ?? 0) > 1) errors.set(row.id, "Item labels must be unique.");
    else if (!row.category.trim()) errors.set(row.id, "Choose a category.");
  });
  return errors;
}

function parseTableImport(text: string): TableRow[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Paste JSON or CSV data to continue.");
  let values: unknown[];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const source = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "rows" in parsed ? (parsed as { rows: unknown }).rows : null;
    if (!Array.isArray(source)) throw new Error("JSON must be an array, or an object containing rows.");
    values = source;
  } else {
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    const headings = lines[0].split(",").map((value) => value.trim().toLowerCase());
    if (!headings.includes("label") && !headings.includes("name")) throw new Error("CSV needs a label column.");
    values = lines.slice(1).map((line) => Object.fromEntries(line.split(",").map((value, index) => [headings[index], value.trim()])));
  }
  if (values.length === 0) throw new Error("The import contains no rows.");
  return values.map((value, index) => {
    if (!value || typeof value !== "object") throw new Error(`Row ${index + 1} is not valid.`);
    const row = value as Record<string, unknown>;
    return {
      id: String(row.id ?? `import-${Date.now()}-${index}`),
      label: String(row.label ?? row.name ?? ""),
      category: String(row.category ?? row.type ?? "Activity"),
      included: typeof row.included === "boolean"
        ? row.included
        : typeof row.inScope === "boolean"
          ? row.inScope
          : String(row.included ?? row.inScope ?? "true").toLowerCase() !== "false",
      locked: false,
    };
  });
}

export function EditableDataTableTemplate({ mode, resetToken, scenarioId = "base" }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = PLANNING_FIXTURES[scenarioId].editableTable;
  const [rows, setRows] = useState<TableRow[]>(() => mode === "empty" ? [] : cloneTableRows(fixture.rows));
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "scope" | "excluded">("all");
  const [notice, setNotice] = useState(fixture.copy.initialNotice);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [previewRows, setPreviewRows] = useState<TableRow[] | null>(null);

  useEffect(() => {
    // resetToken is an explicit host-to-template reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(mode === "empty" ? [] : cloneTableRows(fixture.rows));
    setQuery("");
    setScope("all");
    setNotice(fixture.copy.restoredNotice);
  }, [fixture, mode, resetToken]);

  const errors = useMemo(() => validateTableRows(rows), [rows]);
  const visibleRows = rows.filter((row) => {
    const matchesQuery = `${row.label} ${row.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesScope = scope === "all" || (scope === "scope" ? row.included : !row.included);
    return matchesQuery && matchesScope;
  });
  const canEdit = (row: TableRow) => !readOnly && !row.locked;
  const update = (id: string, patch: Partial<TableRow>) => {
    setRows((current) => current.map((row) => row.id === id && canEdit(row) ? { ...row, ...patch } : row));
    setNotice("Unsaved table changes");
  };
  const addRow = () => {
    if (readOnly) return;
    const id = `item-${Date.now()}`;
    setRows((current) => [...current, { id, label: "", category: "Activity", included: true, locked: false }]);
    setNotice("Blank row added — complete the required label");
  };
  const copyRow = (row: TableRow) => {
    if (readOnly) return;
    setRows((current) => [...current, { ...row, id: `${row.id}-copy-${Date.now()}`, label: `${row.label} copy`, locked: false }]);
    setNotice(`${row.label} copied`);
  };
  const removeRow = (row: TableRow) => {
    if (!canEdit(row)) return;
    setRows((current) => current.filter((candidate) => candidate.id !== row.id));
    setNotice(`${row.label || "Blank row"} removed`);
  };
  const previewImport = () => {
    try {
      const parsed = parseTableImport(importText);
      const validation = validateTableRows(parsed);
      setPreviewRows(parsed);
      setImportError(validation.size ? `${validation.size} imported row${validation.size === 1 ? " needs" : "s need"} attention before saving.` : "");
    } catch (error) {
      setPreviewRows(null);
      setImportError(error instanceof Error ? error.message : "Import could not be read.");
    }
  };
  const applyImport = () => {
    if (!previewRows) return;
    setRows(previewRows);
    setNotice(`${previewRows.length} imported rows applied`);
    setImportOpen(false);
    setImportText("");
    setPreviewRows(null);
    setImportError("");
  };
  const exportCsv = () => {
    const csv = ["label,category,included", ...rows.map((row) => [row.label, row.category, row.included].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    downloadText(fixture.copy.exportFileName, csv, "text/csv");
    setNotice("CSV export prepared");
  };

  return <div className={styles.templateRoot}>
    <header className={styles.templateHeader}><div><small>{fixture.copy.eyebrow}</small><h3>{fixture.copy.title}</h3><span>{fixture.copy.detail}</span></div><Badge>{readOnly ? "Read only" : "Editable"}</Badge></header>
    <Panel title={fixture.copy.panelTitle} eyebrow={fixture.copy.panelEyebrow} action={<div className={styles.panelActions}><ActionButton variant="secondary" disabled={readOnly} onClick={() => setImportOpen(true)}>Import</ActionButton><ActionButton variant="secondary" onClick={exportCsv}>Export CSV</ActionButton><ActionButton variant="primary" disabled={readOnly} onClick={addRow}>Add row</ActionButton></div>}>
      <div className={styles.tableToolbar}><label><span>Search rows</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fixture.copy.searchPlaceholder} /></label><Segmented label="Filter inclusion" value={scope} onChange={setScope} options={[{ value: "all", label: "All" }, { value: "scope", label: "Included" }, { value: "excluded", label: "Excluded" }]} /><span aria-live="polite">{visibleRows.length} of {rows.length} rows</span></div>
      {readOnly && <div className={styles.insetNotice}><InlineNotice tone="warning">Read-only mode locks every row. Search, filters and exports remain available.</InlineNotice></div>}
      {rows.length === 0 ? <div className={styles.tableEmpty}><EmptyState title={fixture.copy.emptyTitle} copy={fixture.copy.emptyCopy} action={!readOnly ? <div className={styles.emptyActions}><ActionButton variant="primary" onClick={addRow}>Add first row</ActionButton><ActionButton onClick={() => setImportOpen(true)}>Import data</ActionButton></div> : undefined} /></div> : <div className={styles.editTable}><table><thead><tr><th>Item label <i>*</i></th><th>Category</th><th>Included</th><th>State</th><th><span className={styles.srOnly}>Row actions</span></th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id} className={errors.has(row.id) ? styles.invalidRow : undefined}>
        <td><label><span className={styles.srOnly}>Item label</span><input value={row.label} disabled={!canEdit(row)} aria-invalid={errors.has(row.id)} aria-describedby={errors.has(row.id) ? `${row.id}-error` : undefined} onChange={(event) => update(row.id, { label: event.target.value })} />{errors.has(row.id) && <small id={`${row.id}-error`} role="alert">{errors.get(row.id)}</small>}</label></td>
        <td><select aria-label={`Category for ${row.label || "new row"}`} value={row.category} disabled={!canEdit(row)} onChange={(event) => update(row.id, { category: event.target.value })}><option>Activity</option><option>Decision</option><option>Deliverable</option><option>Evidence</option></select></td>
        <td><label className={styles.scopeCheck}><input type="checkbox" checked={row.included} disabled={!canEdit(row)} onChange={(event) => update(row.id, { included: event.target.checked })} /><span>{row.included ? "Included" : "Excluded"}</span></label></td>
        <td><button type="button" className={styles.lockButton} disabled={readOnly} aria-label={`${row.locked ? "Unlock" : "Lock"} ${row.label || "row"}`} onClick={() => setRows((current) => current.map((candidate) => candidate.id === row.id ? { ...candidate, locked: !candidate.locked } : candidate))}><span aria-hidden="true">{readOnly || row.locked ? "▣" : "□"}</span>{readOnly ? "Read only" : row.locked ? "Locked" : "Editable"}</button></td>
        <td><div className={styles.rowActions}><ActionButton variant="ghost" disabled={readOnly} onClick={() => copyRow(row)}>Copy</ActionButton><ActionButton variant="danger" disabled={!canEdit(row)} onClick={() => removeRow(row)}>Remove</ActionButton></div></td>
      </tr>)}{visibleRows.length === 0 && <tr><td colSpan={5}><div className={styles.listEmpty}>No rows match these filters.</div></td></tr>}</tbody></table></div>}
      <div className={styles.tableFooter}><span>{errors.size ? <Badge tone="risk">{errors.size} validation {errors.size === 1 ? "issue" : "issues"}</Badge> : <Badge tone="good">Validation passed</Badge>}</span><span>{notice}</span><ActionButton variant="primary" disabled={readOnly || errors.size > 0} onClick={() => setNotice(`${rows.length} rows saved locally`)}>Save table</ActionButton></div>
    </Panel>

    {importOpen && <AccessibleModal title={fixture.copy.importTitle} description={fixture.copy.importDescription} onClose={() => setImportOpen(false)} footer={<><ActionButton variant="ghost" onClick={() => setImportOpen(false)}>Cancel</ActionButton><ActionButton variant="secondary" onClick={previewImport}>Preview import</ActionButton><ActionButton variant="primary" disabled={!previewRows} onClick={applyImport}>Apply {previewRows?.length ?? 0} rows</ActionButton></>}>
      <div className={styles.importForm}><label>JSON or CSV<textarea value={importText} onChange={(event) => { setImportText(event.target.value); setPreviewRows(null); setImportError(""); }} placeholder={fixture.copy.importPlaceholder} /></label>{importError && <InlineNotice tone={previewRows ? "warning" : "danger"}>{importError}</InlineNotice>}{previewRows && <div className={styles.importPreview}><strong>Import preview</strong>{previewRows.map((row) => <div key={row.id}><span>{row.label || "Missing label"}</span><small>{row.category} · {row.included ? "Included" : "Excluded"}</small><Badge tone={validateTableRows(previewRows).has(row.id) ? "risk" : "good"}>{validateTableRows(previewRows).has(row.id) ? "Needs attention" : "Ready"}</Badge></div>)}</div>}</div>
    </AccessibleModal>}
  </div>;
}

type ReadOnlySortKey = "label" | "category" | "owner" | "updated" | "status" | "volume";
type ReadOnlyStatusFilter = "all" | "active" | "review" | "complete";

function readOnlyBadgeTone(status: ReadOnlyRow["status"]): "good" | "watch" | "neutral" {
  if (status === "Complete") return "good";
  if (status === "In review") return "watch";
  return "neutral";
}

export function ReadOnlyDataTableTemplate({ mode, resetToken, scenarioId = "base" }: TemplateProps) {
  const complete = mode === "readonly";
  const fixture = PLANNING_FIXTURES[scenarioId].readOnlyTable;
  const [rows, setRows] = useState<ReadOnlyRow[]>(() => mode === "empty" ? [] : cloneReadOnlyRows(fixture.rows, complete));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadOnlyStatusFilter>("all");
  const [sortKey, setSortKey] = useState<ReadOnlySortKey>("updated");
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("descending");
  const [notice, setNotice] = useState(complete ? "Final snapshot ready" : fixture.copy.referenceNotice);

  useEffect(() => {
    // resetToken is an explicit host-to-template reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(mode === "empty" ? [] : cloneReadOnlyRows(fixture.rows, mode === "readonly"));
    setQuery("");
    setStatusFilter("all");
    setSortKey("updated");
    setSortDirection("descending");
    setNotice(mode === "readonly" ? "Final snapshot ready" : mode === "empty" ? fixture.copy.emptyNotice : fixture.copy.referenceNotice);
  }, [fixture, mode, resetToken]);

  const visibleRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      const matchesQuery = `${row.label} ${row.category} ${row.owner} ${row.status}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && row.status === "Active")
        || (statusFilter === "review" && row.status === "In review")
        || (statusFilter === "complete" && row.status === "Complete");
      return matchesQuery && matchesStatus;
    });
    return [...filtered].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];
      const comparison = typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue));
      return sortDirection === "ascending" ? comparison : -comparison;
    });
  }, [query, rows, sortDirection, sortKey, statusFilter]);

  const setSort = (nextKey: ReadOnlySortKey) => {
    if (sortKey === nextKey) setSortDirection((current) => current === "ascending" ? "descending" : "ascending");
    else {
      setSortKey(nextKey);
      setSortDirection("ascending");
    }
    setNotice(`Sorted by ${nextKey}`);
  };
  const exportView = () => {
    const csv = [
      "label,category,owner,updated,status,volume",
      ...visibleRows.map((row) => [row.label, row.category, row.owner, row.updated, row.status, row.volume].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")),
    ].join("\n");
    downloadText(fixture.copy.exportFileName, csv, "text/csv");
    setNotice(`${visibleRows.length} visible rows exported`);
  };
  const sortableHeader = (label: string, key: ReadOnlySortKey, align?: "right") => <th aria-sort={sortKey === key ? sortDirection : "none"} className={align === "right" ? styles.numericColumn : undefined}>
    <button type="button" onClick={() => setSort(key)}>{label}<span aria-hidden="true">{sortKey === key ? sortDirection === "ascending" ? "↑" : "↓" : "↕"}</span></button>
  </th>;
  const completeCount = rows.filter((row) => row.status === "Complete").length;
  const totalVolume = rows.reduce((total, row) => total + row.volume, 0);
  const categoryCount = new Set(rows.map((row) => row.category)).size;

  return <div className={styles.templateRoot}>
    <header className={styles.templateHeader}><div><small>{fixture.copy.eyebrow}</small><h3>{fixture.copy.title}</h3><span>{fixture.copy.detail}</span></div><Badge tone={complete ? "good" : "neutral"}>{complete ? "Complete snapshot" : "Reference view"}</Badge></header>
    {complete && <InlineNotice tone="success">{fixture.copy.finalNotice}</InlineNotice>}
    <div className={styles.readonlySummary} aria-label="Table summary">
      <Metric label={fixture.copy.visibleLabel} value={String(visibleRows.length)} detail={`${rows.length} total`} tone="neutral" />
      <Metric label={fixture.copy.completeLabel} value={String(completeCount)} detail={`${rows.length ? Math.round(completeCount / rows.length * 100) : 0}% of records`} tone="good" />
      <Metric label={fixture.copy.categoryLabel} value={String(categoryCount)} detail={fixture.copy.categoryDetail} tone="neutral" />
      <Metric label={fixture.copy.volumeLabel} value={String(totalVolume)} detail={fixture.copy.volumeDetail} tone="neutral" />
    </div>
    <Panel title={fixture.copy.panelTitle} eyebrow={fixture.copy.panelEyebrow} action={<ActionButton variant="secondary" disabled={visibleRows.length === 0} onClick={exportView}>Export view</ActionButton>}>
      <div className={`${styles.tableToolbar} ${styles.readonlyToolbar}`}><label><span>Search records</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fixture.copy.searchPlaceholder} /></label><Segmented label="Filter status" value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "review", label: "In review" }, { value: "complete", label: "Complete" }]} /><span aria-live="polite">{notice}</span></div>
      {rows.length === 0 ? <div className={styles.tableEmpty}><EmptyState title={fixture.copy.emptyTitle} copy={fixture.copy.emptyCopy} action={<ActionButton variant="primary" onClick={() => { setRows(cloneReadOnlyRows(fixture.rows)); setNotice(fixture.copy.loadedNotice); }}>{fixture.copy.loadLabel}</ActionButton>} /></div> : <div className={`${styles.readonlyTable} ${styles.resultsTable}`}><table><thead><tr>{sortableHeader(fixture.copy.itemColumn, "label")}{sortableHeader(fixture.copy.categoryColumn, "category")}{sortableHeader(fixture.copy.ownerColumn, "owner")}{sortableHeader(fixture.copy.updatedColumn, "updated")}{sortableHeader(fixture.copy.statusColumn, "status")}{sortableHeader(fixture.copy.volumeColumn, "volume", "right")}</tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id}><td><strong>{row.label}</strong><small>{row.id.toUpperCase()}</small></td><td>{row.category}</td><td>{row.owner}</td><td><time dateTime={row.updated}>{row.updated}</time></td><td><Badge tone={readOnlyBadgeTone(row.status)}>{row.status}</Badge></td><td className={styles.numericColumn}>{row.volume}</td></tr>)}{visibleRows.length === 0 && <tr><td colSpan={6}><div className={styles.listEmpty}>No records match the current search and status filter.</div></td></tr>}</tbody></table></div>}
      <div className={`${styles.tableFooter} ${styles.readonlyFooter}`}><span><Badge tone={complete ? "good" : "neutral"}>{complete ? "Finalised" : "Live reference"}</Badge></span><span>{visibleRows.length} of {rows.length} rows shown</span><ActionButton variant="secondary" disabled={visibleRows.length === 0} onClick={exportView}>Export CSV</ActionButton></div>
    </Panel>
  </div>;
}
