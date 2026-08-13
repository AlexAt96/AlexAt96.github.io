"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import styles from "./ArchitectureUploadWizard.module.css";
import { fileToEvidenceFile } from "./architecture-upload.adapter";
import {
  ARCHITECTURE_UPLOAD_ACCEPT,
  ARCHITECTURE_UPLOAD_MAX_FILE_SIZE,
} from "./architecture-upload.contract";
import {
  ARCHITECTURE_UPLOAD_STEPS,
  type ArchitectureFinding,
  type ArchitectureUploadSnapshot,
  type ArchitectureUploadStep,
  type ArchitectureUploadWizardProps,
  type FindingDecision,
} from "./architecture-upload.types";
import { StatusDot } from "./StatusDot";

const STEP_NUMBER: Record<ArchitectureUploadStep, number> = {
  environments: 1,
  documents: 2,
  review: 3,
  confirm: 4,
};

export function ArchitectureUploadWizard({
  environments,
  documentTypes,
  findings,
  copy,
  initialState,
  accept = ARCHITECTURE_UPLOAD_ACCEPT,
  maxFileSizeBytes = ARCHITECTURE_UPLOAD_MAX_FILE_SIZE,
  loading = false,
  error = null,
  readOnly = false,
  className,
  headerAccessory,
  onStateChange,
  onStepChange,
  onEnvironmentChange,
  onDocumentTypeChange,
  onFileChange,
  onDecisionChange,
  onEditFinding,
  onRequestEvidence,
  onComplete,
}: ArchitectureUploadWizardProps) {
  const instanceId = useId().replaceAll(":", "");
  const [snapshot, setSnapshot] = useState<ArchitectureUploadSnapshot>(() =>
    createInitialSnapshot(findings, environments, documentTypes, initialState),
  );
  const snapshotRef = useRef(snapshot);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"file" | "complete" | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = loading || pendingAction !== null;
  const visibleError = error || localError;
  const currentStepNumber = STEP_NUMBER[snapshot.step];
  const currentFinding =
    findings.find((finding) => finding.id === snapshot.activeFindingId) ?? findings[0];
  const reviewedCount = Object.values(snapshot.decisions).filter(
    (decision) => decision !== "pending",
  ).length;
  const approvedFindings = findings.filter(
    (finding) => snapshot.decisions[finding.id] === "approved",
  );
  const declinedCount = Object.values(snapshot.decisions).filter(
    (decision) => decision === "declined",
  ).length;

  function commit(next: ArchitectureUploadSnapshot) {
    snapshotRef.current = next;
    setSnapshot(next);
    onStateChange?.(next);
  }

  function changeStep(step: ArchitectureUploadStep) {
    if (busy || step === snapshotRef.current.step) return;
    setLocalError(null);
    const next = { ...snapshotRef.current, step };
    commit(next);
    onStepChange?.(step, next);
  }

  function toggleEnvironment(environmentId: string) {
    if (busy || readOnly) return;
    const current = snapshotRef.current;
    const environmentIds = current.environmentIds.includes(environmentId)
      ? current.environmentIds.filter((id) => id !== environmentId)
      : [...current.environmentIds, environmentId];
    const next = { ...current, environmentIds, completed: false };
    commit(next);
    onEnvironmentChange?.(environmentIds, next);
  }

  function changeDocumentType(event: ChangeEvent<HTMLSelectElement>) {
    if (busy || readOnly) return;
    const documentType = event.currentTarget.value;
    const next = { ...snapshotRef.current, documentType, completed: false };
    commit(next);
    onDocumentTypeChange?.(documentType, next);
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    if (busy || readOnly) return;
    const nativeFile = event.currentTarget.files?.[0] ?? null;
    if (!nativeFile) return;

    if (!isFileAccepted(nativeFile, accept)) {
      setLocalError(`${nativeFile.name} is not an accepted evidence format (${accept}).`);
      event.currentTarget.value = "";
      return;
    }

    if (nativeFile.size > maxFileSizeBytes) {
      setLocalError(
        `${nativeFile.name} is ${formatBytes(nativeFile.size)}. The maximum size is ${formatBytes(maxFileSizeBytes)}.`,
      );
      event.currentTarget.value = "";
      return;
    }

    setLocalError(null);
    const previousFile = snapshotRef.current.file;
    const file = fileToEvidenceFile(nativeFile);
    const next = { ...snapshotRef.current, file, completed: false };
    commit(next);

    if (!onFileChange) return;
    setPendingAction("file");
    try {
      const persistedFile = await onFileChange(file, nativeFile, next);
      if (persistedFile) {
        commit({ ...snapshotRef.current, file: persistedFile, completed: false });
      }
    } catch (reason) {
      commit({ ...snapshotRef.current, file: previousFile, completed: false });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLocalError(toErrorMessage(reason, "The evidence file could not be uploaded."));
    } finally {
      setPendingAction(null);
    }
  }

  async function removeFile() {
    if (busy || readOnly) return;
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    const previousFile = snapshotRef.current.file;
    const next = { ...snapshotRef.current, file: null, completed: false };
    commit(next);

    if (!onFileChange) return;
    setPendingAction("file");
    try {
      await onFileChange(null, null, next);
    } catch (reason) {
      commit({ ...snapshotRef.current, file: previousFile, completed: false });
      setLocalError(toErrorMessage(reason, "The evidence file could not be removed."));
    } finally {
      setPendingAction(null);
    }
  }

  function selectFinding(findingId: string) {
    if (busy || findingId === snapshotRef.current.activeFindingId) return;
    commit({ ...snapshotRef.current, activeFindingId: findingId });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % findings.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + findings.length) % findings.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = findings.length - 1;
    }

    if (nextIndex === null || !findings[nextIndex]) return;
    event.preventDefault();
    selectFinding(findings[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  function setDecision(finding: ArchitectureFinding, decision: FindingDecision) {
    if (busy || readOnly) return;
    const current = snapshotRef.current;
    const previousDecision = current.decisions[finding.id] ?? "pending";
    const decisions = { ...current.decisions, [finding.id]: decision };
    const next = { ...current, decisions, completed: false };
    commit(next);
    onDecisionChange?.({
      finding,
      decision,
      previousDecision,
      snapshot: next,
    });
  }

  function invokeFindingAction(
    finding: ArchitectureFinding,
    action: ArchitectureUploadWizardProps["onEditFinding"] | ArchitectureUploadWizardProps["onRequestEvidence"],
  ) {
    if (busy || readOnly || !action) return;
    action({
      finding,
      decision: snapshotRef.current.decisions[finding.id] ?? "pending",
      snapshot: snapshotRef.current,
    });
  }

  function continueForward() {
    const current = snapshotRef.current;
    if (busy) return;
    if (current.step === "environments" && current.environmentIds.length === 0) {
      setLocalError("Select at least one environment before continuing.");
      return;
    }
    if (current.step === "documents" && !current.file) {
      setLocalError("Attach an evidence file before continuing.");
      return;
    }
    const nextIndex = Math.min(
      ARCHITECTURE_UPLOAD_STEPS.length - 1,
      ARCHITECTURE_UPLOAD_STEPS.indexOf(current.step) + 1,
    );
    changeStep(ARCHITECTURE_UPLOAD_STEPS[nextIndex]);
  }

  function goBack() {
    const current = snapshotRef.current;
    if (busy) return;
    const previousIndex = Math.max(0, ARCHITECTURE_UPLOAD_STEPS.indexOf(current.step) - 1);
    changeStep(ARCHITECTURE_UPLOAD_STEPS[previousIndex]);
  }

  async function completeScope() {
    if (busy || readOnly || snapshotRef.current.completed) return;
    const approved = Object.values(snapshotRef.current.decisions).filter(
      (decision) => decision === "approved",
    ).length;
    if (approved === 0) {
      setLocalError("Approve at least one finding before adding records to scope.");
      return;
    }

    setLocalError(null);
    setPendingAction("complete");
    try {
      await onComplete?.(snapshotRef.current);
      commit({ ...snapshotRef.current, completed: true });
    } catch (reason) {
      setLocalError(toErrorMessage(reason, "The approved records could not be added."));
    } finally {
      setPendingAction(null);
    }
  }

  const canContinue =
    snapshot.step === "environments"
      ? snapshot.environmentIds.length > 0
      : snapshot.step === "documents"
        ? Boolean(snapshot.file)
        : true;

  return (
    <section
      className={[styles.wizard, className].filter(Boolean).join(" ")}
      aria-label="Architecture evidence upload"
      aria-busy={busy}
      data-read-only={readOnly || undefined}
    >
      <aside className={styles.rail} aria-label="Architecture upload progress">
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">C</span>
          <span>
            <strong>{copy.title}</strong>
            <small>{copy.subtitle}</small>
          </span>
        </div>

        <ol className={styles.stepList}>
          {ARCHITECTURE_UPLOAD_STEPS.map((step) => {
            const number = STEP_NUMBER[step];
            const isCurrent = snapshot.step === step;
            const isComplete = currentStepNumber > number;
            return (
              <li key={step} className={isComplete ? styles.completedStep : undefined}>
                <button
                  type="button"
                  className={isCurrent ? styles.activeStep : undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => changeStep(step)}
                  disabled={busy}
                >
                  <span className={styles.stepNumber} aria-hidden="true">
                    {isComplete ? "✓" : number}
                  </span>
                  <span>
                    <small>STEP {number}</small>
                    <strong>{copy.stepLabels[step]}</strong>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className={styles.runMeta}>
          <small>{copy.runLabel}</small>
          <strong>{copy.runId}</strong>
          <span>
            <StatusDot tone={currentStepNumber > 2 ? "success" : "warning"} />
            {currentStepNumber > 2 ? copy.processedStatus : copy.draftStatus}
          </span>
        </div>
      </aside>

      <div className={styles.content}>
        <div className={styles.mobileProgress} aria-live="polite">
          <span>Step {currentStepNumber} of {ARCHITECTURE_UPLOAD_STEPS.length}</span>
          <strong>{copy.stepLabels[snapshot.step]}</strong>
          <div aria-hidden="true">
            <i style={{ width: `${currentStepNumber * 25}%` }} />
          </div>
        </div>

        {headerAccessory ? <div className={styles.headerAccessory}>{headerAccessory}</div> : null}

        {readOnly ? (
          <div className={styles.infoBanner} role="status">
            <StatusDot tone="info" />
            Read-only view. You can inspect steps and findings, but cannot change this run.
          </div>
        ) : null}
        {busy ? (
          <div className={styles.infoBanner} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            {pendingAction === "complete"
              ? "Adding approved records…"
              : pendingAction === "file"
                ? "Saving evidence…"
                : "Loading architecture run…"}
          </div>
        ) : null}
        {visibleError ? (
          <div className={styles.errorBanner} role="alert">
            <StatusDot tone="danger" />
            <span>{visibleError}</span>
            {localError ? (
              <button type="button" onClick={() => setLocalError(null)} aria-label="Dismiss error">×</button>
            ) : null}
          </div>
        ) : null}

        {snapshot.step === "environments" ? (
          <div className={styles.stepPanel} aria-labelledby={`${instanceId}-environment-heading`}>
            <StepHeader
              id={`${instanceId}-environment-heading`}
              number={1}
              title={copy.environmentTitle}
              description={copy.environmentDescription}
              metric={<><strong>{snapshot.environmentIds.length}</strong><span>selected</span></>}
            />
            <fieldset className={styles.environmentGrid} disabled={busy || readOnly}>
              <legend className={styles.srOnly}>Target environments</legend>
              {environments.map((environment) => {
                const selected = snapshot.environmentIds.includes(environment.id);
                return (
                  <label className={selected ? styles.selectedEnvironment : undefined} key={environment.id}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleEnvironment(environment.id)}
                    />
                    <span className={styles.environmentIcon} aria-hidden="true">{environment.icon}</span>
                    <span>
                      <strong>{environment.label}</strong>
                      <small>{environment.detail}</small>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        ) : null}

        {snapshot.step === "documents" ? (
          <div className={styles.stepPanel} aria-labelledby={`${instanceId}-document-heading`}>
            <StepHeader
              id={`${instanceId}-document-heading`}
              number={2}
              title={copy.documentTitle}
              description={copy.documentDescription}
            />
            <label className={styles.documentType}>
              <span>{copy.documentTypeLabel}</span>
              <select
                value={snapshot.documentType}
                onChange={changeDocumentType}
                disabled={busy || readOnly}
              >
                {documentTypes.map((documentType) => (
                  <option value={documentType} key={documentType}>{documentType}</option>
                ))}
              </select>
            </label>
            <label className={styles.dropZone}>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={selectFile}
                disabled={busy || readOnly}
              />
              <span className={styles.uploadGlyph} aria-hidden="true">↑</span>
              <strong>{snapshot.file?.name ?? copy.uploadIdleLabel}</strong>
              <small>{copy.uploadHint}</small>
            </label>
            {snapshot.file ? (
              <FileSummary
                fileName={snapshot.file.name}
                detail={`${formatBytes(snapshot.file.size)} · ${copy.fileReadyLabel}`}
                action={
                  <button
                    type="button"
                    className={styles.quietButton}
                    onClick={removeFile}
                    disabled={busy || readOnly}
                  >
                    Remove
                  </button>
                }
              />
            ) : null}
          </div>
        ) : null}

        {snapshot.step === "review" ? (
          <div className={styles.stepPanel} aria-labelledby={`${instanceId}-review-heading`}>
            <StepHeader
              id={`${instanceId}-review-heading`}
              number={3}
              title={copy.reviewTitle}
              description={copy.reviewDescription}
              metric={<><strong>{reviewedCount}/{findings.length}</strong><span>reviewed</span></>}
            />
            {findings.length ? (
              <>
                <div className={styles.findingTabs} role="tablist" aria-label="Review findings">
                  {findings.map((finding, index) => {
                    const selected = finding.id === currentFinding?.id;
                    const decision = snapshot.decisions[finding.id] ?? "pending";
                    return (
                      <button
                        key={finding.id}
                        ref={(node) => { tabRefs.current[index] = node; }}
                        type="button"
                        role="tab"
                        id={`${instanceId}-finding-tab-${finding.id}`}
                        aria-controls={`${instanceId}-finding-panel-${finding.id}`}
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        className={selected ? styles.activeFindingTab : undefined}
                        onClick={() => selectFinding(finding.id)}
                        onKeyDown={(event) => handleTabKeyDown(event, index)}
                        disabled={busy}
                        aria-label={`Finding ${index + 1}: ${finding.title} · ${decision}`}
                      >
                        <StatusDot tone={decisionTone(decision)} />
                        <span>{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
                <FileSummary
                  fileName={snapshot.file?.name ?? "No evidence file attached"}
                  detail={copy.reviewFileMeta}
                  action={<span className={styles.confidence}>{copy.reviewSummary}</span>}
                />
                {currentFinding ? (
                  <article
                    className={`${styles.insightCard} ${styles[`decision-${snapshot.decisions[currentFinding.id] ?? "pending"}`]}`}
                    role="tabpanel"
                    id={`${instanceId}-finding-panel-${currentFinding.id}`}
                    aria-labelledby={`${instanceId}-finding-tab-${currentFinding.id}`}
                    tabIndex={0}
                  >
                    <div className={styles.insightTop}>
                      <span className={styles.techAvatar} aria-hidden="true">{currentFinding.initials}</span>
                      <span className={styles.findingIdentity}>
                        <small>{currentFinding.kind}</small>
                        <h3>{currentFinding.title}</h3>
                        <span>{currentFinding.subtitle}</span>
                      </span>
                      <span className={styles.confidenceScore}>
                        {Math.round(currentFinding.confidence * 100)}%
                        <span className={styles.srOnly}> confidence</span>
                      </span>
                    </div>
                    <blockquote>“{currentFinding.quote}”</blockquote>
                    <div className={styles.evidenceMeta}>
                      <span>{currentFinding.source}</span>
                      <span>{copy.evidenceSource}</span>
                    </div>
                    {(snapshot.decisions[currentFinding.id] ?? "pending") === "pending" ? (
                      <div className={styles.decisionRow}>
                        <button
                          type="button"
                          className={styles.approveButton}
                          onClick={() => setDecision(currentFinding, "approved")}
                          disabled={busy || readOnly}
                        >
                          ✓ Approve finding
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => setDecision(currentFinding, "declined")}
                          disabled={busy || readOnly}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className={styles.quietButton}
                          onClick={() => invokeFindingAction(currentFinding, onEditFinding)}
                          disabled={busy || readOnly || !onEditFinding}
                        >
                          Edit details
                        </button>
                        <button
                          type="button"
                          className={styles.quietButton}
                          onClick={() => invokeFindingAction(currentFinding, onRequestEvidence)}
                          disabled={busy || readOnly || !onRequestEvidence}
                        >
                          Request evidence
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`${styles.decisionResult} ${
                          snapshot.decisions[currentFinding.id] === "declined"
                            ? styles.declinedResult
                            : ""
                        }`}
                        role="status"
                      >
                        <strong>
                          {snapshot.decisions[currentFinding.id] === "approved"
                            ? "✓ Approved for scope"
                            : "× Finding declined and retained for audit"}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setDecision(currentFinding, "pending")}
                          disabled={busy || readOnly}
                        >
                          Undo
                        </button>
                      </div>
                    )}
                  </article>
                ) : null}
              </>
            ) : (
              <p className={styles.emptyState}>No findings were returned for this evidence.</p>
            )}
          </div>
        ) : null}

        {snapshot.step === "confirm" ? (
          <div className={styles.stepPanel} aria-labelledby={`${instanceId}-confirm-heading`}>
            <StepHeader
              id={`${instanceId}-confirm-heading`}
              number={4}
              title={copy.confirmTitle}
              description={copy.confirmDescription}
            />
            <div className={styles.scopeSummary}>
              <Summary label="Environments" value={environmentLabels(snapshot.environmentIds, environments)} />
              <Summary label="Evidence" value={snapshot.file?.name ?? "No file attached"} />
              <Summary label="Approved" value={`${approvedFindings.length} findings`} />
              <Summary label="Declined" value={`${declinedCount} findings`} />
            </div>
            <div className={styles.scopeList} aria-live="polite">
              {approvedFindings.map((finding) => (
                <div key={finding.id}>
                  <span className={styles.techAvatar} aria-hidden="true">{finding.initials}</span>
                  <span>
                    <strong>{finding.title}</strong>
                    <small>{finding.kind}</small>
                  </span>
                  <span className={styles.readyBadge}>{copy.readyLabel}</span>
                </div>
              ))}
              {!approvedFindings.length ? (
                <p>Approve at least one finding in step 3 to populate this preview.</p>
              ) : null}
            </div>
            {snapshot.completed ? (
              <div className={styles.successBanner} role="status">
                <StatusDot tone="success" />
                <span>
                  <strong>{copy.successTitle}</strong>
                  <small>
                    {approvedFindings.length} approved finding
                    {approvedFindings.length === 1 ? "" : "s"} added to this preview.
                  </small>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={snapshot.step === "environments" || busy}
            onClick={goBack}
          >
            ← Back
          </button>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Architecture upload progress"
            aria-valuemin={1}
            aria-valuemax={4}
            aria-valuenow={currentStepNumber}
          >
            <i style={{ width: `${currentStepNumber * 25}%` }} />
          </div>
          {snapshot.step !== "confirm" ? (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!canContinue || busy}
              onClick={continueForward}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryButton}
              disabled={
                approvedFindings.length === 0 || snapshot.completed || busy || readOnly
              }
              onClick={completeScope}
            >
              {snapshot.completed ? copy.completeDoneLabel : copy.completeIdleLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

interface StepHeaderProps {
  id: string;
  number: number;
  title: string;
  description: string;
  metric?: React.ReactNode;
}

function StepHeader({ id, number, title, description, metric }: StepHeaderProps) {
  return (
    <header className={styles.stepHeader}>
      <span>
        <small>STEP {number} OF {ARCHITECTURE_UPLOAD_STEPS.length}</small>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </span>
      {metric ? <span className={styles.metric}>{metric}</span> : null}
    </header>
  );
}

function FileSummary({
  fileName,
  detail,
  action,
}: {
  fileName: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.fileSummary}>
      <span className={styles.fileIcon} aria-hidden="true">FILE</span>
      <span>
        <strong>{fileName}</strong>
        <small>{detail}</small>
      </span>
      {action ? <span className={styles.fileAction}>{action}</span> : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function createInitialSnapshot(
  findings: ArchitectureFinding[],
  environments: ArchitectureUploadWizardProps["environments"],
  documentTypes: string[],
  initialState: ArchitectureUploadWizardProps["initialState"],
): ArchitectureUploadSnapshot {
  const decisions = Object.fromEntries(
    findings.map((finding) => [
      finding.id,
      initialState?.decisions?.[finding.id] ?? "pending",
    ]),
  ) as Record<string, FindingDecision>;

  return {
    step: initialState?.step ?? "environments",
    environmentIds:
      initialState?.environmentIds?.filter((id) =>
        environments.some((environment) => environment.id === id),
      ) ?? [],
    documentType: initialState?.documentType ?? documentTypes[0] ?? "",
    file: initialState?.file ?? null,
    decisions,
    activeFindingId:
      findings.find((finding) => finding.id === initialState?.activeFindingId)?.id ??
      findings[0]?.id ??
      "",
    completed: initialState?.completed ?? false,
  };
}

function environmentLabels(
  selectedIds: string[],
  environments: ArchitectureUploadWizardProps["environments"],
): string {
  const labels = selectedIds
    .map((id) => environments.find((environment) => environment.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  return labels.join(", ") || "None selected";
}

function decisionTone(decision: FindingDecision) {
  if (decision === "approved") return "success" as const;
  if (decision === "declined") return "danger" as const;
  return "warning" as const;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function isFileAccepted(file: File, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;

  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return fileName.endsWith(rule);
    if (rule.endsWith("/*")) return mimeType.startsWith(rule.slice(0, -1));
    return mimeType === rule;
  });
}

function toErrorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}

export default ArchitectureUploadWizard;
