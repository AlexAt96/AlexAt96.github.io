import {
  assertArchitectureUploadBootstrap,
  type ArchitectureUploadBootstrapResponse,
  type ArchitectureUploadCompletionRequest,
  type ArchitectureUploadDraftRequest,
} from "./architecture-upload.contract";
import type {
  ArchitectureFinding,
  ArchitectureUploadInitialState,
  ArchitectureUploadSnapshot,
  EnvironmentOption,
  EvidenceFile,
  FindingDecision,
} from "./architecture-upload.types";

export interface ArchitectureUploadViewModel {
  runId: string;
  projectName: string;
  environments: EnvironmentOption[];
  documentTypes: string[];
  documentTypeIds: Record<string, string>;
  findings: ArchitectureFinding[];
  initialState: ArchitectureUploadInitialState;
}

export function fileToEvidenceFile(file: File): EvidenceFile {
  return {
    id: `${file.name}:${file.size}:${file.lastModified}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  };
}

export function apiEvidenceToEvidenceFile(
  evidence: NonNullable<ArchitectureUploadBootstrapResponse["evidence"]>,
): EvidenceFile {
  return {
    id: evidence.id,
    name: evidence.name,
    size: evidence.size,
    type: evidence.mimeType,
    lastModified: evidence.lastModified,
  };
}

export function toArchitectureUploadViewModel(
  input: unknown,
): ArchitectureUploadViewModel {
  assertArchitectureUploadBootstrap(input);
  const response: ArchitectureUploadBootstrapResponse = input;

  const decisions = Object.fromEntries(
    response.findings.map((finding) => [finding.id, finding.decision ?? "pending"]),
  ) as Record<string, FindingDecision>;

  return {
    runId: response.run.id,
    projectName: response.run.projectName,
    environments: response.environments.map((environment) => ({
      id: environment.id,
      value: environment.id,
      icon: environment.shortCode ?? makeInitials(environment.name),
      label: environment.name,
      detail: environment.description,
    })),
    documentTypes: response.documentTypes.map((documentType) => documentType.label),
    documentTypeIds: Object.fromEntries(
      response.documentTypes.map((documentType) => [documentType.label, documentType.id]),
    ),
    findings: response.findings.map((finding) => ({
      id: finding.id,
      initials: makeInitials(finding.title),
      kind: finding.category,
      title: finding.title,
      subtitle: finding.context,
      confidence: clampConfidence(finding.confidence),
      quote: finding.excerpt,
      source: finding.sourceLabel,
    })),
    initialState: {
      step: response.draft?.step ?? (response.evidence ? "review" : "environments"),
      environmentIds:
        response.draft?.environmentIds.filter((id) =>
          response.environments.some((environment) => environment.id === id),
        ) ?? [],
      documentType:
        response.documentTypes.find(
          (documentType) => documentType.id === response.draft?.documentTypeId,
        )?.label ?? response.documentTypes[0]?.label ?? "",
      file: response.evidence ? apiEvidenceToEvidenceFile(response.evidence) : null,
      decisions,
      activeFindingId: response.findings[0]?.id,
      completed: response.run.status === "complete",
    },
  };
}

export function toDraftRequest(
  runId: string,
  snapshot: ArchitectureUploadSnapshot,
  documentTypeIds: Record<string, string>,
): ArchitectureUploadDraftRequest {
  return {
    runId,
    step: snapshot.step,
    environmentIds: [...snapshot.environmentIds],
    documentTypeId: documentTypeIds[snapshot.documentType] ?? snapshot.documentType,
    evidenceId: snapshot.file?.id ?? null,
    decisions: Object.entries(snapshot.decisions).map(([findingId, decision]) => ({
      findingId,
      decision,
    })),
  };
}

export function toCompletionRequest(
  runId: string,
  snapshot: ArchitectureUploadSnapshot,
  documentTypeIds: Record<string, string>,
): ArchitectureUploadCompletionRequest {
  const draft = toDraftRequest(runId, snapshot, documentTypeIds);
  const approvedFindingIds: string[] = [];
  const declinedFindingIds: string[] = [];

  for (const [findingId, decision] of Object.entries(snapshot.decisions)) {
    if (decision === "approved") approvedFindingIds.push(findingId);
    if (decision === "declined") declinedFindingIds.push(findingId);
  }

  return { ...draft, approvedFindingIds, declinedFindingIds };
}

function makeInitials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function clampConfidence(confidence: number): number {
  if (!Number.isFinite(confidence)) return 0;
  return Math.min(1, Math.max(0, confidence));
}
