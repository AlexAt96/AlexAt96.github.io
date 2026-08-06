"use client";

import Link from "next/link";
import PortfolioBrand from "../PortfolioBrand";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import CompassPatternWorkbench from "../CompassPatternWorkbench";
import { ActionButton, Segmented } from "./templates/shared";
import type { DemoMode } from "./templates/types";
import { TemplatePreview } from "./templates/TemplatePreview";
import { useScenario } from "../useScenario";
import type { ScenarioId } from "../scenarios";
import {
  compassPatternGroups as groups,
  compassPatternIcons as icons,
  compassPatterns as patternItems,
  type CompassPattern,
} from "./patternCatalogue";
import styles from "./foundation.module.css";
import { sitePath } from "../site-paths";

const modeOptions: readonly { value: DemoMode; label: string }[] = [
  { value:"default", label:"Standard" },
  { value:"empty", label:"Empty state" },
  { value:"readonly", label:"Read-only" },
];

function selectedKey(item: CompassPattern) {
  return item.templateKey;
}

export default function FoundationGallery({ initialScenario }: { initialScenario?:ScenarioId }) {
  const items = patternItems;
  const scenarioState = useScenario(initialScenario);
  const { scenarioId, scenario, starredPatternIds, toggleStar } = scenarioState;
  const dccMode = scenarioId === "dcc-hackathon";
  const galleryStarredPatternIds = useMemo(() => starredPatternIds.filter((id) => items.some((item) => id === `compass-pattern-${item.id}`)), [items, starredPatternIds]);
  const firstStarredPattern = galleryStarredPatternIds.map((id) => id.replace(/^compass-pattern-/,"")).find((id) => items.some((item) => item.id === id));
  const [selectedId, setSelectedId] = useState(firstStarredPattern ?? items[0].id);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All capabilities");
  const [mode, setMode] = useState<DemoMode>("default");
  const [expanded, setExpanded] = useState(false);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const previousScenarioRef = useRef(scenarioId);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const templateKey = selectedKey(selected);
  const groupNames = ["All capabilities", ...Array.from(new Set(items.map((item) => groups[selectedKey(item)])))];
  const visible = useMemo(() => items.filter((item) => {
    const key = selectedKey(item);
    const matchesGroup = group === "All capabilities" || groups[key] === group;
    const haystack = `${item.title} ${item.summary} ${item.boundaries.join(" ")} ${item.states.join(" ")}`.toLowerCase();
    return matchesGroup && haystack.includes(query.trim().toLowerCase());
  }).sort((a,b) => {
    const aIndex = galleryStarredPatternIds.indexOf(`compass-pattern-${a.id}`);
    const bIndex = galleryStarredPatternIds.indexOf(`compass-pattern-${b.id}`);
    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
    if (aIndex >= 0) return -1;
    if (bIndex >= 0) return 1;
    return items.indexOf(a) - items.indexOf(b);
  }), [galleryStarredPatternIds, group, items, query]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    if (previousScenarioRef.current === scenarioId) return;
    previousScenarioRef.current = scenarioId;
    const first = galleryStarredPatternIds.map((id) => id.replace(/^compass-pattern-/,"")).find((id) => items.some((item) => item.id === id));
    if (!first || !dccMode) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(first);
    setMode("default");
    setResetToken((value) => value + 1);
  }, [dccMode, galleryStarredPatternIds, items, scenarioId]);

  const selectTemplate = (id: string, scroll = false) => {
    setSelectedId(id);
    setMode("default");
    setResetToken((value) => value + 1);
    if (scroll) requestAnimationFrame(() => document.getElementById("template-stage")?.scrollIntoView({ behavior:"smooth", block:"start" }));
  };

  return <main className={styles.page}>
    <header className={styles.topbar}>
      <PortfolioBrand className={styles.brand} section={dccMode ? "DCC scenario library" : "Pattern library"} />
      <nav aria-label="Showroom navigation"><span className={styles.isolationBadge}><i /> {dccMode ? "DCC Hackathon data" : "Approved collection"}</span><Link href="/poc-tracker">Tracker gallery</Link><Link href={dccMode ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"}>Full Migration Compass showroom</Link></nav>
    </header>

    <section className={styles.intro}>
      <div><p className={styles.eyebrow}>{dccMode ? "DCC Hackathon · Recommended pattern library" : "Compass pattern library"}</p><h1>{dccMode ? <>Assurance patterns.<br /><em>DCC scenario data.</em></> : <>Built for real work.<br /><em>Ready to reuse.</em></>}</h1><p>{dccMode ? `${galleryStarredPatternIds.length} starred gallery patterns are brought to the top for the documentation-assurance journey. Their examples use standards, uploaded documents, AI findings, human review and report data.` : "Explore polished, interactive patterns for planning, data collection, analysis, evidence and reporting. Every example uses safe sample content and includes carefully designed empty and read-only states."}</p><div className={styles.introActions}><a href="#template-library">Explore patterns <span>↓</span></a><Link href={dccMode ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"}>View the full showroom</Link></div></div>
      <dl><div><dt>Patterns</dt><dd>{items.length}</dd><small>interactive patterns</small></div><div><dt>Workflow areas</dt><dd>{groupNames.length - 1}</dd><small>from planning to reporting</small></div><div><dt>Preview states</dt><dd>3</dd><small>standard, empty and read-only</small></div></dl>
    </section>

    <section className={styles.library} id="template-library" aria-label="Compass UI pattern library">
      <aside className={styles.catalog}>
        <div className={styles.catalogTitle}><span>{dccMode ? `${scenario.shortName} recommended first` : "Pattern library"}</span><b>{visible.length} of {items.length}</b></div>
        <label className={styles.search}><span aria-hidden="true">⌕</span><input aria-label="Search patterns" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or capability" /></label>
        <div className={styles.groupFilters}>{groupNames.map((name) => <button key={name} type="button" className={group === name ? styles.activeFilter : ""} onClick={() => setGroup(name)}>{name}</button>)}</div>
        <nav>{visible.map((item) => {
          const key = selectedKey(item);
          const starred = starredPatternIds.includes(`compass-pattern-${item.id}`);
          return <button className={item.id === selected.id ? styles.activeItem : ""} type="button" key={item.id} onClick={() => selectTemplate(item.id)}><i>{icons[key]}</i><span><strong>{item.title}</strong><small>{starred ? `★ ${dccMode ? "Recommended for DCC" : "Starred"}` : groups[key]}</small></span><b>{String(items.indexOf(item) + 1).padStart(2,"0")}</b></button>;
        })}</nav>
        {!visible.length && <div className={styles.noResults}><strong>No matching patterns</strong><button type="button" onClick={() => { setQuery(""); setGroup("All capabilities"); }}>Clear filters</button></div>}
      </aside>

      <article id="template-stage" className={`${styles.stage} ${expanded ? styles.stageExpanded : ""}`}>
        <header className={styles.stageHeader}>
          <div><p>{String(items.indexOf(selected) + 1).padStart(2,"0")} · {groups[templateKey]}</p><h2>{selected.title}</h2><span>{selected.summary}</span></div>
          <div className={styles.stageActions}><button type="button" className={starredPatternIds.includes(`compass-pattern-${selected.id}`) ? styles.starredAction : ""} aria-pressed={starredPatternIds.includes(`compass-pattern-${selected.id}`)} onClick={() => toggleStar(`compass-pattern-${selected.id}`)}>{starredPatternIds.includes(`compass-pattern-${selected.id}`) ? "★ Recommended" : "☆ Star pattern"}</button><button type="button" onClick={() => setTechnicalOpen(true)}>View specifications <span aria-hidden="true">⌘</span></button><button type="button" aria-pressed={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Exit full screen" : "Full-screen preview"} <span aria-hidden="true">{expanded ? "×" : "↗"}</span></button></div>
        </header>

        <div className={styles.demoControls}>
          <div><small>Preview state</small><Segmented value={mode} options={modeOptions} onChange={(value) => { setMode(value); setResetToken((token) => token + 1); }} label="Choose preview state" /></div>
          <div><span>Changes stay in this preview</span><ActionButton onClick={() => setResetToken((value) => value + 1)}>Reset preview</ActionButton></div>
        </div>

        <div className={styles.canvas}>
          <div className={styles.previewSurface}><TemplatePreview key={`${selected.id}-${scenarioId}-${mode}-${resetToken}`} templateKey={templateKey} mode={mode} resetToken={resetToken} scenarioId={scenarioId} /></div>
        </div>
      </article>
    </section>

    <section className={styles.handoff}>
      <div><p className={styles.eyebrow}>Implementation handoff</p><h2>Ready to move from showroom to product.</h2><p>Each pattern is backed by clear behaviour guidance, replaceable sample data and production-ready React source, making it straightforward to adapt without losing the approved interaction design.</p></div>
      <div className={styles.handoffCards}><Link href="/reusable-component-foundation/INDIVIDUAL-TEMPLATE-INDEX.md" target="_blank"><span>01</span><strong>Behaviour guidance</strong><small>Fields, actions, states and validation rules</small></Link><Link href="/reusable-component-foundation/template-data/template-data.json" target="_blank"><span>02</span><strong>Sample data</strong><small>Safe, replaceable content for every state</small></Link><Link href="/reusable-component-foundation/TEMPLATE-BUILD-ORDER.md" target="_blank"><span>03</span><strong>Composition map</strong><small>From shared controls to complete screens</small></Link></div>
    </section>

    <section className={styles.styleExport} aria-labelledby="style-export-title">
      <header>
        <div><p className={styles.eyebrow}>Styling &amp; source</p><h2 id="style-export-title">Export the complete UI system.</h2></div>
        <div><p>Take the typography, colour tokens or the entire working React interface. Every download is ready to use as a starting point in another product.</p><a href={sitePath("/reusable-component-foundation/compass-ui-code.zip")} download>Download everything <span>↓</span></a></div>
      </header>

      <div className={styles.exportGrid}>
        <article className={styles.typeExport}>
          <div className={styles.exportCardHeader}><span>01 · Typography</span><small>CSS tokens + font faces</small></div>
          <div className={styles.typeSample} aria-hidden="true"><strong>Aa</strong><span>Source Sans 3</span></div>
          <div className={styles.typeRows}>
            <span><small>Display / 850</small><strong>Reusable by design.</strong></span>
            <span><small>Heading / 750</small><strong>Implementation handoff</strong></span>
            <span><small>Body / 400</small><strong>Clear, calm and made for dense product interfaces.</strong></span>
          </div>
          <footer><span><b>9</b> type tokens · upright and italic variable fonts</span><a href={sitePath("/reusable-component-foundation/styling/typography.css")} download aria-label="Download typography CSS">Export typography <b>↓</b></a></footer>
        </article>

        <article className={styles.colourExport}>
          <div className={styles.exportCardHeader}><span>02 · Colours</span><small>CSS custom properties</small></div>
          <div className={styles.swatchStack} aria-label="Compass colour palette">
            <span style={{ "--swatch":"#172033" } as CSSProperties}><i /><b>Ink</b><code>#172033</code></span>
            <span style={{ "--swatch":"#64357B" } as CSSProperties}><i /><b>Compass plum</b><code>#64357B</code></span>
            <span style={{ "--swatch":"#E31937" } as CSSProperties}><i /><b>Signal red</b><code>#E31937</code></span>
            <span style={{ "--swatch":"#15936B" } as CSSProperties}><i /><b>Success</b><code>#15936B</code></span>
            <span style={{ "--swatch":"#F7F8FA" } as CSSProperties}><i /><b>Canvas</b><code>#F7F8FA</code></span>
          </div>
          <footer><span><b>19</b> semantic tokens · surfaces, text and status</span><a href={sitePath("/reusable-component-foundation/styling/colours.css")} download aria-label="Download colour tokens CSS">Export colours <b>↓</b></a></footer>
        </article>

        <article className={styles.codeExport}>
          <div className={styles.exportCardHeader}><span>03 · Full UI code</span><small>React · TypeScript · CSS</small></div>
          <div className={styles.codeWindow} aria-hidden="true">
            <div><i /><i /><i /><span>compass-ui/</span></div>
            <pre><b>├─</b> FoundationGallery.tsx{"\n"}<b>├─</b> foundation.module.css{"\n"}<b>├─</b> templates/{"\n"}<em>│  ├─</em> PlanningTemplates.tsx{"\n"}<em>│  ├─</em> CollectionTemplates.tsx{"\n"}<em>│  ├─</em> AnalysisTemplates.tsx{"\n"}<em>│  └─</em> OutcomeTemplates.tsx{"\n"}<b>└─</b> styling/</pre>
          </div>
          <footer><span><b>26</b> UI patterns · complete source and styling assets</span><a href={sitePath("/reusable-component-foundation/compass-ui-code.zip")} download aria-label="Download full Compass UI source code">Export full UI <b>↓</b></a></footer>
        </article>
      </div>
    </section>

    <section className={styles.fullIndex} aria-labelledby="full-template-index">
      <header><div><p className={styles.eyebrow}>Complete pattern index</p><h2 id="full-template-index">All {items.length} approved patterns.</h2></div><span>Choose a pattern to open its interactive preview.</span></header>
      <div>{items.map((item, index) => {
        const key = selectedKey(item);
        return <button key={item.id} onClick={() => selectTemplate(item.id, true)}><i>{icons[key]}</i><span><small>{String(index + 1).padStart(2,"0")} · {groups[key]}</small><strong>{item.title}</strong><p>{item.summary}</p></span><b aria-hidden="true">↗</b></button>;
      })}</div>
    </section>

    <footer className={styles.pageFooter}><span>AA Portfolio · approved pattern library</span><div><Link href="/poc-tracker">Tracker gallery</Link><Link href={dccMode ? "/?system=compass&scenario=dcc-hackathon" : "/?system=compass"}>Full Migration Compass showroom</Link></div></footer>

    {technicalOpen && <CompassPatternWorkbench pattern={selected} onClose={() => setTechnicalOpen(false)} />}
  </main>;
}
