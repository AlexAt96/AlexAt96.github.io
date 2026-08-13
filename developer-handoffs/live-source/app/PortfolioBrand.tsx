import Link from "next/link";
import { portfolioHref } from "./portfolioRoutes";

type PortfolioBrandProps = {
  className?: string;
  section: string;
  href?: string;
};

export function PortfolioMark({ className = "" }: { className?: string }) {
  return (
    <span className={`${className} aa-brand-mark`.trim()} aria-hidden="true">
      <b>A</b>
      <b>A</b>
      <i />
    </span>
  );
}

export function PortfolioBanner({ className = "" }: { className?: string }) {
  return (
    <section className={`${className} aa-portfolio-cover`.trim()} aria-label="AA Portfolio introduction">
      <div className="aa-cover-grid" aria-hidden="true" />
      <header className="aa-cover-header">
        <span><b>AA</b> PORTFOLIO</span>
        <span>FIELD NOTE / 001</span>
        <span><i /> NORTHERN-MADE</span>
      </header>
      <div className="aa-cover-body">
        <div className="aa-cover-copy">
          <p>PRINCIPAL TECHNOLOGIST</p>
          <h1>Alex Atkinson.</h1>
          <span className="aa-cover-tagline">Puzzles <em>&amp;</em> vibes.</span>
        </div>
        <aside className="aa-cover-method" aria-label="How Alex works">
          <p>Leading teams, joining up ideas and finding the useful answer hiding behind the obvious one.</p>
          <ol>
            <li><i>01</i><span>Question</span></li>
            <li><i>02</i><span>Connect</span></li>
            <li><i>03</i><span>Make</span></li>
          </ol>
        </aside>
      </div>
      <footer className="aa-cover-footer">
        <span>MCR / LANCASHIRE / LIVERPOOL / WIRRAL</span>
        <strong>Clever stuff. Done properly.</strong>
        <em>Try the interesting answer.</em>
      </footer>
    </section>
  );
}

export default function PortfolioBrand({
  className = "",
  section,
  href = portfolioHref,
}: PortfolioBrandProps) {
  return (
    <Link
      className={`${className} aa-brand-lockup`.trim()}
      href={href}
      aria-label={`AA Portfolio · Alex Atkinson · Principal Technologist · Puzzles & vibes · ${section}`}
    >
      <PortfolioMark />
      <span className="aa-brand-copy">
        <strong>Alex Atkinson</strong>
        <small>Principal technologist</small>
        <em>Puzzles &amp; vibes. · {section}</em>
      </span>
    </Link>
  );
}
