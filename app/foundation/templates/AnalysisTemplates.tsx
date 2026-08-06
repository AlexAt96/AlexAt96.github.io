"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  AccessibleModal,
  ActionButton,
  Badge,
  EmptyState,
  InlineNotice,
  Metric,
  Panel,
  ProgressBar,
  Segmented,
  downloadJson,
} from "./shared";
import type { TemplateProps } from "./types";
import styles from "./AnalysisTemplates.module.css";

type Notice = { tone: "info" | "success" | "warning" | "danger"; copy: string };
type AnalysisScenarioId = NonNullable<TemplateProps["scenarioId"]>;

const defaultNotice: Notice = {
  tone: "info",
  copy: "This template uses local starter data. Changes remain inside the preview.",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* -------------------------------------------------------------------------- */
/* ADF pipeline                                                               */
/* -------------------------------------------------------------------------- */

type PipelineView = "graph" | "complexity";
type ActivityKind = "Source" | "Copy" | "Lookup" | "Data flow" | "Databricks notebook" | "Condition" | "Sink";

interface PipelineActivity {
  id: string;
  name: string;
  kind: ActivityKind;
  level: number;
  dependencies: string[];
  source?: string;
  target?: string;
  notebook?: string;
  condition?: string;
  endpointEvidence: boolean;
  description: string;
}

interface PipelineDefinition {
  id: string;
  name: string;
  purpose: string;
  environment: string;
  owner: string;
  activities: PipelineActivity[];
}

const PIPELINES: PipelineDefinition[] = [
  {
    id: "customer-insight",
    name: "Customer insight daily",
    purpose: "Prepare a governed daily customer insight dataset for reporting and activation.",
    environment: "Production",
    owner: "Data products team",
    activities: [
      { id: "receive", name: "Receive source extract", kind: "Source", level: 0, dependencies: [], source: "Operational API", target: "Raw landing", endpointEvidence: true, description: "Receives the incremental source extract and records the source watermark." },
      { id: "consent", name: "Lookup consent rules", kind: "Lookup", level: 1, dependencies: ["receive"], source: "Policy catalogue", target: "Rule set", endpointEvidence: true, description: "Loads the current policy rules used by the transformation path." },
      { id: "cleanse", name: "Cleanse customer records", kind: "Data flow", level: 1, dependencies: ["receive"], source: "Raw landing", target: "Validated staging", endpointEvidence: true, description: "Standardises identifiers and diverts invalid records to a quarantine output." },
      { id: "enrich", name: "Enrich customer profile", kind: "Databricks notebook", level: 2, dependencies: ["consent", "cleanse"], source: "Validated staging", target: "Curated customer", notebook: "/Shared/customer_enrichment", endpointEvidence: true, description: "Joins the cleansed records to consent rules and calculates reusable profile features." },
      { id: "quality", name: "Route by quality score", kind: "Condition", level: 3, dependencies: ["enrich"], source: "Curated customer", condition: "quality_score >= threshold", endpointEvidence: true, description: "Branches the flow so high-confidence and exception records are published separately." },
      { id: "publish", name: "Publish insight mart", kind: "Sink", level: 4, dependencies: ["quality"], source: "Approved branch", target: "Insight mart", endpointEvidence: true, description: "Publishes the approved records to the governed reporting product." },
      { id: "quarantine", name: "Write exception queue", kind: "Sink", level: 4, dependencies: ["quality"], source: "Exception branch", target: "Quality queue", endpointEvidence: true, description: "Writes records below the quality threshold to the remediation queue." },
    ],
  },
  {
    id: "finance-close",
    name: "Finance close orchestration",
    purpose: "Consolidate source ledgers and prepare a period-close reporting dataset.",
    environment: "Controlled production",
    owner: "Finance data team",
    activities: [
      { id: "ledger", name: "Extract source ledgers", kind: "Copy", level: 0, dependencies: [], source: "Ledger service", target: "Close landing", endpointEvidence: true, description: "Copies the approved period extracts into the controlled landing area." },
      { id: "rates", name: "Lookup exchange rates", kind: "Lookup", level: 0, dependencies: [], source: "Reference API", target: "Rate snapshot", endpointEvidence: true, description: "Pins the exchange-rate snapshot used by the close run." },
      { id: "reconcile", name: "Reconcile balances", kind: "Databricks notebook", level: 1, dependencies: ["ledger", "rates"], source: "Close landing", target: "Reconciled ledger", notebook: "/Shared/close_reconciliation", endpointEvidence: true, description: "Performs currency conversion, balance checks and reconciliation controls." },
      { id: "approval", name: "Check approval gate", kind: "Condition", level: 2, dependencies: ["reconcile"], source: "Reconciliation result", condition: "control_failures = 0", endpointEvidence: true, description: "Stops publication when mandatory reconciliation controls fail." },
      { id: "close-mart", name: "Publish close mart", kind: "Sink", level: 3, dependencies: ["approval"], source: "Approved ledger", target: "Finance close mart", endpointEvidence: true, description: "Publishes the approved period-close data product." },
    ],
  },
  {
    id: "service-telemetry",
    name: "Service telemetry hourly",
    purpose: "Standardise service telemetry and make operational measures available to analysts.",
    environment: "Non-production",
    owner: "Platform analytics",
    activities: [
      { id: "events", name: "Read event stream", kind: "Source", level: 0, dependencies: [], source: "Event stream", target: "Telemetry landing", endpointEvidence: false, description: "Reads the hourly event window. The endpoint contract still needs evidence." },
      { id: "normalise", name: "Normalise event schema", kind: "Databricks notebook", level: 1, dependencies: ["events"], source: "Telemetry landing", target: "Normalised events", notebook: "/Shared/normalise_events", endpointEvidence: true, description: "Applies the shared event schema and enriches service ownership." },
      { id: "telemetry-mart", name: "Write telemetry mart", kind: "Sink", level: 2, dependencies: ["normalise"], source: "Normalised events", target: "Operations mart", endpointEvidence: true, description: "Writes the hourly operations product for dashboard consumers." },
    ],
  },
];

const DCC_PIPELINES: PipelineDefinition[] = [
  {
    id: "standards-library",
    name: "Standards ingestion and mapping",
    purpose: "Load governed standards, extract requirements and publish a reusable assurance library.",
    environment: "Standards library",
    owner: "DCC assurance team",
    activities: [
      { id: "load-standards", name: "Load selected standards", kind: "Source", level: 0, dependencies: [], source: "ISO, WCAG, GDS and NIST sources", target: "Standards landing", endpointEvidence: true, description: "Loads the selected governed standards and records their edition, custodian and source reference." },
      { id: "extract-requirements", name: "Extract requirements", kind: "Data flow", level: 1, dependencies: ["load-standards"], source: "Standards landing", target: "Requirement register", endpointEvidence: true, description: "Separates clauses and success criteria into independently traceable assurance requirements." },
      { id: "map-profile", name: "Map DCC profile", kind: "Lookup", level: 1, dependencies: ["load-standards"], source: "DCC HACK-01", target: "Requirement mappings", endpointEvidence: true, description: "Maps the hackathon profile to related external requirements without replacing their provenance." },
      { id: "validate-mapping", name: "Validate requirement links", kind: "Databricks notebook", level: 2, dependencies: ["extract-requirements", "map-profile"], source: "Requirement register", target: "Validated mappings", notebook: "/Assurance/validate_standard_mapping", endpointEvidence: true, description: "Checks identifiers, duplicates, relationship targets and retained source references." },
      { id: "mapping-gate", name: "Route incomplete mappings", kind: "Condition", level: 3, dependencies: ["validate-mapping"], source: "Validated mappings", condition: "source_link_coverage = 100%", endpointEvidence: true, description: "Routes incomplete mappings back to the standard custodian before publication." },
      { id: "publish-library", name: "Publish standards library", kind: "Sink", level: 4, dependencies: ["mapping-gate"], source: "Approved mappings", target: "Assurance standards library", endpointEvidence: true, description: "Publishes the requirement library used by document assurance runs." },
    ],
  },
  {
    id: "document-scan",
    name: "Document assurance scan",
    purpose: "Compare uploaded documentation with selected standards and retain source-linked AI findings.",
    environment: "Assurance run DCC-018",
    owner: "Assurance service",
    activities: [
      { id: "receive-documents", name: "Receive uploaded documents", kind: "Source", level: 0, dependencies: [], source: "Document library", target: "Scan workspace", endpointEvidence: true, description: "Loads the solution design, threat model and accessibility statement with version metadata." },
      { id: "select-requirements", name: "Lookup selected requirements", kind: "Lookup", level: 0, dependencies: [], source: "Standards library", target: "Assessment scope", endpointEvidence: true, description: "Pins the requirements selected for this assurance run." },
      { id: "extract-evidence", name: "Extract evidence passages", kind: "Data flow", level: 1, dependencies: ["receive-documents"], source: "Scan workspace", target: "Evidence excerpts", endpointEvidence: true, description: "Extracts passages with page, heading and document-version provenance." },
      { id: "assess-requirements", name: "Assess requirements with AI", kind: "Databricks notebook", level: 2, dependencies: ["extract-evidence", "select-requirements"], source: "Evidence excerpts", target: "Provisional findings", notebook: "/Assurance/document_requirement_scan", endpointEvidence: true, description: "Produces requirement-level findings while keeping the model output separate from human decisions." },
      { id: "evidence-gate", name: "Check evidence linkage", kind: "Condition", level: 3, dependencies: ["assess-requirements"], source: "Provisional findings", condition: "source_excerpt_present = true", endpointEvidence: true, description: "Prevents findings without a source excerpt from entering the review queue." },
      { id: "review-queue", name: "Publish human review queue", kind: "Sink", level: 4, dependencies: ["evidence-gate"], source: "Source-linked findings", target: "Assurance review", endpointEvidence: true, description: "Publishes findings for approve, decline or request-evidence decisions." },
      { id: "gap-queue", name: "Publish evidence gap queue", kind: "Sink", level: 4, dependencies: ["evidence-gate"], source: "Unlinked or incomplete findings", target: "Evidence tasks", endpointEvidence: false, description: "Creates remediation tasks for gaps that still need an owner or replacement evidence." },
    ],
  },
  {
    id: "assurance-decision",
    name: "Human decision and report",
    purpose: "Turn reviewed findings into an accountable, evidence-linked documentation assurance result.",
    environment: "Decision register",
    owner: "Assurance lead",
    activities: [
      { id: "load-findings", name: "Load reviewed findings", kind: "Source", level: 0, dependencies: [], source: "Assurance review", target: "Decision workspace", endpointEvidence: true, description: "Loads approved, declined and unresolved findings with reviewer identity and audit history." },
      { id: "load-evidence", name: "Lookup evidence tasks", kind: "Lookup", level: 0, dependencies: [], source: "Evidence task list", target: "Decision workspace", endpointEvidence: true, description: "Loads the current evidence-gap disposition for the same document versions." },
      { id: "compose-result", name: "Compose assurance result", kind: "Data flow", level: 1, dependencies: ["load-findings", "load-evidence"], source: "Decision workspace", target: "Draft assurance report", endpointEvidence: true, description: "Composes standards coverage, source evidence, open gaps and human decisions into one report." },
      { id: "approval-gate", name: "Check named approval", kind: "Condition", level: 2, dependencies: ["compose-result"], source: "Draft assurance report", condition: "named_approver_present = true", endpointEvidence: true, description: "Blocks publication until a named assurance lead records the final decision." },
      { id: "publish-result", name: "Publish assurance report", kind: "Sink", level: 3, dependencies: ["approval-gate"], source: "Approved report", target: "Assurance record DCC-018", endpointEvidence: true, description: "Publishes the evidence snapshot and retains the decision separately from AI recommendations." },
    ],
  },
];

type PipelineCopy = {
  initialNotice: Notice;
  emptyTitle: string;
  emptyCopy: string;
  heroEyebrow: string;
  scopeTitle: string;
  scopeEyebrow: string;
  includeLabel: string;
  includeCopy: string;
  viewLabel: string;
  graphTitle: string;
  exportFile: string;
  readOnlyNotice: string;
  savedNoun: string;
};

const PIPELINE_FIXTURES: Record<AnalysisScenarioId, { pipelines: PipelineDefinition[]; copy: PipelineCopy }> = {
  base: {
    pipelines: PIPELINES,
    copy: { initialNotice: defaultNotice, emptyTitle: "No pipeline definitions yet", emptyCopy: "Connect an orchestration inventory or supply pipeline definitions to populate the selector, dependency graph and complexity charts.", heroEyebrow: "Pipeline explorer", scopeTitle: "Pipeline scope", scopeEyebrow: "Selector and local adapter", includeLabel: "Include in assessment scope", includeCopy: "Scope choices are retained while switching pipelines.", viewLabel: "Pipeline explorer view", graphTitle: "Pipeline branch graph", exportFile: "pipeline-template.json", readOnlyNotice: "Read-only view: pipeline navigation remains available; scope editing is locked.", savedNoun: "Pipeline scope saved locally" },
  },
  "dcc-hackathon": {
    pipelines: DCC_PIPELINES,
    copy: { initialNotice: { tone: "info", copy: "DCC standards and document-assurance pipelines loaded. Changes remain inside this preview." }, emptyTitle: "No assurance pipelines yet", emptyCopy: "Connect standards and uploaded-document definitions to populate the assurance scan graph and complexity charts.", heroEyebrow: "Documentation assurance pipeline", scopeTitle: "Assurance pipeline scope", scopeEyebrow: "Standards-to-decision selection", includeLabel: "Include in assurance scope", includeCopy: "Scope choices are retained while switching assurance pipelines.", viewLabel: "Assurance pipeline view", graphTitle: "Assurance branch graph", exportFile: "dcc-assurance-pipeline.json", readOnlyNotice: "Read-only view: assurance pipeline navigation remains available; scope editing is locked.", savedNoun: "Assurance pipeline scope saved locally" },
  },
};

const PIPELINE_WEIGHTS: Record<ActivityKind, number> = {
  Source: 1,
  Copy: 1,
  Lookup: 1,
  "Data flow": 3,
  "Databricks notebook": 4,
  Condition: 2,
  Sink: 1,
};

function dependencyCounts(pipeline: PipelineDefinition, activity: PipelineActivity) {
  const incoming = activity.dependencies.length;
  const outgoing = pipeline.activities.filter((candidate) => candidate.dependencies.includes(activity.id)).length;
  return { incoming, outgoing };
}

function pipelineComplexity(pipeline: PipelineDefinition) {
  return pipeline.activities.reduce((total, activity) => total + PIPELINE_WEIGHTS[activity.kind], 0);
}

function pipelineAction(activity: PipelineActivity) {
  if (activity.kind === "Condition") return "Evaluate branch";
  if (activity.kind === "Databricks notebook") return "Run compute";
  if (activity.kind === "Data flow") return "Transform";
  if (activity.kind === "Lookup") return "Lookup";
  if (activity.kind === "Sink") return "Write";
  if (activity.kind === "Source") return "Read";
  return "Copy";
}

const PIPELINE_LANE_COLOURS = ["#0ea5e9", "#24b987", "#e31937", "#7551a6", "#e6a11c"];

interface ConnectorPoint {
  x: number;
  y: number;
  lane: number;
}

interface ConnectorGeometry {
  width: number;
  height: number;
  points: Record<string, ConnectorPoint>;
}

function pipelineConnectorPath(source: ConnectorPoint, target: ConnectorPoint) {
  const distance = Math.max(1, target.y - source.y);
  if (Math.abs(source.x - target.x) < 1) return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  const turnY = source.y + Math.min(Math.max(distance * .54, 14), distance - 8);
  const radius = Math.min(12, Math.abs(source.x - target.x) / 2, Math.max(4, distance / 4));
  const direction = target.x > source.x ? 1 : -1;
  return `M ${source.x} ${source.y} L ${source.x} ${turnY - radius} Q ${source.x} ${turnY} ${source.x + direction * radius} ${turnY} L ${target.x - direction * radius} ${turnY} Q ${target.x} ${turnY} ${target.x} ${turnY + radius} L ${target.x} ${target.y}`;
}

function PipelineConnector({ pipeline, graphRef, selectedActivityId }: { pipeline: PipelineDefinition; graphRef: React.RefObject<HTMLDivElement | null>; selectedActivityId: string }) {
  const [geometry, setGeometry] = useState<ConnectorGeometry>({ width: 0, height: 0, points: {} });

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const graphRect = graph.getBoundingClientRect();
        const points: Record<string, ConnectorPoint> = {};
        graph.querySelectorAll<HTMLElement>("[data-pipeline-node]").forEach((node) => {
          const id = node.dataset.pipelineNode;
          if (!id) return;
          const rect = node.getBoundingClientRect();
          points[id] = {
            x: rect.left - graphRect.left + rect.width / 2,
            y: rect.top - graphRect.top + rect.height / 2,
            lane: Number(node.dataset.lane ?? 0),
          };
        });
        setGeometry({ width: graph.scrollWidth, height: graph.scrollHeight, points });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(graph);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [graphRef, pipeline, selectedActivityId]);

  if (!geometry.width || !geometry.height) return null;
  const outgoingCounts = Object.fromEntries(pipeline.activities.map((activity) => [activity.id, pipeline.activities.filter((candidate) => candidate.dependencies.includes(activity.id)).length]));
  const edges = pipeline.activities.flatMap((activity) => (activity.dependencies.length ? activity.dependencies : ["__start__"]).map((dependencyId) => ({ dependencyId, activity })));

  return <svg className={styles.pipelineConnector} width={geometry.width} height={geometry.height} viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
    {edges.map(({ dependencyId, activity }) => {
      const source = geometry.points[dependencyId];
      const target = geometry.points[activity.id];
      if (!source || !target) return null;
      const sourceActivity = pipeline.activities.find((candidate) => candidate.id === dependencyId);
      const colourLane = activity.dependencies.length > 1 ? source.lane : (sourceActivity && outgoingCounts[sourceActivity.id] > 1 ? target.lane : target.lane);
      const active = selectedActivityId === activity.id || selectedActivityId === dependencyId;
      return <path key={`${dependencyId}->${activity.id}`} d={pipelineConnectorPath(source, target)} stroke={PIPELINE_LANE_COLOURS[colourLane] ?? PIPELINE_LANE_COLOURS.at(-1)} data-active={active} />;
    })}
  </svg>;
}

function PipelineNode({ id, lane }: { id: string; lane: number }) {
  return <span className={styles.gitNodeAnchor} data-pipeline-node={id} data-lane={lane} style={{ "--git-lane": lane, "--lane-colour": PIPELINE_LANE_COLOURS[lane] ?? PIPELINE_LANE_COLOURS.at(-1) } as React.CSSProperties}><i /></span>;
}

export function AdfPipelineTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = PIPELINE_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const pipelines = fixture.pipelines;
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelines[0].id);
  const [selectedActivityId, setSelectedActivityId] = useState(pipelines[0].activities[0].id);
  const [view, setView] = useState<PipelineView>("graph");
  const [scope, setScope] = useState<Record<string, boolean>>(() => Object.fromEntries(pipelines.map((pipeline) => [pipeline.id, true])));
  const [savedScope, setSavedScope] = useState<Record<string, boolean>>(() => Object.fromEntries(pipelines.map((pipeline) => [pipeline.id, true])));
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // resetToken is the explicit workbench reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPipelineId(pipelines[0].id);
    setSelectedActivityId(pipelines[0].activities[0].id);
    setView("graph");
    setScope(Object.fromEntries(pipelines.map((pipeline) => [pipeline.id, true])));
    setSavedScope(Object.fromEntries(pipelines.map((pipeline) => [pipeline.id, true])));
    setNotice(copy.initialNotice);
  }, [copy, pipelines, resetToken]);

  if (mode === "empty") {
    return <EmptyState title={copy.emptyTitle} copy={copy.emptyCopy} />;
  }

  const pipeline = pipelines.find((candidate) => candidate.id === selectedPipelineId) ?? pipelines[0];
  const selectedActivity = pipeline.activities.find((candidate) => candidate.id === selectedActivityId) ?? pipeline.activities[0];
  const levels = Array.from(new Set(pipeline.activities.map((activity) => activity.level))).sort((a, b) => a - b);
  const groups = levels.map((level) => pipeline.activities.filter((activity) => activity.level === level));
  const activityMix = Object.entries(pipeline.activities.reduce<Record<string, number>>((summary, activity) => {
    summary[activity.kind] = (summary[activity.kind] ?? 0) + 1;
    return summary;
  }, {}));
  const maxMix = Math.max(...activityMix.map(([, count]) => count), 1);
  const totalComplexity = pipelineComplexity(pipeline);
  const contributions = activityMix.map(([kind, count]) => ({ kind, count, score: count * PIPELINE_WEIGHTS[kind as ActivityKind] }));
  const selectedCounts = dependencyCounts(pipeline, selectedActivity);
  const scopeDirty = pipelines.some((candidate) => scope[candidate.id] !== savedScope[candidate.id]);

  const selectPipeline = (pipelineId: string) => {
    const next = pipelines.find((candidate) => candidate.id === pipelineId) ?? pipelines[0];
    setSelectedPipelineId(next.id);
    setSelectedActivityId(next.activities[0].id);
    setNotice({ tone: "info", copy: `${next.name} loaded without changing the current ${view === "graph" ? "branch graph" : "complexity"} view.` });
  };

  const saveScope = () => {
    setSavedScope({ ...scope });
    const included = pipelines.filter((candidate) => scope[candidate.id]).length;
    setNotice({ tone: "success", copy: `${copy.savedNoun}: ${included} of ${pipelines.length} pipelines included.` });
  };

  return <div className={styles.analysisStack}>
    <section className={styles.pipelineHero}>
      <div>
        <p className={styles.eyebrow}>{copy.heroEyebrow}</p>
        <h3>{pipeline.name}</h3>
        <p>{pipeline.purpose}</p>
        <div className={styles.tagRow}><Badge>{pipeline.environment}</Badge><span>{pipeline.owner}</span><span>{pipeline.activities.length} steps</span></div>
      </div>
      <div className={styles.pipelineMetrics}>
        <Metric label="Weighted complexity" value={totalComplexity} detail="activity weights" tone={totalComplexity > 16 ? "risk" : "watch"} />
        <Metric label="Dependencies" value={pipeline.activities.reduce((total, activity) => total + activity.dependencies.length, 0)} detail="ordered links" />
        <Metric label="Evidence gaps" value={pipeline.activities.filter((activity) => !activity.endpointEvidence).length} detail="endpoint contracts" tone={pipeline.activities.some((activity) => !activity.endpointEvidence) ? "risk" : "good"} />
      </div>
    </section>

    <Panel title={copy.scopeTitle} eyebrow={copy.scopeEyebrow} action={<div className={styles.inlineActions}><ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportFile, { pipeline, included: scope[pipeline.id] })}>Export</ActionButton><ActionButton type="button" variant="primary" disabled={readOnly || !scopeDirty} onClick={saveScope}>{scopeDirty ? "Save scope" : "Scope saved"}</ActionButton></div>}>
      <div className={styles.pipelineControls}>
        <label><span>Pipeline definition</span><select aria-label="Pipeline definition" value={pipeline.id} onChange={(event) => selectPipeline(event.target.value)}>{pipelines.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.name}</option>)}</select></label>
        <label className={styles.scopeToggle}><input type="checkbox" checked={scope[pipeline.id]} disabled={readOnly} onChange={(event) => setScope((current) => ({ ...current, [pipeline.id]: event.target.checked }))} /><span><strong>{copy.includeLabel}</strong><small>{copy.includeCopy}</small></span></label>
        <Segmented value={view} label={copy.viewLabel} disabled={false} options={[{ value: "graph", label: "Branch graph" }, { value: "complexity", label: "Complexity graphs" }]} onChange={setView} />
      </div>
      <div className={styles.noticeInset}><InlineNotice tone={notice.tone}>{readOnly ? copy.readOnlyNotice : notice.copy}</InlineNotice></div>
    </Panel>

    {view === "graph" && <Panel title={copy.graphTitle} eyebrow={`${levels.length} dependency levels · Git-lane orientation`} action={<Badge>{groups.some((group) => group.length > 1) ? "Branching" : "Linear"}</Badge>}>
      <div className={styles.gitGraphScroller}>
        <div className={styles.gitGraph} ref={graphRef}>
          <PipelineConnector pipeline={pipeline} graphRef={graphRef} selectedActivityId={selectedActivity.id} />
          <div className={styles.gitGraphHead}><span>Graph</span><span>Activity</span><span>Action</span><span>I/O</span><span>Depends</span><span>Runtime</span></div>
          <div className={styles.gitStartRow}>
            <span className={styles.gitStartLane}><PipelineNode id="__start__" lane={0} /><b>Start</b></span>
            <span><strong>Manual or scheduled trigger</strong><small>Entry point for {pipeline.name}</small></span><Badge tone="neutral">Trigger</Badge><span>{pipeline.activities.length} activities</span><span>Entry point</span><span>Orchestrator</span>
          </div>
          <ol className={styles.gitLevels}>
            {groups.map((group, levelIndex) => <li className={styles.gitLevel} key={levels[levelIndex]} data-parallel={group.length > 1}>
              <div className={styles.gitLevelLabel}><span>{levelIndex + 1}</span><strong>{group.length > 1 ? "Parallel" : "Step"}</strong></div>
              <div className={styles.gitLevelRows}>{group.map((activity, lane) => {
                const counts = dependencyCounts(pipeline, activity);
                const active = selectedActivity.id === activity.id;
                const dependencyNames = activity.dependencies.map((id) => pipeline.activities.find((candidate) => candidate.id === id)?.name ?? id);
                return <div className={styles.gitActivityShell} key={activity.id} data-active={active}>
                  <button className={styles.gitActivityRow} type="button" aria-expanded={active} onClick={() => { setSelectedActivityId(activity.id); setNotice({ tone: "info", copy: `${activity.name} selected · ${counts.incoming} inbound and ${counts.outgoing} outbound dependencies.` }); }}>
                    <span className={styles.gitLane}><PipelineNode id={activity.id} lane={lane} /><b>{pipeline.activities.indexOf(activity) + 1}</b></span>
                    <span className={styles.gitActivityName}><strong>{activity.name}</strong><small>{activity.kind}</small></span>
                    <span><Badge tone={counts.incoming > 1 ? "watch" : counts.outgoing > 1 ? "risk" : "neutral"}>{counts.incoming > 1 ? "Fan-in" : counts.outgoing > 1 ? "Branch" : pipelineAction(activity)}</Badge></span>
                    <span className={styles.gitIo}><b>{activity.source ? "1 read" : "0 reads"}</b><b>{activity.target ? "1 write" : "0 writes"}</b></span>
                    <span className={styles.gitDepends}>{dependencyNames.length ? dependencyNames.join(", ") : "Start / previous level"}</span>
                    <span className={styles.gitRuntime}>{activity.notebook ?? (activity.kind === "Data flow" ? "Managed transform" : "Control runtime")}</span>
                  </button>
                  {active && <div className={styles.gitActivityDetail}>
                    <div><Badge>{activity.kind}</Badge><h4>{activity.name}</h4><p>{activity.description}</p>{!activity.endpointEvidence && <InlineNotice tone="warning">Endpoint evidence is missing. Confirm the connection contract before approval.</InlineNotice>}</div>
                    <div className={styles.gitDetailStats}><span><small>Inbound</small><strong>{selectedCounts.incoming}</strong></span><span><small>Outbound</small><strong>{selectedCounts.outgoing}</strong></span><span><small>Weight</small><strong>{PIPELINE_WEIGHTS[activity.kind]}</strong></span></div>
                    <div className={styles.gitDetailMap}>
                      <article><small>Reads from</small><strong>{activity.source ?? (activity.dependencies.length ? "Upstream activities" : "Pipeline trigger")}</strong></article><i>→</i>
                      <article data-primary="true"><small>{activity.kind}</small><strong>{activity.name}</strong></article><i>→</i>
                      <article><small>Writes to</small><strong>{activity.target ?? (selectedCounts.outgoing ? "Downstream activities" : "Pipeline output")}</strong></article>
                    </div>
                  </div>}
                </div>;
              })}</div>
            </li>)}
          </ol>
        </div>
      </div>
    </Panel>}

    {view === "complexity" && <div className={styles.pipelineComplexityGraphs}>
      <Panel title="Activity mix" eyebrow="Count by activity type">
        <div className={styles.horizontalBars}>{activityMix.map(([kind, count]) => <div key={kind}><span>{kind}</span><i><b style={{ "--bar-size": `${(count / maxMix) * 100}%` } as React.CSSProperties} /></i><strong>{count}</strong></div>)}</div>
      </Panel>
      <Panel title="Weighted contribution" eyebrow="Complexity score by activity type">
        <div className={styles.complexityDonutLayout}>
          <div className={styles.complexityDonut} style={{ background: `conic-gradient(${contributions.map((item, index) => { const start = contributions.slice(0, index).reduce((sum, candidate) => sum + candidate.score, 0) / totalComplexity * 100; const end = start + item.score / totalComplexity * 100; return `${["#64357b", "#2875c7", "#20a076", "#e5a31b", "#e31937", "#7c6bcc"][index % 6]} ${start}% ${end}%`; }).join(",")})` }}><i><strong>{totalComplexity}</strong><small>points</small></i></div>
          <div className={styles.complexityLegend}>{contributions.map((item, index) => <span key={item.kind}><i style={{ background: ["#64357b", "#2875c7", "#20a076", "#e5a31b", "#e31937", "#7c6bcc"][index % 6] }} /><em>{item.kind}</em><strong>{item.score}</strong></span>)}</div>
        </div>
      </Panel>
      <Panel title="Portfolio comparison" eyebrow="Weighted pipeline complexity">
        <div className={styles.pipelineComparison}>{pipelines.map((candidate) => { const score = pipelineComplexity(candidate); return <button type="button" key={candidate.id} aria-pressed={candidate.id === pipeline.id} onClick={() => selectPipeline(candidate.id)}><span><strong>{candidate.name}</strong><small>{candidate.activities.length} activities</small></span><i><b style={{ width: `${Math.max(10, score / Math.max(...pipelines.map(pipelineComplexity)) * 100)}%` }} /></i><em>{score}</em></button>; })}</div>
      </Panel>
    </div>}
  </div>;
}

/* -------------------------------------------------------------------------- */
/* BU complexity                                                              */
/* -------------------------------------------------------------------------- */

interface BandDefinition { band: string; score: number; definition: string; min?: number; max?: number }
interface FactorDefinition { id: string; label: string; options: { label: string; value: string; score: number }[]; evidencePlaceholder: string }

const SIZE_BANDS: BandDefinition[] = [
  { band: "Extra small", score: 1, definition: "≤0.25 TB and ≤100 tables" },
  { band: "Small", score: 2, definition: ">0.25 TB or >100 tables" },
  { band: "Medium", score: 3, definition: ">0.5 TB or >500 tables" },
  { band: "Large", score: 4, definition: ">10 TB or >2,000 tables" },
  { band: "Extra large", score: 5, definition: ">15 TB or >2,500 tables" },
];

const COMPLEXITY_BANDS: BandDefinition[] = [
  { band: "Very low", score: 1, min: 0, max: 0, definition: "0 raw complexity points" },
  { band: "Low", score: 2, min: 1, max: 3, definition: "1–3 raw complexity points" },
  { band: "Medium", score: 3, min: 4, max: 7, definition: "4–7 raw complexity points" },
  { band: "High", score: 4, min: 8, max: 10, definition: "8–10 raw complexity points" },
  { band: "Very high", score: 5, min: 11, max: Number.POSITIVE_INFINITY, definition: "11+ raw complexity points" },
];

const FACTOR_DEFINITIONS: FactorDefinition[] = [
  { id: "governance", label: "Governance model", options: [{ label: "Standard controls", value: "standard", score: 0 }, { label: "Several control regimes", value: "complex", score: 1 }], evidencePlaceholder: "Describe the control regimes or approval boundaries." },
  { id: "criticality", label: "Data criticality", options: [{ label: "Standard availability", value: "standard", score: 0 }, { label: "High availability", value: "high", score: 2 }], evidencePlaceholder: "Describe critical reporting or operational dependencies." },
  { id: "tooling", label: "Unique tooling", options: [{ label: "Small toolset", value: "small", score: 1 }, { label: "Extensive toolset", value: "extensive", score: 2 }], evidencePlaceholder: "List specialist tools or non-standard integrations." },
  { id: "refactor", label: "Refactor effort", options: [{ label: "Configuration-led", value: "low", score: 0 }, { label: "Material refactor", value: "high", score: 2 }], evidencePlaceholder: "Describe components likely to require redesign." },
  { id: "sensitive", label: "Sensitive data", options: [{ label: "No enhanced controls", value: "no", score: 0 }, { label: "Enhanced controls required", value: "yes", score: 2 }], evidencePlaceholder: "Describe classifications without entering sensitive values." },
];

interface ComplexityAssessmentState {
  dataSizeTb: number;
  tableCount: number;
  workspaceCount: number;
  sourceSinkCount: number;
  factorValues: Record<string, string>;
  evidence: Record<string, string>;
}

const INITIAL_COMPLEXITY: ComplexityAssessmentState = {
  dataSizeTb: 2.8,
  tableCount: 640,
  workspaceCount: 8,
  sourceSinkCount: 14,
  factorValues: { governance: "complex", criticality: "high", tooling: "small", refactor: "low", sensitive: "yes" },
  evidence: {
    governance: "Two approval routes apply across the reporting portfolio.",
    criticality: "A daily operational dashboard depends on the curated product.",
    tooling: "Standard orchestration plus one specialist connector.",
    refactor: "Most jobs can use the shared migration pattern.",
    sensitive: "Restricted attributes require enhanced access controls.",
  },
};

const DCC_COMPLEXITY: ComplexityAssessmentState = {
  dataSizeTb: 0.18,
  tableCount: 252,
  workspaceCount: 4,
  sourceSinkCount: 143,
  factorValues: { governance: "complex", criticality: "high", tooling: "extensive", refactor: "high", sensitive: "yes" },
  evidence: {
    governance: "ISO/IEC 27001, WCAG 2.2 AA, NIST AI RMF and DCC HACK-01 overlap in the selected scope.",
    criticality: "The assurance decision is required before the customer portal documentation can be approved.",
    tooling: "The evidence pack contains DOCX, PDF, structured requirement data and AI-generated findings.",
    refactor: "Five gaps need replacement evidence, an owner or an explicit accepted limitation.",
    sensitive: "Threat-model content and security ownership evidence require controlled reviewer access.",
  },
};

const DCC_FACTOR_DEFINITIONS: FactorDefinition[] = [
  { id: "governance", label: "Standards overlap", options: [{ label: "Single assurance profile", value: "standard", score: 0 }, { label: "Several related standards", value: "complex", score: 1 }], evidencePlaceholder: "Describe the standards, profiles and mapping boundaries." },
  { id: "criticality", label: "Decision criticality", options: [{ label: "Advisory assessment", value: "standard", score: 0 }, { label: "Approval-gating decision", value: "high", score: 2 }], evidencePlaceholder: "Describe the approval or release decision this assurance supports." },
  { id: "tooling", label: "Document and evidence formats", options: [{ label: "Small native document set", value: "small", score: 1 }, { label: "Mixed documents and structured evidence", value: "extensive", score: 2 }], evidencePlaceholder: "List document formats, evidence sources and required adapters." },
  { id: "refactor", label: "Evidence remediation", options: [{ label: "Evidence already complete", value: "low", score: 0 }, { label: "Material evidence gaps", value: "high", score: 2 }], evidencePlaceholder: "Describe gaps that need new evidence, ownership or rewritten content." },
  { id: "sensitive", label: "Sensitive documentation", options: [{ label: "No enhanced controls", value: "no", score: 0 }, { label: "Controlled review required", value: "yes", score: 2 }], evidencePlaceholder: "Describe access constraints without entering sensitive values." },
];

type ComplexityCopy = {
  initialNotice: Notice;
  emptyTitle: string;
  emptyCopy: string;
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  sizeLabel: string;
  complexityLabel: string;
  effortLabel: string;
  footprintTitle: string;
  footprintEyebrow: string;
  dataSizeLabel: string;
  tableCountLabel: string;
  workspaceCountLabel: string;
  endpointCountLabel: string;
  endpointDetail: string;
  factorsTitle: string;
  factorsEyebrow: string;
  calculatedTitle: string;
  calculatedBand: string;
  calculatedCopy: string;
  sizeThresholdTitle: string;
  complexityThresholdTitle: string;
  readOnlyNotice: string;
  recalculatedNotice: string;
  savedPrefix: string;
};

const COMPLEXITY_FIXTURES: Record<AnalysisScenarioId, { initial: ComplexityAssessmentState; factors: FactorDefinition[]; calculatedScore: number; copy: ComplexityCopy }> = {
  base: {
    initial: INITIAL_COMPLEXITY,
    factors: FACTOR_DEFINITIONS,
    calculatedScore: 3,
    copy: { initialNotice: defaultNotice, emptyTitle: "Complexity assessment not started", emptyCopy: "Supply footprint measures and factor definitions to calculate governed size, complexity and effort bands.", heroEyebrow: "Generic sizing assessment", heroTitle: "Data product migration profile", heroCopy: "Adjust the footprint and governed factors. Bands and effort update immediately using transparent thresholds.", sizeLabel: "Size", complexityLabel: "Complexity", effortLabel: "Effort", footprintTitle: "Data footprint", footprintEyebrow: "1 / Editable measures", dataSizeLabel: "Total data size", tableCountLabel: "Table count", workspaceCountLabel: "In-scope workspaces", endpointCountLabel: "Source and sink endpoints", endpointDetail: "Calculated from dependency inventory", factorsTitle: "Migration factors", factorsEyebrow: "2 / Governed responses and evidence", calculatedTitle: "ADF contribution", calculatedBand: "Medium", calculatedCopy: "Derived from the weighted orchestration activity inventory. Update the pipeline template to change this input.", sizeThresholdTitle: "Size thresholds", complexityThresholdTitle: "Complexity thresholds", readOnlyNotice: "This assessment is locked for review. All scoring lineage remains visible.", recalculatedNotice: "Scores and effort have been recalculated. Save when the evidence is ready.", savedPrefix: "Assessment saved locally" },
  },
  "dcc-hackathon": {
    initial: DCC_COMPLEXITY,
    factors: DCC_FACTOR_DEFINITIONS,
    calculatedScore: 3,
    copy: { initialNotice: { tone: "info", copy: "DCC assurance complexity inputs loaded. Changes remain inside this preview." }, emptyTitle: "Assurance complexity not assessed", emptyCopy: "Select standards and documents to calculate evidence volume, assurance complexity and human-review effort.", heroEyebrow: "Documentation assurance sizing", heroTitle: "Customer portal assurance profile", heroCopy: "Adjust the document footprint and governed assurance factors. Complexity and review effort update from transparent thresholds.", sizeLabel: "Evidence set", complexityLabel: "Assurance complexity", effortLabel: "Review effort", footprintTitle: "Documentation footprint", footprintEyebrow: "1 / Standards, documents and evidence", dataSizeLabel: "Evidence corpus size", tableCountLabel: "Requirements in scope", workspaceCountLabel: "Selected standards", endpointCountLabel: "Source evidence links", endpointDetail: "Calculated from the document scan", factorsTitle: "Assurance factors", factorsEyebrow: "2 / Governed assessment and evidence", calculatedTitle: "Scan pipeline contribution", calculatedBand: "Medium", calculatedCopy: "Derived from the weighted standards-ingestion and document-scan pipelines. Update the pipeline assessment to change this input.", sizeThresholdTitle: "Evidence-set thresholds", complexityThresholdTitle: "Assurance complexity thresholds", readOnlyNotice: "This assurance assessment is locked for review. All scoring lineage remains visible.", recalculatedNotice: "Assurance complexity and review effort have been recalculated. Save when the evidence notes are ready.", savedPrefix: "Assurance assessment saved locally" },
  },
};

function getSizeBand(dataSizeTb: number, tableCount: number) {
  if (dataSizeTb > 15 || tableCount > 2500) return SIZE_BANDS[4];
  if (dataSizeTb > 10 || tableCount > 2000) return SIZE_BANDS[3];
  if (dataSizeTb > 0.5 || tableCount > 500) return SIZE_BANDS[2];
  if (dataSizeTb > 0.25 || tableCount > 100) return SIZE_BANDS[1];
  return SIZE_BANDS[0];
}

function getComplexityBand(points: number) {
  return COMPLEXITY_BANDS.find((band) => points >= (band.min ?? 0) && points <= (band.max ?? 0)) ?? COMPLEXITY_BANDS.at(-1)!;
}

function countScore(count: number) {
  if (count > 40) return 3;
  if (count > 20) return 2;
  if (count > 6) return 1;
  return 0;
}

export function BuComplexityTemplate({ mode, scenarioId }: TemplateProps) {
  const fixture = COMPLEXITY_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const factors = fixture.factors;
  const copy = fixture.copy;
  const [assessment, setAssessment] = useState<ComplexityAssessmentState>(() => clone(fixture.initial));
  const [locked, setLocked] = useState(mode === "readonly");
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);

  if (mode === "empty") {
    return <EmptyState title={copy.emptyTitle} copy={copy.emptyCopy} />;
  }

  const disabled = locked || mode === "readonly";
  const sizeBand = getSizeBand(assessment.dataSizeTb, assessment.tableCount);
  const factorScores = factors.map((factor) => factor.options.find((option) => option.value === assessment.factorValues[factor.id])?.score ?? 0);
  const workspaceScore = countScore(assessment.workspaceCount);
  const sourceSinkScore = countScore(assessment.sourceSinkCount);
  const adfScore = fixture.calculatedScore;
  const rawComplexityPoints = factorScores.reduce((total, score) => total + score, 0) + workspaceScore + sourceSinkScore + adfScore;
  const complexityBand = getComplexityBand(rawComplexityPoints);
  const effortScore = sizeBand.score * complexityBand.score;
  const estimatedDays = effortScore * 5;

  const updateNumber = (key: keyof Pick<ComplexityAssessmentState, "dataSizeTb" | "tableCount" | "workspaceCount">, value: number) => {
    setAssessment((current) => ({ ...current, [key]: Math.max(0, Number.isFinite(value) ? value : 0) }));
    setNotice({ tone: "info", copy: copy.recalculatedNotice });
  };

  const saveAssessment = () => {
    const missingEvidence = factors.filter((factor) => !assessment.evidence[factor.id]?.trim());
    if (missingEvidence.length) {
      setNotice({ tone: "danger", copy: `Add an evidence note for ${missingEvidence.map((factor) => factor.label.toLowerCase()).join(", ")} before saving.` });
      return;
    }
    setNotice({ tone: "success", copy: `${copy.savedPrefix}: ${sizeBand.band} size, ${complexityBand.band} complexity and ${estimatedDays} estimated person-days.` });
  };

  return <div className={styles.analysisStack}>
    <section className={styles.complexityHero}>
      <div><p className={styles.eyebrow}>{copy.heroEyebrow}</p><h3>{copy.heroTitle}</h3><p>{copy.heroCopy}</p></div>
      <div className={styles.scoreSummary}>
        <article><small>{copy.sizeLabel}</small><strong>{sizeBand.band}</strong><span>{sizeBand.score} pts</span></article>
        <i aria-hidden="true">×</i>
        <article><small>{copy.complexityLabel}</small><strong>{complexityBand.band}</strong><span>{complexityBand.score} pts · {rawComplexityPoints} raw</span></article>
        <i aria-hidden="true">=</i>
        <article data-emphasis="true"><small>{copy.effortLabel}</small><strong>{effortScore}</strong><span>{estimatedDays} person-days</span></article>
      </div>
    </section>

    <Panel title={copy.footprintTitle} eyebrow={copy.footprintEyebrow} action={<Badge>{sizeBand.band}</Badge>}>
      <div className={styles.measureGrid}>
        <label><span>{copy.dataSizeLabel} <small>TB</small></span><input type="number" min="0" step="0.1" value={assessment.dataSizeTb} disabled={disabled} onChange={(event) => updateNumber("dataSizeTb", event.target.valueAsNumber)} /><em>Current score: {sizeBand.score}</em></label>
        <label><span>{copy.tableCountLabel}</span><input type="number" min="0" step="1" value={assessment.tableCount} disabled={disabled} onChange={(event) => updateNumber("tableCount", event.target.valueAsNumber)} /><em>Uses the higher footprint threshold</em></label>
        <label><span>{copy.workspaceCountLabel}</span><input type="number" min="0" step="1" value={assessment.workspaceCount} disabled={disabled} onChange={(event) => updateNumber("workspaceCount", event.target.valueAsNumber)} /><em>{workspaceScore} complexity pts</em></label>
        <section><span>{copy.endpointCountLabel}</span><strong>{assessment.sourceSinkCount}</strong><em>{copy.endpointDetail} · {sourceSinkScore} pts</em></section>
      </div>
    </Panel>

    <Panel title={copy.factorsTitle} eyebrow={copy.factorsEyebrow} action={<div className={styles.inlineActions}><Badge>{rawComplexityPoints} raw points</Badge>{mode !== "readonly" && <ActionButton type="button" variant="ghost" onClick={() => { setLocked((current) => !current); setNotice({ tone: "info", copy: locked ? "Assessment unlocked for editing." : "Assessment locked. Values remain visible and cannot be edited." }); }}>{locked ? "Unlock" : "Lock"}</ActionButton>}</div>}>
      <div className={styles.factorGrid}>{factors.map((factor, index) => {
        const selection = factor.options.find((option) => option.value === assessment.factorValues[factor.id]) ?? factor.options[0];
        return <article className={styles.factorCard} key={factor.id}>
          <header><span>{String(index + 1).padStart(2, "0")}</span><strong>{factor.label}</strong><Badge>{selection.score} pts</Badge></header>
          <label><span>Assessment</span><select value={selection.value} disabled={disabled} onChange={(event) => { setAssessment((current) => ({ ...current, factorValues: { ...current.factorValues, [factor.id]: event.target.value } })); setNotice({ tone: "info", copy: `${factor.label} updated; calculated outputs are live.` }); }}>{factor.options.map((option) => <option value={option.value} key={option.value}>{option.label} · {option.score} pts</option>)}</select></label>
          <label><span>Evidence note</span><textarea rows={2} value={assessment.evidence[factor.id]} disabled={disabled} placeholder={factor.evidencePlaceholder} onChange={(event) => setAssessment((current) => ({ ...current, evidence: { ...current.evidence, [factor.id]: event.target.value } }))} /></label>
        </article>;
      })}
        <article className={`${styles.factorCard} ${styles.calculatedFactor}`}><header><span>06</span><strong>{copy.calculatedTitle}</strong><Badge>{adfScore} pts</Badge></header><div><span>Calculated measure</span><strong>{copy.calculatedBand}</strong><p>{copy.calculatedCopy}</p></div></article>
      </div>
    </Panel>

    <div className={styles.definitionGrid}>
      <Panel title={copy.sizeThresholdTitle} eyebrow="Transparent calculation"><DefinitionTable rows={SIZE_BANDS} active={sizeBand.band} /></Panel>
      <Panel title={copy.complexityThresholdTitle} eyebrow="Transparent calculation"><DefinitionTable rows={COMPLEXITY_BANDS} active={complexityBand.band} /></Panel>
    </div>

    <div className={styles.saveRail}><InlineNotice tone={notice.tone}>{mode === "readonly" ? copy.readOnlyNotice : notice.copy}</InlineNotice><ActionButton type="button" variant="primary" disabled={disabled} onClick={saveAssessment}>Save assessment</ActionButton></div>
  </div>;
}

function DefinitionTable({ rows, active }: { rows: BandDefinition[]; active: string }) {
  return <div className={styles.definitionTable}><div className={styles.definitionHead}><span>Band</span><span>Score</span><span>Definition</span></div>{rows.map((row) => <div key={row.band} data-active={row.band === active}><span><i />{row.band}</span><strong>{row.score}</strong><span>{row.definition}</span></div>)}</div>;
}

/* -------------------------------------------------------------------------- */
/* Environment rationalisation                                                */
/* -------------------------------------------------------------------------- */

type RationalisationAction = "Assess" | "Migrate" | "Merge" | "Decommission";

interface RationalisationRow {
  id: string;
  subscription: string;
  currentName: string;
  discoveryEnvironment: string;
  action: RationalisationAction;
  targetEnvironment: string;
  mergeTargetId: string;
  rationale: string;
}

interface ProposedEnvironment {
  id: string;
  name: string;
  type: string;
  workspaceCount: number;
  promotionTo: string;
  backfillFrom: string;
}

const INITIAL_RATIONALISATION_ROWS: RationalisationRow[] = [
  { id: "source-prod", subscription: "Shared platform subscription", currentName: "Current production", discoveryEnvironment: "Production", action: "Migrate", targetEnvironment: "Target production", mergeTargetId: "", rationale: "Retain a controlled production boundary." },
  { id: "source-test", subscription: "Shared platform subscription", currentName: "Current test", discoveryEnvironment: "Test", action: "Merge", targetEnvironment: "", mergeTargetId: "source-dev", rationale: "Consolidate non-production capacity." },
  { id: "source-dev", subscription: "Delivery subscription", currentName: "Current development", discoveryEnvironment: "Development", action: "Migrate", targetEnvironment: "Target non-production", mergeTargetId: "", rationale: "Retain the main engineering workspace." },
  { id: "source-sandbox", subscription: "Delivery subscription", currentName: "Current sandbox", discoveryEnvironment: "Sandbox", action: "Decommission", targetEnvironment: "", mergeTargetId: "", rationale: "No active workloads remain." },
];

const INITIAL_PROPOSED_ENVIRONMENTS: ProposedEnvironment[] = [
  { id: "target-nonprod", name: "Target non-production", type: "Non-production", workspaceCount: 2, promotionTo: "Target production", backfillFrom: "Target production" },
  { id: "target-prod", name: "Target production", type: "Production", workspaceCount: 1, promotionTo: "", backfillFrom: "" },
];

const GENERIC_FLOW_ROWS: RationalisationRow[] = [
  { id: "flow-intake", subscription: "Input channel", currentName: "Intake requests", discoveryEnvironment: "Capture", action: "Migrate", targetEnvironment: "Review queue", mergeTargetId: "", rationale: "Route new requests into a common review step." },
  { id: "flow-feedback", subscription: "Input channel", currentName: "Feedback submissions", discoveryEnvironment: "Capture", action: "Merge", targetEnvironment: "", mergeTargetId: "flow-intake", rationale: "Combine related submissions before review." },
  { id: "flow-approval", subscription: "Decision channel", currentName: "Approval decisions", discoveryEnvironment: "Decision", action: "Migrate", targetEnvironment: "Published outcome", mergeTargetId: "", rationale: "Publish accepted decisions to the output stage." },
  { id: "flow-archive", subscription: "Legacy channel", currentName: "Historic records", discoveryEnvironment: "Archive", action: "Decommission", targetEnvironment: "", mergeTargetId: "", rationale: "Retire records outside the active workflow." },
];

const GENERIC_STRUCTURE_TARGETS: ProposedEnvironment[] = [
  { id: "group-intake", name: "Intake group", type: "Input group", workspaceCount: 2, promotionTo: "Review group", backfillFrom: "" },
  { id: "group-review", name: "Review group", type: "Process group", workspaceCount: 3, promotionTo: "Published group", backfillFrom: "Intake group" },
  { id: "group-published", name: "Published group", type: "Output group", workspaceCount: 1, promotionTo: "", backfillFrom: "Review group" },
];

const DCC_RATIONALISATION_ROWS: RationalisationRow[] = [
  { id: "dcc-standard-scope", subscription: "Standards library", currentName: "Selected assurance requirements", discoveryEnvironment: "Standard", action: "Migrate", targetEnvironment: "Assurance run DCC-018", mergeTargetId: "", rationale: "Pin the selected standard editions and requirement mappings to the run." },
  { id: "dcc-solution-design", subscription: "Document library", currentName: "Customer portal solution design v0.8", discoveryEnvironment: "Document", action: "Migrate", targetEnvironment: "Assurance run DCC-018", mergeTargetId: "", rationale: "Assess the versioned design against all selected requirements." },
  { id: "dcc-threat-model", subscription: "Document library", currentName: "Customer portal threat model v0.4", discoveryEnvironment: "Document", action: "Merge", targetEnvironment: "", mergeTargetId: "dcc-solution-design", rationale: "Review security evidence in the same decision context as the solution design." },
  { id: "dcc-old-statement", subscription: "Document archive", currentName: "Accessibility statement v0.2", discoveryEnvironment: "Archive", action: "Decommission", targetEnvironment: "", mergeTargetId: "", rationale: "Superseded by the current draft and retained only in the audit history." },
];

const DCC_PROPOSED_ENVIRONMENTS: ProposedEnvironment[] = [
  { id: "dcc-assurance-run", name: "Assurance run DCC-018", type: "Assurance run", workspaceCount: 3, promotionTo: "Human decision register", backfillFrom: "" },
  { id: "dcc-human-review", name: "Human decision register", type: "Decision", workspaceCount: 4, promotionTo: "Published assurance report", backfillFrom: "Assurance run DCC-018" },
  { id: "dcc-report", name: "Published assurance report", type: "Output", workspaceCount: 1, promotionTo: "", backfillFrom: "Human decision register" },
];

const DCC_FLOW_ROWS: RationalisationRow[] = [
  { id: "flow-standards", subscription: "Governed input", currentName: "Selected standards", discoveryEnvironment: "Standards", action: "Migrate", targetEnvironment: "Document assurance scan", mergeTargetId: "", rationale: "Provide the requirement scope for the scan." },
  { id: "flow-documents", subscription: "Governed input", currentName: "Uploaded documents", discoveryEnvironment: "Documents", action: "Migrate", targetEnvironment: "Document assurance scan", mergeTargetId: "", rationale: "Retain version and source metadata for every excerpt." },
  { id: "flow-findings", subscription: "AI output", currentName: "Source-linked AI findings", discoveryEnvironment: "Assessment", action: "Migrate", targetEnvironment: "Human assurance review", mergeTargetId: "", rationale: "Route provisional results to a named human reviewer." },
  { id: "flow-gaps", subscription: "AI output", currentName: "Unlinked or incomplete findings", discoveryEnvironment: "Assessment", action: "Migrate", targetEnvironment: "Evidence task queue", mergeTargetId: "", rationale: "Keep missing evidence visible and assignable." },
  { id: "flow-decision", subscription: "Decision output", currentName: "Reviewed assurance decision", discoveryEnvironment: "Decision", action: "Migrate", targetEnvironment: "Published assurance report", mergeTargetId: "", rationale: "Publish only findings with an accountable decision." },
];

const DCC_STRUCTURE_TARGETS: ProposedEnvironment[] = [
  { id: "group-standards", name: "Standards library", type: "Input group", workspaceCount: 4, promotionTo: "Document scan", backfillFrom: "" },
  { id: "group-documents", name: "Document library", type: "Input group", workspaceCount: 3, promotionTo: "Document scan", backfillFrom: "" },
  { id: "group-scan", name: "Document scan", type: "Process group", workspaceCount: 2, promotionTo: "Human review", backfillFrom: "Standards library" },
  { id: "group-review", name: "Human review", type: "Decision group", workspaceCount: 4, promotionTo: "Assurance report", backfillFrom: "Document scan" },
  { id: "group-report", name: "Assurance report", type: "Output group", workspaceCount: 1, promotionTo: "", backfillFrom: "Human review" },
];

type RationalisationCopy = {
  initialNotice: Notice;
  reportText: string;
  teamNotes: string;
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  sourceMetric: string;
  targetMetric: string;
  targetDetailNoun: string;
  narrativeTitle: string;
  narrativeEyebrow: string;
  scopeTitle: string;
  scopeEyebrow: string;
  topologyTitle: string;
  topologyEyebrow: string;
  flowTitle: string;
  structureTitle: string;
  readOnlyNotice: string;
  saveLabel: string;
  emptyRowsTitle: string;
  emptyRowsCopy: string;
  emptyTargetsTitle: string;
  emptyTargetsCopy: string;
  discoveryOptions: string[];
  targetTypeOptions: string[];
  newRowSubscription: string;
  newRowName: string;
  newTargetName: string;
  newTargetType: string;
  ui: {
    exportFile: string;
    addRowAction: string;
    addFirstRowAction: string;
    currentHeader: string;
    actionHeader: string;
    destinationHeader: string;
    currentNameAria: string;
    sourceGroupAria: string;
    classificationAria: string;
    actionAria: string;
    actionLabels: Record<RationalisationAction, string>;
    targetAria: string;
    targetPlaceholder: string;
    mergeAria: string;
    mergePlaceholder: string;
    retiredState: string;
    pendingState: string;
    rationalePlaceholder: string;
    addTargetAction: string;
    addFirstTargetAction: string;
    targetHeaders: [string, string, string, string, string];
    targetNameAria: string;
    targetTypeAria: string;
    countAria: string;
    nextAria: string;
    fromAria: string;
    flowEyebrow: string;
    structureEyebrow: string;
    affectedRowsNoun: string;
    newRowNotice: string;
    newTargetNotice: string;
    clearArmNotice: string;
    clearedNotice: string;
    importRowNoun: string;
    importFallback: string;
    missingRowsNotice: string;
    incompleteDecisionNoun: string;
    savedRowNoun: string;
    savedTargetNoun: string;
    rowRemovedSuffix: string;
    retiredNodeLabel: string;
    topologyGeneric: boolean;
  };
};

const RATIONALISATION_FIXTURES: Record<AnalysisScenarioId, { rows: RationalisationRow[]; targets: ProposedEnvironment[]; copy: RationalisationCopy }> = {
  base: {
    rows: INITIAL_RATIONALISATION_ROWS,
    targets: INITIAL_PROPOSED_ENVIRONMENTS,
    copy: { initialNotice: defaultNotice, reportText: "Consolidate reusable non-production workloads while retaining a separate controlled production boundary.", teamNotes: "Validate merge ownership and finalise the decommission checkpoint before approval.", heroEyebrow: "Environment strategy template", heroTitle: "Current estate → proposed topology", heroCopy: "Migration actions, merge decisions and topology diagrams share one live local model.", sourceMetric: "Source environments", targetMetric: "Proposed targets", targetDetailNoun: "workspaces", narrativeTitle: "Working narrative", narrativeEyebrow: "Report-ready context", scopeTitle: "Scope rationalisation", scopeEyebrow: "Editable migration decisions", topologyTitle: "Proposed topology", topologyEyebrow: "Editable target structure", flowTitle: "Migration flow", structureTitle: "Promotion structure", readOnlyNotice: "Read-only view: decisions and diagrams are available, while editing and imports are locked.", saveLabel: "Save rationalisation", emptyRowsTitle: "No source environments", emptyRowsCopy: "Add a source environment or import the exported JSON format to begin a rationalisation scenario.", emptyTargetsTitle: "No proposed targets", emptyTargetsCopy: "Add target environments to populate migration destinations and render promotion and backfill structure.", discoveryOptions: ["Unclassified", "Development", "Test", "Pre-production", "Production", "Sandbox"], targetTypeOptions: ["Non-production", "Test", "Pre-production", "Production", "Shared services"], newRowSubscription: "Shared subscription", newRowName: "New environment", newTargetName: "Target environment", newTargetType: "Non-production", ui: { exportFile:"environment-rationalisation-template.json", addRowAction:"Add environment", addFirstRowAction:"Add first environment", currentHeader:"Current environment", actionHeader:"Migration action", destinationHeader:"Destination", currentNameAria:"Current environment name", sourceGroupAria:"Subscription for", classificationAria:"Discovery classification for", actionAria:"Migration action for", actionLabels:{ Assess:"Assess", Migrate:"Migrate", Merge:"Merge", Decommission:"Decommission" }, targetAria:"Target environment for", targetPlaceholder:"Choose target…", mergeAria:"Merge target for", mergePlaceholder:"Choose source environment…", retiredState:"Retire — no target", pendingState:"Awaiting decision", rationalePlaceholder:"Add decision rationale", addTargetAction:"Add target", addFirstTargetAction:"Add first target", targetHeaders:["Environment","Type","Workspaces","Promotes to","Backfill from"], targetNameAria:"Target environment name", targetTypeAria:"Environment type for", countAria:"Workspace count for", nextAria:"Promotion target for", fromAria:"Backfill source for", flowEyebrow:"Live decision diagram", structureEyebrow:"Live topology diagram", affectedRowsNoun:"migration rows", newRowNotice:"A new source environment was added. Complete its migration action before saving.", newTargetNotice:"A proposed environment was added and the diagrams refreshed.", clearArmNotice:"Clear is armed. Select Confirm clear to remove all local rows and topology entries.", clearedNotice:"Local rationalisation rows cleared. Use Add environment to start again.", importRowNoun:"rationalisation rows", importFallback:"Import failed. Use the exported JSON template.", missingRowsNotice:"Add at least one source environment before saving.", incompleteDecisionNoun:"a complete migration decision or target", savedRowNoun:"rationalisation decisions", savedTargetNoun:"proposed environments", rowRemovedSuffix:"removed from the local model.", retiredNodeLabel:"Retired", topologyGeneric:false } },
  },
  "dcc-hackathon": {
    rows: DCC_RATIONALISATION_ROWS,
    targets: DCC_PROPOSED_ENVIRONMENTS,
    copy: { initialNotice: { tone: "info", copy: "DCC standards, documents and assurance relationships loaded. Changes remain inside this preview." }, reportText: "Assess the current customer-portal documentation against four governed standards and retain every source-linked finding through human approval.", teamNotes: "Confirm security ownership, attach contrast evidence and resolve the remaining evidence links before publishing the assurance result.", heroEyebrow: "Assurance relationship strategy", heroTitle: "Standards and documents → accountable decision", heroCopy: "Document routes, linked standards and decision topology stay aligned in one assurance model.", sourceMetric: "Standards and documents", targetMetric: "Assurance stages", targetDetailNoun: "records", narrativeTitle: "Assurance narrative", narrativeEyebrow: "Report-ready decision context", scopeTitle: "Relationship routing", scopeEyebrow: "Editable standards and document decisions", topologyTitle: "Assurance topology", topologyEyebrow: "Editable scan-to-decision structure", flowTitle: "Assurance flow", structureTitle: "Decision structure", readOnlyNotice: "Read-only view: assurance relationships and diagrams are available, while editing and imports are locked.", saveLabel: "Save assurance model", emptyRowsTitle: "No standards or documents", emptyRowsCopy: "Add a governed input or import the exported JSON format to begin an assurance relationship model.", emptyTargetsTitle: "No assurance stages", emptyTargetsCopy: "Add assurance stages to populate document routes and render the decision structure.", discoveryOptions: ["Unclassified", "Standard", "Document", "Assessment", "Decision", "Archive"], targetTypeOptions: ["Input", "Assurance run", "Review", "Decision", "Output"], newRowSubscription: "Document library", newRowName: "New assurance input", newTargetName: "Assurance stage", newTargetType: "Assurance run", ui: { exportFile:"dcc-assurance-relationship-model.json", addRowAction:"Add assurance input", addFirstRowAction:"Add first assurance input", currentHeader:"Assurance input", actionHeader:"Relationship action", destinationHeader:"Assurance stage", currentNameAria:"Assurance input name", sourceGroupAria:"Library or source for", classificationAria:"Assurance classification for", actionAria:"Relationship action for", actionLabels:{ Assess:"Decide", Migrate:"Route to stage", Merge:"Review together", Decommission:"Archive" }, targetAria:"Assurance stage for", targetPlaceholder:"Choose stage…", mergeAria:"Related input for", mergePlaceholder:"Choose assurance input…", retiredState:"Archive — no active stage", pendingState:"Awaiting route", rationalePlaceholder:"Add assurance rationale", addTargetAction:"Add assurance stage", addFirstTargetAction:"Add first assurance stage", targetHeaders:["Stage","Type","Records","Next stage","Evidence from"], targetNameAria:"Assurance stage name", targetTypeAria:"Stage type for", countAria:"Record count for", nextAria:"Next stage for", fromAria:"Evidence source stage for", flowEyebrow:"Live relationship diagram", structureEyebrow:"Live decision topology", affectedRowsNoun:"assurance inputs", newRowNotice:"A new assurance input was added. Choose its relationship action before saving.", newTargetNotice:"A new assurance stage was added and the diagrams refreshed.", clearArmNotice:"Clear is armed. Select Confirm clear to remove all assurance inputs and stages.", clearedNotice:"Assurance relationship rows cleared. Use Add assurance input to start again.", importRowNoun:"assurance relationship rows", importFallback:"Import failed. Use the exported assurance JSON template.", missingRowsNotice:"Add at least one standard or document before saving.", incompleteDecisionNoun:"a complete assurance route or stage", savedRowNoun:"assurance relationships", savedTargetNoun:"assurance stages", rowRemovedSuffix:"removed from the assurance model.", retiredNodeLabel:"Archived", topologyGeneric:true } },
  },
};

type DiagramCopy = {
  initialNotice: Notice;
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  primaryMetric: string;
  secondaryMetric: string;
  primaryDetail: string;
  secondaryDetail: string;
  configTitle: string;
  configEyebrow: string;
  canvasTitle: string;
  canvasEyebrow: string;
  readOnlyNotice: string;
  saveLabel: string;
  exportFile: string;
  stageOptions?: string[];
  addAction: string;
  addFirstAction: string;
  emptyTitle: string;
  emptyCopy: string;
  canvasEmptyTitle: string;
  canvasEmptyCopy: string;
  newItemName: string;
  newItemType: string;
  newItemSource: string;
  newItemNotice: string;
  importShapeError: string;
  importNoun: string;
  importSuccessSuffix: string;
  importFallback: string;
  savedNotice: string;
  actionLabels: Record<RationalisationAction, string>;
  retiredNodeLabel: string;
  targetPlaceholder: string;
  mergePlaceholder: string;
  retiredState: string;
  pendingState: string;
};

const FLOW_FIXTURES: Record<AnalysisScenarioId, { rows: RationalisationRow[]; copy: DiagramCopy }> = {
  base: { rows: GENERIC_FLOW_ROWS, copy: { initialNotice: defaultNotice, heroEyebrow: "Reusable flow diagram", heroTitle: "Current-to-target decision flow", heroCopy: "Configure source nodes and routing actions; the focusable graph redraws every path from the same local model.", primaryMetric: "Source nodes", secondaryMetric: "Destinations", primaryDetail: "connected", secondaryDetail: "live targets", configTitle: "Flow configuration", configEyebrow: "Compact local adapter", canvasTitle: "Flow canvas", canvasEyebrow: "Interactive current-to-target renderer", readOnlyNotice: "Read-only view: diagram focus and collapse remain available; configuration is locked.", saveLabel: "Save flow", exportFile: "flow-diagram-template.json", stageOptions: ["Unclassified", "Capture", "Review", "Decision", "Output", "Archive"], addAction: "Add source", addFirstAction: "Add first source", emptyTitle: "No flow nodes", emptyCopy: "Add a source node or import a flow template to begin.", canvasEmptyTitle: "No flow to display", canvasEmptyCopy: "Paths appear as soon as source decisions are added.", newItemName: "Source node", newItemType: "Unclassified", newItemSource: "Input channel", newItemNotice: "A source node was added. Choose its action and destination to draw a connector.", importShapeError: "The file must contain a rows array.", importNoun: "flow nodes", importSuccessSuffix: "The diagram has refreshed.", importFallback: "Import failed. Use the exported JSON format.", savedNotice: "flow nodes saved locally as a reusable template.", actionLabels: { Assess: "Pending", Migrate: "Route", Merge: "Merge", Decommission: "Retire" }, retiredNodeLabel: "Retired", targetPlaceholder: "Target node", mergePlaceholder: "Choose source…", retiredState: "Routes to Retired", pendingState: "Choose a decision" } },
  "dcc-hackathon": { rows: DCC_FLOW_ROWS, copy: { initialNotice: { tone: "info", copy: "DCC standards-to-decision flow loaded. Changes remain inside this preview." }, heroEyebrow: "Interactive assurance flow", heroTitle: "Standards-to-decision flow", heroCopy: "Configure standards, documents, AI findings and human decisions; the focusable graph redraws every evidence route from the same model.", primaryMetric: "Assurance inputs", secondaryMetric: "Workflow destinations", primaryDetail: "connected", secondaryDetail: "live stages", configTitle: "Assurance flow configuration", configEyebrow: "Evidence source and route settings", canvasTitle: "Assurance flow canvas", canvasEyebrow: "Interactive standards-to-decision renderer", readOnlyNotice: "Read-only view: assurance-flow focus and collapse remain available; configuration is locked.", saveLabel: "Save assurance flow", exportFile: "dcc-assurance-flow.json", stageOptions: ["Unclassified", "Standards", "Documents", "Assessment", "Review", "Decision", "Output", "Archive"], addAction: "Add assurance input", addFirstAction: "Add first assurance input", emptyTitle: "No assurance flow inputs", emptyCopy: "Add a standard, document or finding source, or import an assurance flow template to begin.", canvasEmptyTitle: "No assurance flow to display", canvasEmptyCopy: "Evidence routes appear as soon as assurance inputs and decisions are added.", newItemName: "Assurance input", newItemType: "Unclassified", newItemSource: "Assurance source", newItemNotice: "An assurance input was added. Choose its action and destination to draw an evidence route.", importShapeError: "The file must contain an assurance rows array.", importNoun: "assurance flow nodes", importSuccessSuffix: "The assurance diagram has refreshed.", importFallback: "Import failed. Use the exported assurance-flow JSON format.", savedNotice: "assurance flow nodes saved locally.", actionLabels: { Assess: "Pending", Migrate: "Route", Merge: "Review together", Decommission: "Archive" }, retiredNodeLabel: "Archived", targetPlaceholder: "Assurance stage", mergePlaceholder: "Choose assurance input…", retiredState: "Routes to Archived", pendingState: "Choose an assurance decision" } },
};

const STRUCTURE_FIXTURES: Record<AnalysisScenarioId, { targets: ProposedEnvironment[]; copy: DiagramCopy }> = {
  base: { targets: GENERIC_STRUCTURE_TARGETS, copy: { initialNotice: defaultNotice, heroEyebrow: "Reusable structure diagram", heroTitle: "Group and item hierarchy", heroCopy: "Model groups, child items and directional links with independently focusable and collapsible nodes.", primaryMetric: "Groups", secondaryMetric: "Items", primaryDetail: "directional links", secondaryDetail: "generated nodes", configTitle: "Structure configuration", configEyebrow: "Compact local adapter", canvasTitle: "Structure canvas", canvasEyebrow: "Interactive hierarchy and directional-link renderer", readOnlyNotice: "Read-only view: node focus and collapse remain available; configuration is locked.", saveLabel: "Save structure", exportFile: "structure-diagram-template.json", addAction: "Add group", addFirstAction: "Add first group", emptyTitle: "No structure nodes", emptyCopy: "Add a group or import a structure template to begin.", canvasEmptyTitle: "No structure to display", canvasEmptyCopy: "Add groups to render the hierarchy and directional links.", newItemName: "Group", newItemType: "Process group", newItemSource: "", newItemNotice: "A group was added to the live hierarchy.", importShapeError: "The file must contain a proposedEnvironments array.", importNoun: "groups", importSuccessSuffix: "The hierarchy has refreshed.", importFallback: "Import failed. Use the exported JSON format.", savedNotice: "group nodes saved locally as a reusable structure template.", actionLabels: { Assess: "Pending", Migrate: "Route", Merge: "Merge", Decommission: "Retire" }, retiredNodeLabel: "Retired", targetPlaceholder: "", mergePlaceholder: "", retiredState: "", pendingState: "" } },
  "dcc-hackathon": { targets: DCC_STRUCTURE_TARGETS, copy: { initialNotice: { tone: "info", copy: "DCC assurance relationship hierarchy loaded. Changes remain inside this preview." }, heroEyebrow: "Interactive assurance structure", heroTitle: "Standards, evidence and decision hierarchy", heroCopy: "Model standards, uploaded documents, scan stages and human decisions with independently focusable and collapsible nodes.", primaryMetric: "Assurance groups", secondaryMetric: "Linked records", primaryDetail: "directional links", secondaryDetail: "generated nodes", configTitle: "Assurance structure configuration", configEyebrow: "Evidence group and relationship settings", canvasTitle: "Assurance structure canvas", canvasEyebrow: "Interactive evidence and decision renderer", readOnlyNotice: "Read-only view: relationship focus and collapse remain available; configuration is locked.", saveLabel: "Save assurance structure", exportFile: "dcc-assurance-structure.json", addAction: "Add assurance group", addFirstAction: "Add first assurance group", emptyTitle: "No assurance structure nodes", emptyCopy: "Add an assurance group or import an assurance structure template to begin.", canvasEmptyTitle: "No assurance structure to display", canvasEmptyCopy: "Add standards, evidence and decision groups to render the assurance hierarchy.", newItemName: "Assurance group", newItemType: "Process group", newItemSource: "", newItemNotice: "An assurance group was added to the live hierarchy.", importShapeError: "The file must contain assurance groups in a proposedEnvironments array.", importNoun: "assurance groups", importSuccessSuffix: "The assurance hierarchy has refreshed.", importFallback: "Import failed. Use the exported assurance-structure JSON format.", savedNotice: "assurance group nodes saved locally.", actionLabels: { Assess: "Pending", Migrate: "Route", Merge: "Review together", Decommission: "Archive" }, retiredNodeLabel: "Archived", targetPlaceholder: "", mergePlaceholder: "", retiredState: "", pendingState: "" } },
};

function rationalisationTarget(row: RationalisationRow, rows: RationalisationRow[]) {
  if (row.action === "Decommission") return "Retired";
  if (row.action === "Merge") return rows.find((candidate) => candidate.id === row.mergeTargetId)?.currentName ?? "Merge target missing";
  if (row.action === "Migrate") return row.targetEnvironment || "Target missing";
  return "Decision pending";
}

export function EnvironmentRationalisationTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = RATIONALISATION_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const initialRows = mode === "empty" ? [] : clone(fixture.rows);
  const initialTargets = mode === "empty" ? [] : clone(fixture.targets);
  const [rows, setRows] = useState<RationalisationRow[]>(initialRows);
  const [targets, setTargets] = useState<ProposedEnvironment[]>(initialTargets);
  const [reportText, setReportText] = useState(copy.reportText);
  const [teamNotes, setTeamNotes] = useState(copy.teamNotes);
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);
  const [clearArmed, setClearArmed] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // mode and resetToken are explicit workbench reset signals.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(mode === "empty" ? [] : clone(fixture.rows));
    setTargets(mode === "empty" ? [] : clone(fixture.targets));
    setReportText(copy.reportText);
    setTeamNotes(copy.teamNotes);
    setNotice(copy.initialNotice);
    setClearArmed(false);
  }, [copy, fixture, mode, resetToken]);

  const incompleteRows = rows.filter((row) => (row.action === "Migrate" && !row.targetEnvironment) || (row.action === "Merge" && !row.mergeTargetId) || row.action === "Assess");
  const updateRow = (id: string, patch: Partial<RationalisationRow>) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  const updateTarget = (id: string, patch: Partial<ProposedEnvironment>) => setTargets((current) => current.map((target) => target.id === id ? { ...target, ...patch } : target));
  const renameTarget = (id: string, name: string) => {
    const previousName = targets.find((target) => target.id === id)?.name ?? "";
    setTargets((current) => current.map((target) => target.id === id ? { ...target, name } : {
      ...target,
      promotionTo: target.promotionTo === previousName ? name : target.promotionTo,
      backfillFrom: target.backfillFrom === previousName ? name : target.backfillFrom,
    }));
    setRows((current) => current.map((row) => row.targetEnvironment === previousName ? { ...row, targetEnvironment: name } : row));
  };
  const removeTarget = (target: ProposedEnvironment) => {
    setTargets((current) => current.filter((candidate) => candidate.id !== target.id).map((candidate) => ({
      ...candidate,
      promotionTo: candidate.promotionTo === target.name ? "" : candidate.promotionTo,
      backfillFrom: candidate.backfillFrom === target.name ? "" : candidate.backfillFrom,
    })));
    setRows((current) => current.map((row) => row.targetEnvironment === target.name ? { ...row, targetEnvironment: "" } : row));
    setNotice({ tone: "warning", copy: `${target.name} was removed. Any affected ${copy.ui.affectedRowsNoun} now need a new target.` });
  };

  const addRow = () => {
    const sequence = rows.length + 1;
    setRows((current) => [...current, { id: `source-${Date.now()}`, subscription: copy.newRowSubscription, currentName: `${copy.newRowName} ${sequence}`, discoveryEnvironment: "Unclassified", action: "Assess", targetEnvironment: "", mergeTargetId: "", rationale: "" }]);
    setNotice({ tone: "info", copy: copy.ui.newRowNotice });
  };

  const addTarget = () => {
    const sequence = targets.length + 1;
    setTargets((current) => [...current, { id: `target-${Date.now()}`, name: `${copy.newTargetName} ${sequence}`, type: copy.newTargetType, workspaceCount: 1, promotionTo: "", backfillFrom: "" }]);
    setNotice({ tone: "info", copy: copy.ui.newTargetNotice });
  };

  const clearRows = () => {
    if (!clearArmed) {
      setClearArmed(true);
      setNotice({ tone: "warning", copy: copy.ui.clearArmNotice });
      return;
    }
    setRows([]);
    setTargets([]);
    setClearArmed(false);
    setNotice({ tone: "success", copy: copy.ui.clearedNotice });
  };

  const importTemplate = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as { rows?: RationalisationRow[]; proposedEnvironments?: ProposedEnvironment[] };
      if (!Array.isArray(payload.rows)) throw new Error("The file must contain a rows array.");
      const importedRows = payload.rows.map((row, index) => ({ ...row, id: row.id || `imported-source-${index + 1}`, action: (["Assess", "Migrate", "Merge", "Decommission"].includes(row.action) ? row.action : "Assess") as RationalisationAction }));
      setRows(importedRows);
      if (Array.isArray(payload.proposedEnvironments)) setTargets(payload.proposedEnvironments.map((target, index) => ({ ...target, id: target.id || `imported-target-${index + 1}` })));
      setNotice({ tone: "success", copy: `${importedRows.length} ${copy.ui.importRowNoun} imported and staged locally. Review them before saving.` });
    } catch (error) {
      setNotice({ tone: "danger", copy: error instanceof Error ? `Import failed: ${error.message}` : copy.ui.importFallback });
    }
  };

  const save = () => {
    if (!rows.length) {
      setNotice({ tone: "danger", copy: copy.ui.missingRowsNotice });
      return;
    }
    if (incompleteRows.length) {
      setNotice({ tone: "danger", copy: `${incompleteRows.length} row${incompleteRows.length === 1 ? " needs" : "s need"} ${copy.ui.incompleteDecisionNoun}.` });
      return;
    }
    setNotice({ tone: "success", copy: `${rows.length} ${copy.ui.savedRowNoun} and ${targets.length} ${copy.ui.savedTargetNoun} saved locally.` });
  };

  return <div className={styles.analysisStack}>
    <section className={styles.rationalisationHero}>
      <div><p className={styles.eyebrow}>{copy.heroEyebrow}</p><h3>{copy.heroTitle}</h3><p>{copy.heroCopy}</p></div>
      <div><Metric label={copy.sourceMetric} value={rows.length} detail={`${incompleteRows.length} decisions incomplete`} tone={incompleteRows.length ? "watch" : "good"} /><Metric label={copy.targetMetric} value={targets.length} detail={`${targets.reduce((total, target) => total + target.workspaceCount, 0)} ${copy.targetDetailNoun}`} /></div>
    </section>

    <Panel title={copy.narrativeTitle} eyebrow={copy.narrativeEyebrow}>
      <div className={styles.narrativeGrid}><label><span>Proposed approach</span><textarea rows={3} value={reportText} disabled={readOnly} onChange={(event) => setReportText(event.target.value)} /></label><label><span>Team notes</span><textarea rows={3} value={teamNotes} disabled={readOnly} onChange={(event) => setTeamNotes(event.target.value)} /></label></div>
    </Panel>

    <Panel title={copy.scopeTitle} eyebrow={copy.scopeEyebrow} action={<div className={styles.inlineActions}><input ref={importInput} className={styles.visuallyHidden} type="file" accept="application/json,.json" onChange={importTemplate} /><ActionButton type="button" variant="ghost" disabled={readOnly} onClick={() => importInput.current?.click()}>Import</ActionButton><ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.ui.exportFile, { rows, proposedEnvironments: targets, reportText, teamNotes })}>Export</ActionButton><ActionButton type="button" variant={clearArmed ? "danger" : "ghost"} disabled={readOnly} onClick={clearRows}>{clearArmed ? "Confirm clear" : "Clear"}</ActionButton><ActionButton type="button" variant="primary" disabled={readOnly} onClick={addRow}>{copy.ui.addRowAction}</ActionButton></div>}>
      {rows.length ? <div className={styles.tableScroller}><table className={styles.rationalisationTable}><thead><tr><th>{copy.ui.currentHeader}</th><th>{copy.ui.actionHeader}</th><th>{copy.ui.destinationHeader}</th><th>Rationale</th><th><span className={styles.visuallyHidden}>Remove</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} data-incomplete={incompleteRows.includes(row)}><td><div className={styles.sourceIdentity}><input aria-label={copy.ui.currentNameAria} value={row.currentName} disabled={readOnly} onChange={(event) => updateRow(row.id, { currentName: event.target.value })} /><span><input aria-label={`${copy.ui.sourceGroupAria} ${row.currentName}`} value={row.subscription} disabled={readOnly} onChange={(event) => updateRow(row.id, { subscription: event.target.value })} /><select aria-label={`${copy.ui.classificationAria} ${row.currentName}`} value={row.discoveryEnvironment} disabled={readOnly} onChange={(event) => updateRow(row.id, { discoveryEnvironment: event.target.value })}>{copy.discoveryOptions.map((option) => <option key={option}>{option}</option>)}</select></span></div></td><td><select aria-label={`${copy.ui.actionAria} ${row.currentName}`} value={row.action} disabled={readOnly} onChange={(event) => { const action = event.target.value as RationalisationAction; updateRow(row.id, { action, targetEnvironment: action === "Migrate" ? row.targetEnvironment : "", mergeTargetId: action === "Merge" ? row.mergeTargetId : "" }); setClearArmed(false); }}><option value="Assess">{copy.ui.actionLabels.Assess}</option><option value="Migrate">{copy.ui.actionLabels.Migrate}</option><option value="Merge">{copy.ui.actionLabels.Merge}</option><option value="Decommission">{copy.ui.actionLabels.Decommission}</option></select></td><td>{row.action === "Migrate" ? <select aria-label={`${copy.ui.targetAria} ${row.currentName}`} value={row.targetEnvironment} disabled={readOnly} onChange={(event) => updateRow(row.id, { targetEnvironment: event.target.value })}><option value="">{copy.ui.targetPlaceholder}</option>{targets.map((target) => <option value={target.name} key={target.id}>{target.name}</option>)}</select> : row.action === "Merge" ? <select aria-label={`${copy.ui.mergeAria} ${row.currentName}`} value={row.mergeTargetId} disabled={readOnly} onChange={(event) => updateRow(row.id, { mergeTargetId: event.target.value })}><option value="">{copy.ui.mergePlaceholder}</option>{rows.filter((candidate) => candidate.id !== row.id && candidate.action !== "Decommission").map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.currentName}</option>)}</select> : <span className={styles.destinationState}>{row.action === "Decommission" ? copy.ui.retiredState : copy.ui.pendingState}</span>}</td><td><input aria-label={`Rationale for ${row.currentName}`} value={row.rationale} disabled={readOnly} placeholder={copy.ui.rationalePlaceholder} onChange={(event) => updateRow(row.id, { rationale: event.target.value })} /></td><td><button type="button" disabled={readOnly} aria-label={`Remove ${row.currentName}`} onClick={() => { setRows((current) => current.filter((candidate) => candidate.id !== row.id)); setNotice({ tone: "info", copy: `${row.currentName} ${copy.ui.rowRemovedSuffix}` }); }}>×</button></td></tr>)}</tbody></table></div> : <EmptyState title={copy.emptyRowsTitle} copy={copy.emptyRowsCopy} action={!readOnly ? <ActionButton type="button" variant="primary" onClick={addRow}>{copy.ui.addFirstRowAction}</ActionButton> : undefined} />}
    </Panel>

    <Panel title={copy.topologyTitle} eyebrow={copy.topologyEyebrow} action={<ActionButton type="button" variant="primary" disabled={readOnly} onClick={addTarget}>{copy.ui.addTargetAction}</ActionButton>}>
      {targets.length ? <div className={styles.tableScroller}><table className={styles.targetTable}><thead><tr>{copy.ui.targetHeaders.map((header) => <th key={header}>{header}</th>)}<th><span className={styles.visuallyHidden}>Remove</span></th></tr></thead><tbody>{targets.map((target) => <tr key={target.id}><td><input aria-label={copy.ui.targetNameAria} value={target.name} disabled={readOnly} onChange={(event) => renameTarget(target.id, event.target.value)} /></td><td><select aria-label={`${copy.ui.targetTypeAria} ${target.name}`} value={target.type} disabled={readOnly} onChange={(event) => updateTarget(target.id, { type: event.target.value })}>{copy.targetTypeOptions.map((option) => <option key={option}>{option}</option>)}</select></td><td><input aria-label={`${copy.ui.countAria} ${target.name}`} type="number" min="0" value={target.workspaceCount} disabled={readOnly} onChange={(event) => updateTarget(target.id, { workspaceCount: Math.max(0, event.target.valueAsNumber || 0) })} /></td><td><select aria-label={`${copy.ui.nextAria} ${target.name}`} value={target.promotionTo} disabled={readOnly} onChange={(event) => updateTarget(target.id, { promotionTo: event.target.value })}><option value="">None</option>{targets.filter((candidate) => candidate.id !== target.id).map((candidate) => <option value={candidate.name} key={candidate.id}>{candidate.name}</option>)}</select></td><td><select aria-label={`${copy.ui.fromAria} ${target.name}`} value={target.backfillFrom} disabled={readOnly} onChange={(event) => updateTarget(target.id, { backfillFrom: event.target.value })}><option value="">None</option>{targets.filter((candidate) => candidate.id !== target.id).map((candidate) => <option value={candidate.name} key={candidate.id}>{candidate.name}</option>)}</select></td><td><button type="button" disabled={readOnly} aria-label={`Remove ${target.name}`} onClick={() => removeTarget(target)}>×</button></td></tr>)}</tbody></table></div> : <EmptyState title={copy.emptyTargetsTitle} copy={copy.emptyTargetsCopy} action={!readOnly ? <ActionButton type="button" variant="primary" onClick={addTarget}>{copy.ui.addFirstTargetAction}</ActionButton> : undefined} />}
    </Panel>

    <div className={styles.diagramGrid}>
      <Panel title={copy.flowTitle} eyebrow={copy.ui.flowEyebrow}><MigrationFlow rows={rows} actionLabels={copy.ui.actionLabels} retiredLabel={copy.ui.retiredNodeLabel} /></Panel>
      <Panel title={copy.structureTitle} eyebrow={copy.ui.structureEyebrow}><TopologyStructure targets={targets} generic={copy.ui.topologyGeneric} /></Panel>
    </div>

    <div className={styles.saveRail}><InlineNotice tone={notice.tone}>{readOnly ? copy.readOnlyNotice : notice.copy}</InlineNotice><ActionButton type="button" variant="primary" disabled={readOnly} onClick={save}>{copy.saveLabel}</ActionButton></div>
  </div>;
}

export function FlowDiagramTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = FLOW_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [rows, setRows] = useState<RationalisationRow[]>(() => mode === "empty" ? [] : clone(fixture.rows));
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // mode and resetToken are explicit workbench reset signals.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(mode === "empty" ? [] : clone(fixture.rows));
    setNotice(copy.initialNotice);
  }, [copy, fixture, mode, resetToken]);

  const updateRow = (id: string, patch: Partial<RationalisationRow>) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  const addRow = () => {
    const sequence = rows.length + 1;
    setRows((current) => [...current, { id: `flow-source-${Date.now()}`, subscription: copy.newItemSource, currentName: `${copy.newItemName} ${sequence}`, discoveryEnvironment: copy.newItemType, action: "Assess", targetEnvironment: "", mergeTargetId: "", rationale: "" }]);
    setNotice({ tone: "info", copy: copy.newItemNotice });
  };
  const importFlow = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as { rows?: RationalisationRow[] } | RationalisationRow[];
      const imported = Array.isArray(payload) ? payload : payload.rows;
      if (!Array.isArray(imported)) throw new Error(copy.importShapeError);
      setRows(imported.map((row, index) => ({ ...row, id: row.id || `flow-import-${index + 1}`, action: (["Assess", "Migrate", "Merge", "Decommission"].includes(row.action) ? row.action : "Assess") as RationalisationAction })));
      setNotice({ tone: "success", copy: `${imported.length} ${copy.importNoun} imported. ${copy.importSuccessSuffix}` });
    } catch (error) {
      setNotice({ tone: "danger", copy: error instanceof Error ? `Import failed: ${error.message}` : copy.importFallback });
    }
  };

  const connectedCount = rows.filter((row) => !["Decision pending", "Target missing", "Merge target missing"].includes(rationalisationTarget(row, rows))).length;

  return <div className={styles.analysisStack}>
    <section className={styles.diagramTemplateHero}>
      <div><p className={styles.eyebrow}>{copy.heroEyebrow}</p><h3>{copy.heroTitle}</h3><p>{copy.heroCopy}</p></div>
      <div><Metric label={copy.primaryMetric} value={rows.length} detail={`${connectedCount} ${copy.primaryDetail}`} tone={connectedCount === rows.length ? "good" : "watch"} /><Metric label={copy.secondaryMetric} value={new Set(rows.map((row) => rationalisationTarget(row, rows)).filter((target) => !target.includes("missing") && target !== "Decision pending")).size} detail={copy.secondaryDetail} /></div>
    </section>

    <Panel title={copy.configTitle} eyebrow={copy.configEyebrow} action={<div className={styles.inlineActions}><input ref={importInput} className={styles.visuallyHidden} type="file" accept="application/json,.json" onChange={importFlow} /><ActionButton type="button" variant="ghost" disabled={readOnly} onClick={() => importInput.current?.click()}>Import</ActionButton><ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportFile, { rows })}>Export</ActionButton><ActionButton type="button" variant="primary" disabled={readOnly} onClick={addRow}>{copy.addAction}</ActionButton></div>}>
      {rows.length ? <div className={styles.diagramConfigRail}>{rows.map((row) => <article key={row.id}>
        <label><span>Source</span><input value={row.currentName} disabled={readOnly} aria-label={`Source name for ${row.currentName}`} onChange={(event) => updateRow(row.id, { currentName: event.target.value })} /></label>
        <label><span>Stage</span><select value={row.discoveryEnvironment} disabled={readOnly} aria-label={`Stage for ${row.currentName}`} onChange={(event) => updateRow(row.id, { discoveryEnvironment: event.target.value })}>{copy.stageOptions?.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label><span>Action</span><select value={row.action} disabled={readOnly} aria-label={`Action for ${row.currentName}`} onChange={(event) => updateRow(row.id, { action: event.target.value as RationalisationAction, targetEnvironment: "", mergeTargetId: "" })}><option value="Assess">{copy.actionLabels.Assess}</option><option value="Migrate">{copy.actionLabels.Migrate}</option><option value="Merge">{copy.actionLabels.Merge}</option><option value="Decommission">{copy.actionLabels.Decommission}</option></select></label>
        {row.action === "Migrate" ? <label><span>Destination</span><input value={row.targetEnvironment} disabled={readOnly} placeholder={copy.targetPlaceholder} aria-label={`Destination for ${row.currentName}`} onChange={(event) => updateRow(row.id, { targetEnvironment: event.target.value })} /></label> : row.action === "Merge" ? <label><span>Merge into</span><select value={row.mergeTargetId} disabled={readOnly} aria-label={`Merge target for ${row.currentName}`} onChange={(event) => updateRow(row.id, { mergeTargetId: event.target.value })}><option value="">{copy.mergePlaceholder}</option>{rows.filter((candidate) => candidate.id !== row.id && candidate.action !== "Decommission").map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.currentName}</option>)}</select></label> : <span className={styles.configState}>{row.action === "Decommission" ? copy.retiredState : copy.pendingState}</span>}
        <button className={styles.configRemove} type="button" disabled={readOnly} aria-label={`Remove ${row.currentName}`} onClick={() => setRows((current) => current.filter((candidate) => candidate.id !== row.id))}>×</button>
      </article>)}</div> : <EmptyState title={copy.emptyTitle} copy={copy.emptyCopy} action={!readOnly ? <ActionButton type="button" variant="primary" onClick={addRow}>{copy.addFirstAction}</ActionButton> : undefined} />}
    </Panel>

    <Panel title={copy.canvasTitle} eyebrow={copy.canvasEyebrow}><MigrationFlow key={`${mode}:${resetToken ?? 0}`} rows={rows} generic actionLabels={copy.actionLabels} retiredLabel={copy.retiredNodeLabel} emptyTitle={copy.canvasEmptyTitle} emptyCopy={copy.canvasEmptyCopy} /></Panel>
    <div className={styles.saveRail}><InlineNotice tone={notice.tone}>{readOnly ? copy.readOnlyNotice : notice.copy}</InlineNotice><ActionButton type="button" variant="primary" disabled={readOnly || !rows.length} onClick={() => setNotice({ tone: "success", copy: `${rows.length} ${copy.savedNotice}` })}>{copy.saveLabel}</ActionButton></div>
  </div>;
}

export function StructureDiagramTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = STRUCTURE_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [targets, setTargets] = useState<ProposedEnvironment[]>(() => mode === "empty" ? [] : clone(fixture.targets));
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // mode and resetToken are explicit workbench reset signals.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets(mode === "empty" ? [] : clone(fixture.targets));
    setNotice(copy.initialNotice);
  }, [copy, fixture, mode, resetToken]);

  const updateTarget = (id: string, patch: Partial<ProposedEnvironment>) => setTargets((current) => current.map((target) => target.id === id ? { ...target, ...patch } : target));
  const renameTarget = (id: string, name: string) => {
    const previous = targets.find((target) => target.id === id)?.name ?? "";
    setTargets((current) => current.map((target) => target.id === id ? { ...target, name } : { ...target, promotionTo: target.promotionTo === previous ? name : target.promotionTo, backfillFrom: target.backfillFrom === previous ? name : target.backfillFrom }));
  };
  const addTarget = () => {
    const sequence = targets.length + 1;
    setTargets((current) => [...current, { id: `structure-target-${Date.now()}`, name: `${copy.newItemName} ${sequence}`, type: copy.newItemType, workspaceCount: 1, promotionTo: "", backfillFrom: "" }]);
    setNotice({ tone: "info", copy: copy.newItemNotice });
  };
  const removeTarget = (removed: ProposedEnvironment) => setTargets((current) => current.filter((target) => target.id !== removed.id).map((target) => ({ ...target, promotionTo: target.promotionTo === removed.name ? "" : target.promotionTo, backfillFrom: target.backfillFrom === removed.name ? "" : target.backfillFrom })));
  const importStructure = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text()) as { proposedEnvironments?: ProposedEnvironment[]; targets?: ProposedEnvironment[] } | ProposedEnvironment[];
      const imported = Array.isArray(payload) ? payload : payload.proposedEnvironments ?? payload.targets;
      if (!Array.isArray(imported)) throw new Error(copy.importShapeError);
      setTargets(imported.map((target, index) => ({ ...target, id: target.id || `structure-import-${index + 1}`, workspaceCount: Math.max(0, Number(target.workspaceCount) || 0) })));
      setNotice({ tone: "success", copy: `${imported.length} ${copy.importNoun} imported. ${copy.importSuccessSuffix}` });
    } catch (error) {
      setNotice({ tone: "danger", copy: error instanceof Error ? `Import failed: ${error.message}` : copy.importFallback });
    }
  };

  return <div className={styles.analysisStack}>
    <section className={styles.diagramTemplateHero}>
      <div><p className={styles.eyebrow}>{copy.heroEyebrow}</p><h3>{copy.heroTitle}</h3><p>{copy.heroCopy}</p></div>
      <div><Metric label={copy.primaryMetric} value={targets.length} detail={`${targets.filter((target) => target.promotionTo).length} ${copy.primaryDetail}`} tone={targets.length ? "good" : "watch"} /><Metric label={copy.secondaryMetric} value={targets.reduce((total, target) => total + target.workspaceCount, 0)} detail={copy.secondaryDetail} /></div>
    </section>

    <Panel title={copy.configTitle} eyebrow={copy.configEyebrow} action={<div className={styles.inlineActions}><input ref={importInput} className={styles.visuallyHidden} type="file" accept="application/json,.json" onChange={importStructure} /><ActionButton type="button" variant="ghost" disabled={readOnly} onClick={() => importInput.current?.click()}>Import</ActionButton><ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportFile, { groups: targets })}>Export</ActionButton><ActionButton type="button" variant="primary" disabled={readOnly} onClick={addTarget}>{copy.addAction}</ActionButton></div>}>
      {targets.length ? <div className={`${styles.diagramConfigRail} ${styles.structureConfigRail}`}>{targets.map((target) => <article key={target.id}>
        <label><span>Group</span><input value={target.name} disabled={readOnly} aria-label={`Name for ${target.name}`} onChange={(event) => renameTarget(target.id, event.target.value)} /></label>
        <label><span>Type</span><select value={target.type} disabled={readOnly} aria-label={`Type for ${target.name}`} onChange={(event) => updateTarget(target.id, { type: event.target.value })}><option>Input group</option><option>Process group</option><option>Decision group</option><option>Output group</option><option>Shared group</option></select></label>
        <label><span>Items</span><input type="number" min="0" value={target.workspaceCount} disabled={readOnly} aria-label={`Item count for ${target.name}`} onChange={(event) => updateTarget(target.id, { workspaceCount: Math.max(0, event.target.valueAsNumber || 0) })} /></label>
        <label><span>Links to</span><select value={target.promotionTo} disabled={readOnly} aria-label={`Link target for ${target.name}`} onChange={(event) => updateTarget(target.id, { promotionTo: event.target.value })}><option value="">End of path</option>{targets.filter((candidate) => candidate.id !== target.id).map((candidate) => <option value={candidate.name} key={candidate.id}>{candidate.name}</option>)}</select></label>
        <button className={styles.configRemove} type="button" disabled={readOnly} aria-label={`Remove ${target.name}`} onClick={() => removeTarget(target)}>×</button>
      </article>)}</div> : <EmptyState title={copy.emptyTitle} copy={copy.emptyCopy} action={!readOnly ? <ActionButton type="button" variant="primary" onClick={addTarget}>{copy.addFirstAction}</ActionButton> : undefined} />}
    </Panel>

    <Panel title={copy.canvasTitle} eyebrow={copy.canvasEyebrow}><TopologyStructure key={`${mode}:${resetToken ?? 0}`} targets={targets} generic emptyTitle={copy.canvasEmptyTitle} emptyCopy={copy.canvasEmptyCopy} /></Panel>
    <div className={styles.saveRail}><InlineNotice tone={notice.tone}>{readOnly ? copy.readOnlyNotice : notice.copy}</InlineNotice><ActionButton type="button" variant="primary" disabled={readOnly || !targets.length} onClick={() => setNotice({ tone: "success", copy: `${targets.length} ${copy.savedNotice}` })}>{copy.saveLabel}</ActionButton></div>
  </div>;
}

function MigrationFlow({ rows, generic = false, actionLabels, retiredLabel = "Retired", emptyTitle, emptyCopy }: { rows: RationalisationRow[]; generic?: boolean; actionLabels?: Record<RationalisationAction, string>; retiredLabel?: string; emptyTitle?: string; emptyCopy?: string }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);
  if (!rows.length) return <EmptyState title={emptyTitle ?? "No flow to display"} copy={emptyCopy ?? (generic ? "Paths appear as soon as source decisions are added." : "Migration paths appear as soon as source environment decisions are added.")} />;
  const sourceNodes = rows.map((row, index) => ({ id: `source:${row.id}`, row, x: 36, y: 72 + index * 92, width: 225, height: 66 }));
  const displayTarget = (name: string) => name === "Retired" ? retiredLabel : name;
  const targetNames = Array.from(new Set(rows.map((row) => rationalisationTarget(row, rows)).filter((name) => name !== "Decision pending" && name !== "Target missing" && name !== "Merge target missing").map(displayTarget)));
  const targetNodes = targetNames.map((name, index) => ({ id: `target:${name}`, name, x: 585, y: 72 + index * Math.max(92, (rows.length * 92) / Math.max(1, targetNames.length)), width: 205, height: 66 }));
  const targetByName = new Map(targetNodes.map((node) => [node.name, node]));
  const edges = sourceNodes.flatMap((source) => {
    const target = targetByName.get(displayTarget(rationalisationTarget(source.row, rows)));
    return target ? [{ id: `${source.id}->${target.id}`, source, target, action: source.row.action }] : [];
  });
  const height = Math.max(355, 150 + Math.max(sourceNodes.length, targetNodes.length) * 92);
  const connected = new Set<string>();
  if (selectedNode) {
    connected.add(selectedNode);
    edges.forEach((edge) => {
      if (edge.source.id === selectedNode || edge.target.id === selectedNode) {
        connected.add(edge.source.id);
        connected.add(edge.target.id);
      }
    });
  }
  const suppressed = (id: string) => edges.some((edge) => (edge.source.id === id && collapsedNodes.includes(edge.target.id)) || (edge.target.id === id && collapsedNodes.includes(edge.source.id)));
  const toggleCollapse = (id: string) => setCollapsedNodes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectedSource = sourceNodes.find((node) => node.id === selectedNode);
  const selectedTarget = targetNodes.find((node) => node.id === selectedNode);
  const selectionTitle = selectedSource?.row.currentName ?? selectedTarget?.name;
  const actionLabel: Record<RationalisationAction, string> = actionLabels ?? (generic ? { Assess:"Pending", Migrate:"Route", Merge:"Merge", Decommission:"Retire" } : { Assess:"Assess", Migrate:"Migrate", Merge:"Merge", Decommission:"Decommission" });
  const selectionDetail = selectedSource ? `${selectedSource.row.discoveryEnvironment} · ${actionLabel[selectedSource.row.action]} · ${displayTarget(rationalisationTarget(selectedSource.row, rows))}` : selectedTarget ? `${edges.filter((edge) => edge.target.id === selectedTarget.id).length} incoming ${generic ? "paths" : "migration decisions"}` : "";

  const handleNodeKey = (event: React.KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedNode((current) => current === id ? null : id); }
    if (event.key === "Escape") setSelectedNode(null);
  };

  return <div className={styles.interactiveTopology}>
    <div className={styles.topologySummary}><span><strong>{sourceNodes.length}</strong> {generic ? "sources" : "current"}</span><span><strong>{targetNodes.length}</strong> {generic ? "targets" : "future"}</span><span><strong>{edges.filter((edge) => edge.action === "Merge").length}</strong> merge mapped</span></div>
    <div className={styles.topologyLegend}><span><i data-line="migrate" />{actionLabel.Migrate}</span><span><i data-line="merge" />{actionLabel.Merge}</span><span><i data-line="decommission" />{actionLabel.Decommission}</span><small>Click to focus · double-click to collapse connections</small></div>
    {selectedNode && <aside className={styles.topologySelection}><div><small>Selected node</small><strong>{selectionTitle}</strong><span>{selectionDetail}</span></div><button type="button" aria-label="Clear diagram selection" onClick={() => setSelectedNode(null)}>×</button></aside>}
    <div className={styles.topologyCanvasScroll}>
      <svg className={styles.migrationSvg} viewBox={`0 0 830 ${height}`} role="img" aria-label={generic ? "Source-to-target decision flow" : "Current to proposed environment migration flow"} onClick={() => setSelectedNode(null)}>
        <defs><marker id="analysisMigrationArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" /></marker></defs>
        <g className={styles.diagramColumns}><text x="36" y="38">{generic ? "SOURCE NODES" : "CURRENT ESTATE"}</text><text x="585" y="38">{generic ? "TARGET NODES" : "PROPOSED ESTATE"}</text><line x1="420" y1="45" x2="420" y2={height - 34} /></g>
        <g className={styles.migrationEdges}>{edges.map((edge, index) => {
          const hidden = collapsedNodes.includes(edge.source.id) || collapsedNodes.includes(edge.target.id);
          const active = !selectedNode || (edge.source.id === selectedNode || edge.target.id === selectedNode);
          const sourceX = edge.source.x + edge.source.width;
          const sourceY = edge.source.y + edge.source.height / 2;
          const targetY = edge.target.y + edge.target.height / 2;
          return <path key={edge.id} d={`M ${sourceX} ${sourceY} C ${sourceX + 150 + index * 4} ${sourceY}, ${edge.target.x - 150 - index * 4} ${targetY}, ${edge.target.x} ${targetY}`} data-action={edge.action.toLowerCase()} data-active={active} data-hidden={hidden} markerEnd="url(#analysisMigrationArrow)" />;
        })}</g>
        <g>{sourceNodes.map((node) => <g key={node.id} className={styles.migrationNode} data-kind="source" data-active={!selectedNode || connected.has(node.id)} data-focused={selectedNode === node.id} data-hidden={suppressed(node.id)} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} aria-label={`${node.row.currentName}, ${actionLabel[node.row.action]}`} onClick={(event) => { event.stopPropagation(); setSelectedNode((current) => current === node.id ? null : node.id); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse(node.id); }} onKeyDown={(event) => handleNodeKey(event, node.id)}>
          <rect width={node.width} height={node.height} rx="9" /><rect className={styles.nodeAccent} width="5" height={node.height} rx="3" /><text className={styles.nodeTitle} x="17" y="25">{node.row.currentName.slice(0, 30)}</text><text className={styles.nodeSubtitle} x="17" y="43">{node.row.discoveryEnvironment}</text><text className={styles.nodeMeta} x="17" y="57">{actionLabel[node.row.action]}</text>
        </g>)}</g>
        <g>{targetNodes.map((node) => <g key={node.id} className={styles.migrationNode} data-kind={node.name === retiredLabel ? "retired" : "target"} data-active={!selectedNode || connected.has(node.id)} data-focused={selectedNode === node.id} data-hidden={suppressed(node.id)} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} aria-label={`${node.name}, ${edges.filter((edge) => edge.target.id === node.id).length} incoming`} onClick={(event) => { event.stopPropagation(); setSelectedNode((current) => current === node.id ? null : node.id); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse(node.id); }} onKeyDown={(event) => handleNodeKey(event, node.id)}>
          <rect width={node.width} height={node.height} rx="9" /><rect className={styles.nodeAccent} width="5" height={node.height} rx="3" /><text className={styles.nodeTitle} x={node.width / 2} y="27" textAnchor="middle">{node.name.slice(0, 27)}</text><text className={styles.nodeSubtitle} x={node.width / 2} y="47" textAnchor="middle">{edges.filter((edge) => edge.target.id === node.id).length} incoming</text>
        </g>)}</g>
      </svg>
    </div>
  </div>;
}

function TopologyStructure({ targets, generic = false, emptyTitle, emptyCopy }: { targets: ProposedEnvironment[]; generic?: boolean; emptyTitle?: string; emptyCopy?: string }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<string[]>([]);
  if (!targets.length) return <EmptyState title={emptyTitle ?? "No structure to display"} copy={emptyCopy ?? (generic ? "Add groups to render the hierarchy and directional links." : "Add proposed environments to render the promotion and backfill structure.")} />;
  const environmentNodes = targets.reduce<Array<{ id: string; target: ProposedEnvironment; x: number; y: number; width: number; height: number }>>((nodes, target) => {
    const previous = nodes.at(-1);
    const y = previous ? previous.y + previous.height + 42 : 62;
    return [...nodes, { id: `environment:${target.id}`, target, x: 370, y, width: 210, height: Math.max(66, 34 + target.workspaceCount * 42) }];
  }, []);
  const workspaceRows = environmentNodes.flatMap((environment) => Array.from({ length: Math.max(0, environment.target.workspaceCount) }, (_, workspaceIndex) => ({ id: `workspace:${environment.target.id}:${workspaceIndex}`, environmentId: environment.id, label: `${environment.target.name} ${workspaceIndex + 1}`, x: 650, y: environment.y + 17 + workspaceIndex * 42 })));
  const finalEnvironment = environmentNodes.at(-1);
  const height = Math.max(350, finalEnvironment ? finalEnvironment.y + finalEnvironment.height + 66 : 350);
  const structuralEdges = [
    { source: "account", target: "governance", kind: "account" },
    ...environmentNodes.map((node) => ({ source: "governance", target: node.id, kind: "environment" })),
    ...workspaceRows.map((workspace) => ({ source: workspace.environmentId, target: workspace.id, kind: "workspace" })),
  ];
  const promotionEdges = targets.flatMap((target) => target.promotionTo ? [{ source: `environment:${target.id}`, target: environmentNodes.find((node) => node.target.name === target.promotionTo)?.id ?? "", kind: "promotion" }] : []).filter((edge) => edge.target);
  const connected = new Set<string>();
  if (selectedNode) {
    connected.add(selectedNode);
    [...structuralEdges, ...promotionEdges].forEach((edge) => {
      if (edge.source === selectedNode || edge.target === selectedNode) { connected.add(edge.source); connected.add(edge.target); }
    });
  }
  const toggleCollapse = (id: string) => setCollapsedNodes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const hiddenByCollapse = (id: string) => structuralEdges.some((edge) => edge.target === id && collapsedNodes.includes(edge.source));
  const selectedEnvironment = environmentNodes.find((node) => node.id === selectedNode);
  const selectedWorkspace = workspaceRows.find((node) => node.id === selectedNode);
  const selectionTitle = selectedNode === "account" ? (generic ? "Diagram root" : "Target account") : selectedNode === "governance" ? (generic ? "Shared rules" : "Shared governance") : selectedEnvironment?.target.name ?? selectedWorkspace?.label;
  const selectionDetail = selectedEnvironment ? `${selectedEnvironment.target.type} · ${selectedEnvironment.target.workspaceCount} ${generic ? "items · links" : "workspaces · promotes"} to ${selectedEnvironment.target.promotionTo || "end of path"}` : selectedWorkspace ? `${generic ? "Item" : "Workspace"} in ${environmentNodes.find((node) => node.id === selectedWorkspace.environmentId)?.target.name}` : selectedNode === "account" ? `${targets.length} target ${generic ? "groups" : "environments"}` : selectedNode === "governance" ? (generic ? "Shared rules and relationship boundary" : "Shared identity, policy and catalog boundary") : "";
  const nodeState = (id: string) => ({ "data-active": !selectedNode || connected.has(id), "data-focused": selectedNode === id, "data-hidden": hiddenByCollapse(id) });
  const selectWithKeyboard = (event: React.KeyboardEvent<SVGGElement>, id: string) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedNode((current) => current === id ? null : id); } if (event.key === "Escape") setSelectedNode(null); };

  return <div className={styles.interactiveTopology}>
    <div className={styles.topologySummary}><span><strong>1</strong> {generic ? "root" : "account"}</span><span><strong>{targets.length}</strong> {generic ? "groups" : "environments"}</span><span><strong>{workspaceRows.length}</strong> {generic ? "items" : "workspaces"}</span></div>
    <div className={styles.topologyLegend}><span><i data-line="structure" />Structure</span><span><i data-line="promotion" />{generic ? "Directional link" : "Promotion"}</span><small>Click to focus · double-click to collapse children</small></div>
    {selectedNode && <aside className={styles.topologySelection}><div><small>Selected node</small><strong>{selectionTitle}</strong><span>{selectionDetail}</span></div><button type="button" aria-label="Clear diagram selection" onClick={() => setSelectedNode(null)}>×</button></aside>}
    <div className={styles.topologyCanvasScroll}><svg className={styles.structureSvg} viewBox={`0 0 900 ${height}`} role="img" aria-label={generic ? "Root, group and item structure" : "Target account, environment and workspace structure"} onClick={() => setSelectedNode(null)}>
      <defs><marker id="analysisStructureArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" /></marker></defs>
      <g className={styles.diagramColumns}><text x="36" y="34">{generic ? "ROOT" : "ACCOUNT"}</text><text x="190" y="34">{generic ? "RULES" : "GOVERNANCE"}</text><text x="370" y="34">{generic ? "GROUPS" : "ENVIRONMENTS"}</text><text x="650" y="34">{generic ? "ITEMS" : "WORKSPACES"}</text></g>
      <g className={styles.structureEdges}>
        <path d={`M 146 ${height / 2} C 168 ${height / 2}, 174 ${height / 2}, 195 ${height / 2}`} data-active={!selectedNode || connected.has("account") || connected.has("governance")} data-hidden={collapsedNodes.includes("account")} markerEnd="url(#analysisStructureArrow)" />
        {environmentNodes.map((node) => <path key={`governance-${node.id}`} d={`M 315 ${height / 2} C 340 ${height / 2}, 340 ${node.y + 33}, ${node.x} ${node.y + 33}`} data-active={!selectedNode || (connected.has("governance") && connected.has(node.id))} data-hidden={collapsedNodes.includes("governance")} markerEnd="url(#analysisStructureArrow)" />)}
        {workspaceRows.map((workspace) => <path key={`${workspace.environmentId}-${workspace.id}`} d={`M 580 ${environmentNodes.find((node) => node.id === workspace.environmentId)!.y + 33} C 610 ${environmentNodes.find((node) => node.id === workspace.environmentId)!.y + 33}, 610 ${workspace.y + 15}, ${workspace.x} ${workspace.y + 15}`} data-active={!selectedNode || (connected.has(workspace.environmentId) && connected.has(workspace.id))} data-hidden={collapsedNodes.includes(workspace.environmentId) || collapsedNodes.includes("governance")} markerEnd="url(#analysisStructureArrow)" />)}
        {promotionEdges.map((edge) => { const from = environmentNodes.find((node) => node.id === edge.source)!; const to = environmentNodes.find((node) => node.id === edge.target)!; return <path key={`${edge.source}-${edge.target}`} className={styles.promotionEdge} d={`M ${from.x + 105} ${from.y + from.height} C ${from.x + 105} ${from.y + from.height + 24}, ${to.x + 105} ${to.y - 24}, ${to.x + 105} ${to.y}`} data-active={!selectedNode || (connected.has(edge.source) && connected.has(edge.target))} data-hidden={collapsedNodes.includes(edge.source) || collapsedNodes.includes(edge.target)} markerEnd="url(#analysisStructureArrow)" />; })}
      </g>
      <g className={styles.structureNodes}>
        <g className={styles.structureNode} data-kind="account" {...nodeState("account")} transform={`translate(36 ${height / 2 - 32})`} role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedNode("account"); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse("account"); }} onKeyDown={(event) => selectWithKeyboard(event, "account")}><rect width="110" height="64" rx="10" /><text className={styles.nodeTitle} x="55" y="27" textAnchor="middle">{generic ? "Root" : "Account"}</text><text className={styles.nodeSubtitle} x="55" y="46" textAnchor="middle">{generic ? "Diagram" : "Target estate"}</text></g>
        <g className={styles.structureNode} data-kind="governance" {...nodeState("governance")} transform={`translate(195 ${height / 2 - 37})`} role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedNode("governance"); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse("governance"); }} onKeyDown={(event) => selectWithKeyboard(event, "governance")}><rect width="120" height="74" rx="10" /><text className={styles.nodeTitle} x="60" y="29" textAnchor="middle">{generic ? "Rules" : "Governance"}</text><text className={styles.nodeSubtitle} x="60" y="49" textAnchor="middle">{generic ? "Shared logic" : "Shared policy"}</text></g>
        {environmentNodes.map((node) => <g key={node.id} className={styles.structureNode} data-kind="environment" {...nodeState(node.id)} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedNode((current) => current === node.id ? null : node.id); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse(node.id); }} onKeyDown={(event) => selectWithKeyboard(event, node.id)}><rect width={node.width} height={node.height} rx="11" /><rect className={styles.nodeAccent} width="5" height={node.height} rx="3" /><text className={styles.nodeTitle} x="17" y="25">{node.target.name.slice(0, 27)}</text><text className={styles.nodeSubtitle} x="17" y="44">{node.target.type}</text><text className={styles.nodeMeta} x="17" y="59">{node.target.workspaceCount} {generic ? "items" : "workspaces"}</text></g>)}
        {workspaceRows.map((workspace) => <g key={workspace.id} className={styles.structureNode} data-kind="workspace" {...nodeState(workspace.id)} transform={`translate(${workspace.x} ${workspace.y})`} role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); setSelectedNode((current) => current === workspace.id ? null : workspace.id); }} onDoubleClick={(event) => { event.stopPropagation(); toggleCollapse(workspace.id); }} onKeyDown={(event) => selectWithKeyboard(event, workspace.id)}><rect width="190" height="31" rx="8" /><text className={styles.nodeSubtitle} x="14" y="20">{workspace.label.slice(0, 29)}</text></g>)}
      </g>
    </svg></div>
  </div>;
}

/* -------------------------------------------------------------------------- */
/* Environment evidence matrix                                                */
/* -------------------------------------------------------------------------- */

type EvidenceStatus = "Missing" | "Required" | "Optional" | "Partial" | "Submitted" | "Reviewed" | "Confirmed" | "Not applicable";

interface EvidenceEnvironment { id: string; name: string; owner: string }
interface EvidenceItem { id: string; group: string; label: string; required: boolean; statuses: Record<string, EvidenceStatus>; task: string }

const EVIDENCE_ENVIRONMENTS: EvidenceEnvironment[] = [
  { id: "environment-prod", name: "Production", owner: "Platform owner" },
  { id: "environment-test", name: "Test", owner: "Quality lead" },
  { id: "environment-dev", name: "Development", owner: "Engineering lead" },
];

const INITIAL_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: "resource-inventory", group: "Technical inventory", label: "Resource and workspace inventory", required: true, task: "Upload metadata inventory", statuses: { "environment-prod": "Reviewed", "environment-test": "Submitted", "environment-dev": "Missing" } },
  { id: "orchestration-profile", group: "Technical inventory", label: "Orchestration profile", required: true, task: "Run orchestration profiler", statuses: { "environment-prod": "Reviewed", "environment-test": "Partial", "environment-dev": "Not applicable" } },
  { id: "access-confirmation", group: "Access", label: "Workspace access confirmation", required: true, task: "Complete access confirmation", statuses: { "environment-prod": "Confirmed", "environment-test": "Confirmed", "environment-dev": "Partial" } },
  { id: "network-evidence", group: "Access", label: "Connectivity evidence", required: true, task: "Attach connectivity test", statuses: { "environment-prod": "Submitted", "environment-test": "Missing", "environment-dev": "Missing" } },
  { id: "operating-notes", group: "Ways of working", label: "Operating model notes", required: false, task: "Add operating model notes", statuses: { "environment-prod": "Reviewed", "environment-test": "Optional", "environment-dev": "Optional" } },
  { id: "freeze-calendar", group: "Ways of working", label: "Change and freeze calendar", required: true, task: "Confirm change calendar", statuses: { "environment-prod": "Partial", "environment-test": "Submitted", "environment-dev": "Submitted" } },
];

const DCC_EVIDENCE_ENVIRONMENTS: EvidenceEnvironment[] = [
  { id: "document-solution", name: "Solution design v0.8", owner: "Solution architecture" },
  { id: "document-threat", name: "Threat model v0.4", owner: "Cyber security" },
  { id: "document-accessibility", name: "Accessibility statement", owner: "Experience team" },
];

const DCC_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: "iso-ownership", group: "ISO/IEC 27001", label: "Security roles and responsibilities", required: true, task: "Name the accountable security owner", statuses: { "document-solution": "Partial", "document-threat": "Reviewed", "document-accessibility": "Not applicable" } },
  { id: "wcag-contrast", group: "WCAG 2.2 AA", label: "Minimum text contrast evidence", required: true, task: "Attach contrast test evidence", statuses: { "document-solution": "Missing", "document-threat": "Not applicable", "document-accessibility": "Partial" } },
  { id: "gds-user-needs", group: "GDS Service Standard", label: "User needs and service outcomes", required: true, task: "Link user-needs evidence", statuses: { "document-solution": "Submitted", "document-threat": "Optional", "document-accessibility": "Reviewed" } },
  { id: "nist-human-review", group: "NIST AI RMF", label: "Named human assurance decision", required: true, task: "Confirm the human escalation route", statuses: { "document-solution": "Confirmed", "document-threat": "Submitted", "document-accessibility": "Required" } },
  { id: "dcc-source-links", group: "DCC HACK-01", label: "Every finding retains a source link", required: true, task: "Link missing source excerpts", statuses: { "document-solution": "Confirmed", "document-threat": "Partial", "document-accessibility": "Missing" } },
  { id: "dcc-recovery", group: "DCC HACK-01", label: "Recovery controls have supporting evidence", required: true, task: "Attach recovery control evidence", statuses: { "document-solution": "Missing", "document-threat": "Partial", "document-accessibility": "Not applicable" } },
];

type EvidenceCopy = {
  initialNotice: Notice;
  matrixEmptyTitle: string;
  matrixEmptyCopy: string;
  matrixEyebrow: string;
  matrixTitle: string;
  matrixCopy: string;
  progressLabel: string;
  gapNoun: string;
  matrixPanelTitle: string;
  requirementNoun: string;
  columnNoun: string;
  matrixAriaLabel: string;
  exportMatrixFile: string;
  matrixReadOnlyNotice: string;
  matrixTaskLabel: string;
  taskContextRequired: string;
  taskContextOptional: string;
  ownerLabel: string;
  taskEmptyTitle: string;
  taskEmptyCopy: string;
  taskEyebrow: string;
  taskTitle: string;
  taskCopy: string;
  taskProgressLabel: string;
  taskPanelTitle: string;
  filterLabel: string;
  exportTasksFile: string;
  partialTaskCopy: string;
  missingTaskCopy: string;
  taskCompleteTitle: string;
  taskCompleteCopy: string;
  taskReadOnlyNotice: string;
};

const EVIDENCE_FIXTURES: Record<AnalysisScenarioId, { environments: EvidenceEnvironment[]; items: EvidenceItem[]; copy: EvidenceCopy }> = {
  base: {
    environments: EVIDENCE_ENVIRONMENTS,
    items: INITIAL_EVIDENCE_ITEMS,
    copy: { initialNotice: defaultNotice, matrixEmptyTitle: "No evidence rules configured", matrixEmptyCopy: "Add environments and evidence requirements to generate the standalone coverage matrix.", matrixEyebrow: "Reusable evidence matrix", matrixTitle: "Evidence by environment", matrixCopy: "Inspect any cell, review its requirement and update the status through a local adapter.", progressLabel: "Overall evidence", gapNoun: "evidence gaps remain", matrixPanelTitle: "Evidence matrix", requirementNoun: "requirements", columnNoun: "environments", matrixAriaLabel: "Evidence status by environment", exportMatrixFile: "evidence-matrix-template.json", matrixReadOnlyNotice: "Read-only view: matrix filtering and cell inspection remain available; updates are locked.", matrixTaskLabel: "Collection task", taskContextRequired: "This evidence is required for the environment assessment.", taskContextOptional: "This evidence is optional but may improve confidence.", ownerLabel: "Environment owner", taskEmptyTitle: "No collection tasks", taskEmptyCopy: "Missing, required and partial evidence statuses become standalone collection tasks here.", taskEyebrow: "Reusable collection queue", taskTitle: "Environment evidence tasks", taskCopy: "Work missing and partial evidence as an independent task list, without the matrix screen.", taskProgressLabel: "Evidence completion", taskPanelTitle: "Collection task list", filterLabel: "Environment", exportTasksFile: "evidence-task-list-template.json", partialTaskCopy: "Some evidence is present; complete the remaining inputs.", missingTaskCopy: "Required evidence has not yet been submitted.", taskCompleteTitle: "Collection complete", taskCompleteCopy: "No missing or partial evidence tasks remain in the current scope.", taskReadOnlyNotice: "Read-only view: task filtering and inspection remain available; completion actions are locked." },
  },
  "dcc-hackathon": {
    environments: DCC_EVIDENCE_ENVIRONMENTS,
    items: DCC_EVIDENCE_ITEMS,
    copy: { initialNotice: { tone: "info", copy: "DCC requirement-to-document evidence loaded. Changes remain inside this preview." }, matrixEmptyTitle: "No assurance evidence rules configured", matrixEmptyCopy: "Select standards and uploaded documents to generate the requirement-to-evidence coverage matrix.", matrixEyebrow: "Documentation assurance coverage", matrixTitle: "Evidence by uploaded document", matrixCopy: "Inspect any requirement-to-document cell, review its source evidence and update the assurance status.", progressLabel: "Overall evidence coverage", gapNoun: "assurance evidence gaps remain", matrixPanelTitle: "Standards evidence matrix", requirementNoun: "standard requirements", columnNoun: "documents", matrixAriaLabel: "Assurance evidence status by uploaded document", exportMatrixFile: "dcc-assurance-evidence-matrix.json", matrixReadOnlyNotice: "Read-only view: assurance-matrix filtering and evidence inspection remain available; updates are locked.", matrixTaskLabel: "Assurance evidence task", taskContextRequired: "This source evidence is required for the documentation assurance decision.", taskContextOptional: "This source evidence is optional but may improve assurance confidence.", ownerLabel: "Document owner", taskEmptyTitle: "No assurance evidence tasks", taskEmptyCopy: "Missing, required and partial requirement evidence becomes an accountable task here.", taskEyebrow: "Assurance evidence collection", taskTitle: "Documentation evidence tasks", taskCopy: "Work through missing and partial source evidence before the human assurance decision.", taskProgressLabel: "Assurance evidence completion", taskPanelTitle: "Assurance evidence task list", filterLabel: "Document", exportTasksFile: "dcc-assurance-evidence-tasks.json", partialTaskCopy: "Some source evidence is present; complete the remaining requirement links.", missingTaskCopy: "Required source evidence has not yet been submitted.", taskCompleteTitle: "Assurance evidence complete", taskCompleteCopy: "No missing or partial requirement-evidence tasks remain in the current assurance scope.", taskReadOnlyNotice: "Read-only view: evidence-task filtering and inspection remain available; completion actions are locked." },
  },
};

function evidenceCompletion(status: EvidenceStatus) {
  if (["Submitted", "Reviewed", "Confirmed", "Not applicable", "Optional"].includes(status)) return 1;
  if (status === "Partial") return 0.5;
  return 0;
}

function evidenceProgress(items: EvidenceItem[], environmentId?: string) {
  const statuses = items.flatMap((item) => environmentId ? [item.statuses[environmentId]] : Object.values(item.statuses));
  if (!statuses.length) return 0;
  return Math.round(statuses.reduce((total, status) => total + evidenceCompletion(status), 0) / statuses.length * 100);
}

interface EvidenceTask {
  id: string;
  itemId: string;
  environmentId: string;
  environment: string;
  owner: string;
  label: string;
  evidenceLabel: string;
  status: EvidenceStatus;
}

function getEvidenceTasks(items: EvidenceItem[], environments: EvidenceEnvironment[]): EvidenceTask[] {
  return items.flatMap((item) => environments.flatMap((environment) => {
    const status = item.statuses[environment.id];
    return ["Missing", "Required", "Partial"].includes(status) ? [{ id: `${item.id}:${environment.id}`, itemId: item.id, environmentId: environment.id, environment: environment.name, owner: environment.owner, label: item.task, evidenceLabel: item.label, status }] : [];
  }));
}

export function EvidenceMatrixTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = EVIDENCE_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const environments = fixture.environments;
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [items, setItems] = useState<EvidenceItem[]>(() => clone(fixture.items));
  const [statusFilter, setStatusFilter] = useState<"All" | "Needs evidence" | "Ready">("All");
  const [selectedCell, setSelectedCell] = useState<{ itemId: string; environmentId: string } | null>(null);
  const [draftStatus, setDraftStatus] = useState<EvidenceStatus>("Missing");
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);
  const closeCell = useCallback(() => setSelectedCell(null), []);

  useEffect(() => {
    // resetToken is the explicit workbench reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(clone(fixture.items));
    setStatusFilter("All");
    setSelectedCell(null);
    setDraftStatus("Missing");
    setNotice(copy.initialNotice);
  }, [copy, fixture, resetToken]);

  if (mode === "empty") return <EmptyState title={copy.matrixEmptyTitle} copy={copy.matrixEmptyCopy} />;

  const tasks = getEvidenceTasks(items, environments);
  const filteredItems = items.filter((item) => statusFilter === "All" || environments.some((environment) => statusFilter === "Needs evidence" ? ["Missing", "Required", "Partial"].includes(item.statuses[environment.id]) : evidenceCompletion(item.statuses[environment.id]) === 1));
  const selectedItem = items.find((item) => item.id === selectedCell?.itemId);
  const selectedEnvironment = environments.find((environment) => environment.id === selectedCell?.environmentId);
  const openCell = (item: EvidenceItem, environment: EvidenceEnvironment) => {
    setSelectedCell({ itemId: item.id, environmentId: environment.id });
    setDraftStatus(item.statuses[environment.id]);
    setNotice({ tone: "info", copy: `${item.label} selected for ${environment.name}.` });
  };
  const saveCell = () => {
    if (!selectedCell || readOnly) return;
    setItems((current) => current.map((item) => item.id === selectedCell.itemId ? { ...item, statuses: { ...item.statuses, [selectedCell.environmentId]: draftStatus } } : item));
    setNotice({ tone: "success", copy: `Evidence status saved as ${draftStatus.toLowerCase()}; coverage totals were recalculated.` });
    closeCell();
  };

  return <div className={styles.analysisStack}>
    <section className={styles.evidenceHero}>
      <div><p className={styles.eyebrow}>{copy.matrixEyebrow}</p><h3>{copy.matrixTitle}</h3><p>{copy.matrixCopy}</p></div>
      <div><ProgressBar label={copy.progressLabel} value={evidenceProgress(items)} /><span>{tasks.length} {copy.gapNoun}</span></div>
    </section>
    <div className={styles.environmentProgress}>{environments.map((environment) => <article key={environment.id}><header><div><small>{environment.owner}</small><strong>{environment.name}</strong></div><Badge>{evidenceProgress(items, environment.id)}%</Badge></header><ProgressBar label="Coverage" value={evidenceProgress(items, environment.id)} /></article>)}</div>
    <Panel title={copy.matrixPanelTitle} eyebrow={`${items.length} ${copy.requirementNoun} × ${environments.length} ${copy.columnNoun}`} action={<div className={styles.inlineActions}><Segmented value={statusFilter} label="Filter evidence rows" options={[{ value: "All", label: "All" }, { value: "Needs evidence", label: "Needs evidence" }, { value: "Ready", label: "Ready" }]} onChange={setStatusFilter} /><ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportMatrixFile, { environments, items })}>Export</ActionButton></div>}>
      <div className={styles.matrixLegend}><span><i data-status="reviewed" />Ready</span><span><i data-status="partial" />Partial</span><span><i data-status="missing" />Missing</span><span><i data-status="optional" />Optional / N/A</span></div>
      <div className={styles.matrixScroller}><div className={styles.evidenceMatrix} role="table" aria-label={copy.matrixAriaLabel}>
        <div className={styles.matrixHead} role="row"><strong role="columnheader">Evidence requirement</strong>{environments.map((environment) => <strong role="columnheader" key={environment.id}>{environment.name}<small>{evidenceProgress(items, environment.id)}% complete</small></strong>)}</div>
        {Array.from(new Set(filteredItems.map((item) => item.group))).map((group) => <section key={group}><h4>{group}</h4>{filteredItems.filter((item) => item.group === group).map((item) => <div className={styles.matrixDataRow} role="row" key={item.id}><div role="rowheader"><strong>{item.label}</strong><span>{item.required ? "Required" : "Optional"}</span></div>{environments.map((environment) => { const status = item.statuses[environment.id]; return <button role="cell" type="button" key={environment.id} data-status={status.toLowerCase().replaceAll(" ", "-")} aria-label={`${item.label}, ${environment.name}: ${status}. Inspect status`} onClick={() => openCell(item, environment)}><i>{status === "Reviewed" || status === "Confirmed" ? "✓" : status === "Submitted" ? "↑" : status === "Partial" ? "◐" : status === "Missing" || status === "Required" ? "!" : "—"}</i><span>{status}</span><small>Inspect →</small></button>; })}</div>)}</section>)}
      </div></div>
    </Panel>
    <InlineNotice tone={notice.tone}>{readOnly ? copy.matrixReadOnlyNotice : notice.copy}</InlineNotice>
    {selectedCell && selectedItem && selectedEnvironment && <AccessibleModal title={selectedItem.label} description={`${selectedEnvironment.name} · ${selectedItem.group}`} onClose={closeCell} footer={<><ActionButton type="button" variant="secondary" onClick={closeCell}>{readOnly ? "Close" : "Cancel"}</ActionButton>{!readOnly && <ActionButton type="button" variant="primary" onClick={saveCell}>Save status</ActionButton>}</>}>
      <div className={styles.matrixCellEditor}>
        <section><small>{copy.matrixTaskLabel}</small><strong>{selectedItem.task}</strong><p>{selectedItem.required ? copy.taskContextRequired : copy.taskContextOptional}</p></section>
        <label><span>Evidence status</span><select value={draftStatus} disabled={readOnly} onChange={(event) => setDraftStatus(event.target.value as EvidenceStatus)}>{(["Missing", "Required", "Partial", "Submitted", "Reviewed", "Confirmed", "Optional", "Not applicable"] as EvidenceStatus[]).map((status) => <option key={status}>{status}</option>)}</select></label>
        <dl><div><dt>{copy.ownerLabel}</dt><dd>{selectedEnvironment.owner}</dd></div><div><dt>Current completion</dt><dd>{Math.round(evidenceCompletion(selectedItem.statuses[selectedEnvironment.id]) * 100)}%</dd></div></dl>
      </div>
    </AccessibleModal>}
  </div>;
}

export function EvidenceTaskListTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = EVIDENCE_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const environments = fixture.environments;
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [items, setItems] = useState<EvidenceItem[]>(() => clone(fixture.items));
  const [environmentFilter, setEnvironmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);

  useEffect(() => {
    // resetToken is the explicit workbench reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(clone(fixture.items));
    setEnvironmentFilter("All");
    setStatusFilter("All");
    setSelectedTaskId("");
    setNotice(copy.initialNotice);
  }, [copy, fixture, resetToken]);

  if (mode === "empty") return <EmptyState title={copy.taskEmptyTitle} copy={copy.taskEmptyCopy} />;

  const tasks = getEvidenceTasks(items, environments);
  const visibleTasks = tasks.filter((task) => (environmentFilter === "All" || task.environment === environmentFilter) && (statusFilter === "All" || task.status === statusFilter));
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const markSubmitted = (task: EvidenceTask) => {
    if (readOnly) return;
    setItems((current) => current.map((item) => item.id === task.itemId ? { ...item, statuses: { ...item.statuses, [task.environmentId]: "Submitted" } } : item));
    setSelectedTaskId("");
    setNotice({ tone: "success", copy: `${task.label} marked submitted for ${task.environment}. The task has left the outstanding queue.` });
  };

  return <div className={styles.analysisStack}>
    <section className={styles.evidenceHero}>
      <div><p className={styles.eyebrow}>{copy.taskEyebrow}</p><h3>{copy.taskTitle}</h3><p>{copy.taskCopy}</p></div>
      <div><ProgressBar label={copy.taskProgressLabel} value={evidenceProgress(items)} /><span>{tasks.length} tasks outstanding</span></div>
    </section>
    <Panel title={copy.taskPanelTitle} eyebrow={`${visibleTasks.length} of ${tasks.length} outstanding`} action={<ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportTasksFile, tasks)}>Export tasks</ActionButton>}>
      <div className={styles.taskToolbar}>
        <label><span>{copy.filterLabel}</span><select value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}><option>All</option>{environments.map((environment) => <option key={environment.id}>{environment.name}</option>)}</select></label>
        <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Missing</option><option>Required</option><option>Partial</option></select></label>
        {(environmentFilter !== "All" || statusFilter !== "All") && <ActionButton type="button" variant="ghost" onClick={() => { setEnvironmentFilter("All"); setStatusFilter("All"); }}>Clear filters</ActionButton>}
      </div>
      {selectedTask && <div className={styles.taskInspector}><div><small>Selected task · {selectedTask.environment}</small><strong>{selectedTask.label}</strong><span>{selectedTask.evidenceLabel} · owned by {selectedTask.owner}</span></div><Badge>{selectedTask.status}</Badge><button type="button" aria-label="Clear selected task" onClick={() => setSelectedTaskId("")}>×</button></div>}
      <div className={styles.evidenceTasks}>{visibleTasks.length ? visibleTasks.map((task) => <article key={task.id} data-selected={selectedTaskId === task.id}><span data-status={task.status.toLowerCase()}>{task.status === "Partial" ? "◐" : "!"}</span><div><small>{task.environment} · {task.evidenceLabel}</small><strong>{task.label}</strong><p>{task.status === "Partial" ? copy.partialTaskCopy : copy.missingTaskCopy}</p></div><div><ActionButton type="button" variant="ghost" onClick={() => { setSelectedTaskId(task.id); setNotice({ tone: "info", copy: `${task.label} selected for ${task.environment}.` }); }}>Open task</ActionButton><ActionButton type="button" variant="primary" disabled={readOnly} onClick={() => markSubmitted(task)}>Mark submitted</ActionButton></div></article>) : <EmptyState title={tasks.length ? "No tasks match these filters" : copy.taskCompleteTitle} copy={tasks.length ? "Clear or change the filters to see other outstanding tasks." : copy.taskCompleteCopy} action={tasks.length ? <ActionButton type="button" variant="secondary" onClick={() => { setEnvironmentFilter("All"); setStatusFilter("All"); }}>Clear filters</ActionButton> : undefined} />}</div>
    </Panel>
    <InlineNotice tone={notice.tone}>{readOnly ? copy.taskReadOnlyNotice : notice.copy}</InlineNotice>
  </div>;
}

/* -------------------------------------------------------------------------- */
/* Evidence review queue                                                      */
/* -------------------------------------------------------------------------- */

type ReviewStatus = "Not reviewed" | "In review" | "Accepted" | "Question raised" | "More info needed" | "Further investigation" | "Confirmed" | "Rejected";
type Confidence = "Not set" | "Low" | "Medium" | "High";

interface ReviewArtifact {
  id: string;
  artifactType: string;
  title: string;
  version: string;
  environments: string[];
  status: ReviewStatus;
  confidence: Confidence;
  reviewer: string;
  notes: string;
  followUpQuestion: string;
  faceToFaceRequired: boolean;
  followUpDisposition: "More info needed" | "Further investigation" | "Confirmed";
  buResponse: string;
  summary: string;
}

const REVIEW_STATUSES: ReviewStatus[] = ["Not reviewed", "In review", "Accepted", "Question raised", "More info needed", "Further investigation", "Confirmed", "Rejected"];

const INITIAL_REVIEW_ITEMS: ReviewArtifact[] = [
  { id: "review-inventory", artifactType: "Upload", title: "Production resource inventory", version: "v3 · JSON", environments: ["Production"], status: "Accepted", confidence: "High", reviewer: "Review lead", notes: "Inventory structure and scope checks completed.", followUpQuestion: "", faceToFaceRequired: false, followUpDisposition: "Confirmed", buResponse: "", summary: "Structured inventory of workspaces, compute policies and governed objects." },
  { id: "review-questionnaire", artifactType: "Questionnaire", title: "Data product questionnaire", version: "Submitted response", environments: ["Production", "Test"], status: "More info needed", confidence: "Medium", reviewer: "Data analyst", notes: "The operating window needs one final confirmation.", followUpQuestion: "Confirm the protected change window and any exceptions.", faceToFaceRequired: false, followUpDisposition: "More info needed", buResponse: "The standard window is business days 1–3; exceptions require service-owner approval.", summary: "Business context, operational constraints and migration preference responses." },
  { id: "review-access", artifactType: "App artifact", title: "Environment access confirmation", version: "Current state", environments: ["Production", "Test", "Development"], status: "In review", confidence: "Medium", reviewer: "Platform engineer", notes: "Workspace checks passed; network validation is still in progress.", followUpQuestion: "", faceToFaceRequired: true, followUpDisposition: "Further investigation", buResponse: "A connectivity test has been scheduled with the platform team.", summary: "Application-generated confirmation of workspace and cloud control-plane access." },
  { id: "review-lineage", artifactType: "Profiler", title: "Orchestration lineage profile", version: "Run 04 · JSON", environments: ["Production"], status: "Question raised", confidence: "Low", reviewer: "Migration architect", notes: "One source endpoint is not represented in the supplied contract list.", followUpQuestion: "Which service owns the unidentified event-stream endpoint?", faceToFaceRequired: true, followUpDisposition: "More info needed", buResponse: "", summary: "Pipeline activities, dependencies, datasets and compute references discovered by the profiler." },
  { id: "review-operating-model", artifactType: "Document", title: "Operating model notes", version: "v1 · DOCX", environments: ["BU-wide"], status: "Not reviewed", confidence: "Not set", reviewer: "", notes: "", followUpQuestion: "", faceToFaceRequired: false, followUpDisposition: "More info needed", buResponse: "", summary: "Team ownership, service boundaries and support arrangements." },
];

const DCC_REVIEW_ITEMS: ReviewArtifact[] = [
  { id: "review-iso-owner", artifactType: "AI finding", title: "Security owner is not named", version: "Run DCC-018 · 96% match", environments: ["ISO/IEC 27001", "Solution design v0.8"], status: "More info needed", confidence: "High", reviewer: "Assurance lead", notes: "The document describes the security function but does not name the accountable role.", followUpQuestion: "Who owns the security risk decision for this service?", faceToFaceRequired: false, followUpDisposition: "More info needed", buResponse: "The service owner will be named in section 2.3 of the next version.", summary: "AI matched the ownership requirement to two passages, neither of which identifies an accountable role." },
  { id: "review-wcag-contrast", artifactType: "AI finding", title: "Contrast claim has no test evidence", version: "Run DCC-018 · 91% match", environments: ["WCAG 2.2 AA", "Accessibility statement"], status: "Question raised", confidence: "High", reviewer: "Accessibility specialist", notes: "The conformance statement claims AA but the evidence pack contains no contrast results.", followUpQuestion: "Attach the latest automated and manual contrast test results.", faceToFaceRequired: false, followUpDisposition: "More info needed", buResponse: "", summary: "The uploaded statement references colour contrast without a linked test result or exception record." },
  { id: "review-human-decision", artifactType: "AI finding", title: "Human assurance decision is defined", version: "Run DCC-018 · 88% match", environments: ["NIST AI RMF", "Solution design v0.8"], status: "Confirmed", confidence: "Medium", reviewer: "Responsible AI reviewer", notes: "The escalation path and decision owner are explicit and consistent with the selected requirement.", followUpQuestion: "", faceToFaceRequired: false, followUpDisposition: "Confirmed", buResponse: "", summary: "The design names the human decision point, responsible role and route for challenging an AI recommendation." },
  { id: "review-source-links", artifactType: "Scan output", title: "Two findings have lost source links", version: "Run DCC-018 · JSON", environments: ["DCC HACK-01", "Threat model v0.4"], status: "Further investigation", confidence: "Low", reviewer: "Evidence reviewer", notes: "Finding text is present, but the referenced source offsets do not resolve in the uploaded version.", followUpQuestion: "Can the scan be rerun against the current threat-model checksum?", faceToFaceRequired: true, followUpDisposition: "Further investigation", buResponse: "A corrected threat model has been uploaded and is ready to rescan.", summary: "Relationship validation found two findings whose citations point to an earlier document version." },
  { id: "review-assurance-report", artifactType: "Document", title: "Documentation assurance report", version: "Draft 0.3 · PDF", environments: ["All selected standards", "All uploaded documents"], status: "In review", confidence: "Medium", reviewer: "Assurance lead", notes: "Accepted findings are ready; open evidence requests must remain visible in the decision summary.", followUpQuestion: "", faceToFaceRequired: true, followUpDisposition: "Further investigation", buResponse: "", summary: "Human-readable decision report combining accepted, declined and unresolved AI findings with their source evidence." },
];

type ReviewCopy = {
  initialNotice: Notice;
  emptyTitle: string;
  emptyCopy: string;
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  reviewedLabel: string;
  followUpsLabel: string;
  conversationsLabel: string;
  panelTitle: string;
  panelNoun: string;
  exportFile: string;
  exportLabel: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  scopeFilterLabel: string;
  typeFilterLabel: string;
  noMatchingTitle: string;
  noMatchingCopy: string;
  readOnlyNotice: string;
  previewLabel: string;
  scopeLabel: string;
  responseLabel: string;
  noResponseCopy: string;
  reviewerPlaceholder: string;
  notesPlaceholder: string;
  followUpPlaceholder: string;
};

const REVIEW_FIXTURES: Record<AnalysisScenarioId, { items: ReviewArtifact[]; copy: ReviewCopy }> = {
  base: {
    items: INITIAL_REVIEW_ITEMS,
    copy: { initialNotice: defaultNotice, emptyTitle: "No evidence ready for review", emptyCopy: "Uploaded versions and application-created artifacts appear here when they are available for the selected scope.", heroEyebrow: "Document-level review", heroTitle: "Evidence review register", heroCopy: "Review uploads and application-created artifacts with traceable follow-up outcomes.", reviewedLabel: "reviewed", followUpsLabel: "follow-ups", conversationsLabel: "conversations", panelTitle: "Review queue", panelNoun: "artifacts", exportFile: "evidence-review-template.json", exportLabel: "Export register", searchAriaLabel: "Search evidence", searchPlaceholder: "Search title, owner or environment", scopeFilterLabel: "Environment", typeFilterLabel: "Artifact type", noMatchingTitle: "No matching evidence", noMatchingCopy: "Change or clear the queue filters to show other review artifacts.", readOnlyNotice: "Read-only view: filters and artifact inspection remain available; review changes are locked.", previewLabel: "Artifact preview", scopeLabel: "Scope", responseLabel: "Product-team response", noResponseCopy: "No response has been recorded for this artifact.", reviewerPlaceholder: "e.g. Review lead", notesPlaceholder: "Evidence quality, assumptions and decision rationale", followUpPlaceholder: "What does the product or delivery team need to confirm?" },
  },
  "dcc-hackathon": {
    items: DCC_REVIEW_ITEMS,
    copy: { initialNotice: { tone: "info", copy: "DCC AI findings loaded for human assurance. Review decisions remain inside this preview." }, emptyTitle: "No AI findings ready for assurance", emptyCopy: "Run uploaded documentation against selected standards to populate the human assurance queue.", heroEyebrow: "Human assurance", heroTitle: "Documentation findings register", heroCopy: "Approve, challenge or reject AI findings while retaining their standards, documents and source evidence.", reviewedLabel: "decided", followUpsLabel: "open findings", conversationsLabel: "review conversations", panelTitle: "Assurance review queue", panelNoun: "findings", exportFile: "dcc-documentation-assurance-register.json", exportLabel: "Export decisions", searchAriaLabel: "Search assurance findings", searchPlaceholder: "Search finding, reviewer, standard or document", scopeFilterLabel: "Standard or document", typeFilterLabel: "Finding type", noMatchingTitle: "No matching assurance findings", noMatchingCopy: "Change or clear the queue filters to show other standards, documents or review decisions.", readOnlyNotice: "Read-only view: finding filters and source inspection remain available; assurance decisions are locked.", previewLabel: "Finding preview", scopeLabel: "Standard / document scope", responseLabel: "Document-owner response", noResponseCopy: "No document-owner response has been recorded for this finding.", reviewerPlaceholder: "e.g. Assurance lead", notesPlaceholder: "Evidence quality, source links and assurance decision rationale", followUpPlaceholder: "What does the document owner need to confirm or evidence?" },
  },
};

interface ReviewDraft {
  status: ReviewStatus;
  confidence: Confidence;
  reviewer: string;
  notes: string;
  followUpQuestion: string;
  faceToFaceRequired: boolean;
  followUpDisposition: ReviewArtifact["followUpDisposition"];
}

function draftFromArtifact(artifact: ReviewArtifact): ReviewDraft {
  return { status: artifact.status, confidence: artifact.confidence, reviewer: artifact.reviewer, notes: artifact.notes, followUpQuestion: artifact.followUpQuestion, faceToFaceRequired: artifact.faceToFaceRequired, followUpDisposition: artifact.followUpDisposition };
}

export function EvidenceReviewTemplate({ mode, scenarioId }: TemplateProps) {
  const fixture = REVIEW_FIXTURES[scenarioId === "dcc-hackathon" ? "dcc-hackathon" : "base"];
  const copy = fixture.copy;
  const readOnly = mode === "readonly";
  const [items, setItems] = useState<ReviewArtifact[]>(() => clone(fixture.items));
  const [statusFilter, setStatusFilter] = useState("All");
  const [environmentFilter, setEnvironmentFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice>(copy.initialNotice);

  if (mode === "empty") {
    return <EmptyState title={copy.emptyTitle} copy={copy.emptyCopy} />;
  }

  const environments = Array.from(new Set(items.flatMap((item) => item.environments))).sort();
  const artifactTypes = Array.from(new Set(items.map((item) => item.artifactType))).sort();
  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesEnvironment = environmentFilter === "All" || item.environments.includes(environmentFilter);
    const matchesType = typeFilter === "All" || item.artifactType === typeFilter;
    const haystack = `${item.title} ${item.summary} ${item.reviewer} ${item.environments.join(" ")}`.toLowerCase();
    return matchesStatus && matchesEnvironment && matchesType && haystack.includes(query.toLowerCase());
  });
  const selected = items.find((item) => item.id === selectedId);
  const reviewedCount = items.filter((item) => !["Not reviewed", "In review"].includes(item.status)).length;
  const questionCount = items.filter((item) => ["Question raised", "More info needed", "Further investigation"].includes(item.status)).length;
  const faceToFaceCount = items.filter((item) => item.faceToFaceRequired).length;

  const openReview = (artifact: ReviewArtifact) => {
    setSelectedId(artifact.id);
    setDraft(draftFromArtifact(artifact));
    setErrors({});
  };

  const closeReview = () => {
    setSelectedId("");
    setDraft(null);
    setErrors({});
  };

  const saveReview = () => {
    if (!selected || !draft) return;
    const nextErrors: Record<string, string> = {};
    if (draft.status !== "Not reviewed" && !draft.reviewer.trim()) nextErrors.reviewer = "Add the reviewer or reviewing role.";
    if (!["Not reviewed", "In review"].includes(draft.status) && draft.confidence === "Not set") nextErrors.confidence = "Choose a confidence level for the completed decision.";
    if (["Accepted", "Rejected", "Question raised", "More info needed", "Further investigation", "Confirmed"].includes(draft.status) && !draft.notes.trim()) nextErrors.notes = "Add review notes that explain the decision.";
    if (["Question raised", "More info needed", "Further investigation"].includes(draft.status) && !draft.followUpQuestion.trim() && !draft.faceToFaceRequired) nextErrors.followUpQuestion = "Add a follow-up question or request a face-to-face discussion.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, ...draft } : item));
    setNotice({ tone: "success", copy: `${selected.title} saved as ${draft.status.toLowerCase()} with ${draft.confidence.toLowerCase()} confidence.` });
    closeReview();
  };

  return <div className={styles.analysisStack}>
    <section className={styles.reviewHero}>
      <div><p className={styles.eyebrow}>{copy.heroEyebrow}</p><h3>{copy.heroTitle}</h3><p>{copy.heroCopy}</p></div>
      <div className={styles.reviewSummary}><span><strong>{reviewedCount}/{items.length}</strong> {copy.reviewedLabel}</span><span><strong>{questionCount}</strong> {copy.followUpsLabel}</span><span><strong>{faceToFaceCount}</strong> {copy.conversationsLabel}</span></div>
    </section>

    <Panel title={copy.panelTitle} eyebrow={`${filteredItems.length} of ${items.length} ${copy.panelNoun}`} action={<ActionButton type="button" variant="ghost" onClick={() => downloadJson(copy.exportFile, items)}>{copy.exportLabel}</ActionButton>}>
      <div className={styles.reviewFilters}>
        <label className={styles.reviewSearch}><span>⌕</span><input aria-label={copy.searchAriaLabel} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
        <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{REVIEW_STATUSES.map((status) => <option value={status} key={status}>{status} ({items.filter((item) => item.status === status).length})</option>)}</select></label>
        <label><span>{copy.scopeFilterLabel}</span><select value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}><option>All</option>{environments.map((environment) => <option key={environment}>{environment}</option>)}</select></label>
        <label><span>{copy.typeFilterLabel}</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option>All</option>{artifactTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      </div>
      {filteredItems.length ? <div className={styles.reviewQueue}>{filteredItems.map((item) => <article key={item.id}>
        <div className={styles.artifactIcon} data-type={item.artifactType.toLowerCase().replaceAll(" ", "-")}><span>{item.artifactType === "Upload" ? "↑" : item.artifactType === "Questionnaire" ? "?" : item.artifactType === "Profiler" ? "⌁" : "□"}</span></div>
        <div className={styles.artifactIdentity}><small>{item.artifactType} · {item.version}</small><strong>{item.title}</strong><p>{item.summary}</p><div>{item.environments.map((environment) => <span key={environment}>{environment}</span>)}</div></div>
        <div className={styles.reviewState}><Badge>{item.status}</Badge><span>{item.confidence} confidence</span>{item.faceToFaceRequired && <small>◉ Face-to-face</small>}</div>
        <div className={styles.followUpState}>{item.followUpQuestion || item.faceToFaceRequired ? <><small>{item.followUpDisposition}</small><p>{item.buResponse || "Waiting for a response."}</p></> : <span>No follow-up needed</span>}</div>
        <ActionButton type="button" variant="secondary" onClick={() => openReview(item)}>{readOnly ? "View review" : item.status === "Not reviewed" ? "Start review" : "Open review"}</ActionButton>
      </article>)}</div> : <EmptyState title={copy.noMatchingTitle} copy={copy.noMatchingCopy} action={<ActionButton type="button" variant="secondary" onClick={() => { setStatusFilter("All"); setEnvironmentFilter("All"); setTypeFilter("All"); setQuery(""); }}>Clear filters</ActionButton>} />}
    </Panel>

    <InlineNotice tone={notice.tone}>{readOnly ? copy.readOnlyNotice : notice.copy}</InlineNotice>

    {selected && draft && <AccessibleModal title={selected.title} description={`${selected.artifactType} · ${selected.version} · ${selected.environments.join(", ")}`} onClose={closeReview} footer={<>{!readOnly && <ActionButton type="button" variant="secondary" onClick={closeReview}>Cancel</ActionButton>}<ActionButton type="button" variant={readOnly ? "primary" : "primary"} onClick={readOnly ? closeReview : saveReview}>{readOnly ? "Close" : "Save review"}</ActionButton></>}>
      <div className={styles.reviewModalBody}>
        <section className={styles.artifactPreview}><header><span>{copy.previewLabel}</span><Badge>{selected.status}</Badge></header><div><i>{selected.artifactType === "Profiler" ? "⌁" : "□"}</i><span><strong>{selected.title}</strong><small>{selected.summary}</small></span></div><dl><div><dt>Version</dt><dd>{selected.version}</dd></div><div><dt>{copy.scopeLabel}</dt><dd>{selected.environments.join(", ")}</dd></div><div><dt>Current reviewer</dt><dd>{selected.reviewer || "Unassigned"}</dd></div></dl></section>

        {Object.keys(errors).length > 0 && <InlineNotice tone="danger">Review the highlighted fields before saving.</InlineNotice>}

        <div className={styles.reviewFormGrid}>
          <label data-error={Boolean(errors.reviewer)}><span>Reviewer or role</span><input value={draft.reviewer} disabled={readOnly} placeholder={copy.reviewerPlaceholder} onChange={(event) => setDraft((current) => current && ({ ...current, reviewer: event.target.value }))} />{errors.reviewer && <small>{errors.reviewer}</small>}</label>
          <label><span>Review status</span><select value={draft.status} disabled={readOnly} onChange={(event) => setDraft((current) => current && ({ ...current, status: event.target.value as ReviewStatus }))}>{REVIEW_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label data-error={Boolean(errors.confidence)}><span>Confidence</span><select value={draft.confidence} disabled={readOnly} onChange={(event) => setDraft((current) => current && ({ ...current, confidence: event.target.value as Confidence }))}><option>Not set</option><option>Low</option><option>Medium</option><option>High</option></select>{errors.confidence && <small>{errors.confidence}</small>}</label>
          <label><span>Follow-up disposition</span><select value={draft.followUpDisposition} disabled={readOnly} onChange={(event) => setDraft((current) => current && ({ ...current, followUpDisposition: event.target.value as ReviewArtifact["followUpDisposition"] }))}><option>More info needed</option><option>Further investigation</option><option>Confirmed</option></select></label>
          <label className={styles.fullField} data-error={Boolean(errors.notes)}><span>Reviewer notes</span><textarea rows={4} value={draft.notes} disabled={readOnly} placeholder={copy.notesPlaceholder} onChange={(event) => setDraft((current) => current && ({ ...current, notes: event.target.value }))} />{errors.notes && <small>{errors.notes}</small>}</label>
          <label className={styles.fullField} data-error={Boolean(errors.followUpQuestion)}><span>Follow-up question</span><textarea rows={3} value={draft.followUpQuestion} disabled={readOnly} placeholder={copy.followUpPlaceholder} onChange={(event) => setDraft((current) => current && ({ ...current, followUpQuestion: event.target.value }))} />{errors.followUpQuestion && <small>{errors.followUpQuestion}</small>}</label>
          <label className={`${styles.fullField} ${styles.discussionToggle}`}><input type="checkbox" checked={draft.faceToFaceRequired} disabled={readOnly} onChange={(event) => setDraft((current) => current && ({ ...current, faceToFaceRequired: event.target.checked }))} /><span><strong>Face-to-face discussion required</strong><small>Use this when written follow-up is not sufficient.</small></span></label>
        </div>

        <section className={styles.responseCard}><header><span>{copy.responseLabel}</span><Badge>{selected.buResponse ? "Response received" : "Awaiting response"}</Badge></header><p>{selected.buResponse || copy.noResponseCopy}</p></section>
      </div>
    </AccessibleModal>}
  </div>;
}
