"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  compassPatternComponentNames,
  compassPatternSourceFiles,
  compassPatternStyleFiles,
  type CompassPattern,
} from "./foundation/patternCatalogue";
import {
  compassAdapterEvents,
  compassPatternTechnicalProfiles,
  createCompassPatternApi,
  createCompassPatternExampleData,
} from "./foundation/patternTechnicalDetails";
import { AccessibleModal, ActionButton, Badge } from "./foundation/templates/shared";
import styles from "./CompassPatternWorkbench.module.css";
import { sitePath } from "./site-paths";

type WorkbenchTab = "overview" | "component" | "data" | "api";
type SourceAsset = { name: string; href: string; detail: string; language: string };

const tabs: readonly { id: WorkbenchTab; number: string; label: string; detail: string }[] = [
  { id: "overview", number: "01", label: "Overview", detail: "Implementation notes" },
  { id: "component", number: "02", label: "Component", detail: "React + TypeScript source" },
  { id: "data", number: "03", label: "Example data", detail: "Representative payload" },
  { id: "api", number: "04", label: "API / Props", detail: "Integration contract" },
];

const sourceBase = sitePath("/reusable-component-foundation/showroom-templates");

function sourceAssetsFor(pattern: CompassPattern): SourceAsset[] {
  const sourceName = compassPatternSourceFiles[pattern.templateKey];
  const styleName = compassPatternStyleFiles[pattern.templateKey];
  const assets: SourceAsset[] = [
    { name: sourceName, href: `${sourceBase}/${sourceName}`, detail: `${compassPatternComponentNames[pattern.templateKey]} implementation`, language: "tsx" },
    { name: styleName, href: `${sourceBase}/${styleName}`, detail: "Pattern-family CSS Module", language: "css" },
    { name: "shared.tsx", href: `${sourceBase}/shared.tsx`, detail: "Accessible UI primitives", language: "tsx" },
    { name: "shared.module.css", href: `${sourceBase}/shared.module.css`, detail: "Shared primitive styles", language: "css" },
    { name: "types.ts", href: `${sourceBase}/types.ts`, detail: "Showroom prop types", language: "ts" },
    { name: "TemplatePreview.tsx", href: `${sourceBase}/TemplatePreview.tsx`, detail: "Composition and import map", language: "tsx" },
  ];

  if (sourceName === "PlanningTemplates.tsx") {
    assets.push(
      { name: "dashboard.example.json", href: sitePath("/reusable-component-foundation/individual-templates/dashboard-page/template-data.json"), detail: "Dashboard and planning seed", language: "json" },
      { name: "charts.example.json", href: sitePath("/reusable-component-foundation/individual-templates/advanced-discovery-pie-chart/template-data.json"), detail: "Chart series seed", language: "json" },
      { name: "kanban.example.json", href: sitePath("/reusable-component-foundation/individual-templates/phase-kanban-board/template-data.json"), detail: "Board and list seed", language: "json" },
    );
  }

  if (sourceName === "OutcomeTemplates.tsx") {
    assets.push({ name: "template-data.json", href: sitePath("/reusable-component-foundation/template-data/template-data.json"), detail: "Report and outcome seed data", language: "json" });
  }

  return assets;
}

function downloadContent(filename: string, content: string, language: string) {
  const mime = language === "json" ? "application/json" : language === "css" ? "text/css" : "text/plain";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyText(content: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
    return;
  }

  const field = document.createElement("textarea");
  field.value = content;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}

export type CompassPatternWorkbenchProps = {
  pattern: CompassPattern;
  onClose: () => void;
};

export default function CompassPatternWorkbench({ pattern, onClose }: CompassPatternWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("overview");
  const assets = useMemo(() => sourceAssetsFor(pattern), [pattern]);
  const [activeAssetHref, setActiveAssetHref] = useState(assets[0].href);
  const [sourceCache, setSourceCache] = useState<Record<string, string>>({});
  const [sourceErrors, setSourceErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState(`${pattern.title} developer workbench opened.`);
  const [copiedKey, setCopiedKey] = useState("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeAsset = assets.find((asset) => asset.href === activeAssetHref) ?? assets[0];
  const profile = compassPatternTechnicalProfiles[pattern.templateKey];
  const exampleFileName = `${pattern.id}.example.json`;
  const apiFileName = `${pattern.id}.contract.tsx`;
  const exampleContent = useMemo(() => JSON.stringify(createCompassPatternExampleData(pattern), null, 2), [pattern]);
  const apiContent = useMemo(() => createCompassPatternApi(pattern), [pattern]);

  useEffect(() => {
    if (sourceCache[activeAsset.href] || sourceErrors[activeAsset.href]) return;
    const controller = new AbortController();

    fetch(activeAsset.href, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.text();
      })
      .then((content) => {
        setSourceCache((current) => ({ ...current, [activeAsset.href]: content }));
        setSourceErrors((current) => {
          const next = { ...current };
          delete next[activeAsset.href];
          return next;
        });
        setAnnouncement(`${activeAsset.name} is ready.`);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown loading error";
        setSourceErrors((current) => ({ ...current, [activeAsset.href]: message }));
        setAnnouncement(`${activeAsset.name} could not be loaded. The complete source bundle is still available.`);
      });

    return () => controller.abort();
  }, [activeAsset.href, activeAsset.name, sourceCache, sourceErrors]);

  const componentContent = sourceCache[activeAsset.href]
    ?? (sourceErrors[activeAsset.href]
      ? `// ${activeAsset.name} could not be previewed.\n// ${sourceErrors[activeAsset.href]}\n// Download the complete source bundle to use this file.`
      : `// Loading ${activeAsset.name}…`);
  const activeContent = activeTab === "component" ? componentContent : activeTab === "data" ? exampleContent : apiContent;
  const activeFileName = activeTab === "component" ? activeAsset.name : activeTab === "data" ? exampleFileName : apiFileName;
  const activeLanguage = activeTab === "component" ? activeAsset.language : activeTab === "data" ? "json" : "tsx";
  const contentReady = activeTab !== "component" || Boolean(sourceCache[activeAsset.href]);
  const contentKey = `${activeTab}:${activeFileName}`;

  function selectTab(tab: WorkbenchTab) {
    setActiveTab(tab);
    setCopiedKey("");
    setAnnouncement(`${tabs.find((item) => item.id === tab)?.label ?? tab} view selected.`);
  }

  function onTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  async function copyActiveContent() {
    if (!contentReady) return;
    try {
      await copyText(activeContent);
      setCopiedKey(contentKey);
      setAnnouncement(`${activeFileName} copied to the clipboard.`);
      window.setTimeout(() => setCopiedKey((current) => current === contentKey ? "" : current), 1800);
    } catch {
      setAnnouncement(`${activeFileName} could not be copied. Use Download instead.`);
    }
  }

  function downloadActiveContent() {
    if (!contentReady) return;
    downloadContent(activeFileName, activeContent, activeLanguage);
    setAnnouncement(`${activeFileName} download started.`);
  }

  function renderCodePanel(content: string, filename: string, language: string) {
    const lines = content.split("\n");
    return <div className={styles.codePanel}>
      <header>
        <div className={styles.windowDots} aria-hidden="true"><i /><i /><i /></div>
        <span><b>{pattern.title}</b><i aria-hidden="true">/</i>{filename}</span>
        <div>
          <button type="button" disabled={!contentReady} onClick={copyActiveContent} aria-label={`Copy ${filename}`}>
            {copiedKey === contentKey ? "✓ Copied" : "Copy"}
          </button>
          <button type="button" disabled={!contentReady} onClick={downloadActiveContent} aria-label={`Download ${filename}`}>↓ Download</button>
        </div>
      </header>
      <pre tabIndex={0} aria-label={`${filename}, ${language.toUpperCase()} source code`}><code>{lines.map((line, index) => <span className={styles.codeLine} key={index}><i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i><b>{line || " "}</b></span>)}</code></pre>
      <footer><span>{language.toUpperCase()} · {activeTab === "component" ? activeAsset.detail : activeTab === "data" ? "Safe representative fixture" : "Actual reference props and recommended product adapter"}</span><b>{lines.length} lines</b></footer>
    </div>;
  }

  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const activeTabId = `compass-workbench-${pattern.id}-tab-${activeTab}`;
  const activePanelId = `compass-workbench-${pattern.id}-panel-${activeTab}`;

  return <AccessibleModal
    title={pattern.title}
    description="Working source, example data and an honest integration contract for this Compass pattern."
    eyebrow="Component workbench"
    onClose={onClose}
    className={styles.workbenchModal}
    bodyClassName={styles.workbenchBody}
    initialFocusSelector="[data-workbench-initial-focus='true']"
    footer={<div className={styles.modalFooter}>
      <span><i aria-hidden="true" /> Source, styles, fixtures and API guidance are available together</span>
      <div>
        <a href={sitePath(`/reusable-component-foundation/components/${pattern.sourceId}/README.md`)} target="_blank" rel="noreferrer">Capability guidance ↗</a>
        <a href={sitePath("/reusable-component-foundation/compass-ui-code.zip")} download>Download complete source</a>
        <ActionButton onClick={onClose}>Done</ActionButton>
      </div>
    </div>}
  >
    <div className={styles.workbench}>
      <div className={styles.headerBadges} aria-label="Implementation summary">
        <span>Interactive</span><span>React + TypeScript</span><span>CSS Modules</span><span>No external UI library</span>
      </div>

      <div className={styles.tabs} role="tablist" aria-label={`${pattern.title} developer details`}>
        {tabs.map((tab, index) => <button
          key={tab.id}
          ref={(node) => { tabRefs.current[index] = node; }}
          id={`compass-workbench-${pattern.id}-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`compass-workbench-${pattern.id}-panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          data-workbench-initial-focus={tab.id === "overview" ? "true" : undefined}
          onClick={() => selectTab(tab.id)}
          onKeyDown={(event) => onTabKeyDown(event, index)}
        >
          <span>{tab.number}</span><div><strong>{tab.label}</strong><small>{tab.detail}</small></div>
        </button>)}
      </div>

      <div
        className={styles.panel}
        key={activeTab}
        id={activePanelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={activeTabIndex >= 0 ? 0 : undefined}
      >
        {activeTab === "overview" && <div className={styles.overview}>
          <div className={styles.overviewGrid}>
            <article><span>01</span><h3>Implementation</h3><ul>
              <li>Import <code>{compassPatternComponentNames[pattern.templateKey]}</code> from <code>{compassPatternSourceFiles[pattern.templateKey]}</code>.</li>
              <li>React state and native browser interactions; no chart, drag-and-drop or UI package required.</li>
              <li>Styles live in <code>{compassPatternStyleFiles[pattern.templateKey]}</code> and inherit semantic <code>--template-*</code> tokens.</li>
              <li>The current reference accepts <code>mode</code>, <code>resetToken</code> and optional <code>scenarioId</code>.</li>
            </ul></article>
            <article><span>02</span><h3>Behaviour</h3><ul>{profile.behaviour.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><span>03</span><h3>Accessibility</h3><ul>{profile.accessibility.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><span>04</span><h3>Integration boundary</h3><ul>
              <li>Promote the safe in-component fixture to a typed <code>data</code> prop when adapting for production.</li>
              <li>Keep network, storage, routing and analytics in the host application.</li>
              <li>Use explicit {compassAdapterEvents.map((event) => <code key={event}>{event}</code>)} callbacks at that boundary.</li>
              <li>Preserve loading, empty, error, read-only and success handling when connecting real data.</li>
            </ul></article>
          </div>

          <div className={styles.contractDetails}>
            <section><small>Reusable boundaries</small><div>{pattern.boundaries.map((boundary) => <code key={boundary}>{boundary}</code>)}</div></section>
            <section><small>Supported states</small><div>{pattern.states.map((state) => <Badge key={state}>{state}</Badge>)}</div></section>
            <section><small>Data contracts</small><ul>{pattern.dataContracts.map((contract) => <li key={contract}>{contract}</li>)}</ul></section>
            <section><small>Files included</small><p>{assets.length} implementation, style, shared and fixture files are available in the Component tab. The complete source download keeps their working folder structure.</p></section>
          </div>
        </div>}

        {activeTab === "component" && <div className={styles.sourceWorkspace}>
          <aside aria-label="Component source files">
            <p>COMPONENT FILES</p>
            {assets.map((asset) => <button
              type="button"
              key={asset.href}
              className={activeAsset.href === asset.href ? styles.activeFile : ""}
              aria-pressed={activeAsset.href === asset.href}
              onClick={() => {
                setActiveAssetHref(asset.href);
                setCopiedKey("");
                setAnnouncement(`${asset.name} selected.`);
              }}
            ><span>{asset.language.toUpperCase()}</span><div><strong>{asset.name}</strong><small>{asset.detail}</small></div></button>)}
            <div className={styles.fileStatus}><small>STATUS</small><span><i aria-hidden="true" /> {sourceErrors[activeAsset.href] ? "Bundle available" : sourceCache[activeAsset.href] ? "Ready to reuse" : "Loading source"}</span></div>
          </aside>
          {renderCodePanel(componentContent, activeAsset.name, activeAsset.language)}
        </div>}

        {activeTab === "data" && <div className={styles.generatedView}>
          <div className={styles.generatedNote}><strong>Representative fixture</strong><span>Safe example values cover this pattern’s initial view. Replace them at the adapter boundary without changing the visual component.</span></div>
          {renderCodePanel(exampleContent, exampleFileName, "json")}
        </div>}

        {activeTab === "api" && <div className={styles.generatedView}>
          <div className={styles.generatedNote}><strong>Exact source props + recommended adapter</strong><span>The reference source currently accepts three showroom props. The generic data and event contract below is the production handoff, not a claim that those callbacks are already wired.</span></div>
          {renderCodePanel(apiContent, apiFileName, "tsx")}
        </div>}
      </div>
    </div>
    <p className={styles.liveRegion} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </AccessibleModal>;
}
