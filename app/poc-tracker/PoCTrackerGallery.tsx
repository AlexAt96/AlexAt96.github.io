"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PortfolioBrand from "../PortfolioBrand";
import styles from "./gallery.module.css";
import { usePersistentDarkMode } from "../usePersistentTheme";
import { useScenario } from "../useScenario";
import type { ScenarioId } from "../scenarios";
import { trackerDccPatternDescriptions } from "../trackerScenarioFixtures";
import { sitePath } from "../site-paths";

type ComponentTemplate = {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  demo: string;
};

const assetRoot = sitePath("/poc-tracker-components");

const galleryEmbedObservers = new WeakMap<HTMLIFrameElement, ResizeObserver>();

function prepareGalleryEmbed(frame: HTMLIFrameElement, dark: boolean) {
  const document = frame.contentDocument;
  if (!document?.body) return;
  document.body.classList.add("poc-embedded");
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const resize = () => {
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    frame.style.height = `${height}px`;
  };
  galleryEmbedObservers.get(frame)?.disconnect();
  const observer = new ResizeObserver(resize);
  observer.observe(document.body);
  observer.observe(document.documentElement);
  galleryEmbedObservers.set(frame, observer);
  requestAnimationFrame(resize);
}

const templates: ComponentTemplate[] = [
  {
    id: "dashboard",
    number: "01",
    title: "Dashboard",
    category: "Programme insight",
    description:
      "Compare delivery, capacity, evidence and quality signals, with context ready when a decision needs it.",
    features: ["Four perspectives", "Progress signals", "Decision context"],
    demo: `${assetRoot}/01-dashboard/demo.html`,
  },
  {
    id: "planning-backlog",
    number: "02",
    title: "Planning backlog",
    category: "Delivery planning",
    description:
      "Prioritise delivery work, filter by owner and status, reorder tasks and keep dependencies in view.",
    features: ["Smart filters", "Priority order", "Task detail"],
    demo: `${assetRoot}/02-planning-backlog/demo.html`,
  },
  {
    id: "gantt-chart",
    number: "03",
    title: "Gantt chart",
    category: "Delivery planning",
    description:
      "Shape a weekly delivery plan by moving, resizing and regrouping work, with clear phase roll-ups.",
    features: ["Move work", "Resize timelines", "Phase roll-ups"],
    demo: `${assetRoot}/03-gantt-chart/demo.html`,
  },
  {
    id: "workbench",
    number: "04",
    title: "Workflow workbench",
    category: "Governed workflow",
    description:
      "Guide records through clear stages, measures and supporting evidence, with the next decision always in view.",
    features: ["Guided stages", "Outcome measures", "Clear next action"],
    demo: `${assetRoot}/06-workflow-workbench/demo.html`,
  },
  {
    id: "chatbot",
    number: "05",
    title: "Workspace assistant",
    category: "Assisted workflow",
    description:
      "Explore source-linked answers and review proposed changes before choosing to approve, edit or reject them.",
    features: ["Source-linked answers", "Review controls", "Suggested actions"],
    demo: `${assetRoot}/07-chatbot/demo.html`,
  },
  {
    id: "earned-value",
    number: "06",
    title: "Earned value",
    category: "Performance insight",
    description:
      "Test delivery scenarios, compare schedule and cost performance, and understand the forecast in plain language.",
    features: ["Scenario planning", "Clear variances", "Forecast outlook"],
    demo: `${assetRoot}/08-earned-value/demo.html`,
  },
  {
    id: "architecture-map",
    number: "07",
    title: "Architecture map",
    category: "Architecture landscape",
    description:
      "Explore a five-layer system landscape, follow interfaces and inspect ownership, technology and evidence.",
    features: ["15 systems", "Connected interfaces", "Five layers"],
    demo: `${assetRoot}/09-architecture-system-map/demo.html`,
  },
];

const showroomIds:Record<string,string> = {
  dashboard:"poc-dashboard",
  "planning-backlog":"poc-planning-backlog",
  "gantt-chart":"poc-gantt-chart",
  workbench:"poc-workflow-workbench",
  chatbot:"poc-chatbot",
  "earned-value":"poc-earned-value",
  "architecture-map":"poc-architecture-map",
};

const dccDescriptions:Record<string,string> = {
  ...trackerDccPatternDescriptions,
  "poc-planning-backlog":"Prioritise standards curation, document intake, assessment, review and publication work while keeping dependencies visible.",
  "poc-gantt-chart":"Plan the hackathon assurance route across standards loading, document extraction, AI assessment, human review and publication.",
  "poc-earned-value":"Explore the effort forecast for the five-day documentation-assurance build across four delivery work packages.",
};

export default function PoCTrackerGallery({ initialScenario }: { initialScenario?:ScenarioId }) {
  const [dark, setDark] = usePersistentDarkMode();
  const scenarioState = useScenario(initialScenario,"tracker");
  const { scenarioId,starredPatternIds,toggleStar } = scenarioState;
  const dccMode = scenarioId === "dcc-hackathon";
  const firstRecommended = starredPatternIds.map((id) => templates.find((template) => showroomIds[template.id] === id)?.id).find(Boolean);
  const [selectedId, setSelectedId] = useState(firstRecommended ?? templates[0].id);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const previousScenarioRef = useRef(scenarioId);
  const visibleTemplates = useMemo(() => [...templates].sort((a,b) => {
    const aIndex = starredPatternIds.indexOf(showroomIds[a.id]);
    const bIndex = starredPatternIds.indexOf(showroomIds[b.id]);
    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
    if (aIndex >= 0) return -1;
    if (bIndex >= 0) return 1;
    return templates.indexOf(a) - templates.indexOf(b);
  }),[starredPatternIds]);
  const selected =
    templates.find((template) => template.id === selectedId) ?? templates[0];
  const selectedShowroomId = showroomIds[selected.id];
  const selectedDescription = dccMode ? dccDescriptions[selectedShowroomId] ?? selected.description : selected.description;
  const selectedDemo = dccMode ? `${selected.demo}?scenario=dcc-hackathon` : selected.demo;

  useEffect(() => {
    const document = previewRef.current?.contentDocument;
    if (document?.documentElement) document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    if (previousScenarioRef.current === scenarioId) return;
    previousScenarioRef.current = scenarioId;
    const first = starredPatternIds.map((id) => templates.find((template) => showroomIds[template.id] === id)?.id).find(Boolean);
    setSelectedId(first ?? templates[0].id);
  },[scenarioId,starredPatternIds]);

  return (
    <main className={styles.page} data-theme={dark ? "dark" : "light"} data-scenario={dccMode ? "dcc-hackathon" : "base"}>
      <header className={styles.topbar}>
        <PortfolioBrand className={styles.brand} section="PoC Tracker" />
        <div className={styles.topActions}>
          <Link className={styles.backLink} href={dccMode ? "/?system=tracker&scenario=dcc-hackathon" : "/?system=tracker"}>
            <span aria-hidden="true">←</span>
            <span className={styles.navLabel}>Full Tracker showroom</span>
          </Link>
          <Link className={`${styles.backLink} ${styles.secondaryLink}`} href={dccMode ? "/foundation?scenario=dcc-hackathon" : "/foundation"}>
            All Migration Compass patterns <span aria-hidden="true">→</span>
          </Link>
          <button className={styles.themeButton} onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} aria-pressed={dark}>{dark ? "☀" : "◐"}</button>
        </div>
      </header>

      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{dccMode ? "PoC Tracker · DCC Hackathon data" : "PoC Tracker · Interactive showcase"}</p>
          <h1>{dccMode ? "Seven live Tracker patterns, filled with assurance work." : "Seven live product experiences, ready to explore."}</h1>
          <p className={styles.lede}>
            {dccMode ? "Move through assurance health, planning, governed review, source-aware AI support and the solution landscape behind the DCC documentation-assurance service." : "Move through a focused collection of dashboards, planning tools and guided workflows. Every experience uses realistic fictional data and is ready to explore across desktop and mobile."}
          </p>
        </div>
        <dl className={styles.summary}>
          <div>
            <dt>Experiences</dt>
            <dd>07</dd>
          </div>
          <div>
            <dt>Formats</dt>
            <dd>Responsive</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><i aria-hidden="true" /> {dccMode ? "DCC ready" : "Ready"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.workbench} aria-label="PoC Tracker experience gallery">
        <aside className={styles.catalog}>
          <div className={styles.catalogHeading}>
            <p>Experience index</p>
            <span>{dccMode ? `${starredPatternIds.length} recommended · ${templates.length} previews` : `${templates.length} interactive previews`}</span>
          </div>
          <nav aria-label="Choose a PoC Tracker experience">
            {visibleTemplates.map((template) => (
              <button
                className={template.id === selected.id ? styles.active : undefined}
                type="button"
                key={template.id}
                aria-pressed={template.id === selected.id}
                onClick={() => setSelectedId(template.id)}
              >
                <span>{template.number}</span>
                <span>
                  <strong>{template.title}</strong>
                  <small>{template.category}</small>
                </span>
              </button>
            ))}
          </nav>
          <div className={styles.catalogNote}>
            <span aria-hidden="true">i</span>
            <p>
              {dccMode ? "DCC hackathon fixture data is used throughout. Every preview keeps its original keyboard and responsive behaviour." : "Fictional programme data is used throughout. Every preview supports keyboard and responsive exploration."}
            </p>
          </div>
        </aside>

        <article className={styles.stage}>
          <header className={styles.stageHeader}>
            <div>
              <p>{selected.category}</p>
              <h2 aria-live="polite">{selected.title}</h2>
              <span>{selectedDescription}</span>
            </div>
            <div className={styles.stageActions}><button className={styles.starButton} type="button" aria-pressed={starredPatternIds.includes(selectedShowroomId)} onClick={() => toggleStar(selectedShowroomId)}><span aria-hidden="true">{starredPatternIds.includes(selectedShowroomId) ? "★" : "☆"}</span>{starredPatternIds.includes(selectedShowroomId) ? "Recommended" : "Star pattern"}</button><a href={selectedDemo} target="_blank" rel="noreferrer">Explore full screen <span aria-hidden="true">↗</span></a></div>
          </header>

          <div className={styles.browserFrame}>
            <iframe
              ref={previewRef}
              key={selected.id}
              src={selectedDemo}
              title={`${selected.title} interactive experience`}
              scrolling="no"
              onLoad={(event) => prepareGalleryEmbed(event.currentTarget, dark)}
            />
          </div>

          <footer className={styles.stageFooter}>
            <span>
              <i aria-hidden="true" /> Explore freely — changes reset when you leave the preview.
            </span>
          </footer>
        </article>
      </section>

      <section className={styles.contactSheet} aria-labelledby="all-components-heading">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>At a glance</p>
          <h2 id="all-components-heading">{dccMode ? "Explore every DCC assurance view" : "Explore every experience"}</h2>
          <p>{dccMode ? "Recommended views are promoted first; choose any card to load the same original Tracker screen above." : "Choose a card to load it above and continue exploring."}</p>
        </div>
        <div className={styles.cards}>
          {visibleTemplates.map((template) => (
            <button
              type="button"
              key={template.id}
              onClick={() => {
                setSelectedId(template.id);
                document.querySelector(`.${styles.workbench}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <span className={styles.cardImage}>
                <i>{template.number}</i>
                <span className={styles.miniRail}><b /><b /><b /></span>
                <span className={styles.miniHeader}><b /><i /></span>
                <span className={styles.miniBody}>
                  {template.features.map((feature) => <b key={feature}><i /><span /></b>)}
                </span>
              </span>
              <span className={styles.cardCopy}>
                <small>{template.category}</small>
                <strong>{template.title}</strong>
                <span>{dccMode ? dccDescriptions[showroomIds[template.id]] ?? template.description : template.description}</span>
                <span className={styles.featureList}>{template.features.map((feature) => <i key={feature}>{feature}</i>)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className={styles.pageFooter}>
        <span>AA Portfolio · PoC Tracker showcase · Updated 5 August 2026</span>
        <Link href={dccMode ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"}>Open full Migration Compass showroom</Link>
      </footer>
    </main>
  );
}
