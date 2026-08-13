"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Method } from "./AgentMethods";

type Tone = "accent" | "success" | "warning" | "danger" | "info" | "muted";
type NodeHelp = { summary?:string; owner?:string; keeps?:string; movesWhen?:string; stopsWhen?:string };
type NodeHelpInput = string | NodeHelp;
type TooltipMode = "pointer" | "keyboard" | "touch";
type ActiveTooltip = { trigger:HTMLElement; title:string; help:Required<NodeHelp>; mode:TooltipMode };
type TooltipPosition = { left:number; top:number; arrowX:number; placement:"above"|"below"; ready:boolean };

const categoryHelp: Record<Method["category"],Pick<Required<NodeHelp>,"summary"|"owner"|"keeps">> = {
  Governance:{summary:"This keeps a named person and a clear decision around the AI-assisted work.",owner:"The named human authority for this part of delivery.",keeps:"The decision, accountable owner, time and supporting evidence."},
  Delivery:{summary:"This keeps the work moving through one controlled delivery route.",owner:"The task owner or named integrator.",keeps:"The exact version, completed checks and handover record."},
  Evidence:{summary:"This makes the result traceable without relying on chat history or memory.",owner:"The record owner or independent reviewer.",keeps:"The source, version, limitations and recorded decision."},
  Safety:{summary:"This limits what can change and keeps the boundary visible.",owner:"The technical, security or data owner for the boundary.",keeps:"The agreed boundary, any exception and the action taken."},
  Quality:{summary:"This turns a delivery claim into something another person can check.",owner:"The reviewer or test owner named for the work.",keeps:"Executed checks, findings, limitations and the review outcome."},
};

const toneProgress: Record<Tone,Pick<Required<NodeHelp>,"movesWhen"|"stopsWhen">> = {
  accent:{movesWhen:"Scope and ownership are agreed.",stopsWhen:"The starting point is missing, unclear or stale."},
  info:{movesWhen:"Its output is complete, current and handed to the next step.",stopsWhen:"An input is missing or the work moves outside the agreed scope."},
  warning:{movesWhen:"The evidence has been checked and a person has made the decision.",stopsWhen:"A required check, reviewer or decision is missing."},
  danger:{movesWhen:"The gap is fixed and the affected checks have been repeated.",stopsWhen:"The blocker is still open."},
  success:{movesWhen:"The result is accepted and linked to the exact version reviewed.",stopsWhen:"The evidence or approval becomes stale."},
  muted:{movesWhen:"The supporting information is complete and current.",stopsWhen:"The supporting information is missing."},
};

function sentence(value:string) {
  const trimmed = value.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function helpAttributes(help?:NodeHelpInput) {
  const value = typeof help === "string" ? {summary:help} : help ?? {};
  return {
    "data-node-summary":value.summary ? sentence(value.summary) : undefined,
    "data-node-owner":value.owner ? sentence(value.owner) : undefined,
    "data-node-keeps":value.keeps ? sentence(value.keeps) : undefined,
    "data-node-moves":value.movesWhen ? sentence(value.movesWhen) : undefined,
    "data-node-stops":value.stopsWhen ? sentence(value.stopsWhen) : undefined,
  };
}

function inspectableNode(title:string, help?:NodeHelpInput, tone:Tone="info") {
  return {
    tabIndex:0,
    role:"group" as const,
    "aria-label":title,
    "data-diagram-node":"true",
    "data-node-title":title,
    "data-node-tone":tone,
    ...helpAttributes(help),
  };
}

function DiagramFrame({ method, label, children }: { method:Method; label:string; children:ReactNode }) {
  const tooltipId = useId();
  const canvasRef = useRef<HTMLDivElement|null>(null);
  const tooltipRef = useRef<HTMLDivElement|null>(null);
  const activeRef = useRef<ActiveTooltip|null>(null);
  const pointerRef = useRef({x:0,y:0});
  const positionFrameRef = useRef<number|null>(null);
  const touchGestureRef = useRef<{pointerId:number;node:HTMLElement;x:number;y:number;moved:boolean}|null>(null);
  const [activeTooltip,setActiveTooltip] = useState<ActiveTooltip|null>(null);
  const [position,setPosition] = useState<TooltipPosition>({left:0,top:0,arrowX:20,placement:"below",ready:false});

  function findNode(target:EventTarget|null) {
    if (!(target instanceof HTMLElement)) return null;
    const node = target.closest<HTMLElement>("[data-diagram-node]");
    return node && canvasRef.current?.contains(node) ? node : null;
  }

  function diagramNodes() {
    return Array.from(canvasRef.current?.querySelectorAll<HTMLElement>("[data-diagram-node]") ?? []);
  }

  function makeCurrentNode(node:HTMLElement) {
    for (const item of diagramNodes()) item.tabIndex = item === node ? 0 : -1;
  }

  function readHelp(node:HTMLElement):Required<NodeHelp> {
    const tone = (node.dataset.nodeTone as Tone|undefined) ?? "info";
    const category = categoryHelp[method.category];
    const progress = toneProgress[tone];
    return {
      summary:node.dataset.nodeSummary ?? category.summary,
      owner:node.dataset.nodeOwner ?? category.owner,
      keeps:node.dataset.nodeKeeps ?? category.keeps,
      movesWhen:node.dataset.nodeMoves ?? progress.movesWhen,
      stopsWhen:node.dataset.nodeStops ?? progress.stopsWhen,
    };
  }

  function detachDescription() {
    activeRef.current?.trigger.removeAttribute("aria-describedby");
  }

  function dismissTooltip() {
    detachDescription();
    activeRef.current = null;
    setActiveTooltip(null);
    setPosition((current) => ({...current,ready:false}));
  }

  function activateNode(node:HTMLElement,mode:TooltipMode) {
    if (activeRef.current?.trigger !== node) detachDescription();
    const next = {trigger:node,title:node.dataset.nodeTitle ?? "This step",help:readHelp(node),mode};
    node.setAttribute("aria-describedby",tooltipId);
    activeRef.current = next;
    setPosition((current) => ({...current,ready:false}));
    setActiveTooltip(next);
  }

  function calculatePosition() {
    const active = activeRef.current;
    const tooltip = tooltipRef.current;
    if (!active || !tooltip) return;
    const margin = 12;
    const gap = 12;
    const bounds = tooltip.getBoundingClientRect();
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const triggerBounds = active.trigger.getBoundingClientRect();
    const anchorX = active.mode === "pointer" ? pointerRef.current.x : triggerBounds.left + triggerBounds.width / 2;
    const anchorY = active.mode === "pointer" ? pointerRef.current.y : triggerBounds.bottom;
    let left = active.mode === "pointer" ? anchorX + 18 : anchorX - bounds.width / 2;
    if (active.mode === "pointer" && left + bounds.width > viewportWidth - margin) left = anchorX - bounds.width - 18;
    left = Math.max(margin,Math.min(left,viewportWidth - bounds.width - margin));
    let top = active.mode === "pointer" ? anchorY + 18 : triggerBounds.bottom + gap;
    let placement:"above"|"below" = "below";
    if (top + bounds.height > viewportHeight - margin) {
      top = (active.mode === "pointer" ? anchorY : triggerBounds.top) - bounds.height - gap;
      placement = "above";
    }
    top = Math.max(margin,Math.min(top,viewportHeight - bounds.height - margin));
    const arrowX = Math.max(18,Math.min(anchorX - left,bounds.width - 18));
    setPosition({left,top,arrowX,placement,ready:true});
  }

  function schedulePosition() {
    if (positionFrameRef.current !== null) return;
    positionFrameRef.current = window.requestAnimationFrame(() => {
      positionFrameRef.current = null;
      calculatePosition();
    });
  }

  function handlePointerOver(event:PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const node = findNode(event.target);
    const previous = findNode(event.relatedTarget);
    if (!node || node === previous) return;
    pointerRef.current = {x:event.clientX,y:event.clientY};
    activateNode(node,"pointer");
  }

  function handlePointerMove(event:PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      const gesture = touchGestureRef.current;
      if (gesture && gesture.pointerId === event.pointerId && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y) > 8) gesture.moved = true;
      return;
    }
    pointerRef.current = {x:event.clientX,y:event.clientY};
    if (activeRef.current?.mode === "pointer" && activeRef.current.trigger === findNode(event.target)) schedulePosition();
  }

  function handlePointerOut(event:PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const node = findNode(event.target);
    const next = findNode(event.relatedTarget);
    if (node && node !== next && activeRef.current?.mode === "pointer") dismissTooltip();
  }

  function handleFocus(event:FocusEvent<HTMLDivElement>) {
    const node = findNode(event.target);
    if (node) {
      makeCurrentNode(node);
      activateNode(node,"keyboard");
    }
  }

  function handleBlur(event:FocusEvent<HTMLDivElement>) {
    const next = findNode(event.relatedTarget);
    if (next) activateNode(next,"keyboard");
    else if (activeRef.current?.mode === "keyboard") dismissTooltip();
  }

  function handleNodeKey(event:ReactKeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Home","End"].includes(event.key)) return;
    const nodes = diagramNodes();
    if (!nodes.length) return;
    const current = findNode(event.target) ?? nodes[0];
    const currentIndex = Math.max(0,nodes.indexOf(current));
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % nodes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + nodes.length) % nodes.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = nodes.length - 1;
    event.preventDefault();
    makeCurrentNode(nodes[nextIndex]);
    nodes[nextIndex].focus();
  }

  function handleTouchStart(event:PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    const node = findNode(event.target);
    if (node) touchGestureRef.current = {pointerId:event.pointerId,node,x:event.clientX,y:event.clientY,moved:false};
  }

  function handleTouchEnd(event:PointerEvent<HTMLDivElement>) {
    const gesture = touchGestureRef.current;
    touchGestureRef.current = null;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.moved) return;
    if (activeRef.current?.mode === "touch" && activeRef.current.trigger === gesture.node) dismissTooltip();
    else activateNode(gesture.node,"touch");
  }

  useLayoutEffect(() => {
    const nodes = diagramNodes();
    for (const [index,node] of nodes.entries()) node.tabIndex = index === 0 ? 0 : -1;
  },[method.id]);

  useLayoutEffect(() => { if (activeTooltip) calculatePosition(); },[activeTooltip]);

  useEffect(() => {
    if (!activeTooltip) return;
    const dismiss = () => {
      activeRef.current?.trigger.removeAttribute("aria-describedby");
      activeRef.current = null;
      setActiveTooltip(null);
      setPosition((current) => ({...current,ready:false}));
    };
    const handleEscape = (event:KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      dismiss();
    };
    const handleOutsideTouch = (event:globalThis.PointerEvent) => {
      const target = event.target;
      if (activeRef.current?.mode !== "touch" || (target instanceof HTMLElement && (activeRef.current.trigger.contains(target) || tooltipRef.current?.contains(target)))) return;
      dismiss();
    };
    const handleViewportScroll = (event:Event) => {
      const target = event.target;
      if (activeRef.current?.mode === "touch" && target instanceof HTMLElement && tooltipRef.current?.contains(target)) return;
      dismiss();
    };
    window.addEventListener("keydown",handleEscape,true);
    window.addEventListener("resize",dismiss);
    window.addEventListener("blur",dismiss);
    document.addEventListener("scroll",handleViewportScroll,true);
    document.addEventListener("pointerdown",handleOutsideTouch,true);
    window.visualViewport?.addEventListener("resize",dismiss);
    window.visualViewport?.addEventListener("scroll",dismiss);
    return () => {
      window.removeEventListener("keydown",handleEscape,true);
      window.removeEventListener("resize",dismiss);
      window.removeEventListener("blur",dismiss);
      document.removeEventListener("scroll",handleViewportScroll,true);
      document.removeEventListener("pointerdown",handleOutsideTouch,true);
      window.visualViewport?.removeEventListener("resize",dismiss);
      window.visualViewport?.removeEventListener("scroll",dismiss);
    };
  },[activeTooltip]);

  useEffect(() => () => {
    detachDescription();
    if (positionFrameRef.current !== null) window.cancelAnimationFrame(positionFrameRef.current);
  },[]);

  const tooltipStyle = {left:position.left,top:position.top,"--tooltip-arrow-x":`${position.arrowX}px`} as CSSProperties;
  const portalTarget = typeof document === "undefined" ? null : document.querySelector<HTMLElement>("[data-method-reader-dialog]") ?? document.querySelector<HTMLElement>(".compass-methods-v5");

  return <figure className={`method-visual method-visual-v6 method-visual-${method.id}`} role="group" aria-label={label}>
    <div className="method-visual-grid" aria-hidden="true" />
    <header><span><i /> HOW THIS METHOD WORKS <em className="method-node-hint-pointer">HOVER OR FOCUS A STEP</em><em className="method-node-hint-touch">TAP A STEP FOR MORE</em></span><b>{method.category.toUpperCase()}</b></header>
    <div ref={canvasRef} className="method-visual-canvas method-overview-canvas" onPointerOver={handlePointerOver} onPointerMove={handlePointerMove} onPointerOut={handlePointerOut} onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerCancel={() => { touchGestureRef.current = null; }} onFocusCapture={handleFocus} onBlurCapture={handleBlur} onKeyDown={handleNodeKey}>{children}</div>
    <footer><span>REUSABLE DELIVERY CONTROL</span><b>{method.adoption.toUpperCase()} METHOD</b></footer>
    {activeTooltip && portalTarget && createPortal(<div className="method-node-tooltip" id={tooltipId} ref={tooltipRef} role="tooltip" data-method-node-tooltip data-placement={position.placement} data-ready={position.ready} style={tooltipStyle}>
      <div className="method-node-tooltip__content"><header><small>MORE ABOUT THIS STEP</small><strong>{activeTooltip.title}</strong></header>
        <p>{activeTooltip.help.summary}</p>
        <dl><div><dt>OWNER</dt><dd>{activeTooltip.help.owner}</dd></div><div><dt>WE KEEP</dt><dd>{activeTooltip.help.keeps}</dd></div><div><dt>MOVE ON WHEN</dt><dd>{activeTooltip.help.movesWhen}</dd></div><div><dt>STOP IF</dt><dd>{activeTooltip.help.stopsWhen}</dd></div></dl>
        <small className="method-node-tooltip__touch-hint">Tap the step again, or tap outside, to close.</small>
      </div>
    </div>,portalTarget)}
  </figure>;
}

function Node({ title, detail, kicker, tone="muted", status, help, className="" }: { title:string; detail?:string; kicker?:string; tone?:Tone; status?:string; help?:NodeHelpInput; className?:string }) {
  return <div className={`overview-node tone-${tone} ${className}`} {...inspectableNode(title,help,tone)}>
    {kicker && <small>{kicker}</small>}
    <strong>{title}</strong>
    {detail && <span>{detail}</span>}
    {status && <b>{status}</b>}
  </div>;
}

function Arrow({ label, vertical=false }: { label?:string; vertical?:boolean }) {
  return <div className={`overview-arrow ${vertical ? "vertical" : ""}`} aria-hidden={label ? undefined : true}><i aria-hidden="true" />{label && <span>{label}</span>}</div>;
}

function Rule({ children, tone="accent" }: { children:ReactNode; tone?:Tone }) {
  return <div className={`overview-rule tone-${tone}`}><i aria-hidden="true" />{children}</div>;
}

function State({ children, tone="muted" }: { children:ReactNode; tone?:Tone }) {
  return <span className={`overview-state tone-${tone}`}><i aria-hidden="true" />{children}</span>;
}

function MiniFlow({ steps, className="" }: { steps:Array<{ title:string; detail?:string; tone?:Tone; status?:string; help?:NodeHelpInput }>; className?:string }) {
  return <div className={`overview-mini-flow ${className}`}>
    {steps.map((step,index) => <div className="overview-mini-step" key={`${step.title}-${index}`}>
      <Node {...step} kicker={String(index+1).padStart(2,"0")} />
      {index < steps.length-1 && <Arrow />}
    </div>)}
  </div>;
}

const authorityStages = [
  { title:"Authorise", detail:"Scope authority", status:"Human scope decision", tone:"accent" as Tone, help:{summary:"Turns the request into one approved piece of work before AI starts expanding it.",owner:"The business or product owner.",keeps:"The approved need, scope, acceptance criteria and named owner.",movesWhen:"Ownership and the outcome are clear.",stopsWhen:"The request is unapproved, unclear or has no accountable owner."} },
  { title:"Prepare", detail:"Risk authority", status:"Human risk decision", tone:"warning" as Tone, help:{summary:"Checks that the team can do the work safely and prove it afterwards.",owner:"The delivery and risk owners.",keeps:"The risk view, delivery route, reviewers, test plan and recovery expectation.",movesWhen:"The important risks and required checks are agreed.",stopsWhen:"A dependency, reviewer, workspace or recovery route is missing."} },
  { title:"Implement", detail:"AI may analyse, draft, build and test", status:"No approval authority", tone:"info" as Tone, help:{summary:"Lets the agent do useful work while keeping it inside one approved brief.",owner:"The task owner; the agent works under that authority.",keeps:"The exact change, executed checks, findings and limitations.",movesWhen:"The agreed task is complete and ready for independent review.",stopsWhen:"New scope appears or the agent no longer has enough authority or evidence."} },
  { title:"Assure", detail:"Risk authority", status:"Checks independent evidence", tone:"warning" as Tone, help:{summary:"Separates building the change from deciding whether the proof is good enough.",owner:"An independent reviewer or specialist assurance owner.",keeps:"Executed results, findings, limitations and required fixes.",movesWhen:"Every required check is complete and blockers are resolved.",stopsWhen:"A material finding is unresolved or evidence is missing."} },
  { title:"Accept", detail:"Acceptance authority", status:"Human decision on exact tested version", tone:"success" as Tone, help:{summary:"Ties the business decision to the exact version people actually reviewed.",owner:"The named business or product approver.",keeps:"Approve, return or reject against the tested version and evidence.",movesWhen:"The human decision is recorded.",stopsWhen:"The version, evidence or acceptance criteria have changed."} },
  { title:"Integration / release", detail:"Release authority", status:"Human release decision", tone:"success" as Tone, help:{summary:"Protects the shared baseline from unreviewed or stale work.",owner:"The named integrator or release authority.",keeps:"The source version, current checks, approval and release or merge record.",movesWhen:"Evidence is current and the named person authorises the move.",stopsWhen:"There is a conflict, stale approval or failed required check."} },
];

export default function MethodOverviewDiagram({ method }: { method:Method }) {
  switch (method.id) {
    case "govern-change":
      return <DiagramFrame method={method} label="A six-stage delivery sequence ties named human decisions to scope, risk, acceptance and integration or release; AI can implement inside the boundary but cannot approve any gate.">
        <div className="overview-title-row"><span>DELIVERY SEQUENCE</span><b>AUTHORITY BOUNDARY AT EACH STAGE</b></div>
        <MiniFlow steps={authorityStages} className="authority-stage-flow" />
        <Rule tone="danger"><strong>AI can draft and execute within approved scope.</strong><span> It cannot approve scope, accept risk, accept its own work or authorise release.</span></Rule>
      </DiagramFrame>;

    case "establish-baseline":
      return <DiagramFrame method={method} label="Authoritative sources, objectives, constraints and technical state are separated into facts, assumptions and gaps, then owned and approved as a versioned baseline.">
        <div className="overview-input-grid">
          {['Authoritative sources','Business objectives','Technical state','Constraints'].map((title) => <Node key={title} title={title} tone="info" />)}
        </div>
        <Arrow label="classify" vertical />
        <div className="overview-three-way">
          <Node kicker="KNOWN" title="Facts" detail="Source-backed and current" tone="success" help={{summary:"Gives everyone the same trusted starting point.",owner:"The baseline lead.",keeps:"The source, capture date and version used.",movesWhen:"The source is current and agreed.",stopsWhen:"Evidence is stale or sources contradict one another."}} />
          <Node kicker="TO VERIFY" title="Assumptions" detail="Named owner + evidence or verification needed" tone="warning" help={{summary:"Keeps an unproven idea visible instead of quietly turning it into a fact.",owner:"The person named to verify it.",keeps:"The assumption, owner, evidence needed and due decision.",movesWhen:"It is confirmed, rejected or made an accepted constraint.",stopsWhen:"An important assumption has no owner or could change the decision."}} />
          <Node kicker="OPEN" title="Gaps" detail="Question, owner and decision route" tone="danger" help={{summary:"Makes missing information an owned action rather than something the agent guesses.",owner:"The person who can answer or resolve the question.",keeps:"The gap, owner, next action and effect on the work.",movesWhen:"The answer is recorded and the affected decision is refreshed.",stopsWhen:"The gap changes scope, risk or authority."}} />
        </div>
        <Arrow label="human approval" vertical />
        <Node kicker="CONTROLLED STARTING POINT" title="Versioned approved baseline" detail="Sources, owners, decisions and open limitations remain visible" tone="accent" status="Refresh when a material source changes" className="overview-wide-node" />
      </DiagramFrame>;

    case "architecture-standards":
      return <DiagramFrame method={method} label="Approved architecture and standards flow through decisions, coding conventions, test strategy, security, privacy and accessibility triggers, and Definition of Done evidence into a task contract; change invalidates approval and loops back.">
        <MiniFlow className="overview-architecture-flow" steps={[
          {title:'Approved architecture + standards',detail:'Versioned control set · named owners · current approval',tone:'accent'},
          {title:'Architecture decisions',detail:'Boundaries · shared contracts · trade-offs',tone:'info'},
          {title:'Coding conventions',detail:'Repository · dependency · documentation rules',tone:'info'},
          {title:'Test strategy',detail:'Required functional and non-functional proof',tone:'info'},
          {title:'Specialist triggers',detail:'Security · privacy · accessibility',tone:'warning'},
          {title:'Definition of Done + evidence',detail:'Checks · findings · limitations · human decisions',tone:'info'},
          {title:'Current task contract',detail:'Approved design + standards + tests + evidence',tone:'success'},
          {title:'Implementation + assurance',detail:'Build inside the contract; reviewers prove triggered controls',tone:'success'},
        ]} />
        <Rule tone="warning"><strong>Material architecture or standards change</strong><span> → approval becomes stale → refresh the task contract and approval → return to implementation authority.</span></Rule>
        <div className="overview-status-row"><State tone="success">Compass · operational</State><State tone="info">PoC Tracker · defined</State><State tone="warning">Meter Reconciliation · implemented foundation</State></div>
      </DiagramFrame>;

    case "boards-delivery-spine":
      return <DiagramFrame method={method} label="An Azure DevOps hierarchy links epic, user story and task or bug to design, branch, pull request, build, executed tests and human acceptance before Done.">
        <div className="overview-split-layout overview-board-split">
          <section className="overview-stack"><small>AZURE DEVOPS HIERARCHY</small>
            <Node title="Epic / capability stream" tone="info" />
            <Arrow vertical />
            <Node title="User Story / Issue fallback + acceptance criteria" tone="info" />
            <Arrow vertical />
            <Node title="Task or bug" detail="Stable identifier + owner" tone="accent" />
          </section>
          <Arrow label="approved task enters evidence spine" />
          <section className="overview-stack"><small>DELIVERY EVIDENCE SPINE</small>
            <MiniFlow className="overview-board-evidence-flow" steps={[
              {title:'Approved design',tone:'info'},
              {title:'Branch + pull request',tone:'info'},
              {title:'Build result',tone:'info'},
              {title:'Executed test evidence',tone:'warning'},
              {title:'Human acceptance',tone:'success'},
            ]} />
          </section>
        </div>
        <div className="overview-two-way compact"><Rule tone="success"><strong>Done only when</strong><span> children, acceptance criteria, findings, lineage and the human decision all agree.</span></Rule><Rule tone="danger"><strong>Missing evidence</strong><span> → block the state change and return the gap to its owner.</span></Rule></div>
        <div className="overview-status-row"><State tone="warning">Meter Reconciliation · implemented foundation</State><State tone="danger">Azure DevOps Basic process · type mapping remains pending</State></div>
      </DiagramFrame>;

    case "select-route":
      return <DiagramFrame method={method} label="A change is classified across functional, architecture and shared contracts, data and schema, security and privacy, and deployment and release impact before a full, checked no-functional-change, or authorised constrained route is selected; material change loops back.">
        <div className="overview-route-layout">
          <section className="overview-stack"><small>CLASSIFY THE CHANGE</small>
            {[
              ['Functional behaviour','Check whether people will see or use the feature differently.'],
              ['Architecture + shared contracts','Check whether the change affects the system design or anything another part of the system relies on.'],
              ['Data + schema','Check whether stored data, fields or migration steps will change.'],
              ['Security + privacy','Check whether access, personal data or sensitive information could be affected.'],
              ['Deployment + release','Check whether the way we deploy, release or recover needs to change.'],
            ].map(([title,help]) => <div className="overview-check-row overview-node-interactive" {...inspectableNode(title,help)} key={title}><i>?</i><span>{title}</span></div>)}
          </section>
          <Arrow label="choose" />
          <section className="overview-route-options">
            <Node kicker="MATERIAL IMPACT" title="Full A–G route" detail="Intake → requirements → design → tasks → readiness → one task → integration and release" tone="accent" />
            <Node kicker="EVIDENCE CHECKED" title="No-functional-change route" detail="Record the classification, rationale, retained checks and proof" tone="success" />
            <Node kicker="EXPLICITLY AUTHORISED" title="Constrained short route" detail="Named boundary and mandatory gates; never an informal bypass" tone="warning" />
          </section>
        </div>
        <Rule tone="danger"><strong>Material change discovered</strong><span> → stop → reclassify all five impacts → select and approve the route again.</span></Rule>
      </DiagramFrame>;

    case "baseline-forecast-change":
      return <DiagramFrame method={method} label="Approved baseline version one remains locked while optimistic, most-likely and pessimistic estimates and dependencies produce scenarios, P50 and P80 forecasts and earned-value measures; a human-approved change preserves version one and creates version two, while a rejected change leaves version one locked and the variance visible.">
        <div className="overview-forecast-lanes">
          <section className="overview-stack forecast-baseline-lane overview-node-interactive" {...inspectableNode('Approved baseline',{summary:'Provides the fixed comparison point needed to explain later variance honestly.',owner:'The human planning authority.',keeps:'The approved scope, schedule, budget, reserve and earning rules.',movesWhen:'A separate change decision creates a new version.',stopsWhen:'Someone tries to overwrite it with the latest forecast or actual result.'},'accent')}><small>APPROVED PLAN · LOCKED</small><strong>Baseline version 1</strong>{['Scope','Schedule','Budget','Management reserve','Objective earning rules'].map((item) => <span key={item}><i />{item}</span>)}</section>
          <section className="overview-stack forecast-outlook-lane overview-node-interactive" {...inspectableNode('Current forecast',{summary:'Shows our latest view of what may happen without rewriting what people approved.',owner:'The planning owner.',keeps:'The three-point estimates, dependencies, assumptions, scenarios and calculation version.',movesWhen:'The outlook is refreshed from current evidence.',stopsWhen:'Estimates, dependencies or unavailable values are hidden.'},'info')}><small>CURRENT OUTLOOK · DOES NOT REWRITE THE BASELINE</small><strong className="overview-subheading">THREE-POINT WORK-PACKAGE ESTIMATES</strong><div className="overview-estimate-row"><span><b>O · Optimistic</b>Low case</span><span><b>M · Most likely</b>Expected case</span><span><b>P · Pessimistic</b>High case</span></div><Arrow label="combine with dependencies" vertical /><div className="overview-forecast-route"><span>Dependencies</span><i /> <span>Scenarios</span><i /> <span {...inspectableNode('P50',{summary:'Use this as the balanced planning view, not as a guaranteed date.',owner:'The planning owner.',keeps:'The pinned estimates, dependencies, scenario assumptions and calculation version.',movesWhen:'It is considered alongside P80 for the planning decision.',stopsWhen:'The underlying estimate or dependency evidence is missing.'})} className="overview-node-interactive"><b>P50</b>50% confidence date</span><i /> <span {...inspectableNode('P80',{summary:'Use this safer view when the decision needs more protection from uncertainty.',owner:'The planning and change authorities.',keeps:'The same pinned scenario evidence as P50 with the higher-confidence outcome.',movesWhen:'A person chooses whether the extra confidence is needed for commitment or reserve.',stopsWhen:'The underlying estimate or dependency evidence is missing.'},'warning')} className="overview-node-interactive"><b>P80</b>80% confidence date</span><i /> <span>Actual delivery evidence</span></div></section>
        </div>
        <Arrow label="compare both lanes" vertical />
        <Node kicker="LOCKED PLAN + CURRENT OUTLOOK" title="Compare actual delivery with the locked baseline" detail="Keep forecast, actuals and variance visible without rewriting history" tone="info" className="overview-wide-node" />
        <div className="overview-definition-grid" aria-label="Earned-value term definitions">
          {[
            ['PV','Planned Value','How much approved work we expected to have completed by this point.'],
            ['EV','Earned Value','The approved value of the work we have actually completed.'],
            ['AC','Actual Cost','What the completed work has actually cost so far.'],
            ['SPI','Schedule Performance Index','A simple comparison of completed value with planned value. Below 1 means we are behind the plan.'],
            ['CPI','Cost Performance Index','A simple comparison of completed value with actual cost. Below 1 means the work is costing more than planned.'],
            ['EAC','Estimate at Completion','Our current estimate of the total cost when the work is finished.'],
          ].map(([term,definition,help]) => <span className="overview-node-interactive" {...inspectableNode(`${term} · ${definition}`,help)} key={term}><b>{term}</b>{definition}</span>)}
        </div>
        <div className="overview-change-control">
          <Node kicker="VARIANCE OR MATERIAL CHANGE" title="Raise change request" detail="Assess scope, schedule, cost, dependency and reserve impact" tone="warning" />
          <Arrow label="human decision" />
          <div className="overview-decision-split">
            <Node kicker="REJECT" title="Baseline version 1 stays locked" detail="Keep the current forecast and variance visible" tone="danger" />
            <Node kicker="APPROVE" title="Preserve version 1 → create version 2" detail="Record the decision, approval and revised baseline" tone="success" />
          </div>
        </div>
        <Rule tone="info"><strong>PoC Tracker · operational planning control.</strong><span> This diagram defines the measures and decision logic; it does not show illustrative or live project values.</span></Rule>
      </DiagramFrame>;

    case "prompt-pack":
      return <DiagramFrame method={method} label="The Phase 1 approved baseline feeds each step of the single A-to-G governed delivery route: intake, requirements, design, tasks, hard stop, one task, integration and release; human decisions remain outside the prompt sequence.">
        <Node kicker="PHASE 1 · AUTHORITATIVE CONTEXT" title="Approved project baseline feeds every prompt" detail="Sources · constraints · roles · architecture · standards · testing · governance" tone="accent" help={{summary:"Stops separate AI conversations inventing different versions of the project.",owner:"The project and technical leads.",keeps:"One versioned baseline with sources, decisions, rules and visible gaps.",movesWhen:"The baseline is approved and current.",stopsWhen:"A material source, decision or standard has changed without review."}} className="overview-wide-node" />
        <div className="overview-feed-rail" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="overview-ag-flow">
          {[
            {letter:'A',title:'Work intake + route selection',help:{summary:'Turns a request into one authorised outcome before the analysis grows.',owner:'The requester and delivery lead.',keeps:'The intake, scope boundary, named owner and chosen delivery route.',movesWhen:'The outcome and route are agreed.',stopsWhen:'The request has no owner or authorised purpose.'}},
            {letter:'B',title:'Requirements + functional impact',help:{summary:'Makes the expected behaviour and affected journeys clear before a technical solution is chosen.',owner:'The product owner with delivery and technical input.',keeps:'Requirements, acceptance criteria, impacts, assumptions and open questions.',movesWhen:'A person agrees what must change and what must not.',stopsWhen:'Important behaviour or impact is still unclear.'}},
            {letter:'C',title:'Approval-gated technical design',help:{summary:'Makes the engineering choices reviewable before they become build assumptions.',owner:'The technical lead or architect.',keeps:'The approved design, affected contracts and specialist review triggers.',movesWhen:'A named person approves the design.',stopsWhen:'The design decision is missing, rejected or stale.'}},
            {letter:'D',title:'Approval-gated task decomposition',help:{summary:'Breaks the design into pieces small enough to own, test and hand over cleanly.',owner:'The delivery and technical leads.',keeps:'Ordered tasks with owners, boundaries, dependencies, tests and evidence expectations.',movesWhen:'The task list covers the approved design and dependencies.',stopsWhen:'A task overlaps another task or cannot be independently proven.'}},
            {letter:'E',title:'Pre-build readiness · HARD STOP',detail:'Missing authority, dependencies, workspace, tests or reviewers → STOP',help:{summary:'This is the pack’s hard gate: plausible work is not the same as ready work.',owner:'The human readiness owner.',keeps:'The current task, dependencies, workspace, test route, reviewers and rollback route.',movesWhen:'A person records GO for this exact task boundary.',stopsWhen:'Any authority, dependency, reviewer, test route or workspace is missing.'}},
            {letter:'F',title:'Implement one approved task',help:{summary:'Limits implementation to one task so ownership and evidence remain clear.',owner:'The task owner, with the agent working inside the brief.',keeps:'The exact change, executed checks, findings, risks and approvals still needed.',movesWhen:'The task is complete and its evidence packet is ready.',stopsWhen:'New scope, a changed shared contract or missing evidence appears.'}},
            {letter:'G',title:'Integration + release readiness',help:{summary:'Checks that finished work can safely join the shared baseline and move towards release.',owner:'The named integrator or release lead.',keeps:'Current review, compatibility checks, acceptance, residual risk and recovery route.',movesWhen:'A named person authorises integration or release.',stopsWhen:'Evidence is stale, a conflict exists or a required approval is missing.'}},
          ].map((step,index) => <div className="overview-ag-step" key={step.letter}><Node kicker={`PROMPT ${step.letter}`} title={step.title} detail={step.detail} help={step.help} tone={step.letter === 'E' ? 'danger' : step.letter === 'G' ? 'success' : 'info'} status={step.letter === 'E' ? 'No readiness = no build' : undefined} />{index < 6 && <Arrow />}</div>)}
        </div>
        <div className="overview-two-way compact">
          <Rule tone="warning"><strong>Human decisions sit outside the sequence:</strong><span> scope · risk · acceptance · release.</span></Rule>
          <Rule tone="info"><strong>Specialist controls are risk-triggered overlays,</strong><span> not a second operating model.</span></Rule>
        </div>
        <div className="overview-status-row"><State tone="info">PoC Tracker · defined delivery route</State><State tone="success">Meter Reconciliation · operational prompt pack</State></div>
      </DiagramFrame>;

    case "prebuild-gate":
      return <DiagramFrame method={method} label="An implementation request checks authority, dependencies, workspace, tests, reviewers and rollback; an incomplete reviewer check causes STOP and lists missing items, while only a fully ready request reaches a human GO decision.">
        <Node kicker="IMPLEMENTATION REQUEST" title="Current approved task · current design · named owner" detail="Exact approved boundary loaded" tone="accent" help={{summary:"Gives the readiness check one exact task and version to assess.",owner:"The task and readiness owners.",keeps:"The approved task, current design, branch and named owner.",movesWhen:"The request matches the latest approved scope.",stopsWhen:"The task or design is stale, unclear or no longer authorised."}} className="overview-wide-node" />
        <Arrow label="check readiness" vertical />
        <div className="overview-readiness-grid">
          {[
            {title:'Authority',status:'Ready',tone:'success',help:{owner:'The business or product owner.',keeps:'The request, outcome owner and named approver.',movesWhen:'Authority is confirmed for this task.',stopsWhen:'No one owns the outcome or approval.'}},
            {title:'Dependencies',status:'Ready',tone:'success',help:{owner:'The delivery lead.',keeps:'The dependency map and current status.',movesWhen:'Required work and shared contracts are ready.',stopsWhen:'A dependency remains unresolved.'}},
            {title:'Workspace',status:'Ready',tone:'success',help:{owner:'The task owner.',keeps:'The branch, worktree, allowed files and runtime boundary.',movesWhen:'The isolated workspace matches the task.',stopsWhen:'The workspace is shared, stale or points at the wrong baseline.'}},
            {title:'Tests',status:'Ready',tone:'success',help:{owner:'The test or assurance owner.',keeps:'The required checks, data, expected result and evidence location.',movesWhen:'The team can execute every required check.',stopsWhen:'A required test, fixture or environment is unavailable.'}},
            {title:'Reviewers',status:'Missing reviewer',tone:'danger',help:{owner:'The review lead.',keeps:'The named non-author reviewer and their availability.',movesWhen:'An independent reviewer is ready.',stopsWhen:'That reviewer is missing or is also the author.'}},
            {title:'Rollback',status:'Ready',tone:'success',help:{owner:'The release or recovery owner.',keeps:'The known-good target, trigger and verification steps.',movesWhen:'The recovery route is understood and available.',stopsWhen:'The team cannot name or verify a safe way back.'}},
          ].map((item) => <Node key={item.title} title={item.title} status={item.status} tone={item.tone as Tone} help={item.help} />)}
        </div>
        <Arrow label="all ready?" vertical />
        <div className="overview-decision-split">
          <Node kicker="YES" title="Human GO" detail="Bind the current decision to this task and workspace" tone="success" help={{summary:"Starts implementation for one exact task—not for anything the agent later discovers.",owner:"The named readiness approver.",keeps:"The GO decision, task, branch, owner and time.",movesWhen:"All readiness checks are current and complete.",stopsWhen:"Any important part of the task, design or workspace changes."}} />
          <Node kicker="NO · THIS EXAMPLE" title="STOP" detail="Missing: named non-author reviewer. Return to the task owner." tone="danger" help={{summary:"Turns a missing requirement into an owned action instead of an AI guess.",owner:"The task owner resolves the missing item.",keeps:"The missing item, reason, owner and next action.",movesWhen:"The gap is fixed and readiness is checked again.",stopsWhen:"The named reviewer or any other required input is still missing."}} />
        </div>
        <div className="overview-status-row"><State tone="success">Compass · operational workspace guard</State><State tone="info">PoC Tracker + Meter Reconciliation · defined Prompt E gate</State></div>
      </DiagramFrame>;

    case "orchestrate-pods":
      return <DiagramFrame method={method} label="One AI Tech Lead commissions three independently owned outcome pods in parallel; every pod performs bounded build, test, review and evidence work, then returns a completion packet for consolidated convergence.">
        <div className="overview-pod-lead">
          <Node kicker="ONE CONTROL PLANE" title="AI Tech Lead" detail="Owns architecture · dependencies · sequencing · convergence" tone="accent" help={{summary:"Keeps several pods moving in one direction without making every pod coordinate with every other pod.",owner:"The AI Tech Lead.",keeps:"Non-overlapping pod briefs, dependency order and one combined status.",movesWhen:"Each pod has a clear outcome, workspace and handover expectation.",stopsWhen:"Ownership overlaps or two pods need to change the same shared contract."}} />
          <div className="overview-status-row"><State tone="success">Compass · operational</State><State tone="info">PoC Tracker · defined</State><State tone="warning">Meter Reconciliation · proposed</State></div>
        </div>
        <div className="overview-pod-branches" aria-hidden="true"><i /><i /><i /></div>
        <div className="overview-pod-grid">
          {['Outcome pod A','Outcome pod B','Outcome pod C'].map((title) => <section key={title}><Node title={title} detail="One outcome · one workspace · one write boundary" help={{summary:"Lets one part of the outcome move independently while the lead protects the joined design.",owner:"The pod lead, accountable to the AI Tech Lead.",keeps:"Its branch, workspace, checks, risks and decisions still needed.",movesWhen:"Its completion packet is ready for the lead.",stopsWhen:"New scope, overlapping ownership or a shared-file conflict appears."}} tone="info" /><div>{['Bounded build','Test','Review','Evidence'].map((item) => <span className="overview-node-interactive" {...inspectableNode(item,{summary:`This ${item.toLowerCase()} stays inside the pod's agreed outcome.`,owner:'The pod lead.',keeps:`The ${item.toLowerCase()} result in the pod completion packet.`,movesWhen:'The result is complete and linked to the pod version.',stopsWhen:'It needs authority or files outside the pod boundary.'})} key={item}><i />{item}</span>)}</div></section>)}
        </div>
        <Arrow label="return completion packets" vertical />
        <Node kicker="LEAD CONVERGENCE" title="One consolidated packet" detail="Combined diff · compatibility checks · findings · risks · approvals still required" tone="success" help={{summary:"Gives the lead one place to judge whether the separate pieces still work as one change.",owner:"The AI Tech Lead and named integrator.",keeps:"The combined change, compatibility checks, findings, risks and approvals still needed.",movesWhen:"Every pod handover is complete and the joined checks pass.",stopsWhen:"A pod is incomplete, changes clash or an approval is missing."}} className="overview-wide-node" />
      </DiagramFrame>;

    case "context-handoffs":
      return <DiagramFrame method={method} label="A lead sends a self-contained context capsule to one bounded agent or pod, which returns a standard completion packet for lead-owned convergence.">
        <div className="overview-three-stage">
          <Node kicker="INPUT PACKET" title="Context capsule" detail="Task + decisions · workspace + files · dependencies · checks · stop rules" tone="accent" help={{summary:"Lets an agent start useful work without reconstructing the brief from old chat.",owner:"The commissioning lead.",keeps:"The task, decisions, workspace, allowed files, checks and stop rules.",movesWhen:"The agent can proceed without guessing.",stopsWhen:"Authority, scope or a required input is missing."}} />
          <Arrow label="commission" />
          <Node kicker="BOUNDED WORK" title="Agent or pod executes" detail="One outcome · no guessed authority · stop on new scope" tone="info" help={{summary:"Keeps the delegated work small enough to review and hand back cleanly.",owner:"The task owner, with the agent or pod working inside the commission.",keeps:"The exact change, checks, findings and questions raised during the work.",movesWhen:"The agreed outcome is complete.",stopsWhen:"The work needs new scope, files or a decision not included in the packet."}} />
          <Arrow label="return" />
          <Node kicker="OUTPUT PACKET" title="Completion packet" detail="Output or commit identity · changed artefacts · checks · blockers · limitations · approval still required" tone="success" help={{summary:"Lets the lead resume, review or combine the work without relying on the agent's conversation history.",owner:"The agent or pod produces it; the commissioning lead checks it.",keeps:"The exact output, tests, blockers, risks, limitations and approvals still needed.",movesWhen:"The lead confirms it matches the original brief.",stopsWhen:"Evidence is missing or the returned work has moved outside the commission."}} />
        </div>
        <Rule><strong>The commissioning lead retains authority</strong><span> and checks the returned packet against the original boundary before convergence.</span></Rule>
      </DiagramFrame>;

    case "isolate-build":
      return <DiagramFrame method={method} label="Three changes run in separate branches and worktrees, with separate runtime ports or data fixtures when those resources apply, then enter the protected integration branch only through controlled review.">
        <div className="overview-isolation-grid">
          {[
            ['Change A','feature branch A','worktree A','runtime work: unique port A','data work: isolated fixture A'],['Change B','feature branch B','worktree B','runtime work: unique port B','data work: isolated fixture B'],['Change C','feature branch C','worktree C','runtime work: unique port C','data work: isolated fixture C'],
          ].map(([title,...items]) => <section className="overview-node-interactive" {...inspectableNode(title,`${title} has its own branch, workspace and—when needed—runtime and test data. This stops it interfering with the other changes.`)} key={title}><strong>{title}</strong>{items.map((item) => <span key={item}><i />{item}</span>)}</section>)}
        </div>
        <Arrow label="reviewed convergence" vertical />
        <Node kicker="CONTROLLED CONVERGENCE" title="Protected integration branch" detail="No direct shared checkout; reviewed changes enter through named integration authority" tone="accent" help={{summary:"Keeps the shared baseline free from unreviewed or conflicting workspace changes.",owner:"The named integrator.",keeps:"The source version, executed checks, current approval and merge record.",movesWhen:"Ancestry, evidence and approval are current.",stopsWhen:"A conflict exists or the reviewed source has changed."}} className="overview-wide-node" />
        <Rule tone="danger"><strong>No shared checkout · no shared runtime port when applicable · no shared mutable data.</strong><span> Evidence identifies the exact branch, commit, runtime and fixture used.</span></Rule>
        <div className="overview-source-truth"><State tone="success">Compass · branch, worktree and runtime isolation operational</State><State tone="info">PoC Tracker · runtime/data isolation implemented foundation; branch/pull-request model defined; no worktree model evidenced</State><State tone="warning">Meter Reconciliation · branch/pull-request controls implemented foundation; pod/worktree isolation proposed or defined</State></div>
      </DiagramFrame>;

    case "feature-test-apps":
      return <DiagramFrame method={method} label="A feature branch launches in an isolated review application with its own web address, commit and fixture; a reviewer exercises the exact scenario and records a human outcome.">
        <MiniFlow steps={[
          {title:'Feature branch',detail:'Named branch · exact commit identity',tone:'accent'},
          {title:'Isolated test app',detail:'Own port · safe fixture · runtime identity; health when implemented',tone:'info'},
          {title:'Direct review web address',detail:'Exact route + expected scenario + known limits',tone:'info'},
          {title:'Human review outcome',detail:'Accept · return with findings · reject',tone:'success'},
        ]} />
        <div className="overview-evidence-strip">{['Branch','Commit','Dataset','Started time'].map((item) => <span key={item}><i>✓</i>{item}</span>)}<span><i>•</i>Runtime status; health when implemented</span></div>
        <Rule tone="warning"><strong>A running app is review evidence, not release evidence.</strong><span> Acceptance remains tied to the exact tested version.</span></Rule>
        <div className="overview-status-row"><State tone="success">Compass · operational branch-specific feature test apps</State><State tone="warning">PoC Tracker · isolated browser-test runtime implemented foundation; no branch/commit review-app lifecycle or health endpoint claimed</State></div>
      </DiagramFrame>;

    case "scale-assurance":
      return <DiagramFrame method={method} label="Assurance is cumulative: every change runs baseline checks; medium-risk changes add system proof; high-risk or large-blast-radius changes add release proof including shared contracts, data migration, security and rollback.">
        <div className="overview-assurance-cumulative">
          <section className="level-one overview-node-interactive" {...inspectableNode('Fast baseline','Every change gets these quick checks. They catch basic problems before we spend time on deeper testing.')}><small>LEVEL 1 · EVERY CHANGE</small><strong>Fast baseline</strong><span>Format · build · static checks · unit tests · contract checks</span></section>
          <span className="overview-plus">+</span>
          <section className="level-two overview-node-interactive" {...inspectableNode('System proof','Add these checks when the change affects a journey, stored data or something another part of the system uses.')}><small>LEVEL 2 · SYSTEM IMPACT</small><strong>Add system proof</strong><span>Browser · application interface · persistence · shared contract</span></section>
          <span className="overview-plus">+</span>
          <section className="level-three overview-node-interactive" {...inspectableNode('Release proof','Add the strongest checks when a failure could affect data, security, many users or our ability to recover.')}><small>LEVEL 3 · HIGH RISK</small><strong>Add release proof</strong><span>Data migration · security · large blast radius · recovery</span></section>
        </div>
        <div className="overview-risk-examples"><span>LOWER RISK</span><i /><b>shared contract · data migration · security/privacy · large blast radius</b><i /><span>HIGHER RISK</span></div>
        <Rule tone="accent"><strong>Higher levels include every lower-level check.</strong><span> Risk adds proof; it never swaps the baseline out.</span></Rule>
      </DiagramFrame>;

    case "assurance-ladder":
      return <DiagramFrame method={method} label="An ascending four-step ladder defines task, story, stream and release evidence; the delivery claim stops at the highest level whose required evidence is complete.">
        <div className="overview-ladder">
          {[
            ['1','Task','Build · unit and integration checks · non-author review'],
            ['2','Story','Every acceptance criterion linked to executed passing evidence'],
            ['3','Stream','Shared contracts · schemas · dependencies · representative journeys'],
            ['4','Release','End-to-end · non-functional · deployment · rollback · human decision'],
          ].map(([number,title,detail]) => <article className="overview-node-interactive" {...inspectableNode(`${title} proof`,`${detail}. We can only make this level of claim when all of this evidence is complete.`)} key={title}><span>{number}</span><strong>{title}</strong><small>{detail}</small></article>)}
        </div>
        <Rule tone="danger"><strong>Claim only the highest complete level.</strong><span> A declared test is not executed passing evidence; task proof is not release proof.</span></Rule>
        <div className="overview-status-row"><State tone="info">Meter Reconciliation · defined four-level assurance model</State></div>
      </DiagramFrame>;

    case "independent-assurance":
      return <DiagramFrame method={method} label="The author submits a build packet to a non-author reviewer; security, architecture, data and accessibility specialists join when risk triggers apply; a named human makes the acceptance decision.">
        <div className="overview-three-stage">
          <Node kicker="AUTHOR" title="Implementation packet" detail="Exact diff · executed checks · risks · limitations" tone="accent" />
          <Arrow label="separate review" />
          <Node kicker="NON-AUTHOR" title="Review lead" detail="Inspects evidence · records findings · calls specialists by risk" tone="info" />
          <Arrow label="recommend" />
          <Node kicker="NAMED PERSON" title="Human acceptance" detail="Approve · return · reject the exact tested version" tone="success" />
        </div>
        <div className="overview-specialist-row">{['Security','Architecture','Data','Accessibility'].map((item) => <State key={item} tone="warning">Risk trigger → {item}</State>)}</div>
        <Rule><strong>AI review is not independent human review.</strong><span> Every material finding needs an owner and explicit disposition.</span></Rule>
      </DiagramFrame>;

    case "pr-proof-pack":
      return <DiagramFrame method={method} label="A focused branch becomes a structured pull request proof pack, passes current non-author review and documented branch policies, then reaches a protected integration branch through named merge authority.">
        <div className="overview-pr-layout">
          <Node kicker="ONE GOVERNED CHANGE" title="Focused feature branch" detail="Approved task · exact source commit · current baseline" tone="accent" />
          <Arrow />
          <section className="overview-proof-sheet overview-node-interactive" {...inspectableNode('Pull request proof pack','This puts the scope, links, actual checks, impacts, findings, remaining risk and recovery route beside the exact source being reviewed.')}><small>STRUCTURED PULL REQUEST PROOF PACK</small>{['Scope + exclusions','Lineage + actual test results','Security, privacy, accessibility + AI impact','Findings + residual risk + recovery'].map((item) => <span key={item}><i>✓</i>{item}</span>)}</section>
          <Arrow />
          <Node kicker="NAMED MERGE AUTHORITY" title="Protected integration branch" detail="Linked work · non-author review · comments resolved" tone="success" />
        </div>
        <Rule tone="warning"><strong>Source push resets stale approval.</strong><span> Linked work, non-author review, approval reset and comment controls are evidenced. Build validation and direct-push enforcement still require administrator confirmation.</span></Rule>
        <div className="overview-status-row"><State tone="warning">Meter Reconciliation · documented / implemented foundation</State><State tone="danger">Build-validation + direct-push enforcement · administrator confirmation required</State></div>
      </DiagramFrame>;

    case "safe-integration":
      return <DiagramFrame method={method} label="An approved feature branch enters a structured pull request, non-author review, current approval check, serialized queue, compatibility checks and named authority before the protected integration branch; stale evidence, missing approval or conflict returns to the owner.">
        <MiniFlow className="overview-integration-flow" steps={[
          {title:'Approved feature branch',detail:'Current task + source identity',tone:'accent'},
          {title:'Structured pull request',detail:'Scope · lineage · checks · risks',tone:'info'},
          {title:'Non-author review',detail:'Findings explicitly disposed',tone:'info'},
          {title:'Approval + evidence current?',detail:'Fail closed if stale or missing',tone:'warning'},
          {title:'Serialized queue',detail:'One convergence order',tone:'accent'},
          {title:'Compatibility checks',detail:'Contracts · integration · regression',tone:'info'},
          {title:'Named authority',detail:'Human merge decision',tone:'success'},
          {title:'Protected integration branch',detail:'One accountable baseline',tone:'success'},
        ]} />
        <Rule tone="danger"><strong>Stale evidence · missing approval · conflict</strong><span> → stop → return to the original owner → refresh, re-test and re-approve → requeue.</span></Rule>
        <div className="overview-status-row"><State tone="success">Compass · operational serialized queue</State><State tone="info">PoC Tracker · defined integration route</State><State tone="warning">Meter Reconciliation · pull-request and continuous-integration controls implemented; live release not claimed</State></div>
      </DiagramFrame>;

    case "conflict-handback":
      return <DiagramFrame method={method} label="A conflict, stale approval or shared-contract drift blocks integration and returns the affected work to the original owner for reconciliation, affected checks, fresh approval and controlled reintegration.">
        <MiniFlow steps={[
          {title:'Merge candidate',detail:'Affected work + current evidence retained',tone:'accent'},
          {title:'Conflict or stale approval',detail:'Integration stops; no silent semantic choice',tone:'danger'},
          {title:'Original owner reconciles',detail:'Classify impact · preserve history · resolve',tone:'warning'},
          {title:'Fresh proof',detail:'Update dependants · rerun checks · renew approval',tone:'info'},
          {title:'Return to controlled integration',detail:'New provenance enters the project’s governed convergence route',tone:'success'},
        ]} />
        <Rule><strong>Merge tooling resolves text, not product authority.</strong><span> The accountable owner decides behaviour and downstream effects.</span></Rule>
      </DiagramFrame>;

    case "prove-lineage":
      return <DiagramFrame method={method} label="Stable identifiers connect the business need, acceptance criterion, requirement, approved design and task, branch and pull request, executed tests, human approval and released version.">
        <MiniFlow className="overview-lineage-flow" steps={[
          {title:'Business need',detail:'Stable need identifier',tone:'accent'},
          {title:'Acceptance criterion',detail:'Stable criterion identifier',tone:'info'},
          {title:'Requirement',detail:'Stable requirement identifier',tone:'info'},
          {title:'Approved design + task',detail:'Stable design and task identifiers',tone:'info'},
          {title:'Branch + pull request',detail:'Exact source commit',tone:'info'},
          {title:'Executed tests',detail:'Stable test identifier + exact result evidence',tone:'warning'},
          {title:'Human approval',detail:'Exact tested version',tone:'success'},
          {title:'Release',detail:'Immutable release identity',tone:'success'},
        ]} />
        <Rule tone="success"><strong>Trace is complete only when every link resolves.</strong><span> Missing identifiers remain gaps; they are never inferred from prompt history.</span></Rule>
      </DiagramFrame>;

    case "report-evidence":
      return <DiagramFrame method={method} label="A verified point-in-time snapshot dated 5 August with 497 metric rows retains gaps, findings, risks, assumptions, issues, dependencies and limitations, then generates consistent report formats and archives the source template and snapshot identifier.">
        <Node kicker="POINT-IN-TIME EVIDENCE · NOT LIVE TELEMETRY" title="VERIFIED SNAPSHOT — 05 AUG — 497 METRIC ROWS" detail="Source: PoC Tracker governed record · 5 August 2026 · evidence gaps · findings · risks, assumptions, issues and dependencies · limitations" tone="accent" status="Implemented foundation" className="overview-wide-node" />
        <Arrow label="one governed record" vertical />
        <div className="overview-format-grid">
          <Node title="Portable Document Format (PDF) report" detail="Client-readable snapshot" tone="info" />
          <Node title="PowerPoint report" detail="Executive narrative" tone="info" />
          <Node title="Excel workbook" detail="Governance detail" tone="info" />
          <Node title="JavaScript Object Notation (JSON) export" detail="Structured archive" tone="info" />
        </div>
        <Rule tone="success"><strong>Archive together:</strong><span> source template + snapshot identifier + generated outputs + publication date.</span></Rule>
      </DiagramFrame>;

    case "immutable-release":
      return <DiagramFrame method={method} label="One source-bound immutable artefact is built once, validated unchanged in test and staging, approved by a named human for release, then promoted with the same identity to production and paired with a previous known-good recovery target.">
        <MiniFlow steps={[
          {title:'Build once',detail:'Source commit + dependency lock + checks',tone:'accent'},
          {title:'Immutable artefact',detail:'Digest identity + bill of materials + scan evidence',tone:'info'},
          {title:'Validate unchanged',detail:'Test → staging; retain the same digest',tone:'info'},
          {title:'Human release decision',detail:'Current evidence + risk + recovery route',tone:'warning'},
          {title:'Promote same identity',detail:'Production receives the approved digest; no rebuild',tone:'success'},
        ]} />
        <div className="overview-decision-split compact">
          <Node kicker="FORWARD" title="Known release identity" detail="Record environment + time + authority" tone="success" />
          <Node kicker="RECOVERY" title="Previous known-good digest" detail="Rollback without rebuilding under pressure" tone="warning" />
        </div>
        <Rule><strong>Release once. Roll back fast.</strong><span> The approved artefact stays immutable; recovery selects a known identity. Data or schema recovery follows a separate approved restore route.</span></Rule>
        <div className="overview-status-row"><State tone="info">Compass · defined release route</State><State tone="warning">Meter Reconciliation · implemented foundation; live production not claimed</State></div>
      </DiagramFrame>;

    case "review-ai-evidence":
      return <DiagramFrame method={method} label="Source evidence becomes a clearly marked AI draft with confidence and limitations, then a human reviewer approves, edits or rejects it before the decision and audit event are stored in the governed record.">
        <div className="overview-three-stage">
          <Node kicker="AUTHORITATIVE INPUT" title="Source evidence" detail="Document + page or record + captured date" tone="accent" />
          <Arrow label="analyse" />
          <Node kicker="AI DRAFT · NOT ACCEPTED FACT" title="Candidate interpretation" detail="Source link · confidence · assumptions · limitations" tone="warning" />
          <Arrow label="decide" />
          <section className="overview-choice-stack"><small>HUMAN DECISION</small><State tone="success">Approve</State><State tone="info">Edit</State><State tone="danger">Reject</State></section>
        </div>
        <Arrow label="record decision" vertical />
        <Node kicker="GOVERNED RECORD" title="Decision + audit event" detail="Reviewer identity · time · source identity · accepted wording or rejection reason" tone="success" className="overview-wide-node" />
        <Rule><strong>AI recommendation and human decision remain separate records.</strong><span> The model cannot approve its own interpretation.</span></Rule>
      </DiagramFrame>;

    case "constrain-mutation":
      return <DiagramFrame method={method} label="An AI write proposal is checked against an output schema and size cap, then unknown targets and disallowed fields are removed before a human-readable preview. A person can confirm selected fields, edit and revalidate, or reject; only confirmed fields are saved with history.">
        <Node kicker="AI PROPOSAL · NO WRITE YET" title="Requested record change" detail="Target identifier + proposed fields + rationale" tone="accent" className="overview-wide-node" />
        <div className="overview-mutation-checks">
          {['Validate output schema','Allow record type','Remove disallowed fields','Remove unknown targets','Enforce change cap','Build human-readable preview'].map((item,index) => <div className="overview-check-row" key={item}><i>{index+1}</i><span>{item}</span></div>)}
        </div>
        <Rule tone="warning"><strong>Sanitise before preview.</strong><span> Remove unknown targets, disallowed fields and extra records. Invalid schemas or oversized proposals stop here.</span></Rule>
        <Arrow label="show sanitised preview" vertical />
        <div className="overview-three-stage overview-two-stage">
          <section className="overview-choice-stack"><small>HUMAN PREVIEW CHOICES</small><State tone="success">Confirm selected fields</State><State tone="info">Edit the proposal</State><State tone="danger">Reject the proposal</State></section>
          <Arrow label="apply decision" />
          <section className="overview-choice-stack"><small>WRITE OUTCOME</small><State tone="success">Confirm → save approved fields + history</State><State tone="info">Edit → validate + preview again</State><State tone="danger">Reject or invalid → no write</State></section>
        </div>
        <Rule tone="danger"><strong>No direct model write.</strong><span> The named human sees the exact sanitised delta and authorises every saved field.</span></Rule>
      </DiagramFrame>;

    case "activity-ledger":
      return <DiagramFrame method={method} label="Acted-on AI activity records safe metadata and evidence links in a ledger while raw prompts, responses, secrets, personal data, production extracts and unverified usage figures are excluded.">
        <div className="overview-ledger-layout">
          <section className="overview-stack overview-node-interactive" {...inspectableNode('AI work we acted on','We record an activity only when AI output is used in the delivery work. A discarded chat does not become a delivery record.')}><small>ACTED-ON AI ACTIVITY</small>{['Analyse source','Draft change','Review evidence'].map((item) => <div className="overview-inline-step" key={item}><i>•</i><span>{item}</span></div>)}</section>
          <Arrow label="record safe fields" />
          <section className="overview-proof-sheet overview-node-interactive" {...inspectableNode('Safe activity record','We keep just enough information to show where AI helped and which delivery evidence it links to, without storing the conversation.')}><small>SAFE ACTIVITY ROW</small>{['Time + activity identifier','Tool + model family/version or capability mode where known','Project phase + non-sensitive summary','Linked task + evidence','Confidence + limitations'].map((item) => <span key={item}><i>✓</i>{item}</span>)}</section>
          <section className="overview-exclusion-box overview-node-interactive" {...inspectableNode('Information we do not keep','Prompts, secrets, personal data, production extracts and unverified usage figures stay out of this record.')}><small>EXCLUDED FROM THIS SAFE LEDGER</small>{['Raw prompt or response','Secrets or credentials','Personally identifiable information','Production extracts','Unverified message, token or cost figures'].map((item) => <span key={item}>{item}</span>)}</section>
        </div>
        <Rule><strong>This safe ledger is not platform telemetry.</strong><span> Do not infer messages, tokens or cost from it; any approved platform usage export remains a separate evidence source.</span></Rule>
      </DiagramFrame>;

    case "separate-environments":
      return <DiagramFrame method={method} label="Development, test, user acceptance or staging, and production each keep separate configuration, credentials, data and release status; maturity labels show that local and foundation controls do not prove live production operation.">
        <div className="overview-environment-flow">
          {[
            ['Development','Implemented locally','Synthetic data','success'],
            ['Test','Implemented foundation','Synthetic or masked copy','info'],
            ['User acceptance / staging','Defined','Approved fixture or masked copy','warning'],
            ['Production','Roadmap / live state unverified','Client / production boundary','danger'],
          ].map(([title,status,data,tone],index) => <div className="overview-environment-step" key={title}><section className={`overview-environment-card overview-node-interactive tone-${tone}`} {...inspectableNode(title,`${title} keeps its own settings, credentials, data and release status. Its current maturity is ${status.toLowerCase()}, and its data rule is ${data.toLowerCase()}.`)}><small>{status}</small><strong>{title}</strong>{['Separate configuration','Separate credentials','Separate data store','Recorded release status'].map((boundary) => <span key={boundary}><i />{boundary}</span>)}<b>DATA RULE · {data}</b></section>{index < 3 && <Arrow />}</div>)}
        </div>
        <div className="overview-source-truth"><State tone="success">Compass · local development / test operational; hosted acceptance / production roadmap</State><State tone="info">PoC Tracker · isolated test foundation; full environment route roadmap</State><State tone="warning">Meter Reconciliation · deployment controls implemented foundation; live Azure traffic promotion not proven</State></div>
        <Rule tone="danger"><strong>Do not infer production operation from a local test app or deployment definition.</strong><span> Each project lane keeps its own maturity claim.</span></Rule>
      </DiagramFrame>;

    case "protect-identity-data":
      return <DiagramFrame method={method} label="Identity, secrets, client-data classification and upload-to-AI controls are shown separately for Migration Compass, PoC Tracker and Meter Reconciliation with implemented, defined and gap states, ending with the rule to claim only controls that exist.">
        <div className="overview-control-status-list">
          <section className="overview-node-interactive" {...inspectableNode('Identity boundary','This shows how each project identifies people and controls access. The labels deliberately separate what works now from what is only defined or still missing.')}><strong>Identity boundary</strong><State tone="success">Compass · implemented local session, request-forgery and route guards</State><State tone="danger">Tracker · known gap: no general authentication or role-based access control</State><State tone="info">Meter Reconciliation · temporary authentication + Admin/Operator roles implemented; Microsoft Entra identity defined</State></section>
          <section className="overview-node-interactive" {...inspectableNode('Secrets and credentials','This shows how each project currently keeps credentials out of code and prompts, while keeping any missing managed-secret controls visible.')}><strong>Secrets + credentials</strong><State tone="success">Compass · transient personal access token + redaction implemented; managed store defined</State><State tone="success">Tracker · protected contributor-rate encryption at rest implemented; app-wide secret store gap remains</State><State tone="info">Meter Reconciliation · environment/pipeline path + exclusions implemented; Azure Key Vault defined</State></section>
          <section className="overview-node-interactive" {...inspectableNode('Client data','This states what data each project may use outside production and where the wider data lifecycle is not yet proven.')}><strong>Client-data classification</strong><State tone="success">Compass · isolated copied fixtures implemented; synthetic or masked data is a hosted contract</State><State tone="success">Tracker · isolated copied test data implemented; enterprise lifecycle gap remains</State><State tone="success">Meter Reconciliation · synthetic or approved non-personal data only; real sensitive and production data prohibited</State></section>
          <section className="overview-node-interactive" {...inspectableNode('Upload and AI trigger','This shows whether a person must deliberately start AI processing and what protection exists around the uploaded content.')}><strong>Upload + AI trigger</strong><State tone="success">Compass · explicit trigger, draft and human approval implemented; hosted upload protections defined</State><State tone="warning">Tracker · imported and AI drafts previewed/approved; general authenticated boundary gap remains</State><State tone="danger">Meter Reconciliation · manual upload and sensitive-data exclusion defined; no product upload-to-AI capability claimed</State></section>
        </div>
        <Rule tone="danger"><strong>Claim only the control that exists.</strong><span> Never turn a documented design or local safeguard into an enterprise identity, access or production-data claim.</span></Rule>
      </DiagramFrame>;

    case "source-stat-pack":
      return <DiagramFrame method={method} label="Pinned source facts flow through normalisation, identity reconciliation, classification and deterministic aggregation into a dated stat pack; every figure carries an as-of date, source, denominator, confidence and caveat, and unavailable never means zero.">
        <Node kicker="PIN BEFORE COUNTING" title="Read-only source facts" detail="Reporting period · as-of time · Git reference + commit · Azure DevOps exports" tone="accent" help={{summary:"Makes every published number repeatable from one fixed set of source facts.",owner:"The reporting owner.",keeps:"The reporting date, Git reference, commit and Azure DevOps exports.",movesWhen:"Every source is pinned to the same reporting point.",stopsWhen:"Dates are mixed or a figure cannot be verified from source."}} className="overview-wide-node" />
        <Arrow label="collect read-only facts" vertical />
        <MiniFlow className="overview-stat-flow" steps={[
          {title:'Normalise',detail:'Atomic dates, identifiers, values and units',tone:'info'},
          {title:'Reconcile',detail:'Match work, pull request, commit, build and test identities',tone:'info'},
          {title:'Classify',detail:'Metric type + unavailable reason + claim boundary',tone:'warning'},
          {title:'Aggregate',detail:'Deterministic totals + exception review',tone:'info'},
          {title:'Dated stat pack',detail:'Versioned + hashed + independently checked',tone:'success',help:{summary:'Publishes a snapshot people can trace and calculate again later.',owner:'The publisher, with an independent totals check.',keeps:'The version, hash, source links, denominator, confidence and caveats.',movesWhen:'The totals check passes and limitations are visible.',stopsWhen:'Missing data has been turned into zero or a source cannot be traced.'}},
        ]} />
        <div className="overview-evidence-strip">{['As-of date','Source','Denominator','Confidence','Caveat'].map((item) => <span key={item}><i>✓</i>{item}</span>)}</div>
        <Rule tone="danger"><strong>No unverified figures.</strong><span> Missing or unavailable data stays unavailable; it never becomes zero.</span></Rule>
        <div className="overview-status-row"><State tone="success">Source-backed snapshots · implemented foundation</State><State tone="warning">Universal scheduled collector · proposed and approval-gated</State></div>
      </DiagramFrame>;

    case "delivery-system-alignment":
      return <DiagramFrame method={method} label="At source reference c51fecf from 31 July 2026, with governance reviewed on 5 August, eight paired rows compare approved and live authority, instructions, prompts, Azure DevOps, source, continuous integration, evidence and reporting; discrepancies are classified, contained, owned, corrected, re-proven and re-approved.">
        <div className="overview-pinned-reference"><strong>PINNED REVIEW INPUT</strong><span>Source reference c51fecf · source snapshot 31 JUL 2026 · governance reviewed 05 AUG 2026</span></div>
        <div className="overview-alignment-head"><span>APPROVED CONTROL</span><b>COMPARE</b><span>LIVE DELIVERY</span><em>OUTCOME</em></div>
        <div className="overview-alignment-table">
          {[
            ['Approved authority','Actual owners + permissions','The governance owner.'],
            ['Approved instructions','Repository instructions','The repository owner.'],
            ['Approved prompt pack','Active prompt versions','The prompt-pack owner.'],
            ['Approved work items','Azure DevOps state','The delivery manager.'],
            ['Approved source baseline','Current Git reference','The source or integration owner.'],
            ['Approved continuous-integration design','Active pipeline configuration','The continuous-integration administrator.'],
            ['Required evidence','Evidence actually retained','The assurance owner.'],
            ['Approved reporting rules','Published reports','The reporting owner.'],
          ].map(([approved,live,owner],index) => <div className="overview-node-interactive" {...inspectableNode(approved,{summary:`Checks whether ${approved.toLowerCase()} is genuinely reflected in ${live.toLowerCase()} at the same pinned point in time.`,owner,keeps:'The approved source, live source, pinned reference and a match or discrepancy.',movesWhen:'The pair matches or an owned correction has been agreed.',stopsWhen:'The sources use different dates or live evidence is unavailable.'})} key={approved}><span>{approved}</span><b>{String(index+1).padStart(2,'0')} · COMPARE</b><span>{live}</span><em>Match / discrepancy</em></div>)}
        </div>
        <Rule tone="warning"><strong>Discrepancy route:</strong><span> classify → contain affected claim or work → assign owner → correct → re-prove → refresh approval.</span></Rule>
        <div className="overview-status-row"><State tone="info">Eight-layer alignment model · defined</State><State tone="warning">No match is claimed until a pinned comparison is completed</State></div>
      </DiagramFrame>;

    case "backup-restore-audit":
      return <DiagramFrame method={method} label="Critical state moves through protected backup, isolated restore test, integrity verification, retention or disposal and audit, with a named recovery owner and visible disaster-recovery limitations.">
        <MiniFlow steps={[
          {title:'Back up',detail:'Scope + source identity + protected location',tone:'accent'},
          {title:'Restore in isolation',detail:'Known target + access boundary',tone:'info'},
          {title:'Verify',detail:'Integrity + access + business checks',tone:'success'},
          {title:'Retain or dispose',detail:'Approved schedule + preserved audit trail',tone:'warning'},
          {title:'Record recovery evidence',detail:'Owner + date + result + limitations',tone:'success'},
        ]} />
        <Rule tone="danger"><strong>Local backup is not off-device disaster recovery.</strong><span> Recovery maturity is claimed only after an owned, evidenced restore test.</span></Rule>
        <div className="overview-status-row"><State tone="success">PoC Tracker local backup · implemented foundation</State><State tone="info">Wider restore and retention route · defined</State></div>
      </DiagramFrame>;

    case "observe-recover":
      return <DiagramFrame method={method} label="Health and readiness, logs and correlation, metrics, traces and alerts identify an affected release; a named human chooses continue, rollback or restore, then health, data and business outcomes are verified and recorded.">
        <div className="overview-signal-grid">
          <Node title="Health + readiness" detail="Affected release identity" status="Implemented foundation" tone="success" help={{summary:"Finds the exact release affected before anyone chooses a recovery action.",owner:"The service owner.",keeps:"The release identity, endpoint result, time and correlation context.",movesWhen:"The signal can be tied to one release.",stopsWhen:"The result is unclear or cannot identify the affected version."}} />
          <Node title="Logs + correlation" detail="Request and service context" status="Defined / project-specific" tone="info" />
          <Node title="Metrics + traces" detail="Trend and dependency context" status="Roadmap unless live evidence exists" tone="warning" />
          <Node title="Alerts" detail="Threshold + owner + decision window" status="Roadmap unless live evidence exists" tone="warning" />
        </div>
        <Arrow label="correlate to release" vertical />
        <div className="overview-choice-flow">
          <Node kicker="NAMED HUMAN DECISION" title="Continue" detail="Monitor inside the decision window" tone="info" />
          <Node kicker="NAMED HUMAN DECISION" title="Rollback" detail="Select previous known-good release" tone="warning" help={{summary:"Returns the service to a release already known and approved instead of rebuilding during the incident.",owner:"The named recovery authority.",keeps:"The selected release identity, reason, approval and post-rollback checks.",movesWhen:"Service and data checks pass after the rollback.",stopsWhen:"The target or its data compatibility is unknown."}} />
          <Node kicker="NAMED HUMAN DECISION" title="Restore" detail="Recover protected state in the approved order" tone="danger" help={{summary:"Recovers protected state through the tested data route rather than improvising from a local copy.",owner:"The data or recovery owner.",keeps:"The backup identity, isolated target, restore result and limitations.",movesWhen:"Integrity and business checks pass.",stopsWhen:"The backup identity, isolation boundary or integrity check is missing."}} />
        </div>
        <Arrow label="verify recovery" vertical />
        <MiniFlow className="overview-recovery-proof-flow" steps={[
          {title:'Verify service health',detail:'Health + readiness + affected release',tone:'success',help:{summary:'Checks that the service is actually responding on the intended recovered version.',owner:'The service owner.',keeps:'Passing health, readiness and release-identity checks.',movesWhen:'The expected service state is stable.',stopsWhen:'Health is failing, intermittent or tied to the wrong release.'}},
          {title:'Verify data integrity',detail:'State, reconciliation and restore checks',tone:'success',help:{summary:'Checks that technical recovery has not left the data incomplete or inconsistent.',owner:'The data owner.',keeps:'Reconciliation, restore and integrity results.',movesWhen:'The protected state is complete and consistent.',stopsWhen:'Any required data check fails.'}},
          {title:'Verify business outcome',detail:'Critical journey and expected result',tone:'success',help:{summary:'Confirms that users can complete the important journey—not just that the server is running.',owner:'The product or service owner.',keeps:'The executed critical journey and observed outcome.',movesWhen:'The expected business result is confirmed.',stopsWhen:'The journey fails or produces the wrong outcome.'}},
          {title:'Record recovery evidence',detail:'Signals + release + decision + result + limitation',tone:'accent',help:{summary:'Creates one traceable story from the first signal to the final recovery decision.',owner:'The recovery lead.',keeps:'Signals, release, action, owner, results and remaining limitations.',movesWhen:'A named person closes or continues the recovery action.',stopsWhen:'Any important check or limitation is missing from the record.'}},
        ]} />
        <div className="overview-source-truth"><State tone="success">Compass · local health implemented; hosted observability roadmap / partial contract</State><State tone="info">PoC Tracker · recovery model defined; production observability roadmap</State><State tone="warning">Meter Reconciliation · readiness foundation implemented; live Azure observation and traffic promotion not proven</State></div>
      </DiagramFrame>;

    default:
      return <DiagramFrame method={method} label={`${method.name}: ${method.summary}`}>
        <MiniFlow steps={method.workflow.slice(0,5).map((step) => ({ title:step.label, detail:`${step.owner} · ${step.gate}`, tone:'info' as Tone }))} />
        <Rule><strong>Human authority remains outside AI execution.</strong><span> Stop when current scope, evidence or approval is missing.</span></Rule>
      </DiagramFrame>;
  }
}
