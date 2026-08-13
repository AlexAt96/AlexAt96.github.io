import type {
  ArchitectureFinding,
  ArchitectureUploadCopy,
  ArchitectureUploadInitialState,
  EnvironmentOption,
} from "./architecture-upload.types";

export const architectureEnvironments: EnvironmentOption[] = [
  {
    id: "production",
    value: "production",
    icon: "PR",
    label: "Production",
    detail: "Retail Production",
  },
  {
    id: "pre-production",
    value: "pre-production",
    icon: "PP",
    label: "Pre-production",
    detail: "Retail Pre-production",
  },
  {
    id: "development",
    value: "development",
    icon: "DE",
    label: "Development",
    detail: "Retail Development",
  },
  {
    id: "disaster-recovery",
    value: "disaster-recovery",
    icon: "DR",
    label: "Disaster recovery",
    detail: "Retail Disaster recovery",
  },
];

export const architectureDocumentTypes = [
  "Architecture and data flow diagram",
  "Integration catalogue",
  "Technology inventory",
];

export const architectureFindings: ArchitectureFinding[] = [
  {
    id: "apim",
    initials: "AZ",
    kind: "Suggested technology",
    title: "Azure API Management",
    subtitle: "Integration gateway · Production",
    confidence: 0.94,
    quote:
      "All northbound service traffic is routed through Azure API Management using managed identities.",
    source: "Page 7 · integration layer",
  },
  {
    id: "salesforce",
    initials: "SF",
    kind: "External connection",
    title: "Salesforce CRM",
    subtitle: "Customer system · Bidirectional",
    confidence: 0.88,
    quote:
      "Customer and opportunity updates are synchronised with Salesforce every fifteen minutes.",
    source: "Page 11 · external services",
  },
  {
    id: "datalake",
    initials: "DL",
    kind: "Suggested technology",
    title: "Azure Data Lake",
    subtitle: "Analytics platform · Production",
    confidence: 0.91,
    quote:
      "Order and fulfilment events are retained in the enterprise data lake for reporting.",
    source: "Page 14 · data platform",
  },
];

export const architectureUploadCopy: ArchitectureUploadCopy = {
  title: "Architecture intake",
  subtitle: "Retail Modernisation",
  runLabel: "UPLOAD RUN",
  runId: "ARC-2026-018",
  processedStatus: "Processing complete",
  draftStatus: "Draft in progress",
  stepLabels: {
    environments: "Environments",
    documents: "Documents",
    review: "AI review",
    confirm: "Confirm scope",
  },
  environmentTitle: "Select target environments",
  environmentDescription:
    "Choose one or more workspaces represented by this evidence.",
  documentTitle: "Add architecture evidence",
  documentDescription:
    "Group the upload by document purpose and attach an example file.",
  documentTypeLabel: "Document type",
  uploadIdleLabel: "Drop a file here or browse",
  uploadHint: "PDF, image, Draw.io, Office, or text evidence · 25MB maximum",
  fileReadyLabel: "Ready for review",
  reviewTitle: "Review suggested records",
  reviewDescription:
    "Every generated finding remains a suggestion until you decide.",
  reviewFileMeta: "18 pages · OCR completed in 42s",
  reviewSummary: "92% confidence",
  evidenceSource: "Source: OCR + labels",
  confirmTitle: "Confirm scope additions",
  confirmDescription:
    "Approved findings are ready to create or match scope records.",
  readyLabel: "Ready to add",
  successTitle: "Scope updated",
  completeIdleLabel: "Add approved records",
  completeDoneLabel: "Records added",
};

export const architectureUploadInitialState: ArchitectureUploadInitialState = {
  step: "environments",
  environmentIds: ["production"],
  documentType: architectureDocumentTypes[0],
  file: {
    id: "evidence-current-state-v4",
    name: "current-state-architecture-v4.pdf",
    size: 2_480_341,
    type: "application/pdf",
  },
  decisions: Object.fromEntries(
    architectureFindings.map((finding) => [finding.id, "pending" as const]),
  ),
  activeFindingId: architectureFindings[0].id,
  completed: false,
};

