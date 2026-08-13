"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const navigationTimeoutMs = 4000;
const millisecondsPerShowroom = 430;

const showrooms = [
  { id:"compass", number:"01", label:"Migration Compass", note:"Evidence-led architecture", accent:"#ef3156" },
  { id:"tracker", number:"02", label:"PoC Tracker", note:"Visible delivery and planning", accent:"#8b7bff" },
  { id:"components", number:"03", label:"Individual Components", note:"Reusable interface parts", accent:"#29c9c3" },
  { id:"methods", number:"04", label:"Agent Methods", note:"Practical AI delivery", accent:"#5e93ff" },
  { id:"library", number:"05", label:"Library", note:"The complete working index", accent:"#ffd34e" },
] as const;

type PendingNavigation = {
  animation:Animation;
  destination:string;
  label:string;
  timer:number;
  toRouteKey:string;
};

function currentRouteKey() {
  return `${window.location.pathname}${window.location.search}`;
}

export default function ShowroomPanController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<PendingNavigation | null>(null);
  const [announcement,setAnnouncement] = useState("");

  const clearJourney = useCallback((pending:PendingNavigation | null = pendingRef.current) => {
    if (pending) {
      window.clearTimeout(pending.timer);
      pending.animation.cancel();
    }
    pendingRef.current = null;
    delete document.documentElement.dataset.aaShowroomPanState;
    delete document.documentElement.dataset.aaShowroomPanDirection;
    const overlay = overlayRef.current;
    const track = trackRef.current;
    if (overlay) {
      overlay.hidden = true;
      overlay.removeAttribute("data-active");
      overlay.removeAttribute("data-phase");
      overlay.setAttribute("aria-hidden","true");
    }
    if (track) track.style.removeProperty("transform");
  },[]);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || pending.toRouteKey !== currentRouteKey()) return;

    window.clearTimeout(pending.timer);
    setAnnouncement(`Now viewing ${pending.label}`);
    const overlay = overlayRef.current;
    if (overlay) overlay.dataset.phase = "arrived";
    pending.timer = window.setTimeout(() => clearJourney(pending),240);
  },[clearJourney,routeKey]);

  useEffect(() => {
    function handleShowroomClick(event:MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const clicked = event.target;
      if (!(clicked instanceof Element)) return;
      const anchor = clicked.closest<HTMLAnchorElement>("a[data-aa-showroom-id]");
      if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return;

      const nav = anchor.closest<HTMLElement>("[data-aa-active-showroom-index]");
      const fromIndex = Number(nav?.dataset.aaActiveShowroomIndex);
      const toIndex = Number(anchor.dataset.aaShowroomIndex);
      if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex) || fromIndex === toIndex) return;

      const href = new URL(anchor.href,window.location.href);
      if (href.origin !== window.location.origin) return;
      if (href.pathname === window.location.pathname && href.search === window.location.search) return;

      const destination = `${href.pathname}${href.search}${href.hash}`;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        event.preventDefault();
        router.push(destination);
        return;
      }

      event.preventDefault();
      if (pendingRef.current) return;

      const overlay = overlayRef.current;
      const track = trackRef.current;
      if (!overlay || !track) {
        router.push(destination);
        return;
      }

      const direction = toIndex > fromIndex ? "forward" : "backward";
      const distance = Math.abs(toIndex - fromIndex);
      const duration = Math.min(1900,Math.max(620,distance * millisecondsPerShowroom));
      const label = anchor.dataset.aaShowroomLabel ?? anchor.textContent?.trim() ?? "showroom";

      router.prefetch(destination);
      document.documentElement.dataset.aaShowroomPanState = "journey";
      document.documentElement.dataset.aaShowroomPanDirection = direction;
      overlay.hidden = false;
      overlay.dataset.active = "true";
      overlay.dataset.phase = "travelling";
      overlay.setAttribute("aria-hidden","false");
      track.style.transform = `translate3d(${-fromIndex * 100}vw,0,0)`;

      const animation = track.animate(
        [
          { transform:`translate3d(${-fromIndex * 100}vw,0,0)` },
          { transform:`translate3d(${-toIndex * 100}vw,0,0)` },
        ],
        { duration, easing:"cubic-bezier(.72,0,.18,1)", fill:"forwards" },
      );
      const pending:PendingNavigation = {
        animation,
        destination,
        label,
        timer:0,
        toRouteKey:`${href.pathname}${href.search}`,
      };
      pendingRef.current = pending;
      setAnnouncement(`Moving ${direction === "forward" ? "forward" : "back"} through ${distance} showroom${distance === 1 ? "" : "s"} to ${label}`);

      void animation.finished.then(() => {
        if (pendingRef.current !== pending) return;
        overlay.dataset.phase = "routing";
        router.push(destination);
        pending.timer = window.setTimeout(() => {
          if (pendingRef.current !== pending) return;
          clearJourney(pending);
          window.location.assign(destination);
        },navigationTimeoutMs);
      }).catch(() => undefined);
    }

    document.addEventListener("click",handleShowroomClick,true);
    return () => {
      document.removeEventListener("click",handleShowroomClick,true);
      clearJourney();
    };
  },[clearJourney,router]);

  return (
    <>
      <div className="aa-showroom-journey" ref={overlayRef} aria-hidden="true" hidden>
        <div className="aa-showroom-journey__track" ref={trackRef}>
          {showrooms.map((showroom,index) => (
            <article className="aa-showroom-journey__screen" style={{"--aa-journey-accent":showroom.accent} as CSSProperties} key={showroom.id}>
              <header><span><b>AA</b> PORTFOLIO</span><strong>{showroom.label}</strong><em>{showroom.number} / 05</em></header>
              <div className="aa-showroom-journey__body">
                <aside><b>AA</b><small>CURRENT SHOWROOM</small><strong>{showroom.label}</strong><i /><i /><i /><i /></aside>
                <main>
                  <small>{showroom.number} · MOVING THROUGH THE SHOWROOMS</small>
                  <h2>{showroom.label}</h2>
                  <p>{showroom.note}</p>
                  <div>{[0,1,2,3,4,5].map((item) => <span key={item} />)}</div>
                </main>
              </div>
              <footer><span>{showrooms.map((item,itemIndex) => <i className={itemIndex === index ? "active" : ""} key={item.id} />)}</span><b>{showroom.note}</b></footer>
            </article>
          ))}
        </div>
      </div>
      <span className="aa-showroom-pan-announcement" aria-live="polite" aria-atomic="true">{announcement}</span>
    </>
  );
}
