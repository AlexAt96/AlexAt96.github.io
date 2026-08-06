"use client";

import { useEffect, useState } from "react";

export type ClassicBlueprintItem = {
  id: "foundations" | "controls" | "workflow" | "source";
  number: string;
  title: string;
  description: string;
  focus: string;
  highlights: string[];
};

export default function ClassicBlueprintHero({ label, items, status }: { label:string; items:ClassicBlueprintItem[]; status:string }) {
  const [focus, setFocus] = useState<ClassicBlueprintItem["id"]>(items[0]?.id ?? "foundations");
  const [overview, setOverview] = useState(false);
  const [paused, setPaused] = useState(false);
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === focus));
  const active = items[activeIndex] ?? items[0];

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      if (!overview) { setOverview(true); return; }
      setFocus(items[(activeIndex + 1) % items.length].id);
      setOverview(false);
    }, overview ? 1050 : 3900);
    return () => window.clearTimeout(timer);
  }, [activeIndex, items, overview, paused]);

  if (!active) return null;

  const activate = (id:ClassicBlueprintItem["id"]) => {
    setFocus(id);
    setOverview(false);
    setPaused(true);
  };

  return <aside className="blueprint-carousel classic-blueprint-carousel" aria-label={`${label} carousel`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <header><span><i /> {label.toUpperCase()}</span><b>{overview ? "OVERVIEW" : `${String(activeIndex + 1).padStart(2,"0")} / ${String(items.length).padStart(2,"0")}`}</b></header>
    <div className="blueprint-viewport" data-focus={focus} data-camera={overview ? "overview" : "detail"}>
      <div className="blueprint-ruler blueprint-ruler-x" aria-hidden="true" /><div className="blueprint-ruler blueprint-ruler-y" aria-hidden="true" />
      <div className="blueprint-canvas">
        {items.map((item) => <button className={`blueprint-zone blueprint-${item.id}`} onMouseEnter={() => activate(item.id)} onFocus={() => activate(item.id)} onClick={() => activate(item.id)} aria-label={`Focus ${item.title}`} key={item.id}>
          <span className="blueprint-zone-label"><b>{item.number}</b> {item.title.toUpperCase()}</span>
          <strong>{item.focus}</strong>
          {item.id === "foundations" && <><p>{item.description}</p><div>{item.highlights.slice(0,4).map((highlight,highlightIndex) => <span key={highlight}><i>{String(highlightIndex + 1).padStart(2,"0")}</i>{highlight}</span>)}</div></>}
          {item.id === "controls" && <><div className="blueprint-mini-input"><i>⌕</i><span>{item.description}</span><kbd>/</kbd></div><div className="blueprint-control-demo">{item.highlights.slice(0,4).map((highlight,highlightIndex) => <span className={highlightIndex === 0 ? "primary" : highlightIndex === 2 ? "status" : highlightIndex === 3 ? "toggle" : ""} key={highlight}>{highlightIndex > 1 && <i />}{highlight}</span>)}</div></>}
          {item.id === "workflow" && <><p>{item.description}</p><div className="blueprint-flow-demo">{item.highlights.slice(0,4).map((highlight,highlightIndex) => <span className={highlightIndex < 2 ? "complete" : highlightIndex === 2 ? "active" : ""} key={highlight}><i>{highlightIndex < 2 ? "✓" : highlightIndex + 1}</i><b>{highlight}</b></span>)}</div></>}
          {item.id === "source" && <><p>{item.description}</p><div className="blueprint-mini-file"><span><i /><i /><i /></span><b>{item.highlights[0] ?? "Component.tsx"}</b><em>TSX</em></div><code><span><i>01</i><b>export function</b> Pattern() &#123;</span><span><i>02</i>&nbsp;&nbsp;<em>const</em> state = usePattern();</span><span><i>03</i>&nbsp;&nbsp;<b>return</b> &lt;WorkingView /&gt;;</span><span><i>04</i>&#125;</span></code></>}
        </button>)}
      </div>
      <div className="blueprint-focus-label" aria-live="polite"><span>{overview ? "00" : active.number}</span><div><small>{overview ? "SYSTEM OVERVIEW" : active.title.toUpperCase()}</small><strong>{overview ? `One system, ${items.length} reusable layers` : active.focus}</strong><ul aria-label={`${active.title} capabilities`}>{(overview ? items.map((item) => item.title) : active.highlights).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div></div>
    </div>
    <nav aria-label={`Choose ${label.toLowerCase()} area`}>{items.map((item) => <button className={focus === item.id ? "active" : ""} aria-pressed={focus === item.id} onMouseEnter={() => activate(item.id)} onFocus={() => activate(item.id)} onClick={() => activate(item.id)} key={item.id}><span>{item.number}</span><div><strong>{item.title}</strong><small>{item.description}</small></div></button>)}</nav>
    <footer><span><i /> INTERACTIVE OVERVIEW</span><div>{items.map((item) => <i className={focus === item.id ? "active" : ""} key={item.id} />)}</div><b>{status}</b></footer>
  </aside>;
}
