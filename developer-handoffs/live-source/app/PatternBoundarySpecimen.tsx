"use client";

import { useState, type ReactNode } from "react";
import styles from "./patternBoundarySpecimen.module.css";

export type PatternBoundaryPreviewKind =
  | "action"
  | "activity"
  | "card"
  | "chart"
  | "content"
  | "conversation"
  | "diagram"
  | "file"
  | "form"
  | "group"
  | "list"
  | "navigation"
  | "node"
  | "report"
  | "status"
  | "table";

export type PatternBoundaryPreview = {
  kind: PatternBoundaryPreviewKind;
  variant: string;
};

export type PatternBoundarySpecimenProps = {
  name: string;
  category?: string;
  patternCount?: number;
  active?: boolean;
  onToggle?: (active: boolean) => void;
};

const previewIcons: Record<PatternBoundaryPreviewKind, string> = {
  action: "↗",
  activity: "•••",
  card: "▣",
  chart: "↗",
  content: "≡",
  conversation: "◌",
  diagram: "⌁",
  file: "⇅",
  form: "✎",
  group: "▤",
  list: "☷",
  navigation: "⇥",
  node: "◇",
  report: "□",
  status: "✓",
  table: "▦",
};

function compactName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readableName(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves a component boundary to a semantic specimen. The ordering is
 * intentional: specific conversational and relationship patterns must win
 * before broad suffixes such as List, Row, Status, or Card are considered.
 */
export function resolvePatternBoundaryPreview(name: string, category = ""): PatternBoundaryPreview {
  const value = compactName(name);

  // Components called out directly in the component-library review.
  if (value === "phasegroup") return { kind: "group", variant: "phase" };
  if (value === "dependencylist") return { kind: "list", variant: "relationships" };
  if (value === "promptlist") return { kind: "list", variant: "prompts" };
  if (value === "chatthread") return { kind: "conversation", variant: "thread" };
  if (value === "chatmessage") return { kind: "conversation", variant: "message" };
  if (value === "thinkingindicator") return { kind: "activity", variant: "thinking" };

  if (/chatcomposer|feedbackcomposer/.test(value)) return { kind: "conversation", variant: "composer" };
  if (/chatmessage|feedbackitem|reportfeedback/.test(value)) return { kind: "conversation", variant: "message" };
  if (/chatthread|feedbackthread/.test(value)) return { kind: "conversation", variant: "thread" };
  if (/thinking|loading|spinner|activityindicator/.test(value)) return { kind: "activity", variant: "thinking" };

  if (/phasegroup/.test(value)) return { kind: "group", variant: "phase" };
  if (/fieldgroup|evidencegroup|metadatacategory|sectiongroup/.test(value)) return { kind: "group", variant: "section" };

  if (/promptlist/.test(value)) return { kind: "list", variant: "prompts" };
  if (/dependencylist|relationshiprow|caveatlist/.test(value)) return { kind: "list", variant: "relationships" };
  if (/checklist/.test(value)) return { kind: "list", variant: "checklist" };
  if (/history|timeline/.test(value)) return { kind: "list", variant: "timeline" };
  if (/queue|tasklist|evidencelist|reviewlist|navigator/.test(value)) return { kind: "list", variant: "work" };

  if (/chartlegend|diagramlegend/.test(value)) return { kind: "content", variant: "legend" };
  if (/waterfall/.test(value)) return { kind: "chart", variant: "waterfall" };
  if (/piechart|distributionchart/.test(value)) return { kind: "chart", variant: "distribution" };
  if (/gauge/.test(value)) return { kind: "chart", variant: "gauge" };
  if (/linechart|trend/.test(value)) return { kind: "chart", variant: "line" };
  if (/barchart|contribution/.test(value)) return { kind: "chart", variant: "bar" };
  if (/chart|kpi|metric|measure|score|statistics|savings|complexity/.test(value)) return { kind: "chart", variant: "summary" };

  if (/connector|dependencyline|flowedge|lineageedge|promotionedge|^edge$/.test(value)) return { kind: "node", variant: "connection" };
  if (/lane|column$/.test(value) && !/tablecolumn|columnheader|evidencecolumn|environmentcolumn/.test(value)) return { kind: "node", variant: "lane" };
  if (/node|endpointblock/.test(value)) return { kind: "node", variant: "node" };
  if (/branch/.test(value)) return { kind: "diagram", variant: "branch" };
  if (/lineage/.test(value)) return { kind: "diagram", variant: "lineage" };
  if (/structure|hierarchy|topology/.test(value)) return { kind: "diagram", variant: "structure" };
  if (/flow|migration/.test(value)) return { kind: "diagram", variant: "flow" };
  if (/gantt|planninggrid|schedule/.test(value)) return { kind: "diagram", variant: "schedule" };
  if (/coverage(map)?|diagram|graph|canvas|explorer/.test(value)) return { kind: "diagram", variant: "canvas" };

  if (/dropzone|upload|file/.test(value)) return { kind: "file", variant: "upload" };
  if (/download|export|import/.test(value)) return { kind: "file", variant: "transfer" };
  if (/sourcetrace|sourcelink|evidencelink|artifacthub|sourcetasklink/.test(value)) return { kind: "file", variant: "source" };

  if (/matrix/.test(value)) return { kind: "table", variant: "matrix" };
  if (/editable|roweditor/.test(value)) return { kind: "table", variant: "editable" };
  if (/table|grid|row|cell|column|mapper/.test(value)) return { kind: "table", variant: "records" };

  if (/report|document|clientreport/.test(value)) return { kind: "report", variant: "document" };
  if (/editor|preview|page|story/.test(value)) return { kind: "report", variant: "editor" };
  if (/review|approval|finalise|resolution|followup|handoff/.test(value)) return { kind: "report", variant: "workflow" };

  if (/filter/.test(value)) return { kind: "form", variant: "filter" };
  if (/select|selector/.test(value)) return { kind: "form", variant: "select" };
  if (/factor|numeric|calculator|configurator|assessment/.test(value)) return { kind: "form", variant: "range" };
  if (/form|field|input|control|settings|definition|setup/.test(value)) return { kind: "form", variant: "fields" };

  if (/wizard|stepper|step$|workflowstage/.test(value)) return { kind: "navigation", variant: "steps" };
  if (/tabs|toggle|segmented|viewtoggle/.test(value)) return { kind: "navigation", variant: "tabs" };
  if (/toolbar|controls|reorder|pagination|navigation/.test(value)) return { kind: "navigation", variant: "toolbar" };

  if (/progress/.test(value)) return { kind: "status", variant: "progress" };
  if (/notice|banner|confirmation|missingdata/.test(value)) return { kind: "status", variant: "notice" };
  if (/status|badge|validation|health|gap/.test(value)) return { kind: "status", variant: "pills" };

  if (/action|button|resolve|save/.test(value)) return { kind: "action", variant: "buttons" };
  if (/dashboard/.test(value)) return { kind: "card", variant: "dashboard" };
  if (/card|panel|summary|block|shell|hub/.test(value)) return { kind: "card", variant: "summary" };
  if (/disclosure|details|keyvalue|tag|empty/.test(value)) return { kind: "content", variant: "details" };

  const fallbackCategory = category.toLowerCase();
  if (fallbackCategory.includes("visual")) return { kind: "diagram", variant: "canvas" };
  if (fallbackCategory.includes("data")) return { kind: "table", variant: "records" };
  if (fallbackCategory.includes("form")) return { kind: "form", variant: "fields" };
  if (fallbackCategory.includes("file")) return { kind: "file", variant: "source" };
  if (fallbackCategory.includes("status") || fallbackCategory.includes("feedback")) return { kind: "status", variant: "pills" };
  if (fallbackCategory.includes("navigation") || fallbackCategory.includes("guided")) return { kind: "navigation", variant: "steps" };
  if (fallbackCategory.includes("action")) return { kind: "action", variant: "buttons" };
  if (fallbackCategory.includes("surface")) return { kind: "card", variant: "summary" };
  return { kind: "content", variant: "details" };
}

function GroupPreview({ variant, expanded, onToggle }: { variant: string; expanded: boolean; onToggle: () => void }) {
  return <div className={styles.groupPreview} data-variant={variant}>
    <button type="button" aria-expanded={expanded} onClick={onToggle}>
      <span>{variant === "phase" ? "DELIVERY PHASE" : "EVIDENCE GROUP"}</span>
      <strong>{variant === "phase" ? "Build and integrate" : "Architecture evidence"}</strong>
      <b>{expanded ? "−" : "+"}</b>
    </button>
    {expanded && <div className={styles.groupRows}>
      <span><i /> Prepare data <b>3 / 4</b></span>
      <span><i /> Validate interfaces <b>In review</b></span>
    </div>}
  </div>;
}

function ListPreview({ variant, selected, onSelect }: { variant: string; selected: number; onSelect: (index: number) => void }) {
  if (variant === "prompts") {
    return <div className={styles.promptList} aria-label="Example prompts">
      {["Summarise delivery risk", "Show missing evidence", "Draft the next action"].map((label, index) => <button type="button" aria-pressed={selected === index} onClick={() => onSelect(index)} key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}<b>↗</b></button>)}
    </div>;
  }
  if (variant === "relationships") {
    return <div className={styles.relationshipList} aria-label="Example relationships">
      {[["Scope", "Prepare data"], ["API contract", "Demo journey"], ["Assurance", "Release"]].map(([from, to], index) => <button type="button" aria-pressed={selected === index} onClick={() => onSelect(index)} key={from}><span>{from}</span><b>→</b><span>{to}</span><i>{index === 2 ? "Risk" : "Ready"}</i></button>)}
    </div>;
  }
  if (variant === "checklist") {
    return <div className={styles.checkList}>{["Access granted", "Connection tested", "Evidence attached"].map((label, index) => <label key={label}><input type="checkbox" defaultChecked={index < 2} /> <span>{label}</span></label>)}</div>;
  }
  return <div className={styles.workList}>{["Review system record", "Confirm accountable owner", "Link source evidence"].map((label, index) => <button type="button" aria-pressed={selected === index} onClick={() => onSelect(index)} key={label}><span>{index + 1}</span><strong>{label}</strong><i>{variant === "timeline" ? `${index + 1}d` : index === 0 ? "Now" : "Next"}</i></button>)}</div>;
}

function ConversationPreview({ variant, active, onToggle }: { variant: string; active: boolean; onToggle: () => void }) {
  if (variant === "composer") {
    return <div className={styles.composerPreview}><span>Ask about the current evidence…</span><button type="button" onClick={onToggle} aria-label="Send example message">➤</button></div>;
  }
  if (variant === "message") {
    return <article className={styles.messagePreview} data-active={active}>
      <span>AI</span><div><small>ASSISTANT · SOURCE LINKED</small><p>{active ? "The proposed change has been added to the review queue." : "Three dependencies need an owner before approval."}</p><footer><button type="button" onClick={onToggle}>{active ? "✓ Added" : "Add to review"}</button><a href="#full-component-index">2 sources ↗</a></footer></div>
    </article>;
  }
  return <div className={styles.threadPreview}>
    <article><span>YOU</span><p>What is blocking release?</p></article>
    <article><span>AI</span><p>{active ? "The assurance task is now resolved." : "One assurance task is blocked."}</p></article>
    <button type="button" onClick={onToggle}>{active ? "Show original" : "Resolve example"}</button>
  </div>;
}

function ActivityPreview({ active }: { active: boolean }) {
  return <div className={styles.activityPreview} role="status" aria-live="polite">
    <span className={styles.orbit} aria-hidden="true"><i /><i /><i /></span>
    <div><strong>{active ? "Response ready" : "Checking 12 sources"}</strong><small>{active ? "Evidence linked · just now" : "Comparing records and relationships…"}</small></div>
  </div>;
}

function ChartPreview({ variant, active }: { variant: string; active: boolean }) {
  if (variant === "gauge" || variant === "distribution") {
    return <div className={styles.radialChart} data-variant={variant} role="img" aria-label="Coverage is 78 percent"><i><b>78%</b><span>coverage</span></i><div><span><i /> Complete</span><span><i /> Review</span><span><i /> Gap</span></div></div>;
  }
  if (variant === "line") {
    return <div className={styles.lineChart} role="img" aria-label="A six-period upward trend"><div className={styles.linePlot} aria-hidden="true"><i /><i /><i /><i /><i /><i /><span /><span /><span /><span /><span /><b /><b /><b /><b /><b /></div><footer><span>Jan</span><span>Mar</span><span>Jun</span></footer></div>;
  }
  const values = variant === "waterfall" ? [58, 28, 39, 22, 74] : active ? [32, 68, 48, 82, 57] : [48, 34, 72, 51, 64];
  return <div className={styles.barChart} data-variant={variant} role="img" aria-label={`${readableName(variant)} chart with five values`}>{values.map((value, index) => <i style={{ height: `${value}%` }} key={`${value}-${index}`}><span>{value}</span></i>)}</div>;
}

function DiagramPreview({ variant, selected, onSelect }: { variant: string; selected: number; onSelect: (index: number) => void }) {
  const labels = variant === "branch" ? ["Main", "Transform", "Validate", "Publish"] : variant === "lineage" ? ["Source", "Clean", "Model", "Report"] : ["Current", "Shared", "Target", "Live"];
  return <div className={styles.diagramPreview} data-variant={variant}>
    <div className={styles.diagramTrack} aria-hidden="true"><i /><i /><i /><b /><b /></div>
    {labels.map((label, index) => <button type="button" aria-pressed={selected === index} onClick={() => onSelect(index)} style={{ left: `${8 + index * 27}%`, top: `${index % 2 ? 54 : 18}%` }} key={label}><i />{label}</button>)}
  </div>;
}

function NodePreview({ variant, active, onToggle }: { variant: string; active: boolean; onToggle: () => void }) {
  if (variant === "connection") return <button type="button" className={styles.connectionPreview} aria-pressed={active} onClick={onToggle}><span>Source</span><i><b /></i><span>Target</span><strong>{active ? "Selected" : "HTTPS"}</strong></button>;
  if (variant === "lane") return <div className={styles.lanePreview}><strong>DELIVERY</strong><span>Prepare data</span><span>Validate service</span><span>Assure</span></div>;
  return <button type="button" className={styles.nodePreview} aria-pressed={active} onClick={onToggle}><i /><span><small>API-04 · IN REVIEW</small><strong>Validate service contracts</strong><b>Platform team · 58%</b></span><em /></button>;
}

function TablePreview({ variant, fieldValue, onFieldChange }: { variant: string; fieldValue: string; onFieldChange: (value: string) => void }) {
  if (variant === "matrix") {
    return <div className={styles.matrixPreview} role="table" aria-label="Evidence matrix"><span /><b>Dev</b><b>Test</b><b>Prod</b>{["Access", "Runbook", "Owner"].flatMap((label, row) => [<strong key={`${label}-label`}>{label}</strong>, ...[0, 1, 2].map((column) => <i data-tone={row + column === 3 ? "risk" : "good"} key={`${label}-${column}`}>{row + column === 3 ? "!" : "✓"}</i>)])}</div>;
  }
  return <div className={styles.tablePreview}><table><thead><tr><th>Record</th><th>Owner</th><th>Status</th></tr></thead><tbody><tr><td>API Gateway</td><td>{variant === "editable" ? <input value={fieldValue} onChange={(event) => onFieldChange(event.target.value)} aria-label="Example owner" /> : "Platform"}</td><td><span>Ready</span></td></tr><tr><td>Data Lake</td><td>Data</td><td><span>Review</span></td></tr></tbody></table></div>;
}

function FormPreview({ variant, fieldValue, onFieldChange }: { variant: string; fieldValue: string; onFieldChange: (value: string) => void }) {
  if (variant === "range") return <label className={styles.rangePreview}><span><strong>Complexity factor</strong><b>68</b></span><input type="range" min="0" max="100" defaultValue="68" /><small>Moderate delivery complexity</small></label>;
  if (variant === "filter") return <div className={styles.filterPreview}><label><span>⌕</span><input value={fieldValue} onChange={(event) => onFieldChange(event.target.value)} placeholder="Search records…" /></label><button type="button">Status · All</button></div>;
  return <div className={styles.formPreview}><label><span>{variant === "select" ? "Target environment" : "Accountable owner"}</span>{variant === "select" ? <select defaultValue="Production"><option>Production</option><option>Test</option></select> : <input value={fieldValue} onChange={(event) => onFieldChange(event.target.value)} />}</label><small>Required · validated</small></div>;
}

function NavigationPreview({ variant, selected, onSelect }: { variant: string; selected: number; onSelect: (index: number) => void }) {
  const labels = variant === "steps" ? ["Source", "Map", "Review", "Done"] : variant === "tabs" ? ["Overview", "Evidence", "History"] : ["Filter", "Arrange", "Export"];
  return <div className={styles.navigationPreview} data-variant={variant} role="group" aria-label="Example navigation">{labels.map((label, index) => <button type="button" aria-pressed={selected === index} onClick={() => onSelect(index)} key={label}><span>{variant === "steps" ? index + 1 : index === 0 ? "●" : "○"}</span>{label}</button>)}</div>;
}

function StatusPreview({ variant, active }: { variant: string; active: boolean }) {
  if (variant === "progress") return <div className={styles.progressPreview}><span><strong>Collection coverage</strong><b>{active ? "86%" : "68%"}</b></span><progress max="100" value={active ? 86 : 68}>{active ? 86 : 68}%</progress><small>{active ? "Target reached" : "4 records still need evidence"}</small></div>;
  if (variant === "notice") return <div className={styles.noticePreview} data-active={active}><i>{active ? "✓" : "i"}</i><span><strong>{active ? "Confirmation recorded" : "Review required"}</strong><small>{active ? "The next actor has been notified." : "Two records need an owner."}</small></span></div>;
  return <div className={styles.statusPreview}><span>✓ Complete</span><span>◐ In review</span><span>! Blocked</span></div>;
}

function FilePreview({ variant, active, onToggle }: { variant: string; active: boolean; onToggle: () => void }) {
  if (variant === "source") return <button type="button" className={styles.sourcePreview} aria-pressed={active} onClick={onToggle}><span>PDF</span><div><strong>architecture-baseline.pdf</strong><small>Page 7 · source verified</small></div><b>{active ? "Opened ✓" : "Open ↗"}</b></button>;
  return <button type="button" className={styles.filePreview} aria-pressed={active} onClick={onToggle}><span>{active ? "✓" : variant === "transfer" ? "⇅" : "⇧"}</span><div><strong>{active ? "inventory.csv is ready" : variant === "transfer" ? "Import or export data" : "Drop a file or browse"}</strong><small>CSV, XLSX or JSON · 10 MB maximum</small></div></button>;
}

function ReportPreview({ variant, active, onToggle }: { variant: string; active: boolean; onToggle: () => void }) {
  return <div className={styles.reportPreview} data-variant={variant}>
    <article><header><span>DISCOVERY REPORT</span><b>{active ? "Approved" : variant === "editor" ? "Editing" : "Review"}</b></header><strong>Executive summary</strong><p /><p /><p /><footer><i /> 4 linked sources</footer></article>
    <button type="button" onClick={onToggle}>{active ? "Return to review" : variant === "editor" ? "Save draft" : "Approve"}</button>
  </div>;
}

function CardPreview({ variant, active }: { variant: string; active: boolean }) {
  if (variant === "dashboard") return <div className={styles.dashboardPreview}>{[["Systems", "24"], ["Coverage", active ? "92%" : "86%"], ["Risks", active ? "2" : "4"]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong><i /></article>)}</div>;
  return <article className={styles.cardPreview}><small>SELECTED RECORD</small><strong>Production environment</strong><p>Owner · Platform Engineering</p><div><span>Evidence 12</span><span>Confidence High</span></div></article>;
}

function ActionPreview({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return <div className={styles.actionPreview}><button type="button" onClick={onToggle}>{active ? "✓ Saved" : "Save changes"}</button><button type="button">View details</button><button type="button" aria-label="More actions">•••</button></div>;
}

function ContentPreview({ variant, active }: { variant: string; active: boolean }) {
  if (variant === "legend") return <div className={styles.legendPreview}><span><i /> Current</span><span><i /> Target</span><span><i /> External</span><span><b /> Critical path</span></div>;
  return <dl className={styles.contentPreview}><div><dt>Owner</dt><dd>Platform Engineering</dd></div><div><dt>Status</dt><dd>{active ? "Complete" : "In review"}</dd></div><div><dt>Evidence</dt><dd>12 sources</dd></div></dl>;
}

export function PatternBoundarySpecimen({ name, category, patternCount = 1, active, onToggle }: PatternBoundarySpecimenProps) {
  const preview = resolvePatternBoundaryPreview(name, category);
  const [internalActive, setInternalActive] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState(0);
  const [fieldValue, setFieldValue] = useState("Platform team");
  const resolvedActive = active ?? internalActive;

  function toggle() {
    const next = !resolvedActive;
    if (active === undefined) setInternalActive(next);
    onToggle?.(next);
  }

  let body: ReactNode;
  switch (preview.kind) {
    case "group": body = <GroupPreview variant={preview.variant} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />; break;
    case "list": body = <ListPreview variant={preview.variant} selected={selected} onSelect={setSelected} />; break;
    case "conversation": body = <ConversationPreview variant={preview.variant} active={resolvedActive} onToggle={toggle} />; break;
    case "activity": body = <ActivityPreview active={resolvedActive} />; break;
    case "chart": body = <ChartPreview variant={preview.variant} active={resolvedActive} />; break;
    case "diagram": body = <DiagramPreview variant={preview.variant} selected={selected} onSelect={setSelected} />; break;
    case "node": body = <NodePreview variant={preview.variant} active={resolvedActive} onToggle={toggle} />; break;
    case "table": body = <TablePreview variant={preview.variant} fieldValue={fieldValue} onFieldChange={setFieldValue} />; break;
    case "form": body = <FormPreview variant={preview.variant} fieldValue={fieldValue} onFieldChange={setFieldValue} />; break;
    case "navigation": body = <NavigationPreview variant={preview.variant} selected={selected} onSelect={setSelected} />; break;
    case "status": body = <StatusPreview variant={preview.variant} active={resolvedActive} />; break;
    case "file": body = <FilePreview variant={preview.variant} active={resolvedActive} onToggle={toggle} />; break;
    case "report": body = <ReportPreview variant={preview.variant} active={resolvedActive} onToggle={toggle} />; break;
    case "card": body = <CardPreview variant={preview.variant} active={resolvedActive} />; break;
    case "action": body = <ActionPreview active={resolvedActive} onToggle={toggle} />; break;
    default: body = <ContentPreview variant={preview.variant} active={resolvedActive} />;
  }

  return <section
    className={styles.specimen}
    data-preview-kind={preview.kind}
    data-preview-variant={preview.variant}
    data-active={resolvedActive}
    aria-label={`${readableName(name)} component specimen`}
  >
    <header className={styles.specimenHeader}>
      <span aria-hidden="true">{previewIcons[preview.kind]}</span>
      <div><small>{readableName(preview.variant)} specimen</small><strong>{readableName(name)}</strong></div>
    </header>
    <div className={styles.specimenBody}>{body}</div>
    <footer className={styles.specimenFooter}>
      <span>Used in {patternCount} pattern{patternCount === 1 ? "" : "s"}</span>
      <button type="button" aria-pressed={resolvedActive} onClick={toggle}>{resolvedActive ? "✓ Active state" : "Explore state"}</button>
    </footer>
  </section>;
}

export default PatternBoundarySpecimen;
