import type { ArchitectureUploadStep, FindingDecision } from "./architecture-upload.types";

/**
 * Transport shapes for a typical REST/GraphQL boundary. These types deliberately
 * contain primitives only, so no browser File or React state leaks into the API.
 */
export interface ArchitectureUploadBootstrapResponse {
  run: {
    id: string;
    projectName: string;
    status: "draft" | "processing" | "review-ready" | "complete";
  };
  environments: Array<{
    id: string;
    name: string;
    description: string;
    shortCode?: string;
  }>;
  documentTypes: Array<{ id: string; label: string }>;
  evidence?: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    lastModified?: number;
  } | null;
  draft?: {
    step: ArchitectureUploadStep;
    environmentIds: string[];
    documentTypeId: string;
  };
  findings: Array<{
    id: string;
    category: string;
    title: string;
    context: string;
    confidence: number;
    excerpt: string;
    sourceLabel: string;
    decision?: FindingDecision;
  }>;
}

export interface ArchitectureUploadDraftRequest {
  runId: string;
  step: ArchitectureUploadStep;
  environmentIds: string[];
  documentTypeId: string;
  evidenceId: string | null;
  decisions: Array<{ findingId: string; decision: FindingDecision }>;
}

export interface ArchitectureUploadCompletionRequest
  extends Omit<ArchitectureUploadDraftRequest, "step"> {
  approvedFindingIds: string[];
  declinedFindingIds: string[];
}

export interface ArchitectureUploadCompletionResponse {
  scopeId: string;
  runId: string;
  status: "complete";
  createdRecordIds: string[];
}

/** Implement this port with fetch, Apollo, React Query, a server action, etc. */
export interface ArchitectureUploadAdapter {
  load(signal?: AbortSignal): Promise<ArchitectureUploadBootstrapResponse>;
  uploadEvidence(
    file: File,
    context: { runId: string; documentTypeId: string },
    signal?: AbortSignal,
  ): Promise<NonNullable<ArchitectureUploadBootstrapResponse["evidence"]>>;
  saveDraft(request: ArchitectureUploadDraftRequest, signal?: AbortSignal): Promise<void>;
  complete(
    request: ArchitectureUploadCompletionRequest,
    signal?: AbortSignal,
  ): Promise<ArchitectureUploadCompletionResponse>;
}

export const ARCHITECTURE_UPLOAD_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.drawio,.doc,.docx,.xls,.xlsx,.txt,.md";

export const ARCHITECTURE_UPLOAD_MAX_FILE_SIZE = 25 * 1024 * 1024;

export function assertArchitectureUploadBootstrap(
  value: unknown,
): asserts value is ArchitectureUploadBootstrapResponse {
  if (!value || typeof value !== "object") {
    throw new TypeError("Architecture upload bootstrap must be an object.");
  }

  const response = value as Partial<ArchitectureUploadBootstrapResponse>;
  if (!response.run?.id || !response.run.projectName) {
    throw new TypeError("Architecture upload bootstrap is missing run metadata.");
  }
  if (!Array.isArray(response.environments) || !response.environments.length) {
    throw new TypeError("Architecture upload bootstrap requires environments.");
  }
  if (!Array.isArray(response.documentTypes) || !response.documentTypes.length) {
    throw new TypeError("Architecture upload bootstrap requires document types.");
  }
  if (!Array.isArray(response.findings) || !response.findings.length) {
    throw new TypeError("Architecture upload bootstrap requires review findings.");
  }
}
