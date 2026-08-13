"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PortfolioBrand from "./PortfolioBrand";
import { showroomHref } from "./portfolioRoutes";

const collections = [
  {
    number:"01",
    key:"compass",
    eyebrow:"Architecture systems",
    title:"Migration Compass",
    line:"For when the estate has become folklore.",
    copy:"Evidence-led patterns for discovery, review, system mapping and migration planning.",
    href:showroomHref("compass"),
    tags:["Architecture", "Evidence", "Decisions"],
  },
  {
    number:"02",
    key:"tracker",
    eyebrow:"Product delivery",
    title:"PoC Tracker",
    line:"For when ‘nearly there’ needs evidence.",
    copy:"Interactive product experiences for dependencies, gated routes, ownership and demo readiness.",
    href:showroomHref("tracker"),
    tags:["Planning", "Workflow", "Delivery"],
  },
  {
    number:"03",
    key:"components",
    eyebrow:"Interface systems",
    title:"Individual Components",
    line:"The small bits, behaving themselves.",
    copy:"A reusable catalogue of interface primitives, working states and production-minded patterns.",
    href:"/components",
    tags:["UI", "Patterns", "Accessibility"],
  },
  {
    number:"04",
    key:"methods",
    eyebrow:"AI-assisted delivery",
    title:"Agent Methods",
    line:"AI, with an adult in the room.",
    copy:"Practical methods for leading AI-enabled work across teams, controls and delivery stages.",
    href:"/methods",
    tags:["AI", "Leadership", "Governance"],
  },
  {
    number:"05",
    key:"library",
    eyebrow:"Complete catalogue",
    title:"Component & Pattern Library",
    line:"Everything in one place. No scavenger hunt.",
    copy:"Browse every implementation-level component and the reusable patterns behind each project from one searchable index.",
    href:"/library",
    tags:["96 components", "Project patterns", "Searchable"],
  },
] as const;

const strengths = [
  "Lead teams",
  "Untangle systems",
  "Shape products",
  "Design interfaces",
  "Build AI methods",
  "Start things",
  "Land things",
] as const;

const portfolioSections = ["top", "role", "selected-work", "approach", "about"] as const;

function HeroMachine() {
  return (
    <aside className="portfolio-home-machine" aria-label="Alex's working model: question, connect and make">
      <header><span>HOW I WORK</span><b>01—03</b></header>
      <div className="portfolio-home-machine-aa" aria-hidden="true">P&amp;V</div>
      <ol className="portfolio-home-machine-route">
        <li><i>01</i><strong>Question</strong><small>Find the real problem</small></li>
        <li><i>02</i><strong>Connect</strong><small>Join people and systems</small></li>
        <li><i>03</i><strong>Make</strong><small>Land something useful</small></li>
      </ol>
      <footer><span>PUZZLES &amp; VIBES</span><b>NO THEATRE REQUIRED</b></footer>
    </aside>
  );
}

export default function PortfolioHome() {
  const [activeSection,setActiveSection] = useState<(typeof portfolioSections)[number]>("top");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const readingLine = Math.min(window.innerHeight * .3,190);
        let current:(typeof portfolioSections)[number] = "top";
        portfolioSections.forEach((id) => {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= readingLine) current = id;
        });
        setActiveSection(current);
      });
    };
    update();
    window.addEventListener("scroll",update,{ passive:true });
    window.addEventListener("resize",update);
    window.addEventListener("hashchange",update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",update);
      window.removeEventListener("resize",update);
      window.removeEventListener("hashchange",update);
    };
  },[]);

  return (
    <div className="portfolio-home" data-aa-active-showroom-index="-1">
      <aside className="portfolio-home-rail" aria-label="Portfolio navigation">
        <PortfolioBrand section="AA Portfolio" />
        <nav>
          <a href="#top" aria-current={activeSection === "top" ? "location" : undefined}><span>00</span>Introduction</a>
          <a href="#role" aria-current={activeSection === "role" ? "location" : undefined}><span>01</span>The tidy title</a>
          <a href="#selected-work" aria-current={activeSection === "selected-work" ? "location" : undefined}><span>02</span>Selected work</a>
          <a href="#approach" aria-current={activeSection === "approach" ? "location" : undefined}><span>03</span>Approach</a>
          <a href="#about" aria-current={activeSection === "about" ? "location" : undefined}><span>04</span>Range</a>
        </nav>
        <div className="portfolio-home-rail-note">
          <small>NORTH-WEST MADE</small>
          <strong>Questionable assumptions.<br />Useful answers.</strong>
          <span>Manchester / Lancashire<br />Liverpool / The Wirral</span>
        </div>
      </aside>

      <main id="top">
        <header className="portfolio-home-topbar">
          <span><b>AA</b> ALEX ATKINSON / WORKING NOTES 001</span>
          <nav aria-label="Portfolio sections">
            <a href="#selected-work">Work</a>
            <a href="#approach">Approach</a>
            <a href="#about">About</a>
          </nav>
          <Link href={showroomHref("compass")} data-aa-showroom-id="compass" data-aa-showroom-index="0" data-aa-showroom-label="Migration Compass">Enter the showrooms <span aria-hidden="true">↗</span></Link>
        </header>

        <section className="portfolio-home-hero" aria-labelledby="portfolio-title">
          <div className="portfolio-home-grid" aria-hidden="true" />
          <div className="portfolio-home-hero-copy">
            <p className="portfolio-home-kicker">NORTH-WEST MADE <i /> DRAWN, TESTED, REDRAWN</p>
            <h1 id="portfolio-title"><span>Alex</span><span>Atkinson.</span></h1>
            <p className="portfolio-home-hero-lede">I sort out complicated things with good people. Usually by asking the slightly awkward question first.</p>
            <div className="portfolio-home-actions">
              <a href="#selected-work">Have a nosey <span aria-hidden="true">↓</span></a>
              <a href="#role">The tidy explanation <span aria-hidden="true">↘</span></a>
            </div>
            <small className="portfolio-home-scroll-note">NEXT / THE FORMAL JOB TITLE</small>
          </div>
          <HeroMachine />
        </section>

        <section className="portfolio-home-role" id="role" aria-labelledby="role-title">
          <header><p>01 / THE TIDY TITLE</p><h2 id="role-title">Principal<br />Technologist.</h2></header>
          <div className="portfolio-home-role-copy">
            <h3>Puzzles <em>&amp;</em> vibes.</h3>
            <p>That means leading teams through the knotty bit: making sense of systems, shaping products, testing ideas and turning a roomful of opinions into something useful.</p>
            <blockquote>Part engineering. Part design. Part delivery. Part “hang on, what are we actually trying to do?”</blockquote>
            <strong>Broad by trade. Specific when it matters.</strong>
          </div>
        </section>

        <section className="portfolio-home-work" id="selected-work" aria-labelledby="selected-work-title">
          <header>
            <div><p>02 / SELECTED WORK</p><h2 id="selected-work-title">Things I’ve made to make other things easier.</h2></div>
            <p>Five showrooms. Different outfits, same habit: make the complex bit understandable, discussable and useful.</p>
          </header>
          <div className="portfolio-home-collections">
            {collections.map((collection,index) => (
              <Link className={`portfolio-home-card portfolio-home-card-${collection.key}`} href={collection.href} data-aa-showroom-id={collection.key} data-aa-showroom-index={index} data-aa-showroom-label={collection.title} key={collection.key} style={collection.key === "library" ? {gridColumn:"1 / -1"} : undefined}>
                <header><span>{collection.number}</span><small>{collection.eyebrow}</small><b aria-hidden="true">↗</b></header>
                <div><h3>{collection.title}</h3><strong>{collection.line}</strong><p>{collection.copy}</p></div>
                <footer>{collection.tags.map((tag) => <span key={tag}>{tag}</span>)}</footer>
              </Link>
            ))}
          </div>
        </section>

        <section className="portfolio-home-approach" id="approach" aria-labelledby="approach-title">
          <div>
            <p>03 / THE WORKING PRINCIPLE</p>
            <h2 id="approach-title">Ask the awkward<br />question.<br /><em>Then make it real.</em></h2>
          </div>
          <div>
            <blockquote>Most problems improve when someone finds the real question, gets the right people round it and makes the next move obvious. That’s broadly the job.</blockquote>
            <ol>
              <li><span>01</span><strong>Question properly</strong><p>Challenge the brief, find the real constraint and ask what everyone politely stepped around.</p></li>
              <li><span>02</span><strong>Join the whole thing up</strong><p>Bring technology, people, product and delivery into the same conversation.</p></li>
              <li><span>03</span><strong>Land something useful</strong><p>Turn the thinking into decisions, interfaces and working outcomes.</p></li>
            </ol>
          </div>
        </section>

        <section className="portfolio-home-about" id="about" aria-labelledby="about-title">
          <header><p>04 / A USEFUL AMOUNT OF RANGE</p><h2 id="about-title">The interesting problems tend to ignore the org chart.</h2></header>
          <div className="portfolio-home-about-grid">
            <p>I work across strategy, systems, product, teams and delivery. Not because disciplines don’t matter. Because the knotty bits usually live <strong>between them.</strong></p>
            <div>{strengths.map((strength,index) => <span key={strength}><i>{String(index + 1).padStart(2,"0")}</i>{strength}</span>)}</div>
          </div>
          <footer><span>MANCHESTER → LANCASHIRE → LIVERPOOL → THE WIRRAL</span><strong>North-west made. Elsewhere compatible.</strong></footer>
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
