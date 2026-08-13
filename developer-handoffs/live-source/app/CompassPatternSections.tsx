"use client";

import { useRef, useState } from "react";
import {
  compassPatterns,
  compassPatternSourceFiles,
  type CompassPattern,
} from "./foundation/patternCatalogue";
import CompassPatternWorkbench from "./CompassPatternWorkbench";
import { TemplatePreview } from "./foundation/templates/TemplatePreview";
import {
  ActionButton,
  Badge,
  Segmented,
} from "./foundation/templates/shared";
import type { DemoMode } from "./foundation/templates/types";
import type { ScenarioId } from "./scenarios";
import styles from "./CompassPatternSections.module.css";
import { sitePath } from "./site-paths";

const modeOptions: readonly { value: DemoMode; label: string }[] = [
  { value: "default", label: "Interactive" },
  { value: "empty", label: "Validation / empty" },
  { value: "readonly", label: "Read-only / complete" },
];

export type CompassPatternSectionsProps = {
  /** Number shown on the first section. The Compass showroom starts after patterns 06 and 07. */
  startNumber?: number;
  className?: string;
  /** Lets the showroom replace the built-in implementation-contract dialog. */
  onOpenTechnical?: (pattern: CompassPattern) => void;
  scenarioId?: ScenarioId;
  starredPatternIds?: string[];
  onToggleStar?: (patternId: string) => void;
};

type CompassPatternSectionProps = {
  pattern: CompassPattern;
  number: number;
  onOpenTechnical?: (pattern: CompassPattern) => void;
  scenarioId: ScenarioId;
  starred: boolean;
  onToggleStar?: (patternId: string) => void;
};

function CompassPatternSection({ pattern, number, onOpenTechnical, scenarioId, starred, onToggleStar }: CompassPatternSectionProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DemoMode>("default");
  const [resetToken, setResetToken] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const sourceHref = sitePath(`/reusable-component-foundation/showroom-templates/${compassPatternSourceFiles[pattern.templateKey]}`);
  const sectionNumber = String(number).padStart(2, "0");
  const headingId = `compass-pattern-${pattern.id}-title`;
  const stablePatternId = `compass-pattern-${pattern.id}`;

  function openTechnical() {
    if (onOpenTechnical) {
      onOpenTechnical(pattern);
      return;
    }
    setTechnicalOpen(true);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement === previewRef.current) {
      void document.exitFullscreen();
      return;
    }
    void previewRef.current?.requestFullscreen().catch(() => undefined);
  }

  function changeMode(value: DemoMode) {
    setMode(value);
    setResetToken((token) => token + 1);
  }

  return <section
    className={`content-section pattern-section ${styles.section}`}
    id={`compass-pattern-${pattern.id}`}
    data-compass-pattern={pattern.id}
    data-template-key={pattern.templateKey}
    data-component-boundaries={pattern.boundaries.join("|")}
    aria-labelledby={headingId}
  >
    <div className="section-heading">
      <p className="eyebrow">{`${sectionNumber} · COMPASS PATTERN`}</p>
      <h2 id={headingId}>{pattern.title}</h2>
      <p>{pattern.summary}</p>
    </div>

    <div className="component-actions" aria-label={`${pattern.title} pattern controls`}>
      <div>
        <span aria-hidden="true">◇</span>
        <p><small>INTERACTIVE PATTERN</small><strong>{pattern.title}</strong></p>
      </div>
      <div>
        {onToggleStar && <button className={`pattern-star-button ${starred ? "active" : ""}`} type="button" aria-pressed={starred} onClick={() => onToggleStar(stablePatternId)} aria-label={`${starred ? "Remove" : "Add"} ${pattern.title} ${starred ? "from" : "to"} ${scenarioId === "dcc-hackathon" ? "DCC Hackathon recommendations" : "starred patterns"}`}>
          <span aria-hidden="true">{starred ? "★" : "☆"}</span><span>{starred ? "Recommended" : "Star pattern"}</span>
        </button>}
        <button className="fullscreen-pattern-button" type="button" onClick={toggleFullscreen} aria-label={`View ${pattern.title} full screen`}>
          ⛶ <span>Full screen</span>
        </button>
        <button className="tech-details-button" type="button" onClick={openTechnical} aria-label={`Technical details for ${pattern.title}`}>
          ⌘ <span>Tech details</span>
        </button>
        <a className="download-code-button" href={sourceHref} download aria-label={`Download source for ${pattern.title}`}>
          ↓ <span>Download code</span>
        </a>
      </div>
    </div>

    <div ref={previewRef} className={`pattern-frame pattern-fullscreen-target ${styles.previewFrame}`} data-preview-mode={mode}>
      <button className="fullscreen-exit-control" type="button" onClick={toggleFullscreen} aria-label={`Exit ${pattern.title} full screen`}>
        ↙ Exit full screen <kbd>Esc</kbd>
      </button>

      <div className="frame-toolbar"><div><i /><i /><i /></div><span>{pattern.title}</span><b>Interactive preview</b></div>

      <div className={styles.demoToolbar}>
        <div>
          <small>Demo state</small>
          <Segmented value={mode} options={modeOptions} onChange={changeMode} label={`Choose ${pattern.title} demo state`} />
        </div>
        <div>
          <Badge tone="good">Interactive</Badge>
          <span>Changes stay in this preview</span>
          <ActionButton onClick={() => setResetToken((token) => token + 1)}>Reset demo</ActionButton>
        </div>
      </div>

      <div className={styles.canvas}>
        <div className={styles.previewSurface}>
          <TemplatePreview
            key={`${pattern.templateKey}-${scenarioId}-${mode}-${resetToken}`}
            templateKey={pattern.templateKey}
            mode={mode}
            resetToken={resetToken}
            scenarioId={scenarioId}
          />
        </div>
      </div>

    </div>

    {technicalOpen && <CompassPatternWorkbench pattern={pattern} onClose={() => setTechnicalOpen(false)} />}
  </section>;
}

export function CompassPatternSections({
  startNumber = 8,
  className = "",
  onOpenTechnical,
  scenarioId = "base",
  starredPatternIds = [],
  onToggleStar,
}: CompassPatternSectionsProps) {
  return <div id="compass-template-library" className={`${styles.sections} ${className}`} data-compass-pattern-sections>
    {compassPatterns.map((pattern, index) => <CompassPatternSection
      key={pattern.id}
      pattern={pattern}
      number={startNumber + index}
      onOpenTechnical={onOpenTechnical}
      scenarioId={scenarioId}
      starred={starredPatternIds.includes(`compass-pattern-${pattern.id}`)}
      onToggleStar={onToggleStar}
    />)}
  </div>;
}

export default CompassPatternSections;
