import type { ScenarioId } from "./scenarios";

export type TrackerCriticalTask = {
  id:string;
  code:string;
  title:string;
  owner:string;
  progress:number;
  status:string;
  critical:boolean;
  stream:string;
  phase:"Discover" | "Delivery" | "Assure" | "Release";
  dependencies:string[];
  description:string;
  tags:string[];
};

export type TrackerFlowStage = {
  id:string;
  title:string;
  lane:string;
  owner:string;
  status:string;
  entry:string;
  action:string;
  exit:string;
};

export type TrackerRouteKey = "standard" | "expedited";

export type TrackerPatternFixture = {
  criticalTasks:TrackerCriticalTask[];
  criticalSectionTitle:string;
  criticalSectionCopy:string;
  criticalEyebrow:string;
  criticalTitle:string;
  flowStages:TrackerFlowStage[];
  routes:Record<TrackerRouteKey,{ label:string; description:string; stages:string[] }>;
  flowSectionTitle:string;
  flowSectionCopy:string;
  flowTitle:string;
  flowLanes:[string,string,string];
  initialTaskId:string;
  initialFlowId:string;
};

const baseCriticalTasks:TrackerCriticalTask[] = [
  { id:"frame", code:"DSC-01", title:"Frame the migration problem", owner:"Product", progress:100, status:"Complete", critical:true, stream:"Discovery", phase:"Discover", dependencies:[], description:"Agree the user, outcome, constraints, and evidence boundary.", tags:["scope","outcome"] },
  { id:"scope", code:"GOV-02", title:"Approve PoC scope", owner:"Programme lead", progress:100, status:"Complete", critical:true, stream:"Governance", phase:"Discover", dependencies:["frame"], description:"Confirm what will be demonstrated and which supporting states are illustrative.", tags:["gate"] },
  { id:"data", code:"DAT-03", title:"Prepare masked migration extract", owner:"Data engineering", progress:72, status:"In progress", critical:true, stream:"Data", phase:"Delivery", dependencies:["scope"], description:"Create representative, non-sensitive records for happy and failure paths.", tags:["privacy","data"] },
  { id:"api", code:"API-04", title:"Validate service contracts", owner:"Platform team", progress:58, status:"In review", critical:false, stream:"API", phase:"Delivery", dependencies:["scope"], description:"Prove the smallest stable contract needed by the interface.", tags:["integration"] },
  { id:"ui", code:"UI-05", title:"Assemble the demo journey", owner:"Experience team", progress:34, status:"In progress", critical:true, stream:"Experience", phase:"Delivery", dependencies:["data","api"], description:"Connect loading, success, empty, and recovery states.", tags:["ui","accessibility"] },
  { id:"assure", code:"ASS-06", title:"Run lightweight assurance", owner:"Assurance", progress:60, status:"In review", critical:false, stream:"Assurance", phase:"Assure", dependencies:["api"], description:"Check access, handling, dependency risk, and limitations.", tags:["security"] },
  { id:"rehearse", code:"TST-07", title:"Rehearse cutover scenarios", owner:"Delivery assurance", progress:20, status:"Blocked", critical:true, stream:"Testing", phase:"Assure", dependencies:["ui","assure"], description:"Run the agreed journey and confirm the fallback route.", tags:["test","evidence"] },
  { id:"release", code:"REL-08", title:"Confirm release readiness", owner:"Programme lead", progress:0, status:"Not started", critical:true, stream:"Release", phase:"Release", dependencies:["rehearse"], description:"Make the go/no-go decision and record known limitations.", tags:["gate","demo"] },
];

const dccCriticalTasks:TrackerCriticalTask[] = [
  { id:"frame", code:"SCP-01", title:"Define assurance scope", owner:"Assurance lead", progress:100, status:"Complete", critical:true, stream:"Scope", phase:"Discover", dependencies:[], description:"Agree the documents, intended decision and evidence boundary for DCC Assurance Run #018.", tags:["scope","assurance"] },
  { id:"scope", code:"STD-02", title:"Approve the standards set", owner:"Standards owner", progress:100, status:"Complete", critical:true, stream:"Standards", phase:"Discover", dependencies:["frame"], description:"Select ISO/IEC 27001, WCAG 2.2 AA, NIST AI RMF and the DCC HACK-01 profile.", tags:["standards","gate"] },
  { id:"data", code:"DOC-03", title:"Ingest solution documents", owner:"Document owner", progress:100, status:"Complete", critical:true, stream:"Documents", phase:"Delivery", dependencies:["scope"], description:"Upload the solution design, threat model and accessibility statement with source metadata.", tags:["documents","intake"] },
  { id:"api", code:"MAP-04", title:"Map selected requirements", owner:"Standards analyst", progress:86, status:"In review", critical:false, stream:"Mapping", phase:"Delivery", dependencies:["scope"], description:"Connect related requirements across the four selected standards before assessment.", tags:["requirements","relationships"] },
  { id:"ui", code:"RUN-05", title:"Run AI assurance #018", owner:"AI assurance service", progress:100, status:"Complete", critical:true, stream:"Assessment", phase:"Delivery", dependencies:["data","api"], description:"Assess extracted document passages against 238 mapped requirements and retain source links.", tags:["ai-assessment","provenance"] },
  { id:"assure", code:"REV-06", title:"Review 27 source-linked findings", owner:"Assurance reviewer", progress:85, status:"In review", critical:true, stream:"Human review", phase:"Assure", dependencies:["ui"], description:"Approve, decline or return every AI finding to a named owner with its cited passage visible.", tags:["human-review","findings"] },
  { id:"rehearse", code:"EVD-07", title:"Resolve five evidence requests", owner:"Document owners", progress:40, status:"Blocked", critical:true, stream:"Remediation", phase:"Assure", dependencies:["assure"], description:"Supply missing ownership, contrast and control evidence before the assurance result can be published.", tags:["evidence","remediation"] },
  { id:"release", code:"REP-08", title:"Publish the human-approved result", owner:"Assurance lead", progress:0, status:"Not started", critical:true, stream:"Publication", phase:"Release", dependencies:["rehearse"], description:"Record the final decision, remaining limitations and complete source-linked assurance report.", tags:["decision","report"] },
];

const baseFlowStages:TrackerFlowStage[] = [
  { id:"A", title:"Frame", lane:"Discover", owner:"Product", status:"complete", entry:"A useful problem or opportunity is identified.", action:"Define the user, outcome, boundary, and evidence needed.", exit:"The problem frame is clear enough for a scope decision." },
  { id:"B", title:"Approve scope", lane:"Discover", owner:"Programme lead", status:"complete", entry:"A problem frame and proposed demo boundary exist.", action:"Confirm value, feasibility, ownership, and constraints.", exit:"The team has an approved definition of done." },
  { id:"C", title:"Prototype", lane:"Deliver", owner:"Delivery team", status:"in-progress", entry:"Scope, sample data, and assumptions are known.", action:"Build the smallest end-to-end user journey.", exit:"The happy path works with representative data." },
  { id:"D", title:"Integrate", lane:"Deliver", owner:"Platform team", status:"required", entry:"UI and service slices work independently.", action:"Connect behaviour, empty states, and error states.", exit:"The journey works in its target environment." },
  { id:"E", title:"Assure", lane:"Prove", owner:"Assurance", status:"blocked", entry:"An integrated build is available.", action:"Run accessibility, data, and recovery checks.", exit:"Evidence and limitations are explicit." },
  { id:"F", title:"Demonstrate", lane:"Release", owner:"Demo team", status:"not-started", entry:"The route is rehearsed and a go decision exists.", action:"Demonstrate the outcome and supporting evidence.", exit:"Sponsors can decide what should happen next." },
];

const dccFlowStages:TrackerFlowStage[] = [
  { id:"A", title:"Scope assurance", lane:"Prepare", owner:"Assurance lead", status:"complete", entry:"A document set and intended assurance decision are identified.", action:"Define scope, owners, document versions and the evidence boundary.", exit:"The run has an accountable owner and explicit scope." },
  { id:"B", title:"Select standards", lane:"Prepare", owner:"Standards owner", status:"complete", entry:"The assurance scope is approved.", action:"Choose standards and map related requirements from the reusable library.", exit:"A versioned set of applicable requirements is ready." },
  { id:"C", title:"Upload & extract", lane:"Assess", owner:"Document owner", status:"complete", entry:"Standards and required document types are known.", action:"Upload documents, extract passages and preserve version metadata.", exit:"Every assessed passage can be traced to its source." },
  { id:"D", title:"Run AI assessment", lane:"Assess", owner:"AI assurance service", status:"complete", entry:"Source passages and mapped requirements are available.", action:"Generate candidate findings with requirement and passage citations.", exit:"Findings are ready for human review; none are treated as decisions." },
  { id:"E", title:"Human review", lane:"Review", owner:"Assurance reviewer", status:"in-progress", entry:"Source-linked candidate findings are available.", action:"Approve, decline or return findings and request missing evidence.", exit:"Every finding has a named human decision and rationale." },
  { id:"F", title:"Publish result", lane:"Publish", owner:"Assurance lead", status:"blocked", entry:"Review decisions and required evidence are complete.", action:"Publish the assurance report, residual gaps and audit trail.", exit:"The approved result is available with complete provenance." },
];

export const trackerPatternFixtures:Record<ScenarioId,TrackerPatternFixture> = {
  base:{
    criticalTasks:baseCriticalTasks,
    criticalSectionTitle:"Critical-path views.",
    criticalSectionCopy:"Move between the dependency canvas and readiness list, switch tasks or phases, combine filters, and inspect the selected record.",
    criticalEyebrow:"RETAIL MODERNISATION",
    criticalTitle:"Demo readiness path",
    flowStages:baseFlowStages,
    routes:{
      standard:{ label:"Standard route", description:"Full discovery, approval, build, assurance, and demonstration route.", stages:["A","B","C","D","E","F"] },
      expedited:{ label:"Expedited demo", description:"Uses an approved problem frame and moves directly into prototyping.", stages:["A","C","D","E","F"] },
    },
    flowSectionTitle:"Route-aware process flow.",
    flowSectionCopy:"Change route, select stages, move with arrow keys, inspect entry, action, and exit criteria, and update each stage status.",
    flowTitle:"Hackathon delivery flow",
    flowLanes:["DISCOVER","DELIVER","PROVE & RELEASE"],
    initialTaskId:"frame",
    initialFlowId:"C",
  },
  "dcc-hackathon":{
    criticalTasks:dccCriticalTasks,
    criticalSectionTitle:"Assurance critical path.",
    criticalSectionCopy:"Use the same dependency canvas and readiness list to track standards, documents, AI assessment, human review, remediation and publication.",
    criticalEyebrow:"DCC DOCUMENTATION ASSURANCE",
    criticalTitle:"Assurance readiness path",
    flowStages:dccFlowStages,
    routes:{
      standard:{ label:"Full assurance route", description:"Scope the run, select standards, extract documents, assess with AI, review with a named human and publish the result.", stages:["A","B","C","D","E","F"] },
      expedited:{ label:"Approved-profile route", description:"Uses the pre-approved DCC HACK-01 profile and moves directly from scope into document extraction.", stages:["A","C","D","E","F"] },
    },
    flowSectionTitle:"Documentation assurance process flow.",
    flowSectionCopy:"Use the same selectable, keyboard-operable stages to move from assurance scope to a human-approved, source-linked result.",
    flowTitle:"Standards-to-decision flow",
    flowLanes:["PREPARE","ASSESS","REVIEW & PUBLISH"],
    initialTaskId:"frame",
    initialFlowId:"E",
  },
};

export const trackerDccPatternDescriptions:Record<string,string> = {
  "poc-dashboard":"Review assurance health, finding progress, evidence coverage and remediation at a glance.",
  "poc-workflow-workbench":"Inspect each assurance run through intake, mapping, scanning, named review and decision.",
  "poc-chatbot":"Use source-aware AI support while keeping proposed record changes behind human approval.",
  "poc-architecture-map":"Explore the systems and interfaces behind standards ingestion, document assessment and assurance publication.",
};

export function trackerDemoUrl(folder:string, scenarioId:ScenarioId) {
  const base = `/poc-tracker-components/${folder}/demo.html`;
  return scenarioId === "dcc-hackathon" ? `${base}?scenario=dcc-hackathon` : base;
}
