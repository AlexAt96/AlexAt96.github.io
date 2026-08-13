"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const fallbackExitMs = 260;
const fallbackEnterMs = 520;
const navigationTimeoutMs = 4000;

type PanDirection = "forward" | "backward";

type BrowserViewTransition = {
  finished:Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update:() => void | Promise<void>) => BrowserViewTransition;
};

type PendingNavigation = {
  direction:PanDirection;
  fromRouteKey:string;
  toRouteKey:string;
  label:string;
  resolveRoute:() => void;
  fallback:boolean;
  timer:number;
};

function clearPanState() {
  delete document.documentElement.dataset.aaShowroomPanDirection;
  delete document.documentElement.dataset.aaShowroomPanState;
}

export default function ShowroomPanController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const pendingRef = useRef<PendingNavigation | null>(null);
  const [announcement,setAnnouncement] = useState("");

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    const currentRouteKey = `${window.location.pathname}${window.location.search}`;
    if (pending.fromRouteKey === currentRouteKey) return;

    pending.resolveRoute();
    if (pending.toRouteKey !== currentRouteKey) {
      window.clearTimeout(pending.timer);
      pendingRef.current = null;
      clearPanState();
      return;
    }

    setAnnouncement(`Now viewing ${pending.label}`);

    if (pending.fallback) {
      document.documentElement.dataset.aaShowroomPanState = `enter-${pending.direction}`;
      window.clearTimeout(pending.timer);
      pending.timer = window.setTimeout(() => {
        if (pendingRef.current !== pending) return;
        pendingRef.current = null;
        clearPanState();
      },fallbackEnterMs);
    }
  },[routeKey]);

  useEffect(() => {
    function finish(pending:PendingNavigation) {
      if (pendingRef.current !== pending) return;
      window.clearTimeout(pending.timer);
      pendingRef.current = null;
      clearPanState();
    }

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
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (href.pathname === window.location.pathname && href.search === window.location.search) return;

      if (pendingRef.current) {
        finish(pendingRef.current);
        return;
      }
      event.preventDefault();

      const direction:PanDirection = toIndex > fromIndex ? "forward" : "backward";
      const label = anchor.dataset.aaShowroomLabel ?? anchor.textContent?.trim() ?? "showroom";
      const destination = href.href;
      let resolveRoute = () => {};
      const routeReady = new Promise<void>((resolve) => { resolveRoute = resolve; });
      const documentWithTransitions = document as ViewTransitionDocument;
      const fallback = typeof documentWithTransitions.startViewTransition !== "function";
      const pending:PendingNavigation = {
        direction,
        fromRouteKey:`${window.location.pathname}${window.location.search}`,
        toRouteKey:`${href.pathname}${href.search}`,
        label,
        resolveRoute,
        fallback,
        timer:0,
      };

      pendingRef.current = pending;
      document.documentElement.dataset.aaShowroomPanDirection = direction;

      if (!fallback && documentWithTransitions.startViewTransition) {
        document.documentElement.dataset.aaShowroomPanState = "running";
        try {
          const transition = documentWithTransitions.startViewTransition(async () => {
            try {
              router.push(destination);
            } catch {
              window.location.assign(destination);
              return;
            }
            await routeReady;
          });
          pending.timer = window.setTimeout(() => {
            if (pendingRef.current !== pending) return;
            pending.resolveRoute();
            finish(pending);
            window.location.assign(destination);
          },navigationTimeoutMs);
          void transition.finished.then(() => finish(pending),() => finish(pending));
        } catch {
          finish(pending);
          window.location.assign(destination);
        }
        return;
      }

      document.documentElement.dataset.aaShowroomPanState = `exit-${direction}`;
      pending.timer = window.setTimeout(() => {
        try {
          router.push(destination);
        } catch {
          finish(pending);
          window.location.assign(destination);
          return;
        }
        pending.timer = window.setTimeout(() => {
          if (pendingRef.current !== pending) return;
          finish(pending);
          if (`${window.location.pathname}${window.location.search}` !== pending.toRouteKey) window.location.assign(destination);
        },navigationTimeoutMs);
      },fallbackExitMs);
    }

    document.addEventListener("click",handleShowroomClick,true);
    return () => {
      document.removeEventListener("click",handleShowroomClick,true);
      const pending = pendingRef.current;
      if (pending) window.clearTimeout(pending.timer);
      pendingRef.current = null;
      clearPanState();
    };
  },[router]);

  return <span className="aa-showroom-pan-announcement" aria-live="polite" aria-atomic="true">{announcement}</span>;
}
