"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type React from "react";
import Link from "next/link";
import PortfolioBrand from "./PortfolioBrand";
import { usePersistentDarkMode } from "./usePersistentTheme";
import { usePersistentSidebar } from "./usePersistentSidebar";
import ClassicBlueprintHero, { type ClassicBlueprintItem } from "./ClassicBlueprintHero";
import CompassPatternSections from "./CompassPatternSections";
import PatternBoundarySpecimen from "./PatternBoundarySpecimen";
import dccTrackerScenario from "../public/poc-tracker-components/scenarios/dcc-hackathon.json";
import { compassPatterns } from "./foundation/patternCatalogue";
import { useScenario } from "./useScenario";
import {
  trackerDccPatternDescriptions,
  trackerDemoUrl,
  trackerPatternFixtures,
  type TrackerRouteKey,
} from "./trackerScenarioFixtures";
import { sitePath } from "./site-paths";
import {
  dccDependencyExplorerLaunchKey,
  dccDependencyExplorerPayload,
  dccDocuments,
  dccReviewFindings,
  dccStandards,
  scenarios,
  type ScenarioId,
} from "./scenarios";

type SystemStyle = "compass" | "tracker";
type Decision = "pending" | "approved" | "declined";
type CriticalDependency = { id:string; sourceId:string; targetId:string };
type ComponentKey = "controls" | "feedback" | "upload" | "dependency" | "critical" | "flow" | "actions" | "generic-feedback" | "status" | "surfaces" | "navigation" | "content" | "forms" | "data" | "files" | "guided" | `individual-${string}` | `tracker-screen-${string}`;
type BlueprintFocus = "foundations" | "controls" | "workflow" | "source";
type ColourMode = "light" | "dark";

type ColourTheme = {
  canvas:string; surface:string; surfaceSoft:string; border:string; text:string; muted:string;
  tokens:Array<{ name:string; role:string; value:string }>;
};

type ColourTokenOverrides = Partial<Record<SystemStyle,Partial<Record<ColourMode,Partial<Record<string,string>>>>>>;

const colourSystems:Record<SystemStyle,Record<ColourMode,ColourTheme>> = {
  compass:{
    light:{ canvas:"#F7F8FA", surface:"#FFFFFF", surfaceSoft:"#F2F5F7", border:"#E5E7EB", text:"#1F2933", muted:"#596579", tokens:[
      { name:"Ink", role:"Primary text", value:"#1F2933" },{ name:"CGI red", role:"Brand and action", value:"#E31937" },{ name:"Burgundy", role:"Pressed and emphasis", value:"#991F3D" },{ name:"Blue", role:"Information", value:"#285D9E" },{ name:"Green", role:"Success", value:"#247348" },{ name:"Amber", role:"Warning", value:"#8A5B00" },
    ] },
    dark:{ canvas:"#0D1117", surface:"#151B23", surfaceSoft:"#1B222C", border:"#303A46", text:"#F0F3F6", muted:"#A9B4C0", tokens:[
      { name:"Paper", role:"Primary text", value:"#F0F3F6" },{ name:"CGI red", role:"Brand and action", value:"#FF5E73" },{ name:"Red highlight", role:"Pressed and emphasis", value:"#FF8798" },{ name:"Blue", role:"Information", value:"#79A9E4" },{ name:"Green", role:"Success", value:"#69C18C" },{ name:"Amber", role:"Warning", value:"#FFC65D" },
    ] },
  },
  tracker:{
    light:{ canvas:"#F6F7F9", surface:"#FFFFFF", surfaceSoft:"#F9FAFB", border:"#DFE3EA", text:"#172033", muted:"#596579", tokens:[
      { name:"Ink", role:"Primary text", value:"#172033" },{ name:"Plum", role:"Brand and selection", value:"#6554C0" },{ name:"Action blue", role:"Links and focus", value:"#0C66E4" },{ name:"Green", role:"Complete", value:"#24875F" },{ name:"Amber", role:"Warning", value:"#8A5A00" },{ name:"Red", role:"Blocked and risk", value:"#BF2600" },
    ] },
    dark:{ canvas:"#0D1117", surface:"#151B23", surfaceSoft:"#1B222C", border:"#303A46", text:"#F0F3F6", muted:"#A9B4C0", tokens:[
      { name:"Paper", role:"Primary text", value:"#F0F3F6" },{ name:"Plum", role:"Brand and selection", value:"#9B8CFF" },{ name:"Action blue", role:"Links and focus", value:"#78B2FF" },{ name:"Green", role:"Complete", value:"#62C89B" },{ name:"Amber", role:"Warning", value:"#F2BD55" },{ name:"Red", role:"Blocked and risk", value:"#FF8A72" },
    ] },
  },
};

function getColourTheme(system:SystemStyle, mode:ColourMode, overrides:ColourTokenOverrides):ColourTheme {
  const theme = colourSystems[system][mode];
  const tokenOverrides = overrides[system]?.[mode];
  if (!tokenOverrides) return theme;
  return { ...theme, tokens:theme.tokens.map((token) => ({ ...token, value:tokenOverrides[token.name] ?? token.value })) };
}

function getLiveThemeStyle(system:SystemStyle, mode:ColourMode, theme:ColourTheme, overrides:Partial<Record<string,string>> | undefined):CSSProperties {
  if (!overrides || !Object.keys(overrides).length) return {};
  const style:Record<string,string> = {};
  const softMix = mode === "dark" ? 22 : 11;
  const setSemanticColour = (name:string, variable:string) => {
    const value = overrides[name];
    if (!value) return;
    style[`--${variable}`] = value;
    style[`--${variable}-soft`] = `color-mix(in srgb, ${value} ${softMix}%, ${theme.surface})`;
    style[`--${variable}-strong`] = `color-mix(in srgb, ${value} 76%, ${theme.text})`;
  };

  const textName = mode === "dark" ? "Paper" : "Ink";
  if (overrides[textName]) style["--text"] = overrides[textName];

  if (system === "compass") {
    setSemanticColour("CGI red","primary");
    if (overrides["CGI red"]) {
      style["--danger"] = overrides["CGI red"];
      style["--danger-soft"] = `color-mix(in srgb, ${overrides["CGI red"]} ${softMix}%, ${theme.surface})`;
    }
    const strongName = mode === "dark" ? "Red highlight" : "Burgundy";
    if (overrides[strongName]) style["--primary-strong"] = overrides[strongName];
    setSemanticColour("Blue","info");
    setSemanticColour("Green","success");
    setSemanticColour("Amber","warning");
  } else {
    setSemanticColour("Plum","primary");
    setSemanticColour("Action blue","info");
    setSemanticColour("Green","success");
    setSemanticColour("Amber","warning");
    setSemanticColour("Red","danger");
  }

  return style as CSSProperties;
}

const blueprintViews: Array<{ id:BlueprintFocus; number:string; label:string; description:string; focus:string; highlights:string[] }> = [
  { id:"foundations", number:"01", label:"Foundations", description:"Principles and system intent", focus:"Sets the visual rules and decision principles that keep every screen coherent.", highlights:["Design tokens","System principles","Theme identity"] },
  { id:"controls", number:"02", label:"Controls", description:"Interactive UI states", focus:"Shows reusable controls in meaningful working, validation, and status states.", highlights:["Actions","Search","Status","Toggles"] },
  { id:"workflow", number:"03", label:"Workflow", description:"Routes and dependencies", focus:"Makes progress, gates, ownership, and dependencies visible from start to outcome.", highlights:["Stage gates","Progress","Dependencies","Ownership"] },
  { id:"source", number:"04", label:"Source", description:"Reusable implementation", focus:"Packages each pattern so teams can inspect, adapt, and connect it to real data.", highlights:["React + TypeScript","Example data","Integration contract","Copy or download"] },
];

const individualHeroItems: ClassicBlueprintItem[] = [
  { id:"foundations", number:"01", title:"Foundations", description:"Shared tokens and accessible defaults keep every primitive coherent.", focus:"Small parts that inherit one strong system.", highlights:["Design tokens","Theme aware","Accessible","Responsive"] },
  { id:"controls", number:"02", title:"Live controls", description:"Search components and working interaction states.", focus:"Reusable controls shown in the states teams actually need.", highlights:["Actions","Inputs","Status","Toggles"] },
  { id:"workflow", number:"03", title:"Guided patterns", description:"Compose primitives into clear, recoverable working flows.", focus:"From a single control to a complete user journey.", highlights:["Collect","Validate","Review","Complete"] },
  { id:"source", number:"04", title:"Inspectable source", description:"Implementation, example data, and contracts stay ready to adapt.", focus:"Every component can be inspected, copied, and connected.", highlights:["Component.tsx","Example data","Integration contract","Download"] },
];

const componentCatalog: Record<string,{ name:string; summary:string; fileName:string; stack:string[]; behaviour:string[]; accessibility:string[]; code:string }> = {
  controls:{ name:"Controls", summary:"Buttons, selects, search, checkbox, and toggle patterns with shared semantic tokens.", fileName:"Controls.tsx", stack:["React + TypeScript", "Native form controls", "CSS custom-property tokens"], behaviour:["Primary, secondary, quiet, danger, and disabled states", "Native select and checkbox behaviour", "Theme-aware focus, hover, and selected states"], accessibility:["Visible :focus-visible treatment", "Explicit labels and native keyboard behaviour", "Colour is supported by text and shape"], code:String.raw`import { useState } from "react";

export function Controls() {
  const [criticalOnly, setCriticalOnly] = useState(true);
  return <div className="control-grid">
    <button className="button primary">Primary action</button>
    <button className="button secondary">Secondary</button>
    <label>Environment<select defaultValue="production"><option value="production">Production</option><option>Development</option></select></label>
    <label>Search<input type="search" placeholder="Code, title, tag…" /></label>
    <label><input type="checkbox" checked={criticalOnly} onChange={(event) => setCriticalOnly(event.target.checked)} /> Critical work only</label>
  </div>;
}` },
  feedback:{ name:"Feedback & status", summary:"Compact status badges and notices that communicate meaning without relying on colour alone.", fileName:"FeedbackStatus.tsx", stack:["React + TypeScript", "Semantic status tokens", "Composable notice pattern"], behaviour:["Five delivery states", "Information and warning notices", "Dismiss control ready for parent-owned state"], accessibility:["Every tone includes a text label", "Notices keep readable contrast in both themes", "Dismiss buttons expose an accessible name"], code:String.raw`type Tone = "success" | "info" | "warning" | "danger" | "neutral";

export function StatusBadge({ tone, children }: { tone:Tone; children:React.ReactNode }) {
  return <span className={"badge " + tone}><span className="status-dot" aria-hidden="true" />{children}</span>;
}

export function Notice({ title, copy, onDismiss }: { title:string; copy:string; onDismiss:()=>void }) {
  return <div className="notice" role="status"><span aria-hidden="true">i</span><div><strong>{title}</strong><p>{copy}</p></div><button onClick={onDismiss} aria-label="Dismiss notice">×</button></div>;
}` },
  upload:{ name:"Architecture upload wizard", summary:"A four-step evidence intake and human-review flow with realistic example states.", fileName:"ArchitectureUploadWizard.tsx", stack:["React state machine", "Native file input", "Example review data"], behaviour:["Environment selection and file capture", "Approve, decline, edit, and undo review decisions", "Scope confirmation is gated by approved findings"], accessibility:["Numbered steps retain visible labels", "Review findings use tab semantics", "Progress, disabled actions, and results are announced in text"], code:String.raw`import { useState } from "react";

const steps = ["Environments", "Documents", "AI review", "Confirm scope"];

export function ArchitectureUploadWizard() {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  return <section aria-label="Architecture evidence upload">
    <p>Step {step} of {steps.length} · {steps[step - 1]}</p>
    {step === 2 && <label>Evidence file<input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /></label>}
    {fileName && <p>{fileName} is ready for review.</p>}
    <button disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
    <button disabled={step === 2 && !fileName} onClick={() => setStep(Math.min(4, step + 1))}>Continue</button>
  </section>;
}` },
  dependency:{ name:"Dependency explorer", summary:"A focused environment visualiser for exploring, editing, importing, and exporting system relationships.", fileName:"dependency-explorer.html", stack:["Standalone HTML", "CSS + browser JavaScript", "No runtime dependencies"], behaviour:["Search, filters, focus, pan, and zoom", "Environment editing plus import and export", "Representative data and a complete visual language"], accessibility:["Named controls and visible selection states", "Keyboard-operable toolbar actions", "Text details accompany the visual graph"], code:"" },
  critical:{ name:"Critical-path planner", summary:"An interactive dependency canvas and readiness list with editable links and automatic layout.", fileName:"CriticalPathPlanner.tsx", stack:["React + TypeScript", "SVG dependency edges", "Derived DAG layout"], behaviour:["Task and phase aggregation", "Remove, add, validate, and reset dependencies", "Canvas and list presentations with combined filters"], accessibility:["Dependency controls have text labels", "List view provides a non-canvas equivalent", "Status always includes a written label"], code:String.raw`import { useMemo, useState } from "react";

type Task = { id:string; title:string; dependencies:string[] };
const initial:Task[] = [{ id:"scope", title:"Approve scope", dependencies:[] }, { id:"data", title:"Prepare data", dependencies:["scope"] }];

export function CriticalPathPlanner() {
  const [tasks, setTasks] = useState(initial);
  const edges = useMemo(() => tasks.flatMap((task) => task.dependencies.map((source) => ({ source, target:task.id }))), [tasks]);
  const removeDependency = (source:string, target:string) => setTasks((current) => current.map((task) => task.id === target ? { ...task, dependencies:task.dependencies.filter((id) => id !== source) } : task));
  return <section><h2>Critical path</h2><p>{tasks.length} tasks · {edges.length} dependencies</p>{tasks.map((task) => <article key={task.id}><strong>{task.title}</strong><span>{task.dependencies.length} links</span></article>)}<button onClick={() => removeDependency("scope", "data")}>Remove dependency</button></section>;
}` },
  flow:{ name:"Route-aware process flow", summary:"A selectable delivery route with stage contracts, keyboard navigation, and editable status.", fileName:"ProcessFlow.tsx", stack:["React + TypeScript", "Route-derived stages", "Parent-owned status state"], behaviour:["Standard and expedited routes", "Selectable stage with entry, action, and exit detail", "Live status updates for every stage"], accessibility:["Arrow-key stage navigation", "Current stage uses aria-current", "Route buttons expose pressed state"], code:String.raw`import { useState } from "react";

const stages = [{ id:"A", title:"Frame", owner:"Product" }, { id:"B", title:"Approve scope", owner:"Programme lead" }, { id:"C", title:"Prototype", owner:"Delivery team" }];

export function ProcessFlow() {
  const [selected, setSelected] = useState("A");
  return <section aria-label="Delivery process flow"><div className="flow-track">{stages.map((stage) => <button key={stage.id} aria-current={selected === stage.id ? "step" : undefined} onClick={() => setSelected(stage.id)}><span>{stage.id}</span><strong>{stage.title}</strong><small>{stage.owner}</small></button>)}</div></section>;
}` },
  actions:{ name:"Action components", summary:"A consistent action hierarchy for labelled, icon-assisted, and icon-only controls.", fileName:"Actions.tsx", stack:["React + TypeScript", "Polymorphic button props", "Shared size and tone tokens"], behaviour:["Primary, secondary, quiet, and destructive tones", "Loading and disabled states", "Optional leading or trailing icon"], accessibility:["Icon-only controls require an accessible label", "Loading state remains announced", "Minimum 40px interaction target"], code:String.raw`type ActionTone = "primary" | "secondary" | "quiet" | "danger";

export function Button({ tone = "primary", loading, children, ...props }) {
  return <button className={"button " + tone} aria-busy={loading} {...props}>
    {loading ? "Working…" : children}
  </button>;
}

export function IconButton({ icon, label, children, ...props }) {
  return <button aria-label={children ? undefined : label} {...props}>
    <span aria-hidden="true">{icon}</span>{children}
  </button>;
}` },
  "generic-feedback":{ name:"Feedback components", summary:"Transient and interruptive feedback patterns with a clear escalation path.", fileName:"Feedback.tsx", stack:["React portal", "Focus-managed modal", "Live-region toast queue"], behaviour:["Toast and alert-toast variants", "Confirmation before destructive work", "Modal title, content, and action slots"], accessibility:["Toast queue uses polite or assertive live regions", "Dialog focus is contained and restored", "Escape closes non-destructive dialogs"], code:String.raw`export function Toast({ tone = "info", title, message, onDismiss }) {
  return <div className={"toast " + tone} role={tone === "danger" ? "alert" : "status"}>
    <div><strong>{title}</strong><p>{message}</p></div>
    <button onClick={onDismiss} aria-label="Dismiss notification">×</button>
  </div>;
}

export function ConfirmDialog({ open, title, onConfirm, onCancel, children }) {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <h2 id="confirm-title">{title}</h2>{children}
    <button onClick={onCancel}>Cancel</button><button onClick={onConfirm}>Confirm</button>
  </div>;
}` },
  status:{ name:"Status components", summary:"Composable delivery state indicators that pair colour with text, shape, and iconography.", fileName:"Status.tsx", stack:["Semantic status map", "Controlled select", "Shared badge primitives"], behaviour:["Badge, pill, icon, and editable select variants", "Single canonical label per status", "Tone is derived from domain state"], accessibility:["Never communicates through colour alone", "Decorative icons are hidden", "Select retains a visible label"], code:String.raw`const statusMap = {
  complete: { label:"Complete", icon:"✓", tone:"success" },
  review: { label:"In review", icon:"◐", tone:"info" },
  blocked: { label:"Blocked", icon:"!", tone:"danger" }
};

export function StatusPill({ status }) {
  const item = statusMap[status];
  return <span className={"status-pill " + item.tone}><i aria-hidden="true">{item.icon}</i>{item.label}</span>;
}` },
  surfaces:{ name:"Surface components", summary:"Reusable containers for grouping content, facts, and operational metrics.", fileName:"Surfaces.tsx", stack:["Composable React children", "Density variants", "Responsive metric grid"], behaviour:["Panel and card hierarchy", "Optional heading and actions", "Metric cards collapse into a strip"], accessibility:["Uses semantic section and article landmarks", "Headings remain caller-owned", "Metrics retain labels and units"], code:String.raw`export function Panel({ title, action, children }) {
  return <section className="panel"><header><h2>{title}</h2>{action}</header>{children}</section>;
}

export function MetricCard({ label, value, trend }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{trend}</small></article>;
}

export function MetricStrip({ metrics }) {
  return <div className="metric-strip">{metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>;
}` },
  navigation:{ name:"Navigation components", summary:"Location, view, and mode controls with one predictable selected-state language.", fileName:"Navigation.tsx", stack:["Native links and buttons", "Roving tab selection", "URL-ready values"], behaviour:["Breadcrumb location trail", "Tabs for content views", "Segmented control for compact modes"], accessibility:["Tabs expose tablist semantics", "Current breadcrumb uses aria-current", "Selected segments expose pressed state"], code:String.raw`export function Tabs({ items, value, onChange }) {
  return <div role="tablist">{items.map((item) =>
    <button role="tab" aria-selected={value === item.id} onClick={() => onChange(item.id)} key={item.id}>{item.label}</button>
  )}</div>;
}

export function Breadcrumbs({ items }) {
  return <nav aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={item.label}>
    <a href={item.href} aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</a>
  </li>)}</ol></nav>;
}` },
  content:{ name:"Content components", summary:"Progressive-disclosure patterns for empty, expandable, and in-progress content.", fileName:"Content.tsx", stack:["Native details element", "Semantic progress", "Optional empty-state action"], behaviour:["Empty state with next action", "Disclosure supports default-open state", "Progress accepts determinate values"], accessibility:["Progress exposes value and label", "Disclosure uses native keyboard behaviour", "Empty states remain useful without illustration"], code:String.raw`export function EmptyState({ title, message, action }) {
  return <div className="empty-state"><strong>{title}</strong><p>{message}</p>{action}</div>;
}

export function Disclosure({ title, children, open = false }) {
  return <details open={open}><summary>{title}</summary><div>{children}</div></details>;
}

export function ProgressBar({ value, label }) {
  return <label>{label}<progress max="100" value={value}>{value}%</progress><span>{value}%</span></label>;
}` },
  forms:{ name:"Form components", summary:"Labelled fields, validation messages, grouped sections, and reusable filter composition.", fileName:"Forms.tsx", stack:["React form controls", "Validation contract", "Composable field layout"], behaviour:["Hint and error messaging", "Section-level description", "Filter reset and apply actions"], accessibility:["Errors are associated with their fields", "Required state is written", "Filter grouping uses a named region"], code:String.raw`export function FormField({ id, label, hint, error, required, children }) {
  const messageId = error ? id + "-error" : hint ? id + "-hint" : undefined;
  return <label htmlFor={id}><span>{label}{required && " (required)"}</span>
    {children({ id, "aria-describedby":messageId, "aria-invalid":Boolean(error) })}
    {error ? <small id={messageId} role="alert">{error}</small> : hint && <small id={messageId}>{hint}</small>}
  </label>;
}` },
  data:{ name:"Data components", summary:"Read-only and editable tabular data patterns with clear row and cell actions.", fileName:"DataTable.tsx", stack:["Typed column definitions", "Controlled edit callbacks", "Responsive table shell"], behaviour:["Sortable data table", "Inline editable cells", "Row selection and batch actions"], accessibility:["Native table structure", "Sort direction is announced", "Every edit action names its row"], code:String.raw`export function DataTable({ columns, rows, sort, onSort }) {
  return <table><thead><tr>{columns.map((column) => <th key={column.key} aria-sort={sort.key === column.key ? sort.direction : "none"}>
    <button onClick={() => onSort(column.key)}>{column.label}</button>
  </th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>
    {columns.map((column) => <td key={column.key}>{row[column.key]}</td>)}
  </tr>)}</tbody></table>;
}` },
  files:{ name:"File components", summary:"File selection and import/export actions with explicit validation and processing state.", fileName:"Files.tsx", stack:["Native file input", "Upload state machine", "Import/export adapters"], behaviour:["Drag or browse selection", "File type and size validation", "Import progress and export action"], accessibility:["Drop zone is also keyboard operable", "Selected file is announced in text", "Errors describe accepted formats"], code:String.raw`export function FileUpload({ accept, file, onChange, error }) {
  return <label className="file-upload"><input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0])} />
    <span>{file ? file.name : "Drop a file or browse"}</span>
    <small>{error || "XLSX, CSV or JSON · 10MB maximum"}</small>
  </label>;
}` },
  guided:{ name:"Guided-flow components", summary:"A reusable wizard shell that makes progress, validation, and next actions explicit.", fileName:"Wizard.tsx", stack:["Controlled step index", "Composable step content", "Validation-aware navigation"], behaviour:["Horizontal or compact stepper", "Back, continue, and completion actions", "Per-step validation gates"], accessibility:["Current step uses aria-current", "Step count is always written", "Focus moves to the new step heading"], code:String.raw`export function Wizard({ steps, current, onBack, onNext, children }) {
  return <section aria-labelledby="wizard-title"><p>Step {current + 1} of {steps.length}</p>
    <ol>{steps.map((step, index) => <li aria-current={index === current ? "step" : undefined} key={step}>{step}</li>)}</ol>
    <h2 id="wizard-title">{steps[current]}</h2>{children}
    <button disabled={current === 0} onClick={onBack}>Back</button>
    <button onClick={onNext}>{current === steps.length - 1 ? "Complete" : "Continue"}</button>
  </section>;
}` },
};

const componentStructures: Record<string,{ dataFile:string; data:string; apiFile:string; api:string }> = {
  controls:{ dataFile:"controls.mock-data.json", data:String.raw`{
  "environment": "production",
  "query": "",
  "criticalOnly": true,
  "autoArrange": true,
  "actions": [
    { "id": "primary", "label": "Primary action", "enabled": true },
    { "id": "remove", "label": "Remove", "enabled": true }
  ]
}`, apiFile:"controls.contract.ts", api:String.raw`export interface ControlsProps {
  environment: "production" | "pre-production" | "development";
  query?: string;
  criticalOnly?: boolean;
  autoArrange?: boolean;
  onEnvironmentChange(value:ControlsProps["environment"]): void;
  onQueryChange(value:string): void;
  onCriticalOnlyChange(value:boolean): void;
}` },
  feedback:{ dataFile:"feedback.mock-data.json", data:String.raw`{
  "badges": [
    { "tone": "success", "label": "Complete" },
    { "tone": "info", "label": "In review" },
    { "tone": "warning", "label": "Needs attention" },
    { "tone": "danger", "label": "Blocked" }
  ],
  "notice": {
    "id": "review-ready",
    "title": "Three insights are ready for review",
    "dismissible": true
  }
}`, apiFile:"feedback.contract.ts", api:String.raw`export type FeedbackTone = "success" | "info" | "warning" | "danger" | "neutral";

export interface StatusBadgeProps {
  tone: FeedbackTone;
  label: string;
}

export interface NoticeProps {
  id: string;
  title: string;
  copy?: string;
  tone?: FeedbackTone;
  onDismiss?(id:string): void;
}` },
  upload:{ dataFile:"architecture-upload.mock-data.json", data:String.raw`{
  "runId": "ARC-2026-018",
  "step": 3,
  "environments": ["Production"],
  "evidence": {
    "fileName": "current-state-architecture-v4.pdf",
    "pages": 18,
    "status": "processed"
  },
  "findings": [
    { "id": "apim", "title": "Azure API Management", "confidence": 0.94, "decision": "pending" }
  ]
}`, apiFile:"architecture-upload.api.ts", api:String.raw`POST /api/architecture/runs
Content-Type: multipart/form-data

type CreateRunRequest = {
  environments: string[];
  documentType: string;
  evidence: File;
};

type ReviewFindingRequest = {
  findingId: string;
  decision: "approved" | "declined";
  note?: string;
};

PATCH /api/architecture/runs/:runId/findings/:findingId` },
  dependency:{ dataFile:"dependency-landscape.mock-data.json", data:String.raw`{
  "environment": "Production",
  "systems": [
    { "id": "gateway", "name": "API Gateway", "owner": "Platform Engineering", "external": false },
    { "id": "salesforce", "name": "Salesforce", "owner": "Customer Platforms", "external": true }
  ],
  "dependencies": [
    { "sourceId": "salesforce", "targetId": "gateway", "type": "synchronises-with" }
  ]
}`, apiFile:"dependency-landscape.api.ts", api:String.raw`GET /api/environments/:environmentId/landscape

type LandscapeResponse = {
  systems: SystemRecord[];
  dependencies: DependencyRecord[];
  updatedAt: string;
};

PUT /api/environments/:environmentId/dependencies/:dependencyId
DELETE /api/environments/:environmentId/dependencies/:dependencyId
POST /api/environments/:environmentId/import` },
  critical:{ dataFile:"critical-path.mock-data.json", data:String.raw`{
  "planId": "retail-modernisation",
  "tasks": [
    { "id": "scope", "code": "GOV-02", "progress": 100, "status": "Complete" },
    { "id": "data", "code": "DAT-03", "progress": 72, "status": "In progress" }
  ],
  "dependencies": [
    { "id": "scope-data", "sourceId": "scope", "targetId": "data" }
  ]
}`, apiFile:"critical-path.api.ts", api:String.raw`GET /api/plans/:planId/critical-path

type DependencyMutation = {
  sourceId: string;
  targetId: string;
};

POST /api/plans/:planId/dependencies
DELETE /api/plans/:planId/dependencies/:dependencyId

// Server validates missing targets, duplicates, and cycles.
type ValidationResult = { valid:boolean; errors:string[] };` },
  flow:{ dataFile:"process-flow.mock-data.json", data:String.raw`{
  "route": "standard",
  "stages": [
    { "id": "A", "title": "Frame", "owner": "Product", "status": "complete" },
    { "id": "C", "title": "Prototype", "owner": "Delivery team", "status": "in-progress" },
    { "id": "E", "title": "Assure", "owner": "Assurance", "status": "blocked" }
  ]
}`, apiFile:"process-flow.api.ts", api:String.raw`GET /api/delivery-routes/:routeId

export interface StageStatusUpdate {
  stageId: string;
  status: "complete" | "in-progress" | "required" | "blocked" | "conditional" | "not-started" | "skipped";
}

PATCH /api/delivery-routes/:routeId/stages/:stageId
Body: StageStatusUpdate` },
  actions:{ dataFile:"actions.mock-data.json", data:String.raw`{"tone":"primary","size":"medium","loading":false,"disabled":false,"label":"Save changes"}`, apiFile:"actions.contract.ts", api:String.raw`export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "secondary" | "quiet" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  icon?: React.ReactNode;
}` },
  "generic-feedback":{ dataFile:"feedback.mock-data.json", data:String.raw`{"toast":{"tone":"success","title":"Changes saved","message":"The architecture record is up to date."},"confirm":{"title":"Remove dependency?","confirmLabel":"Remove"}}`, apiFile:"feedback.contract.ts", api:String.raw`export interface ToastOptions { id?:string; tone:"info"|"success"|"warning"|"danger"; title:string; message?:string; duration?:number; }
export interface ConfirmOptions { title:string; message:string; confirmLabel?:string; destructive?:boolean; }
export function showToast(options:ToastOptions): string;
export function confirmAction(options:ConfirmOptions): Promise<boolean>;` },
  status:{ dataFile:"status.mock-data.json", data:String.raw`{"value":"review","options":["not-started","in-progress","review","complete","blocked"]}`, apiFile:"status.contract.ts", api:String.raw`export type WorkflowStatus = "not-started"|"in-progress"|"review"|"complete"|"blocked";
export interface StatusProps { status:WorkflowStatus; compact?:boolean; showIcon?:boolean; }
export interface StatusSelectProps extends StatusProps { onChange(status:WorkflowStatus):void; }` },
  surfaces:{ dataFile:"metrics.mock-data.json", data:String.raw`{"metrics":[{"label":"Systems","value":24,"trend":"+3 this week"},{"label":"Critical links","value":7,"trend":"2 need review"},{"label":"Coverage","value":"86%","trend":"+4%"}]}`, apiFile:"surfaces.contract.ts", api:String.raw`export interface PanelProps { title?:string; description?:string; action?:React.ReactNode; children:React.ReactNode; }
export interface Metric { label:string; value:string|number; trend?:string; tone?:"neutral"|"positive"|"warning"; }
export interface MetricStripProps { metrics:Metric[]; columns?:2|3|4; }` },
  navigation:{ dataFile:"navigation.mock-data.json", data:String.raw`{"breadcrumbs":["Workspace","Architecture","Production"],"tabs":["Overview","Dependencies","Evidence"],"active":"Dependencies"}`, apiFile:"navigation.contract.ts", api:String.raw`export interface NavigationItem { id:string; label:string; href?:string; disabled?:boolean; }
export interface TabsProps { items:NavigationItem[]; value:string; onChange(id:string):void; }
export interface BreadcrumbsProps { items:Array<{ label:string; href?:string }>; }` },
  content:{ dataFile:"content.mock-data.json", data:String.raw`{"empty":{"title":"No dependencies yet","message":"Add the first relationship to begin mapping this system."},"progress":{"label":"Collection coverage","value":68}}`, apiFile:"content.contract.ts", api:String.raw`export interface EmptyStateProps { title:string; message:string; action?:React.ReactNode; }
export interface DisclosureProps { title:string; open?:boolean; children:React.ReactNode; }
export interface ProgressBarProps { label:string; value:number; max?:number; showValue?:boolean; }` },
  forms:{ dataFile:"forms.mock-data.json", data:String.raw`{"owner":"","environment":"Production","errors":{"owner":"Choose an accountable owner."},"filters":{"status":"All","query":""}}`, apiFile:"forms.contract.ts", api:String.raw`export interface FieldState { error?:string; hint?:string; required?:boolean; }
export interface FormFieldProps extends FieldState { id:string; label:string; children:(inputProps:Record<string,unknown>)=>React.ReactNode; }
export interface FilterBarProps { filters:FilterDefinition[]; values:Record<string,string>; onChange(values:Record<string,string>):void; onReset():void; }` },
  data:{ dataFile:"table.mock-data.json", data:String.raw`{"columns":["System","Owner","Status"],"rows":[{"id":"apim","system":"API Gateway","owner":"Platform","status":"Complete"},{"id":"crm","system":"CRM","owner":"Customer","status":"In review"}]}`, apiFile:"data-table.contract.ts", api:String.raw`export interface Column<Row> { key:keyof Row; label:string; sortable?:boolean; editable?:boolean; render?(value:unknown,row:Row):React.ReactNode; }
export interface DataTableProps<Row extends { id:string }> { columns:Column<Row>[]; rows:Row[]; sort?:{ key:keyof Row; direction:"ascending"|"descending" }; onSort?(key:keyof Row):void; onChange?(row:Row):void; }` },
  files:{ dataFile:"file-import.mock-data.json", data:String.raw`{"acceptedTypes":[".xlsx",".csv",".json"],"maxSizeMb":10,"file":{"name":"system-inventory.xlsx","size":"1.8 MB","status":"ready"}}`, apiFile:"files.contract.ts", api:String.raw`export interface FileUploadProps { accept:string; maxSize:number; value?:File; onChange(file?:File):void; onError?(message:string):void; }
export interface ImportExportPanelProps { onImport(file:File):Promise<ImportResult>; onExport():Promise<Blob>; formats:string[]; }` },
  guided:{ dataFile:"wizard.mock-data.json", data:String.raw`{"currentStep":1,"steps":[{"id":"source","label":"Choose source"},{"id":"map","label":"Map fields"},{"id":"review","label":"Review"},{"id":"complete","label":"Complete"}]}`, apiFile:"wizard.contract.ts", api:String.raw`export interface WizardStep { id:string; label:string; description?:string; optional?:boolean; validate?():boolean|Promise<boolean>; }
export interface WizardProps { steps:WizardStep[]; currentStep:number; onStepChange(index:number):void; onComplete():void; children:React.ReactNode; }` },
};

const dccComponentData: Partial<Record<ComponentKey,{ dataFile:string; data:string }>> = {
  upload:{
    dataFile:"dcc-document-assurance.mock-data.json",
    data:JSON.stringify({
      runId:"DCC-2026-018",
      scenario:"DCC Hackathon",
      standards:dccStandards.filter((standard) => ["iso-27001","wcag-22","dcc-profile"].includes(standard.id)).map((standard) => ({ id:standard.id,code:standard.code,requirements:standard.clauses })),
      document:{ fileName:dccDocuments[0].name,pages:dccDocuments[0].pages,status:"scanned" },
      findings:dccReviewFindings.map((finding) => ({ id:finding.id,requirement:finding.kind,title:finding.title,confidence:Number(finding.confidence),decision:"pending",source:finding.source })),
      approvalMode:"named-human-review",
    },null,2),
  },
  dependency:{
    dataFile:"dcc-standard-document-relationships.mock-data.json",
    data:JSON.stringify({
      scenario:"DCC Hackathon",
      ...dccDependencyExplorerPayload,
    },null,2),
  },
};

type IndividualComponent = {
  id:string;
  key:ComponentKey;
  name:string;
  category:string;
  summary:string;
  base:ComponentKey;
  source:string;
  origin?:"common"|"pattern";
  patternSources?:string[];
  aliases?:string[];
};

function normalizeComponentName(value:string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const individualComponentAliases:Readonly<Record<string,string>> = {
  alerttoast:"Toast",
  destructivebutton:"Button",
  kpicard:"MetricCard",
  trendcard:"MetricCard",
  targetmetriccard:"MetricCard",
  viewtoggle:"SegmentedControl",
  filedropzone:"FileUpload",
  editabletable:"EditableDataGrid",
  accessibledatatable:"DataTable",
  readonlytable:"DataTable",
  resultstable:"DataTable",
  suitetable:"DataTable",
  coverageareatable:"DataTable",
  datacontracttable:"DataTable",
  optionstable:"DataTable",
  sequencingtable:"DataTable",
  compactchartgrid:"ChartGrid",
  tableactions:"TableToolbar",
  emptytable:"EmptyState",
  emptycolumn:"EmptyState",
  approvalbanner:"ConfirmationBanner",
  submissionconfirmation:"ConfirmationBanner",
  missingdatanotice:"InlineNotice",
  diagramcontrols:"DiagramToolbar",
};

const baseIndividualComponents: IndividualComponent[] = [
  ["button","Button","Actions","Primary, secondary, quiet, loading, and disabled action states.","actions","Controls and both product shells"],
  ["icon-button","IconButton","Actions","An icon paired with a visible action label.","actions","Top bars and diagram toolbars"],
  ["icon-only-button","IconOnlyButton","Actions","A compact labelled control for dense toolbars.","actions","Theme, dismiss, and canvas controls"],
  ["destructive-button","DestructiveButton","Actions","A guarded action for irreversible or high-impact work.","actions","Dependency and record removal"],
  ["export-action","ExportAction","Actions","A reusable export trigger with format and progress states.","actions","Reports, graphs, and evidence tables"],
  ["toast","Toast","Feedback","A polite transient confirmation with optional action.","generic-feedback","Save and import confirmation"],
  ["alert-toast","AlertToast","Feedback","An assertive transient message for errors or blockers.","generic-feedback","Validation and upload failures"],
  ["confirm-dialog","ConfirmDialog","Feedback","A focused confirmation before consequential work.","generic-feedback","Remove dependency and delete row"],
  ["modal","Modal","Feedback","An accessible overlay shell with focus management.","generic-feedback","Editors and component workbenches"],
  ["inline-notice","InlineNotice","Feedback","Contextual information, warning, or error beside the work.","generic-feedback","Foundation feedback patterns"],
  ["confirmation-banner","ConfirmationBanner","Feedback","Persistent success feedback for completed workflows.","generic-feedback","Access confirmation and final reports"],
  ["badge","Badge","Status","A compact text label for category or state.","status","All application surfaces"],
  ["status-pill","StatusPill","Status","A semantic state label with icon and tone.","status","Planning, review, and evidence"],
  ["status-icon","StatusIcon","Status","A compact state glyph with accessible text.","status","Evidence matrices and diagrams"],
  ["status-select","StatusSelect","Status","An editable workflow state presented in place.","status","Process flow and review queues"],
  ["progress-bar","ProgressBar","Status","A labelled determinate progress indicator.","status","Collection and delivery progress"],
  ["save-status","SaveStatus","Status","Saved, saving, and error state for local edits.","status","Metadata and planning forms"],
  ["breadcrumbs","Breadcrumbs","Navigation","A concise hierarchy trail with a current location.","navigation","Library and product workspaces"],
  ["tabs","Tabs","Navigation","A content-view switch with keyboard semantics.","navigation","Dashboards and component workbenches"],
  ["segmented-control","SegmentedControl","Navigation","A compact mode or lens selector.","navigation","Canvas, list, task, and phase views"],
  ["pagination","Pagination","Navigation","Page movement with current and total context.","navigation","Tables and review queues"],
  ["stepper","Stepper","Navigation","A visible progress route through ordered work.","navigation","Upload and questionnaire flows"],
  ["form-field","FormField","Forms","A label, hint, control, and validation-message contract.","forms","All data-entry surfaces"],
  ["field-error","FieldError","Forms","An inline error associated with its source control.","forms","Validation helpers"],
  ["filter-bar","FilterBar","Forms","Composable search, select, toggle, and reset controls.","forms","Critical path and review queues"],
  ["search-input","SearchInput","Forms","A keyboard-friendly search field with clear affordance.","forms","Library and landscape search"],
  ["checkbox","Checkbox","Forms","A labelled binary choice with supporting context.","forms","Filters and environment selection"],
  ["toggle","Toggle","Forms","An immediate on/off setting with explicit state.","forms","Auto-arrange and preferences"],
  ["data-table","DataTable","Data","A readable sortable table with semantic headers.","data","Reports and evidence registers"],
  ["editable-data-grid","EditableDataGrid","Data","An in-place editing grid with controlled row updates.","data","Metadata and configuration tables"],
  ["table-toolbar","TableToolbar","Data","Search, filter, import, export, and batch table actions.","data","Input centre and reports"],
  ["review-row","ReviewRow","Data","A dense evidence row with source, status, and next action.","data","Evidence review queue"],
  ["task-card","TaskCard","Data","A movable unit of work with owner, state, and progress.","data","Kanban, backlog, and plan canvas"],
  ["panel","Panel","Surfaces","A structured content region with heading and optional action.","surfaces","All workspace screens"],
  ["card","Card","Surfaces","A flexible bordered surface for related content.","surfaces","Dashboards and records"],
  ["metric-card","MetricCard","Surfaces","A labelled value with direction and supporting context.","surfaces","Dashboard and DORA metrics"],
  ["metric-strip","MetricStrip","Surfaces","A responsive run of related operational measures.","surfaces","Dashboard summaries"],
  ["details-drawer","DetailsDrawer","Surfaces","A contextual inspector that preserves the working view.","surfaces","Lineage, graphs, and planning"],
  ["empty-state","EmptyState","Content","A useful no-data state with a clear next action.","content","Tables, charts, and collections"],
  ["disclosure","Disclosure","Content","Progressive detail using native expand and collapse behaviour.","content","Metadata and attribute groups"],
  ["key-value-list","KeyValueList","Content","A compact label-and-value readout for record facts.","content","Inspectors and summary panels"],
  ["tag-list","TagList","Content","A wrapping set of keywords, filters, or classifications.","content","Tasks, methods, and records"],
  ["file-upload","FileUpload","Files","Browse or drop a file with format guidance.","files","Evidence and import wizards"],
  ["file-row","FileRow","Files","A selected-file record with state and remove action.","files","Upload and evidence review"],
  ["import-export-panel","ImportExportPanel","Files","Paired data movement controls with supported formats.","files","Tables and environment models"],
  ["evidence-link","EvidenceLink","Files","A source-aware link with type and provenance context.","files","Review, lineage, and reports"],
  ["line-chart","LineChart","Visualisation","A compact trend chart with accessible summary.","surfaces","Discovery and delivery dashboards"],
  ["bar-chart","BarChart","Visualisation","A comparable-value chart for categorical measures.","surfaces","Metadata and complexity analysis"],
  ["waterfall-chart","WaterfallChart","Visualisation","A bridge from baseline through positive and negative steps.","surfaces","Decision and savings reports"],
  ["node-card","NodeCard","Visualisation","A selectable system or task node with ports and state.","critical","Dependency and lineage diagrams"],
  ["diagram-legend","DiagramLegend","Visualisation","A compact key for node, edge, lane, and status meaning.","critical","Architecture and plan canvases"],
  ["gantt-bar","GanttBar","Visualisation","A draggable duration bar with progress and dependency handles.","critical","Planning and schedule views"],
  ["wizard","Wizard","Guided flows","A controlled multi-step shell with validation gates.","guided","Questionnaires and evidence intake"],
  ["answer-review","AnswerReview","Guided flows","A reviewable summary before committing collected answers.","guided","Questionnaire submission"],
  ["review-dialog","ReviewDialog","Guided flows","A focused approve, change, or follow-up decision.","guided","Evidence review queue"],
  ["feedback-thread","FeedbackThread","Guided flows","A resolvable conversation attached to a document section.","guided","Document feedback loop"],
  ["recommendation-panel","RecommendationPanel","Guided flows","A decision summary with rationale, evidence, and action.","guided","Decision screen and reporting"],
].map(([id,name,category,summary,base,source]) => ({ id, key:`individual-${id}` as ComponentKey, name, category, summary, base:base as ComponentKey, source, origin:"common" as const }));

const individualComponents = baseIndividualComponents.filter((item) => !individualComponentAliases[normalizeComponentName(item.name)]);
for (const aliasItem of baseIndividualComponents) {
  const canonicalName = individualComponentAliases[normalizeComponentName(aliasItem.name)];
  if (!canonicalName) continue;
  const canonical = individualComponents.find((item) => normalizeComponentName(item.name) === normalizeComponentName(canonicalName));
  if (!canonical) continue;
  canonical.aliases = [...new Set([...(canonical.aliases ?? []),aliasItem.name])];
}

type PatternBoundarySource = { title:string; boundaries:readonly string[] };

const additionalShowroomPatternBoundaries: readonly PatternBoundarySource[] = [
  { title:"Critical-path planner", boundaries:["SegmentedControl","FilterBar","DiagramToolbar","DiagramCanvas","DiagramLane","NodeCard","DependencyLine","DependencyEditor","TaskList","TaskCard","DetailsDrawer","ValidationSummary"] },
  { title:"Route-aware process flow", boundaries:["SegmentedControl","Stepper","WorkflowStage","StepDetails","StatusSelect"] },
  { title:"Dashboard", boundaries:["Tabs","InlineNotice","KpiCard","LineChart","BarChart","StatusMatrix","DetailsDrawer"] },
  { title:"Planning backlog", boundaries:["FilterBar","PhaseGroup","TaskList","TaskRow","ReorderControls","StatusPill","DetailsDrawer","DependencyList","EmptyState"] },
  { title:"Gantt chart", boundaries:["ViewToggle","MetricStrip","PlanningGrid","PhaseGroup","GanttRow","GanttBar","ReorderControls","ScheduleEditor","DetailsDrawer","EmptyState"] },
  { title:"Workflow workbench", boundaries:["RecordSelector","Stepper","WorkflowStage","SummaryCard","TargetMetricCard","Card","EvidenceList","DetailsDrawer","RecommendationPanel","TagList"] },
  { title:"Chatbot assistant", boundaries:["InlineNotice","PromptList","ChatThread","ChatMessage","ThinkingIndicator","ChatComposer","ProposalCard","EvidenceLink","StatusPill"] },
  { title:"Earned value", boundaries:["ScenarioConfigurator","FormField","ExportAction","KpiCard","LineChart","ChartLegend","RecommendationPanel","DataTable"] },
  { title:"Architecture map", boundaries:["MetricStrip","FilterBar","DiagramCanvas","DiagramLane","NodeCard","Edge","DetailsDrawer","KeyValueList","RelationshipRow","EvidenceList","TagList","EmptyState"] },
];

function componentSlug(value:string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function classifyPatternBoundary(name:string): { category:string; base:ComponentKey } {
  const value = name.toLowerCase();
  if (/(file|dropzone|download|upload|source.*link|source.*trace|artifact|import|exportbuilder|evidence.*link)/.test(value)) return { category:"Files", base:"files" };
  if (/(diagram|graph|chart|node|edge|lane|connector|gauge|coverage|trend|kpi|complexity|contribution|savings|waterfall|topology)/.test(value)) return { category:"Visualisation", base:"surfaces" };
  if (/(table|grid|row|column|cell|queue|tasklist|evidencelist|matrix)/.test(value)) return { category:"Data", base:"data" };
  if (/(status|badge|validation|notice|banner|progress)/.test(value)) return { category:"Status", base:"status" };
  if (/(wizard|review|feedback|handoff|confirmation|checklist|resolution|resolve|approval|finalise|submission|followup|clientreport)/.test(value)) return { category:"Guided flows", base:"guided" };
  if (/(filter|form|field|input|select|configur|settings|control|factor|definition)/.test(value)) return { category:"Forms", base:"forms" };
  if (/(action|button)/.test(value)) return { category:"Actions", base:"actions" };
  if (/(navigation|toggle|stepper|tabs|pagination)/.test(value)) return { category:"Navigation", base:"navigation" };
  if (/(dashboard|card|panel|drawer|preview|editor|explorer|page|summary|story|block)/.test(value)) return { category:"Surfaces", base:"surfaces" };
  return { category:"Content", base:"content" };
}

const boundarySources = new Map<string,{ name:string; patterns:Set<string>; aliases:Set<string> }>();
const allPatternBoundarySources: readonly PatternBoundarySource[] = [
  ...compassPatterns.map((pattern) => ({ title:pattern.title, boundaries:pattern.boundaries })),
  ...additionalShowroomPatternBoundaries,
];

for (const pattern of allPatternBoundarySources) {
  for (const boundary of pattern.boundaries) {
    const boundaryName = boundary.trim();
    const canonicalName = individualComponentAliases[normalizeComponentName(boundaryName)] ?? boundaryName;
    const normalized = normalizeComponentName(canonicalName);
    const entry = boundarySources.get(normalized) ?? { name:canonicalName, patterns:new Set<string>(), aliases:new Set<string>() };
    entry.patterns.add(pattern.title);
    if (normalizeComponentName(boundaryName) !== normalized) entry.aliases.add(boundaryName);
    boundarySources.set(normalized, entry);
  }
}

const existingComponentNames = new Set(individualComponents.map((item) => normalizeComponentName(item.name)));
for (const item of individualComponents) {
  const boundary = boundarySources.get(normalizeComponentName(item.name));
  if (!boundary) continue;
  item.patternSources = [...boundary.patterns];
  item.source = item.patternSources.join(" · ");
  item.aliases = [...new Set([...(item.aliases ?? []),...boundary.aliases])];
}

for (const [normalized, boundary] of boundarySources) {
  if (existingComponentNames.has(normalized)) continue;
  const patternSources = [...boundary.patterns];
  const { category, base } = classifyPatternBoundary(boundary.name);
  const id = `pattern-${componentSlug(boundary.name)}`;
  individualComponents.push({
    id,
    key:`individual-${id}` as ComponentKey,
    name:boundary.name,
    category,
    summary:`A reusable ${boundary.name} shared across ${patternSources.length === 1 ? "one showroom pattern" : `${patternSources.length} showroom patterns`}.`,
    base,
    source:patternSources.join(" · "),
    origin:"pattern",
    patternSources,
    aliases:[...boundary.aliases],
  });
  existingComponentNames.add(normalized);
}

const individualComponentAliasCount = individualComponents.reduce((count,item) => count + (item.aliases?.length ?? 0),0);

const individualCategoryCopy:Record<string,{ title:string; copy:string }> = {
  Actions:{ title:"Actions with a clear hierarchy.", copy:"Every action is isolated so designers can compare emphasis, density, risk, and icon treatment without unrelated behaviour in the same specimen." },
  Feedback:{ title:"Feedback at the right level of interruption.", copy:"Transient, inline, persistent, and decision-blocking messages are separate components within one feedback category." },
  Status:{ title:"State that stays understandable.", copy:"Compact delivery and evidence states pair colour with explicit language, iconography, and shape." },
  Navigation:{ title:"Navigation that preserves context.", copy:"Location, view, page, and step controls share a predictable selected-state language." },
  Forms:{ title:"Inputs that help people succeed.", copy:"Field anatomy, validation, search, filtering, and binary choices are documented as independent building blocks." },
  Data:{ title:"Working patterns for dense records.", copy:"Tables, review rows, toolbars, and task cards drawn from planning, evidence, and configuration screens." },
  Surfaces:{ title:"Surfaces that create useful hierarchy.", copy:"Containers and metric treatments define relationships without adding unnecessary decoration." },
  Content:{ title:"Content states with a next move.", copy:"Absence, progressive detail, facts, and classification remain useful in every state." },
  Files:{ title:"File movement made explicit.", copy:"Selection, readiness, import/export, and evidence provenance are separated into reusable parts." },
  Visualisation:{ title:"Visual primitives, not whole dashboards.", copy:"Charts, nodes, legends, and schedule bars drawn from decision, lineage, dependency, and planning screens." },
  "Guided flows":{ title:"Guidance without hidden decisions.", copy:"Reusable review and step patterns keep progress, authority, evidence, and the next action visible." },
};

function IndividualComponentDirectory() {
  return <div className="full-index-directory" aria-label="Complete individual component index">
    {Object.keys(individualCategoryCopy).map((category,index) => {
      const items = individualComponents.filter((item) => item.category === category);
      const indexedNames = items.reduce((count,item) => count + 1 + (item.aliases?.length ?? 0),0);
      return <section data-component-category={componentSlug(category)} key={category}>
        <header><span>{String(index + 1).padStart(2,"0")}</span><div><strong>{category}</strong><small>{items.length} components · {indexedNames} indexed names</small></div></header>
        <div>{items.flatMap((item) => [
          <a href={`#component-${item.id}`} data-component-index-name={item.name} key={item.id}>{item.name}<span>↗</span></a>,
          ...(item.aliases ?? []).map((alias) => <a className="component-index-alias" href={`#component-${item.id}`} data-component-index-name={alias} data-component-index-alias-of={item.name} key={`${item.id}-${alias}`}><i>↳</i>{alias}<small>{item.name}</small></a>),
        ])}</div>
      </section>;
    })}
  </div>;
}

function safeComponentName(name:string) { return name.replace(/[^A-Za-z0-9]/g, ""); }

individualComponents.forEach((item) => {
  const base = componentCatalog[item.base];
  const componentName = safeComponentName(item.name);
  const variants = ["default",...(item.aliases ?? []).map(componentSlug)];
  const variantType = variants.map((variant) => `"${variant}"`).join(" | ");
  componentCatalog[item.key] = { name:item.name, summary:item.summary, fileName:`${componentName}.tsx`, stack:base?.stack || ["React + TypeScript","Compass design tokens","Composable props"], behaviour:[`Used across ${item.source}`,item.aliases?.length ? `Includes ${item.aliases.join(", ")} as configured variants` : "Independent default, hover, focus, disabled, and empty states","Designed for controlled or parent-owned state"], accessibility:base?.accessibility || ["Keyboard operable","Visible focus treatment","Meaning does not rely on colour"], code:String.raw`import type { HTMLAttributes, ReactNode } from "react";

export interface ${componentName}Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  state?: "default" | "active" | "disabled" | "error";
  variant?: ${variantType};
}

export function ${componentName}({ children, state = "default", variant = "default", className = "", ...props }: ${componentName}Props) {
  return <div className={"${item.id} " + state + " " + className} data-state={state} data-variant={variant} {...props}>
    {children}
  </div>;
}` };
  componentStructures[item.key] = { dataFile:`${item.id}.mock-data.json`, data:JSON.stringify({ id:`demo-${item.id}`, component:item.name, aliases:item.aliases ?? [], variants, category:item.category, state:"default", interactive:true, source:item.source },null,2), apiFile:`${item.id}.contract.ts`, api:String.raw`export interface ${componentName}Props {
  id?: string;
  state?: "default" | "active" | "disabled" | "error";
  variant?: ${variantType};
  disabled?: boolean;
  className?: string;
  onChange?(value: unknown): void;
}` };
});

const pocTrackerExamples = [
  { id:"poc-dashboard", number:"08", title:"Dashboard", category:"Decision intelligence", description:"KPI cards, distinct planning lenses, progress trends, effort allocation and drill-down context.", features:["Distinct lenses","KPI cards","Drill-down"], folder:"01-dashboard" },
  { id:"poc-planning-backlog", number:"09", title:"Planning backlog", category:"Delivery planning", description:"Phase groups, accessible reordering, filters, estimates, dependencies and task detail.", features:["Filters","Reordering","Inspector"], folder:"02-planning-backlog" },
  { id:"poc-gantt-chart", number:"10", title:"Gantt chart", category:"Delivery planning", description:"A draggable weekly planning canvas with resizing, reordering, direct editing, undo and phase roll-ups.", features:["Drag schedule","Resize tasks","Keyboard edit"], folder:"03-gantt-chart" },
  { id:"poc-workflow-workbench", number:"11", title:"Workflow workbench", category:"Generic staged workflow", description:"A configurable record-detail screen with stages, measures, supporting sections and an explicit next action.", features:["Custom stages","Record selector","Host callbacks"], folder:"06-workflow-workbench" },
  { id:"poc-chatbot", number:"12", title:"Chatbot assistant", category:"Assisted workflow", description:"Source-linked answers and proposed changes with approve, edit, reject and feedback controls.", features:["Async response","Draft approval","Sources"], folder:"07-chatbot" },
  { id:"poc-earned-value", number:"13", title:"Earned value", category:"Performance insight", description:"Explicit assumptions, schedule and cost variance, efficiency indicators and forecast curves.", features:["Editable inputs","Scenarios","JSON export"], folder:"08-earned-value" },
  { id:"poc-architecture-map", number:"14", title:"Architecture map", category:"System landscape", description:"A rich five-lane system landscape with typed interfaces, architecture filters, evidence and node inspection.", features:["15 systems","16 interfaces","Five lanes"], folder:"09-architecture-system-map" },
] as const;

const trackerFixtureKeys = {
  "poc-dashboard":"dashboard",
  "poc-planning-backlog":"planning-backlog",
  "poc-gantt-chart":"gantt-chart",
  "poc-workflow-workbench":"workflow-workbench",
  "poc-chatbot":"chatbot",
  "poc-earned-value":"earned-value",
  "poc-architecture-map":"architecture-map",
} as const;

function trackerDccStructure(componentKey:ComponentKey) {
  if (!componentKey.startsWith("tracker-screen-")) return null;
  const exampleId = componentKey.replace(/^tracker-screen-/,"") as keyof typeof trackerFixtureKeys;
  const fixtureKey = trackerFixtureKeys[exampleId];
  if (!fixtureKey) return null;
  const fixture = dccTrackerScenario.screens[fixtureKey];
  const options = "options" in fixture ? fixture.options : undefined;
  return {
    dataFile:`${fixtureKey}.dcc-hackathon.mock-data.json`,
    data:JSON.stringify({ scenario:dccTrackerScenario.id,data:fixture.data,...(options ? { options } : {}) },null,2),
  };
}

pocTrackerExamples.forEach((example) => {
  const key = `tracker-screen-${example.id}` as ComponentKey;
  componentCatalog[key] = {
    name:example.title,
    summary:example.description,
    fileName:`${example.folder}.component.js`,
    stack:["Browser JavaScript component","PoC Tracker design tokens","Host callbacks and representative data"],
    behaviour:[...example.features,"Seamlessly resizes inside the main showroom","Preserves the complete interactive behaviour"],
    accessibility:["Native keyboard controls","Visible focus and written status labels","Responsive table, chart, and inspector alternatives"],
    code:"",
  };
  componentStructures[key] = {
    dataFile:`${example.folder}.mock-data.json`,
    data:JSON.stringify({ screen:example.title, category:example.category, features:example.features, source:sitePath(`/poc-tracker-components/${example.folder}/component.js`), mode:"interactive" },null,2),
    apiFile:`${example.folder}.contract.ts`,
    api:String.raw`export interface PoCTrackerScreenOptions {
  title?: string;
  description?: string;
  onChange?(value: unknown): void;
  onSelect?(id: string): void;
}

export interface PoCTrackerScreenModule {
  mount(root: HTMLElement, initialData?: unknown, options?: PoCTrackerScreenOptions): void;
}`,
  };
});

const libraryNavigation: Array<{ id:string; componentKey:ComponentKey; name:string; type:string; system:"both"|SystemStyle; description:string }> = [
  { id:"controls", componentKey:"controls", name:"Controls", type:"Foundation component", system:"both", description:"Buttons, inputs, selects, checkbox, and toggle." },
  { id:"feedback", componentKey:"feedback", name:"Feedback & status", type:"Foundation component", system:"both", description:"Badges, notices, and semantic delivery states." },
  { id:"upload", componentKey:"upload", name:"Architecture upload wizard", type:"Compass pattern", system:"compass", description:"Evidence intake, review decisions, and scope confirmation." },
  { id:"dependencies", componentKey:"dependency", name:"Dependency explorer", type:"Compass pattern", system:"compass", description:"Searchable, editable environment dependency visualiser." },
  ...compassPatterns.map((pattern) => ({ id:`compass-pattern-${pattern.id}`, componentKey:"dependency" as ComponentKey, name:pattern.title, type:"Reusable Compass template", system:"compass" as const, description:pattern.summary })),
  { id:"critical-path", componentKey:"critical", name:"Critical-path planner", type:"Tracker pattern", system:"tracker", description:"Dependency canvas, list, filters, and automatic layout." },
  { id:"process-flow", componentKey:"flow", name:"Route-aware process flow", type:"Tracker pattern", system:"tracker", description:"Selectable routes, stage contracts, and live status." },
  ...pocTrackerExamples.map((example) => ({ id:example.id, componentKey:`tracker-screen-${example.id}` as ComponentKey, name:example.title, type:"PoC Tracker pattern", system:"tracker" as const, description:example.description })),
];

const criticalLanes = [
  { id:"Discover", label:"Planning & analysis" },
  { id:"Delivery", label:"Delivery" },
  { id:"Assure", label:"Governance & assurance" },
  { id:"Release", label:"Release readiness" },
];

const reviewFindings = [
  { id:"apim", initials:"AZ", kind:"Suggested technology", title:"Azure API Management", subtitle:"Integration gateway · Production", confidence:"0.94", quote:"All northbound service traffic is routed through Azure API Management using managed identities.", source:"Page 7 · integration layer" },
  { id:"salesforce", initials:"SF", kind:"External connection", title:"Salesforce CRM", subtitle:"Customer system · Bidirectional", confidence:"0.88", quote:"Customer and opportunity updates are synchronised with Salesforce every fifteen minutes.", source:"Page 11 · external services" },
  { id:"datalake", initials:"DL", kind:"Suggested technology", title:"Azure Data Lake", subtitle:"Analytics platform · Production", confidence:"0.91", quote:"Order and fulfilment events are retained in the enterprise data lake for reporting.", source:"Page 14 · data platform" },
];

type UploadWizardChoice = {
  id:string;
  value:string;
  icon:string;
  label:string;
  detail:string;
};

type UploadWizardScenario = {
  sectionTitle:string;
  sectionCopy:string;
  fullscreenLabel:string;
  toolbarTitle:string;
  toolbarStatus:string;
  mark:string;
  wizardTitle:string;
  wizardSubtitle:string;
  steps:string[];
  runLabel:string;
  runId:string;
  processedStatus:string;
  choices:UploadWizardChoice[];
  initialChoices:string[];
  initialFileName:string;
  choiceTitle:string;
  choiceCopy:string;
  documentTitle:string;
  documentCopy:string;
  documentTypes:string[];
  uploadHint:string;
  fileIcon:string;
  reviewFileIcon:string;
  fileReadyCopy:(selectedCount:number)=>string;
  reviewTitle:string;
  reviewCopy:string;
  reviewFileMeta:string;
  reviewSummary:string;
  evidenceSource:string;
  tertiaryReviewAction:string;
  approvedDecision:string;
  confirmTitle:string;
  confirmCopy:string;
  primarySummaryLabel:string;
  secondarySummaryLabel:string;
  readyLabel:string;
  successTitle:string;
  successCopy:(approvedCount:number)=>string;
  completeIdleLabel:string;
  completeDoneLabel:string;
  findings:typeof reviewFindings;
};

const baseUploadWizardScenario:UploadWizardScenario = {
  sectionTitle:"Architecture upload & human review.",
  sectionCopy:"Select environments, add evidence, review each generated suggestion, and confirm what enters the technology scope.",
  fullscreenLabel:"architecture upload wizard",
  toolbarTitle:"Migration Compass / Architecture evidence",
  toolbarStatus:"Interactive demo",
  mark:"C",
  wizardTitle:"Architecture intake",
  wizardSubtitle:"Retail Modernisation",
  steps:["Environments","Documents","AI review","Confirm scope"],
  runLabel:"UPLOAD RUN",
  runId:"ARC-2026-018",
  processedStatus:"Processing complete",
  choices:["Production","Pre-production","Development","Disaster recovery"].map((name) => ({ id:name.toLowerCase().replaceAll(" ","-"), value:name, icon:name.slice(0,2).toUpperCase(), label:name, detail:`Retail ${name}` })),
  initialChoices:["Production"],
  initialFileName:"current-state-architecture-v4.pdf",
  choiceTitle:"Select target environments",
  choiceCopy:"Choose one or more workspaces represented by this evidence.",
  documentTitle:"Add architecture evidence",
  documentCopy:"Group the upload by document purpose and attach an example file.",
  documentTypes:["Architecture and data flow diagram","Integration catalogue","Technology inventory"],
  uploadHint:"PDF, image, Draw.io, Office, or text evidence · preview only",
  fileIcon:"FILE",
  reviewFileIcon:"PDF",
  fileReadyCopy:()=>"Ready for review",
  reviewTitle:"Review suggested records",
  reviewCopy:"Every generated finding remains a suggestion until you decide.",
  reviewFileMeta:"18 pages · OCR completed in 42s",
  reviewSummary:"92% confidence",
  evidenceSource:"Source: OCR + labels",
  tertiaryReviewAction:"Edit details",
  approvedDecision:"✓ Approved for scope",
  confirmTitle:"Confirm scope additions",
  confirmCopy:"Approved findings are ready to create or match scope records.",
  primarySummaryLabel:"Environments",
  secondarySummaryLabel:"Evidence",
  readyLabel:"Ready to add",
  successTitle:"Scope updated",
  successCopy:(approvedCount)=>`${approvedCount} approved finding${approvedCount === 1 ? "" : "s"} added to this preview.`,
  completeIdleLabel:"Add approved records",
  completeDoneLabel:"Records added",
  findings:reviewFindings,
};

const dccUploadWizardScenario:UploadWizardScenario = {
  sectionTitle:"Standards-based document assurance.",
  sectionCopy:"Select standards from the library, upload a document, inspect source-linked AI findings and record the human assurance decision.",
  fullscreenLabel:"document assurance wizard",
  toolbarTitle:"DCC Assurance / Documentation run",
  toolbarStatus:"DCC scenario data",
  mark:"D",
  wizardTitle:"Document assurance",
  wizardSubtitle:"Customer portal · Hackathon",
  steps:["Standards","Documents","AI assurance","Confirm results"],
  runLabel:"ASSURANCE RUN",
  runId:"DCC-2026-018",
  processedStatus:"AI scan complete",
  choices:dccStandards.map((standard) => ({ id:standard.id, value:standard.code, icon:standard.id === "dcc-profile" ? "DCC" : standard.code.slice(0,2).toUpperCase(), label:standard.code, detail:`${standard.clauses} requirements · ${standard.status}` })),
  initialChoices:[dccStandards[0].code,dccStandards[1].code,dccStandards[3].code,dccStandards[4].code],
  initialFileName:dccDocuments[0].name,
  choiceTitle:"Choose standards to assure against",
  choiceCopy:"Select one or more governed standards. Related profiles can be added to the same run.",
  documentTitle:"Upload documentation",
  documentCopy:"Add the document to scan and identify its type so findings retain the right context.",
  documentTypes:["Solution design","Threat model","Accessibility evidence","Operating model","Policy or procedure"],
  uploadHint:"PDF, DOCX, XLSX, image or text · 25MB maximum · preview only",
  fileIcon:"DOC",
  reviewFileIcon:"DOC",
  fileReadyCopy:(selectedCount)=>`${selectedCount} standards selected · ready to scan`,
  reviewTitle:"Review AI assurance findings",
  reviewCopy:"AI has compared the document to the selected requirements. Every result stays provisional until you decide.",
  reviewFileMeta:"34 pages · text extracted · AI scan completed in 18s",
  reviewSummary:"4 standards",
  evidenceSource:"Standard + source excerpt linked",
  tertiaryReviewAction:"Request evidence",
  approvedDecision:"✓ Approved for the assurance record",
  confirmTitle:"Confirm the assurance result",
  confirmCopy:"Only reviewed findings can enter the report. Pending items remain visibly outside the decision.",
  primarySummaryLabel:"Standards",
  secondarySummaryLabel:"Document",
  readyLabel:"Ready for report",
  successTitle:"Assurance result published",
  successCopy:(approvedCount)=>`${approvedCount} approved finding${approvedCount === 1 ? "" : "s"} added to the report; the human decision is recorded separately.`,
  completeIdleLabel:"Publish reviewed result",
  completeDoneLabel:"Result published",
  findings:dccReviewFindings,
};

type ControlsFeedbackFixtureKey = SystemStyle | "dcc-hackathon";
type ControlsFeedbackFixture = {
  controls:{
    buttons:Array<{ label:string; variant:string; disabled?:boolean }>;
    selectLabel:string;
    selectValue:string;
    selectOptions:Array<{ label:string; value?:string }>;
    searchPlaceholder:string;
    checkboxTitle:string;
    checkboxCopy:string;
    toggleTitle:string;
    toggleCopy:string;
  };
  feedback:{
    statuses:Array<{ label:string; className:string; tone:string }>;
    notices:Array<{ className:string; icon:string; title:string; copy:string }>;
  };
};

const controlsFeedbackFixtures:Record<ControlsFeedbackFixtureKey,ControlsFeedbackFixture> = {
  compass:{
    controls:{
      buttons:[
        { label:"Primary action", variant:"primary" },
        { label:"Secondary", variant:"secondary" },
        { label:"Quiet action", variant:"quiet" },
        { label:"Remove", variant:"danger-button" },
        { label:"Disabled", variant:"primary", disabled:true },
      ],
      selectLabel:"Environment",
      selectValue:"production",
      selectOptions:[{ label:"Production", value:"production" },{ label:"Pre-production" },{ label:"Development" }],
      searchPlaceholder:"System, owner, technology…",
      checkboxTitle:"Include external services",
      checkboxCopy:"Show third-party and SaaS dependencies.",
      toggleTitle:"Auto-arrange",
      toggleCopy:"Keep the working view readable.",
    },
    feedback:{
      statuses:[
        { label:"Complete", className:"success", tone:"success" },
        { label:"In review", className:"info", tone:"info" },
        { label:"Needs attention", className:"warning", tone:"warning" },
        { label:"Blocked", className:"danger", tone:"danger" },
        { label:"Not assessed", className:"neutral", tone:"neutral" },
      ],
      notices:[
        { className:"info-notice", icon:"i", title:"Three insights are ready for review", copy:"Open the relevant pattern below to explore its interactive states." },
        { className:"warning-notice", icon:"!", title:"One integration needs an owner", copy:"Assign accountability before approving the baseline." },
      ],
    },
  },
  tracker:{
    controls:{
      buttons:[
        { label:"Primary action", variant:"primary" },
        { label:"Secondary", variant:"secondary" },
        { label:"Quiet action", variant:"quiet" },
        { label:"Remove", variant:"danger-button" },
        { label:"Disabled", variant:"primary", disabled:true },
      ],
      selectLabel:"Environment",
      selectValue:"production",
      selectOptions:[{ label:"Production", value:"production" },{ label:"Pre-production" },{ label:"Development" }],
      searchPlaceholder:"Code, title, tag…",
      checkboxTitle:"Critical work only",
      checkboxCopy:"Hide supporting tasks from the current view.",
      toggleTitle:"Auto-arrange",
      toggleCopy:"Keep the working view readable.",
    },
    feedback:{
      statuses:[
        { label:"Complete", className:"success", tone:"success" },
        { label:"In review", className:"info", tone:"info" },
        { label:"Needs attention", className:"warning", tone:"warning" },
        { label:"Blocked", className:"danger", tone:"danger" },
        { label:"Not assessed", className:"neutral", tone:"neutral" },
      ],
      notices:[
        { className:"info-notice", icon:"i", title:"Two tasks are ready for assurance", copy:"Open the relevant pattern below to explore its interactive states." },
        { className:"warning-notice", icon:"!", title:"Acceptance rehearsal is blocked", copy:"Resolve its incomplete predecessors before release." },
      ],
    },
  },
  "dcc-hackathon":{
    controls:{
      buttons:[
        { label:"Run assurance", variant:"primary" },
        { label:"Upload document", variant:"secondary" },
        { label:"View evidence", variant:"quiet" },
        { label:"Remove standard", variant:"danger-button" },
        { label:"Disabled", variant:"primary", disabled:true },
      ],
      selectLabel:"Standard collection",
      selectValue:"security",
      selectOptions:[{ label:"Security & privacy", value:"security" },{ label:"Accessibility" },{ label:"Service delivery" },{ label:"AI governance" }],
      searchPlaceholder:"Standard, clause, document…",
      checkboxTitle:"Evidence-linked findings only",
      checkboxCopy:"Hide AI findings without a source excerpt.",
      toggleTitle:"Show related standards",
      toggleCopy:"Include linked and inherited requirements.",
    },
    feedback:{
      statuses:[
        { label:"Meets standard", className:"success", tone:"success" },
        { label:"In review", className:"info", tone:"info" },
        { label:"Evidence needed", className:"warning", tone:"warning" },
        { label:"Gap", className:"danger", tone:"danger" },
        { label:"Not assessed", className:"neutral", tone:"neutral" },
      ],
      notices:[
        { className:"info-notice", icon:"i", title:"Four AI findings are ready for human review", copy:"Each finding includes a standard requirement, source excerpt and confidence score." },
        { className:"warning-notice", icon:"!", title:"Five documentation gaps need owners", copy:"Assign remediation and evidence before the assurance run can close." },
      ],
    },
  },
};

function SectionHeading({ eyebrow, title, copy }: { eyebrow:string; title:string; copy:string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>;
}

function StatusDot({ tone }: { tone:string }) { return <span className={`status-dot ${tone}`} aria-hidden="true" />; }

function ComponentActions({ componentKey, onDetails, onDownload, fullscreenTarget, star }: { componentKey:ComponentKey; onDetails:(key:ComponentKey)=>void; onDownload:(key:ComponentKey)=>void; fullscreenTarget?:string; star?:{ active:boolean; onToggle:()=>void; label:string } }) {
  const component = componentCatalog[componentKey];
  return <div className="component-actions"><div><span aria-hidden="true">◇</span><p><small>INTERACTIVE EXAMPLE</small><strong>{component.name}</strong></p></div><div>{star && <button className={`pattern-star-button ${star.active ? "active" : ""}`} type="button" aria-pressed={star.active} onClick={star.onToggle} aria-label={star.label}><span aria-hidden="true">{star.active ? "★" : "☆"}</span><span>{star.active ? "Recommended" : "Star pattern"}</span></button>}{fullscreenTarget && <button className="fullscreen-pattern-button" onClick={() => document.getElementById(fullscreenTarget)?.requestFullscreen()} aria-label={`Open ${component.name} in full screen`}>⛶ <span>Full screen</span></button>}<button className="tech-details-button" onClick={() => onDetails(componentKey)}>⌘ <span>Tech details</span></button><button className="download-code-button" onClick={() => onDownload(componentKey)}>↓ <span>Download code</span></button></div></div>;
}

function FullscreenExit({ label }: { label:string }) {
  return <button className="fullscreen-exit-control" onClick={() => document.exitFullscreen()} aria-label={`Exit full-screen ${label}`}>↙ Exit full screen <kbd>Esc</kbd></button>;
}

const DEPENDENCY_LAUNCH_STORAGE_PREFIX = "migration-compass-dependency-explorer:";
const DEPENDENCY_EXPLORER_UNAVAILABLE_DOCUMENT = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>body{box-sizing:border-box;margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem;background:#0d1117;color:#f0f3f6;font:16px/1.5 system-ui,sans-serif;text-align:center}strong{display:block;margin-bottom:.4rem}p{max-width:34rem;margin:0;color:#a9b4c0}</style></head><body><div role="alert"><strong>Relationship data could not be prepared</strong><p>Allow browser storage and reload the page to open this scenario without falling back to the base example.</p></div></body></html>`;

function DependencyExplorerFrame({ scenarioId }: { scenarioId:ScenarioId }) {
  const dcc = scenarioId === "dcc-hackathon";
  const src = sitePath(dcc ? `/dependency-explorer.html?key=${dccDependencyExplorerLaunchKey}` : "/dependency-explorer.html");
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!dcc || !frame) return;

    try {
      window.localStorage.setItem(`${DEPENDENCY_LAUNCH_STORAGE_PREFIX}${dccDependencyExplorerLaunchKey}`, JSON.stringify(dccDependencyExplorerPayload));
      frame.removeAttribute("srcdoc");
      frame.setAttribute("src",src);
    } catch {
      frame.removeAttribute("src");
      frame.setAttribute("srcdoc",DEPENDENCY_EXPLORER_UNAVAILABLE_DOCUMENT);
    }
  }, [dcc,src]);

  return <div className="pattern-frame original-explorer-frame pattern-fullscreen-target" id="pattern-dependency" data-scenario={scenarioId}>
    <FullscreenExit label={dcc ? "standards and document relationship explorer" : "dependency explorer"} />
    <div className="frame-toolbar"><div><i /><i /><i /></div><span>{dcc ? "DCC assurance relationship landscape" : "Environment dependency landscape"}</span><b>Interactive preview</b></div>
    <iframe key={src} ref={frameRef} src={dcc ? undefined : src} title={dcc ? "DCC standards and documentation relationship visualiser" : "Environment dependency visualiser"} loading="lazy" allowFullScreen />
  </div>;
}

const pocEmbedObservers = new WeakMap<HTMLIFrameElement,ResizeObserver>();

function preparePoCEmbed(frame:HTMLIFrameElement, dark:boolean, themeStyle:CSSProperties = {}) {
  const document = frame.contentDocument;
  if (!document?.body) return;
  document.body.classList.add("poc-embedded");
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  ["text","primary","primary-soft","primary-strong","info","info-soft","info-strong","success","success-soft","success-strong","warning","warning-soft","warning-strong","danger","danger-soft","danger-strong"].forEach((name) => document.documentElement.style.removeProperty(`--${name}`));
  Object.entries(themeStyle).forEach(([name,value]) => document.documentElement.style.setProperty(name,String(value)));
  const resize = () => {
    const height = Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
    frame.style.height = `${height}px`;
  };
  pocEmbedObservers.get(frame)?.disconnect();
  const observer = new ResizeObserver(resize);
  observer.observe(document.body);
  observer.observe(document.documentElement);
  pocEmbedObservers.set(frame,observer);
  requestAnimationFrame(resize);
}

const genericFamilies: Array<{ key:ComponentKey; number:string; family:string; candidates:string[]; description:string }> = [
  { key:"actions", number:"01", family:"Actions", candidates:["Button","IconButton","IconOnlyButton"], description:"Clear hierarchy for every action density." },
  { key:"generic-feedback", number:"02", family:"Feedback", candidates:["Toast","AlertToast","ConfirmDialog","Modal"], description:"A measured escalation from notice to decision." },
  { key:"status", number:"03", family:"Status", candidates:["Badge","StatusPill","StatusIcon","StatusSelect"], description:"One semantic state language across the product." },
  { key:"surfaces", number:"04", family:"Surfaces", candidates:["Panel","Card","MetricCard","MetricStrip"], description:"Repeatable containers for facts and measures." },
  { key:"navigation", number:"05", family:"Navigation", candidates:["Breadcrumbs","Tabs","SegmentedControl"], description:"Location, view, and mode controls that feel related." },
  { key:"content", number:"06", family:"Content", candidates:["EmptyState","Disclosure / Accordion","ProgressBar"], description:"Useful states for absence, detail, and progress." },
  { key:"forms", number:"07", family:"Forms", candidates:["FormField","FieldError","FormSection","FilterBar"], description:"Validation and filtering with a shared rhythm." },
  { key:"data", number:"08", family:"Data", candidates:["DataTable","EditableDataGrid"], description:"Readable tables that can become working surfaces." },
  { key:"files", number:"09", family:"Files", candidates:["FileUpload","ImportExportPanel"], description:"Explicit file selection and transfer state." },
  { key:"guided", number:"10", family:"Guided flows", candidates:["Wizard","Stepper"], description:"Visible progress through multi-step decisions." },
];

function GenericCatalogue({ onDetails, onDownload, layout = "grid" }: { onDetails:(key:ComponentKey)=>void; onDownload:(key:ComponentKey)=>void; layout?:"grid"|"sections" }) {
  const [actionBusy, setActionBusy] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [genericStatus, setGenericStatus] = useState("review");
  const [activeTab, setActiveTab] = useState("Dependencies");
  const [formOwner, setFormOwner] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [tableOwner, setTableOwner] = useState("Platform team");
  const [genericFile, setGenericFile] = useState("system-inventory.xlsx");
  const [genericStep, setGenericStep] = useState(1);
  const [addedRecords, setAddedRecords] = useState(0);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [removedDependency, setRemovedDependency] = useState(false);
  const [exported, setExported] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [confirmResult, setConfirmResult] = useState("");
  const [modalOpen, setModalOpen] = useState(true);
  const [activeSegment, setActiveSegment] = useState("Canvas");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoArrange, setAutoArrange] = useState(true);
  const [fileRowVisible, setFileRowVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [dependencyAdded, setDependencyAdded] = useState(false);
  const [reviewDecision, setReviewDecision] = useState("");
  const [threadReply, setThreadReply] = useState("");
  const [threadSent, setThreadSent] = useState("");

  function runAction() {
    setActionBusy(true);
    window.setTimeout(() => setActionBusy(false), 900);
  }

  function renderDemo(key:ComponentKey) {
    if (key === "actions") return <div className="generic-actions-demo"><button className="button primary" onClick={runAction} disabled={actionBusy}>{actionBusy ? "Saving…" : "Save changes"}</button><button className="button secondary"><span aria-hidden="true">＋</span> Add record</button><button className="generic-icon-button" aria-label="More actions">•••</button></div>;
    if (key === "generic-feedback") return <div className="generic-feedback-demo"><div className="generic-demo-row"><button className="button secondary" onClick={() => setToastVisible(true)}>Show toast</button><button className="button danger-button" onClick={() => setConfirmVisible(true)}>Remove…</button></div>{toastVisible && <div className="generic-toast" role="status"><span>✓</span><div><strong>Changes saved</strong><small>The architecture record is up to date.</small></div><button onClick={() => setToastVisible(false)} aria-label="Dismiss notification">×</button></div>}{confirmVisible && <div className="generic-confirm" role="dialog" aria-modal="true" aria-label="Confirm removal"><strong>Remove dependency?</strong><p>This link can be added again later.</p><div><button onClick={() => setConfirmVisible(false)}>Cancel</button><button className="danger" onClick={() => setConfirmVisible(false)}>Remove</button></div></div>}</div>;
    if (key === "status") return <div className="generic-status-demo"><span className="badge success">✓ Complete</span><span className="badge info">◐ In review</span><span className="badge danger">! Blocked</span><label><span>Workflow status</span><select value={genericStatus} onChange={(event) => setGenericStatus(event.target.value)}><option value="review">In review</option><option value="complete">Complete</option><option value="blocked">Blocked</option></select></label></div>;
    if (key === "surfaces") return <div className="generic-metric-strip"><article><span>Systems</span><strong>24</strong><small>+3 this week</small></article><article><span>Critical links</span><strong>07</strong><small>2 need review</small></article><article><span>Coverage</span><strong>86%</strong><small>+4% this week</small></article></div>;
    if (key === "navigation") return <div className="generic-navigation-demo"><nav aria-label="Example breadcrumb"><span>Workspace</span><b>›</b><span>Architecture</span><b>›</b><strong>Production</strong></nav><div role="tablist">{["Overview","Dependencies","Evidence"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div><p><span>{activeTab}</span> view selected</p></div>;
    if (key === "content") return <div className="generic-content-demo"><div><span className="generic-empty-icon">＋</span><strong>No dependencies yet</strong><small>Add the first relationship to begin mapping.</small></div><label><span><b>Collection coverage</b><strong>68%</strong></span><progress max="100" value="68">68%</progress></label><details><summary>What counts as evidence?</summary><p>Approved documents, validated system records, and reviewed findings.</p></details></div>;
    if (key === "forms") return <form className="generic-form-demo" onSubmit={(event) => { event.preventDefault(); setFormTouched(true); }} noValidate><label><span>Accountable owner <b>Required</b></span><input value={formOwner} onChange={(event) => { setFormOwner(event.target.value); setFormTouched(false); }} placeholder="e.g. Platform team" aria-invalid={formTouched && !formOwner} aria-describedby="owner-message" />{formTouched && !formOwner ? <small className="field-error" id="owner-message" role="alert">Choose an accountable owner.</small> : <small id="owner-message">The team responsible for this record.</small>}</label><button className="button primary" type="submit">Validate field</button></form>;
    if (key === "data") return <div className="generic-table-shell"><table><thead><tr><th>System</th><th>Owner</th><th>Status</th></tr></thead><tbody><tr><td><strong>API Gateway</strong><small>Integration</small></td><td><input value={tableOwner} onChange={(event) => setTableOwner(event.target.value)} aria-label="Owner for API Gateway" /></td><td><span className="badge success">Complete</span></td></tr><tr><td><strong>Customer CRM</strong><small>SaaS</small></td><td>Customer platforms</td><td><span className="badge info">In review</span></td></tr></tbody></table></div>;
    if (key === "files") return <div className="generic-files-demo"><label><input type="file" accept=".xlsx,.csv,.json" onChange={(event) => setGenericFile(event.target.files?.[0]?.name || "")} /><span>⇧</span><strong>{genericFile || "Drop a file or browse"}</strong><small>XLSX, CSV or JSON · 10MB maximum</small></label><div><span><i />{genericFile || "No file selected"}</span><button onClick={() => setGenericFile("")}>Clear</button></div></div>;
    return <div className="generic-wizard-demo"><div className="generic-stepper">{["Choose source","Map fields","Review","Complete"].map((step,index) => <button className={index + 1 === genericStep ? "active" : index + 1 < genericStep ? "complete" : ""} onClick={() => setGenericStep(index + 1)} aria-current={index + 1 === genericStep ? "step" : undefined} key={step}><span>{index + 1 < genericStep ? "✓" : index + 1}</span><small>{step}</small></button>)}</div><div className="generic-step-content"><span>STEP {genericStep} OF 4</span><strong>{["Choose a source file","Map source fields","Review the import","Import complete"][genericStep - 1]}</strong><div><button className="button secondary" disabled={genericStep === 1} onClick={() => setGenericStep((value) => Math.max(1,value - 1))}>Back</button><button className="button primary" disabled={genericStep === 4} onClick={() => setGenericStep((value) => Math.min(4,value + 1))}>{genericStep === 3 ? "Complete import" : "Continue"}</button></div></div></div>;
  }

  function renderIndividualPreview(item:IndividualComponent) {
    const id = item.id;
    if (item.origin === "pattern") {
      return <PatternBoundarySpecimen name={item.name} category={item.category} patternCount={item.patternSources?.length ?? 1} />;
    }
    if (id === "button") return <button className="button primary" onClick={runAction}>{actionBusy ? "Saving…" : "Save changes"}</button>;
    if (id === "icon-button") return <button className="button secondary" onClick={() => setAddedRecords((count) => count + 1)}><span aria-hidden="true">＋</span> {addedRecords ? `${addedRecords} record${addedRecords === 1 ? "" : "s"} added` : "Add record"}</button>;
    if (id === "icon-only-button") return <div className="individual-menu-demo"><button className="generic-icon-button" aria-label="More actions" aria-expanded={moreActionsOpen} onClick={() => setMoreActionsOpen((open) => !open)}>•••</button>{moreActionsOpen && <div role="menu"><button role="menuitem" onClick={() => setMoreActionsOpen(false)}>Duplicate</button><button role="menuitem" onClick={() => setMoreActionsOpen(false)}>Archive</button></div>}</div>;
    if (id === "destructive-button") return <button className="button danger-button" onClick={() => setRemovedDependency((removed) => !removed)}>{removedDependency ? "✓ Dependency removed" : "Remove dependency"}</button>;
    if (id === "export-action") return <button className="button secondary" onClick={() => setExported(true)}><span aria-hidden="true">{exported ? "✓" : "↓"}</span> {exported ? "JSON exported" : "Export JSON"}</button>;
    if (id === "toast") return toastDismissed ? <button className="button secondary" onClick={() => setToastDismissed(false)}>Show toast again</button> : <div className="generic-toast" role="status"><span>✓</span><div><strong>Changes saved</strong><small>The architecture record is up to date.</small></div><button onClick={() => setToastDismissed(true)} aria-label="Dismiss notification">×</button></div>;
    if (id === "alert-toast") return alertDismissed ? <button className="button secondary" onClick={() => setAlertDismissed(false)}>Show alert again</button> : <div className="generic-toast individual-alert-toast" role="alert"><span>!</span><div><strong>Import could not finish</strong><small>Two rows contain unsupported values.</small></div><button onClick={() => setAlertDismissed(true)} aria-label="Dismiss alert">×</button></div>;
    if (id === "confirm-dialog") return confirmResult ? <div className="individual-action-result" role="status"><strong>{confirmResult}</strong><button onClick={() => setConfirmResult("")}>Reset demo</button></div> : <div className="generic-confirm individual-static-dialog"><strong>Remove dependency?</strong><p>This link can be added again later.</p><div><button onClick={() => setConfirmResult("Removal cancelled")}>Cancel</button><button className="danger" onClick={() => setConfirmResult("Dependency removed")}>Remove</button></div></div>;
    if (id === "modal") return modalOpen ? <div className="individual-modal-preview"><header><div><small>EDIT RECORD</small><strong>System details</strong></div><button onClick={() => setModalOpen(false)} aria-label="Close">×</button></header><p>Update the owner and environment for this system.</p><footer><button className="button secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="button primary" onClick={() => setModalOpen(false)}>Save</button></footer></div> : <button className="button primary" onClick={() => setModalOpen(true)}>Open modal</button>;
    if (id === "inline-notice") return <div className="notice info-notice"><span>i</span><div><strong>Three findings are ready</strong><p>Review generated suggestions before adding them to scope.</p></div></div>;
    if (id === "confirmation-banner") return <div className="individual-confirmation-banner"><span>✓</span><div><strong>Access confirmed</strong><small>Production evidence can now be collected.</small></div><button>View details →</button></div>;
    if (id === "badge") return <div className="individual-inline-set"><span className="badge neutral">Architecture</span><span className="badge info">Evidence</span><span className="badge warning">Risk</span></div>;
    if (id === "status-pill") return <div className="individual-inline-set"><span className="badge success">✓ Complete</span><span className="badge info">◐ In review</span><span className="badge danger">! Blocked</span></div>;
    if (id === "status-icon") return <div className="individual-status-icons"><span className="success">✓<small>Complete</small></span><span className="warning">◐<small>Review</small></span><span className="danger">!<small>Blocked</small></span></div>;
    if (id === "status-select") return <label className="individual-select"><span>Workflow status</span><select value={genericStatus} onChange={(event) => setGenericStatus(event.target.value)}><option value="review">In review</option><option value="complete">Complete</option><option value="blocked">Blocked</option></select></label>;
    if (id === "progress-bar") return <label className="individual-progress"><span><b>Collection coverage</b><strong>68%</strong></span><progress max="100" value="68">68%</progress></label>;
    if (id === "save-status") return <div className="individual-save-status"><span><i /> Saved</span><small>Last updated just now</small></div>;
    if (id === "breadcrumbs") return <nav className="individual-breadcrumbs" aria-label="Example breadcrumb"><a href="#individual-navigation">Workspace</a><b>›</b><a href="#component-breadcrumbs">Architecture</a><b>›</b><strong aria-current="page">Production</strong></nav>;
    if (id === "tabs") return <div className="generic-navigation-demo"><div role="tablist">{["Overview","Dependencies","Evidence"].map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div></div>;
    if (id === "segmented-control") return <div className="segmented" role="group" aria-label="View type">{["Canvas","List","Table"].map((view) => <button className={activeSegment === view ? "active" : ""} aria-pressed={activeSegment === view} onClick={() => setActiveSegment(view)} key={view}>{view}</button>)}</div>;
    if (id === "pagination") return <nav className="individual-pagination" aria-label="Pagination"><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1,page - 1))}>←</button>{[1,2,3].map((page) => <button className={currentPage === page ? "active" : ""} aria-current={currentPage === page ? "page" : undefined} onClick={() => setCurrentPage(page)} key={page}>{page}</button>)}<span>…</span><button className={currentPage === 8 ? "active" : ""} onClick={() => setCurrentPage(8)}>8</button><button aria-label="Next page" disabled={currentPage === 8} onClick={() => setCurrentPage((page) => Math.min(8,page + 1))}>→</button></nav>;
    if (id === "stepper") return <div className="generic-stepper">{["Source","Map","Review","Complete"].map((step,index) => <button className={index + 1 === genericStep ? "active" : index + 1 < genericStep ? "complete" : ""} onClick={() => setGenericStep(index + 1)} key={step}><span>{index + 1 < genericStep ? "✓" : index + 1}</span><small>{step}</small></button>)}</div>;
    if (id === "form-field") return <label className="individual-field"><span>Accountable owner</span><input value={formOwner} onChange={(event) => setFormOwner(event.target.value)} placeholder="e.g. Platform team" /><small>The team responsible for this record.</small></label>;
    if (id === "field-error") return <label className="individual-field"><span>Environment</span><input aria-invalid="true" defaultValue="Prodution" /><small className="field-error">Choose a supported environment.</small></label>;
    if (id === "filter-bar") return <div className="individual-filter-bar"><label><span>⌕</span><input value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} placeholder="Search records…" /></label><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="all">All statuses</option><option value="complete">Complete</option></select><button onClick={() => { setFilterQuery(""); setFilterStatus("all"); }}>Reset</button></div>;
    if (id === "search-input") return <label className="individual-search"><span>⌕</span><input value={filterQuery} onChange={(event) => setFilterQuery(event.target.value)} placeholder="System, owner, technology…" /><kbd>⌘ K</kbd></label>;
    if (id === "checkbox") return <label className="checkbox-row"><input type="checkbox" defaultChecked /><span><b>Include external services</b><small>Show third-party and SaaS dependencies.</small></span></label>;
    if (id === "toggle") return <label className="toggle-row"><span><b>Auto-arrange</b><small>{autoArrange ? "Working view will stay aligned." : "Manual positioning is enabled."}</small></span><input type="checkbox" checked={autoArrange} onChange={(event) => setAutoArrange(event.target.checked)} /><i /></label>;
    if (id === "data-table") return <div className="generic-table-shell"><table><thead><tr><th>System</th><th>Owner</th><th>Status</th></tr></thead><tbody><tr><td><strong>API Gateway</strong><small>Integration</small></td><td>Platform</td><td><span className="badge success">Complete</span></td></tr><tr><td><strong>Customer CRM</strong><small>SaaS</small></td><td>Customer</td><td><span className="badge info">In review</span></td></tr></tbody></table></div>;
    if (id === "editable-data-grid") return <div className="generic-table-shell"><table><thead><tr><th>System</th><th>Owner</th></tr></thead><tbody><tr><td>API Gateway</td><td><input value={tableOwner} onChange={(event) => setTableOwner(event.target.value)} aria-label="Owner" /></td></tr><tr><td>Customer CRM</td><td><input defaultValue="Customer platforms" aria-label="Owner" /></td></tr></tbody></table></div>;
    if (id === "table-toolbar") return <div className="individual-table-toolbar"><label><span>⌕</span><input placeholder="Search table" /></label><button>Filter <b>2</b></button><button>⇧ Import</button><button>↓ Export</button></div>;
    if (id === "review-row") return <div className="individual-review-row"><span className="tech-avatar">AP</span><div><small>TECHNOLOGY · 94% CONFIDENCE</small><strong>Azure API Management</strong><span>architecture-v4.pdf · page 7</span></div><span className="badge info">Review</span><button>→</button></div>;
    if (id === "task-card") return <div className="individual-task-card"><header><code>DAT-03</code><span className="badge warning">In progress</span></header><strong>Prepare masked migration extract</strong><small>Data engineering</small><div><i style={{width:"72%"}} /></div><footer><span>72% complete</span><b>2 links</b></footer></div>;
    if (id === "panel") return <div className="individual-panel"><header><strong>Architecture baseline</strong><button>Open →</button></header><p>12 systems · 18 dependencies · updated today</p></div>;
    if (id === "card") return <article className="individual-content-card"><small>SYSTEM RECORD</small><strong>API Gateway</strong><p>Azure API Management · Production</p><span>Platform Engineering</span></article>;
    if (id === "metric-card") return <article className="individual-metric-card"><span>Collection coverage</span><strong>86%</strong><small>↑ 4% this week</small></article>;
    if (id === "metric-strip") return <div className="generic-metric-strip"><article><span>Systems</span><strong>24</strong><small>+3 this week</small></article><article><span>Links</span><strong>07</strong><small>2 need review</small></article><article><span>Coverage</span><strong>86%</strong><small>+4%</small></article></div>;
    if (id === "details-drawer") return drawerOpen ? <aside className="individual-drawer"><header><div><small>SELECTED SYSTEM</small><strong>API Gateway</strong></div><button onClick={() => setDrawerOpen(false)} aria-label="Close details">×</button></header><dl><div><dt>Owner</dt><dd>Platform</dd></div><div><dt>Environment</dt><dd>Production</dd></div><div><dt>Criticality</dt><dd>High</dd></div></dl></aside> : <button className="button secondary" onClick={() => setDrawerOpen(true)}>Open details drawer</button>;
    if (id === "empty-state") return dependencyAdded ? <div className="individual-action-result" role="status"><strong>Dependency added</strong><button onClick={() => setDependencyAdded(false)}>Reset demo</button></div> : <div className="individual-empty"><span>＋</span><strong>No dependencies yet</strong><p>Add the first relationship to begin mapping this system.</p><button className="button primary" onClick={() => setDependencyAdded(true)}>Add dependency</button></div>;
    if (id === "disclosure") return <details className="individual-disclosure" open><summary>What counts as evidence?</summary><p>Approved documents, validated system records, and reviewed findings.</p></details>;
    if (id === "key-value-list") return <dl className="individual-key-values"><div><dt>Owner</dt><dd>Platform Engineering</dd></div><div><dt>Environment</dt><dd>Production</dd></div><div><dt>Criticality</dt><dd><span className="badge warning">High</span></dd></div></dl>;
    if (id === "tag-list") return <div className="individual-tag-list"><span>architecture</span><span>integration</span><span>production</span><span>critical</span></div>;
    if (id === "file-upload") return <label className="generic-files-demo individual-upload"><input type="file" onChange={(event) => setGenericFile(event.target.files?.[0]?.name || "")} /><span>⇧</span><strong>{genericFile || "Drop a file or browse"}</strong><small>XLSX, CSV or JSON · 10MB maximum</small></label>;
    if (id === "file-row") return fileRowVisible ? <div className="individual-file-row"><span>PDF</span><div><strong>architecture-v4.pdf</strong><small>1.8 MB · Ready</small></div><i /><button onClick={() => setFileRowVisible(false)} aria-label="Remove file">×</button></div> : <button className="button secondary" onClick={() => setFileRowVisible(true)}>Restore example file</button>;
    if (id === "import-export-panel") return <div className="individual-import-export"><article><span>⇧</span><div><strong>Import data</strong><small>XLSX, CSV, JSON</small></div><button>Choose file</button></article><article><span>↓</span><div><strong>Export model</strong><small>Current filtered view</small></div><button>Export</button></article></div>;
    if (id === "evidence-link") return <a className="individual-evidence-link" href="#individual-files"><span>PDF</span><div><strong>current-state-architecture-v4.pdf</strong><small>Page 7 · OCR + labels</small></div><b>Open source ↗</b></a>;
    if (id === "line-chart") return <div className="individual-chart individual-line-chart"><div><span style={{height:"62%"}} /><span style={{height:"48%"}} /><span style={{height:"54%"}} /><span style={{height:"34%"}} /><span style={{height:"22%"}} /><span style={{height:"15%"}} /></div><footer><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></footer></div>;
    if (id === "bar-chart") return <div className="individual-bar-chart">{[["Metadata",82],["Dependencies",64],["Evidence",91],["Ownership",48]].map(([label,value]) => <div key={String(label)}><span>{label}</span><i><b style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</div>;
    if (id === "waterfall-chart") return <div className="individual-waterfall"><span style={{height:"70%"}}>Base</span><span className="positive" style={{height:"22%"}}>+12</span><span className="negative" style={{height:"15%"}}>−8</span><span className="positive" style={{height:"18%"}}>+10</span><span className="total" style={{height:"82%"}}>Final</span></div>;
    if (id === "node-card") return <div className="individual-node"><i /><header><code>API-04</code><span className="badge info">In review</span></header><strong>Validate service contracts</strong><small>Platform team · 58% complete</small><b /></div>;
    if (id === "diagram-legend") return <div className="individual-diagram-legend"><span><i className="core" /> Internal system</span><span><i className="external" /> External service</span><span><i className="data" /> Data platform</span><span><b /> Critical dependency</span></div>;
    if (id === "gantt-bar") return <div className="individual-gantt"><header><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span></header><div><span>Prepare data</span><b><i style={{width:"72%"}} /><em>72%</em></b></div><div><span>Build journey</span><b className="shifted"><i style={{width:"34%"}} /><em>34%</em></b></div></div>;
    if (id === "wizard") return renderDemo("guided");
    if (id === "answer-review") return <div className="individual-answer-review"><header><span>REVIEW ANSWERS</span><strong>3 of 3 complete</strong></header><div><span>Target environment</span><b>Production</b><button>Edit</button></div><div><span>Data classification</span><b>Internal</b><button>Edit</button></div><footer><button className="button primary">Submit answers</button></footer></div>;
    if (id === "review-dialog") return reviewDecision ? <div className="individual-action-result" role="status"><strong>{reviewDecision}</strong><button onClick={() => setReviewDecision("")}>Review again</button></div> : <div className="individual-review-dialog"><span>REVIEW FINDING</span><strong>Azure API Management</strong><p>Confirm whether this finding should enter the approved scope.</p><div><button className="button secondary" onClick={() => setReviewDecision("Change requested")}>Request change</button><button className="button primary" onClick={() => setReviewDecision("Finding approved")}>Approve</button></div></div>;
    if (id === "feedback-thread") return <div className="individual-thread"><article><span>AA</span><div><strong>Alex Atkinson</strong><small>Resolve the missing owner before approval.</small></div></article><article><span>PE</span><div><strong>Platform Engineering</strong><small>Owner added and evidence linked.</small></div></article>{threadSent && <article><span>YO</span><div><strong>You</strong><small>{threadSent}</small></div></article>}<footer><input value={threadReply} onChange={(event) => setThreadReply(event.target.value)} placeholder="Add a reply…" /><button disabled={!threadReply.trim()} onClick={() => { setThreadSent(threadReply.trim()); setThreadReply(""); }}>Send</button></footer></div>;
    return <div className="individual-recommendation"><header><span>RECOMMENDATION</span><span className="badge success">Ready</span></header><strong>Proceed with a controlled pilot</strong><p>The evidence supports a limited production-aligned route with three named controls.</p><div><span>Evidence <b>12 sources</b></span><span>Confidence <b>High</b></span></div><button className="button primary">Review decision</button></div>;
  }

  if (layout === "sections") {
    const categories = Object.keys(individualCategoryCopy);
    return <div className="individual-library-sections">{categories.map((category) => {
      const items = individualComponents.filter((item) => item.category === category);
      const copy = individualCategoryCopy[category];
      return <section className="content-section individual-library-section" id={`individual-${category.toLowerCase().replaceAll(" ","-")}`} data-component-category={componentSlug(category)} key={category}>
        <div className="section-heading individual-category-heading"><h2>{category}</h2><div className="individual-category-intro"><strong>{copy.title}</strong><p>{copy.copy}</p></div></div>
        <div className="individual-component-grid">{items.map((item,index) => <article
          className="individual-component-card"
          id={`component-${item.id}`}
          data-individual-component-name={item.name}
          data-component-aliases={item.aliases?.join("|") || undefined}
          data-component-origin={item.origin ?? "common"}
          data-component-category={componentSlug(category)}
          data-pattern-component={item.patternSources?.length ? "true" : undefined}
          key={item.id}
        >
          <header><div><span>{String(index + 1).padStart(2,"0")}</span><div><small>{category}</small><h3>{item.name}</h3></div></div><b><i /> {item.origin === "pattern" ? "Specimen" : "Live"}</b></header>
          <div className="individual-component-preview"><span className="individual-preview-label"><i /> {item.origin === "pattern" ? "PATTERN SPECIMEN" : "INTERACTIVE PREVIEW"}</span><div>{renderIndividualPreview(item)}</div></div>
          <div className="individual-component-copy"><p>{item.summary}</p>{item.aliases?.length ? <span className="individual-component-aliases">Also covers <b>{item.aliases.join(" · ")}</b></span> : null}<span>Used across <b>{item.source}</b></span></div>
          <footer><button onClick={() => onDetails(item.key)}>View details</button><button className="download" onClick={() => onDownload(item.key)}>↓ Download code</button></footer>
        </article>)}</div>
      </section>;
    })}</div>;
  }

  return <div className="generic-catalogue-grid">{genericFamilies.map((family) => <article className={`generic-family-card generic-family-${family.key}`} key={family.key}><header><div><span>{family.number}</span><div><small>COMPONENT FAMILY</small><h3>{family.family}</h3></div></div><p>{family.description}</p><div className="generic-candidate-list">{family.candidates.map((candidate) => <code key={candidate}>{candidate}</code>)}</div></header><div className="generic-family-demo">{renderDemo(family.key)}</div><footer><span><i /> Interactive preview</span><div><button onClick={() => onDetails(family.key)}>View details</button><button className="download" onClick={() => onDownload(family.key)} aria-label={`Download ${family.family} component code`}>↓ Code</button></div></footer></article>)}</div>;
}

function toneForStatus(status:string) {
  if (["Complete","complete"].includes(status)) return "success";
  if (["Blocked","blocked"].includes(status)) return "danger";
  if (["In review","required"].includes(status)) return "info";
  return "warning";
}

export default function Showcase({ initialCollection = "compass", initialScenario }: { initialCollection?:SystemStyle|"generic"; initialScenario?:ScenarioId }) {
  const genericMode = initialCollection === "generic";
  const system:SystemStyle = initialCollection === "tracker" ? "tracker" : "compass";
  const [dark, setDark] = usePersistentDarkMode();
  const sidebar = usePersistentSidebar();
  const scenarioState = useScenario(initialScenario, system);
  const { scenarioId, scenario, starredPatternIds, selectScenario, toggleStar, resetRecommendations } = scenarioState;
  const dccMode = !genericMode && scenarioId === "dcc-hackathon";
  const uploadScenario = dccMode ? dccUploadWizardScenario : baseUploadWizardScenario;
  const controlsFeedbackFixture = controlsFeedbackFixtures[dccMode ? "dcc-hackathon" : system];
  const trackerPatternFixture = trackerPatternFixtures[dccMode ? "dcc-hackathon" : "base"];
  const criticalTasks = trackerPatternFixture.criticalTasks;
  const flowStages = trackerPatternFixture.flowStages;
  const routes = trackerPatternFixture.routes;
  const initialTaskDependencies:CriticalDependency[] = criticalTasks.flatMap((task) => task.dependencies.map((sourceId) => ({ id:`${sourceId}-${task.id}`,sourceId,targetId:task.id })));
  const initialTrackerFixture = trackerPatternFixtures[initialCollection === "tracker" && initialScenario === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);
  const [scenarioAnnouncement, setScenarioAnnouncement] = useState("");
  const scenarioTriggerRef = useRef<HTMLButtonElement>(null);
  const [colourPreviewOverride, setColourPreviewOverride] = useState<ColourMode | null>(null);
  const [colourTokenOverrides, setColourTokenOverrides] = useState<ColourTokenOverrides>({});
  const [colourEditing, setColourEditing] = useState(false);
  const [typographyPreviewOverride, setTypographyPreviewOverride] = useState<ColourMode | null>(null);
  const [techPanel, setTechPanel] = useState<ComponentKey | null>(null);
  const [techTab, setTechTab] = useState<"overview"|"component"|"data"|"api">("overview");
  const [copiedView, setCopiedView] = useState("");
  const [dependencySource, setDependencySource] = useState("");
  const [trackerScreenSources, setTrackerScreenSources] = useState<Record<string,string>>({});
  const [librarySearchOpen, setLibrarySearchOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [blueprintFocus, setBlueprintFocus] = useState<BlueprintFocus>("foundations");
  const [blueprintPaused, setBlueprintPaused] = useState(false);
  const [blueprintOverview, setBlueprintOverview] = useState(false);

  const [wizardStep, setWizardStep] = useState(1);
  const [environments, setEnvironments] = useState(() => [...(initialScenario === "dcc-hackathon" ? dccUploadWizardScenario : baseUploadWizardScenario).initialChoices]);
  const [fileName, setFileName] = useState(() => (initialScenario === "dcc-hackathon" ? dccUploadWizardScenario : baseUploadWizardScenario).initialFileName);
  const [findingIndex, setFindingIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string,Decision>>(() => Object.fromEntries((initialScenario === "dcc-hackathon" ? dccUploadWizardScenario : baseUploadWizardScenario).findings.map((finding) => [finding.id,"pending"])));
  const [scopeCreated, setScopeCreated] = useState(false);

  const [taskView, setTaskView] = useState<"tasks"|"phases">("tasks");
  const [criticalPresentation, setCriticalPresentation] = useState<"canvas"|"list">("canvas");
  const [taskFilters, setTaskFilters] = useState({ stream:"", status:"", owner:"", query:"", criticalOnly:false });
  const [selectedTaskId, setSelectedTaskId] = useState(initialTrackerFixture.initialTaskId);
  const [criticalZoom, setCriticalZoom] = useState(1);
  const [criticalWindow, setCriticalWindow] = useState(0);
  const [selectedDependency, setSelectedDependency] = useState("");
  const [removedDependencies, setRemovedDependencies] = useState<string[]>([]);
  const [addedDependencies, setAddedDependencies] = useState<CriticalDependency[]>([]);
  const [dependencyEditorOpen, setDependencyEditorOpen] = useState(false);
  const [dependencyDraft, setDependencyDraft] = useState({ sourceId:"frame", targetId:"scope" });
  const [dependencyMessage, setDependencyMessage] = useState("Dependency model loaded");

  const [route, setRoute] = useState<TrackerRouteKey>("standard");
  const [selectedFlowId, setSelectedFlowId] = useState(initialTrackerFixture.initialFlowId);
  const [flowStatuses, setFlowStatuses] = useState<Record<string,string>>(() => Object.fromEntries(initialTrackerFixture.flowStages.map((stage) => [stage.id,stage.status])));

  useEffect(() => {
    const effectiveScenarioId: ScenarioId = !genericMode ? scenarioId : "base";
    const nextDccMode = effectiveScenarioId === "dcc-hackathon";
    const nextUploadScenario = system === "compass" && nextDccMode ? dccUploadWizardScenario : baseUploadWizardScenario;
    const nextTrackerFixture = trackerPatternFixtures[system === "tracker" && nextDccMode ? "dcc-hackathon" : "base"];
    // Scenario changes intentionally reset this cluster of interdependent demo state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWizardStep(1);
    setEnvironments([...nextUploadScenario.initialChoices]);
    setFileName(nextUploadScenario.initialFileName);
    setFindingIndex(0);
    setDecisions(Object.fromEntries(nextUploadScenario.findings.map((finding) => [finding.id,"pending"])));
    setScopeCreated(false);
    setTaskView("tasks");
    setCriticalPresentation("canvas");
    setTaskFilters({ stream:"",status:"",owner:"",query:"",criticalOnly:false });
    setSelectedTaskId(nextTrackerFixture.initialTaskId);
    setCriticalZoom(1);
    setCriticalWindow(0);
    setSelectedDependency("");
    setRemovedDependencies([]);
    setAddedDependencies([]);
    setDependencyEditorOpen(false);
    setDependencyDraft({ sourceId:nextTrackerFixture.criticalTasks[0]?.id ?? "frame",targetId:nextTrackerFixture.criticalTasks[1]?.id ?? "scope" });
    setDependencyMessage(nextDccMode && system === "tracker" ? "DCC assurance dependency model loaded" : "Dependency model loaded");
    setRoute("standard");
    setSelectedFlowId(nextTrackerFixture.initialFlowId);
    setFlowStatuses(Object.fromEntries(nextTrackerFixture.flowStages.map((stage) => [stage.id,stage.status])));
    setScenarioAnnouncement(`${scenarios[effectiveScenarioId].name} scenario loaded. Example data has been reset.`);
  }, [genericMode, scenarioId, system]);

  useEffect(() => {
    const openSearch = (event:globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLibrarySearchOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setLibrarySearchOpen(false);
        setTechPanel(null);
        setScenarioMenuOpen((open) => {
          if (open) window.requestAnimationFrame(() => scenarioTriggerRef.current?.focus());
          return false;
        });
      }
    };
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  useEffect(() => {
    if (techPanel !== "dependency" || techTab !== "component" || dependencySource) return;
    fetch(sitePath("/dependency-explorer.html")).then((response) => response.text()).then(setDependencySource).catch(() => setDependencySource("Unable to load the standalone preview. The download remains available."));
  }, [dependencySource, techPanel, techTab]);

  useEffect(() => {
    if (!techPanel?.startsWith("tracker-screen-") || techTab !== "component" || trackerScreenSources[techPanel]) return;
    const example = pocTrackerExamples.find((item) => `tracker-screen-${item.id}` === techPanel);
    if (!example) return;
    fetch(sitePath(`/poc-tracker-components/${example.folder}/component.js`)).then((response) => response.text()).then((source) => setTrackerScreenSources((current) => ({...current,[techPanel]:source}))).catch(() => setTrackerScreenSources((current) => ({...current,[techPanel]:"Unable to load this component source."})));
  }, [techPanel, techTab, trackerScreenSources]);

  useEffect(() => {
    if (blueprintPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delay = blueprintOverview ? 900 + Math.random() * 500 : 3000 + Math.random() * 1800;
    const timer = window.setTimeout(() => {
      if (!blueprintOverview) { setBlueprintOverview(true); return; }
      const currentIndex = blueprintViews.findIndex((view) => view.id === blueprintFocus);
      const nextIndex = (currentIndex + 1) % blueprintViews.length;
      setBlueprintFocus(blueprintViews[nextIndex].id);
      setBlueprintOverview(false);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [blueprintFocus, blueprintOverview, blueprintPaused]);

  const activeReviewFindings = uploadScenario.findings;
  const wizardStepLabels = uploadScenario.steps;
  const currentFinding = activeReviewFindings[findingIndex] ?? activeReviewFindings[0];
  const reviewedCount = Object.values(decisions).filter((value) => value !== "pending").length;
  const approvedCount = Object.values(decisions).filter((value) => value === "approved").length;
  const filteredTasks = useMemo(() => criticalTasks.filter((task) => {
    const query = `${task.code} ${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase();
    return (!taskFilters.stream || task.stream === taskFilters.stream)
      && (!taskFilters.status || task.status === taskFilters.status)
      && (!taskFilters.owner || task.owner === taskFilters.owner)
      && (!taskFilters.query || query.includes(taskFilters.query.toLowerCase()))
      && (!taskFilters.criticalOnly || task.critical);
  }), [criticalTasks,taskFilters]);

  const phaseTasks = useMemo(() => ["Discover","Delivery","Assure","Release"].map((phase, index) => {
    const tasks = filteredTasks.filter((task) => task.phase === phase);
    if (!tasks.length) return null;
    return { id:`phase-${phase}`, code:`PHASE ${index + 1}`, title:phase, owner:[...new Set(tasks.map((task) => task.owner))].join(", "), progress:Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length), status:tasks.some((task) => task.status === "Blocked") ? "Blocked" : tasks.every((task) => task.status === "Complete") ? "Complete" : "In progress", critical:tasks.some((task) => task.critical), stream:"Phase summary", phase, dependencies:index ? [`phase-${["Discover","Delivery","Assure","Release"][index - 1]}`] : [], description:`Duration-neutral summary of ${tasks.length} visible task${tasks.length === 1 ? "" : "s"}.`, tags:tasks.map((task) => task.code) };
  }).filter(Boolean), [filteredTasks]);

  const displayedTasks = taskView === "tasks" ? filteredTasks : phaseTasks;
  const selectedTaskBase = displayedTasks.find((task) => task?.id === selectedTaskId) || displayedTasks[0];
  const displayedTaskIds = new Set(displayedTasks.map((task) => task?.id));
  const activeTaskDependencies = [...initialTaskDependencies.filter((dependency) => !removedDependencies.includes(dependency.id)),...addedDependencies.filter((dependency) => !removedDependencies.includes(dependency.id))];
  const phaseDependencies: CriticalDependency[] = phaseTasks.flatMap((task) => task ? task.dependencies.map((sourceId) => ({ id:`${sourceId}-${task.id}`, sourceId, targetId:task.id })) : []).filter((dependency) => !removedDependencies.includes(dependency.id));
  const activeViewDependencies = taskView === "tasks" ? activeTaskDependencies : phaseDependencies;
  const selectedTask = selectedTaskBase ? {...selectedTaskBase,dependencies:activeViewDependencies.filter((dependency) => dependency.targetId === selectedTaskBase.id).map((dependency) => dependency.sourceId)} : selectedTaskBase;
  const displayedDependencies = activeViewDependencies.filter((dependency) => displayedTaskIds.has(dependency.sourceId) && displayedTaskIds.has(dependency.targetId));
  const diagramPositions = (() => {
    const visibleTasks = displayedTasks.filter(Boolean);
    const levels:Record<string,number> = Object.fromEntries(visibleTasks.map((task) => [task!.id,0]));
    for (let pass=0; pass<visibleTasks.length; pass+=1) {
      activeViewDependencies.forEach((dependency) => {
        if (levels[dependency.sourceId] === undefined || levels[dependency.targetId] === undefined) return;
        levels[dependency.targetId] = Math.max(levels[dependency.targetId],levels[dependency.sourceId]+1);
      });
    }
    const positions:Record<string,{x:number;y:number}> = {};
    const laneRight:Record<string,number> = {};
    visibleTasks.sort((a,b) => criticalLanes.findIndex((lane) => lane.id === a!.phase) - criticalLanes.findIndex((lane) => lane.id === b!.phase) || levels[a!.id] - levels[b!.id]).forEach((task) => {
      if (!task) return;
      const laneIndex = Math.max(0,criticalLanes.findIndex((lane) => lane.id === task.phase));
      const desiredX = 190 + levels[task.id] * 245;
      const x = Math.max(desiredX,(laneRight[task.phase] ?? 155)+35);
      positions[task.id] = { x, y:42 + laneIndex * 190 };
      laneRight[task.phase] = x + 220;
    });
    return positions;
  })();
  const criticalCanvasWidth = Math.max(1180,...Object.values(diagramPositions).map((position) => position.x+260));
  const routeStages = routes[route].stages.map((id) => flowStages.find((stage) => stage.id === id)!).filter(Boolean);
  const selectedFlow = flowStages.find((stage) => stage.id === selectedFlowId) || routeStages[0];
  const availableLibraryItems = genericMode ? individualComponents.map((item) => ({ id:`component-${item.id}`, componentKey:item.key, name:item.name, type:item.category, system:"both" as const, description:`${item.summary}${item.aliases?.length ? ` Also covers ${item.aliases.join(", ")}.` : ""} Used across ${item.source}.` })) : libraryNavigation.filter((item) => item.system === "both" || item.system === system);
  const matchingLibraryItems = availableLibraryItems.filter((item) => `${item.name} ${item.type} ${item.description}`.toLowerCase().includes(libraryQuery.toLowerCase()));
  const curatablePatterns = libraryNavigation.filter((item) => item.system === system && (system === "tracker" || item.id === "upload" || item.id === "dependencies" || item.id.startsWith("compass-pattern-")));
  const starredLibraryItems = starredPatternIds.flatMap((id) => {
    const item = curatablePatterns.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
  const blueprintIndex = blueprintViews.findIndex((view) => view.id === blueprintFocus);
  const activeBlueprint = blueprintViews[blueprintIndex];
  const activeBlueprintHighlights = blueprintFocus === "workflow"
    ? dccMode ? ["Standards library","Document scan","Human decision","Assurance report"] : system === "compass" ? ["Evidence intake","Human review","Scope approval","Dependencies"] : ["Critical path","Stage gates","Demo readiness","Ownership"]
    : activeBlueprint.highlights;

  const systemPreviewMode:ColourMode = dark ? "dark" : "light";
  const colourPreviewMode = colourPreviewOverride ?? systemPreviewMode;
  const typographyPreviewMode = typographyPreviewOverride ?? systemPreviewMode;
  const colourTheme = getColourTheme(system,colourPreviewMode,colourTokenOverrides);
  const typographyTheme = colourSystems[system][typographyPreviewMode];
  const alternateColourTheme = getColourTheme(system,colourPreviewMode === "light" ? "dark" : "light",colourTokenOverrides);
  const lightColourTheme = getColourTheme(system,"light",colourTokenOverrides);
  const darkColourTheme = getColourTheme(system,"dark",colourTokenOverrides);
  const hasTemporaryColourEdits = Object.keys(colourTokenOverrides[system]?.[colourPreviewMode] ?? {}).length > 0;
  const hasAnyTemporaryColourEdits = Object.values(colourTokenOverrides[system] ?? {}).some((modeOverrides) => Object.keys(modeOverrides ?? {}).length > 0);
  const liveThemeStyle = useMemo(() => {
    const liveTheme = getColourTheme(system,systemPreviewMode,colourTokenOverrides);
    return getLiveThemeStyle(system,systemPreviewMode,liveTheme,colourTokenOverrides[system]?.[systemPreviewMode]);
  },[colourTokenOverrides,system,systemPreviewMode]);

  useEffect(() => {
    document.querySelectorAll<HTMLIFrameElement>(".poc-inline-embed iframe").forEach((frame) => preparePoCEmbed(frame,dark,liveThemeStyle));
  },[dark,liveThemeStyle]);
  const foundationHeading = dccMode ? "Evidence-led documentation assurance." : system === "compass" ? "Evidence-led architecture work." : "Designed for decisions, not decoration.";
  const foundationCopy = dccMode ? "Keep standards, source excerpts, AI findings and named human decisions connected from upload to report." : system === "compass" ? "Keep provenance, review decisions, ownership, and architecture context close together." : "Make state, dependency, ownership, and the next useful action explicit.";
  const foundationPrinciples = dccMode
    ? [["01","Trace every claim","Every assessment points to a standard requirement and document excerpt."],["02","Keep humans accountable","AI proposes; a named reviewer approves, declines or asks for evidence."],["03","Map relationships","Standards, documents, findings and decisions stay connected."],["04","Report the gaps","Missing evidence remains visible through to the final assurance decision."]]
    : system === "compass"
    ? [["01","Preserve provenance","Every suggestion points back to evidence."],["02","Human approval","Generated findings remain suggestions until reviewed."],["03","Map relationships","Connections stay understandable from landscape to record."],["04","Support audit","Declines are retained alongside confirmations."]]
    : [["01","Make state explicit","Complete, blocked, and conditional work never relies on colour alone."],["02","Show dependencies","Critical work reveals what it needs and what it blocks."],["03","Keep ownership visible","Every stage and task has an accountable team."],["04","Validate the model","Cycles and missing dependency targets are surfaced."]];
  const structureFor = (componentKey:ComponentKey) => {
    const baseStructure = componentStructures[componentKey];
    const scenarioStructure = dccMode ? dccComponentData[componentKey] ?? trackerDccStructure(componentKey) : null;
    return baseStructure && scenarioStructure ? { ...baseStructure,...scenarioStructure } : baseStructure;
  };
  const activeComponent = techPanel ? componentCatalog[techPanel] : null;
  const activeStructure = techPanel ? structureFor(techPanel) : null;
  const workbenchContent = !techPanel || !activeComponent || !activeStructure ? "" : techTab === "component" ? (techPanel === "dependency" ? dependencySource || "Loading the standalone component source…" : techPanel.startsWith("tracker-screen-") ? trackerScreenSources[techPanel] || "Loading the screen component source…" : activeComponent.code) : techTab === "data" ? activeStructure.data : techTab === "api" ? activeStructure.api : "";
  const workbenchFile = !activeComponent || !activeStructure ? "" : techTab === "component" ? activeComponent.fileName : techTab === "data" ? activeStructure.dataFile : activeStructure.apiFile;

  function toggleEnvironment(name:string) {
    setEnvironments((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function updateTemporaryColour(tokenName:string, value:string) {
    setColourTokenOverrides((current) => ({
      ...current,
      [system]:{
        ...current[system],
        [colourPreviewMode]:{
          ...current[system]?.[colourPreviewMode],
          [tokenName]:value.toUpperCase(),
        },
      },
    }));
  }

  function resetTemporaryColours() {
    setColourTokenOverrides((current) => ({
      ...current,
      [system]:{},
    }));
  }

  function openTechDetails(componentKey:ComponentKey) {
    setTechPanel(componentKey);
    setTechTab("overview");
    setCopiedView("");
  }

  function activateBlueprint(focus:BlueprintFocus) {
    setBlueprintFocus(focus);
    setBlueprintOverview(false);
    setBlueprintPaused(true);
  }

  function openLibraryItem(id:string) {
    setLibrarySearchOpen(false);
    setLibraryQuery("");
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" }));
  }

  function handleLibrarySearchKey(event:KeyboardEvent<HTMLInputElement>) {
    if (!matchingLibraryItems.length) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setCommandIndex((current) => (current + 1) % matchingLibraryItems.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setCommandIndex((current) => (current - 1 + matchingLibraryItems.length) % matchingLibraryItems.length); }
    if (event.key === "Enter") { event.preventDefault(); openLibraryItem(matchingLibraryItems[commandIndex]?.id || matchingLibraryItems[0].id); }
  }

  async function getComponentCode(componentKey:ComponentKey) {
    if (componentKey.startsWith("tracker-screen-")) {
      const example = pocTrackerExamples.find((item) => `tracker-screen-${item.id}` === componentKey);
      if (!example) return "Unable to locate this screen component.";
      return fetch(sitePath(`/poc-tracker-components/${example.folder}/component.js`)).then((response) => response.text());
    }
    if (componentKey !== "dependency") return componentCatalog[componentKey].code;
    if (dependencySource) return dependencySource;
    const source = await fetch(sitePath("/dependency-explorer.html")).then((response) => response.text());
    setDependencySource(source);
    return source;
  }

  async function copyWorkbenchContent(componentKey:ComponentKey) {
    const structure = structureFor(componentKey);
    if (!structure) return;
    const content = techTab === "component" ? await getComponentCode(componentKey) : techTab === "data" ? structure.data : structure.api;
    await navigator.clipboard.writeText(content);
    const copiedKey = `${componentKey}:${techTab}`;
    setCopiedView(copiedKey);
    window.setTimeout(() => setCopiedView((current) => current === copiedKey ? "" : current), 1800);
  }

  async function downloadWorkbenchContent(componentKey:ComponentKey) {
    if (techTab === "component") { await downloadComponentCode(componentKey); return; }
    const structure = structureFor(componentKey);
    if (!structure) return;
    const content = techTab === "data" ? structure.data : structure.api;
    const fileName = techTab === "data" ? structure.dataFile : structure.apiFile;
    const blob = new Blob([content], { type:techTab === "data" ? "application/json" : "text/typescript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  async function downloadComponentCode(componentKey:ComponentKey) {
    const component = componentCatalog[componentKey];
    const code = await getComponentCode(componentKey);
    const blob = new Blob([code], { type:component.fileName.endsWith(".html") ? "text/html" : "text/typescript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = component.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function removeCriticalDependency() {
    if (!selectedDependency) return;
    const added = addedDependencies.some((dependency) => dependency.id === selectedDependency);
    if (added) setAddedDependencies((current) => current.filter((dependency) => dependency.id !== selectedDependency));
    else setRemovedDependencies((current) => current.includes(selectedDependency) ? current : [...current,selectedDependency]);
    setDependencyMessage("Dependency removed · layout rearranged");
    setSelectedDependency("");
  }

  function addCriticalDependency() {
    const { sourceId,targetId } = dependencyDraft;
    const id = `${sourceId}-${targetId}`;
    if (sourceId === targetId) { setDependencyMessage("A task cannot depend on itself"); return; }
    if (activeTaskDependencies.some((dependency) => dependency.id === id)) { setDependencyMessage("That dependency already exists"); return; }
    const candidateDependencies = [...activeTaskDependencies,{ id,sourceId,targetId }];
    const adjacency = new Map<string,string[]>();
    candidateDependencies.forEach((dependency) => adjacency.set(dependency.sourceId,[...(adjacency.get(dependency.sourceId) || []),dependency.targetId]));
    const stack = [targetId];
    const visited = new Set<string>();
    while (stack.length) {
      const current = stack.pop()!;
      if (current === sourceId) { setDependencyMessage("Dependency not added · it would create a cycle"); return; }
      if (visited.has(current)) continue;
      visited.add(current);
      stack.push(...(adjacency.get(current) || []));
    }
    if (initialTaskDependencies.some((dependency) => dependency.id === id)) setRemovedDependencies((current) => current.filter((dependencyId) => dependencyId !== id));
    else setAddedDependencies((current) => [...current,{ id,sourceId,targetId }]);
    setDependencyMessage("Dependency added · layout rearranged");
    setDependencyEditorOpen(false);
  }

  function resetCriticalDependencies() {
    setRemovedDependencies([]);
    setAddedDependencies([]);
    setSelectedDependency("");
    setDependencyMessage("Original dependency model restored");
  }

  function moveFlowSelection(event:KeyboardEvent<HTMLButtonElement>, index:number) {
    if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) return;
    const forward = ["ArrowRight","ArrowDown"].includes(event.key);
    const next = routeStages[index + (forward ? 1 : -1)];
    if (!next) return;
    event.preventDefault(); setSelectedFlowId(next.id);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-flow-id="${next.id}"]`)?.focus());
  }

  return (
    <div className="showcase" data-theme={dark ? "dark" : "light"} data-system={system} data-collection={genericMode ? "generic" : system} data-component-theme={genericMode ? "atelier" : undefined} data-sidebar={sidebar.collapsed ? "collapsed" : "expanded"} data-scenario={dccMode ? "dcc-hackathon" : "base"} style={genericMode ? undefined : liveThemeStyle}>
      <aside className="library-nav">
        <PortfolioBrand className="brand" section={genericMode ? "Individual components" : system === "compass" ? "Migration Compass" : "PoC Tracker"} />
        <div className="sidebar-style-card"><small>CURRENT COLLECTION</small><strong>{genericMode ? "Individual Components" : system === "compass" ? "Migration Compass" : "PoC Tracker"}</strong><span>{genericMode ? "Reusable interface building blocks" : dccMode ? "DCC documentation assurance scenario" : system === "compass" ? "Evidence-led architecture patterns" : "Visible delivery and planning patterns"}</span>{dccMode && <em>DCC HACKATHON DATA</em>}</div>
        <nav aria-label="Component library sections">
          {!genericMode && <><p>Views</p><Link href={system === "compass" ? dccMode ? "/foundation?scenario=dcc-hackathon" : "/foundation" : dccMode ? "/poc-tracker?scenario=dcc-hackathon" : "/poc-tracker"}><span>▦</span> Focused gallery</Link></>}
          {genericMode ? <><p>Individual components</p>{Object.keys(individualCategoryCopy).map((category,index) => <a href={`#individual-${category.toLowerCase().replaceAll(" ","-")}`} key={category}><span>{String(index + 1).padStart(2,"0")}</span> {category}</a>)}<p>Full library</p><a className="sidebar-index-parent" href="#full-component-index"><span>↘</span> Component index</a></> : <>{starredLibraryItems.length > 0 && <><p className="sidebar-recommended-title">{dccMode ? "Recommended · DCC" : "Starred patterns"}</p>{starredLibraryItems.map((item) => <a className="sidebar-recommended-link" href={`#${item.id}`} key={`recommended-${item.id}`}><span>★</span> {item.name}</a>)}</>}<p>Foundations</p><a href="#principles"><span>01</span> Principles</a><a href="#colour"><span>02</span> Colour</a><a href="#type"><span>03</span> Typography</a>{system === "compass" && <a href="#export-ui"><span>↓</span> Export UI</a>}<p>Components</p><a href="#controls"><span>04</span> Controls</a><a href="#feedback"><span>05</span> Feedback</a><p>{system === "compass" ? "Compass patterns" : "Tracker patterns"}</p>{system === "compass" ? <><a href="#upload"><span>06</span> Upload & review</a><a href="#dependencies"><span>07</span> Dependencies</a>{compassPatterns.map((pattern,index) => <a href={`#compass-pattern-${pattern.id}`} key={pattern.id}><span>{String(index + 8).padStart(2,"0")}</span> {pattern.title}</a>)}</> : <><a href="#critical-path"><span>06</span> Critical path</a><a href="#process-flow"><span>07</span> Process flow</a>{pocTrackerExamples.map((example) => <a href={`#${example.id}`} key={example.id}><span>{example.number}</span> {example.title}</a>)}</>}</>}
        </nav>
        <div className="nav-footer"><span className="version"><StatusDot tone="success" /> Ready to explore</span><p>Every example is interactive and self-contained.</p></div>
        <button type="button" className="sidebar-collapse-control" onClick={sidebar.toggle} aria-label={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!sidebar.collapsed} title={sidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"}><span aria-hidden="true">{sidebar.collapsed ? "›" : "‹"}</span></button>
      </aside>

      <main id="top">
        <header className="topbar">
          <div className="breadcrumb"><span>AA Portfolio</span><b>/</b><strong>{genericMode ? "Individual Components" : system === "compass" ? "Migration Compass" : "PoC Tracker"}</strong>{dccMode && <em>DCC Hackathon</em>}</div>
          <div className="system-switch" role="group" aria-label="Choose library collection">
            <Link className={system === "compass" && !genericMode ? "active compass-choice" : "compass-choice"} href={scenarioId === "dcc-hackathon" ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"} aria-current={system === "compass" && !genericMode ? "page" : undefined}><i />Migration Compass</Link>
            <Link className={system === "tracker" && !genericMode ? "active tracker-choice" : "tracker-choice"} href={scenarioId === "dcc-hackathon" ? "/?system=tracker&scenario=dcc-hackathon" : "/?system=tracker"} aria-current={system === "tracker" && !genericMode ? "page" : undefined}><i />PoC Tracker</Link>
            <Link className={`generic-choice ${genericMode ? "active" : ""}`} href="/components" aria-current={genericMode ? "page" : undefined}><i />Individual Components</Link>
            <Link className="agent-choice" href="/methods"><i />Agent Methods</Link>
          </div>
          <div className="topbar-actions">
            {!genericMode && <div className="scenario-control"><button ref={scenarioTriggerRef} className={`icon-button scenario-trigger ${dccMode ? "active" : ""}`} type="button" onClick={() => setScenarioMenuOpen((open) => !open)} aria-label="Change demo scenario" aria-controls="scenario-popover" aria-expanded={scenarioMenuOpen} title="Change demo scenario"><span aria-hidden="true">✦</span><i aria-hidden="true" /></button>{scenarioMenuOpen && <section className="scenario-popover" id="scenario-popover" aria-labelledby="scenario-popover-title"><header><div><span>DEMO DATA</span><h2 id="scenario-popover-title">Choose a scenario</h2></div><button type="button" onClick={() => { setScenarioMenuOpen(false); window.requestAnimationFrame(() => scenarioTriggerRef.current?.focus()); }} aria-label="Close scenario switcher">×</button></header><p>Switch the example content without changing the components.</p><div role="group" aria-label="Demo scenario">{(Object.keys(scenarios) as ScenarioId[]).map((id) => { const option = scenarios[id]; return <button type="button" aria-pressed={scenarioId === id} className={scenarioId === id ? "selected" : ""} onClick={() => { selectScenario(id); setScenarioMenuOpen(false); window.requestAnimationFrame(() => scenarioTriggerRef.current?.focus()); }} key={id}><i>{scenarioId === id ? "✓" : ""}</i><span><strong>{option.name}</strong><small>{option.description}</small></span>{id === "dcc-hackathon" && <em>HACKATHON</em>}</button>; })}</div><footer><span>{starredPatternIds.length} starred for {scenario.shortName}</span><button type="button" onClick={resetRecommendations}>Reset recommendations</button></footer></section>}</div>}
            <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} aria-pressed={dark}>{dark ? "☀" : "◐"}</button>
          </div>
          <span className="visually-hidden" aria-live="polite">{scenarioAnnouncement}</span>
        </header>

        {genericMode ? <><section className="generic-library-intro"><div className="generic-library-intro-copy"><span>INDIVIDUAL COMPONENT SHOWROOM</span><h1>Small parts.<br /><em>Strong systems.</em></h1><p>Explore each reusable primitive and shared pattern through a focused specimen, clear usage guidance, implementation details, and downloadable source.</p><div><button className="button primary" onClick={() => setLibrarySearchOpen(true)}>Find a component <kbd>⌘ K</kbd></button><a className="button secondary" href="#individual-actions">Browse {individualComponents.length} components ↓</a></div></div><ClassicBlueprintHero label="Mapped component blueprint" items={individualHeroItems} status={`${individualComponents.length} COMPONENTS · ${individualComponentAliasCount} ALIASES CONSOLIDATED`} /><div className="generic-library-intro-strip"><span><i /> Production-minded</span><span>Theme-aware</span><span>Keyboard-ready</span><span>Inspectable source</span><span>{individualComponentAliasCount} aliases consolidated</span></div></section><GenericCatalogue layout="sections" onDetails={openTechDetails} onDownload={downloadComponentCode} /><section className="full-component-index-intro" id="full-component-index"><div><p className="eyebrow">FULL COMPONENT INDEX</p><h2>Every individual component, accounted for.</h2><p>This index brings together the common primitives and reusable parts used throughout the Compass and Tracker showroom.</p></div><div className="full-index-summary"><span><strong>{individualComponents.length}</strong><small>canonical components</small></span><span><strong>{individualComponentAliasCount}</strong><small>consolidated aliases</small></span><a href="#individual-actions">Browse component specimens ↑</a></div><IndividualComponentDirectory /></section></> : <>
        <section className="hero" id="principles">
          <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
          <div className="hero-copy">
            <span className="release-tag">{dccMode ? "DCC HACKATHON · DOCUMENTATION ASSURANCE" : system === "compass" ? "MIGRATION COMPASS · COMPONENT SHOWROOM" : "POC TRACKER · COMPONENT SHOWROOM"}</span>
            <h1>{dccMode && system === "tracker" ? <>Make assurance<br /><em>progress visible.</em></> : dccMode ? <>Assure documents<br /><em>against standards.</em></> : system === "compass" ? <>Navigate complex<br /><em>architecture decisions.</em></> : <>Make delivery<br /><em>progress visible.</em></>}</h1>
            <p>{dccMode && system === "tracker" ? "Plan and track standards-based document assurance from intake and AI assessment through named human review, remediation and publication." : dccMode ? "A realistic hackathon scenario for loading standards, scanning uploaded documents with AI, reviewing source-linked findings and publishing a human-approved assurance result." : system === "compass" ? "An evidence-led architecture system for intake, human review, system mapping, and migration planning." : "A delivery system for critical dependencies, gated routes, explicit ownership, and confident demo readiness."}</p>
            <div className="hero-actions"><a className="button primary" href={dccMode ? "#scenario-library" : system === "compass" ? "#upload" : "#critical-path"}>{dccMode ? "See DCC recommendations" : "Try interactive patterns"} <span>↓</span></a><Link className="button secondary" href={system === "compass" ? dccMode ? "/foundation?scenario=dcc-hackathon" : "/foundation" : dccMode ? "/poc-tracker?scenario=dcc-hackathon" : "/poc-tracker"}>View focused gallery <span>↗</span></Link></div>
          </div>
          <aside className="blueprint-carousel" aria-label="Interactive component blueprint" onMouseEnter={() => setBlueprintPaused(true)} onMouseLeave={() => setBlueprintPaused(false)}>
            <header><span><i /> LIVE SYSTEM BLUEPRINT</span><b>{blueprintOverview ? "OVERVIEW" : `${String(blueprintIndex + 1).padStart(2,"0")} / 04`}</b></header>
            <div className="blueprint-viewport" data-focus={blueprintFocus} data-camera={blueprintOverview ? "overview" : "detail"}>
              <div className="blueprint-ruler blueprint-ruler-x" aria-hidden="true" /><div className="blueprint-ruler blueprint-ruler-y" aria-hidden="true" />
              <div className="blueprint-canvas">
                <button className="blueprint-zone blueprint-foundations" onMouseEnter={() => activateBlueprint("foundations")} onFocus={() => activateBlueprint("foundations")} onClick={() => activateBlueprint("foundations")} aria-label="Focus foundations blueprint"><span className="blueprint-zone-label"><b>01</b> SYSTEM FOUNDATIONS</span><strong>{foundationHeading}</strong><p>{foundationCopy}</p><div>{foundationPrinciples.map(([number,title]) => <span key={number}><i>{number}</i>{title}</span>)}</div></button>
                <button className="blueprint-zone blueprint-controls" onMouseEnter={() => activateBlueprint("controls")} onFocus={() => activateBlueprint("controls")} onClick={() => activateBlueprint("controls")} aria-label="Focus controls blueprint"><span className="blueprint-zone-label"><b>02</b> UI CONTROL SET</span><strong>Working states, visibly designed.</strong><div className="blueprint-mini-input"><i>⌕</i><span>{dccMode ? "Search standards…" : "Search components…"}</span><kbd>/</kbd></div><div className="blueprint-control-demo"><span className="primary">{dccMode ? "Run assurance" : "Primary action"}</span><span>{dccMode ? "Upload document" : "Secondary"}</span><span className="status"><i /> In review</span><span className="toggle"><i /> {dccMode ? "Evidence links" : "Auto-arrange"}</span></div></button>
                <button className="blueprint-zone blueprint-workflow" onMouseEnter={() => activateBlueprint("workflow")} onFocus={() => activateBlueprint("workflow")} onClick={() => activateBlueprint("workflow")} aria-label="Focus workflow blueprint"><span className="blueprint-zone-label"><b>03</b> INTERACTIVE WORKFLOW</span><strong>{dccMode ? "Standards to assurance decision" : system === "compass" ? "Evidence to approved scope" : "Frame to demonstrated outcome"}</strong><div className="blueprint-flow-demo">{(dccMode ? ["Select","Upload","Review","Report"] : ["Frame","Build","Assure","Prove"]).map((label,index) => <span className={index < 2 ? "complete" : index === 2 ? "active" : ""} key={label}><i>{index < 2 ? "✓" : index + 1}</i><b>{label}</b></span>)}</div></button>
                <button className="blueprint-zone blueprint-source" onMouseEnter={() => activateBlueprint("source")} onFocus={() => activateBlueprint("source")} onClick={() => activateBlueprint("source")} aria-label="Focus source-code blueprint"><span className="blueprint-zone-label"><b>04</b> REUSABLE SOURCE</span><strong>Inspectable. Copyable. Downloadable.</strong><div className="blueprint-mini-file"><span><i /><i /><i /></span><b>Component.tsx</b><em>TSX</em></div><code><span><i>01</i><b>export function</b> Component() &#123;</span><span><i>02</i>&nbsp;&nbsp;<em>const</em> [state, setState] = useState();</span><span><i>03</i>&nbsp;&nbsp;<b>return</b> &lt;InteractiveUI /&gt;;</span><span><i>04</i>&#125;</span></code></button>
              </div>
              <div className="blueprint-focus-label" aria-live="polite"><span>{blueprintOverview ? "00" : activeBlueprint.number}</span><div><small>{blueprintOverview ? "SYSTEM OVERVIEW" : activeBlueprint.label.toUpperCase()}</small><strong>{blueprintOverview ? "One system, four reusable layers" : activeBlueprint.focus}</strong><ul aria-label={blueprintOverview ? "Blueprint areas" : `${activeBlueprint.label} capabilities`}>{(blueprintOverview ? blueprintViews.map((view) => view.label) : activeBlueprintHighlights).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div></div>
            </div>
            <nav aria-label="Choose blueprint area">{blueprintViews.map((view) => <button className={blueprintFocus === view.id ? "active" : ""} aria-pressed={blueprintFocus === view.id} onMouseEnter={() => activateBlueprint(view.id)} onFocus={() => activateBlueprint(view.id)} onClick={() => activateBlueprint(view.id)} key={view.id}><span>{view.number}</span><div><strong>{view.label}</strong><small>{view.description}</small></div></button>)}</nav>
          </aside>
        </section>

        {!genericMode && starredLibraryItems.length > 0 && <section className="scenario-library" id="scenario-library" aria-labelledby="scenario-library-title">
          <header><div><span>{dccMode ? "DCC HACKATHON · CURATED ROUTE" : "PERSONAL SHORTCUTS"}</span><h2 id="scenario-library-title">{scenario.recommendationTitle}</h2><p>{scenario.recommendationCopy}</p></div><div><strong>{starredLibraryItems.length}</strong><span>{dccMode ? "recommended patterns" : "starred patterns"}</span><button type="button" onClick={resetRecommendations}>Reset</button></div></header>
          <div>{starredLibraryItems.map((item,index) => <article key={item.id}><a href={`#${item.id}`}><span><i>{String(index + 1).padStart(2,"0")}</i><em>{item.id === "upload" ? "COLLECT" : item.id === "dependencies" ? "RELATE" : item.name.toUpperCase()}</em></span><strong>{item.name}</strong><p>{dccMode ? system === "tracker" ? trackerDccPatternDescriptions[item.id] ?? item.description : item.id === "upload" ? "Select standards, upload a document and review AI findings." : item.id === "dependencies" ? "Trace standards, documents, assurance runs and decisions." : item.description : item.description}</p><b>Open pattern ↓</b></a><button type="button" aria-label={`Remove ${item.name} from ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}`} onClick={() => toggleStar(item.id)}><span aria-hidden="true">★</span></button></article>)}</div>
        </section>}

        <section className="content-section" id="colour">
          <SectionHeading eyebrow="02 · COLOUR" title={system === "compass" ? "CGI red across light and dark environments." : "A semantic palette for both modes."} copy={system === "compass" ? "Edit identity, operational states, and text here to update every matching component across the current page." : "Edit brand, interaction, delivery status, and text here to update every matching component across the current page."} />
          <div className="foundation-mode-lab colour-mode-lab" data-preview-theme={colourPreviewMode} data-preview-source={colourPreviewOverride ? "override" : "system"} style={{"--preview-canvas":colourTheme.canvas,"--preview-surface":colourTheme.surface,"--preview-soft":colourTheme.surfaceSoft,"--preview-border":colourTheme.border,"--preview-text":colourTheme.text,"--preview-muted":colourTheme.muted,"--preview-primary":colourTheme.tokens[1].value,"--preview-info":colourTheme.tokens[system === "compass" ? 3 : 2].value,"--preview-success":colourTheme.tokens[system === "compass" ? 4 : 3].value,"--preview-warning":colourTheme.tokens[system === "compass" ? 5 : 4].value,"--preview-danger":colourTheme.tokens[system === "compass" ? 1 : 5].value} as CSSProperties}>
            <header className="foundation-preview-toolbar"><div><span><i /> COLOUR TOKENS</span><strong>{colourPreviewMode === "light" ? "Light palette" : "Dark palette"}</strong><small>{colourPreviewOverride ? "Local override" : "Following system"} · {system === "compass" ? "Migration Compass" : "PoC Tracker"} · {colourTheme.tokens.length + 4} core tokens{hasTemporaryColourEdits ? colourPreviewMode === systemPreviewMode ? " · Live across this page" : " · Live when the page uses this mode" : ""}</small></div><div className="foundation-mode-toggle" role="group" aria-label="Colour palette preview mode"><button className={colourPreviewOverride === null ? "active" : ""} aria-pressed={colourPreviewOverride === null} onClick={() => setColourPreviewOverride(null)}><span>◎</span> System</button><button className={colourPreviewOverride === "light" ? "active" : ""} aria-pressed={colourPreviewOverride === "light"} onClick={() => setColourPreviewOverride("light")}><span>☀</span> Light</button><button className={colourPreviewOverride === "dark" ? "active" : ""} aria-pressed={colourPreviewOverride === "dark"} onClick={() => setColourPreviewOverride("dark")}><span>◐</span> Dark</button></div></header>
            <div className="colour-preview-layout"><section className="colour-token-sheet" data-editing={colourEditing ? "true" : "false"}><header><span>SEMANTIC TOKENS</span><div className="colour-token-actions"><code>{colourPreviewMode}.theme.json</code><button type="button" className={colourEditing ? "active" : ""} aria-pressed={colourEditing} onClick={() => setColourEditing((editing) => !editing)}><span aria-hidden="true">✎</span>{colourEditing ? "Done" : "Edit colours"}</button><button type="button" disabled={!hasAnyTemporaryColourEdits} onClick={resetTemporaryColours}><span aria-hidden="true">↺</span>Reset defaults</button></div></header><div className="swatch-grid colour-token-grid">{colourTheme.tokens.map((token,index) => <article className="swatch colour-token" key={token.name} style={{"--swatch":token.value,"--token-index":String(index + 1).padStart(2,"0")} as CSSProperties}><span />{colourEditing && <input className="colour-token-picker" type="color" value={token.value} onChange={(event) => updateTemporaryColour(token.name,event.target.value)} aria-label={`Edit ${token.name} colour`} title={`Edit ${token.name} colour`} />}<div><strong>{token.name}</strong><small>{token.role}</small></div><code>{token.value}</code></article>)}</div></section><aside className="colour-context-preview"><header><span>UI PREVIEW</span><b>{colourPreviewMode.toUpperCase()}</b></header><div className="colour-preview-window"><nav><i /><span>Architecture workspace</span><b>•••</b></nav><section><small>COLLECTION STATUS</small><h3>Evidence is ready to review.</h3><p>Colour supports hierarchy and state without carrying meaning alone.</p><div><button>Review findings</button><button>View source</button></div><footer><span className="success">✓ Complete</span><span className="warning">! Needs review</span></footer></section></div><dl><div><dt>Canvas</dt><dd>{colourTheme.canvas}</dd></div><div><dt>Surface</dt><dd>{colourTheme.surface}</dd></div><div><dt>Surface soft</dt><dd>{colourTheme.surfaceSoft}</dd></div><div><dt>Border</dt><dd>{colourTheme.border}</dd></div></dl></aside></div>
            <footer className="colour-mode-comparison"><button className={colourPreviewMode === "light" ? "active" : ""} onClick={() => setColourPreviewOverride("light")}><span><b>LIGHT</b><small>{lightColourTheme.canvas} canvas</small></span><i>{lightColourTheme.tokens.slice(1).map((token) => <em style={{background:token.value}} key={token.name} />)}</i></button><button className={colourPreviewMode === "dark" ? "active" : ""} onClick={() => setColourPreviewOverride("dark")}><span><b>DARK</b><small>{darkColourTheme.canvas} canvas</small></span><i>{darkColourTheme.tokens.slice(1).map((token) => <em style={{background:token.value}} key={token.name} />)}</i></button><p><span>Alternate mode</span><strong>{alternateColourTheme.text}</strong> text on <strong>{alternateColourTheme.canvas}</strong></p></footer>
          </div>
        </section>

        <section className="content-section type-section" id="type">
          <SectionHeading eyebrow="03 · TYPOGRAPHY" title="Source Sans 3 for every working environment." copy={system === "compass" ? "Inspect the same hierarchy, weights, and supporting contrast against both Compass surface systems." : "Toggle the specimen to check display, heading, body, label, and data styles against both Tracker themes."} />
          <div className="foundation-mode-lab typography-mode-lab" data-preview-theme={typographyPreviewMode} data-preview-source={typographyPreviewOverride ? "override" : "system"} style={{"--preview-canvas":typographyTheme.canvas,"--preview-surface":typographyTheme.surface,"--preview-soft":typographyTheme.surfaceSoft,"--preview-border":typographyTheme.border,"--preview-text":typographyTheme.text,"--preview-muted":typographyTheme.muted,"--preview-primary":typographyTheme.tokens[1].value} as CSSProperties}><header className="foundation-preview-toolbar"><div><span><i /> TYPOGRAPHY SPECIMEN</span><strong>Source Sans 3 variable</strong><small>{typographyPreviewOverride ? "Local override" : "Following system"} · {typographyPreviewMode === "light" ? "Light surfaces" : "Dark surfaces"} · AA-minded contrast</small></div><div className="foundation-mode-toggle" role="group" aria-label="Typography preview mode"><button className={typographyPreviewOverride === null ? "active" : ""} aria-pressed={typographyPreviewOverride === null} onClick={() => setTypographyPreviewOverride(null)}><span>◎</span> System</button><button className={typographyPreviewOverride === "light" ? "active" : ""} aria-pressed={typographyPreviewOverride === "light"} onClick={() => setTypographyPreviewOverride("light")}><span>☀</span> Light</button><button className={typographyPreviewOverride === "dark" ? "active" : ""} aria-pressed={typographyPreviewOverride === "dark"} onClick={() => setTypographyPreviewOverride("dark")}><span>◐</span> Dark</button></div></header><div className="type-specimen type-mode-specimen"><div className="type-large"><span>Display · 64 / 66</span><p>{system === "compass" ? <>Trace the<br /><em>evidence.</em></> : <>Map the<br /><em>unknown.</em></>}</p><small>Font weight 720 · −4.5% tracking</small></div><div className="type-scale"><p className="t1"><span>32 / 38 · HEADING</span>{system === "compass" ? "Architecture baseline" : "Demo readiness"}</p><p className="t2"><span>20 / 28 · SUBHEADING</span>{system === "compass" ? "Technology review" : "Critical dependencies"}</p><p className="t3"><span>16 / 24 · BODY</span>Review the evidence and confirm the next useful action.</p><p className="t4"><span>12 / 16 · LABEL</span>OWNER · STATUS · LAST UPDATED</p><p className="mono"><span>12 / 18 · MONO</span>confidence: 0.92 · status: review-required</p></div></div><footer className="typography-contrast-strip"><span><i style={{background:typographyTheme.text}} />Primary text <b>{typographyTheme.text}</b></span><span><i style={{background:typographyTheme.muted}} />Secondary text <b>{typographyTheme.muted}</b></span><span><i style={{background:typographyTheme.tokens[1].value}} />Accent text <b>{typographyTheme.tokens[1].value}</b></span></footer></div>
        </section>

        {system === "compass" && <section className="content-section ui-export-section" id="export-ui">
          <div className="ui-export-heading">
            <SectionHeading eyebrow="EXPORT UI" title="Take the complete UI system with you." copy="Download the typography, semantic colour tokens, or the full working React interface—including all 26 reusable patterns and their styling assets." />
            <a className="button primary ui-export-all" href={sitePath("/reusable-component-foundation/compass-ui-code.zip")} download>Download everything <span>↓</span></a>
          </div>
          <div className="ui-export-grid">
            <article className="ui-export-card ui-export-type">
              <header><span>01 · TYPOGRAPHY</span><small>CSS tokens + font faces</small></header>
              <div className="ui-export-type-sample"><strong>Aa</strong><div><span>Source Sans 3</span><b>Reusable by design.</b><small>Display 850 · Heading 750 · Body 400</small></div></div>
              <footer><span><b>9</b> semantic type tokens</span><a href={sitePath("/reusable-component-foundation/styling/typography.css")} download>Export typography <b>↓</b></a></footer>
            </article>
            <article className="ui-export-card ui-export-colours">
              <header><span>02 · COLOURS</span><small>CSS custom properties</small></header>
              <div className="ui-export-swatches" aria-label="Exportable reusable template colour palette">
                {[['Ink','#172033'],['Compass plum','#64357B'],['Signal red','#E31937'],['Success','#15936B'],['Canvas','#F7F8FA']].map(([label,value]) => <span key={label}><i style={{background:value}} /><b>{label}</b><code>{value}</code></span>)}
              </div>
              <footer><span><b>19</b> semantic colour tokens</span><a href={sitePath("/reusable-component-foundation/styling/colours.css")} download>Export colours <b>↓</b></a></footer>
            </article>
            <article className="ui-export-card ui-export-code">
              <header><span>03 · FULL UI CODE</span><small>React · TypeScript · CSS</small></header>
              <div className="ui-export-code-window" aria-hidden="true"><div><i /><i /><i /><span>compass-ui/</span></div><pre><b>├─</b> FoundationGallery.tsx{"\n"}<b>├─</b> foundation.module.css{"\n"}<b>├─</b> templates/{"\n"}<em>│  ├─</em> PlanningTemplates.tsx{"\n"}<em>│  ├─</em> CollectionTemplates.tsx{"\n"}<em>│  ├─</em> AnalysisTemplates.tsx{"\n"}<em>│  └─</em> OutcomeTemplates.tsx{"\n"}<b>└─</b> styling/</pre></div>
              <footer><span><b>26</b> complete UI patterns</span><a href={sitePath("/reusable-component-foundation/compass-ui-code.zip")} download>Export full UI <b>↓</b></a></footer>
            </article>
          </div>
        </section>}

        <section className="content-section" id="controls">
          <SectionHeading eyebrow="04 · CONTROLS" title="Clear actions, compact footprints." copy="Controls retain predictable emphasis, keyboard focus, and generous interaction targets in both systems." />
          <ComponentActions componentKey="controls" onDetails={openTechDetails} onDownload={downloadComponentCode} />
          <div className="component-stage controls-stage"><div className="specimen-group"><p className="specimen-label">BUTTONS</p><div className="button-row">{controlsFeedbackFixture.controls.buttons.map((button) => <button className={`button ${button.variant}`} disabled={button.disabled} key={button.label}>{button.label}</button>)}</div></div><div className="control-grid"><label><span>{controlsFeedbackFixture.controls.selectLabel}</span><select defaultValue={controlsFeedbackFixture.controls.selectValue}>{controlsFeedbackFixture.controls.selectOptions.map((option) => <option value={option.value} key={option.label}>{option.label}</option>)}</select></label><label><span>Search</span><div className="input-with-icon"><i>⌕</i><input placeholder={controlsFeedbackFixture.controls.searchPlaceholder} /></div></label><label className="checkbox-row"><input type="checkbox" defaultChecked /><span><b>{controlsFeedbackFixture.controls.checkboxTitle}</b><small>{controlsFeedbackFixture.controls.checkboxCopy}</small></span></label><label className="toggle-row"><span><b>{controlsFeedbackFixture.controls.toggleTitle}</b><small>{controlsFeedbackFixture.controls.toggleCopy}</small></span><input type="checkbox" defaultChecked /><i /></label></div></div>
        </section>

        <section className="content-section" id="feedback">
          <SectionHeading eyebrow="05 · FEEDBACK" title="Status that reads at a glance." copy="Badges and notices pair language, shape, and colour so meaning survives low contrast and quick scanning." />
          <ComponentActions componentKey="feedback" onDetails={openTechDetails} onDownload={downloadComponentCode} />
          <div className="feedback-grid"><div className="component-stage"><p className="specimen-label">STATUS BADGES</p><div className="badge-row">{controlsFeedbackFixture.feedback.statuses.map((status) => <span className={`badge ${status.className}`} key={status.label}><StatusDot tone={status.tone} /> {status.label}</span>)}</div></div>{controlsFeedbackFixture.feedback.notices.map((notice) => <div className={`notice ${notice.className}`} key={notice.className}><span>{notice.icon}</span><div><strong>{notice.title}</strong><p>{notice.copy}</p></div><button aria-label="Dismiss notice">×</button></div>)}</div>
        </section>

        {system === "compass" && <>
          <section className="content-section pattern-section" id="upload">
            <SectionHeading eyebrow="06 · COMPASS PATTERN" title={uploadScenario.sectionTitle} copy={uploadScenario.sectionCopy} />
            <ComponentActions componentKey="upload" onDetails={openTechDetails} onDownload={downloadComponentCode} fullscreenTarget="pattern-upload" star={{ active:starredPatternIds.includes("upload"),onToggle:() => toggleStar("upload"),label:`${starredPatternIds.includes("upload") ? "Remove" : "Add"} document assurance ${starredPatternIds.includes("upload") ? "from" : "to"} ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}` }} />
            <div className="pattern-frame pattern-fullscreen-target" id="pattern-upload"><FullscreenExit label={uploadScenario.fullscreenLabel} /><div className="frame-toolbar"><div><i /><i /><i /></div><span>{uploadScenario.toolbarTitle}</span><b>{uploadScenario.toolbarStatus}</b></div><div className="upload-demo">
              <aside className="wizard-rail"><div className="wizard-title"><span className="mini-mark">{uploadScenario.mark}</span><div><strong>{uploadScenario.wizardTitle}</strong><small>{uploadScenario.wizardSubtitle}</small></div></div>{wizardStepLabels.map((label,index) => { const number = index + 1; return <button className={`wizard-step ${wizardStep === number ? "active" : wizardStep > number ? "complete" : ""}`} key={label} onClick={() => setWizardStep(number)}><span>{wizardStep > number ? "✓" : number}</span><div><small>STEP {number}</small><strong>{label}</strong></div></button>; })}<div className="wizard-meta"><small>{uploadScenario.runLabel}</small><strong>{uploadScenario.runId}</strong><span><StatusDot tone={wizardStep > 2 ? "success" : "warning"} /> {wizardStep > 2 ? uploadScenario.processedStatus : "Draft in progress"}</span></div></aside>
              <div className="review-panel wizard-content">
                <div className="wizard-mobile-progress" aria-label={`Step ${wizardStep} of 4`}><span>Step {wizardStep} of 4</span><strong>{wizardStepLabels[wizardStep - 1]}</strong><div><i style={{width:`${wizardStep * 25}%`}} /></div></div>
                {wizardStep === 1 && <><div className="review-header"><div><p className="eyebrow">STEP 1 OF 4</p><h3>{uploadScenario.choiceTitle}</h3><p>{uploadScenario.choiceCopy}</p></div><div className="review-count"><strong>{environments.length}</strong><span>selected</span></div></div><div className="environment-grid">{uploadScenario.choices.map((choice) => <label className={environments.includes(choice.value) ? "selected" : ""} key={choice.id}><input type="checkbox" checked={environments.includes(choice.value)} onChange={() => toggleEnvironment(choice.value)} /><span className="environment-icon">{choice.icon}</span><span><strong>{choice.label}</strong><small>{choice.detail}</small></span></label>)}</div></>}
                {wizardStep === 2 && <><div className="review-header"><div><p className="eyebrow">STEP 2 OF 4</p><h3>{uploadScenario.documentTitle}</h3><p>{uploadScenario.documentCopy}</p></div></div><label className="document-type"><span>Document type</span><select defaultValue={uploadScenario.documentTypes[0]}>{uploadScenario.documentTypes.map((documentType) => <option key={documentType}>{documentType}</option>)}</select></label><label className="upload-drop"><input type="file" accept=".pdf,.png,.jpg,.drawio,.docx,.xlsx,.txt,.md" onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name || "")} /><span className="upload-glyph">↑</span><strong>{fileName || "Drop a file here or browse"}</strong><small>{uploadScenario.uploadHint}</small></label>{fileName && <div className="source-file"><span className="file-icon">{uploadScenario.fileIcon}</span><div><strong>{fileName}</strong><small>{uploadScenario.fileReadyCopy(environments.length)}</small></div><button className="button quiet" onClick={() => setFileName("")}>Remove</button></div>}</>}
                {wizardStep === 3 && <><div className="review-header"><div><p className="eyebrow">STEP 3 OF 4</p><h3>{uploadScenario.reviewTitle}</h3><p>{uploadScenario.reviewCopy}</p></div><div className="review-count"><strong>{reviewedCount}/{activeReviewFindings.length}</strong><span>reviewed</span></div></div><div className="finding-tabs" role="tablist" aria-label="Review findings">{activeReviewFindings.map((finding,index) => <button role="tab" aria-label={`Finding ${index + 1}: ${finding.title} · ${decisions[finding.id]}`} aria-selected={findingIndex === index} className={findingIndex === index ? "active" : ""} onClick={() => setFindingIndex(index)} key={finding.id}><StatusDot tone={decisions[finding.id] === "approved" ? "success" : decisions[finding.id] === "declined" ? "danger" : "warning"} /><span>{index + 1}</span></button>)}</div><div className="source-file"><span className="file-icon">{uploadScenario.reviewFileIcon}</span><div><strong>{fileName || uploadScenario.initialFileName}</strong><small>{uploadScenario.reviewFileMeta}</small></div><span className="confidence">{uploadScenario.reviewSummary}</span></div><div className={`insight-card ${decisions[currentFinding.id]}`}><div className="insight-top"><div className="tech-avatar">{currentFinding.initials}</div><div><span className="suggestion-label">{currentFinding.kind}</span><h4>{currentFinding.title}</h4><p>{currentFinding.subtitle}</p></div><span className="confidence-score">{currentFinding.confidence}</span></div><blockquote>“{currentFinding.quote}”</blockquote><div className="evidence-meta"><span>{currentFinding.source}</span><span>{uploadScenario.evidenceSource}</span></div>{decisions[currentFinding.id] === "pending" ? <div className="decision-row"><button className="button approve" onClick={() => setDecisions((value) => ({...value,[currentFinding.id]:"approved"}))}>✓ Approve finding</button><button className="button secondary" onClick={() => setDecisions((value) => ({...value,[currentFinding.id]:"declined"}))}>Decline</button><button className="button quiet">{uploadScenario.tertiaryReviewAction}</button></div> : <div className={`decision-result ${decisions[currentFinding.id]}`}><strong>{decisions[currentFinding.id] === "approved" ? uploadScenario.approvedDecision : "× Finding declined and retained for audit"}</strong><button onClick={() => setDecisions((value) => ({...value,[currentFinding.id]:"pending"}))}>Undo</button></div>}</div></>}
                {wizardStep === 4 && <><div className="review-header"><div><p className="eyebrow">STEP 4 OF 4</p><h3>{uploadScenario.confirmTitle}</h3><p>{uploadScenario.confirmCopy}</p></div></div><div className="scope-summary"><div><span>{uploadScenario.primarySummaryLabel}</span><strong>{environments.join(", ") || "None selected"}</strong></div><div><span>{uploadScenario.secondarySummaryLabel}</span><strong>{fileName || "No file attached"}</strong></div><div><span>Approved</span><strong>{approvedCount} findings</strong></div><div><span>Declined</span><strong>{Object.values(decisions).filter((value) => value === "declined").length} findings</strong></div></div><div className="scope-list">{activeReviewFindings.filter((finding) => decisions[finding.id] === "approved").map((finding) => <div key={finding.id}><span className="tech-avatar">{finding.initials}</span><span><strong>{finding.title}</strong><small>{finding.kind}</small></span><span className="badge success">{uploadScenario.readyLabel}</span></div>)}{!approvedCount && <p>Approve at least one finding in step 3 to populate this preview.</p>}</div>{scopeCreated && <div className="wizard-success" role="status"><StatusDot tone="success" /><span><strong>{uploadScenario.successTitle}</strong><small>{uploadScenario.successCopy(approvedCount)}</small></span></div>}</>}
                <div className="wizard-actions"><button className="button secondary" disabled={wizardStep === 1} onClick={() => { setScopeCreated(false); setWizardStep((step) => Math.max(1, step - 1)); }}>← Back</button><div className="mini-progress"><i style={{width:`${wizardStep * 25}%`}} /></div>{wizardStep < 4 ? <button className="button primary" disabled={(wizardStep === 1 && !environments.length) || (wizardStep === 2 && !fileName)} onClick={() => { setScopeCreated(false); setWizardStep((step) => Math.min(4, step + 1)); }}>Continue →</button> : <button className="button primary" disabled={!approvedCount || scopeCreated} onClick={() => setScopeCreated(true)}>{scopeCreated ? uploadScenario.completeDoneLabel : uploadScenario.completeIdleLabel}</button>}</div>
              </div>
            </div></div>
          </section>

          <section className="content-section pattern-section" id="dependencies">
            <SectionHeading eyebrow="07 · COMPASS PATTERN" title={dccMode ? "Standards and document relationships." : "Dependency explorer."} copy={dccMode ? "Explore how standards, uploaded documents, AI assurance runs and named human decisions relate to each other." : "Explore a rich system landscape with working search, filters, focus, pan, zoom, editing, import, and export controls."} />
            <ComponentActions componentKey="dependency" onDetails={openTechDetails} onDownload={downloadComponentCode} fullscreenTarget="pattern-dependency" star={{ active:starredPatternIds.includes("dependencies"),onToggle:() => toggleStar("dependencies"),label:`${starredPatternIds.includes("dependencies") ? "Remove" : "Add"} relationship explorer ${starredPatternIds.includes("dependencies") ? "from" : "to"} ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}` }} />
            <DependencyExplorerFrame scenarioId={dccMode ? "dcc-hackathon" : "base"} />
          </section>

          <CompassPatternSections scenarioId={scenarioId} starredPatternIds={starredPatternIds} onToggleStar={toggleStar} />
        </>}

        {system === "tracker" && <>
          <section className="content-section pattern-section" id="critical-path">
            <SectionHeading eyebrow="06 · TRACKER PATTERN" title={trackerPatternFixture.criticalSectionTitle} copy={trackerPatternFixture.criticalSectionCopy} />
            <ComponentActions componentKey="critical" onDetails={openTechDetails} onDownload={downloadComponentCode} fullscreenTarget="pattern-critical-path" star={{ active:starredPatternIds.includes("critical-path"),onToggle:() => toggleStar("critical-path"),label:`${starredPatternIds.includes("critical-path") ? "Remove" : "Add"} critical-path planner ${starredPatternIds.includes("critical-path") ? "from" : "to"} ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}` }} />
            <div className="critical-demo pattern-fullscreen-target" id="pattern-critical-path"><FullscreenExit label="critical-path planner" /><div className="critical-toolbar"><div><p className="eyebrow">{trackerPatternFixture.criticalEyebrow}</p><h3>{trackerPatternFixture.criticalTitle}</h3></div><div className="critical-view-controls"><div className="segmented" role="group" aria-label="Critical path presentation"><button className={criticalPresentation === "canvas" ? "active" : ""} onClick={() => setCriticalPresentation("canvas")}>Plan canvas</button><button className={criticalPresentation === "list" ? "active" : ""} onClick={() => setCriticalPresentation("list")}>Readiness list</button></div><div className="segmented" role="group" aria-label="Record aggregation"><button className={taskView === "tasks" ? "active" : ""} onClick={() => { setTaskView("tasks"); setSelectedTaskId(trackerPatternFixture.initialTaskId); }}>Tasks</button><button className={taskView === "phases" ? "active" : ""} onClick={() => { setTaskView("phases"); setSelectedTaskId("phase-Discover"); }}>Phases</button></div></div></div>
              <div className="critical-filters"><label>Stream<select value={taskFilters.stream} onChange={(event) => setTaskFilters((value) => ({...value,stream:event.target.value}))}><option value="">All streams</option>{[...new Set(criticalTasks.map((task) => task.stream))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Status<select value={taskFilters.status} onChange={(event) => setTaskFilters((value) => ({...value,status:event.target.value}))}><option value="">All statuses</option>{[...new Set(criticalTasks.map((task) => task.status))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Owner<select value={taskFilters.owner} onChange={(event) => setTaskFilters((value) => ({...value,owner:event.target.value}))}><option value="">All owners</option>{[...new Set(criticalTasks.map((task) => task.owner))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Search<input type="search" value={taskFilters.query} onChange={(event) => setTaskFilters((value) => ({...value,query:event.target.value}))} placeholder="Code, title, tag…" /></label><label className="critical-check"><input type="checkbox" checked={taskFilters.criticalOnly} onChange={(event) => setTaskFilters((value) => ({...value,criticalOnly:event.target.checked}))} /> Critical only</label><button className="button secondary" onClick={() => setTaskFilters({stream:"",status:"",owner:"",query:"",criticalOnly:false})}>Reset</button></div>
              {criticalPresentation === "canvas" ? <div className="critical-layout">
                <div className="critical-canvas-shell">
                  <div className="critical-canvas-toolbar"><span aria-live="polite">{selectedDependency ? "Dependency selected" : dependencyMessage}</span><button className="add-dependency" disabled={taskView !== "tasks"} onClick={() => { setDependencyEditorOpen((value) => !value); setDependencyMessage(taskView === "tasks" ? "Choose a predecessor and dependent task" : "Switch to Tasks to edit dependencies"); }}>+ Add dependency</button><button className="remove-dependency" disabled={!selectedDependency} onClick={removeCriticalDependency}>Remove dependency</button>{(removedDependencies.length > 0 || addedDependencies.length > 0) && <button className="restore-dependencies" onClick={resetCriticalDependencies}>Reset dependencies</button>}<div className="canvas-tools"><button aria-label="Zoom out" onClick={() => setCriticalZoom((value) => Math.max(.75,value-.1))}>−</button><span>{Math.round(criticalZoom*100)}%</span><button aria-label="Zoom in" onClick={() => setCriticalZoom((value) => Math.min(1.25,value+.1))}>+</button><button onClick={() => setCriticalZoom(.84)}>Fit</button><button onClick={() => setCriticalZoom(1)}>100%</button><i /><button onClick={() => setCriticalWindow((value) => Math.min(1,value+1))}>← Earlier</button><button onClick={() => setCriticalWindow((value) => Math.max(-1,value-1))}>Later →</button></div></div>
                  {dependencyEditorOpen && taskView === "tasks" && <div className="dependency-editor" role="group" aria-label="Add task dependency"><label><span>Predecessor</span><select value={dependencyDraft.sourceId} onChange={(event) => setDependencyDraft((current) => ({...current,sourceId:event.target.value}))}>{criticalTasks.map((task) => <option value={task.id} key={task.id}>{task.code} · {task.title}</option>)}</select></label><span className="dependency-arrow">→</span><label><span>Dependent task</span><select value={dependencyDraft.targetId} onChange={(event) => setDependencyDraft((current) => ({...current,targetId:event.target.value}))}>{criticalTasks.map((task) => <option value={task.id} key={task.id}>{task.code} · {task.title}</option>)}</select></label><button onClick={addCriticalDependency}>Add link</button><button className="cancel" onClick={() => setDependencyEditorOpen(false)}>Cancel</button></div>}
                  <div className="critical-canvas-viewport"><div className="critical-canvas" style={{width:criticalCanvasWidth,transform:`translateX(${criticalWindow * 90}px) scale(${criticalZoom})`}} onClick={() => setSelectedDependency("")}>
                    {criticalLanes.map((lane,index) => <div className="critical-lane" style={{top:`${index * 190}px`}} key={lane.id}><div><strong>{lane.label}</strong><span>{displayedTasks.filter((task) => task?.phase === lane.id).length} {taskView}</span></div></div>)}
                    <svg className="critical-edges" style={{width:criticalCanvasWidth}} viewBox={`0 0 ${criticalCanvasWidth} 800`} preserveAspectRatio="none" aria-label="Task dependencies">{displayedDependencies.map((dependency) => { const source = diagramPositions[dependency.sourceId]; const target = diagramPositions[dependency.targetId]; if (!source || !target) return null; const x1 = source.x + 220; const y1 = source.y + 58; const x2 = target.x; const y2 = target.y + 58; const middle = Math.max(x1 + 28,Math.round((x1+x2)/2)); const path = `M ${x1} ${y1} H ${middle} V ${y2} H ${x2}`; const selectDependency = (event:React.MouseEvent<SVGElement>) => { event.stopPropagation(); setSelectedDependency(dependency.id); setDependencyMessage(`${criticalTasks.find((task) => task.id === dependency.sourceId)?.code || dependency.sourceId} → ${criticalTasks.find((task) => task.id === dependency.targetId)?.code || dependency.targetId}`); }; return <g className={selectedDependency === dependency.id ? "selected" : ""} key={dependency.id}><title>{`${dependency.sourceId} to ${dependency.targetId}`}</title><path className="critical-edge-hit" d={path} onClick={selectDependency} /><path className="critical-edge-line" d={path} /><circle className="critical-edge-handle" cx={middle} cy={(y1+y2)/2} r="6" onClick={selectDependency} /></g>; })}</svg>
                    {displayedTasks.length ? displayedTasks.map((task) => { if (!task) return null; const position = diagramPositions[task.id]; if (!position) return null; const linkCount = activeViewDependencies.filter((dependency) => dependency.targetId === task.id).length; const statusClass = task.status.toLowerCase().replaceAll(" ","-"); return <button className={`critical-node ${statusClass} ${selectedTask?.id === task.id ? "selected" : ""}`} style={{left:position.x,top:position.y}} onClick={(event) => { event.stopPropagation(); setSelectedTaskId(task.id); }} key={task.id}><i className="node-port input" /><div className="critical-node-top"><code>{task.code}</code><span className="node-status">{task.status === "Complete" ? "✓ " : ""}{task.status}</span>{task.critical && <b>Critical</b>}</div><h4>{task.title}</h4><p>{task.owner}</p><div className="critical-node-meta"><span><b>{task.progress}%</b> complete</span><span>{linkCount} link{linkCount === 1 ? "" : "s"}</span></div><div className="node-progress"><i style={{width:`${task.progress}%`}} /></div><i className="node-port output" /></button>; }) : <p className="critical-empty">No work matches these filters.</p>}
                  </div></div>
                </div>
                <aside className="task-detail" aria-live="polite">{selectedTask ? <><div className="task-detail-heading"><div><p className="eyebrow">SELECTED {taskView === "tasks" ? "TASK" : "PHASE"}</p><h3>{selectedTask.title}</h3></div><div className="task-detail-top"><span className={`badge ${toneForStatus(selectedTask.status)}`}>{selectedTask.status}</span>{selectedTask.critical && <span className="badge danger">Critical</span>}<code>{selectedTask.code}</code></div></div><p>{selectedTask.description}</p><dl><div><dt>Owner</dt><dd>{selectedTask.owner}</dd></div><div><dt>Stream</dt><dd>{selectedTask.stream}</dd></div><div><dt>Progress</dt><dd>{selectedTask.progress}%</dd></div><div><dt>Dependencies</dt><dd>{selectedTask.dependencies.length ? selectedTask.dependencies.map((id) => criticalTasks.find((task) => task.id === id)?.code || id.replace("phase-","")).join(", ") : "None"}</dd></div></dl><div className="tag-list">{selectedTask.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></> : <p>Select a visible task.</p>}</aside>
              </div> : <div className="critical-list-layout"><div className="task-list">{displayedTasks.length ? displayedTasks.map((task,index) => task && <button className={`task-row ${task.status.toLowerCase().replaceAll(" ","-")} ${selectedTask?.id === task.id ? "selected" : ""}`} key={task.id} onClick={() => setSelectedTaskId(task.id)}><div className="task-sequence"><span>{String(index+1).padStart(2,"0")}</span>{index < displayedTasks.length - 1 && <i />}</div><div className="task-main"><div className="task-top"><code>{task.code}</code>{task.critical && <span className="critical-tag">◆ CRITICAL</span>}<span className="task-status"><StatusDot tone={toneForStatus(task.status)} />{task.status}</span></div><h4>{task.title}</h4><p>{task.owner}</p></div><div className="task-progress"><span><b>{task.progress}%</b> complete</span><div><i style={{width:`${task.progress}%`}} /></div></div><span className="row-arrow">→</span></button>) : <p className="empty-state">No work matches these filters.</p>}</div><aside className="task-detail" aria-live="polite">{selectedTask ? <><div className="task-detail-top"><span className={`badge ${toneForStatus(selectedTask.status)}`}>{selectedTask.status}</span>{selectedTask.critical && <span className="badge danger">Critical</span>}<code>{selectedTask.code}</code></div><h3>{selectedTask.title}</h3><p>{selectedTask.description}</p><dl><div><dt>Owner</dt><dd>{selectedTask.owner}</dd></div><div><dt>Stream</dt><dd>{selectedTask.stream}</dd></div><div><dt>Progress</dt><dd>{selectedTask.progress}%</dd></div><div><dt>Dependencies</dt><dd>{selectedTask.dependencies.length ? selectedTask.dependencies.map((id) => criticalTasks.find((item) => item.id === id)?.code || id.replace("phase-","")).join(", ") : "None"}</dd></div></dl><div className="tag-list">{selectedTask.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></> : <p>Select a visible task.</p>}</aside></div>}
              <details className="validation-panel"><summary>Model validation <span className="badge success">4 checks passed</span></summary><div><p><StatusDot tone="success" /> Every node ID is unique.</p><p><StatusDot tone="success" /> Every dependency points to an existing node.</p><p><StatusDot tone="success" /> No dependency cycles were detected.</p><p><StatusDot tone="success" /> No completed node has an incomplete predecessor.</p></div></details>
            </div>
          </section>

          <section className="content-section pattern-section" id="process-flow">
            <SectionHeading eyebrow="07 · TRACKER PATTERN" title={trackerPatternFixture.flowSectionTitle} copy={trackerPatternFixture.flowSectionCopy} />
            <ComponentActions componentKey="flow" onDetails={openTechDetails} onDownload={downloadComponentCode} fullscreenTarget="pattern-process-flow" star={{ active:starredPatternIds.includes("process-flow"),onToggle:() => toggleStar("process-flow"),label:`${starredPatternIds.includes("process-flow") ? "Remove" : "Add"} process flow ${starredPatternIds.includes("process-flow") ? "from" : "to"} ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}` }} />
            <div className="flow-demo pattern-fullscreen-target" id="pattern-process-flow"><FullscreenExit label="process flow" /><div className="flow-top"><div><span className="badge info">{routes[route].label}</span><h3>{trackerPatternFixture.flowTitle}</h3><p>{routes[route].description}</p></div><div className="route-switch" role="group" aria-label="Process route">{(Object.keys(routes) as TrackerRouteKey[]).map((key) => <button className={`button ${route === key ? "primary" : "secondary"}`} aria-pressed={route === key} onClick={() => { setRoute(key); const first = routes[key].stages[0]; setSelectedFlowId(first); }} key={key}>{routes[key].label}</button>)}</div></div><div className="flow-lanes">{trackerPatternFixture.flowLanes.map((label) => <span key={label}>{label}</span>)}</div><div className="flow-track">{routeStages.map((stage,index) => { const status = flowStatuses[stage.id]; return <button className={`flow-stage ${status} ${selectedFlowId === stage.id ? "selected" : ""}`} data-flow-id={stage.id} onClick={() => setSelectedFlowId(stage.id)} onKeyDown={(event) => moveFlowSelection(event,index)} aria-current={selectedFlowId === stage.id ? "step" : undefined} key={stage.id}><div className="stage-node"><span>{status === "complete" ? "✓" : stage.id}</span>{index < routeStages.length - 1 && <i />}</div><small>STAGE {stage.id}</small><h4>{stage.title}</h4><p>{stage.owner}</p><b>{status.replaceAll("-"," ").toUpperCase()}</b></button>})}</div><div className="flow-detail"><div><span className="stage-detail-number">{selectedFlow.id}</span><div><p className="eyebrow">SELECTED STAGE</p><h4>{selectedFlow.title}</h4><p>{selectedFlow.owner}</p></div></div><dl><div><dt>Entry</dt><dd>{selectedFlow.entry}</dd></div><div><dt>Action</dt><dd>{selectedFlow.action}</dd></div><div><dt>Exit / gate</dt><dd>{selectedFlow.exit}</dd></div></dl><div className="stage-status-control"><label>Status<select value={flowStatuses[selectedFlow.id]} onChange={(event) => setFlowStatuses((value) => ({...value,[selectedFlow.id]:event.target.value}))}><option value="complete">Complete</option><option value="in-progress">In progress</option><option value="required">Required</option><option value="blocked">Blocked</option><option value="conditional">Conditional</option><option value="not-started">Not started</option><option value="skipped">Skipped</option></select></label></div></div></div>
          </section>

          {pocTrackerExamples.map((example) => {
            const demo = sitePath(trackerDemoUrl(example.folder,scenarioId));
            const componentKey = `tracker-screen-${example.id}` as ComponentKey;
            return <section className="content-section pattern-section tracker-continuous-section" id={example.id} key={example.id}>
              <SectionHeading eyebrow={`${example.number} · TRACKER PATTERN`} title={example.title} copy={example.description} />
              <ComponentActions componentKey={componentKey} onDetails={openTechDetails} onDownload={downloadComponentCode} fullscreenTarget={`pattern-${example.id}`} star={{ active:starredPatternIds.includes(example.id),onToggle:() => toggleStar(example.id),label:`${starredPatternIds.includes(example.id) ? "Remove" : "Add"} ${example.title} ${starredPatternIds.includes(example.id) ? "from" : "to"} ${dccMode ? "DCC Hackathon recommendations" : "starred patterns"}` }} />
              <div className="poc-inline-embed pattern-fullscreen-target" id={`pattern-${example.id}`}><FullscreenExit label={example.title} /><iframe src={demo} title={`${example.title} PoC Tracker pattern`} loading="lazy" scrolling="no" allowFullScreen onLoad={(event) => preparePoCEmbed(event.currentTarget,dark,liveThemeStyle)} /></div>
            </section>;
          })}
        </>}
        </>}

        {librarySearchOpen && <div className="library-command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLibrarySearchOpen(false); }}><section className="library-command" role="dialog" aria-modal="true" aria-label="Find a component"><header><span aria-hidden="true">⌕</span><input autoFocus value={libraryQuery} onChange={(event) => { setLibraryQuery(event.target.value); setCommandIndex(0); }} onKeyDown={handleLibrarySearchKey} placeholder="Search components, patterns, and behaviour…" /><kbd>ESC</kbd></header><div className="library-command-results"><p>{genericMode ? "INDIVIDUAL COMPONENTS" : system === "compass" ? "MIGRATION COMPASS" : "POC TRACKER"} · {matchingLibraryItems.length} RESULTS</p>{matchingLibraryItems.map((item,index) => <button className={commandIndex === index ? "selected" : ""} onMouseEnter={() => setCommandIndex(index)} onClick={() => openLibraryItem(item.id)} key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{item.name}</strong><small>{item.description}</small></div><em>{item.type}</em><b>↗</b></button>)}{!matchingLibraryItems.length && <div className="library-command-empty"><strong>No component found</strong><span>Try “toast”, “table”, “chart”, or “wizard”.</span></div>}</div><footer><span>↑↓ Browse</span><span>↵ Open component</span>{genericMode ? <Link href="/?system=compass">Return to Compass →</Link> : <Link href={system === "compass" ? dccMode ? "/?system=tracker&scenario=dcc-hackathon" : "/?system=tracker" : dccMode ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"}>Switch to {system === "compass" ? "Tracker" : "Compass"} →</Link>}</footer></section></div>}

        {techPanel && activeComponent && activeStructure && <div className="tech-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTechPanel(null); }}><section className="tech-modal tech-workbench-modal" role="dialog" aria-modal="true" aria-labelledby="tech-modal-title"><header><div><p className="eyebrow">COMPONENT WORKBENCH</p><h2 id="tech-modal-title">{activeComponent.name}</h2><p>{activeComponent.summary}</p><div className="tech-header-badges"><span>Interactive</span><span>{activeComponent.fileName.endsWith(".html") ? "Standalone HTML" : "React + TypeScript"}</span><span>Example data</span></div></div><button autoFocus onClick={() => setTechPanel(null)} aria-label="Close component workbench">×</button></header><div className="tech-modal-tabs" role="tablist" aria-label="Component workbench view">{([{ id:"overview", number:"01", title:"Overview", copy:"Implementation notes" },{ id:"component", number:"02", title:"Component", copy:"Rendered source" },{ id:"data", number:"03", title:"Example data", copy:"Representative payload" },{ id:"api", number:"04", title:"API / Props", copy:"Contract structure" }] as const).map((tab) => <button role="tab" aria-selected={techTab === tab.id} className={techTab === tab.id ? "active" : ""} onClick={() => { setTechTab(tab.id); setCopiedView(""); }} key={tab.id}><span>{tab.number}</span><div><strong>{tab.title}</strong><small>{tab.copy}</small></div></button>)}</div>{techTab === "overview" ? <div className="tech-detail-grid"><article><span>01</span><h3>Implementation</h3><ul>{activeComponent.stack.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>02</span><h3>Behaviour</h3><ul>{activeComponent.behaviour.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>03</span><h3>Accessibility</h3><ul>{activeComponent.accessibility.map((item) => <li key={item}>{item}</li>)}</ul></article></div> : <div className="tech-workbench"><aside aria-label="Component files"><p>COMPONENT FILES</p><button className={techTab === "component" ? "active" : ""} onClick={() => setTechTab("component")}><span>TS</span><div><strong>{activeComponent.fileName}</strong><small>UI implementation</small></div></button><button className={techTab === "data" ? "active" : ""} onClick={() => setTechTab("data")}><span>&#123;&#125;</span><div><strong>{activeStructure.dataFile}</strong><small>Example state</small></div></button><button className={techTab === "api" ? "active" : ""} onClick={() => setTechTab("api")}><span>↔</span><div><strong>{activeStructure.apiFile}</strong><small>External contract</small></div></button><div><small>STATUS</small><span><i /> Ready to reuse</span></div></aside><div className="tech-code-panel"><header><div className="code-window-dots" aria-hidden="true"><i /><i /><i /></div><span>{activeComponent.name} <b>/</b> {workbenchFile}</span><div><button onClick={() => copyWorkbenchContent(techPanel)}>{copiedView === `${techPanel}:${techTab}` ? "✓ Copied" : "Copy"}</button><button className="code-download" onClick={() => downloadWorkbenchContent(techPanel)}>↓ Download</button></div></header><pre><code>{workbenchContent.split("\n").map((line,index) => <span className="code-line" key={`${index}-${line}`}><i>{String(index+1).padStart(2,"0")}</i><b>{line || " "}</b></span>)}</code></pre><footer><span>{techTab === "component" ? "UI implementation" : techTab === "data" ? "Example data" : "Illustrative integration contract"}</span><b>{workbenchContent.split("\n").length} lines</b></footer></div></div>}<footer><span><StatusDot tone="success" /> Component, data, and contract are available together</span><button className="button secondary" onClick={() => setTechPanel(null)}>Done</button></footer></section></div>}

        <footer><PortfolioBrand className="brand" section="Clever stuff. Done properly." /><p>Responsive, interactive patterns designed for real delivery work.</p><a href="#top">Back to top ↑</a></footer>
      </main>
    </div>
  );
}
