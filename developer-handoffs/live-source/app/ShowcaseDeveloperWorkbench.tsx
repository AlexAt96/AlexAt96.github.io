"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export type DeveloperSourceAsset = {
  name:string;
  language:string;
  detail:string;
  href?:string;
  content?:string;
};

export type ShowcaseDeveloperHandoff = {
  id:string;
  name:string;
  summary:string;
  stack:string[];
  behaviour:string[];
  accessibility:string[];
  dependencies:string[];
  sourceAssets:DeveloperSourceAsset[];
  example:{ name:string; content:string };
  contract:{ name:string; content:string };
  completeArchiveHref?:string;
  completeArchiveName?:string;
};

type WorkbenchTab = "overview" | "component" | "data" | "api";

const tabs:readonly { id:WorkbenchTab; number:string; title:string; copy:string }[] = [
  { id:"overview", number:"01", title:"Overview", copy:"Implementation and setup" },
  { id:"component", number:"02", title:"Source files", copy:"Complete working source" },
  { id:"data", number:"03", title:"Example data", copy:"Representative payload" },
  { id:"api", number:"04", title:"API / Props", copy:"Integration contract" },
];

function mimeFor(language:string) {
  if (language === "json") return "application/json";
  if (language === "css") return "text/css";
  if (language === "html") return "text/html";
  if (language === "md") return "text/markdown";
  if (language === "js") return "text/javascript";
  return "text/plain";
}

function downloadText(filename:string, content:string, language:string) {
  const blob = new Blob([content], { type:mimeFor(language) });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyText(content:string) {
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

function writeAscii(target:Uint8Array, offset:number, length:number, value:string) {
  const bytes = new TextEncoder().encode(value);
  target.set(bytes.slice(0,length),offset);
}

function writeOctal(target:Uint8Array, offset:number, length:number, value:number) {
  writeAscii(target,offset,length,`${Math.max(0,value).toString(8).padStart(length-1,"0")}\0`);
}

function createTar(files:Array<{ name:string; content:string }>) {
  const encoder = new TextEncoder();
  const chunks:Uint8Array[] = [];
  const now = Math.floor(Date.now()/1000);

  for (const file of files) {
    const body = encoder.encode(file.content);
    const header = new Uint8Array(512);
    const safeName = file.name.replace(/^\/+/,"").slice(-100);
    writeAscii(header,0,100,safeName);
    writeOctal(header,100,8,0o644);
    writeOctal(header,108,8,0);
    writeOctal(header,116,8,0);
    writeOctal(header,124,12,body.length);
    writeOctal(header,136,12,now);
    writeAscii(header,148,8,"        ");
    writeAscii(header,156,1,"0");
    writeAscii(header,257,6,"ustar\0");
    writeAscii(header,263,2,"00");
    writeAscii(header,265,32,"developer");
    writeAscii(header,297,32,"developer");
    const checksum = header.reduce((sum,value) => sum+value,0);
    writeAscii(header,148,8,`${checksum.toString(8).padStart(6,"0")}\0 `);
    chunks.push(header,body);
    const padding = (512-(body.length%512))%512;
    if (padding) chunks.push(new Uint8Array(padding));
  }
  chunks.push(new Uint8Array(1024));
  return new Blob(chunks as BlobPart[], { type:"application/x-tar" });
}

async function resolveAsset(asset:DeveloperSourceAsset) {
  if (asset.content !== undefined) return asset.content;
  if (!asset.href) throw new Error(`${asset.name} has no source location.`);
  const response = await fetch(asset.href);
  if (!response.ok) throw new Error(`${asset.name} returned ${response.status}.`);
  return response.text();
}

export async function downloadShowcaseDeveloperHandoff(handoff:ShowcaseDeveloperHandoff) {
  if (handoff.completeArchiveHref) {
    const response = await fetch(handoff.completeArchiveHref);
    if (!response.ok) throw new Error(`Complete source archive returned ${response.status}.`);
    const archive = await response.blob();
    const url = URL.createObjectURL(archive);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = handoff.completeArchiveName ?? `${handoff.id}-developer-handoff.tar`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }
  const sourceFiles = await Promise.all(handoff.sourceAssets.map(async (asset) => ({
    name:asset.name,
    content:await resolveAsset(asset),
  })));
  const archive = createTar([
    ...sourceFiles,
    { name:handoff.example.name, content:handoff.example.content },
    { name:handoff.contract.name, content:handoff.contract.content },
  ]);
  const url = URL.createObjectURL(archive);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${handoff.id}-developer-handoff.tar`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ShowcaseDeveloperWorkbench({ handoff, onClose }:{ handoff:ShowcaseDeveloperHandoff; onClose:()=>void }) {
  const [activeTab,setActiveTab] = useState<WorkbenchTab>("overview");
  const [activeAssetName,setActiveAssetName] = useState(handoff.sourceAssets[0]?.name ?? "");
  const [sourceCache,setSourceCache] = useState<Record<string,string>>({});
  const [sourceErrors,setSourceErrors] = useState<Record<string,string>>({});
  const [copiedKey,setCopiedKey] = useState("");
  const [announcement,setAnnouncement] = useState(`${handoff.name} developer workbench opened.`);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeAsset = handoff.sourceAssets.find((asset) => asset.name === activeAssetName) ?? handoff.sourceAssets[0];

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>("[data-workbench-initial-focus='true']")?.focus();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event:KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown",onKeyDown);
    return () => {
      document.removeEventListener("keydown",onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      previousFocus.current?.focus({ preventScroll:true });
    };
  },[onClose]);

  useEffect(() => {
    if (!activeAsset || activeAsset.content !== undefined || sourceCache[activeAsset.name] || sourceErrors[activeAsset.name]) return;
    const controller = new AbortController();
    fetch(activeAsset.href!,{ signal:controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.text();
      })
      .then((content) => {
        setSourceCache((current) => ({...current,[activeAsset.name]:content}));
        setAnnouncement(`${activeAsset.name} is ready.`);
      })
      .catch((error:unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown loading error";
        setSourceErrors((current) => ({...current,[activeAsset.name]:message}));
        setAnnouncement(`${activeAsset.name} could not be loaded.`);
      });
    return () => controller.abort();
  },[activeAsset,sourceCache,sourceErrors]);

  const sourceContent = !activeAsset ? "No source file is available."
    : activeAsset.content ?? sourceCache[activeAsset.name]
      ?? (sourceErrors[activeAsset.name] ? `// ${sourceErrors[activeAsset.name]}` : `// Loading ${activeAsset.name}…`);
  const sourceReady = Boolean(activeAsset && (activeAsset.content !== undefined || sourceCache[activeAsset.name]));
  const panels = useMemo(() => ({
    component:{ filename:activeAsset?.name ?? "source", language:activeAsset?.language ?? "text", content:sourceContent, ready:sourceReady, detail:activeAsset?.detail ?? "Source file" },
    data:{ filename:handoff.example.name, language:"json", content:handoff.example.content, ready:true, detail:"Safe representative fixture" },
    api:{ filename:handoff.contract.name, language:"ts", content:handoff.contract.content, ready:true, detail:"Implemented props and host integration boundary" },
  }),[activeAsset,handoff,sourceContent,sourceReady]);

  function selectTab(tab:WorkbenchTab) {
    setActiveTab(tab);
    setCopiedKey("");
    setAnnouncement(`${tabs.find((item) => item.id === tab)?.title ?? tab} selected.`);
  }

  function onTabKeyDown(event:ReactKeyboardEvent<HTMLButtonElement>, index:number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index+1)%tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index-1+tabs.length)%tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length-1;
    else return;
    event.preventDefault();
    selectTab(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  async function copyPanel(tab:Exclude<WorkbenchTab,"overview">) {
    const panel = panels[tab];
    if (!panel.ready) return;
    try {
      await copyText(panel.content);
      setCopiedKey(`${tab}:${panel.filename}`);
      setAnnouncement(`${panel.filename} copied to the clipboard.`);
      window.setTimeout(() => setCopiedKey((current) => current === `${tab}:${panel.filename}` ? "" : current),1800);
    } catch {
      setAnnouncement(`${panel.filename} could not be copied. Use Download instead.`);
    }
  }

  function renderCodePanel(tab:Exclude<WorkbenchTab,"overview">) {
    const panel = panels[tab];
    const lines = panel.content.split("\n");
    return <div className="tech-code-panel">
      <header><div className="code-window-dots" aria-hidden="true"><i /><i /><i /></div><span>{handoff.name} <b>/</b> {panel.filename}</span><div>
        <button type="button" disabled={!panel.ready} onClick={() => copyPanel(tab)} aria-label={`Copy ${panel.filename}`}>{copiedKey === `${tab}:${panel.filename}` ? "✓ Copied" : "Copy"}</button>
        <button type="button" className="code-download" disabled={!panel.ready} onClick={() => downloadText(panel.filename,panel.content,panel.language)} aria-label={`Download ${panel.filename}`}>↓ Download</button>
      </div></header>
      <pre tabIndex={0} aria-label={`${panel.filename}, ${panel.language.toUpperCase()} source code`}><code>{lines.map((line,index) => <span className="code-line" key={`${index}-${line}`}><i aria-hidden="true">{String(index+1).padStart(2,"0")}</i><b>{line || " "}</b></span>)}</code></pre>
      <footer><span>{panel.language.toUpperCase()} · {panel.detail}</span><b>{lines.length} lines</b></footer>
    </div>;
  }

  async function downloadCompletePackage() {
    setAnnouncement("Preparing the complete developer source package.");
    try {
      await downloadShowcaseDeveloperHandoff(handoff);
      setAnnouncement(`${handoff.name} complete developer package downloaded.`);
    } catch (error:unknown) {
      const message = error instanceof Error ? error.message : "Unknown packaging error";
      setAnnouncement(`The complete package could not be prepared: ${message}`);
    }
  }

  return <div className="tech-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="tech-modal tech-workbench-modal" role="dialog" aria-modal="true" aria-labelledby="tech-modal-title" aria-describedby="tech-modal-description">
      <header><div><p className="eyebrow">COMPONENT WORKBENCH</p><h2 id="tech-modal-title">{handoff.name}</h2><p id="tech-modal-description">{handoff.summary}</p><div className="tech-header-badges"><span>Complete handoff</span><span>{handoff.sourceAssets.length} {handoff.completeArchiveHref ? "highlighted files" : "source files"}</span><span>Example data</span><span>Typed contract</span></div></div><button type="button" onClick={onClose} aria-label="Close component workbench">×</button></header>
      <div className="tech-modal-tabs" role="tablist" aria-label={`${handoff.name} developer details`}>{tabs.map((tab,index) => <button
        ref={(node) => { tabRefs.current[index]=node; }}
        id={`showcase-workbench-${handoff.id}-tab-${tab.id}`}
        role="tab"
        type="button"
        aria-selected={activeTab === tab.id}
        aria-controls={`showcase-workbench-${handoff.id}-panel-${tab.id}`}
        tabIndex={activeTab === tab.id ? 0 : -1}
        className={activeTab === tab.id ? "active" : ""}
        data-workbench-initial-focus={tab.id === "overview" ? "true" : undefined}
        onClick={() => selectTab(tab.id)}
        onKeyDown={(event) => onTabKeyDown(event,index)}
        key={tab.id}
      ><span>{tab.number}</span><div><strong>{tab.title}</strong><small>{tab.copy}</small></div></button>)}</div>

      <div id={`showcase-workbench-${handoff.id}-panel-overview`} role="tabpanel" aria-labelledby={`showcase-workbench-${handoff.id}-tab-overview`} hidden={activeTab !== "overview"}>
        <div className="tech-detail-grid"><article><span>01</span><h3>Implementation</h3><ul>{handoff.stack.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>02</span><h3>Behaviour</h3><ul>{handoff.behaviour.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>03</span><h3>Accessibility</h3><ul>{handoff.accessibility.map((item) => <li key={item}>{item}</li>)}</ul></article><article><span>04</span><h3>Package & dependencies</h3><ul>{handoff.dependencies.map((item) => <li key={item}>{item}</li>)}<li>{handoff.completeArchiveHref ? `${handoff.sourceAssets.length} relevant files are highlighted here; the download contains the complete local import graph.` : `${handoff.sourceAssets.length} source/setup files plus example data and a typed contract.`}</li></ul></article></div>
      </div>

      <div id={`showcase-workbench-${handoff.id}-panel-component`} role="tabpanel" aria-labelledby={`showcase-workbench-${handoff.id}-tab-component`} hidden={activeTab !== "component"}>
        <div className="tech-workbench"><aside aria-label="Complete component source files" style={{maxHeight:510,overflowY:"auto"}}><p>SOURCE & SETUP FILES</p>{handoff.sourceAssets.map((asset) => <button type="button" className={activeAsset?.name === asset.name ? "active" : ""} aria-pressed={activeAsset?.name === asset.name} onClick={() => { setActiveAssetName(asset.name); setCopiedKey(""); setAnnouncement(`${asset.name} selected.`); }} key={asset.name}><span>{asset.language.toUpperCase()}</span><div><strong>{asset.name}</strong><small>{asset.detail}</small></div></button>)}<div><small>PACKAGE STATUS</small><span><i /> {sourceErrors[activeAsset?.name ?? ""] ? "Source package available" : sourceReady ? "Ready to reuse" : "Loading source"}</span></div></aside>{renderCodePanel("component")}</div>
      </div>

      <div id={`showcase-workbench-${handoff.id}-panel-data`} role="tabpanel" aria-labelledby={`showcase-workbench-${handoff.id}-tab-data`} hidden={activeTab !== "data"}>
        <div className="tech-workbench"><aside aria-label="Example data file"><p>REPRESENTATIVE DATA</p><button type="button" className="active"><span>JSON</span><div><strong>{handoff.example.name}</strong><small>Replaceable fixture</small></div></button><div><small>STATUS</small><span><i /> Valid JSON fixture</span></div></aside>{renderCodePanel("data")}</div>
      </div>

      <div id={`showcase-workbench-${handoff.id}-panel-api`} role="tabpanel" aria-labelledby={`showcase-workbench-${handoff.id}-tab-api`} hidden={activeTab !== "api"}>
        <div className="tech-workbench"><aside aria-label="Integration contract file"><p>PRODUCTION BOUNDARY</p><button type="button" className="active"><span>TS</span><div><strong>{handoff.contract.name}</strong><small>Typed host contract</small></div></button><div><small>STATUS</small><span><i /> Valid TypeScript contract</span></div></aside>{renderCodePanel("api")}</div>
      </div>

      <footer><span><i className="status-dot success" aria-hidden="true" /> Source, styles, setup, fixture and contract are packaged together</span><div style={{display:"flex",gap:8}}><button type="button" className="button primary" onClick={downloadCompletePackage}>Download complete package</button><button type="button" className="button secondary" onClick={onClose}>Done</button></div></footer>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  </div>;
}
