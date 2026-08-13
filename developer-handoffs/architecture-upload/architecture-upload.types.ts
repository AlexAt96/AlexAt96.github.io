import type { ReactNode } from "react";

export const ARCHITECTURE_UPLOAD_STEPS = [
  "environments",
  "documents",
  "review",
  "confirm",
] as const;

export type ArchitectureUploadStep = (typeof ARCHITECTURE_UPLOAD_STEPS)[number];
export type FindingDecision = "pending" | "approved" | "declined";
export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export interface EnvironmentOption {
  id: string;
  value: string;
  icon: string;
  label: string;
  detail: string;
}

export interface EvidenceFile {
  /** A host-generated stable identifier, not the browser's local path. */
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
}

export interface ArchitectureFinding {
  id: string;
  initials: string;
  kind: string;
  title: string;
  subtitle: string;
  /** A value between 0 and 1. */
  confidence: number;
  quote: string;
  source: string;
}

export interface ArchitectureUploadCopy {
  title: string;
  subtitle: string;
  runLabel: string;
  runId: string;
  processedStatus: string;
  draftStatus: string;
  stepLabels: Record<ArchitectureUploadStep, string>;
  environmentTitle: string;
  environmentDescription: string;
  documentTitle: string;
  documentDescription: string;
  documentTypeLabel: string;
  uploadIdleLabel: string;
  uploadHint: string;
  fileReadyLabel: string;
  reviewTitle: string;
  reviewDescription: string;
  reviewFileMeta: string;
  reviewSummary: string;
  evidenceSource: string;
  confirmTitle: string;
  confirmDescription: string;
  readyLabel: string;
  successTitle: string;
  completeIdleLabel: string;
  completeDoneLabel: string;
}

export interface ArchitectureUploadInitialState {
  step?: ArchitectureUploadStep;
  environmentIds?: string[];
  documentType?: string;
  file?: EvidenceFile | null;
  decisions?: Partial<Record<string, FindingDecision>>;
  activeFindingId?: string;
  completed?: boolean;
}

export interface ArchitectureUploadSnapshot {
  step: ArchitectureUploadStep;
  environmentIds: string[];
  documentType: string;
  file: EvidenceFile | null;
  decisions: Record<string, FindingDecision>;
  activeFindingId: string;
  completed: boolean;
}

export interface FindingActionContext {
  finding: ArchitectureFinding;
  decision: FindingDecision;
  snapshot: ArchitectureUploadSnapshot;
}

export interface DecisionChangeContext extends FindingActionContext {
  previousDecision: FindingDecision;
}

export interface ArchitectureUploadWizardProps {
  environments: EnvironmentOption[];
  documentTypes: string[];
  findings: ArchitectureFinding[];
  copy: ArchitectureUploadCopy;
  initialState?: ArchitectureUploadInitialState;
  accept?: string;
  maxFileSizeBytes?: number;
  loading?: boolean;
  error?: string | null;
  readOnly?: boolean;
  className?: string;
  headerAccessory?: ReactNode;
  /** Called for every user-driven snapshot change. */
  onStateChange?: (snapshot: ArchitectureUploadSnapshot) => void;
  onStepChange?: (step: ArchitectureUploadStep, snapshot: ArchitectureUploadSnapshot) => void;
  onEnvironmentChange?: (environmentIds: string[], snapshot: ArchitectureUploadSnapshot) => void;
  onDocumentTypeChange?: (documentType: string, snapshot: ArchitectureUploadSnapshot) => void;
  /** `nativeFile` is provided only for a newly selected browser File. */
  onFileChange?: (
    file: EvidenceFile | null,
    nativeFile: File | null,
    snapshot: ArchitectureUploadSnapshot,
  ) => void | EvidenceFile | Promise<void | EvidenceFile>;
  onDecisionChange?: (context: DecisionChangeContext) => void;
  onEditFinding?: (context: FindingActionContext) => void;
  onRequestEvidence?: (context: FindingActionContext) => void;
  onComplete?: (
    snapshot: ArchitectureUploadSnapshot,
  ) => void | { id?: string } | Promise<void | { id?: string }>;
}
