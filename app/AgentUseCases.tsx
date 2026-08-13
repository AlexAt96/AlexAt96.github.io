"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import PortfolioBrand from "./PortfolioBrand";
import { RetroThemeSwitch, ShowroomSwitcher, TopbarIdentity } from "./PortfolioChrome";
import { showroomHref } from "./portfolioRoutes";
import { usePersistentDarkMode } from "./usePersistentTheme";
import { usePersistentSidebar } from "./usePersistentSidebar";
import ClassicBlueprintHero, { type ClassicBlueprintItem } from "./ClassicBlueprintHero";
import MethodOverviewDiagram from "./MethodOverviewDiagrams";
import {
  deepDiveById,
  methods,
  projects,
  type Method,
} from "./AgentMethods";

function StatusDot({ tone="operational" }: { tone?:"operational"|"foundation"|"defined"|"proposed"|"roadmap" }) {
  return <i className={`status-dot ${tone}`} aria-hidden="true" />;
}

type MethodUiIconName = "arrow-down" | "arrow-left" | "arrow-right" | "arrow-up" | "arrow-up-right" | "check" | "chevron-down" | "moon" | "sun" | "warning";

function MethodUiIcon({ name }: { name:MethodUiIconName }) {
  return <span className={`method-ui-icon method-ui-icon-${name}`} aria-hidden="true" />;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow:string; title:string; copy:string }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{copy}</p></div>;
}

const plainLanguage: Record<string,{ lead:string; what:string; result:string; problem:string; points:string[] }> = {
  "govern-change": {
    lead:"AI can do the work. People stay in charge.",
    what:"We agree the job first, give the agent a clear boundary, check the evidence and ask a named person to accept the result.",
    result:"A tested change that can be traced back to the person who asked for it and the person who approved it.",
    problem:"This stops an agent from widening the job, accepting its own work or treating a merge as proof that the change is finished.",
    points:["A person owns the outcome","The agent works inside an agreed boundary","A person accepts the tested result"],
  },
  "orchestrate-pods": {
    lead:"One lead. Several focused pods.",
    what:"The lead splits a large outcome into separate pieces of work. Each pod owns one piece and reports back in the same format.",
    result:"Several teams can work at the same time without losing one joined-up design or one accountable lead.",
    problem:"This gives us parallel delivery without duplicate work, clashing ownership or separate AI conversations making different design decisions.",
    points:["One lead sets the direction","Each pod owns a clear piece of work","All pod evidence comes back to one place"],
  },
  "isolate-build": {
    lead:"Every change gets its own safe workspace.",
    what:"Each agent works on its own branch, worktree, port and copy of the test data. It cannot overwrite another agent's work.",
    result:"Teams can build and test several changes at once, with clean evidence for each change.",
    problem:"This removes the collisions that happen when agents share a checkout, a test server or mutable data.",
    points:["One branch and worktree per task","Separate ports and test data","Evidence points to the right version"],
  },
  "scale-assurance": {
    lead:"Small change, fast checks. Risky change, deeper proof.",
    what:"Every change runs the basic checks. We add browser, data, security, migration and release tests when the risk calls for them.",
    result:"We get quick feedback without using lightweight checks to wave through a high-risk change.",
    problem:"This avoids both extremes: testing every tiny change like a release, or testing a major change like a wording update.",
    points:["Classify the change first","Always run the fast baseline","Add checks when risk increases"],
  },
  "safe-integration": {
    lead:"Bring changes together through one controlled route.",
    what:"One named integrator checks each change and brings it into the protected branch through the agreed queue, handover or pull request.",
    result:"We keep the main branch stable and can see exactly how each change was accepted.",
    problem:"Conflicts and stale approvals go back to the person who owns the change.",
    points:["Use one named convergence route","Protect the approved baseline","Stale work returns to its owner"],
  },
  "prove-lineage": {
    lead:"We can show why every release exists.",
    what:"The same identifiers follow the work from the original need through requirements, tasks, code, tests, approval and release.",
    result:"A client or reviewer can follow the complete story of a change without relying on memory or raw prompt history.",
    problem:"This removes the gaps between what was requested, what was built, what was tested and what was finally accepted.",
    points:["Give the need a stable ID","Carry it through code and tests","Tie approval to the released version"],
  },
  "review-ai-evidence": {
    lead:"AI suggestions stay suggestions until a person decides.",
    what:"The AI shows its source, confidence and limitations. A reviewer can approve, edit or reject each suggestion.",
    result:"Faster analysis without quietly turning a model's interpretation into an accepted fact.",
    problem:"This makes uncertainty visible and keeps professional judgement between AI output and the governed record.",
    points:["Every suggestion links to its source","Draft and approved content look different","Every decision is recorded"],
  },
  "constrain-mutation": {
    lead:"An agent can only change what we explicitly allow.",
    what:"Before the agent changes a record, we check the format, target and fields, show the exact edit and ask a person to confirm it.",
    result:"The agent can make useful updates without gaining broad access.",
    problem:"This controls what the agent can change. It does not replace sign-in or access controls.",
    points:["Allow only named records and fields","Validate the target and preview the change","A person explicitly confirms before save"],
  },
  "immutable-release": {
    lead:"Build once. Promote the same thing. Keep a way back.",
    what:"We build one release, give it a unique identity and promote that same build through every environment. We also keep a tested version to roll back to.",
    result:"We know exactly what went live and have a safe way back.",
    problem:"This stops different environments receiving slightly different builds and makes recovery a planned action rather than an improvisation.",
    points:["One artefact for every environment","Identity includes source and build evidence","Rollback points to a known-good release"],
  },
  "prompt-pack": {
    lead:"One delivery system for every AI conversation.",
    what:"The prompt pack gives every AI conversation the same approved project facts, the same A–G steps and clear points where work must stop.",
    result:"Agents start from the same context and do not continue when approval or evidence is missing.",
    problem:"This prevents separate conversations from inventing their own process, forgetting the project rules or starting code before the team is ready.",
    points:["One approved baseline","One controlled A–G route","Prompt E stops work that is not ready"],
  },
  "prebuild-gate": {
    lead:"No authority or evidence? No code.",
    what:"Before implementation, we check the approved task, dependencies, branch, owner, tests, reviewers and rollback route. Missing information produces a stop, not a guess.",
    result:"The agent starts one current, authorised task with everything needed to finish and prove it.",
    problem:"This catches stale scope, unavailable reviewers and incomplete dependencies before effort is spent on code.",
    points:["One explicit go or stop decision","Prompt E is a real hard gate","Material change means readiness is checked again"],
  },
  "context-handoffs": {
    lead:"Every agent starts and finishes with a complete packet.",
    what:"The lead gives each agent the task, decisions, workspace, files it can change, checks and stop conditions. The agent returns the change, test results, risks and decisions still needed.",
    result:"Work can be delegated, paused and resumed without rebuilding the story from chat history.",
    problem:"This prevents context loss, vague handoffs and agents quietly filling gaps with assumptions.",
    points:["A complete brief","A consistent handover","One lead checks everything still fits"],
  },
  "feature-test-apps": {
    lead:"Review the feature that was built—not whichever app happens to be running.",
    what:"We launch a separate application for the feature branch and record its URL, commit, dataset and expected behaviour for the reviewer.",
    result:"Human acceptance is tied to an exact version and a reproducible scenario.",
    problem:"This removes ambiguity when several branches, ports and datasets are active at the same time.",
    points:["One feature URL","Health metadata names the branch and data","The handoff states route, scenario and limitations"],
  },
  "independent-assurance": {
    lead:"The builder does not certify its own work.",
    what:"A separate reviewer inspects the change and calls in security, architecture, data or accessibility specialists when the risk requires them.",
    result:"Findings are independently recorded, fixed by the accountable owner and presented to the human approver.",
    problem:"This stops AI-authored tests or self-review being presented as independent assurance.",
    points:["Non-author review","Specialists follow the risk","Every blocker has an explicit disposition"],
  },
  "conflict-handback": {
    lead:"The person who owns the design resolves the conflict.",
    what:"When branches, contracts or approvals clash, integration stops and the work returns to its original owner for reconciliation, testing and fresh approval.",
    result:"No merge tool or agent silently makes a product decision while resolving Git history.",
    problem:"This keeps semantic conflicts, stale approvals and downstream effects visible instead of burying them in a merge.",
    points:["Fail closed on ambiguity","Keep both branches until a decision is made","Retest and reapprove changed behaviour"],
  },
  "activity-ledger": {
    lead:"Record AI contribution without storing the conversation.",
    what:"For acted-on AI work, we keep safe metadata: time, tool, model family where known, phase, linked records, confidence and limitations.",
    result:"We can show where AI helped without retaining raw prompts, secrets, personal data or invented usage figures.",
    problem:"This gives the delivery record useful provenance while avoiding a sensitive transcript archive.",
    points:["One safe row per acted-on activity","Link activity to delivery evidence","Measure accepted outcomes and rework—not prompt volume"],
  },
  "establish-baseline": {
    lead:"Start every delivery route from the same approved facts.",
    what:"We gather the business goal, technical starting point, constraints and authoritative sources, then keep facts, assumptions and open questions separate and assign an owner to every material gap.",
    result:"One controlled baseline for people, prompts and agents before implementation authority is issued.",
    problem:"This stops different conversations from inventing different versions of the project or quietly turning unknowns into facts.",
    points:["Name the authoritative sources","Keep assumptions and gaps visible","Approve and refresh one baseline"],
  },
  "architecture-standards": {
    lead:"Make the engineering rules part of the work—not an optional reminder.",
    what:"We record architecture decisions, coding conventions, test strategy, review triggers and the evidence required by the Definition of Done.",
    result:"Every task follows one current technical and assurance contract.",
    problem:"This prevents fast AI output from drifting away from the system design, client duties or quality threshold.",
    points:["Version architecture decisions","Trigger assurance by risk","Define done with evidence and human approval"],
  },
  "select-route": {
    lead:"Use the smallest safe route—and explain why.",
    what:"We classify functional, technical, data, security and release impact, then select the full, no-functional-change or constrained short route and name every gate it still requires.",
    result:"A proportionate delivery path that is explicit, reviewable and refreshed after material change.",
    problem:"This stops a short route becoming a convenient way to bypass design, readiness or assurance.",
    points:["Classify impact first","Record why any stage is omitted","Reclassify after material change"],
  },
  "baseline-forecast-change": {
    lead:"Freeze the baseline. Forecast the uncertainty. Control every change.",
    what:"We keep conventional and AI-assisted estimates separate, use best, likely and worst-case estimates to create P50 and P80 forecasts, then track progress against the approved plan.",
    result:"We can show the likely outcome, the safer outcome and exactly why the forecast changed.",
    problem:"This stops optimistic estimates or missing values from silently rewriting the delivery plan.",
    points:["Keep conventional and AI estimates distinct","Missing values stay missing","Change requests never rewrite history"],
  },
  "report-evidence": {
    lead:"Freeze the numbers once. Publish them consistently everywhere.",
    what:"We freeze a measurement snapshot, keep its evidence gaps, limitations, findings and RAID exposure, then generate PDF, PowerPoint, Excel and JSON outputs from the same governed record.",
    result:"Reports that can be explained and reproduced after publication.",
    problem:"This prevents formats drifting apart or point-in-time evidence being presented as live telemetry.",
    points:["One frozen snapshot per report","The same evidence feeds every format","Archive the source template and limitations"],
  },
  "separate-environments": {
    lead:"Keep every environment—and its data—inside a clear boundary.",
    what:"We separate development, test, UAT or staging and production state, configuration and stores, then use synthetic, masked or approved copied data outside production.",
    result:"Controlled promotion without non-production work leaking into client or production state.",
    problem:"This stops local test isolation being confused with production proof and prevents environments sharing mutable data or credentials.",
    points:["Separate stores and configuration","Use safe non-production data","State which environments are implemented or only defined"],
  },
  "protect-identity-data": {
    lead:"Protect people, credentials and client data—and state the gaps.",
    what:"We define the identity boundary that actually exists, keep secrets out of code and prompts, classify data, validate uploads and require an explicit action before AI processing.",
    result:"A clear protection model without inventing enterprise authentication or RBAC.",
    problem:"This prevents local safeguards being overstated as production identity and keeps sensitive content out of unsafe routes.",
    points:["Claim only implemented identity controls","Keep credentials in approved stores","Validate and explicitly trigger uploads"],
  },
  "backup-restore-audit": {
    lead:"A backup counts only when recovery is owned, tested and explainable.",
    what:"We name the critical state, create protected backups, test restoration in isolation, apply retention and disposal rules and preserve the audit trail.",
    result:"A recoverable data lifecycle with current limitations visible.",
    problem:"This stops a local copy being described as off-device disaster recovery.",
    points:["Test the restore, not just the backup","Name retention and disposal","Keep recovery ownership and gaps visible"],
  },
  "observe-recover": {
    lead:"See the problem. Make one decision. Recover to a known-good state.",
    what:"Health, readiness, logs, metrics, traces, alerts and correlation IDs identify the affected version; a named person decides whether to continue, roll back or restore, then the team verifies service and data again.",
    result:"Faster recovery with one evidence chain from alert to post-recovery proof.",
    problem:"This prevents rollback being improvised from memory or configured observability being presented as live evidence.",
    points:["Correlate signals to release identity","Use a named decision window","Verify health and data after recovery"],
  },
  "boards-delivery-spine": {
    lead:"Boards is the delivery spine—not just the to-do list.",
    what:"We connect the Epic, story, task or bug to the approved requirement, design, branch, PR, build, tests and human decision, then move state only when the evidence for that step exists.",
    result:"One Azure DevOps record that explains where the change came from, what controls it and why it is—or is not—complete.",
    problem:"This stops disconnected tickets, ad-hoc tasks and a merge being mistaken for accepted delivery.",
    points:["Stable IDs connect every level","Each state has an evidence-based exit","Incomplete ADO mapping stays visible"],
  },
  "pr-proof-pack": {
    lead:"Make the pull request carry the whole proof.",
    what:"One focused branch enters a structured PR with its scope, trace links, checks, impacts, AI contribution, reviewer decisions, residual risk and recovery route. A source push resets the old approval.",
    result:"A protected merge decision that can be reconstructed from the exact source a non-author reviewed.",
    problem:"This stops a green badge or generic approval hiding missing context, unrun checks or stale review.",
    points:["One governed change per branch","Record actual checks and unavailable evidence","Reset approval whenever the reviewed source changes"],
  },
  "assurance-ladder": {
    lead:"Prove the task. Then earn the bigger claim.",
    what:"We verify the focused task first, then every story criterion, the integrated stream and finally the complete functional and non-functional release journey.",
    result:"The team can say exactly which level is proven without turning a local test pass into a release claim.",
    problem:"This stops task evidence being stretched beyond the story, stream or release it actually covers.",
    points:["Task proof is only level one","Every story criterion needs evidence","Release adds E2E, NFR and rollback proof"],
  },
  "source-stat-pack": {
    lead:"Build the numbers from source facts—not manual memory.",
    what:"At a fixed date and code version, we collect read-only facts from Git and Azure DevOps, match their IDs, define how each number is calculated and publish a dated stat pack.",
    result:"Every number can be traced back and calculated again.",
    problem:"This prevents double counting, silent refreshes and missing information being converted to zero.",
    points:["Pin time, ref and commit before counting","Carry source, denominator and confidence","Unavailable is never zero"],
  },
  "delivery-system-alignment": {
    lead:"Check that the governed system and the live system still agree.",
    what:"At a fixed point in time, we compare what the process says should exist with what is actually in Azure DevOps, the repository, CI and reports. Every mismatch gets an owner and a fix.",
    result:"We can see drift, stale approvals, missing evidence and unowned work.",
    problem:"This stops documented controls being assumed to exist in the repository or administrator configuration.",
    points:["Compare eight delivery layers","Preserve history and block stale authority","Close discrepancies only with fresh proof"],
  },
};

type SetupGuide = {
  goal:string;
  prerequisites:string[];
  setup:{ title:string; owner:string; action:string; produces:string }[];
  rhythm:{ trigger:string; action:string; record:string }[];
};

const setupById: Record<string,SetupGuide> = {
  "govern-change": {
    goal:"Create one controlled route from an authorised need to a named acceptance decision.",
    prerequisites:["Authorised request and acceptance criteria","Named outcome, risk and approval owners","Agreed task, branch and review route","Safe test data and an evidence location"],
    setup:[
      {title:"Name the authority",owner:"Business or product owner",action:"Record who requested the change, who owns the outcome, who accepts the risk and who can approve release.",produces:"Authority record"},
      {title:"Prepare the change packet",owner:"Delivery and technical lead",action:"Join the scope, acceptance criteria, design, task boundary, reviewer, test route and rollback expectation.",produces:"Ready change packet"},
      {title:"Bind work to evidence",owner:"Task owner",action:"Assign the branch, worktree, test URL, fixture and evidence location before implementation begins.",produces:"Traceable workspace"},
      {title:"Set the human gates",owner:"Named approvers",action:"Make readiness, review, acceptance and merge explicit decisions. The agent can recommend; it cannot approve itself.",produces:"Visible gate status"},
    ],
    rhythm:[
      {trigger:"A change is requested",action:"Confirm authority, outcome and acceptance criteria.",record:"Request ID and named owners"},
      {trigger:"Before build starts",action:"Check task boundary, workspace and test route.",record:"Readiness decision"},
      {trigger:"Implementation completes",action:"Review code, tests, risks and exceptions together.",record:"Completion packet"},
      {trigger:"Before integration",action:"A person accepts or returns the change.",record:"Approval, approver and time"},
    ],
  },
  "orchestrate-pods": {
    goal:"Let several specialist pods work in parallel while one lead keeps the design, priorities and final evidence joined up.",
    prerequisites:["Outcome and dependency map","Frozen shared contracts","Pod brief and hand-off template","Owned and prohibited file map"],
    setup:[
      {title:"Split by outcome",owner:"AI technical lead",action:"Break the work into bounded outcomes with explicit dependencies, not a loose list of prompts.",produces:"Pod map"},
      {title:"Route the specialists",owner:"AI technical lead",action:"Choose the minimum useful pod set, using the T0–T4 routing model where the project needs specialist depth.",produces:"Named pod assignments"},
      {title:"Commission each pod",owner:"Lead and pod owner",action:"Give every pod the task, branch, worktree, owned files, prohibited files, checks and stopping conditions.",produces:"Context capsule"},
      {title:"Define convergence",owner:"AI technical lead",action:"Require the same completion packet from every pod, then resolve dependencies and exceptions in one place.",produces:"Joined delivery packet"},
    ],
    rhythm:[
      {trigger:"Work is decomposed",action:"Freeze interfaces and commission bounded pods.",record:"Pod briefs and dependency map"},
      {trigger:"A pod is working",action:"Report status, decisions, blockers and boundary changes.",record:"Pod activity trail"},
      {trigger:"A pod finishes",action:"Return commit, checks, evidence, risks and unresolved decisions.",record:"Completion packet"},
      {trigger:"Pods converge",action:"The lead checks fit, resolves overlap and approves the joined route.",record:"Integration decision"},
    ],
  },
  "isolate-build": {
    goal:"Give every task its own code, runtime and test-data boundary so parallel work cannot contaminate another change.",
    prerequisites:["Current protected main","Task and branch naming rule","Owned file boundary","Safe disposable fixture"],
    setup:[
      {title:"Create the workspace",owner:"Task owner",action:"Create a named feature branch and sibling worktree from the current protected main.",produces:"Branch and worktree pair"},
      {title:"Bind ownership",owner:"Technical lead",action:"List the files the task may change and the shared or protected paths it must not touch.",produces:"Write boundary"},
      {title:"Separate the runtime",owner:"Task owner",action:"Allocate a unique port, process, temporary state and safe dataset for this branch.",produces:"Isolated test instance"},
      {title:"Register and retire",owner:"Task owner",action:"Record URL, PID, branch, dataset and start time; remove the runtime and worktree after acceptance.",produces:"Runtime record and clean-up"},
    ],
    rhythm:[
      {trigger:"Task starts",action:"Create and register the isolated workspace.",record:"Branch, worktree and owner"},
      {trigger:"Server starts",action:"Confirm the port, dataset and running SHA.",record:"Test URL and runtime identity"},
      {trigger:"Evidence is captured",action:"Tie screenshots and results to the branch and fixture.",record:"Evidence manifest"},
      {trigger:"Task is accepted",action:"Stop the process and retire temporary resources.",record:"Clean-up confirmation"},
    ],
  },
  "scale-assurance": {
    goal:"Match the depth of proof to the change risk and blast radius without skipping a common baseline.",
    prerequisites:["Risk classification rules","Tiered test catalogue","Safe representative fixtures","Evidence and exception schema"],
    setup:[
      {title:"Define the risk triggers",owner:"Quality and technical leads",action:"Name the UI, API, data, infrastructure, security, migration and performance conditions that increase assurance.",produces:"Risk matrix"},
      {title:"Set the baseline",owner:"Engineering lead",action:"Require fast static, unit and contract checks for every change, regardless of size.",produces:"Tier 1 gate"},
      {title:"Map deeper suites",owner:"Quality lead",action:"Attach browser, API, persistence, migration, security, performance and rollback suites to the relevant triggers.",produces:"Tier 2 and 3 routes"},
      {title:"Define honest evidence",owner:"Reviewer",action:"Record pass, fail, not run and exception states separately; an unrun check is never presented as passed.",produces:"Assurance manifest"},
    ],
    rhythm:[
      {trigger:"Change is scoped",action:"Classify risk and blast radius.",record:"Assurance tier"},
      {trigger:"Code is ready",action:"Run the mandatory fast baseline.",record:"Tier 1 results"},
      {trigger:"A risk trigger applies",action:"Add the mapped specialist suites.",record:"Tier 2 or 3 evidence"},
      {trigger:"Review begins",action:"Assess results, gaps and exceptions together.",record:"Acceptance recommendation"},
    ],
  },
  "safe-integration": {
    goal:"Keep the protected baseline predictable by separating build authority from integration authority and applying the project’s evidenced convergence route.",
    prerequisites:["Protected baseline","Current feature commit","Approval and test evidence","Named integration or convergence plan"],
    setup:[
      {title:"Separate the roles",owner:"Engineering lead",action:"The feature owner prepares the change; a named integrator verifies and merges it.",produces:"Clear merge authority"},
      {title:"Standardise the request",owner:"Feature owner",action:"Submit branch, worktree, source and target SHAs, approver, task, test URL and evidence notes.",produces:"Merge request record"},
      {title:"Apply the control route",owner:"Integrator",action:"Use the agreed serial queue, reviewed handoff or protected-pull-request route for this level of risk.",produces:"Auditable convergence record"},
      {title:"Enforce the checks",owner:"Integrator",action:"Check ancestry, cleanliness, approval and fast-forward eligibility; return conflicts to the feature owner.",produces:"Merge or owner hand-back"},
    ],
    rhythm:[
      {trigger:"Change is accepted",action:"Create a complete merge request.",record:"Requested SHAs and provenance"},
      {trigger:"Integration is scheduled",action:"Apply the project-specific integration control and refresh the protected baseline.",record:"Processing or convergence state"},
      {trigger:"Preconditions pass",action:"Fast-forward and run post-merge checks.",record:"Integrated SHA and results"},
      {trigger:"Conflict or drift appears",action:"Block the item and return it to its owner.",record:"Reason and required action"},
    ],
  },
  "prove-lineage": {
    goal:"Carry stable identifiers from the original need through build, test, approval and release.",
    prerequisites:["Identifier scheme","Acceptance and traceability matrix","Repository and work-item access","Evidence privacy rules"],
    setup:[
      {title:"Define the ID chain",owner:"Delivery lead",action:"Choose the identifiers for need, requirement, acceptance criterion, task, test, approval and release.",produces:"Traceability model"},
      {title:"Put IDs into the work",owner:"Product and engineering",action:"Carry the identifiers through templates, prompts, branches, pull requests, tests and evidence names.",produces:"Connected delivery records"},
      {title:"Bind execution metadata",owner:"Task owner",action:"Attach source SHA, build, test run, agent activity and reviewer decisions to the same chain.",produces:"Provenance trail"},
      {title:"Publish the claim boundary",owner:"Delivery assurance",action:"Show what is evidenced, what is inferred and what remains incomplete in the report and release record.",produces:"Defensible evidence index"},
    ],
    rhythm:[
      {trigger:"Need is accepted",action:"Create the stable identifiers and acceptance map.",record:"Need-to-criterion links"},
      {trigger:"Task is commissioned",action:"Propagate IDs into branch, prompt and work item.",record:"Task lineage"},
      {trigger:"Checks run",action:"Attach test results and artefact identity.",record:"Verification links"},
      {trigger:"Release is approved",action:"Close the chain with approver and released digest.",record:"End-to-end trace"},
    ],
  },
  "review-ai-evidence": {
    goal:"Use AI to accelerate analysis while keeping its suggestions visibly draft, source-linked and subject to professional judgement.",
    prerequisites:["Approved evidence sources","Explicit AI trigger","Draft and approved states","Decision audit schema"],
    setup:[
      {title:"Bound the question",owner:"Reviewer",action:"Name the allowed action, evidence set and decision the AI is supporting before extraction starts.",produces:"Authorised analysis task"},
      {title:"Require provenance",owner:"AI service owner",action:"Return the source location, confidence, OCR status and limitations with every suggestion.",produces:"Source-linked draft"},
      {title:"Separate the states",owner:"Product and design",action:"Make generated, edited and approved content visually and technically distinct.",produces:"Reviewable interface"},
      {title:"Record the decision",owner:"Named reviewer",action:"Approve, edit or decline each suggestion and retain who decided, when and why.",produces:"Human decision trail"},
    ],
    rhythm:[
      {trigger:"Reviewer requests help",action:"Run only the authorised extraction or recommendation.",record:"Trigger and source set"},
      {trigger:"AI returns a draft",action:"Display evidence, confidence and limitations together.",record:"Draft suggestion"},
      {trigger:"Human reviews",action:"Approve, edit or decline the suggestion.",record:"Decision and rationale"},
      {trigger:"Record is updated",action:"Preserve source, draft and final value.",record:"Before-and-after audit"},
    ],
  },
  "constrain-mutation": {
    goal:"Allow useful AI-assisted updates without giving an agent broad write access to the delivery system.",
    prerequisites:["Writable record and field list","Valid identifier rules","Versioned schema and caps","Human preview route"],
    setup:[
      {title:"Version the contract",owner:"System owner",action:"Define the exact JSON shape, allowed values and action version for every supported update.",produces:"Write schema"},
      {title:"Create the allowlists",owner:"Product and engineering",action:"Name valid record types, fields and actions; reject unknown target identifiers and protected fields.",produces:"Mutation boundary"},
      {title:"Validate and limit",owner:"Engineering",action:"Apply payload caps, strip unknown fields and reject stale, malformed or over-broad requests.",produces:"Validated change preview"},
      {title:"Keep a human commit point",owner:"Record owner",action:"Show the proposed difference and require approve, edit or reject before the governed record changes.",produces:"Audited mutation"},
    ],
    rhythm:[
      {trigger:"AI proposes an update",action:"Check response schema, record and field allow-lists, target identifier and proposal caps.",record:"Validation event"},
      {trigger:"Validation passes",action:"Show the exact before-and-after preview.",record:"Proposed difference"},
      {trigger:"Owner decides",action:"Approve, edit or reject the bounded action.",record:"Decision and actor"},
      {trigger:"Write completes",action:"Store old value, new value and source task.",record:"Immutable audit event"},
    ],
  },
  "immutable-release": {
    goal:"Build one identifiable artefact, promote that exact artefact and keep a tested route back to the previous good version.",
    prerequisites:["Protected source SHA","Locked dependencies and pipeline","Digest-capable registry","Readiness and rollback runbooks"],
    setup:[
      {title:"Build once",owner:"Release pipeline",action:"Create the artefact from the protected source SHA with locked dependencies and reproducible metadata.",produces:"Immutable digest"},
      {title:"Bind release evidence",owner:"Security and platform",action:"Generate the SBOM and scan evidence, then bind them and the source SHA to the same digest.",produces:"Release evidence bundle"},
      {title:"Gate promotion",owner:"Release authority",action:"Promote by digest through environments with no-mutation defaults and explicit approvals.",produces:"Environment history"},
      {title:"Prepare recovery",owner:"Service owner",action:"Record the previous known-good digest, owner, decision window and rollback verification steps.",produces:"Actionable rollback pointer"},
    ],
    rhythm:[
      {trigger:"Protected SHA is selected",action:"Build and identify one immutable artefact, then bind its evidence.",record:"Digest, SBOM, scan evidence and source SHA"},
      {trigger:"Environment is ready",action:"Approve promotion of the existing digest.",record:"Promotion decision"},
      {trigger:"Production is approved",action:"Deploy the same digest and verify health.",record:"Release identity and checks"},
      {trigger:"Recovery is needed",action:"Restore the known-good digest and verify service.",record:"Rollback event"},
    ],
  },
  "prompt-pack": {
    goal:"Turn approved context into a governed A–G prompt system with proportionate control and clear hard stops.",
    prerequisites:["Source documents and project context","Named delivery roles","Engineering, test and security standards","Traceability scheme"],
    setup:[
      {title:"Establish context",owner:"Delivery lead",action:"Capture sources, constraints, unknowns and discovery findings before shaping the delivery route.",produces:"Grounded project context"},
      {title:"Define the rules",owner:"Architecture and assurance leads",action:"Record the architecture, coding, testing, governance, security, hard-stop and provenance rules that the project pack must enforce.",produces:"Approved delivery baseline"},
      {title:"Create the working specification",owner:"AI technical lead",action:"Join the approved context and evidence into the implementation-ready baseline used by the project-specific pack.",produces:"Joined specification"},
      {title:"Generate and install A–G",owner:"Delivery lead",action:"Create the A–G route with only the prompts, specialist controls and evidence requirements this work needs.",produces:"Controlled A–G pack"},
    ],
    rhythm:[
      {trigger:"A · Change arrives",action:"Capture intent, authority, scope and initial evidence.",record:"Intake record"},
      {trigger:"B–D · Work is shaped",action:"Assess impact, design the route and create bounded tasks.",record:"Impact, design and task pack"},
      {trigger:"E · Before implementation",action:"Apply the hard stop if authority, context or readiness is missing.",record:"Go or stop decision"},
      {trigger:"F–G · Deliver and close",action:"Execute one task, then integrate, release and update the evidence.",record:"Completion and release record"},
    ],
  },
  "prebuild-gate": {
    goal:"Create an executable hard stop between approved planning and repository-changing work.",
    prerequisites:["Current approved task and design","Dependency and contract state","Named branch, owner and boundary","Available tests, reviewers and rollback"],
    setup:[
      {title:"Define the checklist",owner:"Delivery lead",action:"Turn authority, dependencies, workspace, assurance and recovery into explicit readiness fields.",produces:"Readiness template"},
      {title:"Bind current context",owner:"Task owner",action:"Link the exact task, design, decisions, branch and acceptance criteria that the gate authorises.",produces:"Current task packet"},
      {title:"Make missing mean stop",owner:"Tooling / prompt owner",action:"Block implementation when a required field, predecessor, reviewer or check is unavailable.",produces:"Fail-closed gate"},
      {title:"Name the decision",owner:"Human authority",action:"Record go or stop for the exact task boundary and invalidate it after material change.",produces:"Readiness decision"},
    ],
    rhythm:[
      {trigger:"Task reaches pre-build",action:"Reload authoritative context and dependencies.",record:"Readiness snapshot"},
      {trigger:"A field is missing",action:"Stop and route the gap to its owner.",record:"Blocked reason"},
      {trigger:"All checks are ready",action:"A named person issues go.",record:"Approver and time"},
      {trigger:"Scope changes",action:"Invalidate the decision and repeat the gate.",record:"Stale approval trail"},
    ],
  },
  "context-handoffs": {
    goal:"Standardise what every delegated agent receives and what it must return.",
    prerequisites:["Approved bounded task","Current decisions and dependencies","Branch, worktree and file boundaries","Acceptance and evidence requirements"],
    setup:[
      {title:"Create the capsule",owner:"Commissioning lead",action:"Package the task, context, decisions, workspace, owned and prohibited paths.",produces:"Context capsule"},
      {title:"State stopping conditions",owner:"Commissioning lead",action:"Name required checks, escalation triggers and the authority the agent does not have.",produces:"Execution contract"},
      {title:"Standardise completion",owner:"Lead integrator",action:"Require commit, files, tests, findings, blockers, risks and remaining approvals in one shape.",produces:"Completion template"},
      {title:"Set convergence ownership",owner:"Lead integrator",action:"Name who compares the returned packet with the original commission and makes the next decision.",produces:"Handoff route"},
    ],
    rhythm:[
      {trigger:"Work is delegated",action:"Issue a self-contained context capsule.",record:"Commission packet"},
      {trigger:"Boundary pressure appears",action:"Stop and escalate rather than infer.",record:"Decision request"},
      {trigger:"Agent finishes",action:"Return the standard completion packet.",record:"Commit, evidence and risks"},
      {trigger:"Lead reviews",action:"Integrate, remediate or return the packet.",record:"Convergence decision"},
    ],
  },
  "feature-test-apps": {
    goal:"Give every reviewable feature an identifiable application instance tied to its branch and safe dataset.",
    prerequisites:["Accepted feature commit","Unique port and state directory","Representative safe fixture","Human review scenario"],
    setup:[
      {title:"Select the proof version",owner:"Task owner",action:"Pin the exact branch and commit the reviewer is being asked to accept.",produces:"Feature identity"},
      {title:"Allocate the runtime",owner:"Test-app tooling",action:"Create a unique port, process, data directory and fixture for the feature.",produces:"Isolated instance"},
      {title:"Expose health metadata",owner:"Test-app tooling",action:"Return URL, PID, branch, commit, dataset and start time after health succeeds.",produces:"Runtime state record"},
      {title:"Prepare the handoff",owner:"Task owner",action:"State route, scenario, expected result, test data and known limitations.",produces:"Human test handoff"},
    ],
    rhythm:[
      {trigger:"Feature is ready",action:"Launch the isolated instance.",record:"URL and runtime identity"},
      {trigger:"Health passes",action:"Register branch, commit and dataset.",record:"Healthy feature state"},
      {trigger:"Reviewer tests",action:"Capture acceptance or return against that instance.",record:"Human decision"},
      {trigger:"Review closes",action:"Retain evidence and retire the runtime.",record:"Clean-up confirmation"},
    ],
  },
  "independent-assurance": {
    goal:"Separate implementation from the review that recommends whether the change is safe to accept.",
    prerequisites:["Exact diff and author","Validation evidence","Risk classification","Independent reviewer and specialists"],
    setup:[
      {title:"Separate the roles",owner:"Engineering lead",action:"Name an implementation owner and a non-author reviewer; keep acceptance authority separate from both.",produces:"Assurance ownership"},
      {title:"Route specialists",owner:"Review lead",action:"Map security, architecture, data, accessibility and performance triggers to named reviewers.",produces:"Specialist route"},
      {title:"Define findings states",owner:"Quality lead",action:"Use open, accepted risk, remediated and blocked states with evidence for every disposition.",produces:"Findings model"},
      {title:"Return fixes to owner",owner:"Review lead",action:"Send remediation to the original owner and require affected checks to run again.",produces:"Closed review loop"},
    ],
    rhythm:[
      {trigger:"Change is submitted",action:"Reviewer inspects code, behaviour and evidence.",record:"Review findings"},
      {trigger:"Risk trigger applies",action:"Call the relevant specialist.",record:"Specialist disposition"},
      {trigger:"Finding blocks",action:"Owner remediates and reruns checks.",record:"Fix evidence"},
      {trigger:"Review completes",action:"Reviewer recommends accept or return.",record:"Assurance recommendation"},
    ],
  },
  "conflict-handback": {
    goal:"Make conflict resolution an owned design decision followed by fresh validation and approval.",
    prerequisites:["Blocked branch or queue item","Current protected baseline","Named behaviour or contract owner","Affected checks and approvals"],
    setup:[
      {title:"Define blocking conditions",owner:"Integrator",action:"Stop on stale ancestry, overlapping ownership, contract drift and invalid approval.",produces:"Conflict policy"},
      {title:"Preserve the evidence",owner:"Integrator",action:"Retain both branches, the blocked reason and the approval that became stale.",produces:"Blocked-item record"},
      {title:"Name reconciliation ownership",owner:"Delivery lead",action:"Return the work to the original task or shared-contract owner—not the queue agent.",produces:"Owner handback"},
      {title:"Require a fresh route",owner:"Reviewer / approver",action:"Rerun affected checks and renew approval before the item may re-enter the queue.",produces:"Requeue criteria"},
    ],
    rhythm:[
      {trigger:"Conflict is detected",action:"Block integration and record the exact reason.",record:"Blocked queue item"},
      {trigger:"Owner receives it",action:"Refresh, reconcile and document the decision.",record:"Resolution commit"},
      {trigger:"Behaviour changed",action:"Rerun affected assurance and approval.",record:"Current evidence"},
      {trigger:"Route is current",action:"Submit a new merge request.",record:"Fresh provenance"},
    ],
  },
  "activity-ledger": {
    goal:"Create useful AI provenance without retaining raw conversations or unsafe content.",
    prerequisites:["Activity identifier and timestamp","Tool and capability mode","Safe linked delivery references","Privacy and retention rules"],
    setup:[
      {title:"Define the safe row",owner:"Governance owner",action:"Choose time, activity ID, phase, tool, model family where known, summary, references, confidence and limitations.",produces:"Ledger schema"},
      {title:"Exclude sensitive content",owner:"Security / privacy owner",action:"Ban raw prompts, responses, secrets, PII, production extracts and unverifiable cost figures.",produces:"Retention boundary"},
      {title:"Link delivery evidence",owner:"Task owner",action:"Attach the activity to requirements, tasks, commits, tests, decisions or reports.",produces:"Provenance links"},
      {title:"Measure outcomes",owner:"Delivery lead",action:"Compare accepted results, rework and complete lineage by prompt version or capability mode.",produces:"Evidence-backed metrics"},
    ],
    rhythm:[
      {trigger:"AI action is used",action:"Create a safe activity event.",record:"Activity row"},
      {trigger:"Output is acted on",action:"Link the resulting delivery records.",record:"Trace references"},
      {trigger:"Human reviews",action:"Record confidence, limitations and decision.",record:"Outcome status"},
      {trigger:"Reporting runs",action:"Aggregate only supported measures.",record:"Safe AI metrics"},
    ],
  },
};

Object.assign(setupById, {
  "establish-baseline": {
    goal:"Create one approved starting point that keeps source facts, assumptions, constraints, questions and ownership visible.",
    prerequisites:["Named project sponsor and delivery lead","Available business and technical sources","Decision and question register","Baseline approval route"],
    setup:[
      {title:"Register the sources",owner:"Delivery lead",action:"List the documents, repository evidence and records that are allowed to control delivery.",produces:"Authoritative source register"},
      {title:"Build the context",owner:"Analyst and architect",action:"Capture objectives, technical starting point, constraints, facts, assumptions and gaps.",produces:"Project context baseline"},
      {title:"Assign the gaps",owner:"Business and technical owners",action:"Give every open question, constraint and material decision an accountable owner.",produces:"Owned question and decision log"},
      {title:"Approve and version",owner:"Human baseline authority",action:"Approve the joined baseline, version it and define which changes make it stale.",produces:"Approved baseline"},
    ],
    rhythm:[
      {trigger:"Project or phase starts",action:"Collect and classify the current source material.",record:"Baseline candidate"},
      {trigger:"A material gap appears",action:"Assign an owner and keep it separate from fact.",record:"Open-question entry"},
      {trigger:"Context is approved",action:"Publish the version used by people, prompts and agents.",record:"Approval and version"},
      {trigger:"A material source changes",action:"Invalidate and refresh dependent context.",record:"Baseline change history"},
    ],
  },
  "architecture-standards": {
    goal:"Turn architecture, engineering standards and assurance duties into a versioned contract for every task.",
    prerequisites:["Approved project baseline","Named architecture and engineering owners","Risk and regulatory requirements","Definition-of-Done authority"],
    setup:[
      {title:"Record architecture",owner:"Architect / technical lead",action:"Document boundaries, data flows, shared contracts, decisions and trade-offs.",produces:"Architecture decision set"},
      {title:"Set engineering rules",owner:"Engineering lead",action:"Define coding, repository, dependency, documentation and review conventions.",produces:"Engineering standards"},
      {title:"Map assurance triggers",owner:"Quality and security leads",action:"Attach test, security, privacy, accessibility and regulatory checks to risk conditions.",produces:"Assurance trigger map"},
      {title:"Define evidence-backed done",owner:"Human governance authority",action:"Name the evidence, specialist dispositions and approvals required for completion.",produces:"Definition of Done"},
    ],
    rhythm:[
      {trigger:"A task is shaped",action:"Load the current decisions, standards and assurance triggers.",record:"Task contract"},
      {trigger:"A risk trigger applies",action:"Add the required specialist review and evidence.",record:"Assurance route"},
      {trigger:"A standard changes",action:"Assess dependent tasks and invalidate stale approval.",record:"Standards change impact"},
      {trigger:"Completion is proposed",action:"Compare evidence with the current Definition of Done.",record:"Human completion decision"},
    ],
  },
  "select-route": {
    goal:"Select the smallest defensible delivery route and make every included or omitted control explicit.",
    prerequisites:["Current baseline","Change intent and acceptance criteria","Impact classification rules","Named route approver"],
    setup:[
      {title:"Define impact questions",owner:"Delivery and technical leads",action:"Cover functional, technical, data, infrastructure, security and release impact.",produces:"Impact checklist"},
      {title:"Define permitted routes",owner:"Governance owner",action:"Describe the full, no-functional-change and constrained short routes with mandatory gates.",produces:"Route catalogue"},
      {title:"Attach assurance",owner:"Quality lead",action:"Map each impact to design, readiness, tests, reviewers, integration and release checks.",produces:"Route assurance map"},
      {title:"Set refresh conditions",owner:"Human route authority",action:"Name the material changes that invalidate route choice and approval.",produces:"Reclassification rule"},
    ],
    rhythm:[
      {trigger:"A change arrives",action:"Classify impact and choose the candidate route.",record:"Route decision"},
      {trigger:"A short route is chosen",action:"Record the rationale and retained controls.",record:"Short-route justification"},
      {trigger:"Work reaches readiness",action:"Confirm the selected route is executable.",record:"Route readiness"},
      {trigger:"Scope or risk changes",action:"Reclassify and renew approval.",record:"Route change history"},
    ],
  },
  "baseline-forecast-change": {
    goal:"Create an immutable plan baseline, represent forecast uncertainty and make every later change a governed decision.",
    prerequisites:["Work-package and dependency model","Conventional and AI-assisted estimate basis","Cost and effort evidence","Named baseline and change authorities"],
    setup:[
      {title:"Capture two estimate views",owner:"Work-package owners",action:"Keep conventional and AI-assisted assumptions and values distinct.",produces:"Estimate comparison"},
      {title:"Build three-point packages",owner:"Planning owner",action:"Capture optimistic, most-likely and pessimistic values with dependencies.",produces:"Forecast-ready work packages"},
      {title:"Approve the baseline",owner:"Human baseline authority",action:"Freeze scope, dates, cost, dependencies and reserve as the comparison point.",produces:"Immutable baseline"},
      {title:"Define change control",owner:"Change authority",action:"Require impact, decision, reserve use, readiness warning and history for every change.",produces:"Change-control route"},
    ],
    rhythm:[
      {trigger:"Planning runs",action:"Calculate deterministic scenarios and P50/P80 outcomes.",record:"Forecast run"},
      {trigger:"Actuals arrive",action:"Update PV, EV, AC, SPI, CPI and EAC without fabricating missing data.",record:"EVM snapshot"},
      {trigger:"Variance crosses a threshold",action:"Raise readiness and reserve warnings.",record:"Warning and owner"},
      {trigger:"A change is requested",action:"Assess, decide and retain both old and new forecast views.",record:"Formal change decision"},
    ],
  },
  "report-evidence": {
    goal:"Publish repeatable delivery reports from one frozen evidence snapshot and retain enough context to explain them later.",
    prerequisites:["Governed delivery records","Measurement and evidence definitions","Findings and RAID state","Approved report templates"],
    setup:[
      {title:"Define the snapshot",owner:"Reporting owner",action:"Name the records, definitions, source time and evidence boundaries included in publication.",produces:"Snapshot contract"},
      {title:"Preserve qualifications",owner:"Delivery assurance",action:"Require evidence gaps, limitations, findings and RAID exposure in every audience view.",produces:"Claim-boundary layer"},
      {title:"Map the formats",owner:"Reporting service owner",action:"Use the same governed fields for PDF, PowerPoint, Excel and JSON outputs.",produces:"Format map"},
      {title:"Set the archive",owner:"Governance owner",action:"Retain snapshot identity, source template, output files and publication time.",produces:"Archived report package"},
    ],
    rhythm:[
      {trigger:"Reporting period closes",action:"Freeze the measurement snapshot.",record:"Point-in-time snapshot"},
      {trigger:"Report is assembled",action:"Add evidence gaps, limitations, findings and RAID.",record:"Qualified narrative"},
      {trigger:"Outputs are generated",action:"Publish the supported formats from the same source.",record:"PDF, PPTX, XLSX and JSON"},
      {trigger:"Publication completes",action:"Archive the outputs and source template.",record:"Report history"},
    ],
  },
  "separate-environments": {
    goal:"Separate runtime, configuration and data boundaries and make the maturity of each environment explicit.",
    prerequisites:["Environment inventory","Data classification","Configuration and secret plan","Promotion authority"],
    setup:[
      {title:"Name the environments",owner:"Platform owner",action:"Define purpose, owner, integrations, data class and maturity for dev, test, UAT/stage and production.",produces:"Environment map"},
      {title:"Isolate the stores",owner:"Engineering and data owners",action:"Separate runtime state, databases, ports, configuration and credentials.",produces:"Isolation contract"},
      {title:"Prepare safe data",owner:"Data owner",action:"Use synthetic, masked or specifically approved copied data outside production.",produces:"Non-production fixture set"},
      {title:"Control promotion",owner:"Release authority",action:"Define the evidence, configuration and immutable identity allowed to move forward.",produces:"Promotion route"},
    ],
    rhythm:[
      {trigger:"An environment is provisioned",action:"Verify its owner, configuration, store and data boundary.",record:"Environment readiness"},
      {trigger:"A test dataset is requested",action:"Classify and approve the safe fixture.",record:"Fixture provenance"},
      {trigger:"Promotion is proposed",action:"Check readiness and move the approved identity without rebuilding.",record:"Promotion decision"},
      {trigger:"A boundary changes",action:"Refresh environment evidence and limitations.",record:"Environment change history"},
    ],
  },
  "protect-identity-data": {
    goal:"Protect access, credentials, uploads and client data while showing which enterprise controls remain incomplete.",
    prerequisites:["Data classification","Current identity model","Secret and credential inventory","Upload and AI-processing policy"],
    setup:[
      {title:"State the identity boundary",owner:"Access owner",action:"Document authentication, authorization and user-attribution controls that actually exist today.",produces:"Identity claim boundary"},
      {title:"Separate secrets",owner:"Security / platform owner",action:"Move credentials out of source, prompts, fixtures and ordinary evidence into approved handling.",produces:"Secret-handling route"},
      {title:"Classify the data",owner:"Data / privacy owner",action:"Set rules for PII, client data, production extracts, fixtures, exports and retention.",produces:"Data-use contract"},
      {title:"Constrain uploads",owner:"Application owner",action:"Validate type and size and require an explicit user action before AI processing.",produces:"Upload and AI trigger evidence"},
    ],
    rhythm:[
      {trigger:"Access is requested",action:"Apply the implemented identity boundary and record any limitation.",record:"Access decision"},
      {trigger:"A credential is needed",action:"Use approved secret handling and temporary scope.",record:"Credential-use evidence"},
      {trigger:"A file is uploaded",action:"Validate, classify and wait for an explicit AI trigger.",record:"Upload decision"},
      {trigger:"Evidence is shared",action:"Review it for client data, PII and secrets.",record:"Safe-sharing check"},
    ],
  },
  "backup-restore-audit": {
    goal:"Create a recoverable, retained and auditable data lifecycle without presenting local backup as disaster recovery.",
    prerequisites:["Critical-state inventory","Recovery objective and owner","Protected backup location","Retention and disposal policy"],
    setup:[
      {title:"Define the scope",owner:"Data / service owner",action:"Name application, configuration, evidence and audit state that must be recoverable.",produces:"Recovery inventory"},
      {title:"Create protected backup",owner:"Backup operator",action:"Record source, time, location, protection and retention metadata.",produces:"Backup record"},
      {title:"Design the restore test",owner:"Recovery owner",action:"Choose an isolated target, integrity checks and success criteria.",produces:"Restore test plan"},
      {title:"Set retention and audit",owner:"Governance owner",action:"Define archive, disposal and audit-evidence preservation.",produces:"Lifecycle schedule"},
    ],
    rhythm:[
      {trigger:"Backup schedule runs",action:"Create and identify the protected backup.",record:"Backup event"},
      {trigger:"Restore test is due",action:"Restore into isolation and verify integrity and access.",record:"Restore evidence"},
      {trigger:"Retention expires",action:"Archive or dispose under the approved rule.",record:"Retention decision"},
      {trigger:"A gap is found",action:"Assign recovery ownership and roadmap action.",record:"Recovery gap log"},
    ],
  },
  "observe-recover": {
    goal:"Bind health signals, release identity, human recovery decisions and post-recovery verification into one operating route.",
    prerequisites:["Health and readiness contract","Logging, metrics, tracing and alert plan","Release identity","Known-good target and recovery authority"],
    setup:[
      {title:"Define the signals",owner:"Service owner",action:"Name health, readiness, log, metric, trace, alert and correlation evidence for critical paths.",produces:"Observability contract"},
      {title:"Bind release identity",owner:"Release owner",action:"Make every signal and decision identify the affected commit or digest.",produces:"Correlated release evidence"},
      {title:"Set the decision window",owner:"Recovery authority",action:"Define thresholds, owner and time window for continue, pause, rollback or restore.",produces:"Recovery decision contract"},
      {title:"Prepare verification",owner:"Assurance owner",action:"Name health, smoke, integrity and business checks that must pass after recovery.",produces:"Post-recovery checklist"},
    ],
    rhythm:[
      {trigger:"Readiness is checked",action:"Record service signals against the release identity.",record:"Readiness evidence"},
      {trigger:"An alert fires",action:"Correlate the request, service and affected artefact.",record:"Incident context"},
      {trigger:"Decision window closes",action:"A named person continues, pauses, rolls back or restores.",record:"Recovery decision"},
      {trigger:"Recovery completes",action:"Repeat health, data and business verification.",record:"Post-recovery proof"},
    ],
  },
  "boards-delivery-spine": {
    goal:"Configure Azure DevOps so authority, hierarchy, state and delivery evidence remain one joined record from intake to human completion.",
    prerequisites:["Named ADO process and administrator","Approved traceability scheme","Current design and task-list authority","Definition of Done and acceptance owners"],
    setup:[
      {title:"Set the hierarchy",owner:"ADO owner",action:"Define Epic, User Story, Task, Bug and evidence relationships, including an explicit Issue fallback when the target process is unavailable.",produces:"Work-item model"},
      {title:"Define the trace contract",owner:"Delivery assurance",action:"Require stable M-*, AC-M-*, REQ-*, SPEC-REQ-*, TASK-* and TEST-* identifiers in the correct fields, titles, tags and relations.",produces:"ADO trace schema"},
      {title:"Attach authority and evidence",owner:"Technical and delivery leads",action:"Name the required design, task list, dependencies, branch, reviewers, tests, risks and release links for each item type.",produces:"Required-content rule"},
      {title:"Gate every state",owner:"Human governance authority",action:"Define the evidence-based exits for intake, design, readiness, active work, PR review, merge and final completion.",produces:"State-transition contract"},
    ],
    rhythm:[
      {trigger:"A request enters",action:"Create or find the authorised item and choose the governed delivery route.",record:"Anchored work item"},
      {trigger:"Design and tasks are approved",action:"Link the current records and create only the approved child work.",record:"Approved hierarchy"},
      {trigger:"Delivery moves",action:"Add branch, PR, build, test, finding and approval evidence as it becomes available.",record:"Current ADO provenance"},
      {trigger:"Completion is proposed",action:"Reconcile children, criteria, findings, lineage and human approval before Done.",record:"Definition-of-Done decision"},
    ],
  },
  "pr-proof-pack": {
    goal:"Make every protected merge decision carry the scope, lineage, evidence, specialist judgement and recovery route for the exact reviewed source.",
    prerequisites:["Protected integration branch","Focused task or governed change","Structured PR template","Named reviewers and administrator policy owner"],
    setup:[
      {title:"Define focused branches",owner:"Repository owner",action:"Start short-lived task, change, defect or documentation branches from the latest approved master, keep implementation PRs under roughly 400 changed lines where practical and split unrelated concerns.",produces:"Branch contract"},
      {title:"Build the proof template",owner:"Delivery assurance",action:"Capture scope, exclusions, trace links, classification, actual checks, impacts, AI provenance, rollback, residual risk and follow-up.",produces:"Structured PR template"},
      {title:"Protect the decision",owner:"ADO administrator",action:"Require linked work, non-author review, reset after source push and resolved comments; record which controls still need administrator verification.",produces:"Branch-policy evidence"},
      {title:"Separate reviewer roles",owner:"Review lead",action:"Assign peer, QA, security, SME and delivery responsibilities and require a visible disposition for each triggered control.",produces:"Reviewer authority map"},
    ],
    rhythm:[
      {trigger:"A focused branch is ready",action:"Assemble the structured proof pack and link the exact source version.",record:"Draft PR evidence"},
      {trigger:"Validation runs",action:"Publish passed, failed, skipped and unavailable evidence accurately.",record:"Current check results"},
      {trigger:"Source changes",action:"Reset approval and rerun every affected check and review.",record:"Fresh review state"},
      {trigger:"Policies and people agree",action:"Merge through the named authority and reassess completion after merge.",record:"Protected merge provenance"},
    ],
  },
  "assurance-ladder": {
    goal:"Define separate proof contracts for task, story, stream and release so the delivery claim never outruns the evidence.",
    prerequisites:["Task and story acceptance criteria","Stable TEST-* identifiers","Shared-contract and journey inventory","Functional, NFR and release authorities"],
    setup:[
      {title:"Define task proof",owner:"Engineering and QA leads",action:"Name the build, unit, integration, review and task evidence required for one focused implementation outcome.",produces:"Level 1 contract"},
      {title:"Map every criterion",owner:"Business and QA owners",action:"Link each AC-M-* criterion to TEST-* evidence and the required QA or SME disposition.",produces:"Level 2 coverage matrix"},
      {title:"Design stream proof",owner:"Integration lead",action:"Choose contract, schema, dependency and representative journey checks that prove components work together.",produces:"Level 3 integration route"},
      {title:"Set the release claim",owner:"Release assurance",action:"Name end-to-end, parity, accessibility, security, performance, deployment, rollback and human decision evidence.",produces:"Level 4 release contract"},
    ],
    rhythm:[
      {trigger:"A task completes",action:"Run Level 1 and retain the exact build, review and task proof.",record:"Task assurance"},
      {trigger:"Story closure is proposed",action:"Check every criterion and route gaps back to the owner.",record:"Story coverage decision"},
      {trigger:"Streams converge",action:"Exercise shared contracts, schemas and journeys together.",record:"Stream assurance"},
      {trigger:"Release is proposed",action:"Run the applicable functional and NFR route, then record a human decision at the level proven.",record:"Release assurance pack"},
    ],
  },
  "source-stat-pack": {
    goal:"Create a reproducible stat-pack route that preserves source identity, denominator, confidence and caveat from atomic facts to publication.",
    prerequisites:["Approved source inventory","Read-only collection access or exports","Pinned Git and reporting period","Named metric and publication owners"],
    setup:[
      {title:"Inventory the sources",owner:"Reporting owner",action:"List Git, ADO Boards, PR, Build, traceability, test and safe AI sources with their permitted collection route.",produces:"Source inventory"},
      {title:"Define the fact contract",owner:"Data assurance",action:"Set dates, IDs, metric type, value, denominator, unit, source version, link method, confidence, caveat and unavailable handling.",produces:"Normalised fact model"},
      {title:"Design reconciliation",owner:"Delivery assurance",action:"Define ADO-to-manifest, PR-to-commit, build-to-PR and ID matching with de-duplication, pagination and boundary checks.",produces:"Reconciliation rules"},
      {title:"Protect publication",owner:"Governance publisher",action:"Require independent totals, exception review, preview inspection, version, hash and a clear boundary between snapshots and future automation.",produces:"Stat-pack assurance gate"},
    ],
    rhythm:[
      {trigger:"The reporting period closes",action:"Pin time, period, ref and commit before any count is made.",record:"Snapshot identity"},
      {trigger:"Facts are collected",action:"Normalise sources and retain unavailable values with their reason.",record:"Atomic fact set"},
      {trigger:"Metrics are calculated",action:"Reconcile identities, classify metric type and aggregate deterministically.",record:"Metric and exception set"},
      {trigger:"The pack is published",action:"Independently compare totals, review caveats and retain the hashed dated output.",record:"Source-backed stat pack"},
    ],
  },
  "delivery-system-alignment": {
    goal:"Regularly compare the approved delivery system with live implementation and contain any claim whose authority or evidence no longer agrees.",
    prerequisites:["Pinned governance and repository sources","ADO and policy evidence","Pipeline design and live configuration","Named assurance and remediation owners"],
    setup:[
      {title:"Define eight layers",owner:"Assurance lead",action:"Map authority, instructions, prompts, ADO, source, CI, evidence and reporting to their approved and live sources.",produces:"Alignment map"},
      {title:"Create repeatable checks",owner:"Tooling and specialists",action:"Add mirror, reference, ID, policy, pipeline, architecture, completion and stat-recalculation checks.",produces:"Alignment check suite"},
      {title:"Set discrepancy classes",owner:"Governance owner",action:"Distinguish documentation drift, missing evidence, configuration gap, defect, new requirement and material contradiction.",produces:"Discrepancy taxonomy"},
      {title:"Define containment and repair",owner:"Delivery authority",action:"Name when to block work or claims, preserve history, supersede authority, refresh readiness and close with fresh proof.",produces:"Remediation route"},
    ],
    rhythm:[
      {trigger:"Every change or PR",action:"Check scope, authority, evidence and reviewer disposition.",record:"PR alignment evidence"},
      {trigger:"Weekly or status pack",action:"Reconcile ADO, repository, build, test, governance and reporting facts.",record:"Dated drift snapshot"},
      {trigger:"A material change lands",action:"Invalidate stale approval, synchronise dependants and rerun affected checks.",record:"Fresh readiness packet"},
      {trigger:"Periodic governance review",action:"Compare all eight layers and assign every discrepancy to owned remediation.",record:"Alignment report and backlog"},
    ],
  },
} satisfies Record<string,SetupGuide>);

type ControlLevel = "Low" | "Mid" | "High";
type CatalogueAnchor = { id:string };
type PendingNavigation = "restore" | "catalogue" | null;

const governanceLevels: Array<{
  level:ControlLevel;
  number:string;
  label:string;
  summary:string;
  points:string[];
}> = [
  {level:"Low",number:"01",label:"Light touch",summary:"For small, reversible work that one named person can review.",points:["Clear piece of work","One named owner","Simple record of what happened"]},
  {level:"Mid",number:"02",label:"Team controls",summary:"For shared work that needs agreed checkpoints, evidence and handovers.",points:["Agreed checkpoints","Shared evidence","Consistent review"]},
  {level:"High",number:"03",label:"Formal controls",summary:"For sensitive or high-impact work that needs stronger checks and approval.",points:["Independent checks","Formal approval","Tested recovery plan"]},
];

const methodLevel = (method:Method):ControlLevel => method.adoption === "Specialist" ? "High" : method.adoption === "Proven" ? "Mid" : "Low";

const methodJourneys = [
  {number:"01",name:"Establish",copy:"Set the facts, rules and delivery route",ids:["establish-baseline","architecture-standards","boards-delivery-spine","select-route","prompt-pack"]},
  {number:"02",name:"Authorise",copy:"Agree ownership, the plan and readiness",ids:["govern-change","baseline-forecast-change","prebuild-gate"]},
  {number:"03",name:"Coordinate",copy:"Split the work, share context and keep it separate",ids:["orchestrate-pods","context-handoffs","isolate-build"]},
  {number:"04",name:"Assure",copy:"Test, review and prove the right level",ids:["feature-test-apps","scale-assurance","assurance-ladder","independent-assurance"]},
  {number:"05",name:"Integrate",copy:"Review, merge and release safely",ids:["pr-proof-pack","safe-integration","conflict-handback","prove-lineage","report-evidence","immutable-release"]},
  {number:"06",name:"Govern AI",copy:"Review AI output, limit changes and record its use",ids:["review-ai-evidence","constrain-mutation","activity-ledger"]},
  {number:"07",name:"Operate",copy:"Protect, monitor, report and recover",ids:["separate-environments","protect-identity-data","source-stat-pack","delivery-system-alignment","backup-restore-audit","observe-recover"]},
];
const methodTitles: Record<string,string> = {
  "establish-baseline":"Approved baseline",
  "architecture-standards":"Engineering standards",
  "boards-delivery-spine":"Azure DevOps delivery spine",
  "select-route":"Delivery route",
  "prompt-pack":"Prompt pack",
  "govern-change":"Human authority",
  "baseline-forecast-change":"Forecast and change control",
  "prebuild-gate":"Pre-build check",
  "orchestrate-pods":"Delivery pods",
  "context-handoffs":"Handover packs",
  "isolate-build":"Separate workspaces",
  "feature-test-apps":"Feature test apps",
  "scale-assurance":"Risk-based testing",
  "assurance-ladder":"Assurance ladder",
  "independent-assurance":"Independent review",
  "pr-proof-pack":"PR proof pack",
  "safe-integration":"Controlled integration",
  "conflict-handback":"Conflict handback",
  "prove-lineage":"Delivery traceability",
  "report-evidence":"Evidence reporting",
  "immutable-release":"Release and rollback",
  "review-ai-evidence":"AI evidence review",
  "constrain-mutation":"Controlled updates",
  "activity-ledger":"AI activity log",
  "separate-environments":"Separate environments",
  "protect-identity-data":"Identity and data protection",
  "source-stat-pack":"Stat packs",
  "delivery-system-alignment":"Delivery system check",
  "backup-restore-audit":"Backup and recovery",
  "observe-recover":"Monitoring and recovery",
};
const methodTitle = (method:Method) => methodTitles[method.id] ?? method.name;
const methodChapters = [
  {id:"overview",number:"01",label:"Overview",copy:"What it does and why it helps"},
  {id:"setup",number:"02",label:"Set it up",copy:"What you need before you start"},
  {id:"run",number:"03",label:"Run it",copy:"What happens and who decides"},
  {id:"proof",number:"04",label:"Control levels",copy:"Use the right level of control"},
  {id:"controls",number:"05",label:"People & proof",copy:"Who does what and what we keep"},
] as const;
type MethodChapterId = (typeof methodChapters)[number]["id"];
type PresentationSlide = { id:MethodChapterId; number:string; label:string; copy:string };
type SlidePan = { x:number; y:number };
type SlideGesture =
  | { mode:"swipe"; pointerId:number; x:number; y:number }
  | { mode:"pan"; pointerId:number; x:number; y:number; originX:number; originY:number; captured:boolean };
const presentationSlides:PresentationSlide[] = methodChapters.map((chapter) => ({...chapter}));
const slideZoomLevels = [1,1.25,1.5,1.75,2] as const;
const orderedMethodIds = methodJourneys.flatMap((journey) => journey.ids);
const journeyById = Object.fromEntries(methodJourneys.flatMap((journey) => journey.ids.map((id) => [id,journey]))) as Record<string,(typeof methodJourneys)[number]>;
const catalogueMethods = orderedMethodIds.map((id) => {
  const method = methods.find((item) => item.id === id);
  if (!method) throw new Error(`Method catalogue is missing the ${id} method record.`);
  if (!deepDiveById[id]) throw new Error(`Method catalogue is missing the ${id} deep dive.`);
  if (!plainLanguage[id]) throw new Error(`Method catalogue is missing the ${id} plain-language summary.`);
  if (!setupById[id]) throw new Error(`Method catalogue is missing the ${id} setup guide.`);
  if (!methodTitles[id]) throw new Error(`Method catalogue is missing the ${id} short title.`);
  for (const project of method.projects) {
    if (!method.maturity[project]) throw new Error(`Method catalogue is missing ${project} maturity for ${id}.`);
    if (!deepDiveById[id].project[project]) throw new Error(`Method catalogue is missing the ${project} evidence lane for ${id}.`);
  }
  return method;
});

export default function AgentUseCases() {
  const [dark, setDark] = usePersistentDarkMode();
  const sidebar = usePersistentSidebar();
  const [journey, setJourney] = useState<"all"|string>("all");
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [activePage, setActivePage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"forward"|"back">("forward");
  const [slideZoom, setSlideZoom] = useState<number>(1);
  const [slidePan, setSlidePan] = useState<SlidePan>({x:0,y:0});
  const [isPanning, setIsPanning] = useState(false);
  const [isTrackpadGesturing, setIsTrackpadGesturing] = useState(false);
  const [navigationRevision, setNavigationRevision] = useState(0);
  const catalogueAnchorRef = useRef<CatalogueAnchor|null>(null);
  const pendingNavigationRef = useRef<PendingNavigation>(null);
  const modalRef = useRef<HTMLDialogElement|null>(null);
  const stageRef = useRef<HTMLDivElement|null>(null);
  const slideGestureRef = useRef<SlideGesture|null>(null);
  const slideZoomRef = useRef<number>(1);
  const slidePanRef = useRef<SlidePan>({x:0,y:0});

  const filtered = catalogueMethods
    .filter((method) => journey === "all" || journeyById[method.id].number === journey)
    .sort((a,b) => orderedMethodIds.indexOf(a.id) - orderedMethodIds.indexOf(b.id));
  const activeJourney = journey === "all" ? null : methodJourneys.find((item) => item.number === journey) ?? null;
  const renderedMethods = filtered;
  const selectedMethod = expandedId ? catalogueMethods.find((method) => method.id === expandedId) ?? null : null;
  const selectedDeep = selectedMethod ? deepDiveById[selectedMethod.id] : null;
  const selectedPlain = selectedMethod ? plainLanguage[selectedMethod.id] : null;
  const selectedSetup = selectedMethod ? setupById[selectedMethod.id] : null;
  const selectedJourney = selectedMethod ? journeyById[selectedMethod.id] : null;
  const selectedLevel = selectedMethod ? methodLevel(selectedMethod) : null;
  const selectedPages = selectedMethod ? presentationSlides : [];
  const currentPage = selectedPages[Math.min(activePage,Math.max(0,selectedPages.length-1))] ?? null;
  const activeChapterIndex = currentPage ? presentationSlides.findIndex((slide) => slide.id === currentPage.id) : 0;

  const heroMethods = ["establish-baseline","orchestrate-pods","baseline-forecast-change","observe-recover"].map((id) => catalogueMethods.find((method) => method.id === id)).filter((method): method is Method => Boolean(method));
  const methodHeroItems: ClassicBlueprintItem[] = heroMethods.map((method,index) => ({
    id:(["foundations","controls","workflow","source"] as ClassicBlueprintItem["id"][])[index],
    number:String(index + 1).padStart(2,"0"),
    title:methodTitle(method),
    description:plainLanguage[method.id].result,
    focus:method.name,
    highlights:plainLanguage[method.id].points,
  }));
  function writeMethodUrl(id:string|null, mode:"push"|"replace", hash="", pageIndex=0) {
    const url = new URL(window.location.href);
    if (id) {
      const page = presentationSlides[Math.max(0,Math.min(presentationSlides.length-1,pageIndex))] ?? presentationSlides[0];
      url.searchParams.set("method",id);
      url.searchParams.set("slide",page.id);
      url.searchParams.delete("page");
    } else {
      url.searchParams.delete("method");
      url.searchParams.delete("slide");
      url.searchParams.delete("page");
    }
    url.hash = hash;
    const state = { ...(window.history.state ?? {}), methodsFocus:Boolean(id), methodId:id };
    if (mode === "push") window.history.pushState(state,"",url);
    else window.history.replaceState(state,"",url);
  }

  function clampSlidePan(next:SlidePan, zoom=slideZoomRef.current) {
    if (zoom <= 1) return {x:0,y:0};
    const surface = stageRef.current?.querySelector<HTMLElement>('[data-active="true"] [data-method-zoom-surface]');
    if (!surface) return next;
    const maxX = Math.max(0,(surface.clientWidth * (zoom-1))/2);
    const maxY = Math.max(0,(surface.clientHeight * (zoom-1))/2);
    return {x:Math.max(-maxX,Math.min(maxX,next.x)),y:Math.max(-maxY,Math.min(maxY,next.y))};
  }

  function commitSlidePan(next:SlidePan, zoom=slideZoomRef.current) {
    const boundedPan = clampSlidePan(next,zoom);
    slidePanRef.current = boundedPan;
    setSlidePan(boundedPan);
  }

  function commitSlideView(nextZoom:number,nextPan:SlidePan) {
    const boundedZoom = Math.max(slideZoomLevels[0],Math.min(slideZoomLevels[slideZoomLevels.length-1],nextZoom));
    slideZoomRef.current = boundedZoom;
    setSlideZoom(boundedZoom);
    commitSlidePan(boundedZoom <= 1 ? {x:0,y:0} : nextPan,boundedZoom);
  }

  function changeSlideZoom(step:number) {
    const currentZoom = slideZoomRef.current;
    const nextZoom = step > 0
      ? slideZoomLevels.find((level) => level > currentZoom+.001) ?? slideZoomLevels[slideZoomLevels.length-1]
      : [...slideZoomLevels].reverse().find((level) => level < currentZoom-.001) ?? slideZoomLevels[0];
    const ratio = nextZoom/currentZoom;
    commitSlideView(nextZoom,{x:slidePanRef.current.x*ratio,y:slidePanRef.current.y*ratio});
  }

  function resetSlideView() {
    slideGestureRef.current = null;
    setIsPanning(false);
    setIsTrackpadGesturing(false);
    slideZoomRef.current = 1;
    slidePanRef.current = {x:0,y:0};
    setSlideZoom(1);
    setSlidePan({x:0,y:0});
  }

  function panSlideBy(x:number,y:number) {
    const current = slidePanRef.current;
    commitSlidePan({x:current.x+x,y:current.y+y});
  }

  function openMethod(id:string, replaceHistory=false) {
    if (!catalogueMethods.some((method) => method.id === id)) return;
    if (expandedId !== id) catalogueAnchorRef.current = {id};
    resetSlideView();
    setActivePage(0);
    setSlideDirection("forward");
    writeMethodUrl(id,replaceHistory || Boolean(expandedId) ? "replace" : "push","",0);
    setExpandedId(id);
  }

  function changePage(next:number) {
    const bounded = Math.max(0,Math.min(selectedPages.length-1,next));
    if (bounded === activePage) return;
    resetSlideView();
    setSlideDirection(bounded > activePage ? "forward" : "back");
    if (expandedId) writeMethodUrl(expandedId,"replace","",bounded);
    setActivePage(bounded);
  }

  function handleSlideTabKey(event:ReactKeyboardEvent<HTMLButtonElement>, index:number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % methodChapters.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + methodChapters.length) % methodChapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = methodChapters.length - 1;
    else return;
    event.preventDefault();
    const chapter = methodChapters[next];
    const firstPage = selectedPages.findIndex((page) => page.id === chapter.id);
    if (firstPage >= 0) changePage(firstPage);
    document.getElementById(`method-chapter-tab-${next}`)?.focus();
  }

  function openChapter(chapter:MethodChapterId) {
    const firstPage = selectedPages.findIndex((page) => page.id === chapter);
    if (firstPage >= 0) changePage(firstPage);
  }

  function handlePresentationKey(event:ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.defaultPrevented) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const isEditable = Boolean(target?.closest('input,textarea,select,[contenteditable="true"]'));
    const plainShortcut = !event.ctrlKey && !event.metaKey && !event.altKey && !isEditable;
    if (plainShortcut && (event.key === "+" || event.key === "=")) {
      event.preventDefault();
      changeSlideZoom(1);
    } else if (plainShortcut && (event.key === "-" || event.key === "_")) {
      event.preventDefault();
      changeSlideZoom(-1);
    } else if (plainShortcut && event.key === "0") {
      event.preventDefault();
      resetSlideView();
    } else if (slideZoom > 1 && plainShortcut && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)) {
      event.preventDefault();
      panSlideBy(event.key === "ArrowLeft" ? 44 : event.key === "ArrowRight" ? -44 : 0,event.key === "ArrowUp" ? 44 : event.key === "ArrowDown" ? -44 : 0);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      changePage(activePage+1);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      changePage(activePage-1);
    }
  }

  function handleSlidePointerDown(event:ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('button,a,input,textarea,select,[data-method-node-tooltip]')) return;
    if (slideZoom > 1) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      slideGestureRef.current = {mode:"pan",pointerId:event.pointerId,x:event.clientX,y:event.clientY,originX:slidePanRef.current.x,originY:slidePanRef.current.y,captured:false};
      return;
    }
    if (event.pointerType === "mouse") return;
    slideGestureRef.current = {mode:"swipe",pointerId:event.pointerId,x:event.clientX,y:event.clientY};
  }

  function handleSlidePointerMove(event:ReactPointerEvent<HTMLDivElement>) {
    const gesture = slideGestureRef.current;
    if (!gesture || gesture.mode !== "pan" || gesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX-gesture.x;
    const deltaY = event.clientY-gesture.y;
    if (!gesture.captured) {
      if (Math.hypot(deltaX,deltaY) < 6) return;
      gesture.captured = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    }
    commitSlidePan({x:gesture.originX+deltaX,y:gesture.originY+deltaY});
    event.preventDefault();
  }

  function handleSlidePointerUp(event:ReactPointerEvent<HTMLDivElement>) {
    const gesture = slideGestureRef.current;
    slideGestureRef.current = null;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (gesture.mode === "pan") {
      if (gesture.captured && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      setIsPanning(false);
      return;
    }
    if (gesture.mode !== "swipe") return;
    const deltaX = event.clientX-gesture.x;
    const deltaY = event.clientY-gesture.y;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY)*1.35) return;
    changePage(activePage+(deltaX < 0 ? 1 : -1));
  }

  function cancelSlidePointer(event:ReactPointerEvent<HTMLDivElement>) {
    slideGestureRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsPanning(false);
  }

  function closeMethod() {
    pendingNavigationRef.current = "restore";
    if (window.history.state?.methodsFocus) {
      window.history.back();
      return;
    }
    writeMethodUrl(null,"replace","catalogue");
    setExpandedId(null);
  }

  function toggle(id:string) {
    if (expandedId === id) closeMethod();
    else openMethod(id,Boolean(expandedId));
  }

  function selectJourney(next:"all"|string, scrollToCatalogue=false) {
    if (expandedId || new URL(window.location.href).searchParams.has("method")) writeMethodUrl(null,"replace",scrollToCatalogue ? "catalogue" : "");
    pendingNavigationRef.current = scrollToCatalogue ? "catalogue" : null;
    setJourney(next);
    setExpandedId(null);
    if (scrollToCatalogue) setNavigationRevision((value) => value + 1);
  }

  useEffect(() => {
    const methodFromLocation = () => {
      const params = new URL(window.location.href).searchParams;
      const id = params.get("method");
      const method = id ? catalogueMethods.find((item) => item.id === id) : null;
      if (!id || !method) return null;
      const requestedChapter = params.get("slide");
      const page = presentationSlides.findIndex((item) => item.id === requestedChapter);
      return {id,page:Math.max(0,page)};
    };
    const initialMethod = methodFromLocation();
    const initialNavigation = initialMethod ? window.setTimeout(() => {
      resetSlideView();
      setActivePage(initialMethod.page);
      setExpandedId(initialMethod.id);
    },0) : null;
    const handlePopState = () => {
      const methodState = methodFromLocation();
      pendingNavigationRef.current = methodState ? null : "restore";
      resetSlideView();
      if (methodState) setActivePage(methodState.page);
      setExpandedId(methodState?.id ?? null);
    };
    window.addEventListener("popstate",handlePopState);
    return () => {
      if (initialNavigation !== null) window.clearTimeout(initialNavigation);
      window.removeEventListener("popstate",handlePopState);
    };
  },[]);

  useEffect(() => {
    if (!expandedId) return;
    const stage = stageRef.current;
    if (!stage) return;
    let gestureEndTimer:number|null = null;

    const clampTrackpadPan = (next:SlidePan,zoom:number) => {
      if (zoom <= 1) return {x:0,y:0};
      const surface = stage.querySelector<HTMLElement>('[data-active="true"] [data-method-zoom-surface]');
      if (!surface) return next;
      const maxX = Math.max(0,(surface.clientWidth*(zoom-1))/2);
      const maxY = Math.max(0,(surface.clientHeight*(zoom-1))/2);
      return {
        x:Math.max(-maxX,Math.min(maxX,next.x)),
        y:Math.max(-maxY,Math.min(maxY,next.y)),
      };
    };
    const commitTrackpadView = (nextZoom:number,nextPan:SlidePan) => {
      const clampedZoom = Math.max(slideZoomLevels[0],Math.min(slideZoomLevels[slideZoomLevels.length-1],nextZoom));
      const boundedZoom = clampedZoom < 1.01 ? 1 : clampedZoom;
      const boundedPan = clampTrackpadPan(boundedZoom <= 1 ? {x:0,y:0} : nextPan,boundedZoom);
      slideZoomRef.current = boundedZoom;
      slidePanRef.current = boundedPan;
      setSlideZoom(boundedZoom);
      setSlidePan(boundedPan);
    };
    const markTrackpadGesture = () => {
      setIsTrackpadGesturing(true);
      if (gestureEndTimer !== null) window.clearTimeout(gestureEndTimer);
      gestureEndTimer = window.setTimeout(() => setIsTrackpadGesturing(false),110);
    };
    const handleTrackpad = (event:WheelEvent) => {
      const currentZoom = slideZoomRef.current;
      const currentPan = slidePanRef.current;
      if (event.ctrlKey) {
        event.preventDefault();
        markTrackpadGesture();
        const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? stage.clientHeight : 1;
        const exponent = Math.max(-.25,Math.min(.25,-event.deltaY*deltaScale*.01));
        const nextZoom = Math.max(slideZoomLevels[0],Math.min(slideZoomLevels[slideZoomLevels.length-1],currentZoom*Math.exp(exponent)));
        if (Math.abs(nextZoom-currentZoom) < .001) return;
        const bounds = stage.getBoundingClientRect();
        const pointX = event.clientX-bounds.left-bounds.width/2;
        const pointY = event.clientY-bounds.top-bounds.height/2;
        const ratio = nextZoom/currentZoom;
        commitTrackpadView(nextZoom,{
          x:pointX-(pointX-currentPan.x)*ratio,
          y:pointY-(pointY-currentPan.y)*ratio,
        });
        return;
      }
      if (event.metaKey || currentZoom <= 1) return;
      event.preventDefault();
      markTrackpadGesture();
      const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? stage.clientHeight : 1;
      commitTrackpadView(currentZoom,{
        x:currentPan.x-event.deltaX*deltaScale,
        y:currentPan.y-event.deltaY*deltaScale,
      });
    };

    stage.addEventListener("wheel",handleTrackpad,{passive:false});
    return () => {
      stage.removeEventListener("wheel",handleTrackpad);
      if (gestureEndTimer !== null) window.clearTimeout(gestureEndTimer);
    };
  },[expandedId]);

  useLayoutEffect(() => {
    if (!expandedId) return;
    const dialog = modalRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {position:body.style.position,top:body.style.top,width:body.style.width,overflow:body.style.overflow,paddingRight:body.style.paddingRight};
    const scrollbarGap = Math.max(0,window.innerWidth-document.documentElement.clientWidth);
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarGap) body.style.paddingRight = `${scrollbarGap}px`;
    const focusFrame = window.requestAnimationFrame(() => document.getElementById("method-focus-back")?.focus({preventScroll:true}));
    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo({top:scrollY,left:0,behavior:"auto"});
    };
  },[expandedId]);

  useLayoutEffect(() => {
    const pending = pendingNavigationRef.current;
    if (!pending) return;
    pendingNavigationRef.current = null;
    const root = document.documentElement;
    const previousScrollBehaviour = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
    try {
      if (pending === "restore" && !expandedId) {
        const anchor = catalogueAnchorRef.current;
        const trigger = anchor ? document.getElementById(`${anchor.id}-trigger`) : null;
        if (trigger) window.requestAnimationFrame(() => trigger.focus({preventScroll:true}));
        else document.getElementById("method-results")?.focus({preventScroll:true});
        return;
      }
      if (pending === "catalogue") document.getElementById("method-results")?.scrollIntoView({behavior:"auto",block:"start"});
    } finally {
      root.style.scrollBehavior = previousScrollBehaviour;
    }
  },[expandedId,journey,navigationRevision]);

  function renderPresentationPage(page:PresentationSlide) {
    if (!selectedMethod || !selectedDeep || !selectedPlain || !selectedSetup || !selectedLevel) return null;
    const slideHeading = (title:string,copy:string) => <header className="method-presentation-slide-heading"><span>{page.number}</span><div><small>{page.label.toUpperCase()}</small><h3>{title}</h3><p>{copy}</p></div></header>;

    if (page.id === "overview") return <div className="method-presentation-overview-slide">
      <MethodOverviewDiagram method={selectedMethod} />
      <section><small>WHAT IT DOES</small><h3>{selectedPlain.lead}</h3><p>{selectedPlain.what}</p><div><small>WHY WE USE IT</small><strong>{selectedPlain.result}</strong></div><ul>{selectedPlain.points.map((point) => <li key={point}><MethodUiIcon name="check" />{point}</li>)}</ul></section>
    </div>;

    if (page.id === "setup") return <div className="method-presentation-setup-slide">
      {slideHeading("Put the right people, rules and records in place.",selectedSetup.goal)}
      <div className="method-presentation-setup-needs"><small>WHAT YOU NEED</small>{selectedSetup.prerequisites.map((item) => <span key={item}><MethodUiIcon name="check" />{item}</span>)}</div>
      <div className="method-presentation-setup-grid">{selectedSetup.setup.map((step,index) => <article key={step.title}><span>{String(index+1).padStart(2,"0")}</span><div><small>{step.owner}</small><h4>{step.title}</h4><p>{step.action}</p><footer><b>YOU END UP WITH</b><strong>{step.produces}</strong></footer></div></article>)}</div>
    </div>;

    if (page.id === "run") return <div className="method-presentation-run-slide">
      {slideHeading("Run the method, then stop for the decisions that need a person.","Every step begins with a clear trigger and leaves a record behind.")}
      <div className="method-presentation-run-grid"><section><header><small>RUN STEPS</small><span>WHAT HAPPENS · WHAT WE DO · WHAT WE KEEP</span></header>{selectedSetup.rhythm.map((row,index) => <article key={row.trigger}><span>{String(index+1).padStart(2,"0")}</span><strong>{row.trigger}</strong><p>{row.action}</p><b>{row.record}</b></article>)}</section><aside><header><small>HUMAN GATES</small><span>{selectedMethod.workflow.length} decisions</span></header>{selectedMethod.workflow.map((step,index) => <article key={step.label}><span>{String(index+1).padStart(2,"0")}</span><div><small>{step.owner}</small><strong>{step.label}</strong><p>{step.gate}</p></div></article>)}</aside></div>
    </div>;

    if (page.id === "proof") return <div className="method-presentation-proof-slide">
      {slideHeading("Use more control only when the risk calls for it.","The method stays the same. The checks and approvals get stronger as the risk rises.")}
      <div>{governanceLevels.map((level) => <article className={selectedLevel === level.level ? "recommended" : ""} data-level={level.level.toLowerCase()} key={level.level}><header><span>{level.number}</span><div><small>{level.level.toUpperCase()} CONTROL</small><strong>{level.label}</strong></div>{selectedLevel === level.level && <b>RECOMMENDED</b>}</header><p>{level.summary}</p><ul>{level.points.map((point) => <li key={point}><MethodUiIcon name="check" />{point}</li>)}</ul></article>)}</div>
    </div>;

    const contractRows = [
      {label:"People",copy:"Who owns and supports the work",items:selectedMethod.roles},
      {label:"What they need",copy:"What exists before work starts",items:selectedMethod.inputs},
      {label:"Rules",copy:"The boundaries while work runs",items:selectedMethod.controls},
      {label:"Decisions",copy:"Choices AI cannot make",items:selectedDeep.decisions},
      {label:"Proof",copy:"What the method produces",items:selectedMethod.outputs},
    ];
    return <div className="method-presentation-controls-slide">
      {slideHeading("Who does what, what they need and what we keep.","Use this as the practical checklist for running the method.")}
      <div className="method-presentation-contract-grid">{contractRows.map((row,index) => <article key={row.label}><header><span>{String(index+1).padStart(2,"0")}</span><div><strong>{row.label}</strong><small>{row.copy}</small></div></header><ul>{row.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
      <div className="method-presentation-assurance-strip"><section><small>WHAT CAN GO WRONG</small>{selectedDeep.failureModes.map((item) => <span key={item}><MethodUiIcon name="warning" />{item}</span>)}</section><section><small>HOW WE KNOW IT WORKS</small>{selectedMethod.measures.map((item) => <span key={item}><MethodUiIcon name="check" />{item}</span>)}</section><aside><small>WHAT WE KEEP AS PROOF</small><strong>Current records showing who owned the work, what was checked and what was decided.</strong></aside></div>
    </div>;
  }

  return <div className="showcase agent-catalogue compass-methods-v5" data-theme={dark ? "dark" : "light"} data-system="compass" data-sidebar={sidebar.collapsed ? "collapsed" : "expanded"} data-aa-active-showroom-index="3">
    <aside className="library-nav methods-library-nav" data-methods-sidebar aria-label="Methods page navigation" inert={expandedId ? true : undefined} aria-hidden={expandedId ? true : undefined}>
      <PortfolioBrand className="brand" section="AI-assisted delivery" />
      <div className="methods-sidebar-content" id="methods-sidebar-content">
        <section className="method-sidebar-summary" data-method-sidebar-summary aria-label={`${catalogueMethods.length} methods across ${methodJourneys.length} delivery stages and three control levels`}>
          <header><small>OPERATING CATALOGUE</small><span><i /> DOCUMENT-BACKED</span></header>
          <div><strong>{catalogueMethods.length}</strong><span>methods across the<br />delivery journey</span></div>
          <section><span><b>{String(methodJourneys.length).padStart(2,"0")}</b> stages</span><span><b>03</b> levels</span><em aria-label="Low, mid and high control levels"><i /><i /><i /></em></section>
        </section>

        <nav id="methods-page-navigation" aria-label="On this page">
          <h2>On this page</h2>
          <a className="method-sidebar-page-link" href="#overview"><i className="method-sidebar-page-icon overview" aria-hidden="true" /><span><strong>Introduction</strong><small>How we manage AI</small></span></a>
          <a className="method-sidebar-page-link" href="#sources"><i className="method-sidebar-page-icon governance" aria-hidden="true" /><span><strong>Control levels</strong><small>Low, Mid and High guidance</small></span></a>
          <a className="method-sidebar-page-link" href="#catalogue"><i className="method-sidebar-page-icon catalogue" aria-hidden="true" /><span><strong>Method catalogue</strong><small>{catalogueMethods.length} documented methods</small></span></a>

          <h2>Delivery stages</h2>
          <div className="methods-sidebar-stages" role="group" aria-label="Filter methods by delivery stage">
            <button type="button" className="methods-sidebar-stage methods-sidebar-stage-all" data-method-stage-filter aria-pressed={journey === "all"} aria-controls="catalogue" onClick={() => selectJourney("all",true)}><span>00</span><strong>All stages</strong><em>{catalogueMethods.length}</em></button>
            {methodJourneys.map((item) => {
              const count = item.ids.filter((id) => catalogueMethods.some((method) => method.id === id)).length;
              return <button type="button" className="methods-sidebar-stage" data-method-stage-filter aria-pressed={journey === item.number} aria-controls="catalogue" disabled={count === 0} title={item.copy} onClick={() => selectJourney(item.number,true)} key={item.number}><span>{item.number}</span><strong>{item.name}</strong><em>{count}</em></button>;
            })}
          </div>

          <h2>Other libraries</h2>
          <Link className="method-sidebar-library" data-library="compass" data-aa-showroom-id="compass" data-aa-showroom-index="0" data-aa-showroom-label="Migration Compass" href={showroomHref("compass")}><i /><span><strong>Migration Compass</strong><small>Architecture patterns</small></span><MethodUiIcon name="arrow-up-right" /></Link>
          <Link className="method-sidebar-library" data-library="tracker" data-aa-showroom-id="tracker" data-aa-showroom-index="1" data-aa-showroom-label="PoC Tracker" href={showroomHref("tracker")}><i /><span><strong>PoC Tracker</strong><small>Delivery patterns</small></span><MethodUiIcon name="arrow-up-right" /></Link>
          <Link className="method-sidebar-library" data-library="components" data-aa-showroom-id="components" data-aa-showroom-index="2" data-aa-showroom-label="Individual Components" href="/components"><i /><span><strong>Individual Components</strong><small>Reusable interface parts</small></span><MethodUiIcon name="arrow-up-right" /></Link>
        </nav>

        <div className="nav-footer method-sidebar-footer"><span className="version"><StatusDot /> Practical guidance</span><p>Choose the control level that fits the work.</p></div>
      </div>
      <button type="button" className="sidebar-collapse-control" onClick={sidebar.toggle} aria-label={sidebar.collapsed ? "Expand methods navigation" : "Collapse methods navigation"} aria-controls="methods-sidebar-content" aria-expanded={!sidebar.collapsed} title={sidebar.collapsed ? "Expand navigation" : "Collapse navigation"}><span aria-hidden="true">{sidebar.collapsed ? "›" : "‹"}</span></button>
    </aside>

    <main id="top" inert={expandedId ? true : undefined} aria-hidden={expandedId ? true : undefined}>
      <header className="topbar"><TopbarIdentity section="Agent Methods" detail="Useful AI. Enough governance." /><ShowroomSwitcher active="methods" /><div className="topbar-actions"><span className="topbar-note">{catalogueMethods.length} methods · 3 portfolios</span><RetroThemeSwitch dark={dark} onToggle={() => setDark((value) => !value)} /></div></header>

      <section className="hero method-catalogue-hero" id="overview">
        <div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-copy"><span className="release-tag">AGENT METHODS · AI-ASSISTED DELIVERY</span><h1>How we manage<br /><em>AI delivery.</em></h1><span className="hero-comic-narration">MEANWHILE, ACROSS DELIVERY…</span><p>A practical library of the methods we use across our projects. Open one to see what it does, how we set it up and how much governance it needs.</p><div className="hero-actions"><a className="button primary" href="#catalogue">Explore the methods <MethodUiIcon name="arrow-down" /></a></div></div>
        <div className="hero-comic-breakout">
          <div className="hero-smash-wall" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><i /><i /><i /></div>
          <div className="hero-comic-colour-panel" aria-hidden="true"><i /><i /><i /></div>
          <ClassicBlueprintHero label="Delivery method overview" items={methodHeroItems} status={`${catalogueMethods.length} EVIDENCE-BACKED METHODS`} />
          <span className="hero-comic-callout callout-baseline" aria-hidden="true"><b>BAM!</b> BASELINE BEFORE BRAVERY</span>
          <span className="hero-comic-callout callout-evidence" aria-hidden="true"><b>ZAP!</b> EVIDENCE &gt; VIBES</span>
          <span className="hero-comic-callout callout-governance" aria-hidden="true"><b>WHAM!</b> JUST ENOUGH GOVERNANCE</span>
          <span className="hero-comic-callout callout-recovery" aria-hidden="true"><b>BOOM!</b> RECOVER, DON&apos;T PANIC</span>
          <span className="hero-comic-sfx" aria-hidden="true"><b>KAPOW!</b> PROPORTIONATE CONTROL</span>
        </div>
      </section>

      <section className="content-section method-sources" id="sources">
        <SectionHeading eyebrow="02 · CONTROL LEVELS" title="Choose the level that fits the work." copy="Low, Mid and High show how much governance to apply. They are not scores." />
        <div className="portfolio-governance-scale" aria-label="Governance control intensity from low to high">
          <span>CONTROL INTENSITY</span><div><b>LOW</b><i /><b>MID</b><i /><b>HIGH</b></div><small>Match the governance to the risk · not a score</small>
        </div>
        <div className="governance-level-grid">{governanceLevels.map((item,index) => <article className="governance-level-card" data-level={item.level.toLowerCase()} key={item.level}>
          <header><span>{item.number}</span><div aria-hidden="true">{[1,2,3].map((step) => <i className={step <= index + 1 ? "filled" : ""} key={step} />)}</div><b>{item.level}</b></header>
          <small>CONTROL LEVEL</small><h3>{item.label}</h3><p>{item.summary}</p>
          <ul>{item.points.map((point) => <li key={point}><MethodUiIcon name="check" />{point}</li>)}</ul>
        </article>)}</div>
      </section>

      <section className="content-section method-catalogue" id="catalogue"><SectionHeading eyebrow="03 · METHOD EXPLORER" title="Find the method you need." copy="Choose a stage, then open a method to see what it does, how to set it up and how to run it." />
        <nav className="method-stage-explorer" data-method-stage-explorer aria-labelledby="method-stage-explorer-title">
          <header className="method-stage-explorer__header"><div><small>DELIVERY JOURNEY</small><h3 id="method-stage-explorer-title">Where do you need help?</h3><p>Pick the part of delivery you want to improve.</p></div><button type="button" className={`method-stage-explorer__all ${journey === "all" ? "active" : ""}`} aria-pressed={journey === "all"} onClick={() => selectJourney("all")}><strong>{catalogueMethods.length}</strong><span>All methods</span><small>Complete library</small><MethodUiIcon name="arrow-right" /></button></header>
          <div className="method-stage-explorer__scope" role="status" aria-live="polite"><span>{activeJourney ? <>Showing <strong>{activeJourney.name}</strong> · {filtered.length} method{filtered.length === 1 ? "" : "s"}</> : <>Showing the <strong>complete delivery journey</strong> · {filtered.length} methods</>}</span>{activeJourney && <button type="button" onClick={() => selectJourney("all")}>Show all methods</button>}</div>
          <ol className="method-stage-explorer__track">{methodJourneys.map((item,index) => {
            const count = item.ids.filter((id) => catalogueMethods.some((method) => method.id === id)).length;
            return <li key={item.name}><button type="button" className={journey === item.number ? "active" : ""} aria-current={journey === item.number ? "step" : undefined} aria-pressed={journey === item.number} disabled={count === 0} title={item.copy} onClick={() => selectJourney(item.number)}><span className="method-stage-explorer__number">{item.number}</span><b>{count}</b><small>STAGE {index+1}</small><strong>{item.name}</strong><p>{item.copy}</p></button></li>;
          })}</ol>
        </nav>

        <div className="method-stack" id="method-results" data-method-card-grid tabIndex={-1}>{renderedMethods.map((method,visibleIndex) => {
          const index = orderedMethodIds.indexOf(method.id);
          const plain = plainLanguage[method.id];
          const methodJourney = journeyById[method.id];
          const level = methodLevel(method);
          const open = expandedId === method.id;
          const previousCard = renderedMethods[visibleIndex-1];
          const showChapter = !previousCard || journeyById[previousCard.id].number !== methodJourney.number;
          return <Fragment key={method.id}>
            {showChapter && <header className="method-chapter"><span>{methodJourney.number}</span><div><small>DELIVERY STAGE</small><h3>{methodJourney.name}</h3><p>{methodJourney.copy}</p></div><b>{filtered.filter((item) => journeyById[item.id].number === methodJourney.number).length} method{filtered.filter((item) => journeyById[item.id].number === methodJourney.number).length === 1 ? "" : "s"}</b></header>}
            <article className={`method-row ${open ? "is-active" : ""}`} data-method-card data-category={method.category.toLowerCase()} data-method-number={String(index+1).padStart(2,"0")} data-journey={methodJourney.number} aria-labelledby={`${method.id}-title`} style={{"--method-card-delay":`${Math.min(visibleIndex,8) * .04}s`} as CSSProperties} id={method.id}>
              <button className="method-row-trigger" type="button" id={`${method.id}-trigger`} onClick={() => toggle(method.id)} aria-haspopup="dialog" aria-controls="method-presentation-dialog">
                <span className="method-row-number">{String(index+1).padStart(2,"0")}</span>
                <span className="method-row-identity"><small>{method.category} · {method.adoption}</small><strong id={`${method.id}-title`}>{methodTitle(method)}</strong><em>{method.name}</em></span>
                <span className="method-row-result"><small>WHY WE USE IT</small><strong>{plain.result}</strong></span>
                <span className="method-row-tags"><small>USED BY · CONTROL LEVEL</small><span>{method.projects.map((projectKey) => { const project = projects[projectKey]; const maturity = method.maturity[projectKey]; return <span className="method-card-project" style={{"--source-colour":project.colour} as CSSProperties} title={`${project.name}: ${maturity}`} key={projectKey}><i /><b>{project.short}</b><em>{maturity === "Implemented foundation" ? "Foundation" : maturity}</em></span>; })}<b className={`method-level-badge level-${level.toLowerCase()}`}><i />{level}</b></span></span>
                <span className="method-row-toggle"><small>Open</small><i aria-hidden="true"><MethodUiIcon name="arrow-up-right" /></i></span>
              </button>

            </article>
          </Fragment>;
        })}{!filtered.length && <div className="usecase-empty"><strong>No methods in this stage</strong><p>Return to all stages to see the complete library.</p><button className="button secondary" onClick={() => selectJourney("all")}>Show all methods</button></div>}</div>
      </section>

      <footer><PortfolioBrand className="brand" section="Agent methods" /><p>Practical methods organised by delivery stage and control level.</p><a href="#top">Back to top <MethodUiIcon name="arrow-up" /></a></footer>
    </main>

    {selectedMethod && selectedJourney && currentPage && <dialog className="method-presentation" id="method-presentation-dialog" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="method-presentation-title" aria-describedby="method-presentation-subtitle method-presentation-zoom-help" data-method-reader-dialog data-direction={slideDirection} onCancel={(event) => { event.preventDefault(); closeMethod(); }} onPointerDown={(event) => { if (event.target === event.currentTarget) closeMethod(); }} onKeyDown={handlePresentationKey}>
      <div className="method-presentation__shell">
        <header className="method-presentation__header">
          <div><small>METHOD {String(orderedMethodIds.indexOf(selectedMethod.id)+1).padStart(2,"0")} · {selectedJourney.name.toUpperCase()}</small><strong id="method-presentation-title">{methodTitle(selectedMethod)}</strong><span id="method-presentation-subtitle">{selectedMethod.name}</span></div>
          <div className="method-presentation__actions">
            <span className="method-presentation__pan-hint visible" aria-hidden="true">{slideZoom > 1 ? "PINCH TO ZOOM · TWO-FINGER SCROLL TO PAN" : "PINCH TO ZOOM"}</span>
            <div className="method-presentation__zoom" role="group" aria-label="Slide zoom" data-method-zoom-controls>
              <button type="button" aria-label="Zoom out" aria-keyshortcuts="-" title="Zoom out (−)" disabled={slideZoom <= slideZoomLevels[0]+.001} onClick={() => changeSlideZoom(-1)}><span aria-hidden="true">−</span></button>
              <button className="method-presentation__zoom-level" type="button" aria-label={`Reset zoom and position. Current zoom ${Math.round(slideZoom*100)} per cent`} aria-keyshortcuts="0" title="Reset zoom and centre (0)" disabled={slideZoom === 1 && slidePan.x === 0 && slidePan.y === 0} onClick={resetSlideView}><output aria-live="polite">{Math.round(slideZoom*100)}%</output></button>
              <button type="button" aria-label="Zoom in" aria-keyshortcuts="+ =" title="Zoom in (+)" disabled={slideZoom >= slideZoomLevels[slideZoomLevels.length-1]-.001} onClick={() => changeSlideZoom(1)}><span aria-hidden="true">+</span></button>
            </div>
            <button className="method-presentation__close" id="method-focus-back" type="button" onClick={closeMethod} aria-label="Close method and return to the catalogue"><span aria-hidden="true">×</span><strong>Close</strong><small>ESC</small></button>
          </div>
          <p className="visually-hidden" id="method-presentation-zoom-help">Pinch on a trackpad or use the zoom controls to enlarge the current slide. When zoomed, move with two fingers, drag the slide or use the arrow keys. Press 0 to reset the view.</p>
        </header>

        <nav className="method-presentation__chapters" aria-label={`Chapters in ${methodTitle(selectedMethod)}`}>
          <div role="tablist" aria-orientation="horizontal" aria-label="Method guide slides">{methodChapters.map((chapter,chapterIndex) => <button type="button" role="tab" id={`method-chapter-tab-${chapterIndex}`} aria-selected={activeChapterIndex === chapterIndex} aria-controls={`method-page-${chapter.id}`} tabIndex={activeChapterIndex === chapterIndex ? 0 : -1} data-method-slide-tab onClick={() => openChapter(chapter.id)} onKeyDown={(event) => handleSlideTabKey(event,chapterIndex)} key={chapter.id}><span>{chapter.number}</span><strong>{chapter.label}</strong><small>{chapter.copy}</small></button>)}</div>
        </nav>

        <div className="method-presentation__stage" id="method-presentation-stage" ref={stageRef} data-zoomed={slideZoom > 1 ? "true" : "false"} data-panning={isPanning ? "true" : "false"} data-gesturing={isTrackpadGesturing ? "true" : "false"} onPointerDown={handleSlidePointerDown} onPointerMove={handleSlidePointerMove} onPointerUp={handleSlidePointerUp} onPointerCancel={cancelSlidePointer} onLostPointerCapture={() => { slideGestureRef.current = null; setIsPanning(false); }}>
          <div className="method-presentation__strip" style={{"--method-page-index":activePage} as CSSProperties}>{selectedPages.map((page,pageIndex) => <section className="method-presentation__page" id={`method-page-${page.id}`} role="tabpanel" aria-labelledby={`method-chapter-tab-${methodChapters.findIndex((chapter) => chapter.id === page.id)}`} aria-hidden={activePage !== pageIndex} inert={activePage !== pageIndex ? true : undefined} tabIndex={activePage === pageIndex ? 0 : -1} data-active={activePage === pageIndex ? true : undefined} data-method-slide={page.id} key={page.id}><div className="method-presentation__zoom-surface" data-method-zoom-surface style={{"--method-zoom":activePage === pageIndex ? slideZoom : 1,"--method-pan-x":`${activePage === pageIndex ? slidePan.x : 0}px`,"--method-pan-y":`${activePage === pageIndex ? slidePan.y : 0}px`} as CSSProperties}>{renderPresentationPage(page)}</div></section>)}</div>
        </div>
      </div>
    </dialog>}
  </div>;
}
