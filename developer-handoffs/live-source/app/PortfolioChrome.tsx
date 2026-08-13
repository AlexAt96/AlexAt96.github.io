"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PortfolioMark } from "./PortfolioBrand";
import { portfolioHref, showroomHref, type ShowroomId } from "./portfolioRoutes";

export type { ShowroomId } from "./portfolioRoutes";

const showrooms = [
  { id:"compass", number:"01", label:"Migration Compass", className:"compass-choice" },
  { id:"tracker", number:"02", label:"PoC Tracker", className:"tracker-choice" },
  { id:"components", number:"03", label:"Individual Components", className:"generic-choice" },
  { id:"methods", number:"04", label:"Agent Methods", className:"agent-choice" },
  { id:"library", number:"05", label:"Library", className:"library-choice" },
] as const;

export function TopbarIdentity({ section, detail = "Puzzles & vibes." }: { section:string; detail?:string }) {
  return (
    <Link
      className="breadcrumb aa-topbar-identity"
      href={portfolioHref}
      aria-label="Alex Atkinson · Principal Technologist · Puzzles & vibes · Home"
      title={`${section} · ${detail}`}
    >
      <PortfolioMark className="aa-topbar-identity__mark" />
      <span className="aa-topbar-identity__copy">
        <small className="aa-topbar-identity__role">PRINCIPAL TECHNOLOGIST</small>
        <strong className="aa-topbar-identity__name">ALEX ATKINSON</strong>
        <em className="aa-topbar-identity__signature">
          <span>PUZZLES &amp; VIBES.</span>
          <b aria-hidden="true"> / </b>
          <span className="aa-topbar-identity__section">{section}</span>
        </em>
      </span>
    </Link>
  );
}

export function ShowroomTitle({ section, detail = "Puzzles & vibes." }: { section:string; detail?:string }) {
  return (
    <Link
      className="breadcrumb aa-showroom-title"
      href={portfolioHref}
      aria-label={`AA Portfolio · ${section} · Home`}
      title={`${section} · ${detail}`}
    >
      <span>AA Portfolio</span><b aria-hidden="true">/</b><strong>{section}</strong>
    </Link>
  );
}

export function ShowroomSwitcher({ active, scenarioId, className = "" }: { active:ShowroomId; scenarioId?:string; className?:string }) {
  const pathname = usePathname();
  const activeIndex = showrooms.findIndex((showroom) => showroom.id === active);
  return (
    <nav className={`${className} system-switch aa-showroom-switcher`.trim()} aria-label="Choose library collection · Alex Atkinson showrooms" data-aa-active-showroom-index={activeIndex}>
      <Link className="aa-showroom-switcher__brand" href={portfolioHref} aria-label="Alex Atkinson portfolio home">
        <b>AA</b><span>Portfolio</span>
      </Link>
      {showrooms.map((showroom) => (
        <Link
          className={`${showroom.className} ${active === showroom.id ? "active" : ""}`.trim()}
          href={showroomHref(showroom.id,scenarioId)}
          aria-current={active === showroom.id && pathname === showroomHref(showroom.id,scenarioId).split("?")[0] ? "page" : undefined}
          data-aa-showroom-id={showroom.id}
          data-aa-showroom-index={showrooms.findIndex((item) => item.id === showroom.id)}
          data-aa-showroom-label={showroom.label}
          key={showroom.id}
        >
          <small>{showroom.number}</small><i /><span>{showroom.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function RetroThemeSwitch({ dark, onToggle, className = "" }: { dark:boolean; onToggle:() => void; className?:string }) {
  return (
    <button
      className={`${className} method-theme-toggle aa-retro-theme-switch`.trim()}
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      aria-pressed={dark}
    >
      <span className="method-theme-toggle__label aa-retro-theme-switch__label">LIGHT</span>
      <span className="method-theme-toggle__track aa-retro-theme-switch__track" aria-hidden="true"><i /></span>
      <span className="method-theme-toggle__label aa-retro-theme-switch__label">DARK</span>
      <small aria-hidden="true">AA / LIGHTING</small>
    </button>
  );
}
