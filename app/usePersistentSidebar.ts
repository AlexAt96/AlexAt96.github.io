"use client";

import { useEffect, useState } from "react";

const SIDEBAR_STORAGE_KEY = "architecture-component-library-sidebar";

export function usePersistentSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed");
    });
    const syncSidebar = (event:StorageEvent) => {
      if (event.key === SIDEBAR_STORAGE_KEY) setCollapsed(event.newValue === "collapsed");
    };
    window.addEventListener("storage", syncSidebar);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", syncSidebar);
    };
  }, []);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".library-nav nav");
    if (!nav) return;
    const sidebar = nav.closest<HTMLElement>(".library-nav");

    let links:HTMLAnchorElement[] = [];
    let sections:Array<{ link:HTMLAnchorElement; section:HTMLElement }> = [];
    let activeId = "";
    let frame = 0;

    const collectSections = () => {
      links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
      sections = links.flatMap((link) => {
        const id = decodeURIComponent(link.getAttribute("href")?.slice(1) ?? "");
        const section = id ? document.getElementById(id) : null;
        return section ? [{ link, section }] : [];
      });
      nav.dataset.scrollspy = sections.length ? "ready" : "empty";
      updateNavigation();
    };

    const updateNavigation = () => {
      if (!sections.length) return;
      const readingLine = Math.min(window.innerHeight * .28, 190);
      let current = sections[0];
      sections.forEach((candidate) => {
        if (candidate.section.getBoundingClientRect().top <= readingLine) current = candidate;
      });

      links.forEach((link) => {
        const selected = link === current.link;
        link.dataset.current = selected ? "true" : "false";
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      const firstLink = sections[0].link;
      const lastLink = sections[sections.length - 1].link;
      const navRect = nav.getBoundingClientRect();
      const dotCentre = (link:HTMLAnchorElement) => link.getBoundingClientRect().top - navRect.top + nav.scrollTop + link.offsetHeight / 2;
      const firstDot = dotCentre(firstLink);
      const lastDot = dotCentre(lastLink);
      const currentDot = dotCentre(current.link);
      nav.style.setProperty("--rail-start", `${firstDot}px`);
      nav.style.setProperty("--rail-height", `${Math.max(0,lastDot - firstDot)}px`);
      nav.style.setProperty("--rail-active", `${Math.max(0,currentDot - firstDot)}px`);
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const documentProgress = available > 0 ? Math.min(1,Math.max(0,window.scrollY / available)) : 0;
      sidebar?.style.setProperty("--document-progress", `${(documentProgress * 100).toFixed(2)}vh`);

      if (activeId === current.section.id) return;
      activeId = current.section.id;
      const linkTop = current.link.offsetTop;
      const linkBottom = linkTop + current.link.offsetHeight;
      const visibleTop = nav.scrollTop + 30;
      const visibleBottom = nav.scrollTop + nav.clientHeight - 30;
      if (linkTop < visibleTop || linkBottom > visibleBottom) {
        nav.scrollTo({
          top:Math.max(0,linkTop - nav.clientHeight * .4),
          behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }
    };

    const queueUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateNavigation);
    };
    const observer = new MutationObserver(collectSections);
    observer.observe(nav,{ childList:true, subtree:true });
    collectSections();
    window.addEventListener("scroll",queueUpdate,{ passive:true });
    window.addEventListener("resize",queueUpdate);
    window.addEventListener("hashchange",queueUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll",queueUpdate);
      window.removeEventListener("resize",queueUpdate);
      window.removeEventListener("hashchange",queueUpdate);
    };
  }, []);

  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY,next ? "collapsed" : "expanded");
      return next;
    });
  }

  return { collapsed, toggle };
}
