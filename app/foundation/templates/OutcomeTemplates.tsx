"use client";

import { useMemo, useRef, useState } from "react";
import templateData from "../../../public/reusable-component-foundation/template-data/template-data.json";
import type { TemplateProps } from "./types";
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
import styles from "./OutcomeTemplates.module.css";

type ReportView = "author" | "reviewer";
type DecisionChart = "progression" | "waterfall";
type LineageView = "map" | "inventory";
type CoverageView = "map" | "telemetry";

const genericReportSections = templateData.finalBuReport.sections.map((section) => ({
  ...section,
  body: section.key === "executive-summary"
    ? "The proposed change is feasible when delivered through a controlled transition and an evidence-led approval route."
    : section.key === "environment-rationalisation"
      ? "Retain the primary delivery path and consolidate duplicate activities into a shared target pattern."
      : "Source coverage is sufficient for planning; four validation warnings remain open for review.",
}));

const reportScenarios = {
  base: {
    sections:genericReportSections,
    feedback:templateData.finalBuReport.feedback,
    loadedNotice:"Template loaded with synthetic report content.",
    emptyTitle:"No report sections yet",
    emptyCopy:"Add at least one report section and link its source tasks before review can begin.",
    workspaceTitle:"Report review and feedback",
    authorCopy:"Edit source-linked sections and respond to reviewer comments.",
    reviewerCopy:"Read the composed report, inspect its evidence and return an approval or change request.",
    outputTitle:"Final report",
    outputByline:"Prepared for Example workstream · Generic organisation",
    visualEyebrow:"Discovery confidence",
    visualTitle:"Evidence-led readiness",
    exportName:"generic-report-template.json",
    roleLabel:"Report actor",
    authorRoleLabel:"Author · edit",
    reviewerRoleLabel:"Reviewer · read & respond",
    savedNotice:"Section saved through the local template adapter.",
    findingSummary:{ total:12, label:"findings", good:"7 ready", watch:"3 watch", risk:"2 open" },
    findingGradient:"conic-gradient(#168760 0 58%, #e49b13 58% 82%, #e31937 82% 100%)",
    signals:[
      { label:"Evidence coverage", value:86, tone:"#64357b" },
      { label:"Metadata confidence", value:74, tone:"#2f78c5" },
      { label:"Delivery readiness", value:68, tone:"#e49b13" },
      { label:"Decision completeness", value:82, tone:"#168760" },
    ],
  },
  "dcc-hackathon": {
    sections:genericReportSections.map((section, index) => ({
      ...section,
      title:["Assurance summary","Standards coverage","Findings and evidence"][index],
      body:[
        "The uploaded solution design can proceed to human assurance once the open security ownership gap is resolved.",
        "ISO/IEC 27001, WCAG 2.2 AA and the DCC profile were applied; two requirements still need mapped evidence.",
        "Every AI finding retains its source excerpt, standard reference, confidence score and named reviewer decision.",
      ][index],
      sourceTasks:[["Document scan","Human review"],["Standards mapping"],["AI findings","Evidence review"]][index],
    })),
    feedback:[{ id:"report-feedback-1", sectionKey:"environment-rationalisation", comment:"Name the owner and due date for the ISO 27001 clause 5.3 remediation.", status:"Open" }],
    loadedNotice:"DCC assurance report content loaded.",
    emptyTitle:"No assurance report sections yet",
    emptyCopy:"Add a standards summary, linked findings and human decisions before review can begin.",
    workspaceTitle:"Assurance report review and feedback",
    authorCopy:"Edit source-linked assurance sections and respond to reviewer comments.",
    reviewerCopy:"Read the assurance report, inspect its standards evidence and return an approval or change request.",
    outputTitle:"Documentation assurance report",
    outputByline:"Prepared for DCC Hackathon · Customer portal documentation",
    visualEyebrow:"Assurance confidence",
    visualTitle:"Standards-led readiness",
    exportName:"dcc-assurance-report.json",
    roleLabel:"Report actor",
    authorRoleLabel:"Assurance author · edit",
    reviewerRoleLabel:"Reviewer · respond",
    savedNotice:"Assurance report section saved through the local template adapter.",
    findingSummary:{ total:27, label:"findings", good:"18 approved", watch:"4 review", risk:"5 declined" },
    findingGradient:"conic-gradient(#168760 0 67%, #e49b13 67% 82%, #e31937 82% 100%)",
    signals:[
      { label:"Standards coverage", value:86, tone:"#64357b" },
      { label:"Evidence traceability", value:74, tone:"#2f78c5" },
      { label:"Human review", value:68, tone:"#e49b13" },
      { label:"Decision completeness", value:82, tone:"#168760" },
    ],
  },
} as const;

export function FinalBuReportTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const scenario = reportScenarios[scenarioId];
  const [view, setView] = useState<ReportView>(mode === "readonly" ? "reviewer" : "author");
  const [sections, setSections] = useState(() => scenario.sections.map((section) => ({ ...section, sourceTasks:[...section.sourceTasks], reviewStatus:mode === "readonly" ? "Approved" : section.reviewStatus })));
  const [selectedKey, setSelectedKey] = useState(sections[0]?.key ?? "");
  const [lifecycle, setLifecycle] = useState(mode === "readonly" ? "Approved" : "In review");
  const [feedback, setFeedback] = useState(() => mode === "readonly" ? [] : scenario.feedback.map((item) => ({ ...item })));
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [notice, setNotice] = useState<string>(scenario.loadedNotice);
  const selected = sections.find((section) => section.key === selectedKey) ?? sections[0];
  const approvedCount = sections.filter((section) => section.reviewStatus === "Approved").length;
  const openFeedback = feedback.filter((item) => item.status === "Open");
  const canFinalise = sections.length > 0 && approvedCount === sections.length && openFeedback.length === 0;

  if (mode === "empty") {
    return <EmptyState title={scenario.emptyTitle} copy={scenario.emptyCopy} action={<ActionButton variant="primary">Add first section</ActionButton>} />;
  }

  const updateSelected = (patch: Partial<(typeof sections)[number]>) => {
    if (mode === "readonly") return;
    setSections((current) => current.map((section) => section.key === selectedKey ? { ...section, ...patch } : section));
    setNotice("Unsaved section changes");
  };

  const finalise = () => {
    if (!canFinalise) {
      setNotice("Resolve open feedback and approve every section before finalising.");
      return;
    }
    setLifecycle("Finalised");
    setView("reviewer");
    setNotice("Report finalised and passed to the reviewer view.");
  };

  const resolveFeedback = (id: string) => {
    const sectionKey = feedback.find((item) => item.id === id)?.sectionKey;
    setFeedback((current) => current.map((item) => item.id === id ? { ...item, status:"Resolved" } : item));
    setSections((current) => current.map((section) => section.key === sectionKey ? { ...section, reviewStatus:"In review" } : section));
    setNotice("Author response recorded. The section is ready for the reviewer again.");
  };

  const requestChanges = () => {
    const comment = feedbackDraft.trim();
    if (!comment) {
      setNotice("Write a review comment before requesting changes.");
      return;
    }
    const item = { id:`feedback-${feedback.length + 1}`, sectionKey:selectedKey, comment, status:"Open" };
    setFeedback((current) => [...current, item]);
    setSections((current) => current.map((section) => section.key === selectedKey ? { ...section, reviewStatus:"Changes requested" } : section));
    setLifecycle("Changes requested");
    setFeedbackDraft("");
    setNotice("Feedback sent to the report author.");
  };

  const reportSignals = scenario.signals;

  return <div className={styles.reportShell}>
    <div className={styles.templateToolbar}>
      <Segmented value={view} onChange={(next) => mode !== "readonly" && setView(next)} label={scenario.roleLabel} options={[{ value:"author", label:scenario.authorRoleLabel }, { value:"reviewer", label:scenario.reviewerRoleLabel }]} />
      <div><Badge tone={openFeedback.length ? "watch" : lifecycle === "Approved" ? "good" : "neutral"}>{lifecycle}</Badge><ActionButton onClick={() => downloadJson(scenario.exportName, { lifecycle, sections, feedback })}>Export</ActionButton></div>
    </div>

    <div className={styles.reportHeader}>
      <div><small>{view === "author" ? "Author workspace" : "Reviewer workspace"} · version 1</small><h3>{scenario.workspaceTitle}</h3><p>{view === "author" ? scenario.authorCopy : scenario.reviewerCopy}</p></div>
      <ProgressBar value={Math.round(approvedCount / sections.length * 100)} label="Sections approved" />
    </div>

    {view === "author" && openFeedback.map((item) => <div className={styles.feedbackBanner} key={item.id}><div><Badge tone="risk">Reviewer feedback</Badge><strong>{sections.find((section) => section.key === item.sectionKey)?.title}</strong><p>{item.comment}</p></div><ActionButton onClick={() => { setSelectedKey(item.sectionKey); resolveFeedback(item.id); }}>Respond & return</ActionButton></div>)}

    {view === "author" ? <div className={styles.reportEditor}>
      <nav aria-label="Report sections">{sections.map((section, index) => <button key={section.key} className={selectedKey === section.key ? styles.activeSection : ""} onClick={() => setSelectedKey(section.key)}><i>{String(index + 1).padStart(2,"0")}</i><span><strong>{section.title}</strong><small>{section.sourceTasks.length} source task{section.sourceTasks.length === 1 ? "" : "s"}</small></span><Badge>{section.reviewStatus}</Badge></button>)}</nav>
      {selected && <Panel title={selected.title} eyebrow="Section editor" action={<Badge>{selected.reviewStatus}</Badge>}>
        <div className={styles.sectionEditor}>
          <label><span>Narrative</span><textarea value={selected.body} readOnly={mode === "readonly"} onChange={(event) => updateSelected({ body:event.target.value })} /></label>
          <div className={styles.sourceLinks}><small>Source tasks</small>{selected.sourceTasks.map((task) => <button key={task} onClick={() => setNotice(`Opened source task: ${task}`)}>↗ {task}</button>)}</div>
          <label><span>Review status</span><select value={selected.reviewStatus} disabled={mode === "readonly"} onChange={(event) => updateSelected({ reviewStatus:event.target.value })}><option>Draft</option><option>In review</option><option>Changes requested</option><option>Approved</option></select></label>
          <div className={styles.editorActions}><ActionButton disabled={mode === "readonly"} onClick={() => setNotice(scenario.savedNotice)}>Save section</ActionButton><ActionButton variant="primary" disabled={mode === "readonly"} onClick={finalise}>Finalise report</ActionButton></div>
        </div>
      </Panel>}
    </div> : <article className={styles.clientReport}>
      <header><small>Decision-ready output</small><h2>{scenario.outputTitle}</h2><p>{scenario.outputByline}</p><Badge>{lifecycle}</Badge></header>
      <div className={styles.clientSummary}><Metric label="Sections" value={sections.length} detail="traceable narratives" /><Metric label="Approved" value={approvedCount} detail="review controls complete" tone={approvedCount === sections.length ? "good" : "watch"} /><Metric label="Open feedback" value={openFeedback.length} detail="author response required" tone={openFeedback.length ? "risk" : "good"} /></div>
      <section className={styles.reportVisuals} aria-label="Report analysis visuals"><div><small>{scenario.visualEyebrow}</small><h3>{scenario.visualTitle}</h3>{reportSignals.map((signal) => <div className={styles.reportSignal} key={signal.label}><span>{signal.label}</span><i><b style={{ width:`${signal.value}%`, background:signal.tone }} /></i><strong>{signal.value}%</strong></div>)}</div><div className={styles.reportDonut} style={{ background:scenario.findingGradient }}><i><strong>{scenario.findingSummary.total}</strong><small>{scenario.findingSummary.label}</small></i><footer><span><b data-tone="good" />{scenario.findingSummary.good}</span><span><b data-tone="watch" />{scenario.findingSummary.watch}</span><span><b data-tone="risk" />{scenario.findingSummary.risk}</span></footer></div></section>
      {sections.map((section) => <section className={selectedKey === section.key ? styles.reviewSectionActive : ""} key={section.key}><small>{section.reviewStatus}</small><h3>{section.title}</h3><p>{section.body}</p><footer>Sources: {section.sourceTasks.join(" · ")}</footer>{mode !== "readonly" && <ActionButton onClick={() => { setSelectedKey(section.key); setNotice(`${section.title} selected for review.`); }}>Review this section</ActionButton>}</section>)}
      {mode !== "readonly" && <section className={styles.reviewerActions}><div><small>Reviewer response</small><h3>{selected?.title}</h3><p>The report remains read-only in this actor view. Approve the selected section or send a precise change request back to the author.</p></div><label><span>Feedback</span><textarea value={feedbackDraft} onChange={(event) => setFeedbackDraft(event.target.value)} placeholder="Describe the change and the evidence needed…" /></label><div><ActionButton onClick={requestChanges}>Request changes</ActionButton><ActionButton variant="primary" onClick={() => { setSections((current) => current.map((section) => section.key === selectedKey ? { ...section, reviewStatus:"Approved" } : section)); setNotice("Reviewer approved the selected section."); }}>Approve section</ActionButton>{lifecycle === "Finalised" && canFinalise && <ActionButton variant="primary" onClick={() => { setLifecycle("Approved"); setNotice("Final approval recorded and report locked."); }}>Approve report</ActionButton>}</div></section>}
    </article>}
    <InlineNotice tone={notice.includes("before") ? "warning" : "info"}>{notice}</InlineNotice>
  </div>;
}

const genericUnits = templateData.decision.businessUnits.map((unit, index) => ({
  ...unit,
  name: `Option ${["Alpha", "Beta", "Gamma"][index]}`,
  included: true,
}));

const decisionScenarios = {
  base:{
    units:genericUnits,
    notice:"Baseline scenario loaded.",
    emptyTitle:"No scenario inputs",
    emptyCopy:"Add at least one option with costs, benefits and a proposed action to calculate a recommendation.",
    configuratorTitle:"Scenario configurator",
    tableTitle:"Scenario sequencing and decision readiness",
    exportName:"generic-decision-scenario.json",
    scopeLabel:"Decision scope",
    scopeOptions:[{ value:"programme", label:"Programme" }, { value:"unit", label:"Selected unit" }],
    actionOptions:["Migrate","Replatform","Decommission","Retain"],
    actionMultipliers:{ Migrate:1, Replatform:.78, Decommission:.55, Retain:.16 },
    actionCosts:{ Migrate:105000, Replatform:105000, Decommission:45000, Retain:15000 },
    savedNotice:"Scenario saved through the local adapter.",
    thresholdCopy:"The scenario meets the configured economic and readiness thresholds.",
    recommendationMetricLabel:"Five-year net benefit",
    benefitLabel:"Benefit",
    changeCostLabel:"Change cost",
    netLabel:"Net",
    profileTitle:"Economic profile",
    profileAriaLabel:"Five-year net benefit progression",
    tableActionLabel:"Action",
    tableValueLabel:"Net benefit",
  },
  "dcc-hackathon":{
    units:genericUnits.map((unit, index) => ({
      ...unit,
      name:["Standards library integration","Document scanning workflow","Human assurance register"][index],
      action:["Implement","Pilot","Sequence later"][index],
      riceScore:[8.6,7.9,6.8][index],
      readiness:["Ready with conditions","Needs evidence","Decision required"][index],
      fiveYearNetSaving:[410000,360000,250000][index],
    })),
    notice:"DCC assurance decision baseline loaded.",
    emptyTitle:"No assurance decision inputs",
    emptyCopy:"Add at least one assurance option with effort, value and a proposed action to calculate a recommendation.",
    configuratorTitle:"Assurance scenario configurator",
    tableTitle:"Assurance sequencing and decision readiness",
    exportName:"dcc-assurance-decision-scenario.json",
    scopeLabel:"Assurance decision scope",
    scopeOptions:[{ value:"programme", label:"Assurance service" }, { value:"unit", label:"Selected capability" }],
    actionOptions:["Implement","Pilot","Sequence later","Do not proceed"],
    actionMultipliers:{ Implement:1, Pilot:.72, "Sequence later":.35, "Do not proceed":0 },
    actionCosts:{ Implement:120000, Pilot:70000, "Sequence later":25000, "Do not proceed":5000 },
    savedNotice:"Assurance scenario saved through the local adapter.",
    thresholdCopy:"The scenario meets the configured assurance-value and delivery-readiness thresholds.",
    recommendationMetricLabel:"Five-year assurance benefit",
    benefitLabel:"Assurance value",
    changeCostLabel:"Delivery cost",
    netLabel:"Net benefit",
    profileTitle:"Assurance investment profile",
    profileAriaLabel:"Five-year assurance benefit progression",
    tableActionLabel:"Delivery choice",
    tableValueLabel:"Assurance value",
  },
};

export function DecisionTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const scenario = decisionScenarios[scenarioId];
  const [units, setUnits] = useState(() => scenario.units.map((unit) => ({ ...unit })));
  const [chart, setChart] = useState<DecisionChart>("progression");
  const [scope, setScope] = useState("programme");
  const [savedUnits, setSavedUnits] = useState(() => scenario.units.map((unit) => ({ ...unit })));
  const [notice, setNotice] = useState(scenario.notice);

  const summary = useMemo(() => {
    const multipliers: Record<string, number> = scenario.actionMultipliers;
    const actionCosts: Record<string, number> = scenario.actionCosts;
    const included = units.filter((unit) => unit.included);
    const saving = included.reduce((total, unit) => total + unit.fiveYearNetSaving * (multipliers[unit.action] ?? .4), 0);
    const migrationCost = included.reduce((total, unit) => total + (actionCosts[unit.action] ?? 105000), 0);
    const net = Math.round(saving - migrationCost);
    const blockers = included.filter((unit) => /Needs|Decision/.test(unit.readiness)).length;
    return { saving:Math.round(saving), migrationCost, net, blockers, recommendation: blockers > 1 ? "Proceed with conditions" : net > 500000 ? "Proceed" : net > 0 ? "Conditional" : "Do not proceed" };
  }, [scenario, units]);
  const changed = JSON.stringify(units) !== JSON.stringify(savedUnits);

  if (mode === "empty") return <EmptyState title={scenario.emptyTitle} copy={scenario.emptyCopy} />;

  const updateUnit = (id: string, patch: Partial<(typeof units)[number]>) => {
    if (mode === "readonly") return;
    setUnits((current) => current.map((unit) => unit.id === id ? { ...unit, ...patch } : unit));
    setNotice("Scenario changed · save or restore the baseline.");
  };

  const progression = [0, .16, .35, .58, .8, 1].map((portion, index) => ({ year:index, value:Math.round(summary.net * portion) }));
  const maxProgress = Math.max(...progression.map((point) => Math.abs(point.value)), 1);
  const path = progression.map((point, index) => `${index ? "L" : "M"}${12 + index * 55},${122 - point.value / maxProgress * 96}`).join(" ");

  return <div className={styles.decisionShell}>
    <div className={styles.templateToolbar}>
      <Segmented value={scope} onChange={setScope} label={scenario.scopeLabel} options={scenario.scopeOptions} />
      <div><Badge tone={changed ? "watch" : "good"}>{changed ? "Unsaved scenario" : "Baseline saved"}</Badge><ActionButton disabled={mode === "readonly" || !changed} onClick={() => { setSavedUnits(units.map((unit) => ({ ...unit }))); setNotice(scenario.savedNotice); }}>Save scenario</ActionButton><ActionButton disabled={mode === "readonly" || !changed} onClick={() => { setUnits(savedUnits.map((unit) => ({ ...unit }))); setNotice("Saved scenario restored."); }}>Restore</ActionButton></div>
    </div>

    <section className={styles.recommendation} data-recommendation={summary.recommendation === "Proceed" ? "good" : "conditional"}>
      <div><small>Calculated recommendation</small><h3>{summary.recommendation}</h3><p>{summary.blockers ? `${summary.blockers} evidence condition${summary.blockers === 1 ? "" : "s"} remain open.` : scenario.thresholdCopy}</p><span><Badge>{summary.blockers ? "Medium confidence" : "High confidence"}</Badge><Badge>{summary.blockers ? "Decision ready with conditions" : "Decision ready"}</Badge></span></div>
      <div className={styles.recommendationMetric}><small>{scenario.recommendationMetricLabel}</small><strong>£{Math.round(summary.net / 1000)}k</strong><span>£{Math.round(summary.saving / 1000)}k {scenario.benefitLabel.toLowerCase()} − £{Math.round(summary.migrationCost / 1000)}k {scenario.changeCostLabel.toLowerCase()}</span></div>
    </section>

    <div className={styles.decisionGrid}>
      <Panel title={scenario.configuratorTitle} eyebrow="Live calculation">
        <div className={styles.unitRows}>{units.map((unit) => <div key={unit.id} data-included={unit.included}>
          <label className={styles.includeUnit}><input type="checkbox" checked={unit.included} disabled={mode === "readonly"} onChange={(event) => updateUnit(unit.id, { included:event.target.checked })} /><span><strong>{unit.name}</strong><small>Priority score {unit.riceScore} · {unit.readiness}</small></span></label>
          <select value={unit.action} disabled={mode === "readonly" || !unit.included} onChange={(event) => updateUnit(unit.id, { action:event.target.value })}>{scenario.actionOptions.map((action) => <option key={action}>{action}</option>)}</select>
          <strong>£{Math.round(unit.fiveYearNetSaving / 1000)}k</strong>
        </div>)}</div>
      </Panel>
      <Panel title={scenario.profileTitle} eyebrow={scope === "programme" ? "All included units" : "Focused view"} action={<Segmented value={chart} onChange={setChart} label="Chart type" options={[{ value:"progression", label:"Progression" }, { value:"waterfall", label:"Waterfall" }]} />}>
        {chart === "progression" ? <div className={styles.savingsChart}><svg viewBox="0 0 300 145" role="img" aria-label={scenario.profileAriaLabel}><path className={styles.gridLine} d="M12 26H288M12 74H288M12 122H288" /><path className={styles.progressionLine} d={path} />{progression.map((point, index) => <g key={point.year}><circle cx={12 + index * 55} cy={122 - point.value / maxProgress * 96} r="4" /><text x={12 + index * 55} y="140">Y{index}</text></g>)}</svg></div> : <div className={styles.waterfall}>{[{ label:scenario.benefitLabel, value:summary.saving, tone:"good" },{ label:scenario.changeCostLabel, value:-summary.migrationCost, tone:"risk" },{ label:scenario.netLabel, value:summary.net, tone:"total" }].map((row) => <div key={row.label}><span>{row.label}</span><i data-tone={row.tone} style={{ height:`${Math.max(25, Math.abs(row.value) / Math.max(summary.saving,1) * 145)}px` }} /><strong>{row.value < 0 ? "−" : ""}£{Math.round(Math.abs(row.value) / 1000)}k</strong></div>)}</div>}
      </Panel>
    </div>

    <Panel title={scenario.tableTitle} eyebrow="Options table" action={<ActionButton onClick={() => downloadJson(scenario.exportName, { units, summary })}>Export scenario</ActionButton>}>
      <div className={styles.decisionTable}><div className={styles.tableHeading}><span>Priority</span><span>Option</span><span>{scenario.tableActionLabel}</span><span>Score</span><span>Readiness</span><span>{scenario.tableValueLabel}</span></div>{units.filter((unit) => unit.included).sort((a,b) => b.riceScore - a.riceScore).map((unit,index) => <div key={unit.id}><b>{index + 1}</b><strong>{unit.name}</strong><span>{unit.action}</span><span>{unit.riceScore}</span><Badge>{unit.readiness}</Badge><span>£{Math.round(unit.fiveYearNetSaving / 1000)}k</span></div>)}</div>
    </Panel>
    <InlineNotice tone={changed ? "warning" : "info"}>{notice}</InlineNotice>
  </div>;
}

const genericLineageNodes = [
  { id:"source-orders", lane:"source", kind:"database", label:"Order database", detail:"Operational order tables", evidence:"EV-001", owner:"Source platform", status:"Observed", rows:"18.4m", x:28, y:72, pipelines:["orders","revenue"] },
  { id:"source-customer", lane:"source", kind:"api", label:"Customer API", detail:"Customer and account feed", evidence:"EV-004", owner:"CRM team", status:"Observed", rows:"2.1m", x:28, y:178, pipelines:["customer"] },
  { id:"source-product", lane:"source", kind:"files", label:"Product files", detail:"Daily product reference", evidence:"EV-007", owner:"Merchandising", status:"Inferred", rows:"84k", x:28, y:284, pipelines:["orders","customer"] },
  { id:"pipeline-ingest", lane:"orchestration", kind:"pipeline", label:"Ingest pipeline", detail:"Parallel source ingestion", evidence:"EV-012", owner:"Data engineering", status:"Observed", rows:"3 activities", x:270, y:72, pipelines:["orders","customer","revenue"] },
  { id:"activity-validate", lane:"orchestration", kind:"activity", label:"Validate schema", detail:"Contract and quality gate", evidence:"EV-015", owner:"Data engineering", status:"Observed", rows:"12 rules", x:270, y:178, pipelines:["orders","customer"] },
  { id:"activity-master", lane:"orchestration", kind:"activity", label:"Resolve master data", detail:"Shared product mapping", evidence:"EV-019", owner:"Data governance", status:"Partial", rows:"4 mappings", x:270, y:284, pipelines:["orders","customer"] },
  { id:"compute-orders", lane:"compute", kind:"notebook", label:"Order transform", detail:"Standardise and enrich", evidence:"EV-023", owner:"Analytics engineering", status:"Observed", rows:"11 cells", x:512, y:72, pipelines:["orders","revenue"] },
  { id:"compute-customer", lane:"compute", kind:"notebook", label:"Customer transform", detail:"Conform customer entities", evidence:"EV-026", owner:"Analytics engineering", status:"Observed", rows:"8 cells", x:512, y:178, pipelines:["customer"] },
  { id:"compute-quality", lane:"compute", kind:"quality", label:"Quality assertions", detail:"Cross-domain release gate", evidence:"EV-029", owner:"Quality engineering", status:"Partial", rows:"21 checks", x:512, y:284, pipelines:["orders","customer","revenue"] },
  { id:"target-orders", lane:"target", kind:"table", label:"Curated orders", detail:"Governed order facts", evidence:"EV-033", owner:"Data products", status:"Observed", rows:"18.1m", x:754, y:55, pipelines:["orders"] },
  { id:"target-customer", lane:"target", kind:"table", label:"Curated customers", detail:"Conformed customer dimension", evidence:"EV-036", owner:"Data products", status:"Observed", rows:"2m", x:754, y:161, pipelines:["customer"] },
  { id:"target-revenue", lane:"target", kind:"semantic", label:"Revenue semantic model", detail:"Finance reporting model", evidence:"EV-041", owner:"BI platform", status:"Inferred", rows:"14 measures", x:754, y:267, pipelines:["revenue","orders"] },
];

const genericLineageEdges = [
  { id:"edge-1", from:"source-orders", to:"pipeline-ingest", label:"reads", status:"Observed", pipelines:["orders","revenue"] },
  { id:"edge-2", from:"source-customer", to:"pipeline-ingest", label:"calls", status:"Observed", pipelines:["customer"] },
  { id:"edge-3", from:"source-product", to:"activity-master", label:"maps", status:"Inferred", pipelines:["orders","customer"] },
  { id:"edge-4", from:"pipeline-ingest", to:"activity-validate", label:"then", status:"Observed", pipelines:["orders","customer"] },
  { id:"edge-5", from:"activity-validate", to:"compute-orders", label:"orders", status:"Observed", pipelines:["orders","revenue"] },
  { id:"edge-6", from:"activity-validate", to:"compute-customer", label:"customers", status:"Observed", pipelines:["customer"] },
  { id:"edge-7", from:"activity-master", to:"compute-orders", label:"lookup", status:"Partial", pipelines:["orders"] },
  { id:"edge-8", from:"activity-master", to:"compute-customer", label:"lookup", status:"Partial", pipelines:["customer"] },
  { id:"edge-9", from:"compute-orders", to:"compute-quality", label:"assert", status:"Observed", pipelines:["orders","revenue"] },
  { id:"edge-10", from:"compute-customer", to:"compute-quality", label:"assert", status:"Observed", pipelines:["customer"] },
  { id:"edge-11", from:"compute-quality", to:"target-orders", label:"writes", status:"Observed", pipelines:["orders"] },
  { id:"edge-12", from:"compute-quality", to:"target-customer", label:"writes", status:"Observed", pipelines:["customer"] },
  { id:"edge-13", from:"compute-orders", to:"target-revenue", label:"publishes", status:"Inferred", pipelines:["revenue"] },
];

const dccLineageNodeData = [
  { kind:"standard", label:"ISO/IEC 27001", detail:"93 mapped requirements", evidence:"STD-ISO-001", owner:"Security assurance", status:"Observed", rows:"93 clauses", pipelines:["orders","revenue"] },
  { kind:"standard", label:"WCAG 2.2 AA", detail:"55 success criteria", evidence:"STD-WCAG-002", owner:"Accessibility lead", status:"Observed", rows:"55 criteria", pipelines:["customer"] },
  { kind:"profile", label:"DCC assurance profile", detail:"18 hackathon checks", evidence:"STD-DCC-003", owner:"DCC assurance team", status:"Inferred", rows:"18 checks", pipelines:["orders","customer","revenue"] },
  { kind:"extraction", label:"Document extraction", detail:"Solution Design v0.8 · 34 pages", evidence:"DOC-018", owner:"Document owner", status:"Observed", rows:"34 pages", pipelines:["orders","customer","revenue"] },
  { kind:"mapping", label:"Requirement mapping", detail:"Standards matched to document passages", evidence:"MAP-018", owner:"Assurance service", status:"Observed", rows:"148 requirements", pipelines:["orders","customer","revenue"] },
  { kind:"evidence", label:"Evidence linking", detail:"Page references and source excerpts retained", evidence:"EVD-018", owner:"Evidence custodian", status:"Partial", rows:"27 excerpts", pipelines:["orders","customer","revenue"] },
  { kind:"scan", label:"Security assurance scan", detail:"Governance and control findings", evidence:"FND-SEC", owner:"Security reviewer", status:"Observed", rows:"12 findings", pipelines:["orders","revenue"] },
  { kind:"scan", label:"Accessibility assurance scan", detail:"Accessibility evidence findings", evidence:"FND-A11Y", owner:"Accessibility reviewer", status:"Observed", rows:"7 findings", pipelines:["customer"] },
  { kind:"review", label:"Human review gate", detail:"Named reviewer decisions", evidence:"REV-018", owner:"Assurance lead", status:"Partial", rows:"4 pending", pipelines:["orders","customer","revenue"] },
  { kind:"decision", label:"Approved findings", detail:"Accepted for the assurance report", evidence:"DEC-APP", owner:"Report author", status:"Observed", rows:"18 findings", pipelines:["orders","customer","revenue"] },
  { kind:"decision", label:"Declined findings", detail:"Decision rationale retained for audit", evidence:"DEC-DEC", owner:"Audit owner", status:"Observed", rows:"5 findings", pipelines:["orders","customer"] },
  { kind:"report", label:"Assurance report", detail:"Published, traceable review outcome", evidence:"RPT-018", owner:"DCC assurance team", status:"Inferred", rows:"3 sections", pipelines:["revenue"] },
];

const dccLineageNodes = genericLineageNodes.map((node, index) => ({ ...node, ...dccLineageNodeData[index] }));

const dccLineageEdgeData = [
  { from:"source-orders", to:"pipeline-ingest", label:"governs", status:"Observed", pipelines:["orders","revenue"] },
  { from:"source-customer", to:"pipeline-ingest", label:"governs", status:"Observed", pipelines:["customer"] },
  { from:"source-product", to:"activity-master", label:"defines", status:"Inferred", pipelines:["orders","customer","revenue"] },
  { from:"pipeline-ingest", to:"activity-validate", label:"provides text", status:"Observed", pipelines:["orders","customer","revenue"] },
  { from:"activity-validate", to:"compute-orders", label:"checks clauses", status:"Observed", pipelines:["orders","revenue"] },
  { from:"activity-validate", to:"compute-customer", label:"checks criteria", status:"Observed", pipelines:["customer"] },
  { from:"activity-master", to:"compute-orders", label:"links excerpts", status:"Partial", pipelines:["orders","revenue"] },
  { from:"activity-master", to:"compute-customer", label:"links excerpts", status:"Partial", pipelines:["customer"] },
  { from:"compute-orders", to:"compute-quality", label:"submits findings", status:"Observed", pipelines:["orders","revenue"] },
  { from:"compute-customer", to:"compute-quality", label:"submits findings", status:"Observed", pipelines:["customer"] },
  { from:"compute-quality", to:"target-orders", label:"approves", status:"Observed", pipelines:["orders","customer","revenue"] },
  { from:"compute-quality", to:"target-customer", label:"declines", status:"Observed", pipelines:["orders","customer"] },
  { from:"compute-quality", to:"target-revenue", label:"publishes", status:"Inferred", pipelines:["revenue"] },
];

const dccLineageEdges = genericLineageEdges.map((edge, index) => ({ ...edge, ...dccLineageEdgeData[index] }));

const lineageScenarios = {
  base:{
    nodes:genericLineageNodes,
    edges:genericLineageEdges,
    notice:"Select a node or relationship to inspect its trace evidence.",
    emptyTitle:"No lineage model available",
    emptyCopy:"Connect a pipeline inventory or provide source-to-target mappings to populate this explorer.",
    pipelineLabel:"Pipeline",
    allPipelinesLabel:"All template pipelines",
    pipelineOptions:[{ value:"orders", label:"Order ingest" },{ value:"customer", label:"Customer ingest" },{ value:"revenue", label:"Revenue refresh" }],
    laneLabels:["Sources","Orchestration","Compute","Targets"],
    caveat:"Column-level lineage is not asserted by this template. Inferred edges remain visibly distinct until evidence is supplied.",
    exportName:"generic-lineage-model.json",
    viewLabel:"Lineage view",
    mapViewLabel:"Dependency map",
    inventoryViewLabel:"Node inventory",
    routeMetricLabel:"Pipelines",
    routeMetricDetail:"filterable flows",
    nodeMetricLabel:"Nodes",
    nodeMetricDetail:"total",
    relationshipMetricLabel:"Relationships",
    relationshipMetricDetail:"clickable traces",
    inferredMetricLabel:"Inferred",
    inferredMetricDetail:"visibly disclosed",
    mapAriaLabel:"Interactive source-to-target lineage relationships",
    selectedRelationshipLabel:"Selected relationship",
    relationshipEvidenceLabel:"lineage evidence",
    inventoryTitle:"Lineage node inventory",
    inventoryEyebrow:"Filtered technical detail",
    inventoryHeaders:["Node","Layer","Owner","Evidence","Status"],
    caveatLabel:"Evidence caveat",
    caveatBadge:"Inference disclosed",
    traceActionLabel:"Open source trace",
    traceModalPrefix:"Source trace",
    traceDescription:"Every known upstream source, orchestration step and transformation leading to the selected node.",
    downloadTraceLabel:"Download trace",
    sourcePathsLabel:"Source paths",
    sourcePathsDetail:"independent routes",
    traceNodesLabel:"Trace nodes",
    traceNodesDetail:"source to selected node",
    evidenceLinksLabel:"Evidence links",
    evidenceLinksDetail:"inspectable records",
    selectedOutputLabel:"Selected output",
    pathLabel:"Path",
    evidenceRegisterLabel:"Evidence register",
    evidenceRegisterTitle:"Records used by this trace",
    evidenceRegisterHeaders:["Node","Transformation / role","Evidence","Status"],
  },
  "dcc-hackathon":{
    nodes:dccLineageNodes,
    edges:dccLineageEdges,
    notice:"Select a standard, document, finding or decision to inspect its assurance evidence.",
    emptyTitle:"No assurance relationships available",
    emptyCopy:"Connect standards, uploaded documents, findings and decisions to populate this explorer.",
    pipelineLabel:"Assurance route",
    allPipelinesLabel:"All assurance routes",
    pipelineOptions:[{ value:"orders", label:"Security assurance" },{ value:"customer", label:"Accessibility assurance" },{ value:"revenue", label:"Report publication" }],
    laneLabels:["Standards","AI assurance","Human review","Outcomes"],
    caveat:"Requirement-level evidence is incomplete for inferred relationships. They remain visibly distinct until a source excerpt is supplied.",
    exportName:"dcc-assurance-lineage-model.json",
    viewLabel:"Assurance relationship view",
    mapViewLabel:"Assurance map",
    inventoryViewLabel:"Record inventory",
    routeMetricLabel:"Assurance routes",
    routeMetricDetail:"filterable checks",
    nodeMetricLabel:"Records",
    nodeMetricDetail:"total",
    relationshipMetricLabel:"Evidence links",
    relationshipMetricDetail:"clickable traces",
    inferredMetricLabel:"Inferred",
    inferredMetricDetail:"evidence required",
    mapAriaLabel:"Interactive standards-to-assurance-outcome relationships",
    selectedRelationshipLabel:"Selected evidence link",
    relationshipEvidenceLabel:"assurance evidence",
    inventoryTitle:"Assurance record inventory",
    inventoryEyebrow:"Filtered assurance detail",
    inventoryHeaders:["Record","Stage","Owner","Evidence","Status"],
    caveatLabel:"Assurance caveat",
    caveatBadge:"Inference disclosed",
    traceActionLabel:"Open assurance trace",
    traceModalPrefix:"Assurance trace",
    traceDescription:"Every known standard, document step, finding and human decision leading to the selected assurance outcome.",
    downloadTraceLabel:"Download assurance trace",
    sourcePathsLabel:"Standards paths",
    sourcePathsDetail:"independent routes",
    traceNodesLabel:"Trace records",
    traceNodesDetail:"standard to outcome",
    evidenceLinksLabel:"Evidence links",
    evidenceLinksDetail:"inspectable records",
    selectedOutputLabel:"Selected outcome",
    pathLabel:"Route",
    evidenceRegisterLabel:"Assurance evidence register",
    evidenceRegisterTitle:"Records used by this assurance trace",
    evidenceRegisterHeaders:["Record","Assurance role","Evidence","Status"],
  },
};

function upstreamLineagePaths(nodeId: string, lineageEdges = genericLineageEdges, visited = new Set<string>()): string[][] {
  if (visited.has(nodeId)) return [[nodeId]];
  const incoming = lineageEdges.filter((edge) => edge.to === nodeId);
  if (!incoming.length) return [[nodeId]];
  const nextVisited = new Set(visited).add(nodeId);
  return incoming.flatMap((edge) => upstreamLineagePaths(edge.from, lineageEdges, nextVisited).map((path) => [...path, nodeId]));
}

export function DataLineageTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const scenario = lineageScenarios[scenarioId];
  const nodes = scenario.nodes;
  const edges = scenario.edges;
  const [view, setView] = useState<LineageView>("map");
  const [pipeline, setPipeline] = useState("all");
  const [selectedId, setSelectedId] = useState(nodes[3].id);
  const [focusedEdge, setFocusedEdge] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x:0, y:0 });
  const [traceOpen, setTraceOpen] = useState(false);
  const [notice, setNotice] = useState(scenario.notice);
  const drag = useRef<{ pointerId:number; x:number; y:number; panX:number; panY:number } | null>(null);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const selectedEdge = edges.find((edge) => edge.id === focusedEdge);
  const visibleNodes = pipeline === "all" ? nodes : nodes.filter((node) => node.pipelines.includes(pipeline));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to) && (pipeline === "all" || edge.pipelines.includes(pipeline)));
  const traceTargetId = selectedEdge?.to ?? selected.id;
  const traceTarget = nodes.find((node) => node.id === traceTargetId) ?? selected;
  const tracePaths = upstreamLineagePaths(traceTargetId, edges);
  const traceNodeIds = Array.from(new Set(tracePaths.flat()));
  const traceNodes = traceNodeIds.map((id) => nodes.find((node) => node.id === id)).filter((node): node is (typeof genericLineageNodes)[number] => Boolean(node));

  const resetLineage = () => {
    setZoom(100);
    setPan({ x:0, y:0 });
    setFocusedEdge(null);
    setNotice("Map position and relationship focus reset.");
  };

  if (mode === "empty") return <EmptyState title={scenario.emptyTitle} copy={scenario.emptyCopy} />;

  return <div className={styles.lineageShell}>
    <div className={styles.diagramToolbar}>
      <Segmented value={view} onChange={setView} label={scenario.viewLabel} options={[{ value:"map", label:scenario.mapViewLabel }, { value:"inventory", label:scenario.inventoryViewLabel }]} />
      <label>{scenario.pipelineLabel} <select value={pipeline} onChange={(event) => { setPipeline(event.target.value); setFocusedEdge(null); }}><option value="all">{scenario.allPipelinesLabel}</option>{scenario.pipelineOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      <span><ActionButton aria-label="Pan left" onClick={() => setPan((value) => ({ ...value, x:value.x + 36 }))}>←</ActionButton><ActionButton aria-label="Pan right" onClick={() => setPan((value) => ({ ...value, x:value.x - 36 }))}>→</ActionButton><ActionButton aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(60, value - 10))}>−</ActionButton><b>{zoom}%</b><ActionButton aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(160, value + 10))}>+</ActionButton><ActionButton onClick={resetLineage}>Reset</ActionButton><ActionButton onClick={() => downloadJson(scenario.exportName, { nodes, edges })}>Export</ActionButton></span>
    </div>
    <div className={styles.lineageSummary}><Metric label={scenario.routeMetricLabel} value={scenario.pipelineOptions.length} detail={scenario.routeMetricDetail} /><Metric label={scenario.nodeMetricLabel} value={visibleNodes.length} detail={`${nodes.length} ${scenario.nodeMetricDetail}`} /><Metric label={scenario.relationshipMetricLabel} value={visibleEdges.length} detail={scenario.relationshipMetricDetail} /><Metric label={scenario.inferredMetricLabel} value={visibleEdges.filter((edge) => edge.status === "Inferred").length} detail={scenario.inferredMetricDetail} tone="watch" /></div>
    {view === "map" ? <div className={styles.lineageCanvas}>
      <div className={styles.laneLabels}>{scenario.laneLabels.map((label) => <span key={label}>{label}</span>)}</div>
      <div className={styles.lineageViewport} onPointerDown={(event) => { if ((event.target as HTMLElement).closest("button")) return; drag.current = { pointerId:event.pointerId, x:event.clientX, y:event.clientY, panX:pan.x, panY:pan.y }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (!drag.current || drag.current.pointerId !== event.pointerId) return; setPan({ x:drag.current.panX + event.clientX - drag.current.x, y:drag.current.panY + event.clientY - drag.current.y }); }} onPointerUp={(event) => { if (drag.current?.pointerId === event.pointerId) drag.current = null; }}>
        <div className={styles.lineageStage} style={{ transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})` }}>
          <svg viewBox="0 0 950 420" aria-label={scenario.mapAriaLabel}><defs><marker id="lineage-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" /></marker></defs>{visibleEdges.map((edge) => { const from = nodes.find((node) => node.id === edge.from)!; const to = nodes.find((node) => node.id === edge.to)!; const x1 = from.x + 166; const y1 = from.y + 30; const x2 = to.x; const y2 = to.y + 30; const d = `M${x1},${y1} C${x1 + 58},${y1} ${x2 - 58},${y2} ${x2},${y2}`; return <g key={edge.id} className={focusedEdge === edge.id ? styles.activeLineageEdge : edge.status === "Inferred" ? styles.inferredLineageEdge : styles.observedLineageEdge} role="button" tabIndex={0} aria-label={`${edge.label} relationship from ${from.label} to ${to.label}`} onClick={() => { setFocusedEdge(edge.id); setNotice(`${edge.label} relationship selected.`); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFocusedEdge(edge.id); } }}><path className={styles.edgeHitArea} d={d} /><path className={styles.edgeStroke} d={d} markerEnd="url(#lineage-arrow)" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7}>{edge.label}</text></g>; })}</svg>
          {visibleNodes.map((node) => <button key={node.id} style={{ left:node.x, top:node.y }} className={`${styles.richLineageNode} ${selectedId === node.id && !focusedEdge ? styles.selectedLineageNode : ""}`} data-lane={node.lane} onClick={() => { setSelectedId(node.id); setFocusedEdge(null); setNotice(`${node.label} selected.`); }}><i>{node.kind.slice(0,1).toUpperCase()}</i><span><small>{node.kind} · {node.status}</small><strong>{node.label}</strong><em>{node.detail}</em></span></button>)}
        </div>
      </div>
      <aside><small>{selectedEdge ? scenario.selectedRelationshipLabel : `Selected ${selected.kind}`}</small><h3>{selectedEdge ? `${nodes.find((node) => node.id === selectedEdge.from)?.label} → ${nodes.find((node) => node.id === selectedEdge.to)?.label}` : selected.label}</h3><p>{selectedEdge ? `${selectedEdge.label} · ${selectedEdge.status} ${scenario.relationshipEvidenceLabel}` : selected.detail}</p><dl>{selectedEdge ? <><div><dt>Relationship</dt><dd>{selectedEdge.label}</dd></div><div><dt>Trace status</dt><dd><Badge>{selectedEdge.status}</Badge></dd></div></> : <><div><dt>Evidence</dt><dd>{selected.evidence}</dd></div><div><dt>Owner</dt><dd>{selected.owner}</dd></div><div><dt>Volume / scope</dt><dd>{selected.rows}</dd></div><div><dt>Trace status</dt><dd><Badge>{selected.status}</Badge></dd></div></>}</dl><ActionButton variant="primary" onClick={() => { setTraceOpen(true); setNotice(`Tracing every upstream source for ${traceTarget.label}.`); }}>{scenario.traceActionLabel}</ActionButton></aside>
    </div> : <Panel title={scenario.inventoryTitle} eyebrow={scenario.inventoryEyebrow}><div className={styles.lineageInventory}><div className={styles.tableHeading}>{scenario.inventoryHeaders.map((header) => <span key={header}>{header}</span>)}</div>{visibleNodes.map((node) => <button key={node.id} onClick={() => { setSelectedId(node.id); setView("map"); }}><span><strong>{node.label}</strong><small>{node.detail}</small></span><span>{node.lane}</span><span>{node.owner}</span><code>{node.evidence}</code><Badge>{node.status}</Badge></button>)}</div></Panel>}
    <div className={styles.caveatPanel}><span>{scenario.caveatLabel}</span><p>{scenario.caveat}</p><Badge tone="watch">{scenario.caveatBadge}</Badge></div>
    <InlineNotice>{notice}</InlineNotice>
    {traceOpen && <AccessibleModal title={`${scenario.traceModalPrefix} · ${traceTarget.label}`} description={scenario.traceDescription} onClose={() => setTraceOpen(false)} footer={<><ActionButton onClick={() => downloadJson(`${traceTarget.id}-source-trace.json`, { target:traceTarget, paths:tracePaths, nodes:traceNodes, edges:edges.filter((edge) => traceNodeIds.includes(edge.from) && traceNodeIds.includes(edge.to)) })}>{scenario.downloadTraceLabel}</ActionButton><ActionButton variant="primary" onClick={() => setTraceOpen(false)}>Done</ActionButton></>}>
      <div className={styles.sourceTrace}>
        <div className={styles.traceSummary}><Metric label={scenario.sourcePathsLabel} value={tracePaths.length} detail={scenario.sourcePathsDetail} /><Metric label={scenario.traceNodesLabel} value={traceNodes.length} detail={scenario.traceNodesDetail} /><Metric label={scenario.evidenceLinksLabel} value={traceNodes.filter((node) => node.evidence).length} detail={scenario.evidenceLinksDetail} tone="good" /></div>
        <section className={styles.traceTarget}><small>{scenario.selectedOutputLabel}</small><strong>{traceTarget.label}</strong><span>{traceTarget.detail} · {traceTarget.owner}</span><Badge>{traceTarget.status}</Badge></section>
        <div className={styles.tracePaths}>{tracePaths.map((path, pathIndex) => <section key={path.join("-")}><header><span>{scenario.pathLabel} {pathIndex + 1}</span><strong>{nodes.find((node) => node.id === path[0])?.label} → {traceTarget.label}</strong></header><div>{path.map((nodeId, index) => { const node = nodes.find((candidate) => candidate.id === nodeId)!; const nextId = path[index + 1]; const edge = nextId ? edges.find((candidate) => candidate.from === nodeId && candidate.to === nextId) : undefined; return <div className={styles.traceStep} key={nodeId}><article data-lane={node.lane}><i>{index + 1}</i><span><small>{node.kind} · {node.evidence}</small><strong>{node.label}</strong><p>{node.detail}</p><em>{node.owner} · {node.status}</em></span></article>{edge && <div className={styles.traceRelation}><i /><span>{edge.label}</span><Badge>{edge.status}</Badge></div>}</div>; })}</div></section>)}</div>
        <section className={styles.traceEvidence}><header><small>{scenario.evidenceRegisterLabel}</small><strong>{scenario.evidenceRegisterTitle}</strong></header><div>{scenario.evidenceRegisterHeaders.map((header) => <span key={header}>{header}</span>)}</div>{traceNodes.map((node) => <article key={node.id}><span><strong>{node.label}</strong><small>{node.owner}</small></span><span>{node.detail}</span><code>{node.evidence}</code><Badge>{node.status}</Badge></article>)}</section>
      </div>
    </AccessibleModal>}
  </div>;
}

type OutcomeMetric = {
  id:string;
  name:string;
  group:string;
  value:number | null;
  unit:string;
  status:string;
  confidence:string;
  provenance:string;
  dashboard?:{ band:string; tone:string; leverPosition:number };
  requiredData?:string[];
};

const doraMetrics: OutcomeMetric[] = [
  ...templateData.doraMetrics.metrics.map((metric) => ({ ...metric, name:metric.name, provenance:metric.status === "true" ? "Deployment events" : "Required event contract" })),
  { id:"change-failure-rate", name:"Change failure rate", group:"Instability", value:8.4, unit:"%", status:"proxy", confidence:"medium", dashboard:{ band:"medium", tone:"watch", leverPosition:58 }, provenance:"Rollback-labelled deployments" },
  { id:"reliability", name:"Reliability", group:"Reliability", value:99.93, unit:"% availability", status:"proxy", confidence:"low", dashboard:{ band:"high", tone:"good", leverPosition:76 }, provenance:"Synthetic health checks" },
];

const dccAssuranceMetrics: OutcomeMetric[] = [
  { id:"documents-assessed", name:"Documents assessed", group:"Throughput", value:48, unit:"documents/week", status:"verified", confidence:"high", dashboard:{ band:"high", tone:"good", leverPosition:84 }, provenance:"Completed assurance-run events" },
  { id:"finding-review-time", name:"Finding review time", group:"Throughput", value:6.8, unit:"hours", status:"verified", confidence:"medium", dashboard:{ band:"medium", tone:"watch", leverPosition:62 }, provenance:"Finding-created and reviewer-decision timestamps" },
  { id:"unresolved-evidence-age", name:"Unresolved evidence age", group:"Risk", value:null, unit:"days", status:"missing", confidence:"none", provenance:"Required evidence event contract", requiredData:["evidence_requested_at","evidence_resolved_at"] },
  { id:"finding-rejection-rate", name:"AI finding rejection rate", group:"Quality", value:14.8, unit:"%", status:"proxy", confidence:"medium", dashboard:{ band:"medium", tone:"watch", leverPosition:55 }, provenance:"Named reviewer decisions linked to AI findings" },
  { id:"requirement-traceability", name:"Requirement traceability", group:"Traceability", value:91, unit:"% requirements linked", status:"proxy", confidence:"medium", dashboard:{ band:"high", tone:"good", leverPosition:78 }, provenance:"Standards-to-excerpt relationship records" },
];

const metricScenarios = {
  base:{ metrics:doraMetrics, eyebrow:"Operational reporting template", title:"Example product", copy:"Five operational metrics with explicit true, proxy and missing provenance.", emptyTitle:"Operational data contract incomplete", emptyCopy:"Provide delivery, change and incident events for the selected product before true metrics can be calculated.", contractTitle:"Production data contract", fields:["service_id","event_timestamp","outcome"], primaryStatus:"true", primarySummaryLabel:"True metrics", statusOptions:[{ value:"all", label:"All metrics" },{ value:"true", label:"True metrics" },{ value:"proxy", label:"Proxy metrics" },{ value:"missing", label:"Missing data" }], readonlyNotice:"Read-only quality snapshot · metric definitions and provenance remain visible." },
  "dcc-hackathon":{ metrics:dccAssuranceMetrics, eyebrow:"Documentation assurance performance", title:"DCC assurance service", copy:"Five assurance metrics with explicit verified, proxy and missing provenance.", emptyTitle:"Assurance data contract incomplete", emptyCopy:"Provide document scans, standard mappings and human decision events before verified metrics can be calculated.", contractTitle:"Assurance data contract", fields:["assurance_run_id","decision_timestamp","review_outcome"], primaryStatus:"verified", primarySummaryLabel:"Verified metrics", statusOptions:[{ value:"all", label:"All metrics" },{ value:"verified", label:"Verified metrics" },{ value:"proxy", label:"Proxy metrics" },{ value:"missing", label:"Missing data" }], readonlyNotice:"Read-only assurance snapshot · metric definitions and evidence provenance remain visible." },
};

export function DoraMetricsTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const scenario = metricScenarios[scenarioId];
  const metrics = scenario.metrics;
  const [selectedId, setSelectedId] = useState(metrics[0].id);
  const [statusFilter, setStatusFilter] = useState("all");
  const selected = metrics.find((metric) => metric.id === selectedId) ?? metrics[0];
  const visible = statusFilter === "all" ? metrics : metrics.filter((metric) => metric.status === statusFilter);

  if (mode === "empty") return <EmptyState title={scenario.emptyTitle} copy={scenario.emptyCopy} />;

  return <div className={styles.doraShell}>
    <div className={styles.doraTitle}><div><small>{scenario.eyebrow}</small><h3>{scenario.title}</h3><p>{scenario.copy}</p></div><label>Status <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{scenario.statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div>
    <div className={styles.doraSummary}><Metric label={scenario.primarySummaryLabel} value={metrics.filter((metric) => metric.status === scenario.primaryStatus).length} detail="event-backed" tone="good" /><Metric label="Proxy metrics" value={metrics.filter((metric) => metric.status === "proxy").length} detail="clearly labelled" tone="watch" /><Metric label="Missing metrics" value={metrics.filter((metric) => metric.status === "missing").length} detail="contract shown" tone="risk" /></div>
    <div className={styles.metricCards}>{visible.map((metric) => {
      const dashboard = "dashboard" in metric && metric.dashboard ? metric.dashboard : { band:"missing", tone:"risk", leverPosition:0 };
      return <button key={metric.id} className={selectedId === metric.id ? styles.selectedMetric : ""} onClick={() => setSelectedId(metric.id)}><header><span>{metric.group}</span><Badge>{metric.status}</Badge></header><h4>{metric.name}</h4><div className={styles.gauge} style={{ "--gauge":`${dashboard.leverPosition}%` } as React.CSSProperties}><i><b /></i><span>low</span><span>high</span></div><strong>{metric.value ?? "—"} <small>{metric.unit}</small></strong><footer><Badge>{dashboard.band}</Badge><span>{metric.confidence} confidence</span></footer></button>;
    })}</div>
    <div className={styles.doraDetails}>
      <Panel title={selected.name} eyebrow="Supporting evidence"><dl><div><dt>Metric status</dt><dd><Badge>{selected.status}</Badge></dd></div><div><dt>Confidence</dt><dd>{selected.confidence}</dd></div><div><dt>Provenance</dt><dd>{selected.provenance}</dd></div></dl></Panel>
      <Panel title={scenario.contractTitle} eyebrow="Required inputs"><div className={styles.contractRows}>{selected.value === null && selected.requiredData ? selected.requiredData.map((input) => <span key={input}><code>{input}</code><Badge tone="risk">Missing</Badge></span>) : scenario.fields.map((field) => <span key={field}><code>{field}</code><Badge>Available</Badge></span>)}</div></Panel>
    </div>
    {mode === "readonly" && <InlineNotice tone="success">{scenario.readonlyNotice}</InlineNotice>}
  </div>;
}

const coverageSuites = [
  ...templateData.testCoverage.suites.map((suite, index) => ({ ...suite, trigger:["Every pull request", "UI-labelled changes", "API-labelled changes"][index], lastRun:["2 min ago", "18 min ago", "1 hour ago"][index] })),
  { id:"contract", name:"Contract compatibility", command:"npm run test:contracts", status:"Passing", cadence:"Every change", coverage:"Data and event contracts", trigger:"Every pull request", lastRun:"6 min ago" },
  { id:"resilience", name:"Resilience scenarios", command:"npm run test:resilience", status:"Failing", cadence:"Nightly", coverage:"Retry and failure handling", trigger:"Nightly schedule", lastRun:"9 hours ago" },
];

const genericCoverageAreas = [
  ...templateData.testCoverage.coverageAreas,
  { id:"contracts", area:"Data and event contracts", covered:true, evidence:"reports/contracts.json", scope:"Payload schemas and callback compatibility" },
  { id:"resilience", area:"Failure and retry paths", covered:false, evidence:"", scope:"Timeouts, retries and partial failures" },
  { id:"permissions", area:"Role and access controls", covered:true, evidence:"reports/access-matrix.json", scope:"Author, reviewer and read-only boundaries" },
];

const coverageScenarios = {
  base:{ suites:coverageSuites, areas:genericCoverageAreas, areaSuiteIds:["tier1","tier2","tier3","contract","resilience","tier1"], emptyTitle:"No quality telemetry discovered", emptyCopy:"Register test suites and their trigger, cadence, evidence path and coverage areas to build this map.", exportName:"generic-test-coverage.json", mapTitle:"Interactive quality map", mapCopy:"Trigger → suite → coverage evidence", inventoryTitle:"Test suite inventory", selectedLabel:"Selected suite", runLabel:"Run selected suite", viewLabel:"Coverage view", mapViewLabel:"Coverage map", telemetryViewLabel:"Suite telemetry", suiteMetricLabel:"Suites", suiteMetricDetail:"registered checks", mapAriaLabel:"Interactive test trigger, suite and coverage-area map", laneTitles:["RUN TRIGGERS","TEST SUITES","COVERAGE AREAS"], connectedLabel:"connected suite(s)", tableHeaders:["Suite","Trigger","Cadence","Status","Evidence"] },
  "dcc-hackathon":{
    suites:coverageSuites.map((suite, index) => ({
      ...suite,
      name:["Standards mapping checks","Document extraction checks","Finding provenance checks","Decision contract checks","Assurance recovery scenarios"][index],
      command:["assure run standards-mapping","assure run extraction","assure run provenance","assure run decisions","assure run recovery"][index],
      coverage:["Standards and requirement mappings","Document text and page references","AI findings and source excerpts","Human review decisions","Retry and partial scan handling"][index],
      trigger:["Every standards update","Every document upload","Every assurance run","Every review decision","Nightly schedule"][index],
      cadence:["Per published standard version","Per uploaded document","Per completed scan","Per reviewer decision","Nightly"][index],
      lastRun:["12 min ago","4 min ago","3 min ago","8 min ago","last night"][index],
    })),
    areas:genericCoverageAreas.map((area, index) => ({
      ...area,
      area:["Standards mapping","Document extraction","Source excerpt traceability","Assurance event contracts","Scan failure and retry paths","Reviewer role controls"][index],
      scope:["Clauses, profiles and inherited requirements","Text, tables and page locations","Finding-to-document evidence links","Run, finding and decision payloads","Timeouts, retries and partial results","Author, reviewer and read-only boundaries"][index],
      evidence:area.covered ? ["reports/standards-map.json","reports/extraction.json","reports/provenance.json","reports/contracts.json","","reports/reviewer-access.json"][index] : "",
    })),
    areaSuiteIds:["tier1","tier2","tier3","contract","resilience","contract"],
    emptyTitle:"No assurance telemetry discovered",
    emptyCopy:"Register standards, extraction, provenance and review checks to build this assurance coverage map.",
    exportName:"dcc-assurance-coverage.json",
    mapTitle:"Interactive assurance map",
    mapCopy:"Trigger → assurance check → evidence coverage",
    inventoryTitle:"Assurance check inventory",
    selectedLabel:"Selected assurance check",
    runLabel:"Run selected check",
    viewLabel:"Assurance coverage view",
    mapViewLabel:"Assurance map",
    telemetryViewLabel:"Assurance telemetry",
    suiteMetricLabel:"Checks",
    suiteMetricDetail:"registered assurance checks",
    mapAriaLabel:"Interactive assurance trigger, check and evidence-coverage map",
    laneTitles:["ASSURANCE TRIGGERS","ASSURANCE CHECKS","EVIDENCE AREAS"],
    connectedLabel:"connected check(s)",
    tableHeaders:["Check","Trigger","Cadence","Status","Evidence"],
  },
};

export function TestCoverageTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const scenario = coverageScenarios[scenarioId];
  const [view, setView] = useState<CoverageView>("map");
  const [suites, setSuites] = useState(() => scenario.suites.map((suite) => ({ ...suite })));
  const [selectedId, setSelectedId] = useState(suites[0].id);
  const [filter, setFilter] = useState("all");
  const selected = suites.find((suite) => suite.id === selectedId) ?? suites[0];
  const areas = mode === "empty" ? [] : scenario.areas;
  const visibleSuites = filter === "all" ? suites : suites.filter((suite) => suite.status.toLowerCase() === filter);
  const covered = areas.filter((area) => area.covered).length;

  if (mode === "empty") return <EmptyState title={scenario.emptyTitle} copy={scenario.emptyCopy} />;

  return <div className={styles.coverageShell}>
    <div className={styles.templateToolbar}><Segmented value={view} onChange={setView} label={scenario.viewLabel} options={[{ value:"map", label:scenario.mapViewLabel }, { value:"telemetry", label:scenario.telemetryViewLabel }]} /><div><label>Filter <select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="passing">Passing</option><option value="available">Available</option><option value="failing">Failing</option></select></label><ActionButton onClick={() => downloadJson(scenario.exportName, { suites, areas })}>Export</ActionButton></div></div>
    <div className={styles.coverageMetrics}><Metric label="Coverage" value={`${Math.round(covered / areas.length * 100)}%`} detail={`${covered} of ${areas.length} areas`} tone={covered === areas.length ? "good" : "watch"} /><Metric label={scenario.suiteMetricLabel} value={suites.length} detail={scenario.suiteMetricDetail} /><Metric label="Passing" value={suites.filter((suite) => suite.status === "Passing").length} detail="latest result" tone="good" /><Metric label="Visible gaps" value={areas.filter((area) => !area.covered).length} detail="need an owner" tone="risk" /></div>
    {view === "map" ? <div className={styles.coverageDiagramShell}>
      <div className={styles.coverageMapHeader}><div><small>{scenario.mapTitle}</small><strong>{scenario.mapCopy}</strong></div><div><span><i data-tone="pass" />Passing</span><span><i data-tone="available" />Available</span><span><i data-tone="fail" />Failing / gap</span></div></div>
      <div className={styles.coverageSvgWrap}><svg viewBox="0 0 980 500" role="img" aria-label={scenario.mapAriaLabel}><defs><marker id="test-coverage-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" /></marker></defs><text className={styles.coverageLaneTitle} x="32" y="28">{scenario.laneTitles[0]}</text><text className={styles.coverageLaneTitle} x="350" y="28">{scenario.laneTitles[1]}</text><text className={styles.coverageLaneTitle} x="690" y="28">{scenario.laneTitles[2]}</text>{[...new Set(suites.map((suite) => suite.trigger))].map((trigger,index) => <g key={trigger} className={styles.coverageTriggerNode}><rect x="32" y={52 + index * 96} width="225" height="62" rx="10" /><text x="48" y={78 + index * 96}>{trigger}</text><text className={styles.coverageNodeDetail} x="48" y={98 + index * 96}>{suites.filter((suite) => suite.trigger === trigger).length} {scenario.connectedLabel}</text></g>)}{suites.map((suite,index) => { const triggers = [...new Set(suites.map((item) => item.trigger))]; const triggerIndex = triggers.indexOf(suite.trigger); const y = 48 + index * 82; const fromY = 83 + triggerIndex * 96; const tone = suite.status === "Passing" ? "pass" : suite.status === "Failing" ? "fail" : "available"; return <g key={suite.id}><path className={styles.coverageConnector} d={`M257,${fromY} C300,${fromY} 305,${y + 31} 350,${y + 31}`} markerEnd="url(#test-coverage-arrow)" /><g role="button" tabIndex={0} className={`${styles.coverageSuiteNode} ${selectedId === suite.id ? styles.coverageNodeSelected : ""}`} data-tone={tone} onClick={() => setSelectedId(suite.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(suite.id); } }}><rect x="350" y={y} width="246" height="62" rx="10" /><text x="366" y={y + 25}>{suite.name}</text><text className={styles.coverageNodeDetail} x="366" y={y + 46}>{suite.status} · {suite.lastRun}</text></g></g>; })}{areas.map((area,index) => { const suiteIndex = Math.max(0, suites.findIndex((suite) => suite.id === scenario.areaSuiteIds[index])); const suite = suites[suiteIndex]; const suiteY = 79 + suiteIndex * 82; const y = 48 + index * 68; return <g key={area.id}><path className={styles.coverageConnector} d={`M596,${suiteY} C636,${suiteY} 646,${y + 27} 690,${y + 27}`} markerEnd="url(#test-coverage-arrow)" /><g role="button" tabIndex={0} className={styles.coverageAreaNode} data-tone={area.covered ? "pass" : "fail"} onClick={() => setSelectedId(suite.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(suite.id); } }}><rect x="690" y={y} width="255" height="54" rx="9" /><text x="705" y={y + 23}>{area.area}</text><text className={styles.coverageNodeDetail} x="705" y={y + 41}>{area.covered ? "Evidence linked" : "Coverage gap"}</text></g></g>; })}</svg></div>
      <aside className={styles.coverageInspector}><div><small>{scenario.selectedLabel}</small><h3>{selected.name}</h3><code>{selected.command}</code></div><dl><div><dt>Trigger</dt><dd>{selected.trigger}</dd></div><div><dt>Cadence</dt><dd>{selected.cadence}</dd></div><div><dt>Latest result</dt><dd><Badge>{selected.status}</Badge> {selected.lastRun}</dd></div><div><dt>Coverage claim</dt><dd>{selected.coverage}</dd></div></dl>{mode !== "readonly" && <ActionButton variant="primary" onClick={() => setSuites((current) => current.map((suite) => suite.id === selected.id ? { ...suite, status:"Passing", lastRun:"just now" } : suite))}>{scenario.runLabel}</ActionButton>}</aside>
    </div> : <Panel title={scenario.inventoryTitle} eyebrow="Latest telemetry"><div className={styles.suiteTable}><div className={styles.tableHeading}>{scenario.tableHeaders.map((header) => <span key={header}>{header}</span>)}</div>{visibleSuites.map((suite) => <button key={suite.id} onClick={() => setSelectedId(suite.id)}><span><strong>{suite.name}</strong><code>{suite.command}</code></span><span>{suite.trigger}</span><span>{suite.cadence}</span><Badge>{suite.status}</Badge><span>{suite.lastRun}</span></button>)}</div></Panel>}
    <div className={styles.gapList}>{areas.filter((area) => !area.covered).map((area) => <InlineNotice key={area.id} tone="warning"><strong>{area.area}:</strong> {area.scope}. Assign an owner and evidence path before claiming coverage.</InlineNotice>)}</div>
  </div>;
}
