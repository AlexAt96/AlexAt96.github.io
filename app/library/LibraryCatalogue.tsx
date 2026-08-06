"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PortfolioBrand from "../PortfolioBrand";
import { methods } from "../AgentMethods";
import {
  compassPatternGroups,
  compassPatterns,
} from "../foundation/patternCatalogue";
import individualCatalogue from "../../public/reusable-component-foundation/individual-template-catalogue.json";
import styles from "./library.module.css";

type CollectionKey = "all" | "components" | "compass" | "tracker" | "methods";

const trackerPatterns = [
  {
    id: "critical-path",
    title: "Critical-path planner",
    category: "Delivery planning",
    summary: "Sequence dependent work, expose blockers and keep the route to a milestone visible.",
    href: "/?system=tracker#critical-path",
  },
  {
    id: "process-flow",
    title: "Route-aware process flow",
    category: "Governed workflow",
    summary: "Move work through route-specific stages with explicit owners, gates and status changes.",
    href: "/?system=tracker#process-flow",
  },
  {
    id: "poc-dashboard",
    title: "Dashboard",
    category: "Programme insight",
    summary: "Compare delivery, capacity, evidence and quality signals with decision context close at hand.",
    href: "/?system=tracker#poc-dashboard",
  },
  {
    id: "poc-planning-backlog",
    title: "Planning backlog",
    category: "Delivery planning",
    summary: "Prioritise, filter and reorder work while keeping estimates, ownership and dependencies in view.",
    href: "/?system=tracker#poc-planning-backlog",
  },
  {
    id: "poc-gantt-chart",
    title: "Gantt chart",
    category: "Delivery planning",
    summary: "Shape a weekly plan by moving, resizing and regrouping work with clear phase roll-ups.",
    href: "/?system=tracker#poc-gantt-chart",
  },
  {
    id: "poc-workflow-workbench",
    title: "Workflow workbench",
    category: "Governed workflow",
    summary: "Guide records through stages, measures and supporting evidence with the next action visible.",
    href: "/?system=tracker#poc-workflow-workbench",
  },
  {
    id: "poc-chatbot",
    title: "Workspace assistant",
    category: "Assisted workflow",
    summary: "Review source-linked answers and proposed changes before approving, editing or rejecting them.",
    href: "/?system=tracker#poc-chatbot",
  },
  {
    id: "poc-earned-value",
    title: "Earned value",
    category: "Performance insight",
    summary: "Compare schedule and cost performance, test scenarios and understand the forecast in plain language.",
    href: "/?system=tracker#poc-earned-value",
  },
  {
    id: "poc-architecture-map",
    title: "Architecture map",
    category: "Architecture landscape",
    summary: "Explore a five-layer system landscape and inspect ownership, technology, evidence and interfaces.",
    href: "/?system=tracker#poc-architecture-map",
  },
] as const;

const collectionOptions: readonly { key:CollectionKey; label:string; count:number }[] = [
  { key:"all", label:"Everything", count:individualCatalogue.templates.length + compassPatterns.length + trackerPatterns.length + methods.length },
  { key:"components", label:"Components", count:individualCatalogue.templates.length },
  { key:"compass", label:"Compass", count:compassPatterns.length },
  { key:"tracker", label:"Tracker", count:trackerPatterns.length },
  { key:"methods", label:"Methods", count:methods.length },
] as const;

function matchesQuery(values: readonly (string | string[] | undefined)[], query: string) {
  if (!query) return true;
  return values.flat().filter(Boolean).join(" ").toLowerCase().includes(query);
}

export default function LibraryCatalogue() {
  const [collection, setCollection] = useState<CollectionKey>("all");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const visibleComponents = useMemo(() => individualCatalogue.templates.filter((item) =>
    matchesQuery([item.title, item.purpose, item.layer, item.capabilityTitle, item.behaviour], query)
  ), [query]);
  const visibleCompass = useMemo(() => compassPatterns.filter((item) =>
    matchesQuery([item.title, item.summary, compassPatternGroups[item.templateKey], item.boundaries, item.states], query)
  ), [query]);
  const visibleTracker = useMemo(() => trackerPatterns.filter((item) =>
    matchesQuery([item.title, item.category, item.summary], query)
  ), [query]);
  const visibleMethods = useMemo(() => methods.filter((item) =>
    matchesQuery([item.name, item.category, item.summary, item.whenToUse, item.projects], query)
  ), [query]);

  const showComponents = collection === "all" || collection === "components";
  const showCompass = collection === "all" || collection === "compass";
  const showTracker = collection === "all" || collection === "tracker";
  const showMethods = collection === "all" || collection === "methods";
  const visibleCount =
    (showComponents ? visibleComponents.length : 0) +
    (showCompass ? visibleCompass.length : 0) +
    (showTracker ? visibleTracker.length : 0) +
    (showMethods ? visibleMethods.length : 0);

  const chooseCollection = (key: CollectionKey) => {
    setCollection(key);
    requestAnimationFrame(() => document.getElementById("catalogue")?.scrollIntoView({ behavior:"smooth", block:"start" }));
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <PortfolioBrand className={styles.brand} section="Component & pattern library" />
        <nav aria-label="Library navigation">
          <Link href="/">Portfolio</Link>
          <Link href="/components">Component showroom</Link>
          <Link href="/foundation">Compass gallery</Link>
          <Link href="/poc-tracker">Tracker gallery</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="library-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>THE COMPLETE WORKING LIBRARY</p>
          <h1 id="library-title">Every part.<br /><em>Properly connected.</em></h1>
          <p>One place for the small interface pieces, the complete product patterns and the delivery methods behind every project. Search across the lot, or enter through a project.</p>
          <a href="#catalogue">Browse the catalogue <span aria-hidden="true">↓</span></a>
        </div>
        <dl className={styles.metrics}>
          <div><dt>Components</dt><dd>{individualCatalogue.templates.length}</dd><small>implementation-level parts</small></div>
          <div><dt>Compass</dt><dd>{compassPatterns.length}</dd><small>interactive patterns</small></div>
          <div><dt>Tracker</dt><dd>{trackerPatterns.length}</dd><small>workflow &amp; product patterns</small></div>
          <div><dt>Methods</dt><dd>{methods.length}</dd><small>AI delivery methods</small></div>
        </dl>
      </section>

      <section className={styles.entryPoints} aria-label="Choose a collection">
        {collectionOptions.slice(1).map((option, index) => (
          <button
            type="button"
            data-collection={option.key}
            onClick={() => chooseCollection(option.key)}
            key={option.key}
          >
            <span>{String(index + 1).padStart(2,"0")}</span>
            <div><small>{option.count} entries</small><strong>{option.label}</strong></div>
            <b aria-hidden="true">↘</b>
          </button>
        ))}
      </section>

      <section className={styles.catalogue} id="catalogue" aria-labelledby="catalogue-title">
        <header className={styles.catalogueHeader}>
          <div><p className={styles.eyebrow}>SEARCHABLE INDEX</p><h2 id="catalogue-title">Find the useful bit.</h2></div>
          <p>The cards below point back to their live showroom, full pattern or detailed method.</p>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names, capabilities, states or use cases" aria-label="Search the complete library" />
            {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button> : null}
          </label>
          <div className={styles.filters} role="group" aria-label="Filter by collection">
            {collectionOptions.map((option) => (
              <button type="button" aria-pressed={collection === option.key} onClick={() => setCollection(option.key)} key={option.key}>
                {option.label} <span>{option.count}</span>
              </button>
            ))}
          </div>
          <p className={styles.resultCount} aria-live="polite"><strong>{visibleCount}</strong> {visibleCount === 1 ? "result" : "results"}</p>
        </div>

        {visibleCount === 0 ? (
          <div className={styles.empty}>
            <span>0</span><strong>No matching library entries.</strong><p>Try a broader phrase or reset the collection filter.</p>
            <button type="button" onClick={() => { setSearch(""); setCollection("all"); }}>Reset the catalogue</button>
          </div>
        ) : null}

        {showComponents && visibleComponents.length ? (
          <section className={`${styles.collection} ${styles.components}`} aria-labelledby="components-title">
            <header><div><span>01</span><p>SHARED INTERFACE SYSTEM</p><h2 id="components-title">Individual components</h2></div><p>{visibleComponents.length} of {individualCatalogue.templates.length} parts · primitives, composites, controllers and complete screens.</p></header>
            <div className={styles.cardGrid}>
              {visibleComponents.map((item, index) => (
                <article className={styles.card} key={item.id}>
                  <header><span>{String(index + 1).padStart(3,"0")}</span><small>{item.layer}</small></header>
                  <div><p>{item.capabilityTitle}</p><h3>{item.title}</h3><span>{item.purpose}</span></div>
                  <footer><code>{item.id}</code><Link href="/components#full-component-index">Open component showroom <span aria-hidden="true">↗</span></Link></footer>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {showCompass && visibleCompass.length ? (
          <section className={`${styles.collection} ${styles.compass}`} aria-labelledby="compass-title">
            <header><div><span>02</span><p>MIGRATION COMPASS</p><h2 id="compass-title">Planning, evidence &amp; decision patterns</h2></div><p>{visibleCompass.length} of {compassPatterns.length} patterns · each with live states, behaviour and reusable source.</p></header>
            <div className={styles.cardGrid}>
              {visibleCompass.map((item, index) => (
                <article className={styles.card} key={item.id}>
                  <header><span>{String(index + 1).padStart(2,"0")}</span><small>{compassPatternGroups[item.templateKey]}</small></header>
                  <div><p>{item.boundaries.length} component boundaries</p><h3>{item.title}</h3><span>{item.summary}</span></div>
                  <footer><code>{item.boundaries.slice(0,2).join(" · ")}</code><Link href={`/?system=compass#compass-pattern-${item.id}`}>Open live pattern <span aria-hidden="true">↗</span></Link></footer>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {showTracker && visibleTracker.length ? (
          <section className={`${styles.collection} ${styles.tracker}`} aria-labelledby="tracker-title">
            <header><div><span>03</span><p>POC TRACKER</p><h2 id="tracker-title">Workflow &amp; product patterns</h2></div><p>{visibleTracker.length} of {trackerPatterns.length} patterns · focused on visible, governed delivery.</p></header>
            <div className={styles.cardGrid}>
              {visibleTracker.map((item, index) => (
                <article className={styles.card} key={item.id}>
                  <header><span>{String(index + 1).padStart(2,"0")}</span><small>{item.category}</small></header>
                  <div><p>Interactive product pattern</p><h3>{item.title}</h3><span>{item.summary}</span></div>
                  <footer><code>{item.id}</code><Link href={item.href}>Open live pattern <span aria-hidden="true">↗</span></Link></footer>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {showMethods && visibleMethods.length ? (
          <section className={`${styles.collection} ${styles.methods}`} aria-labelledby="methods-title">
            <header><div><span>04</span><p>AGENT METHODS</p><h2 id="methods-title">AI-assisted delivery patterns</h2></div><p>{visibleMethods.length} of {methods.length} methods · practical controls from authorisation through recovery.</p></header>
            <div className={styles.cardGrid}>
              {visibleMethods.map((item, index) => (
                <article className={styles.card} key={item.id}>
                  <header><span>{String(index + 1).padStart(2,"0")}</span><small>{item.category} · {item.adoption}</small></header>
                  <div><p>{item.projects.length} project {item.projects.length === 1 ? "application" : "applications"}</p><h3>{item.name}</h3><span>{item.summary}</span></div>
                  <footer><code>{item.id}</code><Link href={`/methods?method=${item.id}`}>Open method guide <span aria-hidden="true">↗</span></Link></footer>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <PortfolioBrand className={styles.brand} section="Complete working library" />
        <p>Small parts, complete patterns and the thinking that holds them together.</p>
        <a href="#library-title">Back to the top ↑</a>
      </footer>
    </main>
  );
}
