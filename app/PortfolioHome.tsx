import Link from "next/link";
import PortfolioBrand from "./PortfolioBrand";

const collections = [
  {
    number:"01",
    key:"compass",
    eyebrow:"Architecture systems",
    title:"Migration Compass",
    line:"Complex decisions, properly joined up.",
    copy:"Evidence-led patterns for discovery, review, system mapping and migration planning.",
    href:"/?system=compass",
    tags:["Architecture", "Evidence", "Decisions"],
  },
  {
    number:"02",
    key:"tracker",
    eyebrow:"Product delivery",
    title:"PoC Tracker",
    line:"Delivery made visible.",
    copy:"Interactive product experiences for dependencies, gated routes, ownership and demo readiness.",
    href:"/?system=tracker",
    tags:["Planning", "Workflow", "Delivery"],
  },
  {
    number:"03",
    key:"components",
    eyebrow:"Interface systems",
    title:"Individual Components",
    line:"Small parts. Strong systems.",
    copy:"A reusable catalogue of interface primitives, working states and production-minded patterns.",
    href:"/components",
    tags:["UI", "Patterns", "Accessibility"],
  },
  {
    number:"04",
    key:"methods",
    eyebrow:"AI-assisted delivery",
    title:"Agent Methods",
    line:"Useful AI. Enough governance.",
    copy:"Practical methods for leading AI-enabled work across teams, controls and delivery stages.",
    href:"/methods",
    tags:["AI", "Leadership", "Governance"],
  },
  {
    number:"05",
    key:"library",
    eyebrow:"Complete catalogue",
    title:"Component & Pattern Library",
    line:"Every part. Properly connected.",
    copy:"Browse every implementation-level component and the reusable patterns behind each project from one searchable index.",
    href:"/library",
    tags:["96 components", "Project patterns", "Searchable"],
  },
] as const;

const strengths = [
  "Technology strategy",
  "Team leadership",
  "Critical thinking",
  "Systems design",
  "Product & UI",
  "AI delivery",
  "Entrepreneurial thinking",
] as const;

export default function PortfolioHome() {
  return (
    <div className="portfolio-home">
      <aside className="portfolio-home-rail" aria-label="Portfolio navigation">
        <PortfolioBrand section="AA Portfolio" />
        <nav>
          <a href="#top"><span>00</span>Introduction</a>
          <a href="#selected-work"><span>01</span>Selected work</a>
          <a href="#approach"><span>02</span>Approach</a>
          <a href="#about"><span>03</span>About</a>
        </nav>
        <div className="portfolio-home-rail-note">
          <small>NORTHERN-MADE</small>
          <strong>Clever stuff.<br />Done properly.</strong>
          <span>Manchester / Lancashire<br />Liverpool / The Wirral</span>
        </div>
      </aside>

      <main id="top">
        <header className="portfolio-home-topbar">
          <span><b>AA</b> PORTFOLIO / FIELD NOTE 001</span>
          <nav aria-label="Portfolio sections">
            <a href="#selected-work">Work</a>
            <a href="#approach">Approach</a>
            <a href="#about">About</a>
          </nav>
          <Link href="/?system=compass">Enter the showrooms <span aria-hidden="true">↗</span></Link>
        </header>

        <section className="portfolio-home-hero" aria-labelledby="portfolio-title">
          <div className="portfolio-home-grid" aria-hidden="true" />
          <div className="portfolio-home-hero-copy">
            <p>PRINCIPAL TECHNOLOGIST</p>
            <h1 id="portfolio-title">Alex<br />Atkinson.</h1>
            <h2>Puzzles <em>&amp;</em> vibes.</h2>
            <div className="portfolio-home-intro">
              <strong>Leading teams. Connecting systems. Finding the useful answer.</strong>
              <p>I work across technology, product and delivery—questioning the obvious, joining up the complicated bits and helping good people make good things.</p>
            </div>
            <div className="portfolio-home-actions">
              <a href="#selected-work">See the work <span aria-hidden="true">↓</span></a>
              <a href="#about">The tidy explanation <span aria-hidden="true">↘</span></a>
            </div>
          </div>

          <aside className="portfolio-home-method" aria-label="Alex's working method">
            <header><span>HOW THE WORK GETS DONE</span><b>NOT TO SCALE</b></header>
            <ol>
              <li><i>01</i><div><strong>Question it</strong><span>Critical thinking</span></div></li>
              <li><i>02</i><div><strong>Join it up</strong><span>Systems + people</span></div></li>
              <li><i>03</i><div><strong>Make it useful</strong><span>Delivery + craft</span></div></li>
            </ol>
            <blockquote>“Try the sensible answer. Then try the interesting one.”</blockquote>
            <footer><span>THE ORGANISED VERSION</span><b>PUZZLES → PEOPLE → PRODUCTS</b></footer>
          </aside>
        </section>

        <section className="portfolio-home-work" id="selected-work" aria-labelledby="selected-work-title">
          <header>
            <div><p>SELECTED WORK / FIVE WAYS IN</p><h2 id="selected-work-title">Pick a puzzle.</h2></div>
            <p>Each collection has its own character. The thinking behind them is the same: clear systems, useful interfaces and work that survives contact with reality.</p>
          </header>
          <div className="portfolio-home-collections">
            {collections.map((collection) => (
              <Link className={`portfolio-home-card portfolio-home-card-${collection.key}`} href={collection.href} key={collection.key} style={collection.key === "library" ? {gridColumn:"1 / -1"} : undefined}>
                <header><span>{collection.number}</span><small>{collection.eyebrow}</small><b aria-hidden="true">↗</b></header>
                <div><h3>{collection.title}</h3><strong>{collection.line}</strong><p>{collection.copy}</p></div>
                <footer>{collection.tags.map((tag) => <span key={tag}>{tag}</span>)}</footer>
              </Link>
            ))}
          </div>
        </section>

        <section className="portfolio-home-approach" id="approach" aria-labelledby="approach-title">
          <div>
            <p>THE WORKING PRINCIPLE</p>
            <h2 id="approach-title">Question it.<br />Connect it.<br /><em>Make it useful.</em></h2>
          </div>
          <div>
            <blockquote>The clever bit is rarely the point. The point is making the complicated thing understandable, useful and possible to deliver.</blockquote>
            <ol>
              <li><span>01</span><strong>Think critically</strong><p>Challenge the brief, find the real constraint and ask the question everyone politely stepped around.</p></li>
              <li><span>02</span><strong>Lead the whole system</strong><p>Bring technology, people, product and delivery into the same conversation.</p></li>
              <li><span>03</span><strong>Make something real</strong><p>Turn good thinking into decisions, interfaces and working outcomes.</p></li>
            </ol>
          </div>
        </section>

        <section className="portfolio-home-about" id="about" aria-labelledby="about-title">
          <header><p>ABOUT / THE SHORT VERSION</p><h2 id="about-title">Principal technologist is the tidy title.</h2></header>
          <div className="portfolio-home-about-grid">
            <p><strong>Puzzles and vibes</strong> is the practical version: leading teams, thinking across disciplines, spotting patterns, creating momentum and knowing when a slightly different answer is the better one.</p>
            <div>{strengths.map((strength,index) => <span key={strength}><i>{String(index + 1).padStart(2,"0")}</i>{strength}</span>)}</div>
          </div>
          <footer><span>MANCHESTER → LANCASHIRE → LIVERPOOL → THE WIRRAL</span><strong>Different on purpose.</strong></footer>
        </section>

        <footer className="portfolio-home-footer">
          <PortfolioBrand section="Puzzles & vibes" />
          <span>Alex Atkinson · Principal Technologist</span>
          <a href="#top">Back to the top ↑</a>
        </footer>
      </main>
    </div>
  );
}
