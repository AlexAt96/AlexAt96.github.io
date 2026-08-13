export type ScenarioId = "base" | "dcc-hackathon";

export type ScenarioCollection = "compass" | "tracker";

export type ScenarioRecommendation = {
  title: string;
  copy: string;
  defaultStarredPatternIds: string[];
};

export type ScenarioDefinition = {
  id: ScenarioId;
  name: string;
  shortName: string;
  description: string;
  recommendations: Record<ScenarioCollection, ScenarioRecommendation>;
  /** Compass aliases retained for callers that have not adopted collection-aware recommendations yet. */
  recommendationTitle: string;
  recommendationCopy: string;
  defaultStarredPatternIds: string[];
};

export type ScenarioReviewFinding = {
  id: string;
  initials: string;
  kind: string;
  title: string;
  subtitle: string;
  confidence: string;
  quote: string;
  source: string;
};

export type DependencyExplorerRow = {
  "Source Environment BU": string;
  "Source Environment": string;
  "Source Environment Type": string;
  Target: string;
  "Target Environment": string;
  "Target Environment Type": string;
  "Target Environment BU": string;
  Direction: "downstream" | "upstream" | "both";
};

export type DependencyExplorerLaunchPayload = {
  businessUnitName: string;
  datasetName: string;
  rows: DependencyExplorerRow[];
};

export type DccStandard = {
  id: string;
  code: string;
  name: string;
  owner: string;
  clauses: number;
  linkedDocuments: number;
  status: "Ready" | "Needs mapping" | "Draft";
  scope: string;
};

export const scenarios: Record<ScenarioId, ScenarioDefinition> = {
  base: {
    id: "base",
    name: "Base library",
    shortName: "Base",
    description: "The existing Compass and Tracker examples, unchanged.",
    recommendationTitle: "Your starred patterns",
    recommendationCopy: "Star any pattern to keep a personal shortcut at the top of this collection.",
    defaultStarredPatternIds: [],
    recommendations: {
      compass: {
        title: "Your starred patterns",
        copy: "Star any pattern to keep a personal shortcut at the top of this collection.",
        defaultStarredPatternIds: [],
      },
      tracker: {
        title: "Your starred patterns",
        copy: "Star any pattern to keep a personal shortcut at the top of this collection.",
        defaultStarredPatternIds: [],
      },
    },
  },
  "dcc-hackathon": {
    id: "dcc-hackathon",
    name: "DCC Hackathon",
    shortName: "DCC",
    description: "Documentation assurance against a reusable library of standards.",
    recommendationTitle: "Recommended for DCC documentation assurance",
    recommendationCopy: "A presenter-ready route from standards selection and document upload through AI findings, human review, relationships and the final assurance report.",
    defaultStarredPatternIds: [
      "compass-pattern-read-only-data-table",
      "upload",
      "compass-pattern-evidence-matrix",
      "compass-pattern-review-list",
      "dependencies",
      "compass-pattern-final-report",
    ],
    recommendations: {
      compass: {
        title: "Recommended for DCC documentation assurance",
        copy: "A presenter-ready route from standards selection and document upload through AI findings, human review, relationships and the final assurance report.",
        defaultStarredPatternIds: [
          "compass-pattern-read-only-data-table",
          "upload",
          "compass-pattern-evidence-matrix",
          "compass-pattern-review-list",
          "dependencies",
          "compass-pattern-final-report",
        ],
      },
      tracker: {
        title: "Recommended PoC Tracker views for DCC assurance",
        copy: "A presenter-ready route from assurance health and governed record review through source-aware AI support to the solution landscape behind the service.",
        defaultStarredPatternIds: [
          "poc-dashboard",
          "poc-workflow-workbench",
          "poc-chatbot",
          "poc-architecture-map",
        ],
      },
    },
  },
};

export const dccStandards: DccStandard[] = [
  {
    id: "iso-27001",
    code: "ISO/IEC 27001:2022",
    name: "Information security management",
    owner: "Security assurance",
    clauses: 93,
    linkedDocuments: 3,
    status: "Ready",
    scope: "Governance, risk, access, operations and supplier controls",
  },
  {
    id: "wcag-22",
    code: "WCAG 2.2 AA",
    name: "Web content accessibility",
    owner: "Accessibility lead",
    clauses: 55,
    linkedDocuments: 2,
    status: "Ready",
    scope: "Perceivable, operable, understandable and robust experiences",
  },
  {
    id: "gds-service",
    code: "GDS Service Standard",
    name: "Public service delivery",
    owner: "Service design",
    clauses: 14,
    linkedDocuments: 2,
    status: "Ready",
    scope: "User needs, service teams, security, performance and iteration",
  },
  {
    id: "nist-ai-rmf",
    code: "NIST AI RMF 1.0",
    name: "AI risk management",
    owner: "AI governance",
    clauses: 72,
    linkedDocuments: 1,
    status: "Needs mapping",
    scope: "Govern, map, measure and manage AI risk",
  },
  {
    id: "dcc-profile",
    code: "DCC Assurance Profile · HACK-01",
    name: "Hackathon documentation profile",
    owner: "DCC assurance team",
    clauses: 18,
    linkedDocuments: 3,
    status: "Draft",
    scope: "Illustrative internal checks used only for this hackathon demo",
  },
];

export const dccDocuments = [
  { id: "solution-design", name: "Customer portal solution design v0.8.docx", type: "Solution design", pages: 34, owner: "Solution architecture", updated: "06 Aug 2026" },
  { id: "threat-model", name: "Customer portal threat model v0.4.pdf", type: "Threat model", pages: 19, owner: "Cyber security", updated: "05 Aug 2026" },
  { id: "accessibility", name: "Accessibility statement draft.docx", type: "Accessibility evidence", pages: 8, owner: "Experience team", updated: "04 Aug 2026" },
] as const;

export const dccReviewFindings: ScenarioReviewFinding[] = [
  {
    id: "ownership",
    initials: "5.3",
    kind: "ISO/IEC 27001 · CLAUSE 5.3",
    title: "Security ownership is not assigned",
    subtitle: "Solution design · Governance and responsibilities",
    confidence: "0.96",
    quote: "Security responsibilities will be agreed during implementation.",
    source: "Page 9 · Operating model",
  },
  {
    id: "contrast",
    initials: "AA",
    kind: "WCAG 2.2 · 1.4.3",
    title: "Contrast evidence is missing",
    subtitle: "Accessibility statement · Visual presentation",
    confidence: "0.91",
    quote: "The final colour palette is subject to brand approval.",
    source: "Page 4 · Known limitations",
  },
  {
    id: "human-review",
    initials: "AI",
    kind: "NIST AI RMF · GOVERN 1.2",
    title: "Human assurance decision is defined",
    subtitle: "Solution design · AI-assisted assessment controls",
    confidence: "0.94",
    quote: "Every generated finding is reviewed by a named assurance lead before publication.",
    source: "Page 27 · Assurance workflow",
  },
  {
    id: "evidence-link",
    initials: "H1",
    kind: "DCC PROFILE · EVIDENCE H1",
    title: "Two controls have no evidence link",
    subtitle: "Threat model · Control traceability",
    confidence: "0.88",
    quote: "Monitoring and recovery controls are planned; supporting evidence is to be added.",
    source: "Page 16 · Residual actions",
  },
];

/**
 * The existing dependency explorer accepts rows through its launch payload.
 * Keeping the scenario at this adapter boundary means Base and DCC execute the
 * same visualiser code; only the records loaded by it change.
 */
export const dccDependencyExplorerLaunchKey = "dcc-hackathon-assurance";

export const dccDependencyExplorerPayload: DependencyExplorerLaunchPayload = {
  businessUnitName: "DCC Assurance",
  datasetName: "DCC standards and documentation relationships",
  rows: [
    { "Source Environment BU":"Standards library", "Source Environment":"ISO/IEC 27001", "Source Environment Type":"Standard", Target:"Assures against", "Target Environment":"Solution Design v0.8", "Target Environment Type":"Document", "Target Environment BU":"Document library", Direction:"downstream" },
    { "Source Environment BU":"Standards library", "Source Environment":"ISO/IEC 27001", "Source Environment Type":"Standard", Target:"Assures against", "Target Environment":"Threat Model v0.4", "Target Environment Type":"Document", "Target Environment BU":"Document library", Direction:"downstream" },
    { "Source Environment BU":"Standards library", "Source Environment":"WCAG 2.2 AA", "Source Environment Type":"Standard", Target:"Assures against", "Target Environment":"Solution Design v0.8", "Target Environment Type":"Document", "Target Environment BU":"Document library", Direction:"downstream" },
    { "Source Environment BU":"Document library", "Source Environment":"Solution Design v0.8", "Source Environment Type":"Document", Target:"Scanned in", "Target Environment":"Assurance Run #018", "Target Environment Type":"Assurance run", "Target Environment BU":"Review workspace", Direction:"downstream" },
    { "Source Environment BU":"Document library", "Source Environment":"Threat Model v0.4", "Source Environment Type":"Document", Target:"Scanned in", "Target Environment":"Assurance Run #018", "Target Environment Type":"Assurance run", "Target Environment BU":"Review workspace", Direction:"downstream" },
    { "Source Environment BU":"Review workspace", "Source Environment":"Assurance Run #018", "Source Environment Type":"Assurance run", Target:"Reviewed by", "Target Environment":"Assurance Review", "Target Environment Type":"Human decision", "Target Environment BU":"Decision register", Direction:"downstream" },
  ],
};

export function cloneDefaultStarredPatterns(collection: ScenarioCollection = "compass"): Record<ScenarioId, string[]> {
  return {
    base: [...scenarios.base.recommendations[collection].defaultStarredPatternIds],
    "dcc-hackathon": [...scenarios["dcc-hackathon"].recommendations[collection].defaultStarredPatternIds],
  };
}

export function cloneDefaultStarredPatternsByCollection(): Record<ScenarioCollection, Record<ScenarioId, string[]>> {
  return {
    compass: cloneDefaultStarredPatterns("compass"),
    tracker: cloneDefaultStarredPatterns("tracker"),
  };
}
